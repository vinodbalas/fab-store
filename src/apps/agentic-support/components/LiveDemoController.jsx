import { useState, useEffect, useRef } from 'react';
import { Phone, MessageSquare, Mail, Radio, Mic, Play, Pause, RotateCcw, Sparkles, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_SCENARIOS = {
  voice: [
    {
      from: '+1 (555) 234-5678',
      customerName: 'Sarah Mitchell',
      transcript: 'Hi my office printer on floor 3 is offline and nothing is printing',
      duration: 8000,
      workflow: 'printer_offline'
    },
    {
      from: '+1 (555) 891-2345',
      customerName: 'David Chen',
      transcript: 'The printer keeps getting paper jam errors every time we try to print labels',
      duration: 9000,
      workflow: 'paper_jam'
    }
  ],
  sms: [
    {
      from: '+1 (555) 876-5432',
      customerName: 'John Smith',
      message: 'My printer says the cyan cartridge is not recognized even though its genuine',
      delay: 12000,
      workflow: 'ink_error'
    },
    {
      from: '+1 (555) 432-8765',
      customerName: 'Lisa Anderson',
      message: 'Low ink warning but I just replaced the cartridge yesterday',
      delay: 25000,
      workflow: 'ink_error'
    }
  ],
  whatsapp: [
    {
      from: '+1 (555) 123-9876',
      customerName: 'Michael Brown',
      message: 'The office printer is extremely slow when printing PDF documents from email',
      delay: 18000,
      workflow: 'slow_print'
    }
  ],
  chat: [
    {
      sessionId: 'WEB-001',
      customerName: 'Emily Davis',
      message: 'Help My home printer has streaks and smudges on every page I print',
      delay: 30000,
      workflow: 'print_quality'
    }
  ]
};

export default function LiveDemoController({ onInteractionCapture }) {
  const [demoMode, setDemoMode] = useState('auto');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  
  // For live voice mode
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechAPI, setHasSpeechAPI] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasSpeechAPI(!!SpeechRecognition);
  }, []);

  // Auto demo mode - simulates realistic scenarios
  useEffect(() => {
    if (!isPlaying || demoMode !== 'auto') return;

    let timeouts = [];

    // Voice call simulation
    const voiceScenario = DEMO_SCENARIOS.voice[scenarioIndex % DEMO_SCENARIOS.voice.length];
    timeouts.push(setTimeout(() => {
      startVoiceSimulation(voiceScenario);
    }, 2000));

    // SMS simulation
    const smsScenario = DEMO_SCENARIOS.sms[scenarioIndex % DEMO_SCENARIOS.sms.length];
    timeouts.push(setTimeout(() => {
      receiveMessage('sms', smsScenario);
    }, smsScenario.delay));

    // WhatsApp simulation
    if (scenarioIndex % 2 === 0 && DEMO_SCENARIOS.whatsapp.length > 0) {
      const whatsappScenario = DEMO_SCENARIOS.whatsapp[0];
      timeouts.push(setTimeout(() => {
        receiveMessage('whatsapp', whatsappScenario);
      }, whatsappScenario.delay));
    }

    // Loop scenarios
    timeouts.push(setTimeout(() => {
      setScenarioIndex(prev => prev + 1);
    }, 40000));

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isPlaying, demoMode, scenarioIndex]);

  // Timer for demo
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const startVoiceSimulation = (scenario) => {
    setCurrentChannel({
      type: 'voice',
      from: scenario.from,
      customerName: scenario.customerName,
      status: 'active'
    });

    // Simulate live transcription - word by word
    const words = scenario.transcript.split(' ');
    const msPerWord = scenario.duration / words.length;

    words.forEach((word, index) => {
      setTimeout(() => {
        setLiveTranscript(prev => {
          const updated = prev ? `${prev} ${word}` : word;
          
          // Feed to intent brain progressively
          if (updated.split(' ').length >= 4) {
            onInteractionCapture({
              channel: 'voice',
              text: updated,
              from: scenario.from,
              customerName: scenario.customerName,
              workflow: scenario.workflow,
              isLive: true
            });
          }
          
          return updated;
        });
      }, index * msPerWord);
    });

    // End call
    setTimeout(() => {
      setCurrentChannel(null);
      setLiveTranscript('');
    }, scenario.duration + 2000);
  };

  const receiveMessage = (channel, scenario) => {
    onInteractionCapture({
      channel,
      text: scenario.message,
      from: scenario.from,
      customerName: scenario.customerName,
      workflow: scenario.workflow
    });
  };

  // Live voice mode using Web Speech API
  const startLiveVoice = () => {
    if (!hasSpeechAPI) {
      alert('Web Speech API not supported in this browser. Use Chrome for live voice demo.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setCurrentChannel({
        type: 'voice',
        from: 'LIVE',
        customerName: 'Live Demo',
        status: 'active'
      });
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim();
      setLiveTranscript(fullTranscript);

      if (fullTranscript.split(' ').length >= 4) {
        onInteractionCapture({
          channel: 'voice',
          text: fullTranscript,
          from: 'LIVE',
          customerName: 'Live Demo',
          isLive: true
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setCurrentChannel(null);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopLiveVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setLiveTranscript('');
    setCurrentChannel(null);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setLiveTranscript('');
    setCurrentChannel(null);
    setScenarioIndex(0);
  };

  return (
    <div className="h-full flex flex-col">
      {/* AI-Powered Interaction Monitor */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden border-2 border-purple-300"
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#612D91] via-[#7B3FE4] to-[#8B5CF6] border-b border-purple-400">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </motion.div>
            <div>
              <div className="text-white font-bold text-sm">AI Interaction Hub</div>
              <div className="text-purple-200 text-xs font-medium">Multi-Channel Intelligence Stream</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              ACTIVE
            </motion.div>
            <div className="text-xs font-mono text-white bg-white/30 px-2.5 py-1 rounded-md backdrop-blur-sm font-bold">
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="px-3 py-2.5 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-b border-purple-200">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setDemoMode('auto')}
              className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                demoMode === 'auto'
                  ? 'bg-gradient-to-r from-[#612D91] to-[#7B3FE4] text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mx-auto mb-0.5" />
              AI Auto
            </button>
            <button
              onClick={() => setDemoMode('manual')}
              className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                demoMode === 'manual'
                  ? 'bg-gradient-to-r from-[#612D91] to-[#7B3FE4] text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 mx-auto mb-0.5" />
              Manual
            </button>
            <button
              onClick={() => setDemoMode('live-voice')}
              className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                demoMode === 'live-voice'
                  ? 'bg-gradient-to-r from-[#612D91] to-[#7B3FE4] text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
              }`}
            >
              <Mic className="w-3.5 h-3.5 mx-auto mb-0.5" />
              Live
            </button>
          </div>
        </div>

        {/* Controls and Active Channels */}
        <div className="px-3 py-2 flex-1 flex flex-col bg-gradient-to-b from-white via-purple-50/30 to-white min-h-0">
          {demoMode === 'auto' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#612D91] via-[#7B3FE4] to-[#8B5CF6] text-white rounded-lg font-bold hover:shadow-lg transition-all shadow-md text-xs"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause Flow' : 'Start AI Flow'}
                </button>
                <button
                  onClick={resetDemo}
                  className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg transition-all border-2 border-purple-200 hover:border-purple-300"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Active Channels Status */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-2">
                <div className="text-xs font-bold text-purple-900 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  AI-Monitored Channels
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5 bg-white rounded px-2 py-1 border border-purple-200">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[10px] font-semibold text-gray-700">Voice</span>
                    <span className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded px-2 py-1 border border-purple-200">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[10px] font-semibold text-gray-700">SMS</span>
                    <span className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded px-2 py-1 border border-purple-200">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[10px] font-semibold text-gray-700">WhatsApp</span>
                    <span className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded px-2 py-1 border border-purple-200">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[10px] font-semibold text-gray-700">Chat</span>
                    <span className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {demoMode === 'live-voice' && (
            <div className="flex items-center gap-2">
              <button
                onClick={isListening ? stopLiveVoice : startLiveVoice}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-md text-xs ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                    : 'bg-gradient-to-r from-[#612D91] via-[#7B3FE4] to-[#8B5CF6] text-white hover:shadow-lg'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                {isListening ? 'Stop Recording' : 'Start Speaking'}
              </button>
              {!hasSpeechAPI && (
                <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-md border border-red-200 font-semibold">
                  Chrome Required
                </span>
              )}
            </div>
          )}

          {demoMode === 'manual' && (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => startVoiceSimulation(DEMO_SCENARIOS.voice[0])}
                className="flex flex-col items-center gap-1 px-2 py-2 bg-white hover:bg-purple-50 text-gray-700 rounded-lg text-[9px] font-bold transition-all border-2 border-purple-200 hover:border-purple-300 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-[#612D91]" />
                Voice
              </button>
              <button
                onClick={() => receiveMessage('sms', DEMO_SCENARIOS.sms[0])}
                className="flex flex-col items-center gap-1 px-2 py-2 bg-white hover:bg-purple-50 text-gray-700 rounded-lg text-[9px] font-bold transition-all border-2 border-purple-200 hover:border-purple-300 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#612D91]" />
                SMS
              </button>
              <button
                onClick={() => receiveMessage('whatsapp', DEMO_SCENARIOS.whatsapp[0])}
                className="flex flex-col items-center gap-1 px-2 py-2 bg-white hover:bg-purple-50 text-gray-700 rounded-lg text-[10px] font-bold transition-all border-2 border-purple-200 hover:border-purple-300 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#612D91]" />
                WhatsApp
              </button>
              <button
                onClick={() => receiveMessage('chat', DEMO_SCENARIOS.chat[0])}
                className="flex flex-col items-center gap-1 px-2 py-2 bg-white hover:bg-purple-50 text-gray-700 rounded-lg text-[9px] font-bold transition-all border-2 border-purple-200 hover:border-purple-300 shadow-sm"
              >
                <Mail className="w-3.5 h-3.5 text-[#612D91]" />
                Chat
              </button>
            </div>
          )}

        </div>
      </motion.div>

      {/* Active Call Banner - Outside, Always Visible */}
      <AnimatePresence>
        {currentChannel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-2.5 text-white shadow-xl border-2 border-red-400"
          >
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="relative"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full">
                      <span className="absolute inset-0 bg-white rounded-full animate-ping" />
                    </span>
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-bold text-[10px]">
                      {currentChannel.type === 'voice' ? '📞 ACTIVE CALL' : `📱 ${currentChannel.type.toUpperCase()}`}
                    </div>
                    <div className="text-[9px] opacity-90 font-medium">
                      {currentChannel.customerName}
                    </div>
                  </div>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="px-2 py-0.5 bg-white/20 rounded text-[8px] font-bold backdrop-blur border border-white/30"
                  >
                    ⬤ LIVE
                  </motion.div>
                </div>

                {liveTranscript && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-black/30 backdrop-blur rounded mt-1.5 p-1.5 border border-white/20"
                  >
                    <div className="text-[8px] font-bold opacity-90 mb-0.5 flex items-center gap-1">
                      <Radio className="w-2 h-2 animate-pulse" />
                      TRANSCRIPTION
                    </div>
                    <div className="text-[10px] font-medium">
                      "{liveTranscript}"
                      <motion.span 
                        className="inline-block w-0.5 h-3 bg-white ml-1 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

