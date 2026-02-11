import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TestTube, Search, TrendingUp, TrendingDown, AlertTriangle, Check, FileText, Calendar, User } from 'lucide-react';

type TestStatus = 'pending' | 'completed' | 'critical';
type TrendDirection = 'up' | 'down' | 'stable';

interface LabResult {
  id: string;
  patientName: string;
  patientId: string;
  testName: string;
  category: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: TestStatus;
  trend: TrendDirection;
  dateOrdered: string;
  dateCompleted?: string;
  orderedBy: string;
  labName: string;
  notes?: string;
}

interface TestTrend {
  date: string;
  value: number;
}

export default function LabResults() {
  const navigate = useNavigate();
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabResult | null>(null);

  const labResults: LabResult[] = [
    {
      id: 'LAB001',
      patientName: 'Sarah Johnson',
      patientId: 'MED1001',
      testName: 'Hemoglobin A1C',
      category: 'Diabetes Monitoring',
      value: '6.8',
      unit: '%',
      referenceRange: '< 5.7',
      status: 'critical',
      trend: 'up',
      dateOrdered: '2025-12-25',
      dateCompleted: '2025-12-29',
      orderedBy: 'Dr. Smith',
      labName: 'HealthLab Diagnostics',
      notes: 'Patient shows elevated glucose levels, recommend follow-up'
    },
    {
      id: 'LAB002',
      patientName: 'Michael Chen',
      patientId: 'MED1002',
      testName: 'Complete Blood Count',
      category: 'Hematology',
      value: '14.2',
      unit: 'g/dL',
      referenceRange: '13.5-17.5',
      status: 'completed',
      trend: 'stable',
      dateOrdered: '2025-12-27',
      dateCompleted: '2025-12-29',
      orderedBy: 'Dr. Smith',
      labName: 'HealthLab Diagnostics'
    },
    {
      id: 'LAB003',
      patientName: 'Emma Williams',
      patientId: 'MED1003',
      testName: 'Lipid Panel',
      category: 'Cardiology',
      value: '185',
      unit: 'mg/dL',
      referenceRange: '< 200',
      status: 'completed',
      trend: 'down',
      dateOrdered: '2025-12-26',
      dateCompleted: '2025-12-28',
      orderedBy: 'Dr. Jones',
      labName: 'Premier Labs'
    },
    {
      id: 'LAB004',
      patientName: 'James Brown',
      patientId: 'MED1004',
      testName: 'Thyroid Panel',
      category: 'Endocrinology',
      value: '2.1',
      unit: 'mIU/L',
      referenceRange: '0.4-4.0',
      status: 'completed',
      trend: 'stable',
      dateOrdered: '2025-12-24',
      dateCompleted: '2025-12-27',
      orderedBy: 'Dr. Smith',
      labName: 'HealthLab Diagnostics'
    },
    {
      id: 'LAB005',
      patientName: 'Lisa Anderson',
      patientId: 'MED1005',
      testName: 'Liver Function Test',
      category: 'Hepatology',
      value: '32',
      unit: 'U/L',
      referenceRange: '7-56',
      status: 'pending',
      trend: 'stable',
      dateOrdered: '2025-12-29',
      orderedBy: 'Dr. Jones',
      labName: 'Premier Labs'
    },
  ];

  // Mock trend data for visualization
  const trendData: TestTrend[] = [
    { date: '2025-10-01', value: 6.2 },
    { date: '2025-11-01', value: 6.5 },
    { date: '2025-12-01', value: 6.8 },
  ];

  const filteredResults = labResults.filter(result => {
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'completed': return <Check className="w-3 h-3" />;
      case 'pending': return <TestTube className="w-3 h-3 animate-pulse" />;
      case 'critical': return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'stable': return <div className="w-4 h-0.5 bg-gray-400" />;
    }
  };

  const stats = {
    total: labResults.length,
    completed: labResults.filter(r => r.status === 'completed').length,
    pending: labResults.filter(r => r.status === 'pending').length,
    critical: labResults.filter(r => r.status === 'critical').length,
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
              <h1 className="text-3xl font-bold text-gray-900">Lab Results & Diagnostics</h1>
              <p className="text-gray-600 mt-1">Track test results and analyze trends</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            <span>Order Lab Test</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Tests</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completed</span>
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pending</span>
              <TestTube className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Critical</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, test, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 bg-white shadow-sm"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TestStatus | 'all')}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium focus:outline-none focus:border-blue-600 bg-white shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Lab Results ({filteredResults.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                onClick={() => setSelectedTest(result)}
                className="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-6">
                  {/* Test Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <TestTube className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{result.testName}</h3>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(result.status)} flex items-center gap-1`}>
                            {getStatusIcon(result.status)}
                            {result.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{result.category}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Patient</span>
                        </div>
                        <p className="text-gray-900 font-semibold ml-6">{result.patientName}</p>
                        <p className="text-sm text-gray-500 ml-6">{result.patientId}</p>
                      </div>

                      {result.dateCompleted && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Completed</span>
                          </div>
                          <p className="text-gray-900 ml-6">
                            {new Date(result.dateCompleted).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">Lab</span>
                        </div>
                        <p className="text-gray-900 ml-6">{result.labName}</p>
                      </div>
                    </div>

                    {result.status === 'completed' && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-50/30 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Result Value</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {result.value} <span className="text-base font-normal text-gray-600">{result.unit}</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Reference: {result.referenceRange} {result.unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Trend:</span>
                            {getTrendIcon(result.trend)}
                          </div>
                        </div>
                      </div>
                    )}

                    {result.notes && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-900 mb-1">Clinical Notes</p>
                            <p className="text-sm text-amber-800">{result.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span>Ordered by: <span className="font-medium text-gray-900">{result.orderedBy}</span></span>
                      <span>•</span>
                      <span className="font-medium text-blue-600">{result.id}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 text-sm whitespace-nowrap">
                      View Full Report
                    </button>
                    {result.status === 'completed' && (
                      <button className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200 text-sm whitespace-nowrap">
                        View Trends
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Lab Order Modal */}
        {showNewOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Lab Test</h2>
                  <p className="text-sm text-gray-600 mt-1">Request diagnostic testing for patient</p>
                </div>
                <button
                  onClick={() => setShowNewOrder(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-500 rotate-45" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search patient by name or ID"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Test Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Category</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm">
                    <option>Hematology</option>
                    <option>Chemistry</option>
                    <option>Cardiology</option>
                    <option>Endocrinology</option>
                    <option>Hepatology</option>
                    <option>Immunology</option>
                    <option>Microbiology</option>
                  </select>
                </div>

                {/* Common Tests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Test(s)</label>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-xl">
                    {['Complete Blood Count', 'Lipid Panel', 'Hemoglobin A1C', 'Liver Function Test', 'Thyroid Panel', 'Kidney Function Test', 'Vitamin D', 'Iron Studies'].map((test) => (
                      <label key={test} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm font-medium text-gray-900">{test}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm">
                    <option>Routine (2-3 days)</option>
                    <option>Urgent (24 hours)</option>
                    <option>STAT (Immediate)</option>
                  </select>
                </div>

                {/* Lab Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Laboratory</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm">
                    <option>HealthLab Diagnostics</option>
                    <option>Premier Labs</option>
                    <option>MediTest Center</option>
                    <option>Advanced Diagnostics</option>
                  </select>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Indication</label>
                  <textarea
                    rows={3}
                    placeholder="Reason for test, symptoms, or clinical notes..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowNewOrder(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30">
                  Submit Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trend Visualization Modal */}
        {selectedTest && selectedTest.status === 'completed' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Test Trends: {selectedTest.testName}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedTest.patientName} ({selectedTest.patientId})</p>
                </div>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-500 rotate-45" />
                </button>
              </div>

              <div className="p-6">
                {/* Simple Trend Chart Visualization */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-50/30 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Historical Values</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Reference Range:</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedTest.referenceRange} {selectedTest.unit}</span>
                    </div>
                  </div>

                  {/* Simple bar chart representation */}
                  <div className="space-y-4">
                    {trendData.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 w-24">
                          {new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-3"
                            style={{ width: `${(point.value / 10) * 100}%` }}
                          >
                            <span className="text-sm font-semibold text-white">{point.value}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Trend Analysis:</span> Values show an upward trend over the past 3 months.
                      Current value ({selectedTest.value}{selectedTest.unit}) is above the reference range.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
