import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-white">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-600/30 mb-6">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Healthcare that moves<br />with the patient.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            Identity-first healthcare platform enabling emergency access,
            continuity of care, and seamless patient context mobility.
          </p>
          <div className="flex flex-col gap-6 items-center">
            <div className="flex gap-4 justify-center">
              {/* <Link
                to="/onboarding"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-105"
              >
                Create Clinic
              </Link> */}
              <Link
                to="/mobile"
                className="px-8 py-4 bg-white text-gray-700 font-semibold border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
              >
                Patient App
              </Link>
            </div>

            <div className="flex gap-3 text-sm">
              <Link
                to="/login"
                className="px-5 py-2.5 text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-all"
              >
                Login
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/setup"
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all"
              >
                Complete Setup
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/join"
                className="px-5 py-2.5 text-green-700 font-medium hover:bg-green-50 rounded-lg transition-all"
              >
                Join Clinic
              </Link>
            </div>
          </div>
        </div>

        {/* Visual Network */}
        {/* <div className="relative h-64 mb-16 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <div className="grid grid-cols-3 gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-gray-100/50">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 inline-block mb-4">
              <Users className="w-16 h-16 text-blue-600 mx-auto" />
            </div>
            <p className="mt-4 text-gray-700 font-semibold">Patient Context Network</p>
          </div>
        </div> */}

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-900/5 border border-gray-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 inline-block mb-4">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Emergency Access</h3>
            <p className="text-gray-600 leading-relaxed">
              Critical patient information available when it matters most, with full audit trails.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-900/5 border border-gray-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 inline-block mb-4">
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Continuity of Care</h3>
            <p className="text-gray-600 leading-relaxed">
              Complete medical history follows the patient across all healthcare touchpoints.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-900/5 border border-gray-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 inline-block mb-4">
              <Zap className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Built for Speed</h3>
            <p className="text-gray-600 leading-relaxed">
              Designed for real-world clinical workflows. Fast, focused, pressure-tested.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
