import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, FileText, CheckCircle2, AlertCircle, User, Calendar, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface FileEntry {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  fileName: string;
  fileType: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  uploadDate: string;
  pageCount: number;
  fileSize: number;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface FileStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  error: number;
}

interface DuplicateFile {
  id: string;
  fileName: string;
  uploadDate: string;
  status: string;
  fileSize: number;
}

export default function MigrateFiles() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'queue'>('upload');
  const [uploadMethod, setUploadMethod] = useState<'scan' | 'photo' | 'batch'>('scan');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileQueue, setFileQueue] = useState<FileEntry[]>([]);
  const [duplicateModal, setDuplicateModal] = useState<{
    show: boolean;
    files: DuplicateFile[];
    pendingFile: File | null;
  }>({ show: false, files: [], pendingFile: null });
  const [stats, setStats] = useState<FileStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    error: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Search patients
  useEffect(() => {
    const searchPatients = async () => {
      if (patientSearch.length < 2) {
        setPatients([]);
        return;
      }

      try {
        setLoading(true);
        console.log('=== PATIENT SEARCH DEBUG ===');
        console.log('Search term:', patientSearch);

        const response = await api.get('/patients', {
          params: {
            search: patientSearch,
            limit: 5,
          },
        });

        console.log('Full response:', JSON.stringify(response.data, null, 2));
        console.log('Response.data.success:', response.data.success);
        console.log('Response.data.data:', response.data.data);

        if (response.data.success && response.data.data) {
          console.log('Type of response.data.data:', typeof response.data.data);
          console.log('Is Array?', Array.isArray(response.data.data));
          console.log('Has patients property?', 'patients' in response.data.data);

          const patientList = response.data.data.patients || [];
          console.log('Patient list:', patientList);
          console.log('Patient list length:', patientList.length);

          if (Array.isArray(patientList) && patientList.length > 0) {
            console.log('First patient:', patientList[0]);
          }

          setPatients(patientList);
          console.log('Patients state updated with', patientList.length, 'patients');
        } else {
          console.log('Response not successful or no data');
          setPatients([]);
        }
        console.log('=== END PATIENT SEARCH DEBUG ===');
      } catch (error: any) {
        console.error('=== PATIENT SEARCH ERROR ===');
        console.error('Error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast.error('Failed to search patients');
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [patientSearch]);

  // Fetch file stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch file queue
  useEffect(() => {
    if (activeTab === 'queue') {
      fetchFileQueue();
    }
  }, [activeTab]);

  // Auto-refresh queue when there are pending/processing files
  useEffect(() => {
    if (activeTab !== 'queue') return;

    // Check if there are any pending or processing files
    const hasActiveFiles = fileQueue.some(
      f => f.status === 'pending' || f.status === 'processing'
    );

    if (!hasActiveFiles) return;

    // Poll every 3 seconds when there are active files
    const pollInterval = setInterval(() => {
      fetchFileQueue();
      fetchStats();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [activeTab, fileQueue]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/files/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFileQueue = async () => {
    try {
      const response = await api.get('/files', {
        params: {
          page: 1,
          limit: 20,
        },
      });

      if (response.data.success) {
        setFileQueue(response.data.data.files || []);
      }
    } catch (error) {
      console.error('Error fetching file queue:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, 'bytes');
      setSelectedFile(file);
    }
  };

  const checkForDuplicates = async () => {
    if (!selectedPatient || !selectedFile) return;

    try {
      const response = await api.post('/files/check-duplicate', {
        patientId: selectedPatient._id,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });

      if (response.data.success && response.data.data.hasDuplicates) {
        // Show duplicate modal
        setDuplicateModal({
          show: true,
          files: response.data.data.files,
          pendingFile: selectedFile,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
  };

  const handleUpload = async (replaceFileId?: string) => {
    if (!selectedPatient) {
      toast.error('Please select a patient first');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    // Check for duplicates first (unless we're already replacing)
    if (!replaceFileId) {
      const hasDuplicates = await checkForDuplicates();
      if (hasDuplicates) {
        return; // Stop and show modal
      }
    }

    try {
      setUploading(true);
      console.log('Uploading file:', selectedFile.name);
      console.log('Patient:', selectedPatient.firstName, selectedPatient.lastName);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', selectedPatient._id);
      formData.append('fileType', uploadMethod);
      formData.append('ocrEnabled', 'true');

      if (replaceFileId) {
        formData.append('replaceFileId', replaceFileId);
      }

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(replaceFileId
          ? 'File replaced successfully! Processing...'
          : 'File uploaded successfully! Processing...'
        );

        // Close duplicate modal if open
        setDuplicateModal({ show: false, files: [], pendingFile: null });

        // Reset form
        setSelectedFile(null);
        setSelectedPatient(null);
        setPatientSearch('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Refresh stats
        fetchStats();

        // Switch to queue tab to show processing status
        setActiveTab('queue');
        fetchFileQueue();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDuplicateAction = (action: 'upload' | 'replace' | 'cancel', fileId?: string) => {
    if (action === 'cancel') {
      setDuplicateModal({ show: false, files: [], pendingFile: null });
      setUploading(false);
    } else if (action === 'upload') {
      setDuplicateModal({ show: false, files: [], pendingFile: null });
      handleUpload(); // Upload anyway
    } else if (action === 'replace' && fileId) {
      handleUpload(fileId); // Replace the selected file
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Digitize Records</h1>
              <p className="text-gray-600 mt-1">Convert paper files to digital patient records</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Files</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completed</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Processing</span>
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.processing}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pending</span>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md border border-gray-100">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Upload Files
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'queue'
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Processing Queue
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Patient Search */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <User className="w-5 h-5 inline mr-2 text-blue-600" />
                Select Patient
              </label>

              {selectedPatient ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      setPatientSearch('');
                    }}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search patient by name, email, or phone..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                  />
                  {loading && (
                    <div className="mt-3 text-center text-gray-600">
                      <Loader2 className="w-5 h-5 animate-spin inline" />
                    </div>
                  )}
                  {(() => {
                    console.log('=== DROPDOWN RENDER ===');
                    console.log('patients state:', patients);
                    console.log('patients.length:', patients.length);
                    console.log('patients.length > 0:', patients.length > 0);
                    return null;
                  })()}
                  {patients.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {patients.map((patient) => (
                        <button
                          key={patient._id}
                          onClick={() => {
                            setSelectedPatient(patient);
                            setPatients([]);
                          }}
                          className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-50/50 transition-all text-left"
                        >
                          <span className="text-gray-900 font-medium">
                            {patient.firstName} {patient.lastName}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            {patient.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Upload Method Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Upload Method</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setUploadMethod('scan')}
                  className={`group p-6 rounded-xl border-2 transition-all duration-200 ${
                    uploadMethod === 'scan'
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                    uploadMethod === 'scan' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
                  }`} />
                  <div className={`text-sm font-medium ${
                    uploadMethod === 'scan' ? 'text-blue-900' : 'text-gray-900'
                  }`}>Scanner</div>
                  <div className="text-xs text-gray-500 mt-1">High quality scan</div>
                </button>

                <button
                  onClick={() => setUploadMethod('photo')}
                  className={`group p-6 rounded-xl border-2 transition-all duration-200 ${
                    uploadMethod === 'photo'
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <Camera className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                    uploadMethod === 'photo' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
                  }`} />
                  <div className={`text-sm font-medium ${
                    uploadMethod === 'photo' ? 'text-blue-900' : 'text-gray-900'
                  }`}>Camera</div>
                  <div className="text-xs text-gray-500 mt-1">Quick capture</div>
                </button>

                <button
                  onClick={() => setUploadMethod('batch')}
                  className={`group p-6 rounded-xl border-2 transition-all duration-200 ${
                    uploadMethod === 'batch'
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <FileText className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                    uploadMethod === 'batch' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
                  }`} />
                  <div className={`text-sm font-medium ${
                    uploadMethod === 'batch' ? 'text-blue-900' : 'text-gray-900'
                  }`}>Document</div>
                  <div className="text-xs text-gray-500 mt-1">Upload files</div>
                </button>
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-900/5 border border-gray-100/50">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*,application/pdf"
                className="hidden"
              />

              <div
                onClick={openFileSelector}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to select file'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Supports images and PDF files (max 10MB)
                </p>

                {selectedFile && (
                  <div className="mb-4 text-sm text-gray-600">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}

                <div>
                  {/* Debug info */}
                  {(!selectedPatient || !selectedFile) && (
                    <div className="mb-2 text-sm text-red-600">
                      {!selectedPatient && <div>⚠️ Please select a patient first</div>}
                      {!selectedFile && <div>⚠️ Please select a file</div>}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Upload button clicked. Patient:', selectedPatient?.firstName, 'File:', selectedFile?.name);
                      handleUpload();
                    }}
                    disabled={!selectedPatient || !selectedFile || uploading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload File
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Processing Options */}
              <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Processing Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Auto-detect text (OCR)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Auto-rotate and enhance</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Processing Queue</h2>
              <button
                onClick={fetchFileQueue}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {fileQueue.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100/50">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files in queue</p>
              </div>
            ) : (
              fileQueue.map((file) => (
                <div
                  key={file._id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${
                        file.status === 'completed' ? 'bg-green-50' :
                        file.status === 'processing' ? 'bg-blue-50' :
                        file.status === 'error' ? 'bg-red-50' :
                        'bg-amber-50'
                      }`}>
                        {file.status === 'completed' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                        {file.status === 'processing' && <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />}
                        {file.status === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
                        {file.status === 'pending' && <FileText className="w-6 h-6 text-amber-600" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {file.patientId.firstName} {file.patientId.lastName}
                          </h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            file.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                            file.status === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            file.status === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {file.fileName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(file.uploadDate).toLocaleDateString()} at {new Date(file.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Duplicate File Modal */}
      {duplicateModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Duplicate Files Found</h2>
                </div>
                <button
                  onClick={() => handleDuplicateAction('cancel')}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-amber-50">
                Found {duplicateModal.files.length} similar file(s) for this patient. What would you like to do?
              </p>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Existing Files:</h3>
                <div className="space-y-2">
                  {duplicateModal.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-orange-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{file.fileName}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          file.status === 'completed' ? 'bg-green-100 text-green-800' :
                          file.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          file.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {file.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(file.uploadDate).toLocaleDateString()} at {new Date(file.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                      <button
                        onClick={() => handleDuplicateAction('replace', file.id)}
                        className="mt-3 w-full px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 border border-orange-200 transition-all text-sm font-medium"
                      >
                        Replace this file
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => handleDuplicateAction('cancel')}
                className="px-6 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDuplicateAction('upload')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md"
              >
                Upload Anyway (Keep Both)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
