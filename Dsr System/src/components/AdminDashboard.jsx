import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import api from '../services/api.js';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

// Mock Database for fallback (when backend is not available)
const DB = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
    { id: 2, username: 'rep1', password: 'rep123', role: 'marketing_rep', name: 'Marketing Rep 1' },
    { id: 3, username: 'rep2', password: 'rep456', role: 'marketing_rep', name: 'Marketing Rep 2' }
  ],
  visits: JSON.parse(localStorage.getItem('dsr_visits') || '[]'),
  locations: [
    'Civil Lines', 'Mall Road', 'Birhana Road', 'Latouche Road', 'Meston Road', 
    'Shiwala', 'Chamanganj', 'Cooperganj', 'Parade', 'Generalganj', 
    'Nayaganj', 'Collectorganj', 'Other'
  ],
  newLocations: JSON.parse(localStorage.getItem('dsr_new_locations') || '[]')
};

const saveToStorage = () => {
  localStorage.setItem('dsr_visits', JSON.stringify(DB.visits));
  localStorage.setItem('dsr_new_locations', JSON.stringify(DB.newLocations));
};

const AdminDashboard = ({ user, isOnline }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    rep: '',
    location: '',
    specialty: '',
    visitType: '',
    repeatVisit: ''
  });
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState(DB.visits);

  // Load visits data on component mount
  useEffect(() => {
    loadVisitsData();
  }, [dateFilter, filters]);

  const loadVisitsData = async () => {
    if (!isOnline) {
      // Use localStorage data when offline
      setVisits(DB.visits);
      return;
    }

    setLoading(true);
    try {
      const filterParams = {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        ...filters
      };
      
      const response = await api.getVisits(filterParams);
      setVisits(response || DB.visits);
    } catch (error) {
      console.warn('Failed to load visits from backend, using local data:', error);
      setVisits(DB.visits);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisits = visits.filter(visit => {
    const visitDate = new Date(visit.visitDate);
    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    
    if (visitDate < startDate || visitDate > endDate) return false;
    if (filters.rep && visit.userId !== parseInt(filters.rep)) return false;
    if (filters.location && visit.locationArea !== filters.location) return false;
    if (filters.specialty && visit.specialty !== filters.specialty) return false;
    if (filters.visitType && visit.visitType !== filters.visitType) return false;
    if (filters.repeatVisit && visit.repeatVisit !== filters.repeatVisit) return false;
    
    return true;
  });

  // Analytics calculations
  const analytics = {
    totalVisits: filteredVisits.length,
    todayVisits: filteredVisits.filter(v => v.visitDate === new Date().toISOString().split('T')[0]).length,
    weeklyVisits: filteredVisits.filter(v => {
      const visitDate = new Date(v.visitDate);
      const weekAgo = new Date(Date.now() - 7*24*60*60*1000);
      return visitDate >= weekAgo;
    }).length,
    monthlyVisits: filteredVisits.filter(v => {
      const visitDate = new Date(v.visitDate);
      const monthAgo = new Date(Date.now() - 30*24*60*60*1000);
      return visitDate >= monthAgo;
    }).length
  };

  // Chart data preparation
  const dailyVisitsData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i*24*60*60*1000);
    const dateStr = date.toISOString().split('T')[0];
    const count = filteredVisits.filter(v => v.visitDate === dateStr).length;
    dailyVisitsData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visits: count
    });
  }

  const locationData = DB.locations.slice(0, -1).map(location => ({
    location,
    count: filteredVisits.filter(v => v.locationArea === location).length
  })).filter(item => item.count > 0);

  const visitTypeData = [
    { name: 'Medical', value: filteredVisits.filter(v => v.visitType === 'Medical').length },
    { name: 'Non-Medical', value: filteredVisits.filter(v => v.visitType === 'Non-Medical').length }
  ].filter(item => item.value > 0);

  const repPerformanceData = DB.users.filter(u => u.role === 'marketing_rep').map(rep => ({
    name: rep.name,
    visits: filteredVisits.filter(v => v.userId === rep.id).length,
    followUps: filteredVisits.filter(v => v.userId === rep.id && v.nextAction === 'Follow-Up Visit').length
  }));

  const exportData = async () => {
    try {
      if (isOnline) {
        // Try to export from backend
        const response = await api.exportVisits(filters, 'csv');
        // Handle file download
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DSR_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Export from local data
        const csvContent = [
          ['Visit ID', 'Date', 'Time', 'Rep Name', 'Contact Name', 'Clinic Name', 'Location', 'Visit Type', 'Specialty', 'Mobile', 'Outcome', 'Next Action'].join(','),
          ...filteredVisits.map(visit => [
            visit.id,
            visit.visitDate,
            visit.visitTime,
            visit.userName,
            visit.contactName,
            visit.clinicName,
            visit.locationArea,
            visit.visitType,
            visit.specialty || visit.nonMedicalType || '',
            visit.mobileNumber,
            visit.visitOutcome,
            visit.nextAction
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DSR_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const approveLocation = async (locationName) => {
    try {
      if (isOnline) {
        await api.approveLocation(locationName);
      }
      
      // Update local data
      if (!DB.locations.includes(locationName)) {
        DB.locations.splice(-1, 0, locationName); // Insert before "Other"
        DB.newLocations = DB.newLocations.filter(loc => loc !== locationName);
        saveToStorage();
      }
    } catch (error) {
      console.error('Failed to approve location:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-lg card-shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Hospital Marketing DSR System Analytics</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs text-white ${isOnline ? 'online-badge' : 'offline-badge'}`}>
            {isOnline ? '● Online' : '● Offline'}
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'visits', label: 'Visit Records' },
            { key: 'locations', label: 'Location Management' },
            { key: 'analytics', label: 'Analytics' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.key 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg card-shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({...prev, startDate: e.target.value}))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({...prev, endDate: e.target.value}))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Rep</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={filters.rep}
              onChange={(e) => setFilters(prev => ({...prev, rep: e.target.value}))}
            >
              <option value="">All Reps</option>
              {DB.users.filter(u => u.role === 'marketing_rep').map(rep => (
                <option key={rep.id} value={rep.id}>{rep.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
            >
              <option value="">All Locations</option>
              {DB.locations.filter(loc => loc !== 'Other').map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={filters.visitType}
              onChange={(e) => setFilters(prev => ({...prev, visitType: e.target.value}))}
            >
              <option value="">All Types</option>
              <option value="Medical">Medical</option>
              <option value="Non-Medical">Non-Medical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Visit</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={filters.repeatVisit}
              onChange={(e) => setFilters(prev => ({...prev, repeatVisit: e.target.value}))}
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Maybe">Maybe</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={exportData}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && !loading && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg card-shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Visits</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalVisits}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg card-shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Today's Visits</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.todayVisits}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">📅</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg card-shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.weeklyVisits}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">📈</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg card-shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.monthlyVisits}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">📊</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Visits Trend */}
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Visits (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyVisitsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Visit Type Distribution */}
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Visit Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={visitTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {visitTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Location-wise Visits */}
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Location-wise Visits</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rep Performance */}
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Rep Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#8884d8" name="Total Visits" />
                  <Bar dataKey="followUps" fill="#82ca9d" name="Follow-ups" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Visit Records Tab */}
      {activeTab === 'visits' && !loading && (
        <div className="bg-white rounded-lg card-shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Visit Records ({filteredVisits.length} visits)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rep</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVisits.slice(0, 50).map(visit => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{visit.visitDate}</div>
                      <div className="text-gray-500">{visit.visitTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{visit.contactName}</div>
                      <div className="text-gray-500">{visit.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.clinicName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.locationArea}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        visit.visitType === 'Medical' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {visit.visitType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.nextAction || 'None'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {visit.gpsLatitude && visit.gpsLongitude ? (
                        <a
                          href={`https://maps.google.com/?q=${visit.gpsLatitude},${visit.gpsLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          📍 View
                        </a>
                      ) : (
                        <span className="text-gray-400">No GPS</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVisits.length > 50 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing first 50 of {filteredVisits.length} visits. Use filters to narrow results.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Management Tab */}
      {activeTab === 'locations' && !loading && (
        <div className="space-y-6">
          {/* Pending New Locations */}
          {DB.newLocations.length > 0 && (
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-800">Pending New Locations ({DB.newLocations.length})</h3>
              <div className="space-y-3">
                {DB.newLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <span className="font-medium">{location}</span>
                      <div className="text-sm text-gray-600">
                        Visits: {DB.visits.filter(v => v.newLocationName === location).length}
                      </div>
                    </div>
                    <button
                      onClick={() => approveLocation(location)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Locations */}
          <div className="bg-white rounded-lg card-shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Master Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DB.locations.filter(loc => loc !== 'Other').map(location => (
                <div key={location} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium">{location}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Visits: {DB.visits.filter(v => v.locationArea === location).length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Analytics */}
          <div className="bg-white rounded-lg card-shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Location Analytics</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && !loading && (
        <div className="space-y-6">
          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Rates */}
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Follow-up Conversion Rates</h3>
              <div className="space-y-4">
                {repPerformanceData.map(rep => (
                  <div key={rep.name} className="flex items-center justify-between">
                    <span className="font-medium">{rep.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{rep.visits} visits</span>
                      <span className="text-sm text-gray-600">{rep.followUps} follow-ups</span>
                      <span className="font-bold text-indigo-600">
                        {rep.visits > 0 ? Math.round((rep.followUps / rep.visits) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visit Outcomes */}
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Next Actions Required</h3>
              <div className="space-y-3">
                {['Follow-Up Visit', 'Send Brochure', 'Call Back', 'No Action', 'Other'].map(action => {
                  const count = filteredVisits.filter(v => v.nextAction === action).length;
                  const percentage = filteredVisits.length > 0 ? (count / filteredVisits.length) * 100 : 0;
                  return (
                    <div key={action} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{action}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{width: `${percentage}%`}}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Repeat Visit Analysis */}
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Repeat Visit Analysis</h3>
              <div className="space-y-4">
                {['Yes', 'No', 'Maybe'].map(status => {
                  const count = filteredVisits.filter(v => v.repeatVisit === status).length;
                  const percentage = filteredVisits.length > 0 ? (count / filteredVisits.length) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="font-medium">{status}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status === 'Yes' ? 'bg-green-500' : 
                              status === 'Maybe' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{width: `${percentage}%`}}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Medical Specialties */}
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Medical Specialties Coverage</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {['Cardiologist', 'Orthopedic Surgeon', 'Neurologist', 'General Surgeon', 
                  'Urologist', 'ENT Specialist', 'General Physician', 'Gynecologist', 
                  'Pediatrician', 'Dentist', 'Psychiatrist', 'Physiotherapist', 'Dietitian/Nutritionist'].map(specialty => {
                  const count = filteredVisits.filter(v => v.specialty === specialty).length;
                  return (
                    <div key={specialty} className="flex items-center justify-between py-1">
                      <span className="text-sm">{specialty}</span>
                      <span className="text-sm font-medium text-indigo-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* GPS Coverage Map */}
          <div className="bg-white rounded-lg card-shadow p-6">
            <h3 className="text-lg font-semibold mb-4">GPS Coverage Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {filteredVisits.filter(v => v.gpsLatitude && v.gpsLongitude).length}
                </div>
                <div className="text-sm text-gray-600">Visits with GPS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {filteredVisits.filter(v => !v.gpsLatitude || !v.gpsLongitude).length}
                </div>
                <div className="text-sm text-gray-600">Visits without GPS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {filteredVisits.length > 0 ? 
                    Math.round((filteredVisits.filter(v => v.gpsLatitude && v.gpsLongitude).length / filteredVisits.length) * 100) 
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">GPS Coverage</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;