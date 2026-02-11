import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

interface QueuedPatient {
  _id: string;
  queueNumber: number;
  status: string;
  type: string;
  isWalkIn: boolean;
  patientId: {
    firstName: string;
    lastName: string;
  };
}

export default function QueueDisplayBoard() {
  const [queue, setQueue] = useState<QueuedPatient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<QueuedPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 5 seconds for TV display
    const queueInterval = setInterval(fetchQueue, 5000);

    // Update clock every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(queueInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchQueue = async () => {
    try {
      // You might want to modify this to fetch queue for all doctors or specific doctor
      // For now, we'll use a generic queue endpoint
      const response = await api.get('/appointments/queue');
      if (response.data.success) {
        const queueData = response.data.data || [];
        setQueue(queueData.filter((p: QueuedPatient) => p.status === 'in-queue'));
        setCurrentPatient(queueData.find((p: QueuedPatient) => p.status === 'in-progress') || null);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-6xl font-bold mb-2">Patient Queue</h1>
            <p className="text-2xl text-blue-200">Please wait for your number to be called</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-2">{formatTime(currentTime)}</div>
            <div className="text-xl text-blue-200">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-16 h-16 animate-spin text-blue-300" />
        </div>
      ) : (
        <>
          {/* Now Serving Section */}
          <div className="mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border-2 border-white/20 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <UserCheck className="w-12 h-12 text-green-400" />
                <h2 className="text-4xl font-bold">NOW SERVING</h2>
              </div>

              {currentPatient ? (
                <div className="flex items-center justify-center gap-12">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl px-16 py-12 shadow-2xl">
                    <div className="text-center">
                      <p className="text-2xl mb-2 opacity-90">Ticket Number</p>
                      <p className="text-9xl font-bold">#{currentPatient.queueNumber}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-3xl opacity-80 mb-2">Patient</p>
                    <p className="text-5xl font-bold">
                      {currentPatient.patientId.firstName} {currentPatient.patientId.lastName}
                    </p>
                    {currentPatient.isWalkIn && (
                      <span className="inline-block mt-4 px-6 py-2 bg-purple-500/50 rounded-lg text-xl">
                        Walk-in
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-5xl font-bold text-white/50">—</p>
                  <p className="text-2xl text-white/50 mt-4">No patient currently being served</p>
                </div>
              )}
            </div>
          </div>

          {/* Waiting Queue Grid */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border-2 border-white/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <Users className="w-12 h-12 text-blue-400" />
              <h2 className="text-4xl font-bold">WAITING ({queue.length})</h2>
            </div>

            {queue.length > 0 ? (
              <div className="grid grid-cols-5 gap-6">
                {queue.slice(0, 15).map((patient, index) => (
                  <div
                    key={patient._id}
                    className={`rounded-2xl p-8 text-center shadow-xl transition-all ${
                      index === 0
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 scale-110 ring-4 ring-amber-300 animate-pulse'
                        : 'bg-white/20 backdrop-blur'
                    }`}
                  >
                    <div className="text-6xl font-bold mb-3">#{patient.queueNumber}</div>
                    <div className="text-lg opacity-90 truncate">
                      {patient.patientId.firstName} {patient.patientId.lastName.charAt(0)}.
                    </div>
                    {index === 0 && (
                      <div className="mt-3 text-sm font-bold bg-white/30 rounded-lg py-1">
                        NEXT
                      </div>
                    )}
                    {patient.isWalkIn && (
                      <div className="mt-2 text-xs bg-purple-500/50 rounded px-2 py-1">
                        Walk-in
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Clock className="w-24 h-24 mx-auto mb-6 text-white/30" />
                <p className="text-4xl font-bold text-white/50">No patients waiting</p>
                <p className="text-2xl text-white/40 mt-4">Queue is empty</p>
              </div>
            )}

            {queue.length > 15 && (
              <div className="mt-8 text-center">
                <p className="text-2xl text-blue-200">
                  + {queue.length - 15} more patient{queue.length - 15 !== 1 ? 's' : ''} waiting
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-6 py-3">
              <RefreshCw className="w-5 h-5 text-blue-300" />
              <span className="text-lg text-blue-200">Auto-refreshing every 5 seconds</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
