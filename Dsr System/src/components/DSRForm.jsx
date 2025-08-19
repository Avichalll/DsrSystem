import { useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import apiService from '../services/api';

function DSRForm({ user, isOnline }) {
  const { getCurrentLocation } = useLocation();
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: new Date().toTimeString().slice(0,5),
    contactName: '',
    designation: '',
    mobileNumber: '',
    alternateContact: '',
    email: '',
    whatsappNumber: '',
    clinicName: '',
    locationArea: '',
    newLocationName: '',
    fullAddress: '',
    googleMapsLink: '',
    visitType: '',
    specialty: '',
    nonMedicalType: '',
    clinicTimings: '',
    visitOutcome: '',
    nextAction: '',
    repeatVisit: '',
    expectedRepeatDate: '',
    signboardPhoto: null,
    visitingCardPhoto: null,
    additionalFile: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [gpsData, setGpsData] = useState(null);

  // Mock data for dropdowns (these should come from API)
  const locations = [
    'Civil Lines', 'Mall Road', 'Birhana Road', 'Latouche Road', 'Meston Road', 
    'Shiwala', 'Chamanganj', 'Cooperganj', 'Parade', 'Generalganj', 
    'Nayaganj', 'Collectorganj', 'Other'
  ];

  const medicalSpecialties = [
    'Cardiologist', 'Orthopedic Surgeon', 'Neurologist', 'General Surgeon', 
    'Urologist', 'ENT Specialist', 'General Physician', 'Gynecologist', 
    'Pediatrician', 'Dentist', 'Psychiatrist', 'Physiotherapist', 'Dietitian/Nutritionist'
  ];

  const nonMedicalTypes = [
    'Medical Store/Pharmacy', 'Diagnostic Lab', 'Pathology Lab', 'RWA/Society Office',
    'School/Educational Institute', 'NGO/Social Group', 'Corporate Office', 
    'Religious Organization', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const captureGPS = async () => {
    try {
      const coords = await getCurrentLocation();
      setGpsData(coords);
      setSubmitMessage('GPS location captured successfully!');
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      setSubmitMessage('Could not capture GPS location: ' + error);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  const validateForm = () => {
    const required = ['visitDate', 'visitTime', 'contactName', 'designation', 'mobileNumber', 'clinicName', 'locationArea', 'fullAddress', 'visitType'];
    
    for (let field of required) {
      if (!formData[field]) {
        setSubmitMessage(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (formData.mobileNumber.length !== 10 || !/^\d{10}$/.test(formData.mobileNumber)) {
      setSubmitMessage('Mobile number must be 10 digits');
      return false;
    }

    if (formData.visitType === 'Medical' && !formData.specialty) {
      setSubmitMessage('Please select medical specialty');
      return false;
    }

    if (formData.visitType === 'Non-Medical' && !formData.nonMedicalType) {
      setSubmitMessage('Please select non-medical type');
      return false;
    }

    if (formData.locationArea === 'Other' && !formData.newLocationName) {
      setSubmitMessage('Please specify new location name');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Auto-capture GPS if not already captured
      let finalGpsData = gpsData;
      if (!finalGpsData) {
        try {
          finalGpsData = await getCurrentLocation();
        } catch (error) {
          console.warn('GPS capture failed:', error);
        }
      }

      // Prepare visit data
      const visitData = {
        ...formData,
        userId: user.id,
        userName: user.name,
        gpsLatitude: finalGpsData?.latitude || null,
        gpsLongitude: finalGpsData?.longitude || null,
      };

      // Submit to API
      await apiService.submitVisit(visitData);
      
      setSubmitMessage('Visit submitted successfully!');
      
      // Reset form
      setFormData({
        visitDate: new Date().toISOString().split('T')[0],
        visitTime: new Date().toTimeString().slice(0,5),
        contactName: '',
        designation: '',
        mobileNumber: '',
        alternateContact: '',
        email: '',
        whatsappNumber: '',
        clinicName: '',
        locationArea: '',
        newLocationName: '',
        fullAddress: '',
        googleMapsLink: '',
        visitType: '',
        specialty: '',
        nonMedicalType: '',
        clinicTimings: '',
        visitOutcome: '',
        nextAction: '',
        repeatVisit: '',
        expectedRepeatDate: '',
        signboardPhoto: null,
        visitingCardPhoto: null,
        additionalFile: null
      });
      setGpsData(null);

    } catch (error) {
      setSubmitMessage('Error submitting visit: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="bg-white rounded-lg card-shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">DSR Form - Field Visit Report</h2>
          <div className={`px-3 py-1 rounded-full text-xs text-white ${isOnline ? 'online-badge' : 'offline-badge'}`}>
            {isOnline ? '● Online' : '● Offline'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visit Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Visit Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Visit *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange('visitDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time of Visit *</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.visitTime}
                  onChange={(e) => handleInputChange('visitTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact / Person Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name of Contact *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation / Role *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                >
                  <option value="">Select designation</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Manager">Manager</option>
                  <option value="Owner">Owner</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number * (10 digits)</label>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.alternateContact}
                  onChange={(e) => handleInputChange('alternateContact', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Clinic Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Clinic / Organization Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic / Organization Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.clinicName}
                  onChange={(e) => handleInputChange('clinicName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Area *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.locationArea}
                  onChange={(e) => handleInputChange('locationArea', e.target.value)}
                >
                  <option value="">Select location</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              {formData.locationArea === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Location Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.newLocationName}
                    onChange={(e) => handleInputChange('newLocationName', e.target.value)}
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  value={formData.fullAddress}
                  onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.googleMapsLink}
                  onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPS Location</label>
                <button
                  type="button"
                  onClick={captureGPS}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {gpsData ? '✓ GPS Captured' : 'Capture GPS Location'}
                </button>
              </div>
            </div>
          </div>

          {/* Category & Specialty */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Category & Specialty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Visit Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visitType"
                      value="Medical"
                      checked={formData.visitType === 'Medical'}
                      onChange={(e) => handleInputChange('visitType', e.target.value)}
                      className="mr-2"
                    />
                    Medical
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visitType"
                      value="Non-Medical"
                      checked={formData.visitType === 'Non-Medical'}
                      onChange={(e) => handleInputChange('visitType', e.target.value)}
                      className="mr-2"
                    />
                    Non-Medical
                  </label>
                </div>
              </div>
              {formData.visitType === 'Medical' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Specialty *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                  >
                    <option value="">Select specialty</option>
                    {medicalSpecialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.visitType === 'Non-Medical' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Non-Medical Type *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.nonMedicalType}
                    onChange={(e) => handleInputChange('nonMedicalType', e.target.value)}
                  >
                    <option value="">Select type</option>
                    {nonMedicalTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Visit Notes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Visit Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Timings</label>
                <input
                  type="text"
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.clinicTimings}
                  onChange={(e) => handleInputChange('clinicTimings', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Action Required</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.nextAction}
                  onChange={(e) => handleInputChange('nextAction', e.target.value)}
                >
                  <option value="">Select action</option>
                  <option value="Follow-Up Visit">Follow-Up Visit</option>
                  <option value="Send Brochure">Send Brochure</option>
                  <option value="Call Back">Call Back</option>
                  <option value="No Action">No Action</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Outcome / Remarks</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                  placeholder="Describe the visit outcome, discussion points, and remarks"
                  value={formData.visitOutcome}
                  onChange={(e) => handleInputChange('visitOutcome', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Repeat Visit?</label>
                <div className="flex gap-4">
                  {['Yes', 'No', 'Maybe'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="repeatVisit"
                        value={option}
                        checked={formData.repeatVisit === option}
                        onChange={(e) => handleInputChange('repeatVisit', e.target.value)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              {(formData.repeatVisit === 'Yes' || formData.repeatVisit === 'Maybe') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Repeat Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.expectedRepeatDate}
                    onChange={(e) => handleInputChange('expectedRepeatDate', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Proof & Media */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Proof & Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo of Clinic Signboard</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => handleFileChange('signboardPhoto', e.target.files[0])}
                />
                {formData.signboardPhoto && (
                  <img src={formData.signboardPhoto} alt="Signboard" className="mt-2 h-20 w-full object-cover rounded" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo of Visiting Card / Brochure Given</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => handleFileChange('visitingCardPhoto', e.target.files[0])}
                />
                {formData.visitingCardPhoto && (
                  <img src={formData.visitingCardPhoto} alt="Visiting Card" className="mt-2 h-20 w-full object-cover rounded" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional File Upload</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => handleFileChange('additionalFile', e.target.files[0])}
                />
                {formData.additionalFile && (
                  <div className="mt-2 text-xs text-gray-600">File uploaded ✓</div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center space-y-4">
            {submitMessage && (
              <div className={`px-4 py-2 rounded-md text-sm ${
                submitMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {submitMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-8 py-3 rounded-md text-white font-medium ${
                isSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
            >
              {isSubmitting ? 'Submitting Visit...' : 'Submit DSR Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DSRForm;
