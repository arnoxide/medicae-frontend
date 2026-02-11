import React from 'react';
import { ArrowLeft, MapPin, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClinicsNearby() {
  const clinics = [
    {
      id: 1,
      name: 'Central Medical Clinic',
      distance: '0.8 km',
      status: 'Open',
      queue: 3,
      specialty: 'General Practice'
    },
    {
      id: 2,
      name: 'Riverside Health Center',
      distance: '1.2 km',
      status: 'Open',
      queue: 7,
      specialty: 'Family Medicine'
    },
    {
      id: 3,
      name: 'Westside Medical',
      distance: '2.1 km',
      status: 'Closed',
      queue: 0,
      specialty: 'General Practice'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 pt-12 pb-6">
          <Link to="/mobile" className="flex items-center gap-2 text-gray-600 mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl text-gray-900 mb-2">Clinics Nearby</h1>
          <p className="text-gray-600">Healthcare providers in your area</p>
        </div>

        {/* Map Placeholder */}
        <div className="relative h-64 bg-gray-100 border-b border-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Map View</p>
            </div>
          </div>
          {/* Mock pins */}
          <div className="absolute top-20 left-1/3 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
          <div className="absolute top-32 right-1/3 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
          <div className="absolute bottom-20 left-1/2 w-3 h-3 bg-gray-400 rounded-full" />
        </div>

        {/* Clinic List */}
        <div className="px-6 py-6 space-y-4">
          {clinics.map(clinic => (
            <div key={clinic.id} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">{clinic.name}</h3>
                  <p className="text-sm text-gray-600">{clinic.specialty}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs ${
                  clinic.status === 'Open' 
                    ? 'bg-green-50 text-green-900' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {clinic.status}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{clinic.distance}</span>
                </div>
                {clinic.status === 'Open' && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{clinic.queue} in queue</span>
                  </div>
                )}
              </div>

              {clinic.status === 'Open' && (
                <button className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Check In
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
