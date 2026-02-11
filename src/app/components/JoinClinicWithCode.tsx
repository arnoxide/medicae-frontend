import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';

const steps = [
  { id: 1, title: 'Verify Details' },
  { id: 2, title: 'Create Account' }
];

export default function JoinClinicWithCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [joinCode, setJoinCode] = useState('');
  const [role, setRole] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Pre-fill from URL parameters (from invitation email)
  useEffect(() => {
    const invitationCodeParam = searchParams.get('invitationCode');
    const codeParam = searchParams.get('code'); // Legacy
    const emailParam = searchParams.get('email');
    const roleParam = searchParams.get('role');

    if (invitationCodeParam) {
      // New invitation code flow
      setJoinCode(invitationCodeParam.toUpperCase());
      if (emailParam) setEmail(emailParam);
      // Auto-verify invitation code
      verifyInvitationCode(invitationCodeParam);
    } else if (codeParam) {
      // Legacy join code flow
      setJoinCode(codeParam.toUpperCase());
      if (emailParam) setEmail(emailParam);
      if (roleParam) setRole(roleParam);
      // Auto-verify join code
      verifyJoinCode(codeParam);
    }
  }, [searchParams]);

  const verifyInvitationCode = async (code?: string) => {
    try {
      setLoading(true);
      setError('');

      const codeToVerify = code || joinCode;
      const response = await api.get(`/onboarding/verify-invitation/${codeToVerify}`);

      if (response.data.data.valid) {
        setClinicInfo(response.data.data);
        setEmail(response.data.data.email); // Pre-fill from invitation
        setRole(response.data.data.role); // Pre-fill role
        toast.success('Invitation verified!');
        // Skip directly to account creation step
        setCurrentStep(2);
      } else {
        setError('Invalid invitation code');
        toast.error('Invalid invitation code');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to verify invitation code');
      toast.error('Invalid invitation code');
    } finally {
      setLoading(false);
    }
  };

  const verifyJoinCode = async (code?: string) => {
    try {
      setLoading(true);
      setError('');

      const codeToVerify = code || joinCode;
      const response = await api.get(`/onboarding/verify/${codeToVerify}`);

      if (response.data.data.valid) {
        setClinicInfo(response.data.data);
        toast.success('Join code verified!');
        // Skip directly to account creation step
        setCurrentStep(2);
      } else {
        setError('Invalid join code');
        toast.error('Invalid join code');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to verify join code');
      toast.error('Invalid join code');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if we're using invitation code (from URL)
      const invitationCodeParam = searchParams.get('invitationCode');

      const payload: any = {
        firstName,
        lastName,
        email,
        password,
      };

      // Use invitation code if available, otherwise use join code + role
      if (invitationCodeParam) {
        payload.invitationCode = invitationCodeParam;
      } else {
        payload.joinCode = joinCode;
        payload.role = role.toLowerCase();
      }

      const response = await api.post('/onboarding/join', payload);

      // Store tokens and user data
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('practice', JSON.stringify(response.data.data.practice));

      toast.success('Successfully joined clinic!', {
        description: `Welcome to ${response.data.data.practice.name}`,
      });

      // Navigate to clinic home
      navigate('/clinic');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to join clinic';
      setError(errorMessage);
      toast.error('Join failed', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 shadow-lg shadow-green-600/20 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Join Your Clinic</h1>
          <p className="text-gray-600">
            {searchParams.get('invitationCode')
              ? 'Complete your profile to accept the invitation'
              : 'Enter your join code to get started'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md shadow-green-600/30 scale-110'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                  {currentStep === step.id && (
                    <span className="absolute inset-0 rounded-full bg-green-600 animate-ping opacity-20" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className="relative flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 transition-all duration-500 ${
                      currentStep > step.id ? 'w-full' : 'w-0'
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 font-medium">{steps[currentStep - 1].title}</p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-900/5 border border-gray-100/50 backdrop-blur-sm">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                {searchParams.get('invitationCode') ? 'Verify Invitation' : 'Enter Join Code'}
              </h2>
              {clinicInfo && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-green-900 font-medium">Clinic: {clinicInfo.practiceName}</p>
                  <p className="text-xs text-green-700 mt-1 capitalize">Type: {clinicInfo.practiceType}</p>
                  {searchParams.get('invitationCode') && (
                    <p className="text-xs text-green-700 mt-1">
                      Email: {clinicInfo.email}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Key className="w-4 h-4 inline mr-2" />
                  {searchParams.get('invitationCode') ? 'Invitation Code' : 'Join Code'}
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  disabled={!!searchParams.get('invitationCode')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all shadow-sm font-mono text-lg tracking-wider disabled:bg-gray-50 disabled:text-gray-500"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {searchParams.get('invitationCode')
                    ? 'Your invitation code (pre-filled from email link)'
                    : 'Enter the 8-character code provided by your clinic administrator'}
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">Create Your Account</h2>
              <p className="text-sm text-gray-600">
                Complete your profile to join {clinicInfo?.practiceName}
              </p>

              {/* Show assigned role */}
              {role && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-900 font-medium">
                    You've been invited as: <span className="capitalize font-bold">{role}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  disabled={!!searchParams.get('email')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
                {searchParams.get('email') && (
                  <p className="text-xs text-gray-500 mt-1">
                    Email pre-filled from invitation
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-100">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
                className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (currentStep === 1) {
                  verifyJoinCode();
                } else if (currentStep === 2) {
                  handleComplete();
                }
              }}
              disabled={
                loading ||
                (currentStep === 1 && !joinCode) ||
                (currentStep === 2 && (!firstName || !lastName || !email || !password || !role))
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 shadow-lg shadow-green-600/30 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {currentStep === 1 && (loading ? 'Verifying...' : 'Verify Code')}
              {currentStep === 2 && (loading ? 'Creating Account...' : 'Join Clinic')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
