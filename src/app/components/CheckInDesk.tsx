import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Ticket,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  queueNumber?: number;
  isWalkIn: boolean;
  reason?: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  doctorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export default function CheckInDesk() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'checked-in'>('pending');

  useEffect(() => {
    fetchAppointments();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/today');
      if (response.data.success) {
        setAppointments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/checkin`);
      if (response.data.success) {
        const queueNumber = response.data.data.queueNumber;
        toast.success(`Patient checked in! Queue number: ${queueNumber}`);
        fetchAppointments();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to check in patient';
      toast.error(errorMsg);
    }
  };

  const handleMarkNoShow = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to mark this appointment as no-show?')) {
      return;
    }

    try {
      const response = await api.post(`/appointments/${appointmentId}/noshow`);
      if (response.data.success) {
        toast.success('Appointment marked as no-show');
        fetchAppointments();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to mark no-show';
      toast.error(errorMsg);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      apt.patientId.firstName.toLowerCase().includes(searchLower) ||
      apt.patientId.lastName.toLowerCase().includes(searchLower) ||
      apt.patientId.email.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Status filter
    if (filterStatus === 'pending') {
      return apt.status === 'scheduled' || apt.status === 'confirmed';
    } else if (filterStatus === 'checked-in') {
      return apt.status === 'in-queue' || apt.status === 'in-progress';
    }

    return true; // 'all'
  });

  const pendingCount = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
  const checkedInCount = appointments.filter(a => a.status === 'in-queue' || a.status === 'in-progress').length;

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
              <h1 className="text-3xl font-bold text-gray-900">Check-In Desk</h1>
              <p className="text-gray-600 mt-1">Manage patient arrivals and queue</p>
            </div>
          </div>

          <button
            onClick={fetchAppointments}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Today</p>
                <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Waiting Check-in</p>
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <UserCheck className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Queue</p>
                <p className="text-3xl font-bold text-green-600">{checkedInCount}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Ticket className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('checked-in')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'checked-in'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Checked In ({checkedInCount})
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading appointments...</span>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-3">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {apt.patientId.firstName} {apt.patientId.lastName}
                          </h3>
                          {apt.queueNumber && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                              #{apt.queueNumber}
                            </span>
                          )}
                          {apt.isWalkIn && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              Walk-in
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {apt.startTime}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{apt.type}</span>
                          <span>•</span>
                          <span>Dr. {apt.doctorId.firstName} {apt.doctorId.lastName}</span>
                        </div>

                        {apt.reason && (
                          <p className="text-sm text-gray-600 mt-1">Reason: {apt.reason}</p>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <span>{apt.patientId.email}</span>
                          {apt.patientId.phone && (
                            <>
                              <span>•</span>
                              <span>{apt.patientId.phone}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                          <>
                            <button
                              onClick={() => handleCheckIn(apt._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Check In
                            </button>
                            <button
                              onClick={() => handleMarkNoShow(apt._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              No Show
                            </button>
                          </>
                        )}

                        {(apt.status === 'in-queue' || apt.status === 'in-progress') && (
                          <span className={`px-4 py-2 rounded-lg font-medium ${
                            apt.status === 'in-queue'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {apt.status === 'in-queue' ? 'In Queue' : 'With Doctor'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <UserX className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No appointments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
