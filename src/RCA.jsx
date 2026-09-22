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

export default function RCA() {
  const [selectedIncident, setSelectedIncident] = useState(mockIncidents[0]);
  const [activeTab, setActiveTab] = useState('rca');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [cliOpen, setCliOpen] = useState(true);
  const [cliOutput, setCliOutput] = useState([
    'Kyro Operator CLI v2.4.0 [Puku AI Connected]',
    'Pipeline: NetFlow + Syslog + DNS + SNMP -> Kafka -> Loki/MinIO -> Prometheus',
    'Type "puku help" or "puku analyze INC-9042" to run AI diagnostics.'
  ]);
  const [cliInput, setCliInput] = useState('');
  const [runbookState, setRunbookState] = useState('Not Started');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'puku', text: 'Hello NOC Engineer! I am Puku AI. I have correlated 1,024 raw alerts into 1 logical incident (INC-9042). Probable Cause: Optical Transceiver Degradation (-28.4 dBm) on dhaka-core-01. Would you like to execute the optical failover runbook?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleCliSubmit = (e) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    const cmd = cliInput.trim();
    const newOutput = [...cliOutput, `kyro-cli> ${cmd}`];

    if (cmd === 'puku help' || cmd === 'help') {
      newOutput.push(
        'Available Commands:',
        '  puku analyze <INC-ID>  - Run AI root cause analysis',
        '  puku impact           - Query affected residential and SLA circuits',
        '  puku pipeline status  - Check Kafka, Loki, MinIO, Prometheus status',
        '  clear                 - Clear output'
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
        `    Telemetry Evidence: Optical Rx Power -28.4 dBm (Threshold: -22.0 dBm)`
      );
    } else {
      newOutput.push(`Executing command: "${cmd}". Type "puku help" for available commands.`);
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
      let botReply = "Puku AI analyzed your prompt: ";
      if (userMsg.toLowerCase().includes('why') || userMsg.toLowerCase().includes('cause')) {
        botReply += `Root cause for ${selectedIncident.id} is optical degradation (-28.4 dBm) on Ge0/0/1.`;
      } else {
        botReply += `Operational recommendation: Execute ${selectedIncident.recommendedRunbook} to restore normal throughput.`;
      }
      setChatMessages(prev => [...prev, { sender: 'puku', text: botReply }]);
    }, 600);
  };

  const executeRunbook = () => {
    setRunbookState('Running');
    setTimeout(() => setRunbookState('Waiting for Approval'), 1200);
  };

  const approveRunbook = () => {
    setRunbookState('Completed');
  };

  return (
    <div>
      {/* Standard Kyro Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">INTELLIGENCE & INCIDENT CORRELATION</div>
          <h1>RCA & Incident Intelligence<span className="title-dot">.</span></h1>
          <p>AI-native root cause analysis, telemetry correlation, and subscriber impact engine.</p>
        </div>
        <div className="heading-actions">
          <button onClick={() => setCliOpen(!cliOpen)}>
            <Terminal size={15} /> CLI {cliOpen ? '(Active)' : ''}
          </button>
          <button className="primary" onClick={() => setCopilotOpen(!copilotOpen)}>
            <Sparkles size={15} /> Puku Copilot
          </button>
        </div>
      </div>

      {/* Overview Tabs Navigation matching Kyro Design System */}
      <div className="overview-tabs">
        <div>
          <button className={activeTab === 'rca' ? 'active' : ''} onClick={() => setActiveTab('rca')}>RCA & Evidence</button>
          <button className={activeTab === 'impact' ? 'active' : ''} onClick={() => setActiveTab('impact')}>Customer Impact</button>
          <button className={activeTab === 'changes' ? 'active' : ''} onClick={() => setActiveTab('changes')}>Change Intelligence</button>
          <button className={activeTab === 'runbook' ? 'active' : ''} onClick={() => setActiveTab('runbook')}>Runbook Automation</button>
        </div>
        <span><i className="dot green-dot" /> Kafka Pipeline Active (42.8k events/s)</span>
      </div>

      {/* Main Grid matching Kyro page layout */}
      <div className="main-grid" style={{ gridTemplateColumns: copilotOpen ? 'minmax(0,1.8fr) 300px' : '1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Incident Spotlight Card */}
          <section className="card">
            <div className="card-heading" style={{ paddingBottom: '16px' }}>
              <div>
                <h2>
                  <ShieldAlert size={16} color="#efa476" />
                  {selectedIncident.title}
                </h2>
                <p>Device: {selectedIncident.device} • Started: {selectedIncident.startTime} • MTTR: {selectedIncident.mttr}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${selectedIncident.severity === 'Critical' ? 'red' : 'orange'}`}>
                  {selectedIncident.severity}
                </span>
                <span className="badge green">{selectedIncident.confidence}% RCA Confidence</span>
              </div>
            </div>

            {/* Core Loop Rationale */}
            <div style={{ margin: '0 21px 16px', padding: '14px', background: '#202325', borderLeft: '3px solid #eaaa7f', borderRadius: '0 8px 8px 0' }}>
              <div className="eyebrow" style={{ color: '#eaaa7f', marginBottom: '4px' }}>PROBABLE ROOT CAUSE HYPOTHESIS</div>
              <div style={{ fontSize: '13px', color: '#e6e7e7', fontWeight: 550, lineHeight: '1.5' }}>
                {selectedIncident.probableCause}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="stats" style={{ margin: '0 21px 20px', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              <div className="stat" style={{ background: '#202325', borderRadius: '8px' }}>
                <div className="stat-label">Impacted Users</div>
                <div className="stat-value" style={{ margin: '6px 0', fontSize: '22px' }}>{selectedIncident.impactedSubs.toLocaleString()}</div>
                <div className="stat-bottom">Residential Subscriptions</div>
              </div>
              <div className="stat" style={{ background: '#202325', borderRadius: '8px' }}>
                <div className="stat-label">Enterprise SLA</div>
                <div className="stat-value" style={{ margin: '6px 0', fontSize: '22px', color: '#eaaa7f' }}>{selectedIncident.impactedSla}</div>
                <div className="stat-bottom">Critical Circuits</div>
              </div>
              <div className="stat" style={{ background: '#202325', borderRadius: '8px' }}>
                <div className="stat-label">Raw Alerts</div>
                <div className="stat-value" style={{ margin: '6px 0', fontSize: '22px' }}>{selectedIncident.rawAlertsCount}</div>
                <div className="stat-bottom">120 Signals Correlated</div>
              </div>
              <div className="stat" style={{ background: '#202325', borderRadius: '8px' }}>
                <div className="stat-label">Target MTTR</div>
                <div className="stat-value" style={{ margin: '6px 0', fontSize: '22px', color: '#accb91' }}>{selectedIncident.mttr}</div>
                <div className="stat-bottom">Auto-Runbook Ready</div>
              </div>
            </div>
          </section>

          {/* RCA Evidence vs Impact vs Runbook Tabs */}
          {activeTab === 'rca' && (
            <section className="card">
              <div className="card-heading">
                <h2><Activity size={16} />Telemetry Signal Correlation & Evidence Cards</h2>
              </div>
              <div className="chart" style={{ height: '180px', margin: '15px 21px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTelemetry}>
                    <defs>
                      <linearGradient id="rcaLossArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#efa476" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#efa476" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#777e80" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#777e80" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#27292b', border: '1px solid #4b4c4e', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="loss" stroke="#efa476" fill="url(#rcaLossArea)" strokeWidth={2} name="Packet Loss (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Evidence Log List */}
              <div style={{ padding: '0 21px 21px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedIncident.hypotheses.map((h, idx) => (
                  <div key={idx} style={{ padding: '12px 16px', background: '#202325', border: '1px solid #35393b', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className={`badge ${h.type === 'OBSERVED' ? 'green' : h.type === 'INFERRED' ? 'orange' : h.type === 'PROBABLE' ? 'orange' : 'green'}`}>
                        {h.type}
                      </span>
                      <span style={{ color: '#d0d6da', fontSize: '11px', fontWeight: 550 }}>{h.text}</span>
                    </div>
                    <span className="muted" style={{ fontSize: '10px' }}>{h.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'impact' && (
            <section className="card">
              <div className="card-heading">
                <h2><Users size={16} />Affected SLA Enterprise Clients & Coverage Areas</h2>
              </div>
              <div style={{ padding: '16px 21px 21px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: '10px' }}>CRITICAL B2B SLA CIRCUITS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Grameenphone HQ Core Link (10 Gbps)', 'Standard Chartered Fiber Backup', 'BRAC Bank Gulshan Branch'].map((item, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: '#202325', borderRadius: '7px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span>{item}</span>
                        <span className="badge red">Degraded</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: '10px' }}>IMPACTED POP POPULATION</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Gulshan 1 & 2 POP (7,420 Users)', 'Banani Commercial Subnet (3,800 Users)', 'Niketan Fiber Loop (1,626 Users)'].map((item, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: '#202325', borderRadius: '7px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span>{item}</span>
                        <span className="badge orange">High Loss</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'changes' && (
            <section className="card">
              <div className="card-heading">
                <h2><GitCommit size={16} />Correlated Configuration Diffs & Maintenance Timeline</h2>
              </div>
              <div style={{ margin: '16px 21px 21px', padding: '16px', background: '#17191b', border: '1px solid #303335', borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px' }}>
                <div style={{ color: '#84898e', marginBottom: '8px' }}>Commit: #c8f941a by engineer raihan@kyro.net (13:58 UTC - 12m prior)</div>
                <div style={{ color: '#d59994' }}>- router bgp 64512 neighbor 103.14.22.1 holdtime 90</div>
                <div style={{ color: '#accb91' }}>+ router bgp 64512 neighbor 103.14.22.1 holdtime 15</div>
                <div style={{ color: '#84898e', marginTop: '8px' }}>Analysis: Reduced holdtime triggered BGP flap under optical attenuation.</div>
              </div>
            </section>
          )}

          {activeTab === 'runbook' && (
            <section className="card">
              <div className="card-heading">
                <div>
                  <h2><Play size={16} />Recommended Runbook: {selectedIncident.recommendedRunbook}</h2>
                  <p>Automated remediation workflow with human authorization guardrails.</p>
                </div>
                <span className={`badge ${runbookState === 'Completed' ? 'green' : runbookState === 'Waiting for Approval' ? 'orange' : 'neutral'}`}>
                  State: {runbookState}
                </span>
              </div>
              <div style={{ padding: '16px 21px 21px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px 14px', background: '#202325', borderRadius: '7px', fontSize: '11px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle size={15} color="#accb91" /> Step 1: Verify Optical Fiber Signal Stability on Secondary Uplink (Passed)
                </div>
                <div style={{ padding: '10px 14px', background: '#202325', borderRadius: '7px', fontSize: '11px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle size={15} color={runbookState !== 'Not Started' ? '#accb91' : '#737b82'} /> Step 2: Trigger BGP Weight Shift to Secondary IIG Path (Requires Approval)
                </div>
                <div style={{ padding: '10px 14px', background: '#202325', borderRadius: '7px', fontSize: '11px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle size={15} color={runbookState === 'Completed' ? '#accb91' : '#737b82'} /> Step 3: Notify Enterprise NOC Contacts via SMS/Email API (Completed)
                </div>
                <div style={{ marginTop: '10px' }}>
                  {runbookState === 'Not Started' && (
                    <button className="primary" onClick={executeRunbook}><Play size={14} /> Execute Runbook</button>
                  )}
                  {runbookState === 'Waiting for Approval' && (
                    <button className="primary" onClick={approveRunbook}><ShieldAlert size={14} /> Approve BGP Path Shift</button>
                  )}
                  {runbookState === 'Completed' && (
                    <span style={{ color: '#accb91', fontWeight: 650, fontSize: '11px' }}>Remediation Completed Successfully!</span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Embedded CLI Terminal Bar matching Kyro styling */}
          {cliOpen && (
            <section className="card" style={{ background: '#151719' }}>
              <div className="card-heading" style={{ borderBottom: '1px solid #2b2e30', paddingBottom: '12px' }}>
                <h2><Terminal size={15} />Kyro Operator Terminal (Puku AI Connected)</h2>
                <button className="text-button" onClick={() => setCliOpen(false)}>Hide</button>
              </div>
              <div style={{ padding: '16px 21px', fontFamily: 'monospace', fontSize: '11px' }}>
                <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  {cliOutput.map((l, i) => (
                    <div key={i} style={{ color: l.startsWith('kyro-cli>') ? '#efa476' : '#d0d6da' }}>{l}</div>
                  ))}
                </div>
                <form onSubmit={handleCliSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#accb91', fontWeight: 600 }}>kyro-cli&gt;</span>
                  <input
                    type="text"
                    value={cliInput}
                    onChange={e => setCliInput(e.target.value)}
                    placeholder="Type CLI command (e.g. puku analyze INC-9042, puku pipeline status, help)..."
                    style={{ flex: 1, padding: '6px 10px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <button className="primary" style={{ padding: '6px 14px' }}>Execute</button>
                </form>
              </div>
            </section>
          )}
        </div>

        {/* Right Drawer: Puku Copilot Panel */}
        {copilotOpen && (
          <section className="card" style={{ height: 'fit-content' }}>
            <div className="card-heading" style={{ borderBottom: '1px solid #2b2e30', paddingBottom: '12px' }}>
              <h2><Sparkles size={15} />Puku AI Copilot</h2>
              <button className="text-button" onClick={() => setCopilotOpen(false)}>Close</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', background: m.sender === 'puku' ? '#202325' : '#332a24', border: '1px solid ' + (m.sender === 'puku' ? '#35393b' : '#554032'), fontSize: '11px', color: m.sender === 'puku' ? '#d0d6da' : '#f2b287' }}>
                    {m.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask Puku AI..."
                  style={{ flex: 1, fontSize: '11px' }}
                />
                <button className="primary" style={{ padding: '6px 12px' }}><Send size={13} /></button>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
