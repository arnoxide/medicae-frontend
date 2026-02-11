import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  UserPlus,
  Users,
  Activity,
  Search,
  Bell,
  FolderUp,
  Pill,
  MessageCircle,
  DollarSign,
  BarChart3,
  TestTube,
  LogOut,
  UserCog,
  Files
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { hasPermission, canAccessMedicalRecords } from '../../utils/permissions';
import ReceptionistDashboard from './ReceptionistDashboard';

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

export default function ClinicHome() {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const practice = JSON.parse(localStorage.getItem('practice') || '{}');
  const userRole = user.role;

  // Route receptionists to their specialized dashboard
  if (userRole?.toLowerCase() === 'receptionist') {
    return <ReceptionistDashboard />;
  }

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysAppointments();
    fetchAppointmentStats();
  }, []);

  const fetchTodaysAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/today');
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

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get salutation based on role
  const getSalutation = () => {
    const role = user.role?.toLowerCase();
    if (role === 'physician' || role === 'doctor') return 'Dr.';
    if (role === 'nurse') return 'Nurse';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Medicae</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/patient-lookup" className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title="Search Patients">
                <Search className="w-5 h-5 text-gray-600" />
              </Link>
              {hasPermission(userRole, 'staff:view') && (
                <Link to="/staff" className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title="Manage Staff">
                  <UserCog className="w-5 h-5 text-gray-600" />
                </Link>
              )}
              {hasPermission(userRole, 'chat:access') && (
                <Link to="/team-chat" className="p-2.5 hover:bg-gray-100 rounded-xl transition-all relative" title="Team Chat">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-pulse shadow-md shadow-blue-500/50" />
                </Link>
              )}
              {hasPermission(userRole, 'alerts:view') && (
                <Link to="/alerts" className="p-2.5 hover:bg-gray-100 rounded-xl transition-all relative" title="Alerts">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse shadow-md shadow-red-500/50" />
                </Link>
              )}
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
            {getGreeting()}, {getSalutation()} {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {practice.name && ` • ${practice.name}`}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="space-y-3">
              {hasPermission(userRole, 'patient:register') && (
                <Link
                  to="/add-patient"
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl hover:from-blue-100 hover:to-blue-100/50 transition-all border border-blue-200 hover:border-blue-300 hover:shadow-md group"
                >
                  <div className="p-2 rounded-lg bg-blue-600 text-white group-hover:scale-110 transition-transform">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-blue-900 font-medium">Register Patient</span>
                </Link>
              )}
              {hasPermission(userRole, 'files:migrate') && (
                <Link
                  to="/migrate-files"
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-xl hover:from-purple-100 hover:to-purple-100/50 transition-all border border-purple-200 hover:border-purple-300 hover:shadow-md group"
                >
                  <div className="p-2 rounded-lg bg-purple-600 text-white group-hover:scale-110 transition-transform">
                    <FolderUp className="w-4 h-4" />
                  </div>
                  <span className="text-purple-900 font-medium">Digitize Files</span>
                </Link>
              )}
              {canAccessMedicalRecords(userRole) && (
                <Link
                  to="/patient-files"
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-50/50 rounded-xl hover:from-indigo-100 hover:to-indigo-100/50 transition-all border border-indigo-200 hover:border-indigo-300 hover:shadow-md group"
                >
                  <div className="p-2 rounded-lg bg-indigo-600 text-white group-hover:scale-110 transition-transform">
                    <Files className="w-4 h-4" />
                  </div>
                  <span className="text-indigo-900 font-medium">Patient Files</span>
                </Link>
              )}
              {hasPermission(userRole, 'prescriptions:view') && (
                <Link
                  to="/prescriptions"
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl hover:from-green-100 hover:to-green-100/50 transition-all border border-green-200 hover:border-green-300 hover:shadow-md group"
                >
                  <div className="p-2 rounded-lg bg-green-600 text-white group-hover:scale-110 transition-transform">
                    <Pill className="w-4 h-4" />
                  </div>
                  <span className="text-green-900 font-medium">Prescriptions</span>
                </Link>
              )}
            </div>
          </div>

          {/* Today's Context */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                  {todayAppointments.length} appointments
                </span>
                <Link
                  to="/appointments"
                  className="px-4 py-2 bg-gradient-to-br from-blue-50 to-blue-50/50 text-blue-700 font-medium rounded-lg hover:from-blue-100 hover:to-blue-100/50 border border-blue-200 hover:border-blue-300 transition-all text-sm"
                >
                  View All
                </Link>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading appointments...</span>
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.slice(0, 4).map(apt => (
                  <Link
                    key={apt._id}
                    to={`/patient/${apt.patientId._id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-gray-50/30 group"
                  >
                    <div className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 min-w-[4rem] text-center group-hover:border-blue-300 transition-colors">
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
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status}
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                      <Calendar className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                    </div>
                  </Link>
                ))}
                {todayAppointments.length > 4 && (
                  <div className="text-center pt-2">
                    <Link
                      to="/appointments"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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

        {/* Clinical Tools */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {hasPermission(userRole, 'appointments:view') && (
              <Link
                to="/appointments"
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Appointments</span>
              </Link>
            )}
            {hasPermission(userRole, 'lab:view') && (
              <Link
                to="/lab-results"
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
                  <TestTube className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Lab Results</span>
              </Link>
            )}
            {hasPermission(userRole, 'billing:view') && (
              <Link
                to="/billing"
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-200 hover:border-green-300 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Billing</span>
              </Link>
            )}
            {hasPermission(userRole, 'analytics:view') && (
              <Link
                to="/analytics"
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-200 hover:border-amber-300 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Analytics</span>
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Patients */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Today's Patients</h2>
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <Link
                    key={apt._id}
                    to={`/patient/${apt.patientId._id}`}
                    className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md bg-gradient-to-br from-gray-50 to-gray-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-semibold">
                        {apt.patientId.firstName} {apt.patientId.lastName}
                      </span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-lg border capitalize transition-colors ${
                        apt.status === 'confirmed' ? 'text-green-700 bg-green-50 border-green-200 group-hover:bg-green-100' :
                        apt.status === 'in-progress' ? 'text-blue-700 bg-blue-50 border-blue-200 group-hover:bg-blue-100' :
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

          {/* Appointment Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Appointment Statistics</h2>
              <div className="p-2 rounded-lg bg-purple-50">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            {stats ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Total Today</span>
                    <span className="text-2xl font-bold text-blue-700">{stats.total}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-50/50">
                    <div className="text-xs font-medium text-green-900 mb-1">Confirmed</div>
                    <div className="text-xl font-bold text-green-700">{stats.confirmed}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-50/50">
                    <div className="text-xs font-medium text-purple-900 mb-1">In Progress</div>
                    <div className="text-xl font-bold text-purple-700">{stats.inProgress}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-50/50">
                    <div className="text-xs font-medium text-gray-900 mb-1">Scheduled</div>
                    <div className="text-xl font-bold text-gray-700">{stats.scheduled}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/50">
                    <div className="text-xs font-medium text-emerald-900 mb-1">Completed</div>
                    <div className="text-xl font-bold text-emerald-700">{stats.completed}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">Loading statistics...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
