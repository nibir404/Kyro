import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, Cpu, Layers, Search, SlidersHorizontal, ChevronRight,
  Activity, FileCode, Zap, Terminal, Server, Network, Users, Building2, GitCommit,
  ShieldAlert, Play, CheckCircle, HelpCircle, Send, Sparkles, RefreshCw, Eye, ExternalLink,
  ArrowRight, Filter, Download, Share2, FileText, Database, ShieldCheck, CornerDownRight,
  Radio, BarChart2, Globe
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockTelemetry = [
  { time: '14:00', loss: 0.1, latency: 1.2, cpu: 18, flow: 1400 },
  { time: '14:05', loss: 0.2, latency: 1.3, cpu: 22, flow: 1420 },
  { time: '14:10', loss: 4.8, latency: 18.4, cpu: 89, flow: 420 },
  { time: '14:15', loss: 14.2, latency: 42.1, cpu: 96, flow: 110 },
  { time: '14:20', loss: 8.5, latency: 28.6, cpu: 74, flow: 680 },
  { time: '14:25', loss: 1.1, latency: 4.2, cpu: 31, flow: 1390 }
];

const mockIncidents = [
  {
    id: 'INC-9042',
    title: 'Dhaka Core-01 BGP Session Flap & Optical Power Drop',
    severity: 'Critical',
    status: 'Investigating',
    rawAlertsCount: 1024,
    correlatedSignals: 120,
    operationalIncidents: 1,
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
    recommendedRunbook: 'RB-BGP-OPTICAL-FAILOVER',
    hypotheses: [
      { type: 'OBSERVED', text: 'Rx Optical Power dropped to -28.4 dBm on Ge0/0/1 (Syslog & SNMP Telemetry)', status: 'Fact' },
      { type: 'INFERRED', text: 'BGP Hold Timer (15s) expired prematurely due to signal attenuation', status: 'High Confidence' },
      { type: 'PROBABLE', text: 'SFP Transceiver physical laser degradation on Upstream IIG fiber', status: 'Likely' },
      { type: 'CONFIRMED', text: 'Secondary fiber path link-02 verified clean with 1.1ms latency', status: 'Verified' }
    ]
  },
  {
    id: 'INC-8819',
    title: 'Banani POP Aggregation Router Control Plane Memory Leak',
    severity: 'Major',
    status: 'Mitigating',
    rawAlertsCount: 420,
    correlatedSignals: 48,
    operationalIncidents: 1,
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
    recommendedRunbook: 'RB-ACL-ROLLBACK',
    hypotheses: [
      { type: 'OBSERVED', text: 'Router CPU Memory usage reached 96% at 13:45 UTC (Prometheus Metrics)', status: 'Fact' },
      { type: 'INFERRED', text: 'ACL commit #c8f941a introduced unindexed filter loop', status: 'High Confidence' },
      { type: 'PROBABLE', text: 'Control plane daemon memory exhaustion', status: 'Likely' },
      { type: 'CONFIRMED', text: 'Rolling back commit #c8f941a frees 64% allocated memory', status: 'Verified' }
    ]
  }
];

const mockIntegrations = [
  { name: 'Kafka Stream', status: 'Connected', rate: '42.8k events/sec', delay: '2ms' },
  { name: 'Loki Syslog Engine', status: 'Connected', rate: '14.2k logs/sec', delay: '12ms' },
  { name: 'MinIO Parquet Storage', status: 'Connected', rate: 'NetFlow Archiving', delay: 'Active' },
  { name: 'Prometheus Metrics', status: 'Connected', rate: '356 Routers Polled', delay: '5s interval' },
  { name: 'Observium SNMP', status: 'Connected', rate: 'SNMP Traps Active', delay: 'Real-time' },
  { name: 'MikroTik & OLT API', status: 'Connected', rate: 'RADIUS & BNG Sync', delay: 'Active' }
];

export default function RCA() {
  const [selectedIncident, setSelectedIncident] = useState(mockIncidents[0]);
  const [activeTab, setActiveTab] = useState('rca');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [cliOpen, setCliOpen] = useState(true);
  const [cliOutput, setCliOutput] = useState([
    'Kyro Operator CLI v2.4.0 [Puku AI Connected]',
    'Data Pipeline: NetFlow + Syslog + DNS + SNMP -> Kafka -> Loki/MinIO -> Prometheus',
    'Type "puku help" or "puku analyze INC-9042" to run AI diagnostics.'
  ]);
  const [cliInput, setCliInput] = useState('');
  const [runbookState, setRunbookState] = useState('Not Started');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'puku', text: 'Hello NOC Engineer! I am Puku AI. I have correlated 1,024 raw alerts into 1 logical incident (INC-9042). Probable Cause: Optical Transceiver Degradation (-28.4 dBm) on dhaka-core-01. Would you like to execute the automated optical failover runbook?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleCliSubmit = (e) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    const cmd = cliInput.trim();
    const newOutput = [...cliOutput, `kyro-cli> ${cmd}`];

    if (cmd === 'puku help' || cmd === 'help') {
      newOutput.push(
        'Available CLI & Puku Commands:',
        '  puku analyze <INC-ID>  - Run deep AI root cause hypothesis evaluation',
        '  puku impact           - Query affected residential and enterprise SLA circuits',
        '  puku pipeline status  - Check Kafka, Loki, MinIO, Prometheus stream health',
        '  puku execute          - Execute active remediation runbook',
        '  clear                 - Clear terminal output'
      );
    } else if (cmd === 'clear') {
      setCliOutput([]);
      setCliInput('');
      return;
    } else if (cmd.startsWith('puku analyze') || cmd.startsWith('inspect')) {
      newOutput.push(
        `[+] Analyzing ${selectedIncident.id} via Puku AI Core...`,
        `    Target Device: ${selectedIncident.device}`,
        `    Probable Cause: ${selectedIncident.probableCause}`,
        `    RCA Confidence: ${selectedIncident.confidence}%`,
        `    Telemetry Evidence: Optical Rx Power -28.4 dBm (Threshold: -22.0 dBm)`,
        `    Correlation Reduction: 1,024 raw alerts -> 120 signals -> 15 events -> 1 incident`
      );
    } else if (cmd === 'puku pipeline status') {
      newOutput.push(
        '[DATA PIPELINE STATUS]',
        '  Kafka Streaming: 42.8k events/sec [OK]',
        '  Loki Syslog: 14.2k logs/sec [OK]',
        '  MinIO Storage: NetFlow Parquet Archiving [OK]',
        '  Observium SNMP: 356 Routers Online [OK]'
      );
    } else {
      newOutput.push(`Executing command: "${cmd}". Type "puku help" for AI diagnostic command list.`);
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
      let botReply = "Puku AI analyzed your operational prompt against Kafka streams and topology. ";
      if (userMsg.toLowerCase().includes('why') || userMsg.toLowerCase().includes('cause')) {
        botReply += `The root cause for ${selectedIncident.id} is optical signal degradation on interface Ge0/0/1 (-28.4 dBm Rx power), triggering BGP holdtimer expiry.`;
      } else if (userMsg.toLowerCase().includes('impact') || userMsg.toLowerCase().includes('who')) {
        botReply += `Customer Impact: ${selectedIncident.impactedSubs.toLocaleString()} residential users and ${selectedIncident.impactedSla} enterprise SLA circuits in Gulshan/Banani.`;
      } else {
        botReply += `Operational recommendation: Approve runbook ${selectedIncident.recommendedRunbook} to trigger BGP weight shift to standby optical link.`;
      }
      setChatMessages(prev => [...prev, { sender: 'puku', text: botReply }]);
    }, 600);
  };

  return (
    <div style={{ padding: '24px', background: '#0B0E14', color: '#E2E8F0', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Platform Core Loop Header */}
      <div style={{ marginBottom: '20px', background: '#111622', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#818CF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Operational Loop Workflow
            </span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span>OBSERVE</span> <ChevronRight size={12} color="#64748B" />
              <span>CORRELATE</span> <ChevronRight size={12} color="#64748B" />
              <span>INVESTIGATE</span> <ChevronRight size={12} color="#64748B" />
              <span>EXPLAIN</span> <ChevronRight size={12} color="#64748B" />
              <span style={{ color: '#38BDF8', fontWeight: 800 }}>ROOT CAUSE</span> <ChevronRight size={12} color="#64748B" />
              <span style={{ color: '#F59E0B' }}>CUSTOMER IMPACT</span> <ChevronRight size={12} color="#64748B" />
              <span style={{ color: '#4ADE80' }}>TAKE ACTION</span> <ChevronRight size={12} color="#64748B" />
              <span>VERIFY</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ADE80', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={13} /> Kafka Pipeline: 42.8k events/s
            </span>
            <button
              onClick={() => setCopilotOpen(!copilotOpen)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                border: 'none',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={14} /> Puku AI Copilot
            </button>
          </div>
        </div>
      </div>

      {/* Main RCA Workbench Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: copilotOpen ? '320px 1fr 320px' : '340px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Intelligent Incident Correlation Queue */}
        <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#818CF8" /> Correlated Incidents
            </h3>
            <span style={{ fontSize: '11px', color: '#94A3B8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
              1,024 Alerts → 1 Incident
            </span>
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
                      color: inc.severity === 'Critical' ? '#EF4444' : '#F59E0B'
                    }}>
                      {inc.severity}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginBottom: '8px', lineHeight: '1.4' }}>
                    {inc.title}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
                    <span>📍 {inc.pop}</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>{inc.confidence}% RCA Conf.</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Pipeline Integration Hub Panel */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} color="#38BDF8" /> Integration Pipeline Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {mockIntegrations.map((item, idx) => (
                <div key={idx} style={{ padding: '6px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CBD5E1' }}>{item.name}</span>
                  <span style={{ color: '#4ADE80', fontWeight: 600 }}>{item.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Visual RCA Investigation Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Visual RCA Evidence Spotlight Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>{selectedIncident.title}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '12px', fontWeight: 700 }}>{selectedIncident.status}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Device: <code style={{ color: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{selectedIncident.device}</code> • Correlation: 1,024 raw alerts → 120 signals → 1 incident
                </div>
              </div>

              {/* Confidence Meter */}
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#6EE7B7', fontWeight: 700, textTransform: 'uppercase' }}>RCA CONFIDENCE</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#34D399' }}>{selectedIncident.confidence}%</div>
              </div>
            </div>

            {/* RCA Hypothesis Breakdown (OBSERVED vs INFERRED vs PROBABLE vs CONFIRMED) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} /> Evidence-Based RCA Hypothesis Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedIncident.hypotheses.map((h, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 800,
                        background: h.type === 'OBSERVED' ? 'rgba(56, 189, 248, 0.2)' : h.type === 'INFERRED' ? 'rgba(168, 85, 247, 0.2)' : h.type === 'PROBABLE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: h.type === 'OBSERVED' ? '#38BDF8' : h.type === 'INFERRED' ? '#C084FC' : h.type === 'PROBABLE' ? '#F59E0B' : '#4ADE80'
                      }}>
                        {h.type}
                      </span>
                      <span style={{ fontSize: '12px', color: '#F1F5F9', fontWeight: 500 }}>{h.text}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{h.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependency Chain Visual */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Impacted Dependency Chain</div>
              <div style={{ fontSize: '12px', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>Upstream IIG Router</span>
                <ChevronRight size={12} color="#64748B" />
                <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>Ge0/0/1 SFP Optical Link</span>
                <ChevronRight size={12} color="#64748B" />
                <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>Gulshan & Banani POPs</span>
                <ChevronRight size={12} color="#64748B" />
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>12,846 Subscribers</span>
              </div>
            </div>
          </div>

          {/* Interactive Operator CLI Terminal Console */}
          <div style={{ background: '#090D16', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#4ADE80' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={15} />
                <span style={{ fontWeight: 700 }}>EMBEDDED OPERATOR TERMINAL (PUKU AI CONNECTED)</span>
              </div>
            </div>
            <div style={{ maxHeight: '140px', overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                placeholder="Type CLI command (e.g. puku analyze INC-9042, puku impact, puku pipeline status, help)..."
                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: '#F8FAFC', fontFamily: 'monospace', outline: 'none' }}
              />
              <button type="submit" style={{ padding: '8px 16px', background: '#22C55E', color: '#090D16', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Execute</button>
            </form>
          </div>
        </div>

        {/* Right Drawer: Puku AI Copilot Panel */}
        {copilotOpen && (
          <div style={{ background: '#111622', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '16px', display: 'flex', flexDirection: 'column', height: '620px' }}>
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
                placeholder="Ask Puku AI (e.g. why did this happen, draft SLA advisory)..."
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
