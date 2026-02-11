import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pill, Search, Calendar, User, AlertTriangle, Check, X, FileText, Send } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

type PrescriptionStatus = 'active' | 'completed' | 'cancelled' | 'pending';

interface Prescription {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  doctorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  medication: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: PrescriptionStatus;
  pharmacy?: string;
  pharmacyId?: string;
  refills: number;
  refillsRemaining: number;
  instructions?: string;
  category?: string;
  route?: string;
  prescriptionNumber: string;
  sentToPharmacy: boolean;
  createdAt: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Medication {
  _id: string;
  name: string;
  genericName?: string;
  activeSubstance: string;
  category: string;
  commonDosages?: string[];
  route?: string[];
}

interface PrescriptionStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export default function PrescriptionManagement() {
  const navigate = useNavigate();
  const [prescriptionList, setPrescriptionList] = useState<Prescription[]>([]);
  const [prescriptionStats, setPrescriptionStats] = useState<PrescriptionStats>({ total: 0, active: 0, pending: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PrescriptionStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [searchingMedications, setSearchingMedications] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    dosage: '',
    frequency: 'Once daily',
    duration: '7 days',
    durationDays: 7,
    refills: 0,
    startDate: new Date().toISOString().split('T')[0],
    pharmacy: '',
    instructions: '',
    quantity: undefined as number | undefined,
  });

  // Fetch prescriptions on mount
  useEffect(() => {
    fetchPrescriptions();
    fetchStats();
  }, []);

  // Fetch prescriptions when filter changes
  useEffect(() => {
    fetchPrescriptions();
  }, [filterStatus, searchTerm]);

  // Debounce patient search
  useEffect(() => {
    if (patientSearch.length >= 2 && !selectedPatient) {
      // Clear previous results and show loading
      setPatients([]);
      const debounce = setTimeout(() => {
        searchPatients();
      }, 400);
      return () => clearTimeout(debounce);
    } else {
      setPatients([]);
      setSearchingPatients(false);
    }
  }, [patientSearch, selectedPatient]);

  // Debounce medication search
  useEffect(() => {
    if (medicationSearch.length >= 2 && !selectedMedication) {
      // Clear previous results and show loading
      setMedications([]);
      const debounce = setTimeout(() => {
        searchMedications();
      }, 400);
      return () => clearTimeout(debounce);
    } else {
      setMedications([]);
      setSearchingMedications(false);
    }
  }, [medicationSearch, selectedMedication]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/prescriptions', { params });
      if (response.data.success) {
        setPrescriptionList(response.data.data.prescriptions || []);
      }
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/prescriptions/stats');
      if (response.data.success) {
        setPrescriptionStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const searchPatients = async () => {
    try {
      setSearchingPatients(true);
      const response = await api.get('/patients', {
        params: { search: patientSearch, limit: 10 },
      });
      if (response.data.success) {
        setPatients(response.data.data.patients || []);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Failed to search patients');
    } finally {
      setSearchingPatients(false);
    }
  };

  const searchMedications = async () => {
    try {
      setSearchingMedications(true);
      const response = await api.get('/medications/quick-search', {
        params: { q: medicationSearch, limit: 20 },
      });
      if (response.data.success) {
        setMedications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error searching medications:', error);
      toast.error('Failed to search medications');
    } finally {
      setSearchingMedications(false);
    }
  };

  const handleCreatePrescription = async () => {
    if (!selectedPatient || !selectedMedication) {
      toast.error('Please select a patient and medication');
      return;
    }

    if (!formData.dosage) {
      toast.error('Please select a dosage');
      return;
    }

    try {
      setSubmitting(true);

      // Calculate end date based on duration
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + formData.durationDays);

      const response = await api.post('/prescriptions', {
        patientId: selectedPatient._id,
        medication: selectedMedication.name,
        genericName: selectedMedication.genericName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        durationDays: formData.durationDays,
        quantity: formData.quantity,
        refills: formData.refills,
        startDate: formData.startDate,
        endDate: endDate.toISOString().split('T')[0],
        instructions: formData.instructions || undefined,
        pharmacy: formData.pharmacy || undefined,
        category: selectedMedication.category,
        route: 'oral',
      });

      if (response.data.success) {
        toast.success('Prescription created successfully');
        setShowNewPrescription(false);
        resetForm();
        fetchPrescriptions();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPrescription = async (id: string) => {
    try {
      const response = await api.patch(`/prescriptions/${id}/cancel`);
      if (response.data.success) {
        toast.success('Prescription cancelled');
        fetchPrescriptions();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel prescription');
    }
  };

  const handleRefill = async (id: string) => {
    try {
      const response = await api.post(`/prescriptions/${id}/refill`);
      if (response.data.success) {
        toast.success('Prescription refilled successfully');
        fetchPrescriptions();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to refill prescription');
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedMedication(null);
    setPatientSearch('');
    setFormData({
      dosage: '',
      frequency: 'Once daily',
      duration: '7 days',
      durationDays: 7,
      refills: 0,
      startDate: new Date().toISOString().split('T')[0],
      pharmacy: '',
      instructions: '',
      quantity: undefined,
    });
  };

  const handleDurationChange = (duration: string) => {
    const daysMap: { [key: string]: number } = {
      '7 days': 7,
      '14 days': 14,
      '30 days': 30,
      '60 days': 60,
      '90 days': 90,
    };
    setFormData({ ...formData, duration, durationDays: daysMap[duration] || 7 });
  };

  const filteredPrescriptions = prescriptionList;

  const getStatusColor = (status: PrescriptionStatus) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'completed': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: PrescriptionStatus) => {
    switch (status) {
      case 'active': return <Pill className="w-3 h-3" />;
      case 'completed': return <Check className="w-3 h-3" />;
      case 'cancelled': return <X className="w-3 h-3" />;
      case 'pending': return <AlertTriangle className="w-3 h-3" />;
    }
  };

  if (loading && prescriptionList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
              <p className="text-gray-600 mt-1">E-prescribing and medication tracking</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewPrescription(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            <span>New Prescription</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Prescriptions</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{prescriptionStats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Active</span>
              <Pill className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{prescriptionStats.active}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pending</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-600">{prescriptionStats.pending}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completed</span>
              <Check className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-600">{prescriptionStats.completed}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, medication, or prescription number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 bg-white shadow-sm"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PrescriptionStatus | 'all')}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium focus:outline-none focus:border-blue-600 bg-white shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Prescriptions ({filteredPrescriptions.length})
            </h2>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No prescriptions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className="p-6 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-start gap-6">
                    {/* Medication Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Pill className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{prescription.medication}</h3>
                          <p className="text-sm text-gray-600">
                            {prescription.dosage} • {prescription.frequency}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(prescription.status)} flex items-center gap-1`}>
                          {getStatusIcon(prescription.status)}
                          {prescription.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <User className="w-4 h-4" />
                            <span className="font-medium">Patient</span>
                          </div>
                          <p className="text-gray-900 font-semibold ml-6">
                            {prescription.patientId.firstName} {prescription.patientId.lastName}
                          </p>
                          <p className="text-sm text-gray-500 ml-6">{prescription.patientId.email}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Duration</span>
                          </div>
                          <p className="text-gray-900 ml-6">{prescription.duration}</p>
                          <p className="text-sm text-gray-500 ml-6">
                            {new Date(prescription.startDate).toLocaleDateString()} - {new Date(prescription.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {prescription.instructions && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-amber-900 mb-1">Instructions</p>
                              <p className="text-sm text-amber-800">{prescription.instructions}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                        <span>Prescribed by: <span className="font-medium text-gray-900">{prescription.doctorId.firstName} {prescription.doctorId.lastName}</span></span>
                        {prescription.pharmacy && (
                          <>
                            <span>•</span>
                            <span>Pharmacy: <span className="font-medium text-gray-900">{prescription.pharmacy}</span></span>
                          </>
                        )}
                        <span>•</span>
                        <span>Refills: <span className="font-medium text-gray-900">{prescription.refillsRemaining}/{prescription.refills}</span></span>
                        <span>•</span>
                        <span className="font-medium text-blue-600">{prescription.prescriptionNumber}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {prescription.status === 'active' && (
                        <>
                          {prescription.refillsRemaining > 0 && (
                            <button
                              onClick={() => handleRefill(prescription._id)}
                              className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200 text-sm whitespace-nowrap"
                            >
                              Refill
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelPrescription(prescription._id)}
                            className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200 text-sm whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Prescription Modal */}
        {showNewPrescription && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">New E-Prescription</h2>
                  <p className="text-sm text-gray-600 mt-1">Electronic prescription with pharmacy integration</p>
                </div>
                <button
                  onClick={() => {
                    setShowNewPrescription(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search patient by name, email, or phone"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    />
                    {searchingPatients && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Minimum character hint */}
                  {patientSearch.length > 0 && patientSearch.length < 2 && !selectedPatient && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Type at least 2 characters to search
                    </div>
                  )}

                  {/* Search results dropdown */}
                  {patients.length > 0 && !selectedPatient && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {patients.map((patient) => (
                        <button
                          key={patient._id}
                          onClick={() => {
                            setSelectedPatient(patient);
                            setPatientSearch(`${patient.firstName} ${patient.lastName}`);
                            setPatients([]);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                          <div className="text-sm text-gray-600">{patient.email}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results found */}
                  {patientSearch.length >= 2 && patients.length === 0 && !searchingPatients && !selectedPatient && (
                    <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      No patients found. Try searching by full name, email, or phone number.
                    </div>
                  )}
                  {selectedPatient && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                        <div className="text-sm text-blue-700">{selectedPatient.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPatient(null);
                          setPatientSearch('');
                        }}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        <X className="w-4 h-4 text-blue-700" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Medication Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medication *</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search medication by name or active substance"
                      value={medicationSearch}
                      onChange={(e) => setMedicationSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    />
                    {searchingMedications && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Minimum character hint */}
                  {medicationSearch.length > 0 && medicationSearch.length < 2 && !selectedMedication && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Type at least 2 characters to search
                    </div>
                  )}

                  {/* Search results dropdown */}
                  {medications.length > 0 && !selectedMedication && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      {medications.map((med) => (
                        <button
                          key={med._id}
                          onClick={() => {
                            setSelectedMedication(med);
                            setMedicationSearch(med.name);
                            setMedications([]);
                            if (med.commonDosages && med.commonDosages.length > 0) {
                              setFormData({ ...formData, dosage: med.commonDosages[0] });
                            }
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="font-medium text-gray-900">{med.name}</div>
                          <div className="text-sm text-gray-600">
                            {med.genericName && `${med.genericName} • `}
                            {med.category}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Active: {med.activeSubstance}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results found - with manual entry option */}
                  {medicationSearch.length >= 2 && medications.length === 0 && !searchingMedications && !selectedMedication && (
                    <div className="mt-2 space-y-2">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        No medications found. Try a different search term.
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMedication({
                            _id: 'manual',
                            name: medicationSearch,
                            activeSubstance: 'Enter active substance',
                            category: 'Manual Entry',
                            commonDosages: ['5mg', '10mg', '25mg', '50mg', '100mg', '250mg', '500mg'],
                          });
                        }}
                        className="w-full p-3 bg-blue-50 border-2 border-blue-200 border-dashed rounded-xl text-blue-700 font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add "{medicationSearch}" manually
                      </button>
                    </div>
                  )}

                  {/* Selected medication */}
                  {selectedMedication && (
                    <div className={`mt-2 p-3 rounded-lg border ${
                      selectedMedication._id === 'manual'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`font-medium ${
                              selectedMedication._id === 'manual' ? 'text-blue-900' : 'text-green-900'
                            }`}>
                              {selectedMedication.name}
                            </div>
                            {selectedMedication._id === 'manual' && (
                              <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                                Manual Entry
                              </span>
                            )}
                          </div>
                          <div className={`text-sm ${
                            selectedMedication._id === 'manual' ? 'text-blue-700' : 'text-green-700'
                          }`}>
                            {selectedMedication.genericName && `${selectedMedication.genericName} • `}
                            {selectedMedication.category}
                          </div>
                          <div className={`text-xs mt-1 ${
                            selectedMedication._id === 'manual' ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            Active: {selectedMedication.activeSubstance}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMedication(null);
                            setMedicationSearch('');
                          }}
                          className={`p-1 rounded ${
                            selectedMedication._id === 'manual'
                              ? 'hover:bg-blue-100'
                              : 'hover:bg-green-100'
                          }`}
                        >
                          <X className={`w-4 h-4 ${
                            selectedMedication._id === 'manual' ? 'text-blue-700' : 'text-green-700'
                          }`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dosage & Frequency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                    <select
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    >
                      {selectedMedication && selectedMedication.commonDosages && selectedMedication.commonDosages.length > 0 ? (
                        selectedMedication.commonDosages.map(dosage => (
                          <option key={dosage} value={dosage}>{dosage}</option>
                        ))
                      ) : (
                        <option>Select medication first</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    >
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>3 times daily</option>
                      <option>4 times daily</option>
                      <option>Every 4 hours</option>
                      <option>Every 6 hours</option>
                      <option>As needed</option>
                      <option>Before meals</option>
                      <option>After meals</option>
                    </select>
                  </div>
                </div>

                {/* Duration & Refills */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    >
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Refills Allowed</label>
                    <select
                      value={formData.refills}
                      onChange={(e) => setFormData({ ...formData, refills: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    >
                      <option value="0">0 (No refills)</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                  />
                </div>

                {/* Pharmacy Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send to Pharmacy (Optional)</label>
                  <select
                    value={formData.pharmacy}
                    onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                  >
                    <option value="">Select pharmacy for e-prescribing...</option>
                    <optgroup label="Major Pharmacy Chains">
                      <option>Clicks Pharmacy</option>
                      <option>Dis-Chem Pharmacy</option>
                      <option>Medirite Pharmacy</option>
                      <option>Alpha Pharm</option>
                      <option>Link Pharmacy</option>
                    </optgroup>
                    <optgroup label="Independent Pharmacies">
                      <option>Pharmacy Direct</option>
                      <option>Medicine Shoppe</option>
                      <option>Independent Pharmacy</option>
                      <option>Community Pharmacy</option>
                      <option>Local Pharmacy</option>
                    </optgroup>
                    <optgroup label="Hospital Pharmacies">
                      <option>Hospital Pharmacy</option>
                      <option>Netcare Pharmacy</option>
                      <option>Life Healthcare Pharmacy</option>
                      <option>Mediclinic Pharmacy</option>
                    </optgroup>
                    <optgroup label="Online Pharmacies">
                      <option>Pharmacy2U</option>
                      <option>MedExpress Online</option>
                      <option>Virtual Pharmacy</option>
                    </optgroup>
                  </select>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Take with food, Do not operate machinery, etc."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm resize-none"
                  />
                </div>

                {/* Warning Box */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">Drug Interaction Check</p>
                      <p className="text-sm text-amber-800">
                        System will automatically check for drug interactions, allergies, and contraindications before sending.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => {
                    setShowNewPrescription(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePrescription}
                  disabled={submitting || !selectedPatient || !selectedMedication}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Create Prescription</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
