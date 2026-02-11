import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Search, Activity, ArrowLeft, Users, Mail, Briefcase, Hash, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { hasPermission } from '../../utils/permissions';

interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  staffNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export default function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Get user role
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;
  const canInviteStaff = hasPermission(userRole, 'staff:invite');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.get(`/users?practiceId=${user.practiceId}`);
      setStaff(response.data.data || []);
    } catch (err: any) {
      toast.error('Failed to load staff members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStaff = async () => {
    try {
      setInviteLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const practice = JSON.parse(localStorage.getItem('practice') || '{}');

      await api.post('/staff/invite', {
        email: inviteEmail,
        role: inviteRole,
        practiceId: user.practiceId,
      });

      toast.success('Invitation sent!', {
        description: `${inviteEmail} will receive an email with instructions to join ${practice.name}`,
      });

      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('');
    } catch (err: any) {
      toast.error('Failed to send invitation', {
        description: err.response?.data?.error?.message || 'Please try again',
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredStaff = staff.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.staffNumber && member.staffNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'physician':
      case 'doctor':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'nurse':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'receptionist':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/clinic" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Staff Management</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                {staff.length} Staff Members
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Staff Directory</h1>
          <p className="text-gray-600 font-medium">Manage your clinic's team members</p>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role, or staff number..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
            />
          </div>
          {canInviteStaff && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Invite Staff Member
            </button>
          )}
        </div>

        {/* Staff List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 shadow-xl shadow-gray-900/5 border border-gray-100/50 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading staff members...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-xl shadow-gray-900/5 border border-gray-100/50 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No staff members found' : 'No staff members yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Add your first staff member to get started'}
            </p>
            {!searchQuery && canInviteStaff && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
              >
                <UserPlus className="w-5 h-5" />
                Invite Staff Member
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredStaff.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50 hover:shadow-2xl hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-lg border capitalize ${getRoleBadgeColor(member.role)}`}>
                            {member.role}
                          </span>
                          {member.isActive ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-green-50 text-green-700 border border-green-200">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{member.email}</span>
                      </div>
                      {member.staffNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Hash className="w-4 h-4" />
                          <span className="font-mono">{member.staffNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          {['admin', 'physician', 'nurse', 'receptionist'].map((role) => {
            const count = staff.filter((s) => s.role.toLowerCase() === role).length;
            return (
              <div
                key={role}
                className="bg-white rounded-xl p-4 shadow-lg shadow-gray-900/5 border border-gray-100/50"
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-lg border capitalize mb-2 ${getRoleBadgeColor(role)}`}>
                  <Briefcase className="w-3 h-3" />
                  {role}
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Staff Member</h2>
            <p className="text-gray-600 mb-6">
              Send an invitation email with a join code
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="staff@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                >
                  <option value="">Select a role...</option>
                  <option value="physician">Physician</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRole('');
                }}
                disabled={inviteLoading}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteStaff}
                disabled={inviteLoading || !inviteEmail || !inviteRole}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
              >
                {inviteLoading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
