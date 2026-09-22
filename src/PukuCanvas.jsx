import React, { useState, useRef } from 'react';
import {
  Play, Sparkles, Plus, Terminal, RefreshCw, Layers, CheckCircle2, ShieldAlert,
  Cpu, ArrowRight, MessageSquare, Code, Settings, Trash2, Lock, PlusCircle,
  Search, SlidersHorizontal, ChevronRight, ChevronDown, Check, HelpCircle,
  FileCode, Zap, AlertTriangle, Activity, Send, Paperclip, ExternalLink, X, Star,
  Copy, Maximize2, Monitor, Smartphone, Tablet, Undo, Redo, Eye, ShieldCheck,
  Grid, Compass, Database, Radio, Globe, Server, Network, Wifi, ListFilter,
  GripVertical, MoreVertical, Share2, CornerDownRight, Box, CpuIcon
} from 'lucide-react';

const leftSidebarItems = {
  Input: [
    { id: 'in-1', name: 'BGP Flap Event', sub: 'telemetry.kyro.net v1.0.0', type: 'Input', inputs: [], outputs: ['BGP Event', 'Holdtime Log'] },
    { id: 'in-2', name: 'Optical Rx Power Alert', sub: 'sfp.observium.net v1.0.0', type: 'Input', inputs: [], outputs: ['Rx Signal', 'Loss %'] },
    { id: 'in-3', name: 'NetFlow Packet Stream', sub: 'kafka.flow.net v1.0.0', type: 'Input', inputs: [], outputs: ['IP Flow', 'Bandwidth'] }
  ],
  AI: [
    { id: 'ai-1', name: 'Puku RCA Agent', sub: 'puku.ai.kyro v2.4.0', type: 'AI', inputs: ['Telemetry', 'Logs'], outputs: ['Root Cause', 'Confidence'] },
    { id: 'ai-2', name: 'Intent Classifier', sub: 'nlu.watson.net v1.0.0', type: 'AI', inputs: ['Text'], outputs: ['Intent', 'Entities'] },
    { id: 'ai-3', name: 'Anomaly Detector', sub: 'prometheus.metrics v1.2.0', type: 'AI', inputs: ['Metrics'], outputs: ['Anomaly Score'] }
  ],
  Output: [
    { id: 'out-1', name: 'BGP Path Reroute', sub: 'cisco.router.net v1.0.0', type: 'Output', inputs: ['Trigger Action'], outputs: [] },
    { id: 'out-2', name: 'NOC Ticket & Advisory', sub: 'servicenow.api v1.0.0', type: 'Output', inputs: ['Incident Summary'], outputs: [] },
    { id: 'out-3', name: 'Slack / SMS Alert', sub: 'slack.chat.com v1.0.0', type: 'Output', inputs: ['Text Message'], outputs: [] }
  ]
};

const initialStageNodes = [
  {
    id: 'stage-1',
    title: 'BGP Flap Event',
    sub: 'telemetry.kyro.net v1.0.0',
    type: 'Input',
    status: 'Ready',
    x: 60,
    y: 120,
    inputs: [],
    outputs: ['BGP Event', 'Holdtime Log'],
    accent: '#38BDF8'
  },
  {
    id: 'stage-2',
    title: 'Puku RCA Agent',
    sub: 'puku.ai.kyro v2.4.0',
    type: 'AI',
    status: 'Ready',
    x: 360,
    y: 80,
    inputs: ['Telemetry', 'Logs'],
    outputs: ['Root Cause', 'Confidence Score'],
    accent: '#A855F7'
  },
  {
    id: 'stage-3',
    title: 'BGP Path Reroute',
    sub: 'cisco.router.net v1.0.0',
    type: 'Output',
    status: 'Ready',
    x: 680,
    y: 120,
    inputs: ['Trigger Action'],
    outputs: [],
    accent: '#4ADE80'
  }
];

const rightPaletteCategories = [
  {
    category: 'Favourites',
    items: [
      { name: 'AI Keyword', desc: 'Keyword to start a workflow, use with or without argument.' },
      { name: 'Script filter', desc: "Dynamically populate Alfred's results with your own scripts." },
      { name: 'Run script', desc: 'Run commands in macOS/Linux using various languages & scripts.' }
    ]
  },
  {
    category: 'Triggers',
    items: [
      { name: 'Hotkey', desc: 'Trigger workflow via custom keyboard combination.' },
      { name: 'Universal action', desc: 'Action trigger on selected text or URLs.' }
    ]
  },
  {
    category: 'Inputs',
    items: [
      { name: 'Keyword', desc: 'Keyword to start a workflow.' },
      { name: 'File filter', desc: 'Customized file search scope or path.' },
      { name: 'Running apps', desc: 'List currently active OS background processes.' }
    ]
  }
];

export default function PukuCanvas() {
  const [activeTab, setActiveTab] = useState('AI'); // 'Input' | 'AI' | 'Output'
  const [searchQuery, setSearchQuery] = useState('');
  const [stageNodes, setStageNodes] = useState(initialStageNodes);
  const [selectedNode, setSelectedNode] = useState(initialStageNodes[1]);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Terminal state
  const [termLogs, setTermLogs] = useState([
    '[14:29:57.980] Debugger initialized - Conveyor AI Engine active',
    '[14:29:58.102] Connected to Link3 Telemetry Pipeline (356 core routers)',
    '[14:29:58.450] Type "puku help" or "puku analyze INC-9042" to execute CLI commands.'
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
    const stage = document.getElementById('conveyor-stage');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const newX = Math.max(10, Math.min(rect.width - 250, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 220, e.clientY - rect.top - dragOffset.y));

    setStageNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const addSidebarItemToStage = (item) => {
    const newNode = {
      id: `stage-${stageNodes.length + 1}`,
      title: item.name,
      sub: item.sub,
      type: item.type,
      status: 'Ready',
      x: 120 + (stageNodes.length * 50) % 350,
      y: 100 + (stageNodes.length * 40) % 250,
      inputs: item.inputs || ['Input'],
      outputs: item.outputs || ['Output'],
      accent: item.type === 'Input' ? '#38BDF8' : item.type === 'AI' ? '#A855F7' : '#4ADE80'
    };
    setStageNodes([...stageNodes, newNode]);
    setSelectedNode(newNode);
  };

  const handleTermSubmit = (e) => {
    e.preventDefault();
    if (!termInput.trim()) return;
    const cmd = termInput.trim();
    const timestamp = new Date().toLocaleTimeString();
    const newLogs = [...termLogs, `[${timestamp}] kyro-cli> ${cmd}`];

    if (cmd === 'clear') {
      setTermLogs([]);
      setTermInput('');
      return;
    } else if (cmd === 'puku help' || cmd === 'help') {
      newLogs.push(
        '[PUKU CLI] Available AI Commands:',
        '  puku analyze <INC-ID>  - Run AI root cause analysis',
        '  puku runbook execute  - Execute visual workflow canvas',
        '  puku pipeline status  - Query Kafka telemetry stream health',
        '  clear                 - Clear terminal output'
      );
    } else if (cmd.startsWith('puku analyze')) {
      newLogs.push(
        '[PUKU AI ANALYSIS] INC-9042 Spotlight:',
        '  • Probable Root Cause (94% Conf): SFP Optical Rx Power drop (-28.4 dBm) on Ge0/0/1',
        '  • Affected Impact: 12,846 subscribers, 14 enterprise SLA circuits',
        '  • Recommended Action: Trigger BGP weight shift to backup link'
      );
    } else if (cmd === 'puku runbook execute' || cmd === 'run') {
      newLogs.push(
        '[EXECUTOR] Running Conveyor AI Workflow...',
        '  [+] Stage 1: BGP Flap Event -> Triggered',
        '  [+] Stage 2: Puku RCA Agent -> Root Cause Identified (94% Conf)',
        '  [+] Stage 3: BGP Path Reroute -> Executed Successfully',
        '[SUCCESS] Conveyor AI Workflow execution finished in 1.4s'
      );
    } else {
      newLogs.push(`Executed command: "${cmd}". Type "puku help" for available commands.`);
    }

    setTermLogs(newLogs);
    setTermInput('');
  };

  const triggerDeploy = () => {
    setIsDeploying(true);
    const timestamp = new Date().toLocaleTimeString();
    setTermLogs(prev => [...prev, `[${timestamp}] [DEPLOYMENT] Deploying Conveyor AI Workflow to Link3 NOC Cluster...`]);
    setTimeout(() => {
      setIsDeploying(false);
      setTermLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [DEPLOYMENT SUCCESS] Workflow deployed & active.`]);
    }, 1400);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Conveyor AI Top Navigation Bar */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        background: '#16181A',
        border: '1px solid #2B2E31',
        borderRadius: '10px',
        padding: '12px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#84898E', fontWeight: 550 }}>Projects</span>
          <span style={{ color: '#4B4F53' }}>/</span>
          <span style={{ fontSize: '13px', color: '#84898E', fontWeight: 550 }}>Slack Bots</span>
          <span style={{ color: '#4B4F53' }}>/</span>
          <span style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 700 }}>Developer Bot</span>
          <span className="badge neutral" style={{ fontSize: '9px' }}>Not deployed</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={{ fontSize: '11px', padding: '7px 12px' }}>Save draft 💾</button>
          <button style={{ fontSize: '11px', padding: '7px 12px' }}>Manage tokens 🛡️</button>
          <button
            className="primary"
            onClick={triggerDeploy}
            disabled={isDeploying}
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
              borderColor: '#7C3AED',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '11px',
              padding: '7px 16px'
            }}
          >
            {isDeploying ? <RefreshCw className="animate-spin" size={13} /> : <Zap size={13} />}
            {isDeploying ? 'Deploying...' : 'Deploy 🚀'}
          </button>
          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            style={{
              padding: '7px 12px',
              background: terminalOpen ? 'rgba(168, 85, 247, 0.2)' : '#202325',
              borderColor: terminalOpen ? '#A855F7' : '#393C3E',
              color: terminalOpen ? '#C084FC' : '#D8DBDE',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Toggle Interactive Puku Terminal"
          >
            <Terminal size={14} /> Terminal
          </button>
        </div>
      </div>

      {/* Conveyor AI Main Workspace: Left Sidebar + Center Stage */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', alignItems: 'start' }}>
        
        {/* Left Column: Conveyor AI Accordion Sidebar (Input / AI / Output) */}
        <section className="card" style={{ height: '620px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px 10px 16px', borderBottom: '1px solid #2B2E31' }}>
            <div className="eyebrow" style={{ marginBottom: '10px' }}>AGENTS & COMPONENTS</div>
            {/* Category Tabs: Input | AI | Output */}
            <div style={{ display: 'flex', background: '#111314', padding: '3px', borderRadius: '7px', border: '1px solid #303335' }}>
              {['Input', 'AI', 'Output'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    flex: 1,
                    padding: '5px',
                    borderRadius: '5px',
                    border: 'none',
                    background: activeTab === t ? '#332A24' : 'transparent',
                    color: activeTab === t ? '#F2B287' : '#84898E',
                    fontWeight: 700,
                    fontSize: '10px'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div style={{ padding: '10px 16px' }}>
            <div className="search-field" style={{ minWidth: 'auto', background: '#111314', padding: '6px 10px', borderRadius: '6px' }}>
              <Search size={13} />
              <input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ fontSize: '10px' }}
              />
            </div>
          </div>

          {/* Draggable Component List Cards with 6-dot handle */}
          <div style={{ flex: 1, padding: '0 16px 16px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(leftSidebarItems[activeTab] || [])
              .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(item => (
                <div
                  key={item.id}
                  onClick={() => addSidebarItemToStage(item)}
                  style={{
                    padding: '10px 12px',
                    background: '#202325',
                    border: '1px solid #35393B',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#EAAA7F'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#35393B'}
                >
                  <div>
                    <strong style={{ fontSize: '11px', color: '#E6E7E7', display: 'block' }}>{item.name}</strong>
                    <span style={{ fontSize: '9px', color: '#84898E', display: 'block', marginTop: '2px' }}>{item.sub}</span>
                  </div>
                  <GripVertical size={14} color="#64748B" />
                </div>
              ))}
          </div>
        </section>

        {/* Center Column: Conveyor AI Stage Canvas */}
        <section
          id="conveyor-stage"
          className="card"
          style={{
            height: '620px',
            position: 'relative',
            background: '#141618',
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
            overflow: 'hidden'
          }}
        >
          {/* Top Stage Bar: OpenAI Helper Title Bar */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #2B2E31',
            background: 'rgba(20, 22, 24, 0.9)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>OpenAI helper</span>
                <span className="badge orange" style={{ fontSize: '8px' }}>Configure workflow</span>
              </div>
              <p style={{ fontSize: '10px', color: '#84898E', margin: '2px 0 0 0' }}>Uses OpenAI to get do multiple things — v1.0.4</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setPaletteOpen(!paletteOpen)} style={{ padding: '5px 10px', fontSize: '10px' }}>
                <Plus size={13} /> Add Palette
              </button>
              <button style={{ padding: '5px 8px', fontSize: '10px' }}>{`{x}`}</button>
              <button style={{ padding: '5px 8px', fontSize: '10px' }}>📤</button>
            </div>
          </div>

          {/* Floating Zoom & Lock Controls on Bottom Left */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: '#202325',
            border: '1px solid #35393B',
            borderRadius: '6px',
            padding: '4px',
            zIndex: 20
          }}>
            <button style={{ padding: '4px', border: 'none', background: 'transparent', color: '#D8DBDE' }}><Plus size={14} /></button>
            <button style={{ padding: '4px', border: 'none', background: 'transparent', color: '#D8DBDE' }}>-</button>
            <button style={{ padding: '4px', border: 'none', background: 'transparent', color: '#D8DBDE' }}><Maximize2 size={12} /></button>
            <button style={{ padding: '4px', border: 'none', background: 'transparent', color: '#D8DBDE' }}><Lock size={12} /></button>
          </div>

          {/* Floating Right Palette Popover (OpenAI Helper Style) */}
          {paletteOpen && (
            <div style={{
              position: 'absolute',
              top: '60px',
              right: '20px',
              width: '260px',
              background: '#202628',
              border: '1px solid #4B5559',
              borderRadius: '10px',
              boxShadow: '0 16px 40px #0009',
              zIndex: 30,
              padding: '12px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Object Palette</span>
                <button className="text-button" onClick={() => setPaletteOpen(false)}>✕</button>
              </div>
              {rightPaletteCategories.map(sec => (
                <div key={sec.category} style={{ marginBottom: '10px' }}>
                  <div className="eyebrow" style={{ marginBottom: '4px', fontSize: '8px' }}>v {sec.category}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sec.items.map(item => (
                      <div key={item.name} style={{ padding: '6px 8px', background: '#151719', borderRadius: '5px', fontSize: '10px' }}>
                        <strong style={{ color: '#E6E7E7', display: 'block' }}>{item.name}</strong>
                        <span style={{ color: '#84898E', fontSize: '8px' }}>{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dotted SVG Connecting Cables */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            <path
              d={`M ${stageNodes[0].x + 230} ${stageNodes[0].y + 60} C ${stageNodes[0].x + 280} ${stageNodes[0].y + 60}, ${stageNodes[1].x - 50} ${stageNodes[1].y + 60}, ${stageNodes[1].x} ${stageNodes[1].y + 60}`}
              fill="none"
              stroke="#A855F7"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <path
              d={`M ${stageNodes[1].x + 230} ${stageNodes[1].y + 60} C ${stageNodes[1].x + 280} ${stageNodes[1].y + 60}, ${stageNodes[2].x - 50} ${stageNodes[2].y + 60}, ${stageNodes[2].x} ${stageNodes[2].y + 60}`}
              fill="none"
              stroke="#4ADE80"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
          </svg>

          {/* Conveyor AI Node Cards */}
          {stageNodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <div
                key={node.id}
                onMouseDown={e => handleMouseDown(e, node)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: '230px',
                  background: isSelected ? '#292F33' : '#1C2023',
                  borderRadius: '10px',
                  border: '1px solid ' + (isSelected ? '#A855F7' : '#35393B'),
                  boxShadow: isSelected ? '0 0 24px rgba(168, 85, 247, 0.4)' : '0 8px 24px #0008',
                  zIndex: isSelected ? 15 : 5,
                  cursor: 'grab',
                  userSelect: 'none',
                  padding: '12px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80' }} />
                    <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: node.accent }}>{node.type}</span>
                  </div>
                  <MoreVertical size={13} color="#84898E" />
                </div>

                {/* Node Title */}
                <strong style={{ fontSize: '12px', color: '#F8FAFC', display: 'block', marginBottom: '2px' }}>{node.title}</strong>
                <span style={{ fontSize: '9px', color: '#84898E', display: 'block', marginBottom: '10px' }}>{node.sub}</span>

                {/* Inputs & Outputs Handles (Conveyor AI Style) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94A3B8', borderTop: '1px solid #2D3235', paddingTop: '8px' }}>
                  <div>
                    {node.inputs.map((inp, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A855F7', display: 'inline-block' }} />
                        <span>{inp}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {node.outputs.map((out, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '2px' }}>
                        <span>{out}</span>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Togglable Terminal & Debugger Bar (Opens when Terminal Icon is Clicked) */}
      {terminalOpen && (
        <section className="card" style={{ background: '#151719' }}>
          <div className="card-heading" style={{ borderBottom: '1px solid #2B2E31', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={15} color="#A855F7" />
              <h2>Debugger & Interactive Puku CLI Terminal</h2>
              <span className="badge green" style={{ fontSize: '8px' }}>Puku AI Connected</span>
            </div>
            <button className="text-button" onClick={() => setTerminalOpen(false)}>Close Terminal ✕</button>
          </div>

          <div style={{ padding: '14px 21px', fontFamily: 'monospace', fontSize: '11px' }}>
            <div style={{ maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
              {termLogs.map((l, i) => (
                <div key={i} style={{ color: l.includes('kyro-cli>') ? '#EAAA7F' : l.includes('SUCCESS') ? '#ACCB91' : '#D0D6DA' }}>{l}</div>
              ))}
            </div>

            <form onSubmit={handleTermSubmit} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ACCB91', fontWeight: 600 }}>kyro-cli&gt;</span>
              <input
                type="text"
                value={termInput}
                onChange={e => setTermInput(e.target.value)}
                placeholder="Type CLI command (e.g. puku analyze INC-9042, puku runbook execute, help, clear)..."
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
