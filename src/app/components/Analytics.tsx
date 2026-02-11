import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Calendar, DollarSign, Activity, FileText, Clock, BarChart3 } from 'lucide-react';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
}

export default function Analytics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const metrics: Metric[] = [
    {
      label: 'Total Patients',
      value: 1248,
      change: 12.5,
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'blue'
    },
    {
      label: 'Appointments',
      value: 324,
      change: 8.2,
      trend: 'up',
      icon: <Calendar className="w-6 h-6" />,
      color: 'purple'
    },
    {
      label: 'Revenue',
      value: '$45,230',
      change: 15.3,
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green'
    },
    {
      label: 'Avg Wait Time',
      value: '12 min',
      change: -5.4,
      trend: 'down',
      icon: <Clock className="w-6 h-6" />,
      color: 'amber'
    },
  ];

  const patientDemographics: ChartData[] = [
    { label: '0-18', value: 180 },
    { label: '19-35', value: 420 },
    { label: '36-50', value: 350 },
    { label: '51-65', value: 220 },
    { label: '65+', value: 78 },
  ];

  const appointmentTypes: ChartData[] = [
    { label: 'Check-up', value: 145 },
    { label: 'Follow-up', value: 98 },
    { label: 'Consultation', value: 52 },
    { label: 'Emergency', value: 29 },
  ];

  const monthlyRevenue: ChartData[] = [
    { label: 'Jul', value: 38500 },
    { label: 'Aug', value: 42100 },
    { label: 'Sep', value: 39800 },
    { label: 'Oct', value: 44300 },
    { label: 'Nov', value: 41900 },
    { label: 'Dec', value: 45230 },
  ];

  const topDiagnoses = [
    { name: 'Hypertension', count: 142, percentage: 28 },
    { name: 'Type 2 Diabetes', count: 98, percentage: 19 },
    { name: 'Respiratory Infection', count: 87, percentage: 17 },
    { name: 'Allergies', count: 76, percentage: 15 },
    { name: 'Back Pain', count: 54, percentage: 11 },
  ];

  const performanceMetrics = [
    { metric: 'Patient Satisfaction', score: 4.8, max: 5, color: 'green' },
    { metric: 'Appointment Adherence', score: 92, max: 100, color: 'blue' },
    { metric: 'Average Visit Duration', score: 18, max: 30, color: 'purple', unit: 'min' },
    { metric: 'Prescription Compliance', score: 87, max: 100, color: 'amber' },
  ];

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'from-blue-600 to-blue-700',
      purple: 'from-purple-600 to-purple-700',
      green: 'from-green-600 to-green-700',
      amber: 'from-amber-600 to-amber-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBarColor = (color: string) => {
    const colors = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
      green: 'bg-gradient-to-r from-green-500 to-green-600',
      amber: 'bg-gradient-to-r from-amber-500 to-amber-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const maxRevenue = Math.max(...monthlyRevenue.map(d => d.value));
  const maxDemographic = Math.max(...patientDemographics.map(d => d.value));

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
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Performance metrics and insights</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 bg-white p-2 rounded-xl shadow-md border border-gray-100">
            {(['week', 'month', 'quarter', 'year'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                  timeRange === range
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getMetricColor(metric.color)} bg-opacity-10`}>
                  <div className={`text-${metric.color}-600`}>
                    {metric.icon}
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
              <div className="flex items-center gap-1">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                )}
                <span className="text-sm font-semibold text-green-600">
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-sm text-gray-500">vs last {timeRange}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {monthlyRevenue.map((data, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-12">{data.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${(data.value / maxRevenue) * 100}%` }}
                    >
                      <span className="text-sm font-semibold text-white">
                        ${(data.value / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Demographics */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Patient Demographics</h2>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {patientDemographics.map((data, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-16">{data.label} yrs</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${(data.value / maxDemographic) * 100}%` }}
                    >
                      <span className="text-sm font-semibold text-white">{data.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-2 gap-6">
          {/* Appointment Types */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Types</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {appointmentTypes.map((data, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-50/30 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{data.label}</span>
                    <span className="text-lg font-bold text-purple-600">{data.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${(data.value / 324) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Diagnoses */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Diagnoses</h2>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {topDiagnoses.map((diagnosis, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{diagnosis.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">{diagnosis.count}</span>
                        <span className="text-xs font-medium text-gray-500">({diagnosis.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                        style={{ width: `${diagnosis.percentage * 3.57}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-4 gap-6">
            {performanceMetrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-3">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - metric.score / metric.max)}`}
                        className={`text-${metric.color}-600 transition-all duration-1000`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {metric.score}
                          {metric.unit || ''}
                        </div>
                        <div className="text-xs text-gray-500">/ {metric.max}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">{metric.metric}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(metric.color)} rounded-full transition-all duration-1000`}
                    style={{ width: `${(metric.score / metric.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
