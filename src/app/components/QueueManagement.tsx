import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Users,
  UserCheck,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  XCircle,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface QueueAppointment {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  doctorId?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  checkedInAt?: string;
  queueNumber?: number;
}

export default function QueueManagement() {
  const navigate = useNavigate();
  const practice = JSON.parse(localStorage.getItem('practice') || '{}');

  const [queue, setQueue] = useState<QueueAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/appointments/queue/practice');
      if (response.data.success) {
        setQueue(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCheckIn = async (appointmentId: string, patientName: string) => {
    try {
      await api.post(`/appointments/${appointmentId}/checkin`);
      toast.success(`${patientName} checked in successfully`);
      fetchQueue();
    } catch (error: any) {
      console.error('Error checking in patient:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to check in patient');
    }
  };

  const handleCallPatient = async (appointmentId: string, patientName: string) => {
    try {
      await api.post(`/appointments/${appointmentId}/start`);
      toast.success(`${patientName} called to examination room`);
      fetchQueue();
    } catch (error: any) {
      console.error('Error calling patient:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to call patient');
    }
  };

  const handleCompleteVisit = async (appointmentId: string, patientName: string) => {
    try {
      await api.post(`/appointments/${appointmentId}/complete`, {
        notes: 'Visit completed from queue management'
      });
      toast.success(`${patientName}'s visit completed`);
      fetchQueue();
    } catch (error: any) {
      console.error('Error completing visit:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to complete visit');
    }
  };

  const handleMarkNoShow = async (appointmentId: string, patientName: string) => {
    try {
      await api.post(`/appointments/${appointmentId}/noshow`);
      toast.success(`${patientName} marked as no-show`);
      fetchQueue();
    } catch (error: any) {
      console.error('Error marking no-show:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to mark no-show');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-progress':
        return 'bg-blue-50 border-blue-300';
      case 'confirmed':
      case 'in-queue':
        return 'bg-green-50 border-green-300';
      case 'scheduled':
        return 'bg-amber-50 border-amber-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-progress':
        return 'bg-blue-600 text-white';
      case 'confirmed':
      case 'in-queue':
        return 'bg-green-600 text-white';
      case 'scheduled':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const waitingPatients = queue.filter(apt =>
    apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'in-queue'
  );
  const inProgressPatients = queue.filter(apt => apt.status === 'in-progress');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/clinic" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Queue Management</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchQueue()}
                disabled={refreshing}
                className="px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold border border-amber-200">
                {queue.length} in queue
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Waiting Room Queue</h1>
          <p className="text-gray-600 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {practice.name && ` • ${practice.name}`}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total in Queue</p>
                <p className="text-3xl font-bold text-gray-900">{queue.length}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Waiting</p>
                <p className="text-3xl font-bold text-amber-600">{waitingPatients.length}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressPatients.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Checked In</p>
                <p className="text-3xl font-bold text-green-600">
                  {queue.filter(apt => apt.checkedInAt).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Current Queue</h2>
            {!loading && queue.length > 0 && (
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading queue...</span>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients in Queue</h3>
              <p className="text-gray-600">Patients will appear here when they check in for their appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((appointment, index) => (
                <div
                  key={appointment._id}
                  className={`p-5 rounded-xl border-2 transition-all ${getStatusColor(appointment.status)}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Queue Number */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      appointment.status === 'in-progress'
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {appointment.patientId.firstName} {appointment.patientId.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(appointment.status)}`}>
                          {appointment.status === 'in-progress' ? 'In Progress' :
                           appointment.status === 'confirmed' || appointment.status === 'in-queue' ? 'Checked In' :
                           'Scheduled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                        <span className="capitalize">{appointment.type}</span>
                        {appointment.doctorId && (
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            Dr. {appointment.doctorId.lastName}
                          </span>
                        )}
                        {appointment.checkedInAt && (
                          <span className="flex items-center gap-1.5 text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Checked in {new Date(appointment.checkedInAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleCheckIn(appointment._id, `${appointment.patientId.firstName} ${appointment.patientId.lastName}`)}
                            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
                          >
                            <UserCheck className="w-4 h-4" />
                            Check In
                          </button>
                          <button
                            onClick={() => handleMarkNoShow(appointment._id, `${appointment.patientId.firstName} ${appointment.patientId.lastName}`)}
                            className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            No Show
                          </button>
                        </>
                      )}
                      {(appointment.status === 'confirmed' || appointment.status === 'in-queue') && (
                        <button
                          onClick={() => handleCallPatient(appointment._id, `${appointment.patientId.firstName} ${appointment.patientId.lastName}`)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Call Patient
                        </button>
                      )}
                      {appointment.status === 'in-progress' && (
                        <button
                          onClick={() => handleCompleteVisit(appointment._id, `${appointment.patientId.firstName} ${appointment.patientId.lastName}`)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete Visit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help Section */}
          {queue.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-900 mb-2">Queue Management Guide</p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• <strong>Check In:</strong> When patient arrives at front desk</li>
                    <li>• <strong>Call Patient:</strong> When provider is ready to see patient</li>
                    <li>• <strong>Complete Visit:</strong> After consultation is finished</li>
                    <li>• <strong>No Show:</strong> If patient doesn't arrive for appointment</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
