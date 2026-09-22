import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  FileCode,
  Zap,
  Terminal,
  Server,
  Network,
  Users,
  Building2,
  GitCommit,
  ShieldAlert,
  Play,
  CheckCircle,
  HelpCircle,
  Send,
  Sparkles,
  RefreshCw,
  Eye,
  ExternalLink,
  ArrowRight,
  Filter,
  Download,
  Share2,
  FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockTelemetry = [
  { time: '14:00', loss: 0.1, latency: 1.2, cpu: 18 },
  { time: '14:05', loss: 0.2, latency: 1.3, cpu: 22 },
  { time: '14:10', loss: 4.8, latency: 18.4, cpu: 89 },
  { time: '14:15', loss: 14.2, latency: 42.1, cpu: 96 },
  { time: '14:20', loss: 8.5, latency: 28.6, cpu: 74 },
  { time: '14:25', loss: 1.1, latency: 4.2, cpu: 31 }
];

const mockIncidents = [
  {
    id: 'INC-9042',
    title: 'Dhaka Core-01 BGP Session Flap & Traffic Drop',
    severity: 'Critical',
    status: 'Active',
    pop: 'Dhaka Core / Gulshan POP',
    device: 'dhaka-core-01.kyro.net',
    confidence: 94,
    impactedSubs: 12846,
    impactedSla: 14,
    startTime: '14:10:22 UTC',
    mttr: 'Est. 12m',
    probableCause: 'Optical Transceiver Degradation on GigabitEthernet0/0/1 leading to BGP peer timeout with Upstream IIG',
    eventsCount: 142,
    correlatedChanges: 2,
    recommendedRunbook: 'RB-BGP-OPTICAL-FAILOVER'
  },
  {
    id: 'INC-8819',
    title: 'Banani POP Aggregation Router Memory Spike',
    severity: 'Major',
    status: 'Investigating',
    pop: 'Banani POP',
    device: 'banani-agg-02.kyro.net',
    confidence: 88,
    impactedSubs: 3420,
    impactedSla: 4,
    startTime: '13:45:10 UTC',
    mttr: 'Est. 8m',
    probableCause: 'Unscheduled ACL Commit causing control plane memory fragmentation',
    eventsCount: 68,
    correlatedChanges: 1,
    recommendedRunbook: 'RB-ACL-ROLLBACK'
  },
  {
    id: 'INC-8740',
    title: 'Dhanmondi POP Subnet Latency Anomaly',
    severity: 'Minor',
    status: 'Active',
    pop: 'Dhanmondi POP',
    device: 'dhanmondi-pop-01.kyro.net',
    confidence: 76,
    impactedSubs: 890,
    impactedSla: 1,
    startTime: '12:15:00 UTC',
    mttr: 'Est. 15m',
    probableCause: 'SFP Transceiver Rx Power low (-24.2 dBm)',
    eventsCount: 29,
    correlatedChanges: 0,
    recommendedRunbook: 'RB-FIBER-ATTENUATION-CHECK'
  }
];

export default function RCA() {
  const [selectedIncident, setSelectedIncident] = useState(mockIncidents[0]);
  const [activeTab, setActiveTab] = useState('rca');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [cliOpen, setCliOpen] = useState(false);
  const [cliOutput, setCliOutput] = useState([
    'Kyro CLI v2.4.0 [RCA & Incident Intelligence Core]',
    'Connected to Link3 Telemetry Pipeline (356 routers active)',
    'Type "help" or "inspect <INCIDENT_ID>" to run CLI diagnostic queries.'
  ]);
  const [cliInput, setCliInput] = useState('');
  const [runbookState, setRunbookState] = useState('Not Started');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'puku', text: 'Hello! I am Puku Copilot. I have analyzed INC-9042: 94% confidence optical transceiver failure on dhaka-core-01. Would you like me to draft a customer SLA advisory or execute the optical failover runbook?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleCliSubmit = (e) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    const cmd = cliInput.trim();
    const newOutput = [...cliOutput, `kyro-cli> ${cmd}`];

    if (cmd === 'help') {
      newOutput.push(
        'Available commands:',
        '  inspect <INC-ID>  - Fetch deep telemetry & root cause analysis',
        '  runbook status    - Show active runbook execution state',
        '  bgp summary       - Query real-time BGP peer session state',
        '  clear             - Clear terminal logs'
      );
    } else if (cmd === 'clear') {
      setCliOutput([]);
      setCliInput('');
      return;
    } else if (cmd.startsWith('inspect')) {
      newOutput.push(
        `[+] Analyzing ${selectedIncident.id}...`,
        `    Target Device: ${selectedIncident.device}`,
        `    Probable Cause: ${selectedIncident.probableCause}`,
        `    Confidence: ${selectedIncident.confidence}%`,
        `    Impact: ${selectedIncident.impactedSubs} subscribers, ${selectedIncident.impactedSla} enterprise SLA circuits`
      );
    } else if (cmd === 'bgp summary') {
      newOutput.push(
        'BGP Neighbor Summary for dhaka-core-01:',
        '  Neighbor: 103.14.22.1 (Upstream IIG) -> State: Active (Flapping)',
        '  Neighbor: 103.14.22.5 (Backup IX)    -> State: Established (Prefixes: 42,190)',
        '  Rx/Tx Errors: 1,420 pkts dropped in last 15 minutes'
      );
    } else {
      newOutput.push(`Command unrecognized: "${cmd}". Type "help" for command list.`);
    }

    setCliOutput(newOutput);
    setCliInput('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let botReply = "I've processed your query against telemetry and dependency graphs. ";
      if (userMsg.toLowerCase().includes('cause') || userMsg.toLowerCase().includes('why')) {
        botReply += `The primary root cause for ${selectedIncident.id} is an optical power drop (-28.4 dBm) on interface Ge0/0/1, triggering BGP session flaps.`;
      } else if (userMsg.toLowerCase().includes('impact') || userMsg.toLowerCase().includes('customer')) {
        botReply += `Impact includes ${selectedIncident.impactedSubs} residential users and ${selectedIncident.impactedSla} enterprise SLA circuits (including Grameenphone Core and Standard Chartered Fiber).`;
      } else if (userMsg.toLowerCase().includes('runbook') || userMsg.toLowerCase().includes('fix')) {
        botReply += `Recommended Action: Execute ${selectedIncident.recommendedRunbook} to shift traffic to the standby backup optical link.`;
      } else {
        botReply += `Summary generated: ${selectedIncident.title} has 142 correlated events and 2 recent config changes.`;
      }
      setChatMessages(prev => [...prev, { sender: 'puku', text: botReply }]);
    }, 600);
  };

  const executeRunbook = () => {
    setRunbookState('Running');
    setTimeout(() => {
      setRunbookState('Waiting for Approval');
    }, 1500);
  };

  const approveRunbook = () => {
    setRunbookState('Completed');
  };

  return (
    <div style={{ padding: '24px', background: '#0B0E14', color: '#E2E8F0', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} /> Kyro Intelligence Layer
            </span>
            <span style={{ color: '#64748B', fontSize: '13px' }}>PRD Compliant • Telemetry Pipeline Active (356 Routers)</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 0 0', color: '#F8FAFC', letterSpacing: '-0.5px' }}>
            Root Cause Analysis & Incident Intelligence
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setCliOpen(!cliOpen)}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: cliOpen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.8)',
              border: '1px solid ' + (cliOpen ? '#22C55E' : 'rgba(255, 255, 255, 0.1)'),
              color: cliOpen ? '#4ADE80' : '#E2E8F0',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Terminal size={15} /> Kyro CLI {cliOpen ? '(Active)' : ''}
          </button>

          <button
            onClick={() => setCopilotOpen(!copilotOpen)}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
          >
            <Sparkles size={15} /> Puku Copilot
          </button>
        </div>
      </div>

      {/* Embedded CLI Terminal Bar (Togglable) */}
      {cliOpen && (
        <div style={{ marginBottom: '24px', background: '#090D16', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '16px', fontFamily: 'JetBrains Mono, Menlo, monospace', fontSize: '13px', boxShadow: '0 12px 24px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#4ADE80' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={15} />
              <span style={{ fontWeight: 700 }}>KYRO INTERACTIVE OPERATOR CLI</span>
            </div>
            <button onClick={() => setCliOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {cliOutput.map((line, idx) => (
              <div key={idx} style={{ color: line.startsWith('kyro-cli>') ? '#38BDF8' : '#CBD5E1', lineHeight: '1.5' }}>
                {line}
              </div>
            ))}
          </div>
          <form onSubmit={handleCliSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#4ADE80', fontWeight: 700 }}>kyro-cli&gt;</span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Type CLI command (e.g. inspect INC-9042, bgp summary, help)..."
              style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: '#F8FAFC', fontFamily: 'monospace', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '8px 16px', background: '#22C55E', color: '#090D16', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Execute</button>
          </form>
        </div>
      )}

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: copilotOpen ? '320px 1fr 340px' : '340px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Incident Correlation Queue */}
        <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#818CF8" /> Active Incidents ({mockIncidents.length})
            </h3>
            <span style={{ fontSize: '11px', color: '#94A3B8', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '12px' }}>Deduplicated</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mockIncidents.map(inc => {
              const isSelected = selectedIncident.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid ' + (isSelected ? '#6366F1' : 'rgba(255, 255, 255, 0.06)'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#818CF8' }}>{inc.id}</span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      background: inc.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: inc.severity === 'Critical' ? '#EF4444' : '#F59E0B',
                      border: '1px solid ' + (inc.severity === 'Critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)')
                    }}>
                      {inc.severity}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginBottom: '8px', lineHeight: '1.4' }}>
                    {inc.title}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
                    <span>📍 {inc.pop}</span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>{inc.confidence}% RCA Conf.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Workbench: RCA Deep-Dive */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Spotlight RCA Summary Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>{selectedIncident.title}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '12px', fontWeight: 700 }}>{selectedIncident.status}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>
                  Device: <code style={{ color: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{selectedIncident.device}</code> • Started: {selectedIncident.startTime}
                </div>
              </div>

              {/* Confidence Badge */}
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: 600, textTransform: 'uppercase' }}>RCA Confidence</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#34D399' }}>{selectedIncident.confidence}%</div>
              </div>
            </div>

            {/* Answer 2: Why did it happen? (Probable Root Cause) */}
            <div style={{ background: 'rgba(99, 102, 241, 0.08)', borderLeft: '4px solid #6366F1', padding: '14px 16px', borderRadius: '0 8px 8px 0', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} /> Probable Root Cause Hypothesis
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1F5F9', lineHeight: '1.5' }}>
                {selectedIncident.probableCause}
              </div>
            </div>

            {/* Operational Impact Quick Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Affected Subscribers</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginTop: '4px' }}>{selectedIncident.impactedSubs.toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Enterprise SLA Circuits</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>{selectedIncident.impactedSla} Circuits</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Correlated Alerts</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#818CF8', marginTop: '4px' }}>{selectedIncident.eventsCount} Events</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Target MTTR</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>{selectedIncident.mttr}</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
            {[
              { id: 'rca', label: 'RCA & Telemetry Evidence' },
              { id: 'impact', label: 'Customer Impact Engine' },
              { id: 'changes', label: 'Change Intelligence & Diffs' },
              { id: 'runbook', label: 'Interactive Runbooks' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? '#818CF8' : '#94A3B8',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content 1: RCA Telemetry & Evidence */}
          {activeTab === 'rca' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} color="#38BDF8" /> Real-Time Telemetry Correlation (Packet Loss & Latency Spike)
                </h4>
                <div style={{ height: '200px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTelemetry}>
                      <defs>
                        <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFF' }} />
                      <Area type="monotone" dataKey="loss" stroke="#EF4444" fillOpacity={1} fill="url(#lossGrad)" name="Packet Loss (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Evidence Cards */}
              <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: '#F8FAFC' }}>
                  Traceable Evidence Log Cards (4 Items)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #EF4444', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>14:10:22 UTC:</strong> Interface Ge0/0/1 optical Rx power dropped from -14.1 dBm to -28.4 dBm (Threshold: -22 dBm)</span>
                    <span style={{ color: '#EF4444', fontWeight: 700 }}>Telemetry Anomaly</span>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #F59E0B', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>14:10:25 UTC:</strong> BGP Session 103.14.22.1 HoldTimer Expired -&gt; State changed from Established to Active</span>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>BGP Protocol Flap</span>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #818CF8', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>14:10:30 UTC:</strong> Automated reroute diverted 65% traffic to secondary Gulshan uplink link-02</span>
                    <span style={{ color: '#818CF8', fontWeight: 700 }}>Traffic Reroute</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Customer Impact */}
          {activeTab === 'impact' && (
            <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: '#F8FAFC' }}>
                Customer & Enterprise Circuit Impact Breakdown
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h5 style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Impacted Enterprise Clients (SLA)</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['Grameenphone HQ Core Link (10 Gbps)', 'Standard Chartered Fiber Backup', 'BRAC Bank Gulshan Branch', 'Apex Footwear Data Center'].map((client, idx) => (
                      <div key={idx} style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{client}</span>
                        <span style={{ color: '#EF4444', fontSize: '11px', fontWeight: 700 }}>Degraded</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Impacted Coverage Areas</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['Gulshan 1 & 2 POP (7,420 Users)', 'Banani Commercial Area (3,800 Users)', 'Niketan Subnet (1,626 Users)'].map((area, idx) => (
                      <div key={idx} style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{area}</span>
                        <span style={{ color: '#F59E0B', fontSize: '11px', fontWeight: 700 }}>High Loss</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Change Intelligence */}
          {activeTab === 'changes' && (
            <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitCommit size={16} color="#F59E0B" /> Correlated Router Configuration Changes (Git Diff)
              </h4>
              <div style={{ background: '#090D16', borderRadius: '8px', padding: '14px', fontFamily: 'monospace', fontSize: '12px', color: '#CBD5E1' }}>
                <div style={{ color: '#94A3B8', marginBottom: '8px' }}>Commit: #c8f941a by engineer raihan@kyro.net (13:58 UTC - 12 mins before incident)</div>
                <div style={{ color: '#EF4444' }}>- router bgp 64512 neighbor 103.14.22.1 holdtime 90</div>
                <div style={{ color: '#22C55E' }}>+ router bgp 64512 neighbor 103.14.22.1 holdtime 15</div>
                <div style={{ color: '#94A3B8', marginTop: '8px' }}>Note: Tightening holdtime to 15s caused premature session expiration during minor SFP optical jitter.</div>
              </div>
            </div>
          )}

          {/* Tab Content 4: Interactive Runbooks */}
          {activeTab === 'runbook' && (
            <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
                    Recommended Runbook: {selectedIncident.recommendedRunbook}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>Automated remediation steps with explicit human authorization guardrails.</p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: runbookState === 'Completed' ? 'rgba(34, 197, 94, 0.2)' : runbookState === 'Waiting for Approval' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  color: runbookState === 'Completed' ? '#4ADE80' : runbookState === 'Waiting for Approval' ? '#FBBF24' : '#818CF8'
                }}>
                  State: {runbookState}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={16} color="#22C55E" /> Step 1: Verify Optical Fiber Signal Stability on Secondary Uplink (Passed)
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={16} color={runbookState !== 'Not Started' ? '#22C55E' : '#64748B'} /> Step 2: Trigger BGP Weight Shift to Secondary IIG Path (Requires Approval)
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={16} color={runbookState === 'Completed' ? '#22C55E' : '#64748B'} /> Step 3: Notify Enterprise NOC Contacts via SMS/Email API (Completed)
                </div>
              </div>

              {runbookState === 'Not Started' && (
                <button onClick={executeRunbook} style={{ padding: '10px 20px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={15} /> Execute Runbook
                </button>
              )}
              {runbookState === 'Waiting for Approval' && (
                <button onClick={approveRunbook} style={{ padding: '10px 20px', background: '#F59E0B', color: '#090D16', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={15} /> Approve BGP Path Shift
                </button>
              )}
              {runbookState === 'Completed' && (
                <div style={{ color: '#4ADE80', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> Runbook Remediation Completed Successfully!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Drawer: Puku AI Copilot Panel */}
        {copilotOpen && (
          <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '16px', display: 'flex', flexDirection: 'column', height: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#818CF8" />
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#F8FAFC' }}>Puku AI Copilot</span>
              </div>
              <button onClick={() => setCopilotOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  background: msg.sender === 'puku' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid ' + (msg.sender === 'puku' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.06)'),
                  color: msg.sender === 'puku' ? '#E0E7FF' : '#F8FAFC',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%'
                }}>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Puku (e.g. why did this happen, draft SLA advisory)..."
                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 10px', color: '#F8FAFC', fontSize: '12px', outline: 'none' }}
              />
              <button type="submit" style={{ padding: '8px 12px', background: '#4F46E5', border: 'none', borderRadius: '6px', color: '#FFF', cursor: 'pointer' }}>
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
