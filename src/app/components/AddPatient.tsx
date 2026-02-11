import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Save,
  X,
  Clock,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory: {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    bloodType: string;
    height: string;
    weight: string;
  };
  medicalAid: {
    provider: string;
    memberNumber: string;
    mainMemberName: string;
    dependantCode: string;
    planOption: string;
  };
}

const FORM_STORAGE_KEY = 'patient_registration_draft';
const OFFLINE_QUEUE_KEY = 'patient_registration_queue';

export default function AddPatient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [showOfflineQueue, setShowOfflineQueue] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize form data from localStorage or defaults
  const getInitialFormData = (): PatientFormData => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        toast.info('Previous draft restored', {
          description: 'Your unsaved work has been recovered',
        });
        return parsed.formData;
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }

    return {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: 'Gauteng',
        zipCode: '',
        country: 'South Africa',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      medicalHistory: {
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        bloodType: '',
        height: '',
        weight: '',
      },
      medicalAid: {
        provider: '',
        memberNumber: '',
        mainMemberName: '',
        dependantCode: '',
        planOption: '',
      },
    };
  };

  const [formData, setFormData] = useState<PatientFormData>(getInitialFormData);

  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  // Ensure loading state is reset on mount
  useEffect(() => {
    setLoading(false);
  }, []);

  // Restore current step from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch (error) {
      console.error('Error loading saved step:', error);
    }
  }, []);

  // Auto-save form data to localStorage
  useEffect(() => {
    const saveData = {
      formData,
      currentStep,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(saveData));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving form data:', error);
      toast.error('Failed to auto-save form data');
    }
  }, [formData, currentStep]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online', {
        description: 'Connection restored',
      });
      // Delay sync to allow token refresh if needed
      setTimeout(() => {
        syncOfflineQueue();
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline', {
        description: 'Form data will be saved locally and synced when back online',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline queue when component mounts (with delay to allow auth)
  useEffect(() => {
    if (isOnline) {
      // Delay to ensure tokens are ready
      const timer = setTimeout(() => {
        syncOfflineQueue();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Check offline queue count on mount and periodically
  useEffect(() => {
    checkOfflineQueue();
    const interval = setInterval(checkOfflineQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync offline queue
  const syncOfflineQueue = async () => {
    // Prevent concurrent syncs
    if (isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    // Check if we have valid tokens
    const hasTokens = localStorage.getItem('accessToken') && localStorage.getItem('refreshToken');
    if (!hasTokens) {
      console.log('No auth tokens available, skipping sync');
      return;
    }

    try {
      const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queueData) return;

      const queue = JSON.parse(queueData);
      if (queue.length === 0) return;

      setIsSyncing(true);

      toast.info('Syncing offline submissions...', {
        description: `${queue.length} patient(s) waiting to be synced`,
      });

      let syncedCount = 0;
      let failedCount = 0;

      for (let i = queue.length - 1; i >= 0; i--) {
        const item = queue[i];
        try {
          console.log(`Syncing patient: ${item.payload.firstName} ${item.payload.lastName}`);
          await api.post('/patients', item.payload);
          
          toast.success(`Patient ${item.payload.firstName} ${item.payload.lastName} synced successfully`);
          
          // Remove synced item from queue
          queue.splice(i, 1);
          syncedCount++;
          localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        } catch (error: any) {
          console.error('Error syncing patient:', error);
          failedCount++;
          
          // If it's an auth error, stop trying to sync
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Auth error during sync, stopping...');
            toast.error('Authentication error', {
              description: 'Please log in again to sync offline patients',
            });
            break;
          }
          // Keep in queue to retry later
        }
      }

      // Clear queue if empty
      if (queue.length === 0) {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
        toast.success('All offline submissions synced successfully');
      } else if (syncedCount > 0) {
        toast.info(`Synced ${syncedCount} of ${syncedCount + failedCount} patients`, {
          description: `${failedCount} failed - will retry later`,
        });
      }
    } catch (error) {
      console.error('Error syncing offline queue:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear saved draft
  const clearDraft = () => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  // Check offline queue count
  const checkOfflineQueue = () => {
    try {
      const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queueData) {
        const queue = JSON.parse(queueData);
        setOfflineQueueCount(queue.length);
      } else {
        setOfflineQueueCount(0);
      }
    } catch (error) {
      console.error('Error checking offline queue:', error);
      setOfflineQueueCount(0);
    }
  };

  // Clear form and start fresh
  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear the form? All entered data will be lost.')) {
      // Reset to initial state
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: 'Gauteng',
          zipCode: '',
          country: 'South Africa',
        },
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
        },
        medicalHistory: {
          allergies: [],
          chronicConditions: [],
          currentMedications: [],
          bloodType: '',
          height: '',
          weight: '',
        },
        medicalAid: {
          provider: '',
          memberNumber: '',
          mainMemberName: '',
          dependantCode: '',
          planOption: '',
        },
      });
      setCurrentStep(1);
      clearDraft();
      toast.success('Form cleared');
    }
  };

  // Retry a queued patient registration
  const handleRetryQueueItem = async (index: number) => {
    try {
      const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queueData) return;

      const queue = JSON.parse(queueData);
      const item = queue[index];

      if (!item) return;

      // Get patient data from correct location (payload or data)
      const patientData = item.payload || item.data || item;

      toast.info('Retrying registration...');

      // Try to submit the patient
      const response = await api.post('/patients', patientData);

      if (response.data.success) {
        // Remove from queue on success
        queue.splice(index, 1);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        checkOfflineQueue();
        toast.success(`Patient ${patientData.firstName} ${patientData.lastName} synced successfully!`);
      }
    } catch (error: any) {
      console.error('Error retrying queue item:', error);
      toast.error('Failed to sync. Will retry automatically when online.');
    }
  };

  // Delete a queued patient
  const handleDeleteQueueItem = (index: number) => {
    if (confirm('Are you sure you want to delete this queued patient? This cannot be undone.')) {
      try {
        const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (!queueData) return;

        const queue = JSON.parse(queueData);
        const item = queue[index];
        const patientData = item.payload || item.data || item;

        queue.splice(index, 1);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        checkOfflineQueue();
        toast.success(`Removed ${patientData.firstName} ${patientData.lastName} from queue`);
      } catch (error) {
        console.error('Error deleting queue item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  // Get all queued patients
  const getQueuedPatients = () => {
    try {
      const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queueData) return [];
      return JSON.parse(queueData);
    } catch (error) {
      console.error('Error reading queue:', error);
      return [];
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PatientFormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addToArray = (field: 'allergies' | 'chronicConditions' | 'currentMedications', value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          [field]: [...prev.medicalHistory[field], value.trim()],
        },
      }));

      if (field === 'allergies') setAllergyInput('');
      if (field === 'chronicConditions') setConditionInput('');
      if (field === 'currentMedications') setMedicationInput('');
    }
  };

  const removeFromArray = (field: 'allergies' | 'chronicConditions' | 'currentMedications', index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [field]: prev.medicalHistory[field].filter((_, i) => i !== index),
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phone) {
          toast.error('Please fill in all required fields');
          return false;
        }
        return true;
      case 2:
        if (!formData.address.street || !formData.address.city || !formData.address.state) {
          toast.error('Please fill in all required address fields');
          return false;
        }
        return true;
      case 3:
        if (!formData.emergencyContact.name || !formData.emergencyContact.relationship || !formData.emergencyContact.phone) {
          toast.error('Please fill in all emergency contact fields');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      email: formData.email || undefined,
      phone: formData.phone,
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      medicalHistory: {
        allergies: formData.medicalHistory.allergies,
        chronicConditions: formData.medicalHistory.chronicConditions,
        currentMedications: formData.medicalHistory.currentMedications,
        height: formData.medicalHistory.height ? parseFloat(formData.medicalHistory.height) : undefined,
        weight: formData.medicalHistory.weight ? parseFloat(formData.medicalHistory.weight) : undefined,
        bloodType: formData.medicalHistory.bloodType || undefined,
      },
      insurance: formData.medicalAid.provider ? {
        provider: formData.medicalAid.provider,
        policyNumber: formData.medicalAid.memberNumber,
        groupNumber: formData.medicalAid.planOption,
        subscriberName: formData.medicalAid.mainMemberName,
        relationship: formData.medicalAid.dependantCode || 'self',
      } : undefined,
    };

    // If offline, queue the submission
    if (!isOnline) {
      console.warn('User is offline, queuing patient for sync');
      try {
        const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
        const queue = queueData ? JSON.parse(queueData) : [];

        queue.push({
          payload,
          timestamp: new Date().toISOString(),
          id: Date.now().toString(),
        });

        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

        toast.success('Patient saved offline', {
          description: 'Will sync automatically when connection is restored',
        });

        // Clear the draft since we've queued it
        clearDraft();
        navigate('/patient-lookup');
      } catch (error) {
        console.error('Error queuing offline submission:', error);
        toast.error('Failed to save patient offline');
      }
      return;
    }

    console.log('User is online, submitting directly to API');

    setLoading(true);

    try {
      console.log('Submitting patient registration...', {
        hasAccessToken: !!localStorage.getItem('accessToken'),
        hasRefreshToken: !!localStorage.getItem('refreshToken'),
        isOnline,
      });

      await api.post('/patients', payload);

      toast.success('Patient registered successfully!', {
        description: 'Email notifications have been sent',
      });

      // Clear the draft on successful submission
      clearDraft();
      navigate('/patient-lookup');
    } catch (error: any) {
      console.error('Error creating patient:', error);
      console.error('Error details:', {
        hasResponse: !!error.response,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        isOnline: navigator.onLine,
      });

      // Check if it's a timeout error
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

      // ONLY queue for offline sync if it's a TRUE network error (no internet connection)
      // Don't queue for timeout, auth errors (401/403) or validation errors
      const isRealNetworkError = !error.response && !error.message?.includes('refresh') && !isTimeout && !navigator.onLine;

      if (isRealNetworkError) {
        console.warn('Real network error detected, queuing for offline sync');
        toast.error('Network error', {
          description: 'Patient saved offline and will sync when connection is restored',
        });

        // Queue for offline sync
        try {
          const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
          const queue = queueData ? JSON.parse(queueData) : [];

          queue.push({
            payload,
            timestamp: new Date().toISOString(),
            id: Date.now().toString(),
          });

          localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
          clearDraft();
          navigate('/patient-lookup');
        } catch (queueError) {
          console.error('Error queuing offline submission:', queueError);
        }
      } else if (isTimeout) {
        // Timeout error - backend is taking too long
        console.error('Request timed out');
        toast.error('Request timed out', {
          description: 'The server is taking too long (email sending in progress). Patient may have been registered - please check patient list.',
          duration: 6000,
        });
      } else if (error.response?.status === 401) {
        // Auth error
        toast.error('Session expired', {
          description: 'Please log in again to continue',
        });
      } else {
        // Show appropriate error message
        const errorMessage = error.response?.data?.error?.message ||
                            error.response?.data?.message ||
                            error.message ||
                            'Failed to register patient';

        console.error('Registration failed:', errorMessage);
        toast.error('Failed to register patient', {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Address', icon: MapPin },
    { number: 3, title: 'Emergency Contact', icon: Phone },
    { number: 4, title: 'Medical History', icon: Heart },
    { number: 5, title: 'Medical Aid', icon: Shield },
  ];

  // South African provinces
  const saProvinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape',
  ];

  // South African Medical Aid providers
  const medicalAidProviders = [
    'Discovery Health',
    'Bonitas',
    'Fedhealth',
    'Momentum Health',
    'Medshield',
    'Bestmed',
    'Sizwe Hosmed',
    'Profmed',
    'Platinum Health',
    'Gems (Government Employees Medical Scheme)',
    'Polmed',
    'KeyHealth',
    'Medihelp',
    'Resolution Health',
    'Compcare',
    'Bankmed',
    'Sasolmed',
    'LA Health',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/patient-lookup')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Register New Patient</h1>
              <p className="text-gray-600 mt-1">Complete the form to add a new patient</p>
            </div>
            <button
              onClick={handleClearForm}
              className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear Form
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col items-end gap-2">
            {/* Online/Offline Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isOnline
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-orange-50 text-orange-700 border border-orange-200'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Syncing Indicator */}
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </div>
            )}

            {/* Auto-save Indicator */}
            {lastSaved && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Save className="w-3 h-3" />
                <span>
                  Saved {new Date(lastSaved).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            {/* Offline Queue Button */}
            {offlineQueueCount > 0 && (
              <button
                onClick={() => setShowOfflineQueue(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors relative"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Pending Sync ({offlineQueueCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep >= step.number
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-6 transition-all ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Address Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    >
                      <option value="">Select Province</option>
                      {saProvinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Phone className="w-6 h-6 text-blue-600" />
                Emergency Contact
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Spouse, Parent, Sibling"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Medical History */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-blue-600" />
                Medical History
              </h2>

              <div className="space-y-6">
                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('allergies', allergyInput);
                        }
                      }}
                      placeholder="Enter allergy and press Enter"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('allergies', allergyInput)}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.medicalHistory.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {allergy}
                        <button
                          type="button"
                          onClick={() => removeFromArray('allergies', index)}
                          className="hover:text-red-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={conditionInput}
                      onChange={(e) => setConditionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('chronicConditions', conditionInput);
                        }
                      }}
                      placeholder="Enter condition and press Enter"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('chronicConditions', conditionInput)}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.medicalHistory.chronicConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeFromArray('chronicConditions', index)}
                          className="hover:text-amber-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={medicationInput}
                      onChange={(e) => setMedicationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('currentMedications', medicationInput);
                        }
                      }}
                      placeholder="Enter medication and press Enter"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('currentMedications', medicationInput)}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.medicalHistory.currentMedications.map((medication, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {medication}
                        <button
                          type="button"
                          onClick={() => removeFromArray('currentMedications', index)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                    <select
                      name="medicalHistory.bloodType"
                      value={formData.medicalHistory.bloodType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      name="medicalHistory.height"
                      value={formData.medicalHistory.height}
                      onChange={handleInputChange}
                      placeholder="e.g., 175"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      name="medicalHistory.weight"
                      value={formData.medicalHistory.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 70"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Medical Aid */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Medical Aid Information (Optional)
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Aid Provider</label>
                    <select
                      name="medicalAid.provider"
                      value={formData.medicalAid.provider}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    >
                      <option value="">Select Medical Aid</option>
                      {medicalAidProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Number</label>
                    <input
                      type="text"
                      name="medicalAid.memberNumber"
                      value={formData.medicalAid.memberNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 1234567890"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Option</label>
                    <input
                      type="text"
                      name="medicalAid.planOption"
                      value={formData.medicalAid.planOption}
                      onChange={handleInputChange}
                      placeholder="e.g., Classic Smart"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Member Name</label>
                    <input
                      type="text"
                      name="medicalAid.mainMemberName"
                      value={formData.medicalAid.mainMemberName}
                      onChange={handleInputChange}
                      placeholder="Name of main member"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dependant Code</label>
                    <input
                      type="text"
                      name="medicalAid.dependantCode"
                      value={formData.medicalAid.dependantCode}
                      onChange={handleInputChange}
                      placeholder="e.g., 00, 01, 02"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                    <p className="text-xs text-gray-500 mt-1">00 for main member, 01+ for dependants</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Register Patient</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Offline Queue Modal */}
      {showOfflineQueue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Pending Sync Queue</h2>
              </div>
              <button
                onClick={() => setShowOfflineQueue(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {getQueuedPatients().length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">All patients synced successfully!</p>
                  <p className="text-gray-400 text-sm mt-2">No pending registrations in queue.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    These patients are waiting to be synced to the server. Click retry to manually sync, or they will auto-sync when connection is restored.
                  </p>

                  {getQueuedPatients().map((item: any, index: number) => {
                    const patientData = item.payload || item.data || item;
                    const firstName = patientData.firstName || 'Unknown';
                    const lastName = patientData.lastName || 'Patient';
                    const email = patientData.email || 'No email';
                    const phone = patientData.phone || 'No phone';

                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {firstName} {lastName}
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {email}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {phone}
                              </p>
                              <p className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Queued: {new Date(item.timestamp || Date.now()).toLocaleString()}
                              </p>
                            </div>

                            {/* Debug view - show raw data structure */}
                            <details className="mt-3">
                              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                Debug: View raw data
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(item, null, 2)}
                              </pre>
                            </details>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleRetryQueueItem(index)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                              title="Retry sync"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Retry
                            </button>
                            <button
                              onClick={() => handleDeleteQueueItem(index)}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-medium"
                              title="Delete from queue"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
              <p className="text-sm text-gray-600">
                {offlineQueueCount} {offlineQueueCount === 1 ? 'patient' : 'patients'} pending
              </p>
              <button
                onClick={() => setShowOfflineQueue(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}