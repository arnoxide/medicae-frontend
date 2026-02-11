import React, { useState } from 'react';
import { UserCircle, CheckCircle2, Sparkles, Loader2, Key, Building2, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';

const steps = [
  { id: 1, title: 'Enter Code' },
  { id: 2, title: 'Your Information' },
];

export default function SetupWithCode() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [setupCode, setSetupCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const verifySetupCode = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/onboarding/verify-setup/${setupCode}`);

      if (response.data.data.valid) {
        setClinicInfo(response.data.data);
        toast.success('Setup code verified!');
        setCurrentStep(2);
      } else {
        setError('Invalid setup code');
        toast.error('Invalid setup code');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to verify setup code');
      toast.error('Invalid setup code');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/onboarding/complete-setup', {
        setupCode,
        firstName,
        lastName,
        email,
        password,
        role: 'admin', // Admin completing setup
      });

      // Store tokens and user data
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('practice', JSON.stringify(response.data.data.practice));

      const subdomain = response.data.data.practice.subdomain;

      toast.success('Setup complete!', {
        description: `Welcome to ${response.data.data.practice.name}`,
      });

      // Show subdomain info and redirect
      if (subdomain) {
        toast.success(`🎉 Your clinic subdomain: ${subdomain}.localhost`, {
          description: 'You can access your clinic at this subdomain',
          duration: 4000,
        });

        // Wait a moment before redirecting
        setTimeout(() => {
          navigate('/clinic');
        }, 2000);
      } else {
        navigate('/clinic');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Setup failed';
      setError(errorMessage);
      toast.error('Setup failed', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/20 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Complete Clinic Setup</h1>
          <p className="text-gray-600">Create your administrator account to get started</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30 scale-110'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                  {currentStep === step.id && (
                    <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className="relative flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500 ${
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
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Enter Setup Code</h2>

              {clinicInfo && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-900">{clinicInfo.practiceName}</h3>
                      <p className="text-sm text-blue-700 capitalize">{clinicInfo.practiceType} Practice</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {clinicInfo.practiceEmail && (
                      <div className="flex items-center gap-2 text-blue-800">
                        <Mail className="w-4 h-4" />
                        <span>{clinicInfo.practiceEmail}</span>
                      </div>
                    )}
                    {clinicInfo.practicePhone && (
                      <div className="flex items-center gap-2 text-blue-800">
                        <Phone className="w-4 h-4" />
                        <span>{clinicInfo.practicePhone}</span>
                      </div>
                    )}
                    {clinicInfo.practiceAddress && (
                      <div className="flex items-center gap-2 text-blue-800">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {clinicInfo.practiceAddress.city}, {clinicInfo.practiceAddress.state}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Key className="w-4 h-4 inline mr-2" />
                  Setup Code
                </label>
                <input
                  type="text"
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm font-mono text-lg tracking-wider"
                  maxLength={12}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 12-character setup code sent to your email
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create Your Administrator Account</h2>
                <p className="text-sm text-gray-600">
                  You'll use this account to manage {clinicInfo?.practiceName}
                </p>
              </div>

              {clinicInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">
                    Setting up: {clinicInfo.practiceName}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {clinicInfo.practiceType} Practice
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be your login email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
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
                  verifySetupCode();
                } else if (currentStep === 2) {
                  handleComplete();
                }
              }}
              disabled={
                loading ||
                (currentStep === 1 && !setupCode) ||
                (currentStep === 2 && (!firstName || !lastName || !email || !password))
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 shadow-lg shadow-blue-600/30 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {currentStep === 1 && (loading ? 'Verifying...' : 'Verify Code')}
              {currentStep === 2 && (loading ? 'Creating Account...' : 'Complete Setup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
