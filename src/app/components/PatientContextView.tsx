import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Pill, FileText, Calendar, Activity, Download } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import api from '../../lib/api';
import { toast } from 'sonner';

type ContextLayer = 'emergency' | 'clinical' | 'admin' | 'files';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
  gender: string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface Prescription {
  _id: string;
  medication: string;
  dosage: string;
  frequency: string;
  status: string;
  createdAt: string;
}

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reason?: string;
  doctorId: {
    firstName: string;
    lastName: string;
  };
}

interface PatientFile {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  uploadedAt: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

export default function PatientContextView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<ContextLayer>('emergency');
  const [openSections, setOpenSections] = useState<string[]>(['emergency-info']);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatientData();
      fetchPrescriptions();
      fetchAppointments();
      fetchFiles();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patients/${id}`);
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

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/prescriptions', {
        params: { patientId: id, status: 'active' },
      });
      if (response.data.success) {
        setPrescriptions(response.data.data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments', {
        params: { patientId: id, limit: 10 },
      });
      if (response.data.success) {
        setAppointments(response.data.data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await api.get(`/files/patient/${id}`);
      if (response.data.success) {
        setFiles(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/clinic')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={() => navigate(`/visit/${id}`)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
          >
            Start Visit
          </button>
        </div>

        {/* Patient Header */}
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50 mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading patient data...</span>
            </div>
          ) : patient ? (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold mb-2 text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="font-medium">{calculateAge(patient.dateOfBirth)} years</span>
                  <span>•</span>
                  <span className="font-mono text-sm">{patient._id}</span>
                  {patient.bloodType && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-sm font-medium">
                        {patient.bloodType}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">Patient not found</div>
          )}
        </div>

        {/* Context Layer Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md border border-gray-100">
          <button
            onClick={() => setActiveLayer('emergency')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeLayer === 'emergency'
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/30'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Emergency
          </button>
          <button
            onClick={() => setActiveLayer('clinical')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeLayer === 'clinical'
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Clinical
          </button>
          <button
            onClick={() => setActiveLayer('admin')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeLayer === 'admin'
                ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-md shadow-slate-600/30'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveLayer('files')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeLayer === 'files'
                ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Files
          </button>
        </div>

        {/* Emergency Layer */}
        {activeLayer === 'emergency' && patient && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100/50 shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection('emergency-info')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-50">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Critical Information</span>
                </div>
              </button>
              {openSections.includes('emergency-info') && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="p-5 bg-gradient-to-br from-red-50 to-red-50/50 rounded-xl border border-red-200 shadow-sm">
                    <div className="text-sm font-semibold text-red-900 mb-3">Allergies</div>
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-red-100 text-red-900 rounded-lg text-sm font-medium">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No known allergies</div>
                    )}
                  </div>
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-xl border border-amber-200 shadow-sm">
                    <div className="text-sm font-semibold text-amber-900 mb-3">Chronic Conditions</div>
                    {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
                      <div className="space-y-2">
                        {patient.medicalConditions.map((condition, idx) => (
                          <div key={idx} className="text-amber-900 font-medium">{condition}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No chronic conditions recorded</div>
                    )}
                  </div>
                  <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Emergency Contact</div>
                    {patient.emergencyContact ? (
                      <div>
                        <div className="text-gray-900 font-medium">{patient.emergencyContact.name}</div>
                        <div className="text-sm text-gray-600">{patient.emergencyContact.relationship}</div>
                        <div className="text-sm text-gray-600">{patient.emergencyContact.phone}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No emergency contact on file</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Pill className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Current Medications</span>
              </div>
              {prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="text-gray-900 font-semibold">{prescription.medication}</div>
                      <div className="text-sm text-gray-600 mt-1">{prescription.dosage} - {prescription.frequency}</div>
                      <div className="text-xs text-gray-500 mt-1">Status: {prescription.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-4">No active prescriptions</div>
              )}
            </div>
          </div>
        )}

        {/* Clinical Layer */}
        {activeLayer === 'clinical' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Appointment History</span>
              </div>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-gray-50/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 font-semibold capitalize">{appointment.type}</div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            Dr. {appointment.doctorId.firstName} {appointment.doctorId.lastName}
                          </div>
                          {appointment.reason && (
                            <div className="text-sm text-gray-500 mt-1">{appointment.reason}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 font-medium px-3 py-1 bg-white rounded-lg border border-gray-200">
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {appointment.startTime} - {appointment.endTime}
                          </div>
                          <div className={`text-xs font-medium mt-1 capitalize ${
                            appointment.status === 'completed' ? 'text-green-600' :
                            appointment.status === 'cancelled' ? 'text-red-600' :
                            appointment.status === 'no-show' ? 'text-gray-600' :
                            'text-blue-600'
                          }`}>
                            {appointment.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-4">No appointments recorded</div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Pill className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Prescription History</span>
              </div>
              {prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-50/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 font-semibold">{prescription.medication}</div>
                          <div className="text-sm text-gray-600 mt-0.5">{prescription.dosage} - {prescription.frequency}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${
                            prescription.status === 'active' ? 'bg-green-100 text-green-700' :
                            prescription.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {prescription.status}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-4">No prescriptions on record</div>
              )}
            </div>
          </div>
        )}

        {/* Admin Layer */}
        {activeLayer === 'admin' && patient && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Upcoming Appointments</span>
              </div>
              {appointments.filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'cancelled').length > 0 ? (
                <div className="space-y-3">
                  {appointments
                    .filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'cancelled')
                    .map((apt) => (
                      <div key={apt._id} className="p-4 bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-gray-900 font-semibold capitalize">{apt.type}</div>
                            <div className="text-sm text-gray-600 mt-0.5">
                              {new Date(apt.date).toLocaleDateString()} at {apt.startTime}
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">
                              Dr. {apt.doctorId.firstName} {apt.doctorId.lastName}
                            </div>
                          </div>
                          <div className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {apt.status}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-4">No upcoming appointments</div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gray-50">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Patient Information</span>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="text-gray-900 font-medium">{patient.email}</div>
                  </div>
                  {patient.phone && (
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="text-gray-900 font-medium">{patient.phone}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">Gender</div>
                    <div className="text-gray-900 font-medium capitalize">{patient.gender}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date of Birth</div>
                    <div className="text-gray-900 font-medium">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Files Layer */}
        {activeLayer === 'files' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-50">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Patient Files</span>
              </div>
              {files.length > 0 ? (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file._id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-50/30 rounded-xl border border-gray-200 hover:border-purple-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <div className="text-gray-900 font-semibold">{file.fileName}</div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="capitalize">{file.category}</span>
                            <span className="mx-2">•</span>
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span className="mx-2">•</span>
                            <span className="uppercase text-xs">{file.fileType}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Uploaded by {file.uploadedBy.firstName} {file.uploadedBy.lastName} on{' '}
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(file._id, file.fileName)}
                          className="ml-4 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                          title="Download file"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p>No files uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Access Log */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600 text-center font-medium">
            Access logged • Last viewed on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
