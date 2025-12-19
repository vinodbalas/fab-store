import { useState, useEffect } from 'react';
import { Activity, Phone, MessageSquare, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CCASConnectionPanel({ provider = 'freeswitch' }) {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [uptime, setUptime] = useState(0);
  const [stats, setStats] = useState({
    activeCalls: 0,
    queuedMessages: 0,
    throughput: 0,
    latency: 12
  });

  // Simulate real-time stats
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
      setStats(prev => ({
        ...prev,
        throughput: Math.floor(Math.random() * 50) + 150,
        latency: Math.floor(Math.random() * 10) + 8
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const providers = {
    freeswitch: {
      name: 'FreeSWITCH',
      logo: '🔷',
      endpoint: 'sip.yourcompany.com:5060',
      version: 'v1.10.7',
      protocol: 'SIP/WebRTC'
    },
    asterisk: {
      name: 'Asterisk',
      logo: '⭐',
      endpoint: 'pbx.yourcompany.com:5061',
      version: 'v20.1.0',
      protocol: 'SIP/IAX2'
    },
    twilio: {
      name: 'Twilio',
      logo: '📞',
      endpoint: 'api.twilio.com',
      version: 'API v2023-10-01',
      protocol: 'REST/WebSocket'
    }
  };

  const config = providers[provider];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-purple-300 rounded-lg shadow-lg overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#612D91] via-[#7B3FE4] to-[#8B5CF6] px-4 py-2.5 flex items-center justify-between border-b border-purple-400">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="w-3.5 h-3.5 text-white" />
          </motion.div>
          <div>
            <div className="text-white font-bold text-sm">{config.name} CCAS</div>
            <div className="text-purple-200 text-[10px] font-medium">{config.version}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Connected
          </motion.div>
        </div>
      </div>

      {/* Connection Summary */}
      <div className="px-3 py-2.5 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-b border-purple-200">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-purple-700 font-semibold">Endpoint:</span>
            <div className="font-mono font-bold text-gray-900 text-[10px]">{config.endpoint}</div>
          </div>
          <div>
            <span className="text-purple-700 font-semibold">Uptime:</span>
            <div className="font-mono font-bold text-green-700">
              {Math.floor(uptime / 3600)}h {Math.floor((uptime % 3600) / 60)}m
            </div>
          </div>
          <div className="text-right">
            <span className="text-purple-700 font-semibold">Region:</span>
            <div className="font-mono font-bold text-gray-900">US-West-2</div>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="p-3 bg-white">
        <div className="grid grid-cols-4 gap-2">
          <motion.div 
            className="text-center p-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-blue-200 shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-blue-700">{stats.activeCalls}</div>
            <div className="text-[10px] text-gray-700 mt-0.5 font-bold">Active</div>
          </motion.div>
          <motion.div 
            className="text-center p-2 bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg border-2 border-purple-200 shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-purple-700">{stats.queuedMessages}</div>
            <div className="text-[10px] text-gray-700 mt-0.5 font-bold">Queue</div>
          </motion.div>
          <motion.div 
            className="text-center p-2 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg border-2 border-amber-200 shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-amber-700">{stats.throughput}</div>
            <div className="text-[10px] text-gray-700 mt-0.5 font-bold">Msg/s</div>
          </motion.div>
          <motion.div 
            className="text-center p-2 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border-2 border-green-200 shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-green-700">{stats.latency}ms</div>
            <div className="text-[10px] text-gray-700 mt-0.5 font-bold">Latency</div>
          </motion.div>
        </div>
      </div>

      {/* Channel Status */}
      <div className="px-3 pb-3 flex-1">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-2.5 h-full">
          <div className="text-xs font-bold text-purple-900 mb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            Channel Status
          </div>
          <div className="space-y-1.5">
            <motion.div 
              className="flex items-center justify-between text-xs bg-white border-2 border-green-200 rounded-lg px-2.5 py-2 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="font-bold text-gray-900">Voice (SIP)</span>
              </div>
              <span className="text-green-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active
              </span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-between text-xs bg-white border-2 border-green-200 rounded-lg px-2.5 py-2 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span className="font-bold text-gray-900">SMS/WhatsApp</span>
              </div>
              <span className="text-green-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active
              </span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-between text-xs bg-white border-2 border-green-200 rounded-lg px-2.5 py-2 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-600" />
                <span className="font-bold text-gray-900">WebSocket</span>
              </div>
              <span className="text-green-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

