import React, { useState } from 'react';
import { Play, Sparkles, Plus, Terminal, RefreshCw, Layers, CheckCircle2, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

const initialNodes = [
  { id: '1', title: 'Trigger: BGP Session Flap', type: 'trigger', status: 'Active', x: 80, y: 120, desc: 'Detects BGP holdtime expiration or peer flap on core routers.' },
  { id: '2', title: 'RCA Agent: Optical Telemetry Check', type: 'agent', status: 'Running', x: 380, y: 120, desc: 'Queries SFP optical power level & packet loss thresholds.' },
  { id: '3', title: 'Action: Reroute to Backup Uplink', type: 'action', status: 'Waiting Approval', x: 680, y: 120, desc: 'Executes bgp weight shift to secondary IIG optical link.' },
  { id: '4', title: 'Notify: Enterprise SLA Teams', type: 'action', status: 'Queued', x: 680, y: 280, desc: 'Dispatches SMS and webhooks to affected enterprise clients.' }
];

export default function PukuCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState(initialNodes[1]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState([
    '[SYSTEM] Puku Workflow Canvas initialized.',
    '[READY] Connected to Link3 AI Automation Engine v1.0'
  ]);

  const runSimulation = () => {
    setIsSimulating(true);
    setLogs(prev => [...prev, '[SIMULATION] Initiating automated runbook test execution...']);
    setTimeout(() => {
      setLogs(prev => [...prev, '[NODE 1] Trigger fired: BGP holdtime alert received from dhaka-core-01.']);
    }, 600);
    setTimeout(() => {
      setLogs(prev => [...prev, '[NODE 2] RCA Agent verified Rx optical power -28.4 dBm (< -22 dBm threshold).']);
    }, 1400);
    setTimeout(() => {
      setLogs(prev => [...prev, '[NODE 3] Action paused: Awaiting operator approval for BGP weight shift.']);
      setIsSimulating(false);
    }, 2200);
  };

  return (
    <div style={{ padding: '24px', background: '#0B0E14', color: '#E2E8F0', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Canvas Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', color: '#A78BFA', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} /> Puku AI Automation Canvas
            </span>
            <span style={{ color: '#64748B', fontSize: '13px' }}>Visual Runbook & Remediation Builder</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 0 0', color: '#F8FAFC', letterSpacing: '-0.5px' }}>
            Interactive Workflow Canvas
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              background: isSimulating ? 'rgba(99, 102, 241, 0.4)' : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: 'none',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '13px',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
          >
            {isSimulating ? <RefreshCw className="animate-spin" size={15} /> : <Play size={15} />}
            {isSimulating ? 'Simulating...' : 'Test Runbook Simulation'}
          </button>
        </div>
      </div>

      {/* Main Canvas + Properties split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Visual Graph Board */}
        <div style={{ background: '#111622', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', minHeight: '440px', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle grid background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.5,
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '20px', fontWeight: 600 }}>
              CANVAS GRAPH • Select nodes to edit parameters or inspect state
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
              {nodes.map((node, index) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <React.Fragment key={node.id}>
                    <div
                      onClick={() => setSelectedNode(node)}
                      style={{
                        width: '240px',
                        padding: '16px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid ' + (isSelected ? '#A78BFA' : 'rgba(255, 255, 255, 0.08)'),
                        boxShadow: isSelected ? '0 0 20px rgba(167, 139, 250, 0.25)' : '0 4px 12px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: node.type === 'trigger' ? 'rgba(56, 189, 248, 0.15)' : node.type === 'agent' ? 'rgba(167, 139, 250, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: node.type === 'trigger' ? '#38BDF8' : node.type === 'agent' ? '#A78BFA' : '#F59E0B'
                        }}>
                          {node.type}
                        </span>
                        <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>{node.status}</span>
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
                        {node.title}
                      </div>

                      <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.4' }}>
                        {node.desc}
                      </div>
                    </div>

                    {index < nodes.length - 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', color: '#6366F1' }}>
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Node Properties Inspector */}
        <div style={{ background: '#111622', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="#A78BFA" /> Node Inspector
          </h3>

          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Node Title</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setSelectedNode(prev => ({ ...prev, title: newTitle }));
                    setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, title: newTitle } : n));
                  }}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 10px', color: '#F8FAFC', fontSize: '13px', marginTop: '4px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Node Description</label>
                <textarea
                  rows={3}
                  value={selectedNode.desc}
                  onChange={(e) => {
                    const newDesc = e.target.value;
                    setSelectedNode(prev => ({ ...prev, desc: newDesc }));
                    setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, desc: newDesc } : n));
                  }}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 10px', color: '#F8FAFC', fontSize: '12px', marginTop: '4px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Execution Mode</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#A78BFA', marginTop: '4px' }}>Guardrail Protected (Human in the loop)</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#64748B' }}>Select a node on the canvas graph to inspect properties.</div>
          )}
        </div>
      </div>

      {/* Terminal Simulation Console Log */}
      <div style={{ marginTop: '20px', background: '#090D16', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', marginBottom: '10px', fontWeight: 700 }}>
          <Terminal size={14} /> SIMULATION ENGINE CONSOLE LOG
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
          {logs.map((log, idx) => (
            <div key={idx} style={{ color: log.includes('ERR') ? '#EF4444' : log.includes('NODE') ? '#4ADE80' : '#CBD5E1' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
