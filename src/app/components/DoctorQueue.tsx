import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Clock,
  RefreshCw,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface QueuedPatient {
  _id: string;
  queueNumber: number;
  status: string;
  startTime: string;
  type: string;
  reason?: string;
  isWalkIn: boolean;
  checkedInAt: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth: string;
    gender: string;
  };
  checkedInBy?: {
    firstName: string;
    lastName: string;
  };
}

export default function DoctorQueue() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueuedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [callingPatient, setCallingPatient] = useState(false);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await api.get('/appointments/queue');
      if (response.data.success) {
        setQueue(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    try {
      setCallingPatient(true);
      const response = await api.post('/appointments/queue/next');

      if (response.data.success && response.data.data) {
        const patient = response.data.data;
        toast.success(`Calling: ${patient.patientId.firstName} ${patient.patientId.lastName} - Ticket #${patient.queueNumber}`);
        fetchQueue();

        // Show patient for 3 seconds then navigate to visit screen
        setTimeout(() => {
          navigate(`/visit/${patient.patientId._id}`, {
            state: { appointmentId: patient._id }
          });
        }, 2000);
      } else {
        toast.info('No patients in queue');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to call next patient';
      toast.error(errorMsg);
    } finally {
      setCallingPatient(false);
    }
  };

  const handleStartVisit = async (appointment: QueuedPatient) => {
    try {
      const response = await api.post(`/appointments/${appointment._id}/start`);
      if (response.data.success) {
        toast.success('Visit started');
        navigate(`/visit/${appointment.patientId._id}`, {
          state: { appointmentId: appointment._id }
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to start visit';
      toast.error(errorMsg);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const waitingPatients = queue.filter(p => p.status === 'in-queue');
  const currentPatient = queue.find(p => p.status === 'in-progress');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/clinic')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Queue</h1>
              <p className="text-gray-600 mt-1">Manage your waiting patients</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchQueue}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleCallNext}
              disabled={waitingPatients.length === 0 || callingPatient}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <UserCheck className="w-5 h-5" />
              {callingPatient ? 'Calling...' : 'Call Next Patient'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Patients Waiting</p>
                <p className="text-4xl font-bold">{waitingPatients.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 mb-1">Current Patient</p>
                <p className="text-4xl font-bold">{currentPatient ? `#${currentPatient.queueNumber}` : '—'}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <UserCheck className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Patient */}
        {currentPatient && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 mb-6 shadow-xl border-2 border-purple-300">
            <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Currently Seeing
            </h2>
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xl font-bold">
                      #{currentPatient.queueNumber}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {currentPatient.patientId.firstName} {currentPatient.patientId.lastName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{calculateAge(currentPatient.patientId.dateOfBirth)} years, {currentPatient.patientId.gender}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{currentPatient.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{currentPatient.patientId.email}</span>
                    </div>
                    {currentPatient.patientId.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{currentPatient.patientId.phone}</span>
                      </div>
                    )}
                  </div>

                  {currentPatient.reason && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Reason for visit:</p>
                      <p className="text-gray-900">{currentPatient.reason}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/visit/${currentPatient.patientId._id}`, {
                    state: { appointmentId: currentPatient._id }
                  })}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  Continue Visit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Waiting Queue */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Waiting Queue</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading queue...</span>
            </div>
          ) : waitingPatients.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {waitingPatients.map((patient, index) => (
                <div key={patient._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`px-4 py-2 rounded-lg text-lg font-bold ${
                        index === 0
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        #{patient.queueNumber}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {patient.patientId.firstName} {patient.patientId.lastName}
                          </h3>
                          {patient.isWalkIn && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              Walk-in
                            </span>
                          )}
                          {index === 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Next
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{calculateAge(patient.patientId.dateOfBirth)} years, {patient.patientId.gender}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{patient.startTime} • {patient.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{patient.patientId.email}</span>
                          </div>
                          {patient.patientId.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{patient.patientId.phone}</span>
                            </div>
                          )}
                        </div>

                        {patient.reason && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Reason:</p>
                            <p className="text-sm text-gray-900">{patient.reason}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>Checked in: {new Date(patient.checkedInAt).toLocaleTimeString()}</span>
                          {patient.checkedInBy && (
                            <>
                              <span>•</span>
                              <span>by {patient.checkedInBy.firstName} {patient.checkedInBy.lastName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartVisit(patient)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Start Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">No patients in queue</p>
              <p className="text-sm mt-1">Patients will appear here after check-in</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
