import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, QrCode, Search, ArrowLeft } from 'lucide-react';

export default function PatientLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scanMode, setScanMode] = useState<'fingerprint' | 'qr' | 'search'>('fingerprint');
  const navigate = useNavigate();

  const handlePatientFound = () => {
    navigate('/patient/1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/clinic')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-900/5 border border-gray-100/50">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Patient Lookup</h1>
          <p className="text-gray-600 mb-8">Identify patient using secure methods</p>

          {/* Method Selection */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setScanMode('fingerprint')}
              className={`group p-6 rounded-xl border-2 transition-all duration-200 ${
                scanMode === 'fingerprint'
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <Fingerprint className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                scanMode === 'fingerprint' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
              }`} />
              <div className={`text-sm font-medium ${
                scanMode === 'fingerprint' ? 'text-blue-900' : 'text-gray-900'
              }`}>Fingerprint</div>
            </button>

            <button
              onClick={() => setScanMode('qr')}
              className={`group p-6 rounded-xl border-2 transition-all duration-200 ${
                scanMode === 'qr'
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <QrCode className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                scanMode === 'qr' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
              }`} />
              <div className={`text-sm font-medium ${
                scanMode === 'qr' ? 'text-blue-900' : 'text-gray-900'
              }`}>QR Code</div>
            </button>

            <button
              onClick={() => setScanMode('search')}
              className={`group p-6 rounded-xl border-2 transition-all duration-200 ${
                scanMode === 'search'
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-600/10'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <Search className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                scanMode === 'search' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
              }`} />
              <div className={`text-sm font-medium ${
                scanMode === 'search' ? 'text-blue-900' : 'text-gray-900'
              }`}>Search</div>
            </button>
          </div>

          {/* Scan Interface */}
          {scanMode === 'fingerprint' && (
            <div className="py-12">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 relative shadow-xl shadow-blue-600/20">
                <Fingerprint className="w-24 h-24 text-blue-600" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 animate-ping opacity-20" />
              </div>
              <p className="text-center text-gray-700 font-medium mb-4">Place finger on scanner</p>
              <button
                onClick={handlePatientFound}
                className="w-full px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-medium rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
              >
                Simulate Scan
              </button>
            </div>
          )}

          {scanMode === 'qr' && (
            <div className="py-12">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <QrCode className="w-24 h-24 text-gray-500" />
              </div>
              <p className="text-center text-gray-700 font-medium mb-4">Scan patient QR code</p>
              <button
                onClick={handlePatientFound}
                className="w-full px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-medium rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
              >
                Simulate Scan
              </button>
            </div>
          )}

          {scanMode === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by name or ID</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter patient name or medical ID"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                />
              </div>

              {searchQuery && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-3">Search Results</div>
                  {['Sarah Johnson', 'Sarah Jones', 'Sarah Miller'].map((name, idx) => (
                    <button
                      key={idx}
                      onClick={handlePatientFound}
                      className="w-full p-4 rounded-xl border border-gray-200 hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-50/50 hover:shadow-md transition-all text-left group"
                    >
                      <div className="text-gray-900 font-semibold">{name}</div>
                      <div className="text-sm text-gray-600 mt-0.5 font-mono">ID: MED{1000 + idx}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600 text-center font-medium">
              Access logged • Identity verification required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
