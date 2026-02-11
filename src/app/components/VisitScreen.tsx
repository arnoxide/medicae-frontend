import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  FileText,
  Stethoscope,
  Pill,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
  gender: string;
}

interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  height: string;
  oxygenSaturation: string;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

type TabType = 'vitals' | 'complaint' | 'examination' | 'diagnosis' | 'treatment' | 'prescriptions' | 'followup';

export default function VisitScreen() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('vitals');

  // Form states
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: '',
  });
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [examination, setExamination] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patients/${patientId}`);
      if (response.data.success) {
        setPatient(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleCompleteVisit = async () => {
    if (!appointmentId) {
      toast.error('No appointment ID found');
      return;
    }

    try {
      setSaving(true);

      // Filter out empty prescriptions
      const validPrescriptions = prescriptions.filter(
        p => p.medication.trim() !== '' || p.dosage.trim() !== ''
      );

      const visitData = {
        chiefComplaint,
        vitalSigns: {
          bloodPressure: vitalSigns.bloodPressure,
          heartRate: vitalSigns.heartRate ? parseInt(vitalSigns.heartRate) : undefined,
          temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : undefined,
          weight: vitalSigns.weight ? parseFloat(vitalSigns.weight) : undefined,
          height: vitalSigns.height ? parseFloat(vitalSigns.height) : undefined,
          oxygenSaturation: vitalSigns.oxygenSaturation ? parseFloat(vitalSigns.oxygenSaturation) : undefined,
        },
        examination,
        diagnosis,
        treatmentPlan,
        prescriptions: validPrescriptions,
        followUpRequired,
        followUpDate: followUpRequired && followUpDate ? new Date(followUpDate) : undefined,
      };

      const response = await api.post(`/appointments/${appointmentId}/complete`, visitData);

      if (response.data.success) {
        toast.success('Visit completed successfully');
        navigate('/queue');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to complete visit';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'vitals' as TabType, label: 'Vital Signs', icon: Activity },
    { id: 'complaint' as TabType, label: 'Chief Complaint', icon: FileText },
    { id: 'examination' as TabType, label: 'Examination', icon: Stethoscope },
    { id: 'diagnosis' as TabType, label: 'Diagnosis', icon: FileText },
    { id: 'treatment' as TabType, label: 'Treatment Plan', icon: FileText },
    { id: 'prescriptions' as TabType, label: 'Prescriptions', icon: Pill },
    { id: 'followup' as TabType, label: 'Follow-up', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/queue')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queue</span>
          </button>
          <div className="text-sm text-gray-600 font-medium px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            Started {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Patient Info Bar */}
        {loading ? (
          <div className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-900/5 border border-gray-100/50 mb-6">
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading patient data...</span>
            </div>
          </div>
        ) : patient ? (
          <div className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-900/5 border border-gray-100/50 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-900 font-semibold text-lg">
                  {patient.firstName} {patient.lastName}
                </span>
                <span className="text-gray-300 mx-3">•</span>
                <span className="text-gray-600 font-medium">
                  {calculateAge(patient.dateOfBirth)} years
                </span>
                <span className="text-gray-300 mx-3">•</span>
                <span className="text-gray-600 capitalize">{patient.gender}</span>
              </div>
              <span className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-500/30">
                In consultation
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-900/5 border border-gray-100/50 mb-6">
            <div className="text-center py-4 text-gray-600">
              Patient not found
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100/50 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100/50">
          {/* Vital Signs Tab */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vital Signs</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 120/80"
                    value={vitalSigns.bloodPressure}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 72"
                    value={vitalSigns.heartRate}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 36.5"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70"
                    value={vitalSigns.weight}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 170"
                    value={vitalSigns.height}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oxygen Saturation (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 98"
                    value={vitalSigns.oxygenSaturation}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Chief Complaint Tab */}
          {activeTab === 'complaint' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Chief Complaint</h2>
              <p className="text-sm text-gray-600 mb-4">Patient's main reason for visit</p>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe the patient's chief complaint and presenting symptoms..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 resize-none"
              />
            </div>
          )}

          {/* Examination Tab */}
          {activeTab === 'examination' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Physical Examination</h2>
              <p className="text-sm text-gray-600 mb-4">Detailed examination findings</p>
              <textarea
                value={examination}
                onChange={(e) => setExamination(e.target.value)}
                placeholder="Document physical examination findings, observations, and assessments..."
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 resize-none"
              />
            </div>
          )}

          {/* Diagnosis Tab */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Diagnosis</h2>
              <p className="text-sm text-gray-600 mb-4">Clinical diagnosis and assessment</p>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis, differential diagnoses, and clinical assessment..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 resize-none"
              />
            </div>
          )}

          {/* Treatment Plan Tab */}
          {activeTab === 'treatment' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Treatment Plan</h2>
              <p className="text-sm text-gray-600 mb-4">Recommended treatment and care plan</p>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Outline treatment plan, recommendations, and patient instructions..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 resize-none"
              />
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Prescriptions</h2>
                  <p className="text-sm text-gray-600 mt-1">Add medications and instructions</p>
                </div>
                <button
                  onClick={addPrescription}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Medication
                </button>
              </div>

              {prescriptions.map((prescription, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 relative">
                  {prescriptions.length > 1 && (
                    <button
                      onClick={() => removePrescription(index)}
                      className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medication Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Amoxicillin"
                        value={prescription.medication}
                        onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosage
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 500mg"
                        value={prescription.dosage}
                        onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 3 times daily"
                        value={prescription.frequency}
                        onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 7 days"
                        value={prescription.duration}
                        onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructions
                      </label>
                      <textarea
                        placeholder="e.g., Take with food, avoid alcohol"
                        value={prescription.instructions}
                        onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {prescriptions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Pill className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No prescriptions added yet</p>
                  <button
                    onClick={addPrescription}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add your first prescription
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Follow-up Tab */}
          {activeTab === 'followup' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Follow-up</h2>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                />
                <label htmlFor="followUpRequired" className="text-gray-900 font-medium cursor-pointer">
                  Follow-up appointment required
                </label>
              </div>

              {followUpRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleCompleteVisit}
            disabled={saving}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-green-800 transition-all shadow-2xl hover:shadow-green-600/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Completing Visit...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Visit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
