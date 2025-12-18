import { useEffect, useMemo, useState } from "react";
import {
  Mic,
  MessageCircle,
  Sparkles,
  Activity,
  Store,
  Brain,
  Wand2,
  Headphones,
  User,
  Cpu,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Cloud,
  Loader2,
  Mail,
  Send,
  Phone,
  FileText,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import AgenticSupportDemo from "../../../components/AgenticSupportDemo";
import { searchKnowledgeBase, getCategoryForWorkflow } from "../services/knowledgeBase";
import { createTicket, getAvailableTicketingSystems, getTicketingConfig } from "../services/ticketingService";
import KnowledgeDocViewer from "./KnowledgeDocViewer";

const INTENT_CATALOG = [
  {
    id: "printer_offline",
    label: "Printer Offline on Floor 3",
    text: "Hi, my office printer on floor 3 is offline and nothing is printing.",
    workflow: "printer_offline",
    keywords: ["offline", "not printing", "network", "floor", "office", "printer"],
  },
  {
    id: "ink_error",
    label: "Genuine Ink Not Recognized",
    text: "My home printer says the cyan cartridge is not recognized even though it is genuine.",
    workflow: "ink_error",
    keywords: ["cartridge", "ink", "cyan", "not recognized", "genuine", "printer"],
  },
  {
    id: "slow_print",
    label: "Slow Printing – PDFs take forever",
    text: "The office printer is extremely slow when printing PDF documents from email.",
    planned: true,
    workflow: "printer_offline", // reuse network / spooler workflow for demo
    keywords: ["slow", "performance", "printing", "pdf", "printer"],
  },
  {
    id: "paper_jam",
    label: "Repeated Paper Jams",
    text: "The printer keeps getting paper jam errors every time we try to print labels.",
    planned: true,
    workflow: "printer_offline",
    keywords: ["paper jam", "jam", "labels", "stuck", "printer"],
  },
  {
    id: "wifi_issue",
    label: "Wi‑Fi / Network Issue",
    text: "My printer is not connecting to the Wi‑Fi network after we changed the router.",
    planned: true,
    workflow: "printer_offline",
    keywords: ["wifi", "wi-fi", "network", "connecting", "router", "printer"],
  },
  {
    id: "low_ink_warning",
    label: "Low Ink Warning (Planned)",
    text: "I keep getting low ink warnings even though we just changed all the cartridges.",
    planned: true,
    workflow: "ink_error",
    keywords: ["low ink", "ink low", "warning", "cartridge", "replaced"],
  },
  {
    id: "streaks_on_page",
    label: "Streaks / Smudges on Page (Planned)",
    text: "Printed pages have streaks and smudges even after running cleaning cycles.",
    planned: true,
    workflow: "ink_error",
    keywords: ["streak", "smudge", "lines", "dirty", "cleaning", "print quality"],
  },
];

function HeadsetIcon() {
  return (
    <span className="inline-flex items-center justify-center rounded-lg bg-[#111827]/40 p-1.5">
      <Headphones className="w-4 h-4 text-amber-200" />
    </span>
  );
}

function AvatarCircle({ icon, active, pulse = false }) {
  return (
    <motion.div
      className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
        active ? "bg-gradient-to-br from-[#612D91] to-[#A64AC9] text-white" : "bg-gray-100 text-gray-500"
      } transition-all duration-300`}
      animate={{ scale: active ? 1.1 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {icon}
      {active && pulse && (
        <motion.span
          className="absolute inset-0 rounded-full bg-[#612D91] opacity-75"
          animate={{ scale: [1, 1.5], opacity: [0.75, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.div>
  );
}

function StepChip({ label, step, status, icon }) {
  const isActive = status !== "waiting";
  const isRunning = status === "running";
  const isDone = status === "done";
  const isEscalated = status === "escalated";

  let bgColor = "bg-gray-100";
  let textColor = "text-gray-500";
  let ringColor = "ring-gray-300";
  let pulseClass = "";

  if (isRunning) {
    bgColor = "bg-amber-100";
    textColor = "text-amber-700";
    ringColor = "ring-amber-300";
    pulseClass = "animate-pulse";
  } else if (isDone) {
    bgColor = "bg-[#F5F3FF]";
    textColor = "text-[#612D91]";
    ringColor = "ring-[#612D91]/40";
  } else if (isEscalated) {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
    ringColor = "ring-red-300";
  }

  return (
    <motion.div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold ring-1 ${ringColor} ${bgColor} ${textColor} ${pulseClass}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: step * 0.1 }}
    >
      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white text-gray-700">
        {icon ? icon : step}
      </span>
      <span className="flex items-center gap-1">
        {icon && <span className="sr-only">{`Step ${step}`}</span>}
        <span>{label}</span>
      </span>
    </motion.div>
  );
}

export default function AgenticSupportConsole({ onNavigate }) {
  const [interactionText, setInteractionText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [channel, setChannel] = useState("voice"); // 'voice' | 'chat' | 'email' | 'telemetry'
  const [selectedWorkflow, setSelectedWorkflow] = useState("printer_offline");
  const [stage, setStage] = useState("idle"); // idle → capture → intent-detecting → intent-ready → knowledge-ready → telemetry → running → completed/escalated
  const [detectedDevice, setDetectedDevice] = useState(null); // null, 'laptop', 'printer', 'computer', 'phone'
  const [autoRunToken, setAutoRunToken] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [ticketConfirmed, setTicketConfirmed] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCopied, setTicketCopied] = useState(false);
  const [ticketCreating, setTicketCreating] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [selectedTicketingSystem, setSelectedTicketingSystem] = useState(() => {
    const config = getTicketingConfig();
    return config.system || "servicenow";
  });
  const availableSystems = getAvailableTicketingSystems();
  
  // Document viewer state
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docViewerPage, setDocViewerPage] = useState(1);

  // Email-specific state
  const [emailFrom, setEmailFrom] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Chat-specific state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Detect browser speech support
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
    }
  }, []);

  // Update interactionText based on active channel
  useEffect(() => {
    if (channel === "email") {
      // Combine email subject and body for processing
      const emailText = `${emailSubject ? `Subject: ${emailSubject}\n\n` : ''}${emailBody}`;
      setInteractionText(emailText);
    } else if (channel === "chat") {
      // Use the last user message from chat
      const userMessages = chatMessages.filter(m => m.sender === "user");
      if (userMessages.length > 0) {
        const lastUserMessage = userMessages[userMessages.length - 1];
        setInteractionText(lastUserMessage.text);
      } else {
        setInteractionText("");
      }
    }
    // For voice, interactionText is set directly by speech recognition
  }, [channel, emailSubject, emailBody, chatMessages]);

  // Detect device type from customer input
  useEffect(() => {
    if (!interactionText) {
      setDetectedDevice(null);
      return;
    }

    const text = interactionText.toLowerCase();
    
    // Check for device keywords
    if (text.includes('laptop') || text.includes('notebook')) {
      setDetectedDevice('laptop');
    } else if (text.includes('printer') || text.includes('print')) {
      setDetectedDevice('printer');
    } else if (text.includes('computer') || text.includes('desktop') || text.includes('pc')) {
      setDetectedDevice('computer');
    } else if (text.includes('phone') || text.includes('mobile')) {
      setDetectedDevice('phone');
    } else if (text.includes('tablet') || text.includes('ipad')) {
      setDetectedDevice('tablet');
    } else {
      // Default to computer if no specific device mentioned
      setDetectedDevice('computer');
    }
  }, [interactionText]);

  // Handle "unknown" workflow - create escalation result and ticket
  useEffect(() => {
    if (selectedWorkflow === "unknown" && stage === "running" && !lastResult) {
      const handleUnknownWorkflow = async () => {
        const ticketId = `INC-${Math.floor(100000 + Math.random() * 900000)}`;
        const reason = "No confident playbook match for this request. Escalated to human agent with full context.";
        
        const unknownResult = {
          workflow_type: "unknown",
          status: "escalated",
          diagnosis: {
            workflow: "Unknown intent (no playbook match)",
            root_cause: "Insufficient signal to safely auto-resolve using existing workflows.",
            confidence: 0.2,
          },
          actions: [],
          verification: null,
          escalation: {
            required: true,
            reason,
            ticket_id: ticketId,
          },
          resolution_reason: reason,
        };
        
        // Auto-create ticket for unknown workflows too
        try {
          const ticketData = {
            workflow: "unknown",
            interactionText: interactionText,
            detectedDevice: detectedDevice,
            diagnosis: unknownResult.diagnosis,
            actions: [],
            status: 'escalated',
            category: 'Unknown Category',
            escalationReason: reason,
            ticketId: ticketId,
          };
          
          const ticketResult = await createTicket(ticketData, selectedTicketingSystem);
          setTicketResult(ticketResult);
          setTicketConfirmed(true);
          
          // Update unknown result with ticket info
          unknownResult.escalation = {
            ...unknownResult.escalation,
            ticket_id: ticketResult.ticketId,
            ticket_url: ticketResult.url,
            ticket_system: ticketResult.system,
          };
          unknownResult.ticket = {
            ticket_id: ticketResult.ticketId,
            ticket_url: ticketResult.url,
            ticket_system: ticketResult.system,
            created_at: ticketResult.createdAt,
          };
        } catch (error) {
          console.error("Failed to auto-create ticket for unknown workflow:", error);
        }
        
        setLastResult(unknownResult);
        setStage("escalated");
      };
      
      // Add slight delay to simulate processing
      const timer = setTimeout(handleUnknownWorkflow, 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedWorkflow, stage, lastResult, interactionText, detectedDevice, selectedTicketingSystem]);

  // Simple intent scoring (keyword hits)
  const intentScores = useMemo(() => {
    const text = (interactionText || "").toLowerCase();
    const trimmed = text.trim();
    if (!trimmed) return [];

    // Require a minimum of three words before we try to infer intent
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount < 3) return [];

    return INTENT_CATALOG.map((intent) => {
      const base = intent.planned ? 0.3 : 0;
      const keywordScore =
        intent.keywords?.reduce((score, kw) => {
          if (text.includes(kw.toLowerCase())) return score + 1;
          return score;
        }, 0) || 0;
      const total = base + keywordScore;
      return { intent, score: total };
    })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);
  }, [interactionText]);

  const LOW_CONFIDENCE_THRESHOLD = 0.8;

  // Derive chosen workflow from top scoring intent; if too low, mark as unknown/escalation-only
  useEffect(() => {
    if (!intentScores.length) {
      setSelectedWorkflow("unknown");
      return;
    }
    const [top] = intentScores;
    if (!top || top.score < LOW_CONFIDENCE_THRESHOLD) {
      setSelectedWorkflow("unknown");
      return;
    }
    const preferred =
      intentScores.find((s) => !s.intent.planned && s.intent.workflow) || top;
    if (preferred?.intent?.workflow) {
      setSelectedWorkflow(preferred.intent.workflow);
    }
  }, [intentScores]);

  const handleSampleClick = (intent) => {
    setInteractionText(intent.text);
    setLastResult(null);
  };

  const handleStartVoice = () => {
    if (!hasSpeechSupport || isListening || channel !== "voice") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setInteractionText(text);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      setLastResult(null);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatInput("");
    
    // Simulate agent acknowledgment
    setTimeout(() => {
      const agentMessage = {
        id: Date.now() + 1,
        sender: "agent",
        text: "I understand your issue. Let me analyze this and find the best solution...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const handleLoadEmailSample = () => {
    setEmailFrom("john.smith@company.com");
    setEmailSubject("Printer on Floor 3 Not Working");
    setEmailBody("Hi Support,\n\nOur office printer on floor 3 has been offline since this morning. Nothing is printing and we have several urgent documents that need to be printed for a client meeting.\n\nCan you please help us resolve this ASAP?\n\nThanks,\nJohn Smith\nMarketing Department");
  };

  // Orchestrate the step-by-step flow with intelligent pause detection
  useEffect(() => {
    const trimmed = (interactionText || "").trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

    // Require at least 4 words before processing (reasonable minimum)
    if (!trimmed || wordCount < 4) {
      setStage("idle");
      setLastResult(null);
      return;
    }

    // Show capture immediately
    setStage("capture");
    setLastResult(null);

    let debounceTimer, t1, t2, t3, t4;

    // Debounce: Wait for user to pause (stop typing/speaking)
    // This gives them time to complete their thought
    debounceTimer = setTimeout(() => {
      // After pause, show background processing before intent detection
      t1 = setTimeout(() => {
        setStage("intent-detecting");
      }, 1200); // Show brief background work before intent detection

      t2 = setTimeout(() => {
        setStage("intent-ready");
      }, 2400); // Intent detected and ready

      t3 = setTimeout(() => {
        setStage("knowledge-ready");
      }, 3600); // Show knowledge source

      t4 = setTimeout(() => {
        setStage("telemetry");
      }, 4800); // Gather telemetry

      const t5 = setTimeout(() => {
        // Continue workflow for all cases - don't pause on unknown
        setStage("running");
        setAutoRunToken(String(Date.now()));
      }, 6800); // Execute workflow
    }, 1000); // Wait 1 second after user stops typing/speaking

    return () => {
      clearTimeout(debounceTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [interactionText, selectedWorkflow]);

  const progressPercent = useMemo(() => {
    switch (stage) {
      case "idle":
        return 0;
      case "capture":
        return 12;
      case "intent-detecting":
        return 28;
      case "intent-ready":
        return 45;
      case "knowledge-ready":
        return 60;
      case "telemetry":
        return 75;
      case "running":
        return 90;
      case "completed":
      case "escalated":
        return 100;
      default:
        return 0;
    }
  }, [stage]);

  const currentOutcome = useMemo(() => {
    if (!lastResult) return null;

    if (lastResult.escalation?.required) {
      const ticketId = lastResult.escalation.ticket_id || "INC-23017";
      const reason = lastResult.escalation.reason || "Complex diagnostic required human intervention.";
      const systemName = lastResult.escalation.ticket_system || selectedTicketingSystem || "servicenow";
      const systemDisplayName = availableSystems.find(s => s.id === systemName)?.name || "Ticketing System";
      const ticketUrl = lastResult.escalation.ticket_url;
      
      return {
        status: "Escalated",
        summary: `Ticket ${ticketId} created in ${systemDisplayName}. Reason: ${reason}`,
        kpiLabel: "Ticket Created",
        kpi: ticketId,
        ticketUrl,
        systemName: systemDisplayName,
      };
    }

  return {
    status: "Self-healed",
    summary: lastResult.resolution_reason || "Issue handled by agentic workflow.",
    kpiLabel: "Time Saved",
    kpi: "~15 min",
  };
}, [lastResult, selectedTicketingSystem, availableSystems]);

  const intentStatus = useMemo(() => {
    switch (stage) {
      case "idle":
        return "Waiting for input";
      case "capture":
        return channel === "voice" ? "Listening to the issue…" :
               channel === "chat" ? "Reading chat conversation…" :
               channel === "email" ? "Parsing email content…" :
               "Capturing input…";
      case "intent-detecting":
        return "Evaluating possible intents…";
      case "intent-ready":
        return "Best workflow selected";
      case "telemetry":
        return "Validating against telemetry…";
      case "running":
        return "Driving self-heal steps…";
      case "completed":
        return "Run completed";
      case "escalated":
        return "Escalated to human";
      default:
        return "Processing…";
    }
  }, [stage, channel]);

  const telemetryStatus = useMemo(() => {
    switch (stage) {
      case "telemetry":
        return "Snapshotting printer & account state…";
      case "running":
        return "Monitoring device while actions run…";
      case "completed":
        return "Final state captured";
      case "escalated":
        return "Snapshot attached to ticket";
      default:
        return "Ready to read device signals";
    }
  }, [stage]);

  const timeline = useMemo(() => {
    if (!lastResult) return [];
    const steps = [];
    if (interactionText) {
      const channelInfo = {
        voice: {
          label: "Voice Capture Agent",
          icon: <Mic className="w-3.5 h-3.5" />,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        chat: {
          label: "Chat Capture Agent",
          icon: <MessageCircle className="w-3.5 h-3.5" />,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        email: {
          label: "Email Parsing Agent",
          icon: <Mail className="w-3.5 h-3.5" />,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
      };
      
      const channelData = channelInfo[channel] || channelInfo.voice;
      
      steps.push({
        key: "capture",
        label: channelData.label,
        icon: channelData.icon,
        color: channelData.color,
        bg: channelData.bg,
        body: channel === "email" && emailSubject 
          ? `From: ${emailFrom || "customer@company.com"}\nSubject: ${emailSubject}\n\n${emailBody.substring(0, 150)}${emailBody.length > 150 ? '...' : ''}`
          : `"${interactionText.substring(0, 200)}${interactionText.length > 200 ? '...' : ''}"`,
      });
    }
    steps.push({
      key: "intent",
      label: "Intent Detection Agent",
      icon: <Brain className="w-3.5 h-3.5" />,
      color: "text-[#1BC0BA]",
      bg: "bg-[#E0F7F5]",
      body:
        lastResult.diagnosis?.workflow || lastResult.workflow_type
          ? `Matched workflow: ${lastResult.diagnosis?.workflow || lastResult.workflow_type}`
          : "Workflow selected based on device + error pattern.",
    });
    
    // Knowledge Base search step (enhanced reasoning)
    if (selectedWorkflow && selectedWorkflow !== "unknown") {
      const kbResults = searchKnowledgeBase(interactionText, null);
      if (kbResults.length > 0) {
        steps.push({
          key: "kb-search",
          label: "Knowledge Base Agent",
          icon: <BookOpen className="w-3.5 h-3.5" />,
          color: "text-purple-600",
          bg: "bg-purple-50",
          body: `Retrieved ${kbResults.length} relevant knowledge chunks from vectorized database. Context: ${kbResults[0]?.text?.substring(0, 100)}...`,
        });
      }
    }
    
    if (lastResult.diagnosis?.root_cause) {
      steps.push({
        key: "diagnosis",
        label: "Diagnostic Agent",
        icon: <Activity className="w-3.5 h-3.5" />,
        color: "text-amber-600",
        bg: "bg-amber-50",
        body: `${lastResult.diagnosis.root_cause} ${lastResult.diagnosis.confidence ? `(Confidence: ${(lastResult.diagnosis.confidence * 100).toFixed(0)}%)` : ""}`,
      });
    }
    if (lastResult.actions?.length) {
      const actionNames = lastResult.actions.map((a) => a.name).join(" · ");
      steps.push({
        key: "actions",
        label: "Action Execution Agent",
        icon: <Wand2 className="w-3.5 h-3.5" />,
        color: "text-[#F97316]",
        bg: "bg-orange-50",
        body: actionNames,
      });
    }
    if (lastResult.verification) {
      steps.push({
        key: "verify",
        label: "Verification Agent",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        body:
          lastResult.verification.details ||
          "Key checks passed so we trust the self-heal before closing.",
      });
    }
    steps.push({
      key: "outcome",
      label: lastResult.escalation?.required ? "Escalation Decision Agent" : "Closure Decision Agent",
      icon: lastResult.escalation?.required ? (
        <AlertCircle className="w-3.5 h-3.5" />
      ) : (
        <Zap className="w-3.5 h-3.5" />
      ),
      color: lastResult.escalation?.required ? "text-rose-600" : "text-[#F94680]",
      bg: lastResult.escalation?.required ? "bg-rose-50" : "bg-pink-50",
      body:
        lastResult.resolution_reason ||
        (lastResult.escalation?.required
          ? "Escalated because the agent hit a policy or diagnostic boundary."
          : "Issue handled end-to-end by the agentic workflow."),
    });
    
    // Ticketing system integration step (when ticket is created)
    if (lastResult.escalation?.required && ticketConfirmed) {
      const systemName = lastResult.escalation.ticket_system || selectedTicketingSystem || "servicenow";
      const systemDisplayName = availableSystems.find(s => s.id === systemName)?.name || "Ticketing System";
      const ticketId = lastResult.escalation.ticket_id || "N/A";
      const ticketUrl = lastResult.escalation.ticket_url;
      
      steps.push({
        key: systemName,
        label: `${systemDisplayName} Integration Agent`,
        icon: <Cloud className="w-3.5 h-3.5" />,
        color: "text-blue-600",
        bg: "bg-blue-50",
        body: `Ticket ${ticketId} created in ${systemDisplayName}.${ticketUrl ? ` View ticket: ${ticketUrl}` : ""} Payload includes: customer interaction, telemetry snapshot, diagnostic results, and escalation reason. API response: 201 Created.`,
      });
    }
    
    return steps;
  }, [lastResult, interactionText, selectedWorkflow, ticketConfirmed, selectedTicketingSystem, availableSystems, channel, emailFrom, emailSubject, emailBody]);

  // Keep workflow state in sync: reset when new interaction starts
  useEffect(() => {
    if (stage === "capture") {
      setLastResult(null);
      setTicketConfirmed(false);
      setShowTicketModal(false);
      setTicketCopied(false);
    }
  }, [stage]);

  return (
    <div className="space-y-3 p-3">
      {/* Compact header in AI Watchtower style */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#612D91] via-[#7B3FE4] to-[#C26BFF] flex items-center justify-center shadow-md">
            <HeadsetIcon />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI Console</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Capture customer voice or chat, route to the right workflow, and run end-to-end self-healing with full traceability.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
          {onNavigate && (
            <button
              onClick={() => onNavigate("store")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
              title="Back to FAB Store"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </button>
          )}
        </div>
      </div>

      {/* Agentic storyboard – single cohesive canvas */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 space-y-4">
        {/* Live agentic run strip, now embedded inside the storyboard card */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-semibold text-gray-800 flex items-center gap-1 text-sm">
                <Brain className="w-4 h-4 text-[#612D91]" />
                Live agentic run
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-gray-500">
              {stage === "capture" && "Capturing customer issue…"}
              {["intent-detecting", "intent-ready"].includes(stage) && "Figuring out the best workflow…"}
              {stage === "telemetry" && "Snapshotting device and account telemetry…"}
              {["running"].includes(stage) && "Running self-heal actions…"}
              {["completed", "escalated"].includes(stage) && "Run finished – see outcome below."}
            </p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#612D91] via-[#A64AC9] to-[#10B981] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-sm text-gray-700">
            <StepChip
              label={
                channel === "voice" ? "Hear customer" :
                channel === "chat" ? "Chat with customer" :
                channel === "email" ? "Read email" :
                "Capture input"
              }
              step={1}
              status={stage === "idle" ? "waiting" : stage === "capture" ? "running" : "done"}
              icon={
                channel === "voice" ? <Mic className="w-3 h-3" /> :
                channel === "chat" ? <MessageCircle className="w-3 h-3" /> :
                channel === "email" ? <Mail className="w-3 h-3" /> :
                <User className="w-3 h-3" />
              }
            />
            <StepChip
              label="Figure out intent"
              step={2}
              status={
                ["intent-detecting"].includes(stage)
                  ? "running"
                  : ["intent-ready", "knowledge-ready", "telemetry", "running", "completed", "escalated"].includes(stage)
                  ? "done"
                  : "waiting"
              }
              icon={<Brain className="w-3 h-3" />}
            />
            <StepChip
              label="Snapshot device"
              step={3}
              status={
                ["telemetry"].includes(stage)
                  ? "running"
                  : ["running", "completed", "escalated"].includes(stage)
                  ? "done"
                  : "waiting"
              }
              icon={<Cpu className="w-3 h-3" />}
            />
            <StepChip
              label="Self-heal / escalate"
              step={4}
              status={
                ["running"].includes(stage)
                  ? "running"
                  : ["completed", "escalated"].includes(stage)
                  ? "done"
                  : "waiting"
              }
              icon={<Zap className="w-3 h-3" />}
            />
          </div>
        </div>

        {/* Top row: Customer / Intent / Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Column 1: Customer – subtle indigo */}
          <motion.div
            animate={{
              scale: stage !== "idle" ? 1.03 : 1,
              boxShadow:
                stage === "capture"
                  ? "0 22px 55px rgba(128,149,228,0.55)"
                  : "0 6px 18px rgba(15,23,42,0.12)",
            }}
            transition={{ duration: 0.35 }}
            className={`relative rounded-lg border-2 px-4 py-4 flex flex-col gap-3 transition-all duration-300 min-h-[420px] ${
              stage === "capture"
                ? "border-indigo-300 bg-indigo-50 shadow-md"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AvatarCircle active={stage !== "idle"} pulse={stage === "capture"} icon={<User className="w-4 h-4" />} />
                <p className="text-base font-semibold text-gray-900">Customer</p>
              </div>
              {channel === "voice" && (
                <button
                  type="button"
                  onClick={handleStartVoice}
                  disabled={!hasSpeechSupport || isListening}
                  aria-label={
                    hasSpeechSupport
                      ? isListening
                        ? "Listening…"
                        : "Start voice capture"
                      : "Voice to text unavailable"
                  }
                  className={`inline-flex items-center justify-center rounded-full border shadow-sm ${
                    !hasSpeechSupport
                      ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                      : isListening
                      ? "bg-red-100 text-red-600 border-red-200 animate-pulse"
                      : "bg-[#111827] text-white hover:bg-black"
                  } w-9 h-9`}
                >
                  <Mic className={`w-4 h-4`} />
                </button>
              )}
              {channel === "email" && (
                <button
                  type="button"
                  onClick={handleLoadEmailSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#612D91] bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Load Sample Email
                </button>
              )}
              {channel === "chat" && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Chat
                </div>
              )}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {/* Voice Input */}
              {channel === "voice" && (
                <p className="line-clamp-4 bg-white/70 rounded-xl border border-gray-200 px-3 py-2.5">
                  {interactionText ||
                    'Say something like "The printer on floor 3 is offline and nothing is printing" or "My home printer keeps saying the ink is not recognised."'}
                </p>
              )}

              {/* Email Input */}
              {channel === "email" && (
                <div className="space-y-2">
                  <div className="bg-white rounded-lg border border-gray-200 p-2">
                    <input
                      type="email"
                      placeholder="From: customer@company.com"
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
                    />
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-2">
                    <input
                      type="text"
                      placeholder="Subject: Describe your issue"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
                    />
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-2">
                    <textarea
                      placeholder="Email body: Explain the problem in detail..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={4}
                      className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Chat Input */}
              {channel === "chat" && (
                <div className="space-y-2">
                  <div className="bg-white rounded-lg border border-gray-200 p-2 max-h-40 overflow-y-auto">
                    {chatMessages.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2 text-center">Start a conversation...</p>
                    ) : (
                      <div className="space-y-2">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-1.5 ${
                                msg.sender === "user"
                                  ? "bg-[#612D91] text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-xs">{msg.text}</p>
                              <span className="text-[10px] opacity-70 mt-0.5 block">{msg.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={!chatInput.trim()}
                      className="px-3 py-2 bg-[#612D91] text-white rounded-lg hover:bg-[#7B3FE4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-700">
              <span className="font-semibold mr-1">Channel:</span>
              <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                channel === "voice" 
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold" 
                  : "bg-white hover:border-indigo-200"
              }`}>
                <input
                  type="radio"
                  name="channel"
                  value="voice"
                  checked={channel === "voice"}
                  onChange={() => setChannel("voice")}
                  className="h-3 w-3 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <Phone className="w-3 h-3" />
                <span>Voice</span>
              </label>
              <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                channel === "chat" 
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold" 
                  : "bg-white hover:border-emerald-200"
              }`}>
                <input
                  type="radio"
                  name="channel"
                  value="chat"
                  checked={channel === "chat"}
                  onChange={() => setChannel("chat")}
                  className="h-3 w-3 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <MessageCircle className="w-3 h-3" />
                <span>Chat</span>
              </label>
              <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                channel === "email" 
                  ? "bg-purple-50 border-purple-300 text-purple-700 font-semibold" 
                  : "bg-white hover:border-purple-200"
              }`}>
                <input
                  type="radio"
                  name="channel"
                  value="email"
                  checked={channel === "email"}
                  onChange={() => setChannel("email")}
                  className="h-3 w-3 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </label>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-gray-50 text-gray-400 cursor-not-allowed">
                <input
                  type="radio"
                  name="channel"
                  value="telemetry"
                  checked={channel === "telemetry"}
                  disabled
                  className="h-3 w-3 text-gray-300 border-gray-200"
                />
                <Cloud className="w-3 h-3" />
                <span>Telemetry (soon)</span>
              </label>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                Language: EN
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {INTENT_CATALOG.map((intent) => (
                <button
                  key={intent.id}
                  type="button"
                  onClick={() => handleSampleClick(intent)}
                  className="flex items-center justify-center px-3 py-2 rounded-lg text-[11px] font-medium border border-gray-200 text-gray-700 bg-white hover:border-[#612D91]/40 hover:text-[#612D91] hover:bg-purple-50 transition-all text-center min-h-[40px]"
                  title={intent.text}
                >
                  <span className="line-clamp-2">{intent.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Intent Brain – subtle teal */}
          <motion.div
            animate={{
              scale: ["intent-detecting", "intent-ready", "telemetry", "running", "completed", "escalated"].includes(stage)
                ? 1.03
                : 1,
              boxShadow: ["intent-detecting", "intent-ready"].includes(stage)
                ? "0 22px 55px rgba(27,192,186,0.55)"
                : "0 6px 18px rgba(15,23,42,0.10)",
            }}
            transition={{ duration: 0.35 }}
            className={`relative rounded-lg px-4 py-4 flex flex-col gap-3 transition-all duration-300 border-2 min-h-[420px] ${
              ["intent-detecting", "intent-ready"].includes(stage)
                ? "border-teal-300 bg-teal-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AvatarCircle
                  active={["intent-detecting", "intent-ready", "telemetry", "running", "completed", "escalated"].includes(stage)}
                  pulse={["intent-detecting"].includes(stage)}
                  icon={<Brain className="w-4 h-4" />}
                />
                <p className="text-base font-semibold text-gray-900">Intent Brain</p>
              </div>
              <p className="text-[11px] text-gray-500">{intentStatus}</p>
            </div>
            {(!interactionText || interactionText.trim().split(/\s+/).length < 3) ? (
              <div className="mt-2 text-xs text-gray-500">
                Type or say a short sentence (at least three words) so the Intent Brain can understand what you need.
              </div>
            ) : selectedWorkflow === "unknown" ? (
              <div className="mt-2 text-xs text-gray-500 space-y-1.5">
                <p>
                  We couldn’t confidently match this request to any existing playbook. Rather than guessing, the
                  agents will package full context and route it to a human.
                </p>
                <p className="text-[11px] text-gray-400">
                  This is also a signal to create a new workflow template for this pattern.
                </p>
              </div>
            ) : (
              <div className="mt-1 space-y-2.5 text-sm">
                {/* Primary Match Callout */}
                {intentScores.length > 0 && intentScores[0] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-[#612D91]/10 to-[#A64AC9]/10 border-2 border-[#612D91]/30 rounded-xl p-3 shadow-sm"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#612D91] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-gray-900 text-sm">Matched Category</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#612D91] text-white text-[10px] font-bold uppercase tracking-wide">
                            Primary
                          </span>
                        </div>
                        <p className="font-semibold text-[#612D91] text-base mb-1">
                          {intentScores[0].intent.label}
                        </p>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-gray-600">Workflow:</span>
                          <span className="font-mono font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {intentScores[0].intent.workflow}
                          </span>
                          <span className="ml-auto font-bold text-[#612D91]">
                            {(intentScores[0].score * 25).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Knowledge Source - Ultra compact to avoid height jump */}
                {["knowledge-ready", "telemetry", "running", "completed", "escalated"].includes(stage) && 
                 selectedWorkflow !== "unknown" && 
                 intentScores.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 px-2.5 py-2 shadow-sm"
                  >
                    <div className="flex items-start gap-2 justify-between">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#612D91] flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold text-gray-900">Knowledge Source</span>
                            <span className="px-1 py-0.5 rounded bg-purple-200 text-purple-800 text-[8px] font-bold uppercase">Verified</span>
                          </div>
                          <p className="text-[10px] text-gray-700 leading-snug line-clamp-2">
                            {selectedWorkflow === 'printer_offline' 
                              ? 'Matched "printer", "floor 3", "offline" → Network connectivity procedure (Sec 3.2) • Printer_Guide.pdf p.12-15 • 94%'
                              : 'Matched "ink cartridge", "not recognized" → INK_AUTH_001 troubleshooting (Sec 2.1) • Ink_Error_Resolution.pdf p.8-10 • 94%'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          const startPage = selectedWorkflow === 'printer_offline' ? 12 : 8;
                          setDocViewerPage(startPage);
                          setShowDocViewer(true);
                        }}
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white rounded hover:from-[#7B3FE4] hover:to-[#C26BFF] transition-all text-[10px] font-semibold whitespace-nowrap"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        View
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Alternative Matches - Always show when available */}
                {intentScores.length > 1 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Alternative Matches
                    </p>
                    {intentScores.slice(1, 3).map(({ intent, score }, idx) => (
                      <motion.div
                        key={intent.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (idx + 1) * 0.1 + 0.3 }}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 bg-white/70 border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium text-gray-700 text-xs truncate">
                            {intent.label}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {intent.workflow}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: ["intent-ready", "telemetry", "running", "completed", "escalated"].includes(stage) && score > 0
                                  ? `${Math.min(100, score * 25)}%`
                                  : 0,
                              }}
                              transition={{ duration: 0.5, delay: (idx + 1) * 0.08 + 0.4 }}
                              className="h-1.5 rounded-full bg-gray-400"
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 w-8 text-right">{(score * 25).toFixed(0)}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!intentScores.length && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Start speaking or typing to see how we route to a workflow.
                  </p>
                )}
              </div>
            )}
            <p className="mt-1 text-[11px] text-gray-500">
              {selectedWorkflow === "unknown"
                ? "Understands there is no safe playbook and makes a clean hand-off to a human agent."
                : "Understands what the user wants and picks a playbook."}
            </p>
          </motion.div>

          {/* Column 3: Telemetry Snapshot – Enhanced with rich data */}
          <motion.div
            animate={{
              scale: stage === "telemetry" ? 1.03 : 1,
              boxShadow:
                stage === "telemetry"
                  ? "0 22px 55px rgba(254,189,23,0.55)"
                  : "0 6px 18px rgba(15,23,42,0.08)",
            }}
            transition={{ duration: 0.35 }}
            className={`relative rounded-lg px-4 py-4 flex flex-col gap-3 transition-all duration-300 border-2 min-h-[420px] ${
              stage === "telemetry" ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AvatarCircle
                  active={stage === "telemetry"}
                  pulse={stage === "telemetry"}
                  icon={<Cpu className="w-4 h-4" />}
                />
                <p className="text-base font-semibold text-gray-900">Input Datapoints</p>
              </div>
              {stage === "telemetry" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 border border-amber-300"
                >
                  <Activity className="w-3 h-3 text-amber-700 animate-pulse" />
                  <span className="text-[10px] font-semibold text-amber-700">Scanning...</span>
                </motion.div>
              )}
            </div>
            
            {/* Show waiting state until customer provides input */}
            {!interactionText || stage === "idle" || stage === "capture" || !detectedDevice ? (
              <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
                <Cpu className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500 mb-1">Waiting for customer input...</p>
                <p className="text-xs text-gray-400">
                  Telemetry will be captured once the issue is described
                </p>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-gray-500">{telemetryStatus}</p>
                
                <div className="mt-1 space-y-2">
                  {/* Show detected device type badge */}
                  <div className={`rounded-lg p-3 border ${
                    detectedDevice === 'laptop' ? 'bg-blue-50 border-blue-200' :
                    detectedDevice === 'printer' ? 'bg-purple-50 border-purple-200' :
                    'bg-indigo-50 border-indigo-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-4 h-4 ${
                        detectedDevice === 'laptop' ? 'text-blue-600' :
                        detectedDevice === 'printer' ? 'text-purple-600' :
                        'text-indigo-600'
                      }`} />
                      <span className={`text-xs font-semibold ${
                        detectedDevice === 'laptop' ? 'text-blue-900' :
                        detectedDevice === 'printer' ? 'text-purple-900' :
                        'text-indigo-900'
                      }`}>
                        Detected Device: {detectedDevice === 'laptop' ? 'Laptop' : detectedDevice === 'printer' ? 'Printer' : 'Computer'}
                      </span>
                    </div>
                  </div>

                  {/* Now show appropriate telemetry based on detected device */}
                  {detectedDevice === 'laptop' ? (
                    <>
                      {/* Compact laptop telemetry - dashboard style */}
                      <div className="text-[11px] space-y-2">
                        {/* Device Info - Inline */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Model:</span>
                            <span className="font-semibold text-gray-900">Dell Latitude 5520</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Serial:</span>
                            <span className="font-mono text-gray-900 text-[10px]">DL5520X789</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">OS:</span>
                            <span className="text-gray-900">Win 11 Pro</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">RAM:</span>
                            <span className="text-gray-900">16GB</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-2"></div>

                        {/* Status - Compact */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              <span className="text-gray-500">Power:</span>
                            </div>
                            <span className="font-semibold text-red-600">Issues Detected</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span className="text-gray-500">Display:</span>
                            </div>
                            <span className="text-amber-600">Flickering</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Activity className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-500">Battery:</span>
                            </div>
                            <span className="text-gray-700">45%</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-2"></div>

                        {/* Network - Compact */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              <span className="text-gray-500">WiFi:</span>
                            </div>
                            <span className="text-green-600">Connected</span>
                          </div>
                          <div className="flex justify-between pl-5">
                            <span className="text-gray-500">IP:</span>
                            <span className="font-mono text-gray-900 text-[10px]">192.168.1.105</span>
                          </div>
                        </div>

                        <div className="border-t border-green-200 pt-2 mt-2 bg-green-50/50 -mx-2 px-2 py-1.5 rounded">
                          <div className="flex items-center gap-1.5 text-green-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="font-semibold text-[10px]">Premium Support • 24/7 Coverage</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : detectedDevice === 'printer' ? (
                <>
                  {/* Compact printer telemetry - dashboard style */}
                  <div className="text-[11px] space-y-2">
                    {/* Device Info - Inline */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Model:</span>
                        <span className="font-semibold text-gray-900">HP LJ 4200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Serial:</span>
                        <span className="font-mono text-gray-900 text-[10px]">CNBJW12345</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Firmware:</span>
                        <span className="text-gray-900">v1.2.3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">OS:</span>
                        <span className="text-gray-900">Win 11 Pro</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-2"></div>

                    {/* Network - Compact with errors */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span className="text-gray-500">Connection:</span>
                        </div>
                        <span className="font-semibold text-red-600">Offline</span>
                      </div>
                      <div className="flex justify-between pl-5">
                        <span className="text-gray-500">IP:</span>
                        <span className="text-gray-400 text-[10px]">Not reachable</span>
                      </div>
                      <div className="flex justify-between pl-5">
                        <span className="text-gray-500">Gateway:</span>
                        <span className="text-gray-400 text-[10px]">192.168.1.1</span>
                      </div>
                      <div className="flex justify-between pl-5">
                        <span className="text-gray-500">Port:</span>
                        <span className="text-red-600 text-[10px]">9100 (Timeout)</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-2"></div>

                    {/* Print Queue - Compact */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span className="text-gray-500">Queue:</span>
                        </div>
                        <span className="font-semibold text-amber-600">7 jobs</span>
                      </div>
                      <div className="flex justify-between pl-5">
                        <span className="text-gray-500">Spooler:</span>
                        <span className="text-red-600">Unhealthy</span>
                      </div>
                      <div className="flex justify-between pl-5">
                        <span className="text-gray-500">Last Job:</span>
                        <span className="text-gray-700">3 min ago</span>
                      </div>
                    </div>

                    <div className="border-t border-green-200 pt-2 mt-2 bg-green-50/50 -mx-2 px-2 py-1.5 rounded">
                      <div className="flex items-center gap-1.5 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="font-semibold text-[10px]">Gold Support • Replacement Eligible</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Device Info */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <Cpu className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-900">Device Information</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-500">Model:</span>
                        <p className="font-semibold text-gray-900">Canon PIXMA XL-500</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Serial:</span>
                        <p className="font-mono text-gray-900">CNPX987654</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Firmware:</span>
                        <p className="text-gray-900">v3.4.5</p>
                      </div>
                      <div>
                        <span className="text-gray-500">OS:</span>
                        <p className="text-gray-900">macOS 14.2</p>
                      </div>
                    </div>
                  </div>

                  {/* Ink Status */}
                  <div className="bg-white rounded-lg p-3 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-900">Ink Cartridges</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Black:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-gray-800 h-1.5 rounded-full" style={{width: "70%"}} />
                          </div>
                          <span className="font-semibold text-gray-900">70%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Cyan:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-cyan-500 h-1.5 rounded-full" style={{width: "40%"}} />
                          </div>
                          <span className="font-semibold text-amber-600">40%</span>
                        </div>
                      </div>
                      <div className="px-2 py-1.5 bg-red-50 border border-red-200 rounded text-red-700 mt-2">
                        Error: INK_AUTH_001 - Cartridge not recognized
                      </div>
                    </div>
                  </div>

                  {/* Network Status */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-semibold text-gray-900">Network Status</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Connection:</span>
                        <span className="font-semibold text-green-600">Online</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">IP Address:</span>
                        <span className="font-mono text-gray-900">192.168.1.150</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">WiFi Signal:</span>
                        <span className="text-green-600">Strong (92%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Status */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ink Subscription Active
                    </div>
                    <p className="text-blue-700">Auto-ship enabled • Next delivery: 5 days</p>
                  </div>
                </>
              )}
                </div>
                
                <p className="mt-2 text-[10px] text-gray-500 italic border-t border-gray-200 pt-2">
                  ✓ Context-aware telemetry based on customer's actual device
                </p>
              </>
            )}
          </motion.div>
        </div>


        {/* Row 2: Outcome as full-width card – professional pinks */}
        <motion.div
          animate={{
            scale: ["running", "completed", "escalated"].includes(stage) ? 1.02 : 1,
            boxShadow: ["completed"].includes(stage)
              ? "0 24px 60px rgba(249,70,128,0.3)"
              : stage === "escalated"
              ? "0 24px 60px rgba(239,68,68,0.3)"
              : "0 6px 18px rgba(15,23,42,0.08)",
          }}
          transition={{ duration: 0.3 }}
          className={`relative rounded-xl overflow-hidden px-3 py-4 flex flex-col gap-2.5 transition-all duration-300 ${
            stage === "completed"
              ? "border-pink-400 bg-pink-50"
            : stage === "escalated"
              ? "border-rose-400 bg-rose-50"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Removed heavy gradient overlay to keep it professional */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AvatarCircle
                active={["running", "completed", "escalated"].includes(stage)}
                pulse={["running"].includes(stage)}
                icon={<Zap className="w-4 h-4" />}
              />
              <p className="text-sm font-semibold text-gray-900">Workflow outcome</p>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                stage === "escalated"
                  ? "bg-rose-100 text-rose-700"
                  : stage === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {stage === "escalated" ? "Escalated" : stage === "completed" ? "Self-healed" : "Running"}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-700 space-y-1.5">
            {currentOutcome ? (
              <>
                <p>
                  <span className="font-medium text-gray-600">Summary:</span>{" "}
                  <span className="font-semibold text-gray-900">{currentOutcome.summary}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-600">{currentOutcome.kpiLabel}:</span>{" "}
                  <span className="font-semibold text-gray-900">{currentOutcome.kpi}</span>
                </p>
                {currentOutcome.ticketUrl && (
                  <div className="mt-2">
                    <a
                      href={currentOutcome.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                    >
                      <Cloud className="w-3 h-3" />
                      View in {currentOutcome.systemName}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">
                We'll show the summary once the first workflow run completes.
              </p>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-[11px] text-gray-500 flex-1">
              Executes actions, verifies outcome, and only escalates when necessary.
            </p>
            {stage === "escalated" && !ticketConfirmed && (
              <button
                type="button"
                onClick={() => setShowTicketModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Create ticket in IT system
              </button>
            )}
            {stage === "escalated" && ticketConfirmed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ticket created in IT system
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Hidden engine runner to keep workflow status updated without showing the old demo UI.
          For unknown intents we skip this runner, since we escalate immediately instead of invoking a playbook. */}
      {selectedWorkflow !== "unknown" && (
        <div className="hidden">
          <AgenticSupportDemo
            embedded={true}
            initialWorkflow={selectedWorkflow}
            interactionText={interactionText}
            autoRunToken={autoRunToken}
            onWorkflowComplete={async (result) => {
              setLastResult(result);
              
              // Auto-create ticket for ALL workflows (self-healing + escalated)
              try {
                const ticketData = {
                  workflow: selectedWorkflow,
                  interactionText: interactionText,
                  detectedDevice: detectedDevice,
                  diagnosis: result?.diagnosis,
                  actions: result?.actions || [],
                  status: result?.escalation?.required ? 'escalated' : 'resolved',
                  category: selectedWorkflow === 'printer_offline' ? 'Printer Offline on Floor 3' : 
                           selectedWorkflow === 'ink_error' ? 'Genuine Ink Not Recognized' : 
                           'Unknown Category',
                  escalationReason: result?.escalation?.reason,
                  ticketId: result?.escalation?.ticket_id,
                };
                
                const ticketResult = await createTicket(ticketData, selectedTicketingSystem);
                setTicketResult(ticketResult);
                setTicketConfirmed(true);
                
                // Update result with ticket info
                const updatedResult = {
                  ...result,
                  ticket: {
                    ticket_id: ticketResult.ticketId,
                    ticket_url: ticketResult.url,
                    ticket_system: ticketResult.system,
                    created_at: ticketResult.createdAt,
                  },
                };
                
                if (result?.escalation?.required) {
                  updatedResult.escalation = {
                    ...result.escalation,
                    ticket_id: ticketResult.ticketId,
                    ticket_url: ticketResult.url,
                    ticket_system: ticketResult.system,
                  };
                }
                
                setLastResult(updatedResult);
              } catch (error) {
                console.error("Failed to auto-create ticket:", error);
              }
              
              // Set final stage
              if (result?.escalation?.required) {
                setStage("escalated");
              } else {
                setStage("completed");
              }
            }}
          />
        </div>
      )}

      {/* Ticket confirmation modal */}
      {showTicketModal && lastResult?.escalation && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Create ticket in your IT system?
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              We'll send this incident, along with the captured customer text and telemetry snapshot, into your ITSM / CRM
              platform (e.g., ServiceNow, Salesforce, SAP, etc.) as a ready-to-work ticket.
            </p>
            {/* Ticketing System Selection */}
            <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-medium">
                  <Cloud className="w-3.5 h-3.5" />
                  Ticketing System
                </div>
                <select
                  value={selectedTicketingSystem}
                  onChange={(e) => setSelectedTicketingSystem(e.target.value)}
                  className="text-[11px] px-2 py-1 rounded border border-blue-300 bg-white text-blue-700 focus:ring-1 focus:ring-blue-500"
                  disabled={ticketCreating}
                >
                  {availableSystems.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.icon} {sys.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-blue-600">
                {selectedTicketingSystem === "servicenow" && "Ticket will be created via ServiceNow REST API (POST /api/now/table/incident) with full context payload."}
                {selectedTicketingSystem === "jira" && "Issue will be created via Jira REST API (POST /rest/api/3/issue) with full context payload."}
                {selectedTicketingSystem === "zendesk" && "Ticket will be created via Zendesk REST API (POST /api/v2/tickets.json) with full context payload."}
                {selectedTicketingSystem === "salesforce" && "Case will be created via Salesforce REST API (POST /services/data/v58.0/sobjects/Case) with full context payload."}
              </p>
            </div>
            <div className="mt-2 mb-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                  Ticket ID
                </p>
                <p className="font-mono text-sm text-gray-900">
                  {lastResult.escalation.ticket_id}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const id = lastResult?.escalation?.ticket_id;
                  if (!id) return;
                  try {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      await navigator.clipboard.writeText(id);
                      setTicketCopied(true);
                      setTimeout(() => setTicketCopied(false), 2000);
                    }
                  } catch {
                    // ignore copy failures in demo
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border ${
                  ticketCopied
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {ticketCopied ? "Copied" : "Copy ID"}
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTicketModal(false);
                  setTicketCopied(false);
                }}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!lastResult?.escalation) return;
                  
                  setTicketCreating(true);
                  try {
                    // Prepare ticket data
                    const ticketData = {
                      interactionText,
                      telemetry: lastResult.telemetry || {},
                      diagnosis: lastResult.diagnosis || {},
                      escalationReason: lastResult.escalation.reason,
                      ticketId: lastResult.escalation.ticket_id,
                    };
                    
                    // Create ticket via service with selected system
                    const result = await createTicket(ticketData, selectedTicketingSystem);
                    
                    setTicketResult(result);
                    setTicketConfirmed(true);
                    setShowTicketModal(false);
                    
                    // Update lastResult with actual ticket info
                    setLastResult({
                      ...lastResult,
                      escalation: {
                        ...lastResult.escalation,
                        ticket_id: result.ticketId,
                        ticket_url: result.url,
                        ticket_system: result.system,
                      },
                    });
                  } catch (error) {
                    console.error("Failed to create ticket:", error);
                    alert(`Failed to create ticket: ${error.message}`);
                  } finally {
                    setTicketCreating(false);
                  }
                }}
                disabled={ticketCreating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ticketCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Creating ticket...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm &amp; create ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Agent Orchestration - Always Visible with Animations */}
      {timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#612D91] to-[#A64AC9] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="w-6 h-6 text-white" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-200 opacity-50" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Agent Orchestration</h3>
                  <p className="text-xs text-purple-100">Real-time multi-agent reasoning trace</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-300" />
                    </span>
                    <span className="text-xs font-semibold text-white">{timeline.length} Agents Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#612D91]" />
                <span className="font-semibold text-gray-700">Workflow:</span>
                <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-purple-200 text-[#612D91]">
                  {selectedWorkflow === "printer_offline" ? "printer_offline" : "ink_error"}
                </span>
              </div>
              {interactionText && (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-600 truncate italic">"{interactionText.substring(0, 80)}..."</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent Steps - Beautiful Timeline */}
          <div className="px-6 py-6">
            <div className="relative">
              {/* Animated connecting line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#612D91] via-[#A64AC9] to-[#612D91] opacity-30" />
              
              <div className="space-y-4">
                {timeline.map((step, idx) => (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15, duration: 0.4 }}
                    className="relative"
                  >
                    <div className="flex items-start gap-4">
                      {/* Agent Icon with Glow */}
                      <div className="relative z-10 flex-shrink-0">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.15 + 0.2, type: "spring", stiffness: 200 }}
                          className="relative"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 shadow-lg ${step.color} relative`}>
                            {step.icon}
                            {/* Pulse effect for active agents */}
                            {idx === timeline.length - 1 && (
                              <motion.span
                                className={`absolute inset-0 rounded-full ${step.bg} opacity-50`}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </div>
                          {/* Number badge */}
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center shadow-md">
                            <span className="text-[10px] font-bold text-white">{idx + 1}</span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Agent Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 + 0.3, duration: 0.4 }}
                        className="flex-1 group"
                      >
                        <div className={`rounded-xl ${step.bg} border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md`}>
                          {/* Agent Header */}
                          <div className="px-4 py-2.5 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className={`font-bold text-sm ${step.color} truncate`}>
                                  {step.label}
                                </span>
                                {idx === timeline.length - 1 && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="px-2 py-0.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Final
                                  </motion.span>
                                )}
                              </div>
                              <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ delay: idx * 0.15 + 0.5, duration: 0.6 }}
                              >
                                <Sparkles className={`w-3.5 h-3.5 ${step.color} opacity-50`} />
                              </motion.div>
                            </div>
                          </div>

                          {/* Agent Body */}
                          <div className="px-4 py-3">
                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {step.body}
                            </p>
                          </div>

                          {/* Progress indicator for final step */}
                          {idx === timeline.length - 1 && (
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: idx * 0.15 + 0.6, duration: 0.8 }}
                              className="h-1 bg-gradient-to-r from-[#612D91] via-[#A64AC9] to-green-500 origin-left"
                            />
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer - Final Status */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">
                  Workflow Status: <span className="text-green-600">{lastResult?.status || "Completed"}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Total execution time: <span className="font-semibold">~{(timeline.length * 0.8).toFixed(1)}s</span></span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* Knowledge Base Document Viewer */}
      {showDocViewer && (
        <KnowledgeDocViewer
          workflow={selectedWorkflow}
          initialPage={docViewerPage}
          onClose={() => setShowDocViewer(false)}
        />
      )}
    </div>
  );
}


