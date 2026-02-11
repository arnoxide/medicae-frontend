import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Building2, Stethoscope, CheckCircle2, Sparkles } from 'lucide-react';

const steps = [
  { id: 1, title: 'Choose Role' },
  { id: 2, title: 'Clinic Setup' },
  { id: 3, title: 'Clinic Type' },
  { id: 4, title: 'Modules' }
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicType, setClinicType] = useState('');
  const [modules, setModules] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleModuleToggle = (module: string) => {
    setModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const handleComplete = () => {
    navigate('/clinic');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/20 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome to Medicae</h1>
          <p className="text-gray-600">Let's set up your healthcare platform</p>
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
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Choose your role</h2>
              {['Clinic Admin', 'Doctor', 'Nurse'].map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`group w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    role === r
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${
                      role === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <span className="text-lg text-gray-900 font-medium">{r}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Create or join clinic</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Central Medical Clinic"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-50/50 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Enter clinic join code</span>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Select clinic type</h2>
              {['General Practice', 'Dental', 'Audiology', 'Mixed Practice'].map(type => (
                <button
                  key={type}
                  onClick={() => setClinicType(type)}
                  className={`group w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    clinicType === type
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${
                      clinicType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <span className="text-lg text-gray-900 font-medium">{type}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Enable modules</h2>
                <p className="text-sm text-gray-600">Select the features you want to activate for your clinic</p>
              </div>
              {['Appointments', 'Billing', 'Inventory', 'Lab Results'].map(module => (
                <label
                  key={module}
                  className={`group flex items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    modules.includes(module)
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={modules.includes(module)}
                    onChange={() => handleModuleToggle(module)}
                    className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-lg text-gray-900 font-medium flex-1">{module}</span>
                </label>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-100">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200"
              >
                Back
              </button>
            )}
            <button
              onClick={() => currentStep === 4 ? handleComplete() : setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && !role) ||
                (currentStep === 2 && !clinicName) ||
                (currentStep === 3 && !clinicType)
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 shadow-lg shadow-blue-600/30 disabled:shadow-none"
            >
              {currentStep === 4 ? 'Complete Setup' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
