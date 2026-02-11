import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, AlertCircle, Bell, CheckCircle, X, User, Calendar, Filter, TrendingUp } from 'lucide-react';

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type AlertCategory = 'clinical' | 'medication' | 'lab' | 'vitals' | 'allergy' | 'system';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface Alert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  patientName?: string;
  patientId?: string;
  timestamp: string;
  status: AlertStatus;
  actionRequired: boolean;
  relatedData?: {
    value: string;
    threshold: string;
    trend?: string;
  };
}

export default function SmartAlerts() {
  const navigate = useNavigate();
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<AlertCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('active');

  const alerts: Alert[] = [
    {
      id: 'ALR001',
      severity: 'critical',
      category: 'vitals',
      title: 'Critical Blood Pressure Reading',
      message: 'Patient blood pressure dangerously high at 180/110 mmHg',
      patientName: 'Sarah Johnson',
      patientId: 'MED1001',
      timestamp: '5 min ago',
      status: 'active',
      actionRequired: true,
      relatedData: {
        value: '180/110 mmHg',
        threshold: '< 140/90 mmHg',
        trend: 'increasing'
      }
    },
    {
      id: 'ALR002',
      severity: 'high',
      category: 'medication',
      title: 'Drug Interaction Warning',
      message: 'Potential interaction between Warfarin and new prescription',
      patientName: 'Michael Chen',
      patientId: 'MED1002',
      timestamp: '12 min ago',
      status: 'active',
      actionRequired: true
    },
    {
      id: 'ALR003',
      severity: 'high',
      category: 'lab',
      title: 'Abnormal Lab Results',
      message: 'Creatinine levels elevated - possible kidney function issue',
      patientName: 'Emma Williams',
      patientId: 'MED1003',
      timestamp: '25 min ago',
      status: 'acknowledged',
      actionRequired: true,
      relatedData: {
        value: '2.5 mg/dL',
        threshold: '0.7-1.3 mg/dL',
        trend: 'stable'
      }
    },
    {
      id: 'ALR004',
      severity: 'medium',
      category: 'allergy',
      title: 'Allergy Alert',
      message: 'Patient has documented penicillin allergy',
      patientName: 'James Brown',
      patientId: 'MED1004',
      timestamp: '1 hour ago',
      status: 'acknowledged',
      actionRequired: false
    },
    {
      id: 'ALR005',
      severity: 'critical',
      category: 'clinical',
      title: 'Sepsis Risk Alert',
      message: 'Early warning score indicates potential sepsis development',
      patientName: 'Lisa Anderson',
      patientId: 'MED1005',
      timestamp: '15 min ago',
      status: 'active',
      actionRequired: true,
      relatedData: {
        value: 'EWS: 7',
        threshold: 'EWS: < 5',
        trend: 'increasing'
      }
    },
    {
      id: 'ALR006',
      severity: 'low',
      category: 'system',
      title: 'Appointment Reminder',
      message: 'Patient due for annual checkup',
      patientName: 'David Martinez',
      patientId: 'MED1006',
      timestamp: '2 hours ago',
      status: 'active',
      actionRequired: false
    },
    {
      id: 'ALR007',
      severity: 'info',
      category: 'lab',
      title: 'Lab Results Available',
      message: 'Complete blood count results ready for review',
      patientName: 'Michael Chen',
      patientId: 'MED1002',
      timestamp: '3 hours ago',
      status: 'resolved',
      actionRequired: false
    },
  ];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesCategory = filterCategory === 'all' || alert.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchesSeverity && matchesCategory && matchesStatus;
  });

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'info': return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'low':
      case 'info':
        return <Bell className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'active': return <AlertCircle className="w-3 h-3 text-red-600 animate-pulse" />;
      case 'acknowledged': return <CheckCircle className="w-3 h-3 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-3 h-3 text-green-600" />;
    }
  };

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
    active: alerts.filter(a => a.status === 'active').length,
    actionRequired: alerts.filter(a => a.actionRequired && a.status === 'active').length,
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
              <h1 className="text-3xl font-bold text-gray-900">Smart Alerts Dashboard</h1>
              <p className="text-gray-600 mt-1">Clinical warnings and intelligent notifications</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Alerts</span>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-red-100/50 bg-gradient-to-br from-red-50/30 to-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-600">Critical</span>
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Active</span>
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Action Required</span>
              <CheckCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.actionRequired}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AlertStatus | 'all')}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium focus:outline-none focus:border-blue-600 bg-white shadow-sm text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium focus:outline-none focus:border-blue-600 bg-white shadow-sm text-sm"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as AlertCategory | 'all')}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium focus:outline-none focus:border-blue-600 bg-white shadow-sm text-sm"
          >
            <option value="all">All Categories</option>
            <option value="clinical">Clinical</option>
            <option value="medication">Medication</option>
            <option value="lab">Lab Results</option>
            <option value="vitals">Vitals</option>
            <option value="allergy">Allergy</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl shadow-lg border-l-4 overflow-hidden transition-all hover:shadow-xl ${
                alert.severity === 'critical' ? 'border-l-red-600' :
                alert.severity === 'high' ? 'border-l-orange-600' :
                alert.severity === 'medium' ? 'border-l-amber-600' :
                alert.severity === 'low' ? 'border-l-blue-600' :
                'border-l-gray-400'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Severity Icon */}
                  <div className={`p-3 rounded-xl border ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getSeverityColor(alert.severity)} uppercase flex items-center gap-1`}>
                            {alert.severity}
                          </span>
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 capitalize flex items-center gap-1">
                            {getStatusIcon(alert.status)}
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>

                    {alert.patientName && (
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium text-gray-900">{alert.patientName}</span>
                          <span className="text-gray-500">({alert.patientId})</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{alert.timestamp}</span>
                        </div>
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                          {alert.category}
                        </span>
                      </div>
                    )}

                    {alert.relatedData && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-50/30 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Current Value</p>
                            <p className="text-lg font-bold text-gray-900">{alert.relatedData.value}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Normal Range</p>
                            <p className="text-sm font-semibold text-gray-700">{alert.relatedData.threshold}</p>
                          </div>
                          {alert.relatedData.trend && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Trend</p>
                              <div className="flex items-center gap-2">
                                <TrendingUp className={`w-4 h-4 ${
                                  alert.relatedData.trend === 'increasing' ? 'text-red-600' : 'text-gray-400'
                                }`} />
                                <p className="text-sm font-semibold text-gray-700 capitalize">{alert.relatedData.trend}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {alert.status === 'active' && (
                      <>
                        <button className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 text-sm whitespace-nowrap">
                          View Patient
                        </button>
                        <button className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200 text-sm whitespace-nowrap">
                          Acknowledge
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button className="px-4 py-2 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 text-sm whitespace-nowrap">
                        Mark Resolved
                      </button>
                    )}
                    <button className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200 text-sm whitespace-nowrap">
                      Dismiss
                    </button>
                  </div>
                </div>

                {alert.actionRequired && alert.status === 'active' && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <p className="text-sm font-semibold text-amber-900">Immediate action required</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100/50 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Alerts Found</h3>
            <p className="text-gray-600">No alerts match your current filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
