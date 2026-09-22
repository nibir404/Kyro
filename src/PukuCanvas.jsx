import React, { useState, useRef, useEffect } from 'react';
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
    x: 320,
    y: 80,
    duration: '0.5s',
    history: { last: 'Today • 14.23', next: 'Tomorrow • 14.23' },
    metrics: { count: '0.1', id: '30', runs: '1' },
    accent: '#EAB308'
  },
  {
    id: 'node-2',
    title: 'API Request',
    type: 'action',
    category: 'Network',
    x: 420,
    y: 280,
    duration: '0.5s',
    method: 'GET',
    endpoint: '/v1/users',
    metrics: { count: '0.4', id: '80', runs: '1' },
    accent: '#22C55E'
  },
  {
    id: 'node-3',
    title: 'Conditional',
    type: 'logic',
    category: 'Logic',
    x: 720,
    y: 90,
    duration: '0.5s',
    condition: '{mail} != null',
    trueAction: 'filter(mail_item)',
    falseAction: 'error()',
    metrics: { count: '0.2', id: '50', runs: '2' },
    accent: '#A855F7'
  }
];

const paletteItems = [
  {
    category: 'Favourites',
    items: [
      { name: 'AI Keyword', icon: 'AI', desc: 'Keyword to start a workflow, use with or without argument.' },
      { name: 'Script filter', icon: 'Code', desc: "Dynamically populate Alfred's results with your own scripts." },
      { name: 'Run script', icon: 'Terminal', desc: 'Run commands in macOS/Linux using various languages & scripts.' }
    ]
  },
  {
    category: 'Inputs',
    items: [
      { name: 'Keyword', icon: 'AI', desc: 'Keyword to start a workflow, use with or without argument.' },
      { name: 'File filter', icon: 'File', desc: 'Create a customized file search; specify search scope or file.' },
      { name: 'Running apps', icon: 'Play', desc: 'Show a list of currently running apps in OS.' }
    ]
  }
];

export default function PukuCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState(initialNodes[0]);
  const [leftTab, setLeftTab] = useState('chat'); // 'chat' | 'design'
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalTab, setTerminalTab] = useState('terminal'); // 'debug' | 'terminal' | 'allacrity'
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
    const canvasElem = document.getElementById('canvas-board');
    if (!canvasElem) return;
    const rect = canvasElem.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 260, e.clientX - rect.left - dragOffset.x));
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
        '  puku logs             - Query Loki & Syslog events',
        '  ping <IP> / ssh <HOST>- Standard network diagnostic commands'
      );
    } else if (cmd.startsWith('puku analyze') || cmd.startsWith('puku inspect')) {
      newLogs.push(
        '------------------------------------------------------------',
        '[PUKU AI ANALYSIS] Incident INC-9042 Spotlight',
        '• Root Cause (94% Conf): Optical Rx Power drop (-28.4 dBm) on Ge0/0/1',
        '• Correlated Events: 142 alerts, 2 recent router config diffs',
        '• Affected Impact: 12,846 residential users, 14 enterprise SLA circuits',
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
    } else if (cmd.startsWith('ping')) {
      newLogs.push(
        `PING ${cmd.split(' ')[1] || '10.24.1.1'} (10.24.1.1): 56 data bytes`,
        '64 bytes from 10.24.1.1: icmp_seq=0 ttl=64 time=1.24 ms',
        '64 bytes from 10.24.1.1: icmp_seq=1 ttl=64 time=1.18 ms',
        '--- 10.24.1.1 ping statistics ---',
        '2 packets transmitted, 2 packets received, 0.0% packet loss'
      );
    } else {
      newLogs.push(`[PUKU CLI] Executed command: "${cmd}". Type "puku help" for AI commands.`);
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
          text: `Puku AI has processed your request: "${text}". Updated workflow blocks on canvas and synchronized CLI terminal state.`
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
      x: 350 + Math.random() * 80,
      y: 180 + Math.random() * 80,
      duration: '0.5s',
      metrics: { count: '0.1', id: '30', runs: '1' },
      accent: item.name.includes('Script') ? '#38BDF8' : '#F59E0B'
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    setPaletteOpen(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 70px)',
        background: '#0B0D12',
        color: '#E2E8F0',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        background: '#11141C',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>Untitled Project</span>
          <span style={{ fontSize: '11px', color: '#64748B', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>Draft</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4ADE80', fontWeight: 600 }}>
            <CheckCircle2 size={15} /> Successfully saved
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '-6px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#EAB308', color: '#000', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContents: 'center', textAlign: 'center', lineHeight: '26px', paddingLeft: '8px' }}>J</span>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContents: 'center', textAlign: 'center', lineHeight: '26px', paddingLeft: '6px' }}>KW</span>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#06B6D4', color: '#FFF', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContents: 'center', textAlign: 'center', lineHeight: '26px', paddingLeft: '8px' }}>+</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setTermLogs(prev => [...prev, '[SIMULATOR] Test runbook triggered successfully.'])}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#84CC16',
                color: '#0F172A',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={14} /> Test ⚡
            </button>
            <button style={{ padding: '6px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area (Left Chat Drawer + Center Canvas Graph + Right Inspector) */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left Drawer: Puku AI Assistant Panel */}
        <div style={{
          width: '320px',
          background: '#11141C',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}>
          {/* Chat / Design Tabs */}
          <div style={{ padding: '12px 16px 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setLeftTab('chat')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: leftTab === 'chat' ? '#A3E635' : 'transparent',
                  color: leftTab === 'chat' ? '#0F172A' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Chat
              </button>
              <button
                onClick={() => setLeftTab('design')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: leftTab === 'design' ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: leftTab === 'design' ? '#FFF' : '#94A3B8',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Design
              </button>
            </div>
          </div>

          {/* Chat Stream */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: msg.sender === 'user' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid ' + (msg.sender === 'user' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)'),
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: '#CBD5E1',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input & Usage Footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0D0F16' }}>
            <form onSubmit={handleChatSubmit} style={{ position: 'relative', marginBottom: '10px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a follow-up..."
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px 40px 10px 12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <button type="submit" style={{ position: 'absolute', right: '8px', top: '8px', background: 'none', border: 'none', color: '#A855F7', cursor: 'pointer' }}>
                <Send size={15} />
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748B' }}>
              <span>Total cost: $20.12</span>
              <span>Token Count: 4,200</span>
              <span>Up Time: 1d 4h 2m</span>
            </div>
          </div>
        </div>

        {/* Center: Canvas Board & Node Graph */}
        <div
          id="canvas-board"
          style={{
            flex: 1,
            position: 'relative',
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
            backgroundColor: '#0C0E14',
            overflow: 'hidden'
          }}
        >
          {/* Canvas Floating Toolbar */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#11141C',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '4px',
            zIndex: 20
          }}>
            <button onClick={() => setPaletteOpen(!paletteOpen)} style={{ padding: '6px', background: paletteOpen ? 'rgba(168, 85, 247, 0.2)' : 'transparent', border: 'none', borderRadius: '4px', color: paletteOpen ? '#C084FC' : '#94A3B8', cursor: 'pointer' }}>
              <Plus size={16} />
            </button>
            <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
            <button style={{ padding: '6px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><Maximize2 size={14} /></button>
            <button style={{ padding: '6px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><Lock size={14} /></button>
            <button style={{ padding: '6px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
          </div>

          {/* SVG Connection Cables (Bezier Curves) */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {/* Cable 1: Node 1 -> Node 2 */}
            <path
              d={`M ${nodes[0].x + 230} ${nodes[0].y + 60} C ${nodes[0].x + 280} ${nodes[0].y + 60}, ${nodes[1].x - 50} ${nodes[1].y + 60}, ${nodes[1].x} ${nodes[1].y + 60}`}
              fill="none"
              stroke="#EAB308"
              strokeWidth="2.5"
            />
            {/* Cable 2: Node 2 -> Node 3 */}
            <path
              d={`M ${nodes[1].x + 230} ${nodes[1].y + 60} C ${nodes[1].x + 280} ${nodes[1].y + 60}, ${nodes[2].x - 50} ${nodes[2].y + 60}, ${nodes[2].x} ${nodes[2].y + 60}`}
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
            />
          </svg>

          {/* Render Nodes */}
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
                  width: '240px',
                  background: '#121622',
                  borderRadius: '12px',
                  border: '1px solid ' + (isSelected ? node.accent : 'rgba(255, 255, 255, 0.1)'),
                  boxShadow: isSelected ? `0 0 20px ${node.accent}33` : '0 8px 24px rgba(0,0,0,0.5)',
                  zIndex: isSelected ? 15 : 5,
                  cursor: 'grab',
                  userSelect: 'none',
                  transition: draggingNodeId === node.id ? 'none' : 'border 0.2s ease'
                }}
              >
                {/* Node Header */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: node.accent }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{node.title}</span>
                  </div>
                  <span style={{ color: '#64748B', fontSize: '12px' }}>...</span>
                </div>

                {/* Node Body */}
                <div style={{ padding: '12px 14px', fontSize: '11px', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '6px 8px', borderRadius: '6px' }}>
                    <span>⏳ Duration</span>
                    <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{node.duration}</span>
                  </div>

                  {node.history && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(15, 23, 42, 0.4)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Last</span>
                        <span style={{ color: '#E2E8F0' }}>{node.history.last}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Next</span>
                        <span style={{ color: '#E2E8F0' }}>{node.history.next}</span>
                      </div>
                    </div>
                  )}

                  {node.endpoint && (
                    <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '6px 8px', borderRadius: '6px' }}>
                      <span style={{ color: '#22C55E', fontWeight: 700, marginRight: '6px' }}>{node.method}</span>
                      <span style={{ color: '#E2E8F0' }}>{node.endpoint}</span>
                    </div>
                  )}

                  {node.condition && (
                    <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '6px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                      <div style={{ color: '#C084FC' }}>{node.condition}</div>
                    </div>
                  )}

                  {/* Node Footer Metrics */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', fontSize: '10px', color: '#64748B' }}>
                    <span>⚡ {node.metrics.count} • ⚡ {node.metrics.id}</span>
                    <span>🔄 {node.metrics.runs}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Floating Palette Drawer Popover */}
          {paletteOpen && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '20px',
              width: '280px',
              background: '#121622',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.6)',
              zIndex: 30,
              padding: '12px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Node Palette</span>
                <button onClick={() => setPaletteOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
              </div>

              {paletteItems.map(section => (
                <div key={section.category} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    v {section.category}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {section.items.map(item => (
                      <div
                        key={item.name}
                        onClick={() => addNodeFromPalette(item)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9' }}>{item.name}</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Docked Terminal Console (Puku Interactive CLI) */}
      <div style={{
        height: '220px',
        background: '#080A0E',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'JetBrains Mono, Menlo, monospace',
        fontSize: '12px'
      }}>
        {/* Terminal Header */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '6px 16px',
          background: '#0F121A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => setTerminalTab('debug')}
              style={{ background: 'none', border: 'none', color: terminalTab === 'debug' ? '#FFF' : '#64748B', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
            >
              Debug console
            </button>
            <button
              onClick={() => setTerminalTab('terminal')}
              style={{ background: 'none', border: 'none', color: terminalTab === 'terminal' ? '#38BDF8' : '#64748B', fontWeight: 700, fontSize: '12px', cursor: 'pointer', borderBottom: '2px solid #38BDF8', paddingBottom: '2px' }}
            >
              Terminal (Puku CLI Active)
            </button>
            <button
              onClick={() => setTerminalTab('allacrity')}
              style={{ background: 'none', border: 'none', color: terminalTab === 'allacrity' ? '#FFF' : '#64748B', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
            >
              Alacrity
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#64748B' }}>
            <span>🗑️ 1: Node ⌄</span>
            <span style={{ color: '#EF4444', fontWeight: 700 }}>🔴 Error: 8</span>
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>⚠️ Warning: 12</span>
          </div>
        </div>

        {/* Terminal Output Log Stream */}
        <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {termLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                color: log.includes('~$') ? '#38BDF8' : log.includes('ERR') ? '#EF4444' : log.includes('SUCCESS') ? '#4ADE80' : log.includes('PUKU') ? '#C084FC' : '#CBD5E1',
                lineHeight: '1.5'
              }}
            >
              {log}
            </div>
          ))}
          <div ref={termEndRef} />
        </div>

        {/* Terminal Input Line */}
        <form onSubmit={handleTermSubmit} style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#090B10', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: '#4ADE80', fontWeight: 700, marginRight: '8px' }}>~/Automation/draft $&gt;</span>
          <input
            type="text"
            value={termInput}
            onChange={(e) => setTermInput(e.target.value)}
            placeholder="Type CLI or Puku command (e.g. puku analyze INC-9042, puku runbook execute, ping 10.24.1.1, puku help)..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F8FAFC',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
        </form>
      </div>
    </div>
  );
}
