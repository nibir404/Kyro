import React, { useState, useRef } from 'react';
import {
  Play, Sparkles, Plus, Terminal, RefreshCw, Layers, CheckCircle2, ShieldAlert,
  Cpu, ArrowRight, MessageSquare, Code, Settings, Trash2, Lock, PlusCircle,
  Search, SlidersHorizontal, ChevronRight, ChevronDown, Check, HelpCircle,
  FileCode, Zap, AlertTriangle, Activity, Send, Paperclip, ExternalLink, X, Star,
  Copy, Maximize2, Monitor, Smartphone, Tablet, Undo, Redo, Eye, ShieldCheck,
  Grid, Compass, Database, Radio, Globe, Server, Network, Wifi, ListFilter
} from 'lucide-react';

const blockLibrary = [
  {
    category: 'Triggers',
    items: [
      { id: 'trig-bgp', name: 'BGP Flap Trigger', icon: Radio, color: '#eaaa7f', desc: 'Fires when BGP peer holdtime expires or flaps.' },
      { id: 'trig-opt', name: 'Optical Rx Power Drop', icon: Signal, color: '#eaaa7f', desc: 'Triggers on SFP optical power drop below -22 dBm.' },
      { id: 'trig-cron', name: 'Scheduled Cron', icon: Clock, color: '#eaaa7f', desc: 'Recurring scheduled execution trigger.' }
    ]
  },
  {
    category: 'AI Agents',
    items: [
      { id: 'ai-rca', name: 'Puku RCA Agent', icon: Sparkles, color: '#accb91', desc: 'Correlates Syslog, NetFlow & SNMP anomalies.' },
      { id: 'ai-anomaly', name: 'Traffic Anomaly Classifier', icon: Activity, color: '#accb91', desc: 'Identifies DDoS & micro-burst spikes.' }
    ]
  },
  {
    category: 'Network Actions',
    items: [
      { id: 'act-bgp-shift', name: 'BGP Weight Shift', icon: Network, color: '#9badbd', desc: 'Diverts traffic to standby backup IIG link.' },
      { id: 'act-mikrotik', name: 'MikroTik Reboot / Flush', icon: Server, color: '#9badbd', desc: 'Flushes connection tracking table on router.' },
      { id: 'act-acl', name: 'ACL Firewall Rule Update', icon: ShieldCheck, color: '#9badbd', desc: 'Applies rate-limiting ACL on targeted IP.' }
    ]
  },
  {
    category: 'Logic & Control',
    items: [
      { id: 'log-if', name: 'Conditional Branch (If/Else)', icon: SlidersHorizontal, color: '#ada0c5', desc: 'Evaluates telemetry thresholds before execution.' },
      { id: 'log-approval', name: 'Human Approval Guardrail', icon: ShieldAlert, color: '#ada0c5', desc: 'Pauses workflow until NOC engineer approves.' }
    ]
  }
];

const initialCanvasNodes = [
  {
    id: 'node-1',
    title: 'BGP Flap Trigger',
    type: 'trigger',
    category: 'Triggers',
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
    type: 'ai',
    category: 'AI Agents',
    x: 340,
    y: 100,
    status: 'Running',
    confidence: '94%',
    params: { model: 'Puku-v2.4-NOC', telemetryWindow: '15m' },
    accent: '#accb91'
  },
  {
    id: 'node-3',
    title: 'Human Approval Guardrail',
    type: 'logic',
    category: 'Logic & Control',
    x: 620,
    y: 100,
    status: 'Waiting Approval',
    params: { approver: 'Raihan Ahmed (NOC Lead)', timeout: '30m' },
    accent: '#ada0c5'
  },
  {
    id: 'node-4',
    title: 'BGP Weight Shift',
    type: 'action',
    category: 'Network Actions',
    x: 900,
    y: 100,
    status: 'Queued',
    params: { targetLink: 'Gulshan Link-02', weight: '200' },
    accent: '#9badbd'
  }
];

export default function PukuCanvas() {
  const [nodes, setNodes] = useState(initialCanvasNodes);
  const [selectedNode, setSelectedNode] = useState(initialCanvasNodes[1]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewport, setViewport] = useState('desktop'); // desktop | tablet | mobile
  const [snapGrid, setSnapGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [terminalOpen, setTerminalOpen] = useState(true);

  // Terminal state
  const [termLogs, setTermLogs] = useState([
    'Webflow-style Kyro Workflow Canvas initialized.',
    'Puku AI Connected: 356 Routers stream active.',
    'Type "puku help" or "puku runbook execute" to simulate automated remediation.'
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
    const stage = document.getElementById('webflow-stage');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;

    if (snapGrid) {
      newX = Math.round(newX / 20) * 20;
      newY = Math.round(newY / 20) * 20;
    }

    setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: Math.max(10, newX), y: Math.max(10, newY) } : n));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const addBlockToCanvas = (item) => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      title: item.name,
      type: item.category.toLowerCase(),
      category: item.category,
      x: 100 + (nodes.length * 40) % 400,
      y: 120 + (nodes.length * 30) % 200,
      status: 'Configured',
      params: { created: 'Just now', target: 'Auto-assigned' },
      accent: item.color
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
  };

  const deleteNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
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
        '  puku runbook execute  - Simulate visual workflow execution',
        '  puku nodes list       - List all active blocks on canvas stage',
        '  puku status           - Query Puku AI engine connection',
        '  clear                 - Clear output'
      );
    } else if (cmd === 'puku runbook execute' || cmd === 'run') {
      newLogs.push(
        '[EXECUTOR] Initiating Webflow-style Workflow Runbook...',
        '  [1] Trigger "BGP Flap Trigger" -> Event Fired',
        '  [2] AI Agent "Puku RCA Agent" -> RCA Confidence 94%',
        '  [3] Guardrail "Human Approval Guardrail" -> Paused (Awaiting Raihan Ahmed signature)',
        '[PAUSED] Runbook execution awaiting human authorization.'
      );
    } else {
      newLogs.push(`Executing command: "${cmd}". Type "puku help" for available commands.`);
    }

    setTermLogs(newLogs);
    setTermInput('');
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Standard Kyro Page Heading */}
      <div className="page-heading" style={{ marginBottom: '10px' }}>
        <div>
          <div className="eyebrow">VISUAL WORKFLOW & AUTOMATION BUILDER</div>
          <h1>Puku AI Workflow Canvas<span className="title-dot">.</span></h1>
          <p>Drag-and-drop network automation, AI runbook orchestration, and live CLI execution engine.</p>
        </div>
        <div className="heading-actions">
          <button onClick={() => setTermLogs(prev => [...prev, '[SIMULATOR] Visual runbook test run initiated.'])}>
            <Zap size={14} /> Test Runbook ⚡
          </button>
          <button className="primary" onClick={() => setTermLogs(prev => [...prev, '[DEPLOYER] Workflow published to Link3 NOC cluster.'])}>
            <Check size={14} /> Publish Workflow
          </button>
        </div>
      </div>

      {/* Webflow / WordPress Style Top Control Toolbar Bar */}
      <div className="card" style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c1f21', borderRadius: '10px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#e6e7e7' }}>Viewport:</span>
          <div style={{ display: 'flex', gap: '4px', background: '#111314', padding: '3px', borderRadius: '6px' }}>
            <button
              onClick={() => setViewport('desktop')}
              style={{ padding: '4px 8px', border: 'none', background: viewport === 'desktop' ? '#332a24' : 'transparent', color: viewport === 'desktop' ? '#f2b287' : '#84898e', fontSize: '10px', borderRadius: '4px' }}
            >
              <Monitor size={13} /> Desktop
            </button>
            <button
              onClick={() => setViewport('tablet')}
              style={{ padding: '4px 8px', border: 'none', background: viewport === 'tablet' ? '#332a24' : 'transparent', color: viewport === 'tablet' ? '#f2b287' : '#84898e', fontSize: '10px', borderRadius: '4px' }}
            >
              <Tablet size={13} /> Tablet
            </button>
          </div>

          <span className="header-separator" style={{ height: '16px' }} />

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '10px', color: '#84898e' }}>
            <button onClick={() => setZoom(Math.max(60, zoom - 10))} style={{ padding: '3px 7px', fontSize: '10px' }}>-</button>
            <span>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(140, zoom + 10))} style={{ padding: '3px 7px', fontSize: '10px' }}>+</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '10px', color: '#84898e', cursor: 'pointer' }}>
            <input type="checkbox" checked={snapGrid} onChange={e => setSnapGrid(e.target.checked)} />
            Snap to Grid (20px)
          </label>
          <span className="badge green">Live Telemetry Linked</span>
        </div>
      </div>

      {/* Main Webflow 3-Column Layout: Left Palette + Center Stage Canvas + Right Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: '16px', alignItems: 'start' }}>
        
        {/* Left Column: Webflow / WordPress Block Library Drawer */}
        <section className="card" style={{ height: '560px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-heading" style={{ borderBottom: '1px solid #2b2e30', paddingBottom: '10px' }}>
            <h2><Layers size={15} />Elements & Blocks</h2>
          </div>

          <div style={{ padding: '12px 16px 8px 16px' }}>
            <div className="search-field" style={{ minWidth: 'auto', background: '#111314', padding: '6px 10px', borderRadius: '6px' }}>
              <Search size={14} />
              <input
                placeholder="Search blocks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ fontSize: '10px' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, padding: '0 16px 16px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {blockLibrary.map(section => (
              <div key={section.category}>
                <div className="eyebrow" style={{ marginBottom: '8px', color: '#84898e' }}>{section.category}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {section.items
                    .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(item => {
                      const IconComp = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => addBlockToCanvas(item)}
                          style={{
                            padding: '10px 12px',
                            background: '#202325',
                            border: '1px solid #35393b',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#eaaa7f'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#35393b'}
                        >
                          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${item.color}22`, display: 'grid', placeItems: 'center', color: item.color, flexShrink: 0 }}>
                            <IconComp size={14} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '11px', color: '#e6e7e7', display: 'block' }}>{item.name}</strong>
                            <span style={{ fontSize: '9px', color: '#84898e', lineHeight: '1.3', display: 'block', marginTop: '2px' }}>{item.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Center Column: Interactive Drag & Drop Stage Canvas */}
        <section
          id="webflow-stage"
          className="card"
          style={{
            height: '560px',
            position: 'relative',
            background: '#151719',
            backgroundImage: snapGrid ? 'radial-gradient(#393e42 1px, transparent 1px)' : 'none',
            backgroundSize: '20px 20px',
            overflow: 'hidden'
          }}
        >
          {/* Stage Bezier Connecting Cables SVG */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {nodes.slice(0, -1).map((node, idx) => {
              const nextNode = nodes[idx + 1];
              if (!nextNode) return null;
              return (
                <path
                  key={node.id}
                  d={`M ${node.x + 210} ${node.y + 40} C ${node.x + 260} ${node.y + 40}, ${nextNode.x - 40} ${nextNode.y + 40}, ${nextNode.x} ${nextNode.y + 40}`}
                  fill="none"
                  stroke={node.accent || '#eaaa7f'}
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              );
            })}
          </svg>

          {/* Render Drag & Drop Nodes */}
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
                  width: '210px',
                  background: isSelected ? '#292f33' : '#202325',
                  borderRadius: '10px',
                  border: '1px solid ' + (isSelected ? node.accent : '#35393b'),
                  boxShadow: isSelected ? `0 0 20px ${node.accent}44` : '0 6px 18px #0008',
                  zIndex: isSelected ? 15 : 5,
                  cursor: 'grab',
                  userSelect: 'none',
                  padding: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 650, textTransform: 'uppercase', color: node.accent, background: `${node.accent}22`, padding: '2px 6px', borderRadius: '4px' }}>
                    {node.category || node.type}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                    style={{ padding: '2px 4px', border: 'none', background: 'transparent', color: '#84898e', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <strong style={{ fontSize: '11px', color: '#e6e7e7', display: 'block', marginBottom: '6px' }}>
                  {node.title}
                </strong>

                {node.device && (
                  <div style={{ fontSize: '9px', color: '#84898e', background: '#111314', padding: '4px 6px', borderRadius: '4px', marginBottom: '6px' }}>
                    Device: {node.device}
                  </div>
                )}

                {node.confidence && (
                  <div style={{ fontSize: '9px', color: '#accb91', background: '#111314', padding: '4px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    RCA Confidence: {node.confidence}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #303335' }}>
                  <span className={`badge ${node.status === 'Running' ? 'orange' : node.status === 'Active' ? 'green' : 'neutral'}`} style={{ fontSize: '8px' }}>
                    {node.status}
                  </span>
                  <span style={{ fontSize: '8px', color: '#737b82' }}>Drag to move</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Right Column: Webflow Inspector Settings Panel */}
        <section className="card" style={{ height: '560px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-heading" style={{ borderBottom: '1px solid #2b2e30', paddingBottom: '10px' }}>
            <h2><SlidersHorizontal size={15} />Element Inspector</h2>
          </div>

          {selectedNode ? (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#84898e', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Block Label</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={e => {
                    const title = e.target.value;
                    setSelectedNode({ ...selectedNode, title });
                    setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, title } : n));
                  }}
                  style={{ width: '100%', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#84898e', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Execution State</label>
                <select
                  value={selectedNode.status}
                  onChange={e => {
                    const status = e.target.value;
                    setSelectedNode({ ...selectedNode, status });
                    setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, status } : n));
                  }}
                  style={{ width: '100%', fontSize: '10px' }}
                >
                  {['Active', 'Running', 'Waiting Approval', 'Queued', 'Configured'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#84898e', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Parameters & Config</label>
                <div style={{ background: '#111314', border: '1px solid #303335', borderRadius: '7px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
                  {Object.entries(selectedNode.params || {}).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="muted">{k}:</span>
                      <strong style={{ color: '#d0d6da' }}>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #2b2e30' }}>
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  style={{ width: '100%', background: '#3c2929', borderColor: '#5c3636', color: '#d59994', fontSize: '10px' }}
                >
                  <Trash2 size={13} /> Delete Element
                </button>
              </div>
            </div>
          ) : (
            <div className="empty" style={{ padding: '40px 20px' }}>
              <Compass size={24} />
              <h3 style={{ fontSize: '12px' }}>No Element Selected</h3>
              <p style={{ fontSize: '10px' }}>Click any node block on the visual stage to inspect properties.</p>
            </div>
          )}
        </section>
      </div>

      {/* Bottom Docked Terminal Bar matching Kyro styling */}
      {terminalOpen && (
        <section className="card" style={{ background: '#151719' }}>
          <div className="card-heading" style={{ borderBottom: '1px solid #2b2e30', paddingBottom: '10px' }}>
            <h2><Terminal size={15} />Interactive Execution Terminal (Puku CLI)</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="badge green">Puku AI Connected</span>
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
                placeholder="Type CLI command (e.g. puku runbook execute, puku help, clear)..."
                style={{ flex: 1, padding: '6px 10px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <button className="primary" style={{ padding: '6px 14px' }}>Execute</button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
