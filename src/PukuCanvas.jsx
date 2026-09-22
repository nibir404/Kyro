import React, { useState, useRef } from 'react';
import {
  Play, Sparkles, Plus, Terminal, RefreshCw, Layers, CheckCircle2, ShieldAlert,
  Cpu, ArrowRight, MessageSquare, Code, Settings, Trash2, Lock, PlusCircle,
  Search, SlidersHorizontal, ChevronRight, ChevronDown, Check, HelpCircle,
  FileCode, Zap, AlertTriangle, Activity, Send, Paperclip, ExternalLink, X, Star,
  Copy, Maximize2, Monitor, Smartphone, Tablet, Undo, Redo, Eye, ShieldCheck,
  Grid, Compass, Database, Radio, Globe, Server, Network, Wifi, ListFilter
} from 'lucide-react';

const availableBlocks = [
  { id: 'b-1', title: 'BGP Flap Trigger', type: 'Trigger', category: 'Telemetry', desc: 'Fires when BGP peer holdtime expires.', accent: '#eaaa7f' },
  { id: 'b-2', title: 'Puku RCA Agent', type: 'AI Agent', category: 'Reasoning', desc: 'Correlates Syslog, NetFlow & SNMP anomalies.', accent: '#accb91' },
  { id: 'b-3', title: 'BGP Path Reroute', type: 'Action', category: 'NetOps', desc: 'Diverts traffic to backup optical link.', accent: '#9badbd' },
  { id: 'b-4', title: 'NOC Guardrail Check', type: 'Logic', category: 'Control', desc: 'Pauses execution until engineer approves.', accent: '#d9a077' }
];

const initialNodes = [
  {
    id: 'node-1',
    title: 'BGP Flap Trigger',
    type: 'Trigger',
    x: 60,
    y: 100,
    status: 'Active',
    device: 'dhaka-core-01.kyro.net',
    params: { holdtime: '15s', peer: '103.14.22.1' },
    accent: '#eaaa7f'
  },
  {
    id: 'node-2',
    title: 'Puku RCA Agent',
    type: 'AI Agent',
    x: 340,
    y: 100,
    status: 'Running',
    confidence: '94%',
    params: { model: 'Puku-v2.4', window: '15m' },
    accent: '#accb91'
  },
  {
    id: 'node-3',
    title: 'NOC Guardrail Check',
    type: 'Logic',
    x: 620,
    y: 100,
    status: 'Waiting Approval',
    params: { approver: 'Raihan Ahmed', timeout: '30m' },
    accent: '#d9a077'
  },
  {
    id: 'node-4',
    title: 'BGP Path Reroute',
    type: 'Action',
    x: 900,
    y: 100,
    status: 'Queued',
    params: { targetLink: 'Gulshan Link-02', weight: '200' },
    accent: '#9badbd'
  }
];

export default function PukuCanvas({ onClose }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState(initialNodes[1]);
  const [mode, setMode] = useState('Simulation'); // 'Real time' | 'Simulation'
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  // Puku AI Copilot Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'puku', text: 'Puku AI Active. Workflow canvas initialized with 4 interactive runbook nodes. You can drag nodes, edit parameters, or type commands in Puku CLI.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Terminal CLI State
  const [termLogs, setTermLogs] = useState([
    'Kyro Puku Canvas v2.4.0 [Interactive Automation Mode]',
    'Connected to Link3 Telemetry Pipeline (356 routers active)',
    'Type "puku help" or "puku execute" to test automation.'
  ]);
  const [termInput, setTermInput] = useState('');

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, node) => {
    e.stopPropagation();
    setSelectedNode(node);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId) return;
    const stage = document.getElementById('kyro-canvas-stage');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const newX = Math.max(10, Math.min(rect.width - 240, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 200, e.clientY - rect.top - dragOffset.y));

    setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const addBlockToCanvas = (block) => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      title: block.title,
      type: block.type,
      x: 100 + (nodes.length * 40) % 360,
      y: 120 + (nodes.length * 30) % 180,
      status: 'Configured',
      params: { created: 'Just now', target: 'Auto-assigned' },
      accent: block.accent
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    setPaletteOpen(false);
  };

  const deleteNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
  };

  const runSimulation = () => {
    setIsExecuting(true);
    setTermLogs(prev => [...prev, '[EXECUTOR] Initiating interactive workflow runbook simulation...']);
    
    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === 'node-1' ? { ...n, status: 'Completed' } : n));
      setTermLogs(prev => [...prev, '[NODE 1] BGP Flap Trigger: Event Fired (0.2s)']);
    }, 600);

    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === 'node-2' ? { ...n, status: 'Completed' } : n));
      setTermLogs(prev => [...prev, '[NODE 2] Puku RCA Agent: Identified optical power drop (-28.4 dBm) (0.4s)']);
    }, 1400);

    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === 'node-3' ? { ...n, status: 'Waiting Approval' } : n));
      setTermLogs(prev => [...prev, '[NODE 3] NOC Guardrail: Execution paused for engineer approval.']);
      setIsExecuting(false);
    }, 2200);
  };

  const handleTermSubmit = (e) => {
    e.preventDefault();
    if (!termInput.trim()) return;
    const cmd = termInput.trim();
    const newLogs = [...termLogs, `kyro-cli> ${cmd}`];

    if (cmd === 'clear') {
      setTermLogs([]);
      setTermInput('');
      return;
    } else if (cmd === 'puku help' || cmd === 'help') {
      newLogs.push(
        'Available Commands:',
        '  puku execute          - Run visual workflow simulation',
        '  puku analyze <INC-ID>  - Run AI root cause diagnostics',
        '  puku status           - Check Puku AI core state',
        '  clear                 - Clear output'
      );
    } else if (cmd === 'puku execute' || cmd === 'run') {
      runSimulation();
      setTermInput('');
      return;
    } else if (cmd.startsWith('puku analyze')) {
      newLogs.push(
        '[PUKU AI ANALYSIS] Incident INC-9042:',
        '  • Probable Cause (94% Conf): Optical Rx Power drop (-28.4 dBm) on Ge0/0/1',
        '  • Impacted Users: 12,846 residential, 14 enterprise SLA circuits',
        '  • Recommended Action: Execute BGP Path Reroute runbook'
      );
    } else {
      newLogs.push(`Executing command: "${cmd}". Type "puku help" for available commands.`);
    }

    setTermLogs(newLogs);
    setTermInput('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'puku',
          text: `Puku AI processed: "${text}". Workflow nodes and telemetry execution logs synchronized.`
        }
      ]);
    }, 600);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Standard Kyro Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">VISUAL WORKFLOW & AUTOMATION ENGINE</div>
          <h1>Puku AI Workflow Canvas<span className="title-dot">.</span></h1>
          <p>Interactive drag-and-drop workflow canvas with automated runbooks and Puku CLI.</p>
        </div>
        <div className="heading-actions">
          <button onClick={runSimulation} disabled={isExecuting}>
            <Zap size={14} /> {isExecuting ? 'Simulating...' : 'Test Runbook ⚡'}
          </button>
          <button className="primary" onClick={() => setCopilotOpen(!copilotOpen)}>
            <Sparkles size={15} /> Puku Copilot
          </button>
          {onClose && (
            <button onClick={onClose} style={{ borderColor: '#5c3636', color: '#d59994', background: '#3c2929' }}>
              <X size={14} /> Close Canvas
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Controls Bar matching Kyro styling */}
      <div className="overview-tabs">
        <div>
          <button className={mode === 'Simulation' ? 'active' : ''} onClick={() => setMode('Simulation')}>Simulation Mode</button>
          <button className={mode === 'Real time' ? 'active' : ''} onClick={() => setMode('Real time')}>Real Time Stream</button>
          <button onClick={() => setPaletteOpen(!paletteOpen)}>+ Add Block</button>
          <button onClick={() => setTerminalOpen(!terminalOpen)}><Terminal size={13} /> Puku CLI {terminalOpen ? '(Active)' : ''}</button>
        </div>
        <span><i className="dot green-dot" /> 356 Core Routers Connected</span>
      </div>

      {/* Main Grid: Left Block Palette (if open) / Center Stage / Right Inspector & Copilot */}
      <div className="main-grid" style={{ gridTemplateColumns: copilotOpen ? 'minmax(0,1.8fr) 300px' : '1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Center Stage Canvas */}
          <section
            id="kyro-canvas-stage"
            className="card"
            style={{
              height: '520px',
              position: 'relative',
              background: '#16181a',
              backgroundImage: 'radial-gradient(#393e42 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              overflow: 'hidden'
            }}
          >
            {/* Palette Drawer Popover */}
            {paletteOpen && (
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                width: '260px',
                background: '#202628',
                border: '1px solid #4b5559',
                borderRadius: '10px',
                boxShadow: '0 12px 36px #0009',
                zIndex: 30,
                padding: '12px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 650, color: '#e5e5e5', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Block Library</span>
                  <button className="text-button" onClick={() => setPaletteOpen(false)}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {availableBlocks.map(block => (
                    <div
                      key={block.id}
                      onClick={() => addBlockToCanvas(block)}
                      style={{ padding: '8px 10px', background: '#16181a', border: '1px solid #303638', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#eaaa7f'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#303638'}
                    >
                      <div>
                        <strong style={{ fontSize: '11px', color: '#d0d6da', display: 'block' }}>{block.title}</strong>
                        <span style={{ fontSize: '9px', color: '#84898e' }}>{block.desc}</span>
                      </div>
                      <Plus size={14} color="#eaaa7f" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bezier Connecting Cables SVG */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              {nodes.slice(0, -1).map((node, idx) => {
                const nextNode = nodes[idx + 1];
                if (!nextNode) return null;
                return (
                  <path
                    key={node.id}
                    d={`M ${node.x + 220} ${node.y + 45} C ${node.x + 270} ${node.y + 45}, ${nextNode.x - 40} ${nextNode.y + 45}, ${nextNode.x} ${nextNode.y + 45}`}
                    fill="none"
                    stroke={node.accent || '#eaaa7f'}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                );
              })}
            </svg>

            {/* Stage Canvas Nodes */}
            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onMouseDown={e => handleMouseDown(e, node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '220px',
                    background: isSelected ? '#292f33' : '#202426',
                    borderRadius: '10px',
                    border: '1px solid ' + (isSelected ? node.accent : '#35393b'),
                    boxShadow: isSelected ? `0 0 20px ${node.accent}44` : '0 6px 18px #0008',
                    zIndex: isSelected ? 15 : 5,
                    cursor: 'grab',
                    userSelect: 'none',
                    padding: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`badge ${node.status === 'Running' ? 'orange' : node.status === 'Completed' ? 'green' : 'neutral'}`} style={{ fontSize: '8px' }}>
                      {node.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                      style={{ padding: '0', border: 'none', background: 'transparent', color: '#737b82', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>

                  <strong style={{ fontSize: '11px', color: '#e6e7e7', display: 'block', marginBottom: '6px' }}>
                    {node.title}
                  </strong>

                  {node.device && (
                    <div style={{ fontSize: '9px', color: '#84898e', background: '#16181a', padding: '4px 6px', borderRadius: '4px', marginBottom: '4px' }}>
                      Device: {node.device}
                    </div>
                  )}

                  {node.confidence && (
                    <div style={{ fontSize: '9px', color: '#accb91', background: '#16181a', padding: '4px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      RCA Confidence: {node.confidence}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #303638', fontSize: '8px', color: '#737b82' }}>
                    <span>{node.type}</span>
                    <span>Drag to move</span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Embedded Operator Terminal Console */}
          {terminalOpen && (
            <section className="card" style={{ background: '#151719' }}>
              <div className="card-heading" style={{ borderBottom: '1px solid #2b2e30', paddingBottom: '10px' }}>
                <h2><Terminal size={15} />Kyro Operator Terminal (Puku CLI)</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="badge green">CLI Active</span>
                  <button className="text-button" onClick={() => setTerminalOpen(false)}>Hide</button>
                </div>
              </div>

              <div style={{ padding: '14px 21px', fontFamily: 'monospace', fontSize: '11px' }}>
                <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  {termLogs.map((l, i) => (
                    <div key={i} style={{ color: l.startsWith('kyro-cli>') ? '#efa476' : l.includes('EXECUTOR') ? '#accb91' : '#d0d6da' }}>{l}</div>
                  ))}
                </div>

                <form onSubmit={handleTermSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#accb91', fontWeight: 600 }}>kyro-cli&gt;</span>
                  <input
                    type="text"
                    value={termInput}
                    onChange={e => setTermInput(e.target.value)}
                    placeholder="Type CLI command (e.g. puku execute, puku analyze INC-9042, help, clear)..."
                    style={{ flex: 1, padding: '6px 10px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <button className="primary" style={{ padding: '6px 14px' }}>Execute</button>
                </form>
              </div>
            </section>
          )}
        </div>

        {/* Right Drawer: Puku AI Copilot Panel */}
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
