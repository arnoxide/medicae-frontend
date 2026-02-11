import React from 'react';
import { ArrowLeft, AlertTriangle, Droplet, Pill, Heart, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmergencyProfile() {
  return (
    <div className="min-h-screen bg-red-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-red-600 px-6 pt-12 pb-6">
          <Link to="/mobile" className="flex items-center gap-2 text-white mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-white" />
            <h1 className="text-2xl text-white">Emergency Profile</h1>
          </div>
          <p className="text-red-100">Critical medical information</p>
        </div>

        {/* Emergency Info */}
        <div className="px-6 py-6 space-y-4">
          {/* Blood Type */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200">
            <div className="flex items-center gap-4 mb-4">
              <Droplet className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-sm text-gray-600">Blood Type</div>
                <div className="text-3xl text-gray-900">A+</div>
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div className="text-lg text-gray-900">Allergies</div>
            </div>
            <div className="space-y-2">
              <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-red-900">Penicillin</span>
              </div>
              <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-red-900">Latex</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-amber-600" />
              <div className="text-lg text-gray-900">Medical Conditions</div>
            </div>
            <div className="space-y-2">
              <div className="px-4 py-3 bg-amber-50 rounded-xl">
                <span className="text-amber-900">Type 2 Diabetes</span>
              </div>
              <div className="px-4 py-3 bg-amber-50 rounded-xl">
                <span className="text-amber-900">Hypertension</span>
              </div>
            </div>
          </div>

          {/* Current Medications */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Pill className="w-6 h-6 text-blue-600" />
              <div className="text-lg text-gray-900">Current Medications</div>
            </div>
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-100">
                <div className="text-gray-900">Metformin 500mg</div>
                <div className="text-sm text-gray-600">Twice daily</div>
              </div>
              <div className="pb-3 border-b border-gray-100">
                <div className="text-gray-900">Lisinopril 10mg</div>
                <div className="text-sm text-gray-600">Once daily</div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-green-600" />
              <div className="text-lg text-gray-900">Emergency Contact</div>
            </div>
            <div>
              <div className="text-gray-900">John Johnson</div>
              <div className="text-sm text-gray-600">Spouse</div>
              <a href="tel:+15550123" className="text-blue-600 text-lg mt-2 block">
                +1 555-0123
              </a>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              This profile is accessible offline and can be shown to emergency responders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
