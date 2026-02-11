import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, FileText, Eye, Download, Calendar, User, CheckCircle2, AlertCircle, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface PatientFile {
  _id: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  uploadDate: string;
  ocrText?: string;
  ocrConfidence?: number;
  processedAt?: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export default function PatientFiles() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientFiles(selectedPatient._id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients', {
        params: {
          limit: 100,
        },
      });

      if (response.data.success && response.data.data) {
        setPatients(response.data.data.patients || []);
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientFiles = async (patientId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/files/patient/${patientId}`);

      if (response.data.success) {
        setFiles(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load patient files');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = async (file: PatientFile) => {
    try {
      // Get signed URL from backend
      const response = await api.get(`/files/${file._id}/signed-url`);
      if (response.data.success && response.data.data.signedUrl) {
        window.open(response.data.data.signedUrl, '_blank');
      } else {
        // Fallback to original URL
        window.open(file.fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast.error('Failed to open file');
    }
  };

  const handleViewOCRText = (file: PatientFile) => {
    if (file.ocrText) {
      // Create a modal or new page to show OCR text
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>OCR Text - ${file.fileName}</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  max-width: 800px;
                  margin: 40px auto;
                  padding: 20px;
                  line-height: 1.6;
                }
                h1 { color: #1f2937; }
                .meta { color: #6b7280; margin-bottom: 20px; }
                pre {
                  background: #f3f4f6;
                  padding: 20px;
                  border-radius: 8px;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
              </style>
            </head>
            <body>
              <h1>${file.fileName}</h1>
              <div class="meta">
                <strong>Confidence:</strong> ${file.ocrConfidence}% |
                <strong>Patient:</strong> ${file.patientId.firstName} ${file.patientId.lastName}
              </div>
              <pre>${file.ocrText}</pre>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    statusFilter === 'all' || file.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, text: 'Pending' },
      processing: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, text: 'Processing' },
      completed: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, text: 'Completed' },
      error: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle, text: 'Error' },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Patient Files</h1>
              <p className="text-gray-600 mt-1">View and manage digitized patient records</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Patients</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                {filteredPatients.length}
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Patient List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading && !selectedPatient ? (
                <div className="text-center py-8 text-gray-500">Loading patients...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No patients found</div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedPatient?._id === patient._id
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedPatient?._id === patient._id ? 'bg-blue-100' : 'bg-white'
                      }`}>
                        <User className={`w-4 h-4 ${
                          selectedPatient?._id === patient._id ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-xs text-gray-600">{patient.email}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Files List */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-gray-100/50">
            {selectedPatient ? (
              <>
                {/* Patient Details Header */}
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h2>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 text-gray-900 font-medium">{selectedPatient.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 text-gray-900 font-medium">{selectedPatient.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {selectedPatient.dateOfBirth
                              ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Files:</span>
                          <span className="ml-2 text-gray-900 font-medium">{files.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Medical Files</h3>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="processing">Processing</option>
                      <option value="pending">Pending</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>

                {/* Files */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading files...</div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No files found</p>
                    </div>
                  ) : (
                    filteredFiles.map((file) => (
                      <div
                        key={file._id}
                        className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-br from-gray-50 to-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-blue-50">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 mb-1">{file.fileName}</div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>{formatFileSize(file.fileSize)}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(file.uploadDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(file.status)}
                        </div>

                        {/* OCR Info */}
                        {file.status === 'completed' && file.ocrConfidence && (
                          <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-xs text-green-700 font-semibold mb-1">
                              OCR Completed - {file.ocrConfidence}% Confidence
                            </div>
                            {file.ocrText && (
                              <div className="text-xs text-green-600 line-clamp-2">{file.ocrText}</div>
                            )}
                          </div>
                        )}

                        {/* Uploaded By */}
                        <div className="text-xs text-gray-500 mb-3">
                          Uploaded by {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewFile(file)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-all text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View File
                          </button>

                          {file.status === 'completed' && file.ocrText && (
                            <button
                              onClick={() => handleViewOCRText(file)}
                              className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition-all text-sm font-medium"
                            >
                              <FileText className="w-4 h-4" />
                              View OCR Text
                            </button>
                          )}

                          <a
                            href={file.fileUrl}
                            download
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <User className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Select a patient to view their files</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
