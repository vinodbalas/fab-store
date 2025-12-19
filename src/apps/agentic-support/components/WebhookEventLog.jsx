import { useState, useEffect } from 'react';
import { Activity, ArrowRight, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebhookEventLog({ onEventTrigger, autoStart = false }) {
  const [events, setEvents] = useState([]);
  const [isStreaming, setIsStreaming] = useState(autoStart);

  const addEvent = (event) => {
    setEvents(prev => [event, ...prev].slice(0, 25));
    
    // Notify parent component for triggering demo interactions
    if (onEventTrigger) {
      onEventTrigger(event);
    }
  };

  // Simulate realistic webhook events
  useEffect(() => {
    if (!isStreaming) return;

    const eventTypes = [
      { type: 'call.initiated', source: 'SIP', status: 200, color: 'blue' },
      { type: 'call.ringing', source: 'SIP', status: 200, color: 'yellow' },
      { type: 'call.answered', source: 'SIP', status: 200, color: 'green' },
      { type: 'call.completed', source: 'SIP', status: 200, color: 'green' },
      { type: 'sms.received', source: 'SMPP', status: 200, color: 'blue' },
      { type: 'sms.delivered', source: 'HTTP', status: 200, color: 'green' },
      { type: 'message.queued', source: 'HTTP', status: 202, color: 'yellow' },
      { type: 'stream.connected', source: 'WebSocket', status: 101, color: 'purple' },
      { type: 'transcription.partial', source: 'STT', status: 200, color: 'cyan' },
      { type: 'transcription.final', source: 'STT', status: 200, color: 'green' }
    ];

    const interval = setInterval(() => {
      const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      addEvent({
        ...event,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 50) + 10,
        from: `+1555${Math.floor(Math.random() * 9000000) + 1000000}`
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const getStatusColor = (status) => {
    if (status === 200) return 'text-green-400';
    if (status === 101) return 'text-blue-400';
    if (status === 202) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-sm">Live Webhook Events</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400 font-mono">
            {events.length} events
          </div>
          <motion.div 
            className="flex items-center gap-1.5 text-green-400 text-xs font-semibold"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Streaming</span>
          </motion.div>
        </div>
      </div>

      <div className="h-[200px] overflow-y-auto bg-gray-950 p-2 font-mono text-[10px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <AnimatePresence mode="popLayout">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="mb-2 flex items-start gap-2 text-gray-300 hover:bg-gray-900/50 px-2 py-1 rounded transition-colors"
            >
              <span className="text-gray-500 flex-shrink-0 text-[10px]">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
              <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
              <span className={`flex-shrink-0 font-bold ${getStatusColor(event.status)}`}>
                [{event.status}]
              </span>
              <span className="text-cyan-300 font-semibold">{event.type}</span>
              <span className="text-gray-600">from</span>
              <span className="text-purple-400">{event.from}</span>
              <span className="text-gray-700">via</span>
              <span className="text-orange-400">{event.source}</span>
              <span className="text-gray-600 ml-auto flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                {event.duration}ms
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {events.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p className="text-xs">Waiting for webhook events...</p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between text-xs">
        <span className="text-gray-400 font-mono">WebSocket: wss://ccas.yourcompany.com/events</span>
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`px-2 py-1 rounded font-semibold transition-all ${
            isStreaming 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          {isStreaming ? 'Pause' : 'Resume'}
        </button>
      </div>
    </motion.div>
  );
}

