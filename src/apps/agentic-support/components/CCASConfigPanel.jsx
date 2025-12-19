import { Shield, Server, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CCASConfigPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-2">
        <Server className="w-4 h-4 text-[#612D91]" />
        <h3 className="font-bold text-sm text-gray-900">CCAS Configuration</h3>
      </div>
      
      <div className="space-y-2 text-xs">
        {/* Account Credentials */}
        <div className="grid grid-cols-1 gap-1.5">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-2 border border-purple-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3 h-3 text-purple-600" />
              <span className="text-gray-700 font-semibold text-[11px]">Account SID</span>
            </div>
            <div className="font-mono font-bold text-purple-900 text-[10px] bg-white px-1.5 py-0.5 rounded">
              AC7e8f2a3b4c5d6e7f8a9b0c1d2e3f4g5h
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 text-blue-600" />
              <span className="text-gray-700 font-semibold text-[11px]">Application ID</span>
            </div>
            <div className="font-mono font-bold text-blue-900 text-[10px] bg-white px-1.5 py-0.5 rounded">
              AP1234567890abcdef1234567890abcdef
            </div>
          </div>
        </div>

        {/* Webhook Endpoints */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Globe className="w-3 h-3 text-green-600" />
            <span className="text-gray-700 font-semibold text-[11px]">Webhook Endpoints</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-white rounded px-1.5 py-1">
              <span className="text-gray-600 font-medium text-[10px]">Voice:</span>
              <span className="font-mono text-green-700 text-[9px]">api.yourco.com/voice</span>
            </div>
            <div className="flex items-center justify-between bg-white rounded px-1.5 py-1">
              <span className="text-gray-600 font-medium text-[10px]">SMS:</span>
              <span className="font-mono text-green-700 text-[9px]">api.yourco.com/sms</span>
            </div>
            <div className="flex items-center justify-between bg-white rounded px-1.5 py-1">
              <span className="text-gray-600 font-medium text-[10px]">Status:</span>
              <span className="font-mono text-green-700 text-[9px]">api.yourco.com/status</span>
            </div>
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-2">
          <div className="text-gray-700 mb-1 font-semibold text-[11px]">📞 Active Phone Numbers</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-white rounded px-1.5 py-1">
              <span className="text-gray-600 font-medium text-[10px]">US Support:</span>
              <span className="font-mono text-amber-700 font-bold text-[10px]">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-between bg-white rounded px-1.5 py-1">
              <span className="text-gray-600 font-medium text-[10px]">UK Support:</span>
              <span className="font-mono text-amber-700 font-bold text-[10px]">+44 20 7123 4567</span>
            </div>
            <div className="flex items-center justify-between bg-white rounded px-1.5 py-1">
              <span className="text-gray-600 font-medium text-[10px]">SMS Gateway:</span>
              <span className="font-mono text-amber-700 font-bold text-[10px]">+1 (555) 999-0000</span>
            </div>
          </div>
        </div>

        {/* Infrastructure Status */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-2 py-1 border border-green-200">
            <span className="text-gray-700 font-medium">Auto-scaling:</span>
            <span className="text-green-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg px-2 py-1 border border-blue-200">
            <span className="text-gray-700 font-medium">Failover:</span>
            <span className="text-blue-700 font-bold">US-East-1</span>
          </div>
          <div className="flex items-center justify-between text-[10px] bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-2 py-1 border border-purple-200">
            <span className="text-gray-700 font-medium">Load Balancing:</span>
            <span className="text-purple-700 font-bold">Round Robin</span>
          </div>
        </div>

        {/* Security */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield className="w-3 h-3 text-red-600" />
            <span className="text-gray-700 font-semibold text-[11px]">Security</span>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] bg-white rounded px-1.5 py-0.5">
              <span className="text-gray-600">TLS Encryption:</span>
              <span className="text-green-700 font-bold">TLS 1.3</span>
            </div>
            <div className="flex items-center justify-between text-[9px] bg-white rounded px-1.5 py-0.5">
              <span className="text-gray-600">Webhook Auth:</span>
              <span className="text-green-700 font-bold">HMAC-SHA256</span>
            </div>
            <div className="flex items-center justify-between text-[9px] bg-white rounded px-1.5 py-0.5">
              <span className="text-gray-600">Rate Limiting:</span>
              <span className="text-green-700 font-bold">1000/min</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

