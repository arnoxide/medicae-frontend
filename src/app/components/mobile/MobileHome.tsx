import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Pill, User } from 'lucide-react';

export default function MobileHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-12 pb-8">
          <h1 className="text-2xl text-white mb-2">Good morning,</h1>
          <p className="text-blue-100">Sarah Johnson</p>
        </div>

        {/* Emergency Shortcut */}
        <div className="px-6 -mt-6 mb-6">
          <Link 
            to="/mobile/emergency"
            className="block bg-red-600 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white mb-1">Emergency Profile</div>
                <div className="text-red-100 text-sm">Quick access for emergencies</div>
              </div>
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </Link>
        </div>

        {/* Main Actions */}
        <div className="px-6 space-y-4">
          <Link 
            to="/mobile/clinics"
            className="block bg-white rounded-2xl p-6 border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-900 mb-1">Find Clinics</div>
                <div className="text-sm text-gray-600">Search nearby healthcare</div>
              </div>
            </div>
          </Link>

          <Link 
            to="/mobile/prescriptions"
            className="block bg-white rounded-2xl p-6 border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-900 mb-1">Prescriptions</div>
                <div className="text-sm text-gray-600">2 active medications</div>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-900 mb-1">Health Profile</div>
                <div className="text-sm text-gray-600">Manage your information</div>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Status */}
        <div className="px-6 mt-6">
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="text-blue-900 mb-2">No active appointments</div>
            <div className="text-sm text-blue-700">You're all set for today</div>
          </div>
        </div>
      </div>
    </div>
  );
}
