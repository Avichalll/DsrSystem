import { useEffect, useState } from 'react';
import apiService from '../services/api';

function MyVisits({ user }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyVisits = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyVisits(user.id);
        setVisits(response.data || []);
      } catch (error) {
        console.warn('API not available, using mock data');
        // Mock data fallback
        const mockVisits = JSON.parse(localStorage.getItem('dsr_visits') || '[]')
          .filter(v => v.userId === user.id);
        setVisits(mockVisits);
      } finally {
        setLoading(false);
      }
    };

    fetchMyVisits();
  }, [user.id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg card-shadow p-6">
          <div className="text-center">Loading visits...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg card-shadow p-6">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg card-shadow p-6">
        <h2 className="text-2xl font-bold mb-6">My Visit Records ({visits.length} visits)</h2>
        
        {visits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No visits recorded yet. Start by submitting your first DSR report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clinic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GPS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visits.slice(0, 20).map(visit => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{visit.visitDate}</div>
                      <div className="text-gray-500">{visit.visitTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{visit.contactName}</div>
                      <div className="text-gray-500">{visit.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visit.clinicName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visit.locationArea}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        visit.visitType === 'Medical' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {visit.visitType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visit.nextAction || 'None'}
                    </td>
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
            {visits.length > 20 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing first 20 of {visits.length} visits.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyVisits;
