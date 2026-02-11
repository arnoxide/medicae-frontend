import React from 'react';
import { ArrowLeft, Pill, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Prescriptions() {
  const activePrescriptions = [
    {
      id: 1,
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      refills: 2,
      doctor: 'Dr. Smith',
      clinic: 'Central Medical Clinic'
    },
    {
      id: 2,
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      refills: 3,
      doctor: 'Dr. Smith',
      clinic: 'Central Medical Clinic'
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
          <h1 className="text-2xl text-gray-900 mb-2">Prescriptions</h1>
          <p className="text-gray-600">Your current medications</p>
        </div>

        {/* Active Medications */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <span className="text-lg text-gray-900">Active Medications</span>
          </div>

          {activePrescriptions.map(rx => (
            <div key={rx.id} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="mb-4">
                <h3 className="text-lg text-gray-900 mb-1">{rx.medication}</h3>
                <div className="text-gray-600">{rx.dosage} - {rx.frequency}</div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{rx.doctor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{rx.clinic}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{rx.refills} refills remaining</span>
                <button className="px-4 py-2 bg-blue-50 text-blue-900 rounded-lg hover:bg-blue-100 transition-colors">
                  Request Refill
                </button>
              </div>
            </div>
          ))}

          {/* Empty State / Past Prescriptions */}
          <div className="mt-8">
            <div className="text-sm text-gray-600 mb-3">Past Prescriptions</div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="text-center text-gray-500 py-4">
                No past prescriptions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
