import React, { useState, useRef } from 'react';
import {
  Play, Sparkles, Plus, Terminal, RefreshCw, Layers, CheckCircle2, ShieldAlert,
  Cpu, ArrowRight, MessageSquare, Code, Settings, Trash2, Lock, PlusCircle,
  Search, SlidersHorizontal, ChevronRight, ChevronDown, Check, HelpCircle,
  FileCode, Zap, AlertTriangle, Activity, Send, Paperclip, ExternalLink, X, Star,
  CornerDownRight, Copy, Move, Maximize2, Minimize2
} from 'lucide-react';

const initialNodes = [
  {
    id: 'node-1',
    title: 'Schedule trigger',
    type: 'trigger',
    category: 'Triggers',
    x: 280,
    y: 70,
    duration: '0.5s',
    history: { last: 'Today • 14.23', next: 'Tomorrow • 14.23' },
    metrics: { count: '0.1', id: '30', runs: '1' },
    accent: '#eaaa7f'
  },
  {
    id: 'node-2',
    title: 'API Request',
    type: 'action',
    category: 'Network',
    x: 380,
    y: 260,
    duration: '0.5s',
    method: 'GET',
    endpoint: '/v1/users',
    metrics: { count: '0.4', id: '80', runs: '1' },
    accent: '#accb91'
  },
  {
    id: 'node-3',
    title: 'Conditional',
    type: 'logic',
    category: 'Logic',
    x: 680,
    y: 80,
    duration: '0.5s',
    condition: '{mail} != null',
    trueAction: 'filter(mail_item)',
    falseAction: 'error()',
    metrics: { count: '0.2', id: '50', runs: '2' },
    accent: '#d9a077'
  }
];

const paletteItems = [
  {
    category: 'Favourites',
    items: [
      { name: 'AI Keyword', desc: 'Keyword to start a workflow, use with or without argument.' },
      { name: 'Script filter', desc: "Dynamically populate Alfred's results with your own scripts." },
      { name: 'Run script', desc: 'Run commands in macOS/Linux using various languages & scripts.' }
    ]
  },
  {
    category: 'Inputs',
    items: [
      { name: 'Keyword', desc: 'Keyword to start a workflow, use with or without argument.' },
      { name: 'File filter', desc: 'Create a customized file search; specify search scope or file.' },
      { name: 'Running apps', desc: 'Show a list of currently running apps in OS.' }
    ]
  }
];

export default function PukuCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState(initialNodes[0]);
  const [leftTab, setLeftTab] = useState('chat');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalTab, setTerminalTab] = useState('terminal');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'puku',
      text: 'Create an email filter trigger that will be placed at this link: https://cansaas.io/inquiry. If a client contacts us, the system should filter the email and decide if it\'s spam or not.'
    },
    {
      sender: 'puku',
      text: 'Got it! I\'ll set up a mail filter trigger linked to your link https://cansaas.io/inquiry. Here\'s how it works:\n\nWorkflow V1\n1 🔔 Trigger Setup: Every time a form is submitted on the inquiry page, it will trigger an automated workflow.\n2 📧 Incoming Email Parsing: Extract email content including subject, sender address, and message body.\n3 🛡️ Spam Filter: Run content through spam detection logic.\n4 🔀 Decision Branch: If clean, route to engineering ticket; otherwise flag for review.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Terminal State
  const [termLogs, setTermLogs] = useState([
    '1 ~ $> import markers',
    '2 ~ $> cd ./Automation/draft',
    '3 ~/Automation/draft $> marker ./"Untitled Project.json"',
    '4 ~/Automation/draft $> puku status',
    '[PUKU AI] Connected to Link3 Telemetry Pipeline (356 core routers).',
    '[PUKU AI] Runbook engine active. Type "puku help" for available AI commands.'
  ]);
  const [termInput, setTermInput] = useState('');
  const termEndRef = useRef(null);

  // Dragging Node State
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
    const canvasElem = document.getElementById('kyro-canvas-board');
    if (!canvasElem) return;
    const rect = canvasElem.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 250, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(20, Math.min(rect.height - 220, e.clientY - rect.top - dragOffset.y));

    setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleTermSubmit = (e) => {
    e.preventDefault();
    if (!termInput.trim()) return;
    const cmd = termInput.trim();
    const nextLineNum = termLogs.filter(l => l.includes('~$')).length + 1;
    const newLogs = [...termLogs, `${nextLineNum} ~/Automation/draft $> ${cmd}`];

    if (cmd === 'clear') {
      setTermLogs(['1 ~/Automation/draft $>']);
      setTermInput('');
      return;
    } else if (cmd === 'puku help' || cmd === 'help') {
      newLogs.push(
        '[PUKU CLI] Available AI commands:',
        '  puku analyze <INC-ID>  - Run deep AI root-cause analysis',
        '  puku runbook execute  - Execute active automation workflow',
        '  puku topology         - Render network dependency graph',
        '  puku impact           - Calculate B2B and residential SLA impact',
        '  ping <IP> / ssh <HOST>- Standard network diagnostic commands'
      );
    } else if (cmd.startsWith('puku analyze') || cmd.startsWith('puku inspect')) {
      newLogs.push(
        '------------------------------------------------------------',
        '[PUKU AI ANALYSIS] Incident INC-9042 Spotlight',
        '• Root Cause (94% Conf): Optical Rx Power drop (-28.4 dBm) on Ge0/0/1',
        '• Correlated Events: 142 alerts, 2 recent router config diffs',
        '• Recommended Action: Trigger BGP path shift to secondary Gulshan link',
        '------------------------------------------------------------'
      );
    } else if (cmd === 'puku runbook execute' || cmd === 'run') {
      newLogs.push(
        '[EXECUTOR] Starting workflow "Untitled Project.json"...',
        '  [+] Node 1 (Schedule trigger): Fired (0.5s)',
        '  [+] Node 2 (API Request): GET /v1/users -> 200 OK (0.5s)',
        '  [+] Node 3 (Conditional): {mail} != null -> True (0.5s)',
        '[SUCCESS] Automation workflow completed in 1.5s'
      );
    } else {
      newLogs.push(`[PUKU CLI] Executed command: "${cmd}". Type "puku help" for available commands.`);
    }

    setTermLogs(newLogs);
    setTermInput('');
  };

  const handleChatSubmit = (e) => {
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
          text: `Puku AI processed: "${text}". Workflow graph and CLI terminal updated.`
        }
      ]);
    }, 700);
  };

  const addNodeFromPalette = (item) => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      title: item.name,
      type: item.name.includes('Script') ? 'action' : 'logic',
      category: 'User',
      x: 320 + Math.random() * 60,
      y: 160 + Math.random() * 60,
      duration: '0.5s',
      metrics: { count: '0.1', id: '30', runs: '1' },
      accent: item.name.includes('Script') ? '#eaaa7f' : '#accb91'
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    setPaletteOpen(false);
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
          <div className="eyebrow">VISUAL RUNBOOK & AUTOMATION ENGINE</div>
          <h1>Puku AI Workflow Canvas<span className="title-dot">.</span></h1>
          <p>Drag-and-drop node graph runner with embedded CLI terminal and Puku AI assistant.</p>
        </div>
        <div className="heading-actions">
          <button onClick={() => setTermLogs(prev => [...prev, '[SIMULATOR] Workflow test run completed.'])}>
            <Zap size={14} /> Test Run ⚡
          </button>
          <button className="primary" onClick={() => setPaletteOpen(!paletteOpen)}>
            <Plus size={15} /> Add Node
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace Container matching Kyro styling */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Panel: Puku AI Assistant Panel */}
        <section className="card" style={{ height: '560px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-heading" style={{ borderBottom: '1px solid #2b2e30', paddingBottom: '12px' }}>
            <h2><Sparkles size={15} />Puku Assistant</h2>
            <span className="badge green">Online</span>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: msg.sender === 'user' ? '#332a24' : '#202325',
                  border: '1px solid ' + (msg.sender === 'user' ? '#554032' : '#35393b'),
                  fontSize: '11px',
                  color: msg.sender === 'user' ? '#f2b287' : '#d0d6da',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #2b2e30', background: '#17191b' }}>
            <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a follow-up..."
                style={{ flex: 1, fontSize: '11px' }}
              />
              <button className="primary" style={{ padding: '6px 10px' }}><Send size={13} /></button>
            </form>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '9px', color: '#7c8588' }}>
              <span>Cost: $20.12</span>
              <span>Tokens: 4,200</span>
              <span>Uptime: 1d 4h</span>
            </div>
          </div>
        </section>

        {/* Center: Canvas Board Graph Area */}
        <section
          id="kyro-canvas-board"
          className="card"
          style={{
            height: '560px',
            position: 'relative',
            background: '#17191b',
            backgroundImage: 'radial-gradient(#393e42 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            overflow: 'hidden'
          }}
        >
          {/* Palette Popover */}
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
                <span>Node Library</span>
                <button className="text-button" onClick={() => setPaletteOpen(false)}>✕</button>
              </div>
              {paletteItems.map(section => (
                <div key={section.category} style={{ marginBottom: '10px' }}>
                  <div className="eyebrow" style={{ marginBottom: '6px' }}>{section.category}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {section.items.map(item => (
                      <button
                        key={item.name}
                        onClick={() => addNodeFromPalette(item)}
                        style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', fontSize: '10px', padding: '6px 8px' }}
                      >
                        <strong>{item.name}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bezier Cables SVG */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            <path
              d={`M ${nodes[0].x + 220} ${nodes[0].y + 50} C ${nodes[0].x + 270} ${nodes[0].y + 50}, ${nodes[1].x - 40} ${nodes[1].y + 50}, ${nodes[1].x} ${nodes[1].y + 50}`}
              fill="none"
              stroke="#eaaa7f"
              strokeWidth="2"
            />
            <path
              d={`M ${nodes[1].x + 220} ${nodes[1].y + 50} C ${nodes[1].x + 270} ${nodes[1].y + 50}, ${nodes[2].x - 40} ${nodes[2].y + 50}, ${nodes[2].x} ${nodes[2].y + 50}`}
              fill="none"
              stroke="#accb91"
              strokeWidth="2"
            />
          </svg>

          {/* Canvas Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: '220px',
                  background: isSelected ? '#292f33' : '#202426',
                  borderRadius: '10px',
                  border: '1px solid ' + (isSelected ? node.accent : '#394044'),
                  boxShadow: '0 6px 18px #0006',
                  zIndex: isSelected ? 15 : 5,
                  cursor: 'grab',
                  userSelect: 'none'
                }}
              >
                <div style={{ padding: '10px 12px', borderBottom: '1px solid #333a3e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="dot" style={{ background: node.accent }} />
                    <strong style={{ fontSize: '11px', color: '#e6e7e7' }}>{node.title}</strong>
                  </div>
                  <span className="muted" style={{ fontSize: '10px' }}>...</span>
                </div>
                <div style={{ padding: '10px 12px', fontSize: '10px', color: '#8d98a0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#181b1d', padding: '4px 6px', borderRadius: '4px' }}>
                    <span>Duration</span>
                    <strong style={{ color: '#d0d6da' }}>{node.duration}</strong>
                  </div>
                  {node.endpoint && (
                    <div style={{ background: '#181b1d', padding: '4px 6px', borderRadius: '4px' }}>
                      <span style={{ color: '#accb91', fontWeight: 600, marginRight: '4px' }}>{node.method}</span>
                      <span>{node.endpoint}</span>
                    </div>
                  )}
                  {node.condition && (
                    <div style={{ background: '#181b1d', padding: '4px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      <span style={{ color: '#eaaa7f' }}>{node.condition}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Embedded Terminal Console matching Kyro styling */}
      <section className="card" style={{ background: '#151719' }}>
        <div className="card-heading" style={{ borderBottom: '1px solid #2b2e30', paddingBottom: '10px' }}>
          <h2><Terminal size={15} />Interactive Terminal Console (Puku CLI)</h2>
          <div style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
            <span className="badge green">Puku CLI Active</span>
            <span className="badge neutral">1: Node</span>
          </div>
        </div>

        <div style={{ padding: '14px 21px', fontFamily: 'monospace', fontSize: '11px' }}>
          <div style={{ maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
            {termLogs.map((l, i) => (
              <div key={i} style={{ color: l.includes('~$') ? '#efa476' : l.includes('SUCCESS') ? '#accb91' : '#d0d6da' }}>{l}</div>
            ))}
            <div ref={termEndRef} />
          </div>

          <form onSubmit={handleTermSubmit} style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#accb91', fontWeight: 600 }}>~/Automation/draft $&gt;</span>
            <input
              type="text"
              value={termInput}
              onChange={e => setTermInput(e.target.value)}
              placeholder="Type CLI command (e.g. puku analyze INC-9042, puku runbook execute, ping 10.24.1.1, help)..."
              style={{ flex: 1, padding: '6px 10px', fontSize: '11px', fontFamily: 'monospace' }}
            />
            <button className="primary" style={{ padding: '6px 14px' }}>Execute</button>
          </form>
        </div>
      </section>
    </div>
  );
}
