import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  UserPlus,
  Users,
  Activity,
  Search,
  Bell,
  DollarSign,
  BarChart3,
  LogOut,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  ArrowRight,
  Timer,
  AlertCircle,
  X
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
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

interface QueuePatient {
  appointmentId: string;
  patientId: string;
  patientName: string;
  appointmentTime: string;
  appointmentType: string;
  status: 'waiting' | 'in-progress' | 'completed';
  checkInTime?: string;
  waitTime?: number;
}

export default function ReceptionistDashboard() {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const practice = JSON.parse(localStorage.getItem('practice') || '{}');

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Queue management state
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [showQueuePanel, setShowQueuePanel] = useState(true);

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInPatientSearch, setWalkInPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [walkInLoading, setWalkInLoading] = useState(false);

  useEffect(() => {
    fetchTodaysAppointments();
    fetchAppointmentStats();
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Build queue from today's appointments
    buildQueue();
  }, [todayAppointments]);

  const fetchTodaysAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/queue/practice');
      if (response.data.success) {
        setTodayAppointments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const buildQueue = () => {
    const queuePatients: QueuePatient[] = todayAppointments
      .filter(apt =>
        apt.status === 'confirmed' ||
        apt.status === 'in-progress' ||
        apt.status === 'scheduled' ||
        apt.status === 'in-queue'
      )
      .filter(apt => apt.patientId && apt.patientId.firstName) // Ensure patient data is populated
      .map(apt => ({
        appointmentId: apt._id,
        patientId: apt.patientId._id,
        patientName: `${apt.patientId.firstName} ${apt.patientId.lastName}`,
        appointmentTime: apt.startTime,
        appointmentType: apt.type,
        status: apt.status === 'in-progress' ? 'in-progress' : 'waiting',
        checkInTime: (apt.status === 'confirmed' || apt.status === 'in-queue') ? new Date().toISOString() : undefined,
      }))
      .sort((a, b) => {
        // Sort by status first (in-progress > waiting), then by appointment time
        if (a.status !== b.status) {
          return a.status === 'in-progress' ? -1 : 1;
        }
        return a.appointmentTime.localeCompare(b.appointmentTime);
      });

    setQueue(queuePatients);
  };

  const completedToday = todayAppointments.filter(apt => apt.status === 'completed');

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await api.post(`/appointments/${appointmentId}/checkin`);
      toast.success('Patient checked in successfully');
      fetchTodaysAppointments();
    } catch (error) {
      console.error('Error checking in patient:', error);
      toast.error('Failed to check in patient');
    }
  };

  const handleCallPatient = async (appointmentId: string, patientName: string) => {
    try {
      await api.post(`/appointments/${appointmentId}/start`);
      toast.success(`${patientName} called to examination room`);
      fetchTodaysAppointments();
    } catch (error) {
      console.error('Error calling patient:', error);
      toast.error('Failed to update patient status');
    }
  };

  const handleCompleteVisit = async (appointmentId: string) => {
    try {
      await api.post(`/appointments/${appointmentId}/complete`, {
        notes: 'Visit completed from receptionist dashboard'
      });
      toast.success('Visit completed');
      fetchTodaysAppointments();
    } catch (error) {
      console.error('Error completing visit:', error);
      toast.error('Failed to complete visit');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        // Filter for doctors only
        const doctorsList = response.data.data.filter((user: any) =>
          user.role === 'doctor' || user.role === 'admin'
        );
        setDoctors(doctorsList);
        // Auto-select first doctor if available
        if (doctorsList.length > 0) {
          setSelectedDoctor(doctorsList[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`/patients/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Failed to search patients');
    }
  };

  const handleCreateWalkIn = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    try {
      setWalkInLoading(true);
      await api.post('/appointments/walkin', {
        patientId: selectedPatient._id,
        doctorId: selectedDoctor._id,
        type: 'consultation',
        reason: 'Walk-in visit',
      });

      toast.success('Walk-in patient added to queue');
      setShowWalkInModal(false);
      setSelectedPatient(null);
      setWalkInPatientSearch('');
      setSearchResults([]);
      fetchTodaysAppointments();
    } catch (error: any) {
      console.error('Error creating walk-in:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create walk-in appointment');
    } finally {
      setWalkInLoading(false);
    }
  };

  const fetchAppointmentStats = async () => {
    try {
      const response = await api.get('/appointments/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('practice');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Medicae - Front Desk</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/patient-lookup" className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title="Search Patients">
                <Search className="w-5 h-5 text-gray-600" />
              </Link>
              <Link to="/team-chat" className="p-2.5 hover:bg-gray-100 rounded-xl transition-all relative" title="Team Chat">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-pulse shadow-md shadow-blue-500/50" />
              </Link>
              <Link to="/alerts" className="p-2.5 hover:bg-gray-100 rounded-xl transition-all relative" title="Alerts">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse shadow-md shadow-red-500/50" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600 hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            {getGreeting()}, {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {practice.name && ` • ${practice.name}`}
          </p>
          <p className="text-amber-600 font-medium mt-1">Front Desk Operations</p>
        </div>

        {/* Queue Management Panel */}
        <div className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-xl shadow-gray-900/5 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Waiting Room Queue</h2>
                <p className="text-sm text-amber-700">
                  {queue.filter(p => p.status === 'waiting').length} waiting • {queue.filter(p => p.status === 'in-progress').length} in progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWalkInModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all text-sm flex items-center gap-2 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                Add Walk-In
              </button>
              <Link
                to="/queue"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all text-sm flex items-center gap-2 shadow-md"
              >
                <Users className="w-4 h-4" />
                View Full Queue
              </Link>
              <button
                onClick={() => setShowQueuePanel(!showQueuePanel)}
                className="px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 rounded-lg transition-all"
              >
                {showQueuePanel ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {showQueuePanel && (
            <div className="space-y-3">
              {queue.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No patients in queue</p>
                  <p className="text-sm text-gray-500 mt-1">Patients will appear here when they check in</p>
                </div>
              ) : (
                queue.map((patient, index) => (
                  <div
                    key={patient.appointmentId}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      patient.status === 'in-progress'
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-white border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Queue Number */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          patient.status === 'in-progress'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {index + 1}
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{patient.patientName}</h3>
                            {patient.status === 'in-progress' && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                In Progress
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {patient.appointmentTime}
                            </span>
                            <span className="capitalize">{patient.appointmentType}</span>
                            {patient.checkInTime && (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Checked In
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {patient.status === 'waiting' && !patient.checkInTime && (
                            <button
                              onClick={() => handleCheckIn(patient.appointmentId)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
                            >
                              <UserCheck className="w-4 h-4" />
                              Check In
                            </button>
                          )}
                          {patient.status === 'waiting' && patient.checkInTime && (
                            <button
                              onClick={() => handleCallPatient(patient.appointmentId, patient.patientName)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
                            >
                              <ArrowRight className="w-4 h-4" />
                              Call Patient
                            </button>
                          )}
                          {patient.status === 'in-progress' && (
                            <button
                              onClick={() => handleCompleteVisit(patient.appointmentId)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete Visit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {queue.length > 0 && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Queue Management Tips</p>
                      <ul className="text-xs text-gray-600 mt-2 space-y-1">
                        <li>• Check in patients as they arrive at the front desk</li>
                        <li>• Call patients when the provider is ready to see them</li>
                        <li>• Complete visits after the patient leaves</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions - Receptionist Focused */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/add-patient"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-xl hover:from-amber-100 hover:to-amber-100/50 transition-all border border-amber-200 hover:border-amber-300 hover:shadow-md group"
              >
                <div className="p-2 rounded-lg bg-amber-600 text-white group-hover:scale-110 transition-transform">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-amber-900 font-medium">Register Patient</span>
              </Link>
              <Link
                to="/appointments"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl hover:from-blue-100 hover:to-blue-100/50 transition-all border border-blue-200 hover:border-blue-300 hover:shadow-md group"
              >
                <div className="p-2 rounded-lg bg-blue-600 text-white group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-blue-900 font-medium">Manage Appointments</span>
              </Link>
              <Link
                to="/billing"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl hover:from-green-100 hover:to-green-100/50 transition-all border border-green-200 hover:border-green-300 hover:shadow-md group"
              >
                <div className="p-2 rounded-lg bg-green-600 text-white group-hover:scale-110 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-green-900 font-medium">Process Billing</span>
              </Link>
              <Link
                to="/patient-lookup"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-xl hover:from-purple-100 hover:to-purple-100/50 transition-all border border-purple-200 hover:border-purple-300 hover:shadow-md group"
              >
                <div className="p-2 rounded-lg bg-purple-600 text-white group-hover:scale-110 transition-transform">
                  <Search className="w-4 h-4" />
                </div>
                <span className="text-purple-900 font-medium">Search Patients</span>
              </Link>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold border border-amber-200">
                  {todayAppointments.length} appointments
                </span>
                <Link
                  to="/appointments"
                  className="px-4 py-2 bg-gradient-to-br from-amber-50 to-amber-50/50 text-amber-700 font-medium rounded-lg hover:from-amber-100 hover:to-amber-100/50 border border-amber-200 hover:border-amber-300 transition-all text-sm"
                >
                  Manage All
                </Link>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading appointments...</span>
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.slice(0, 4).map(apt => (
                  <Link
                    key={apt._id}
                    to={`/patient/${apt.patientId._id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-gray-50/30 group"
                  >
                    <div className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 min-w-[4rem] text-center group-hover:border-amber-300 transition-colors">
                      {apt.startTime}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-900 font-semibold">
                        {apt.patientId.firstName} {apt.patientId.lastName}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">{apt.type}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      apt.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status}
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-amber-100 transition-colors">
                      <Calendar className="w-4 h-4 text-gray-500 group-hover:text-amber-600" />
                    </div>
                  </Link>
                ))}
                {todayAppointments.length > 4 && (
                  <div className="text-center pt-2">
                    <Link
                      to="/appointments"
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                    >
                      + {todayAppointments.length - 4} more appointments
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">No appointments scheduled for today</div>
            )}
          </div>
        </div>

        {/* Administrative Tools */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrative Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link
              to="/appointments"
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-200 hover:border-amber-300 group"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">Appointments</span>
            </Link>
            <Link
              to="/billing"
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-200 hover:border-amber-300 group"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">Billing</span>
            </Link>
            <Link
              to="/analytics"
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-200 hover:border-amber-300 group"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">Analytics</span>
            </Link>
          </div>
        </div>

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-600 text-white">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Completed Today</h2>
                  <p className="text-sm text-green-700">{completedToday.length} patients seen</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {completedToday.map(apt => (
                <Link
                  key={apt._id}
                  to={`/patient/${apt.patientId._id}`}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-green-50/30 to-green-50/10 group"
                >
                  <div className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 min-w-[4rem] text-center group-hover:border-green-300 transition-colors">
                    {apt.startTime}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      {apt.patientId.firstName} {apt.patientId.lastName}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{apt.type}</div>
                  </div>
                  {apt.doctorId && (
                    <div className="text-sm text-gray-600">
                      Dr. {apt.doctorId.lastName}
                    </div>
                  )}
                  <div className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Patients */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Today's Patients</h2>
              <div className="p-2 rounded-lg bg-amber-50">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <Link
                    key={apt._id}
                    to={`/patient/${apt.patientId._id}`}
                    className="block p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md bg-gradient-to-br from-gray-50 to-gray-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-semibold">
                        {apt.patientId.firstName} {apt.patientId.lastName}
                      </span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-lg border capitalize transition-colors ${
                        apt.status === 'confirmed' ? 'text-green-700 bg-green-50 border-green-200 group-hover:bg-green-100' :
                        apt.status === 'in-progress' ? 'text-blue-700 bg-blue-50 border-blue-200 group-hover:bg-blue-100' :
                        apt.status === 'scheduled' ? 'text-amber-700 bg-amber-50 border-amber-200 group-hover:bg-amber-100' :
                        'text-gray-700 bg-gray-50 border-gray-200 group-hover:bg-gray-100'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">No patients scheduled today</div>
            )}
          </div>

          {/* Appointment Statistics */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Today's Status</h2>
              <div className="p-2 rounded-lg bg-amber-50">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            {stats ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-900">Total Appointments</span>
                    <span className="text-2xl font-bold text-amber-700">{stats.total}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-blue-700" />
                      <div className="text-xs font-medium text-blue-900">Scheduled</div>
                    </div>
                    <div className="text-xl font-bold text-blue-700">{stats.scheduled}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3 h-3 text-green-700" />
                      <div className="text-xs font-medium text-green-900">Confirmed</div>
                    </div>
                    <div className="text-xl font-bold text-green-700">{stats.confirmed}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-3 h-3 text-purple-700" />
                      <div className="text-xs font-medium text-purple-900">In Progress</div>
                    </div>
                    <div className="text-xl font-bold text-purple-700">{stats.inProgress}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3 h-3 text-emerald-700" />
                      <div className="text-xs font-medium text-emerald-900">Completed</div>
                    </div>
                    <div className="text-xl font-bold text-emerald-700">{stats.completed}</div>
                  </div>
                </div>
                {(stats.cancelled > 0 || stats.noShow > 0) && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    {stats.cancelled > 0 && (
                      <div className="p-3 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-50/50">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-3 h-3 text-red-700" />
                          <div className="text-xs font-medium text-red-900">Cancelled</div>
                        </div>
                        <div className="text-xl font-bold text-red-700">{stats.cancelled}</div>
                      </div>
                    )}
                    {stats.noShow > 0 && (
                      <div className="p-3 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-50/50">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-3 h-3 text-orange-700" />
                          <div className="text-xs font-medium text-orange-900">No Show</div>
                        </div>
                        <div className="text-xl font-bold text-orange-700">{stats.noShow}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">Loading statistics...</div>
            )}
          </div>
        </div>
      </div>

      {/* Walk-In Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Walk-In Patient</h2>
              <button
                onClick={() => {
                  setShowWalkInModal(false);
                  setSelectedPatient(null);
                  setWalkInPatientSearch('');
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Search for an existing patient or register a new one to add them to the queue.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Patient
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={walkInPatientSearch}
                    onChange={(e) => {
                      setWalkInPatientSearch(e.target.value);
                      searchPatients(e.target.value);
                    }}
                    placeholder="Search by name, phone, or patient ID..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all"
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                    {searchResults.map((patient) => (
                      <button
                        key={patient._id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setWalkInPatientSearch(`${patient.firstName} ${patient.lastName}`);
                          setSearchResults([]);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-green-50 transition-all border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {patient.phone} • {patient.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedPatient && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-green-900">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </p>
                        <p className="text-sm text-green-700">{selectedPatient.phone}</p>
                        <p className="text-sm text-green-700">{selectedPatient.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPatient(null);
                          setWalkInPatientSearch('');
                        }}
                        className="p-1 hover:bg-green-100 rounded transition-all"
                      >
                        <X className="w-4 h-4 text-green-700" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Doctor
                </label>
                <select
                  value={selectedDoctor?._id || ''}
                  onChange={(e) => {
                    const doctor = doctors.find(d => d._id === e.target.value);
                    setSelectedDoctor(doctor);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all"
                >
                  <option value="">Select a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                      {doctor.specialization && ` - ${doctor.specialization}`}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedPatient && walkInPatientSearch.length === 0 && (
                <Link
                  to="/add-patient"
                  className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all text-center font-medium"
                >
                  <UserPlus className="w-4 h-4 inline-block mr-2" />
                  Register New Patient
                </Link>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowWalkInModal(false);
                  setSelectedPatient(null);
                  setWalkInPatientSearch('');
                  setSearchResults([]);
                }}
                disabled={walkInLoading}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWalkIn}
                disabled={walkInLoading || !selectedPatient}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/30"
              >
                {walkInLoading ? 'Adding...' : 'Add to Queue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
