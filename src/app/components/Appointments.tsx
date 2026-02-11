import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, Plus, X, Check, Filter } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

type ViewMode = 'day' | 'week' | 'month';
type AppointmentStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

interface Appointment {
  _id: string;
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
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export default function Appointments() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  useEffect(() => {
    fetchTodaysAppointments();
    fetchAppointmentStats();
  }, []);

  const fetchTodaysAppointments = async () => {
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

  const fetchAppointmentStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await api.get('/appointments/stats', {
        params: {
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
        },
      });
      if (response.data.success) {
        setAppointmentStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleStartVisit = async (appointment: Appointment) => {
    try {
      const response = await api.put(`/appointments/${appointment._id}`, {
        status: 'in-progress',
      });
      if (response.data.success) {
        toast.success('Visit started successfully');
        fetchTodaysAppointments();
        fetchAppointmentStats();
        // Navigate to visit page for the patient
        navigate(`/visit/${appointment.patientId._id}`);
      }
    } catch (error) {
      console.error('Error starting visit:', error);
      toast.error('Failed to start visit');
    }
  };

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filterStatus);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'confirmed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'scheduled': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'no-show': return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed': return <Check className="w-3 h-3" />;
      case 'in-progress': return <Clock className="w-3 h-3 animate-pulse" />;
      case 'confirmed': return <Check className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      case 'cancelled': return <X className="w-3 h-3" />;
      case 'no-show': return <X className="w-3 h-3" />;
    }
  };

  const stats = {
    total: appointmentStats.total,
    completed: appointmentStats.completed,
    inProgress: appointments.filter(a => a.status === 'in-progress').length,
    upcoming: appointmentStats.scheduled + appointmentStats.confirmed,
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600 mt-1">Manage clinic scheduling and bookings</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewAppointment(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            <span>New Appointment</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Today</span>
              <CalendarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completed</span>
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">In Progress</span>
              <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Upcoming</span>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.upcoming}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* View Mode Selector */}
          <div className="flex gap-2 bg-white p-2 rounded-xl shadow-md border border-gray-100">
            <button
              onClick={() => setViewMode('day')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'day'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'month'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AppointmentStatus | 'all')}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium focus:outline-none focus:border-blue-600 bg-white shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Today's Schedule - {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Loading appointments...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No appointments found</p>
                <p className="text-sm mt-2">There are no appointments scheduled for today.</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    {/* Time */}
                    <div className="flex-shrink-0 w-24">
                      <div className="text-2xl font-bold text-gray-900">{appointment.startTime}</div>
                      <div className="text-sm text-gray-500">{appointment.duration} min</div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientId.firstName} {appointment.patientId.lastName}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(appointment.status)} flex items-center gap-1`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {appointment.patientId.email}
                        </span>
                        <span>•</span>
                        <span>{appointment.type}</span>
                        <span>•</span>
                        <span>Dr. {appointment.doctorId.firstName} {appointment.doctorId.lastName}</span>
                        {appointment.reason && (
                          <>
                            <span>•</span>
                            <span>{appointment.reason}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        View Details
                      </button>
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <button
                          onClick={() => handleStartVisit(appointment)}
                          className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                        >
                          Start Visit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Appointment Modal */}
        {showNewAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">New Appointment</h2>
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                  <input
                    type="text"
                    placeholder="Search patient by name or ID"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm">
                      <option>Check-up</option>
                      <option>Follow-up</option>
                      <option>Consultation</option>
                      <option>New Patient</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm">
                    <option>Dr. Smith</option>
                    <option>Dr. Jones</option>
                    <option>Dr. Williams</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add any special notes or requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30">
                  Create Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details Modal */}
        {showAppointmentDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => setShowAppointmentDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(selectedAppointment.status)} flex items-center gap-2`}>
                    {getStatusIcon(selectedAppointment.status)}
                    {selectedAppointment.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Patient Information */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedAppointment.patientId.firstName} {selectedAppointment.patientId.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-base text-gray-900">{selectedAppointment.patientId.email}</p>
                    </div>
                    {selectedAppointment.patientId.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-base text-gray-900">{selectedAppointment.patientId.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-600" />
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Time</label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedAppointment.startTime} - {selectedAppointment.endTime}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Duration</label>
                      <p className="text-base text-gray-900">{selectedAppointment.duration} minutes</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <p className="text-base text-gray-900 capitalize">{selectedAppointment.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Doctor</label>
                      <p className="text-base text-gray-900">
                        Dr. {selectedAppointment.doctorId.firstName} {selectedAppointment.doctorId.lastName}
                      </p>
                    </div>
                  </div>
                  {selectedAppointment.reason && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">Reason for Visit</label>
                      <p className="text-base text-gray-900 mt-1">{selectedAppointment.reason}</p>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-base text-gray-900 mt-1">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowAppointmentDetails(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {(selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') && (
                  <button
                    onClick={() => {
                      setShowAppointmentDetails(false);
                      handleStartVisit(selectedAppointment);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30"
                  >
                    Start Visit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
