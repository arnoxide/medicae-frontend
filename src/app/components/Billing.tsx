import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, Search, FileText, Download, Send, User, Calendar, CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';
type PaymentMethod = 'cash' | 'card' | 'insurance' | 'transfer';

interface Invoice {
  id: string;
  patientName: string;
  patientId: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  dueDate?: string;
  services: ServiceItem[];
  paymentMethod?: PaymentMethod;
  insuranceClaim?: string;
  notes?: string;
}

interface ServiceItem {
  id: string;
  description: string;
  code?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function Billing() {
  const navigate = useNavigate();
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const invoices: Invoice[] = [
    {
      id: 'INV-2025-001',
      patientName: 'Sarah Johnson',
      patientId: 'MED1001',
      amount: 350.00,
      status: 'paid',
      date: '2025-12-29',
      paymentMethod: 'card',
      services: [
        { id: '1', description: 'General Consultation', code: 'CPT-99213', quantity: 1, unitPrice: 150.00, total: 150.00 },
        { id: '2', description: 'Blood Test - Complete Blood Count', code: 'CPT-85025', quantity: 1, unitPrice: 200.00, total: 200.00 }
      ]
    },
    {
      id: 'INV-2025-002',
      patientName: 'Michael Chen',
      patientId: 'MED1002',
      amount: 1250.00,
      status: 'pending',
      date: '2025-12-28',
      dueDate: '2026-01-12',
      insuranceClaim: 'CLM-2025-456',
      services: [
        { id: '1', description: 'Specialist Consultation', code: 'CPT-99214', quantity: 1, unitPrice: 250.00, total: 250.00 },
        { id: '2', description: 'ECG', code: 'CPT-93000', quantity: 1, unitPrice: 300.00, total: 300.00 },
        { id: '3', description: 'Lipid Panel', code: 'CPT-80061', quantity: 1, unitPrice: 700.00, total: 700.00 }
      ]
    },
    {
      id: 'INV-2025-003',
      patientName: 'Emma Williams',
      patientId: 'MED1003',
      amount: 480.00,
      status: 'overdue',
      date: '2025-12-15',
      dueDate: '2025-12-30',
      services: [
        { id: '1', description: 'Follow-up Visit', code: 'CPT-99213', quantity: 1, unitPrice: 150.00, total: 150.00 },
        { id: '2', description: 'X-Ray - Chest', code: 'CPT-71046', quantity: 1, unitPrice: 330.00, total: 330.00 }
      ],
      notes: 'Payment reminder sent'
    },
    {
      id: 'INV-2025-004',
      patientName: 'James Brown',
      patientId: 'MED1004',
      amount: 175.00,
      status: 'paid',
      date: '2025-12-27',
      paymentMethod: 'cash',
      services: [
        { id: '1', description: 'Routine Check-up', code: 'CPT-99213', quantity: 1, unitPrice: 175.00, total: 175.00 }
      ]
    },
    {
      id: 'INV-2025-005',
      patientName: 'Lisa Anderson',
      patientId: 'MED1005',
      amount: 0,
      status: 'draft',
      date: '2025-12-29',
      services: [
        { id: '1', description: 'New Patient Consultation', code: 'CPT-99204', quantity: 1, unitPrice: 300.00, total: 300.00 }
      ]
    },
  ];

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'overdue': return <AlertCircle className="w-3 h-3" />;
      case 'draft': return <FileText className="w-3 h-3" />;
    }
  };

  const stats = {
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
    invoiceCount: invoices.length,
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
              <h1 className="text-3xl font-bold text-gray-900">Billing & Invoicing</h1>
              <p className="text-gray-600 mt-1">Manage payments and financial records</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewInvoice(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            <span>New Invoice</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pending</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-600">${stats.pending.toFixed(2)}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Overdue</span>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">${stats.overdue.toFixed(2)}</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Invoices</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.invoiceCount}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 bg-white shadow-sm"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | 'all')}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium focus:outline-none focus:border-blue-600 bg-white shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Invoices ({filteredInvoices.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-6 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex items-start gap-6">
                  {/* Invoice Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{invoice.id}</h3>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(invoice.status)} flex items-center gap-1 uppercase`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Patient</span>
                        </div>
                        <p className="text-gray-900 font-semibold ml-6">{invoice.patientName}</p>
                        <p className="text-sm text-gray-500 ml-6">{invoice.patientId}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Date</span>
                        </div>
                        <p className="text-gray-900 ml-6">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                        {invoice.dueDate && (
                          <p className="text-sm text-gray-500 ml-6">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">Amount</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 ml-6">
                          ${invoice.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-50/30 rounded-xl border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Services</p>
                      <div className="space-y-2">
                        {invoice.services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <span className="text-gray-900 font-medium">{service.description}</span>
                              {service.code && (
                                <span className="text-gray-500 ml-2">({service.code})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                              <span>Qty: {service.quantity}</span>
                              <span>×</span>
                              <span>${service.unitPrice.toFixed(2)}</span>
                              <span>=</span>
                              <span className="font-semibold text-gray-900 min-w-[80px] text-right">
                                ${service.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {invoice.paymentMethod && (
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span>Payment: <span className="font-medium text-gray-900 capitalize">{invoice.paymentMethod}</span></span>
                      </div>
                    )}

                    {invoice.insuranceClaim && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Insurance Claim:</span> {invoice.insuranceClaim}
                        </p>
                      </div>
                    )}

                    {invoice.notes && (
                      <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-900">
                          <span className="font-semibold">Note:</span> {invoice.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 text-sm whitespace-nowrap flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    {invoice.status === 'draft' && (
                      <button className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200 text-sm whitespace-nowrap flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Invoice
                      </button>
                    )}
                    {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                      <button className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200 text-sm whitespace-nowrap">
                        Mark as Paid
                      </button>
                    )}
                    {invoice.status === 'overdue' && (
                      <button className="px-4 py-2 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200 text-sm whitespace-nowrap">
                        Send Reminder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Invoice Modal - Simple placeholder */}
        {showNewInvoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Invoice</h2>
                  <p className="text-sm text-gray-600 mt-1">Generate invoice for patient services</p>
                </div>
                <button
                  onClick={() => setShowNewInvoice(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-500 rotate-45" />
                </button>
              </div>

              <div className="p-6 space-y-6">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                  <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                    + Add Service Item
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Additional notes or payment terms..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowNewInvoice(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-6 py-3 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed">
                  Save as Draft
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30">
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
