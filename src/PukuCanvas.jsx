import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Network, ArrowUpRight, RotateCcw, Pause, Play, MousePointer2, Layers, Radio, Activity,
  Server, Search, Users, Terminal, CheckCircle2, ShieldAlert, Cpu, Zap, X, Plus, Trash2,
  Lock, Maximize2, Monitor, Smartphone, Tablet, Mail, Eye, Sliders, ChevronDown, RefreshCw
} from 'lucide-react';

const packetDevices = [
  { id: 0, name: 'WRT300N ISP', type: 'ISP Router', ip: '103.14.22.1', status: 'Healthy', pos: [0, 1.2, 0], color: '#38BDF8' },
  { id: 1, name: 'Pixelz Router 1', type: 'Core Router', ip: '192.168.21.1', status: 'Healthy', pos: [-2, 0, 0], color: '#4ADE80' },
  { id: 2, name: 'PC Pixelz 1', type: 'End Device', ip: '192.168.21.2/29', status: 'Active', pos: [-4.5, 0.5, 1], color: '#38BDF8' },
  { id: 3, name: 'PC Pixelz 2', type: 'End Device', ip: '192.168.21.3/29', status: 'Active', pos: [2.5, 0.5, -1], color: '#38BDF8' },
  { id: 4, name: 'Smartphone 3', type: 'Mobile', ip: '192.168.21.4/29', status: 'Active', pos: [-3, -0.8, -1.5], color: '#F59E0B' },
  { id: 5, name: 'Laptop Pixelz 2', type: 'Laptop', ip: '192.168.31.8/29', status: 'Active', pos: [0, -1, 1.5], color: '#C084FC' }
];

const simulationEvents = [
  { time: '0.253', lastDevice: '---', atDevice: 'Hub 1', type: 'ICMP', color: '#4ADE80' },
  { time: '0.254', lastDevice: 'Hub 1', atDevice: 'PC Pixelz 2', type: 'ICMP', color: '#4ADE80' },
  { time: '0.255', lastDevice: 'PC Pixelz 2', atDevice: 'Hub 1', type: 'ICMP', color: '#4ADE80' },
  { time: '0.256', lastDevice: 'Hub 1', atDevice: 'PC Pixelz 1', type: 'ICMP', color: '#4ADE80' },
  { time: '0.258', lastDevice: 'Pixelz Router 1', atDevice: 'WRT300N', type: 'BGP', color: '#F59E0B' }
];

export default function PukuCanvas({ onClose }) {
  const mountRef = useRef(null);
  const [selectedDevice, setSelectedDevice] = useState(packetDevices[1]);
  const [mode, setMode] = useState('Simulation'); // 'Real time' | 'Simulation'
  const [isPlaying, setIsPlaying] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [termLogs, setTermLogs] = useState([
    '[PACKET TRACER 3D] Three.js Engine loaded with WebGL Renderer.',
    '[SIMULATION] ICMP & BGP packet simulation active.',
    'Type "puku analyze INC-9042" or "ping 192.168.21.2" to test CLI.'
  ]);
  const [termInput, setTermInput] = useState('');

  // Three.js Canvas Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x0C0E14, 1);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0C0E14, 0.04);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;

    // Ambient & Directional Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0x38BDF8, 2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Dotted Grid Floor Background
    const grid = new THREE.GridHelper(20, 40, 0x334155, 0x1E293B);
    grid.position.y = -2;
    grid.rotation.x = Math.PI / 6;
    scene.add(grid);

    // Build 3D Devices & Mesh Nodes
    const nodeMeshes = [];
    const packetParticles = [];

    packetDevices.forEach((dev) => {
      const group = new THREE.Group();
      group.position.set(...dev.pos);

      // Node Sphere Body
      const geo = dev.type.includes('Router') ? new THREE.CylinderGeometry(0.5, 0.5, 0.25, 16) : new THREE.BoxGeometry(0.6, 0.5, 0.3);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(dev.color),
        roughness: 0.3,
        metalness: 0.7,
        emissive: new THREE.Color(dev.color),
        emissiveIntensity: 0.2
      });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);

      // Outer Glowing Ring
      const ringGeo = new THREE.RingGeometry(0.6, 0.68, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(dev.color), side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      scene.add(group);
      nodeMeshes.push({ group, data: dev });
    });

    // Create Connecting Line Cables between Router and End Devices
    const hubPos = new THREE.Vector3(...packetDevices[1].pos);
    packetDevices.slice(2).forEach((dev) => {
      const devPos = new THREE.Vector3(...dev.pos);
      const points = [hubPos, devPos];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.5 });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      // Packet Pulse Particle Traveling Along Cable
      const particleGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({ color: 0x4ADE80 });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      scene.add(particle);
      packetParticles.push({ mesh: particle, start: hubPos, end: devPos, progress: Math.random() });
    });

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Animate Packet Particles moving along lines
      packetParticles.forEach(p => {
        p.progress += 0.008;
        if (p.progress > 1) p.progress = 0;
        p.mesh.position.lerpVectors(p.start, p.end, p.progress);
      });

      // Slowly rotate device rings
      nodeMeshes.forEach(n => {
        n.group.rotation.y += 0.005;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

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
        '  puku analyze <INC-ID>  - Run AI root cause analysis',
        '  ping <IP>              - Trace packet delay and loss',
        '  clear                  - Clear console'
      );
    } else if (cmd.startsWith('ping')) {
      newLogs.push(
        `PING ${cmd.split(' ')[1] || '192.168.21.2'}: 56 data bytes`,
        '64 bytes from 192.168.21.2: icmp_seq=0 ttl=64 time=0.254 ms',
        '64 bytes from 192.168.21.2: icmp_seq=1 ttl=64 time=0.251 ms',
        '2 packets transmitted, 2 received, 0% packet loss'
      );
    } else {
      newLogs.push(`Executing command: "${cmd}". Type "puku help" for available commands.`);
    }

    setTermLogs(newLogs);
    setTermInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', background: '#0C0E14', color: '#E2E8F0', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Cisco Packet Tracer Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#121622', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Activity size={20} color="#38BDF8" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
            <span>Logical View</span> <ChevronDown size={14} color="#64748B" />
          </div>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: 600 }}>Cisco Packet Tracer / Class 1 ⌄</span>
        </div>

        {/* Real Time vs Simulation Mode Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setMode('Real time')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: mode === 'Real time' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: mode === 'Real time' ? '#FFF' : '#94A3B8',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ⏱️ Real time
            </button>
            <button
              onClick={() => setMode('Simulation')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: mode === 'Simulation' ? '#4F46E5' : 'transparent',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ⏱️ Simulation
            </button>
          </div>

          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            style={{ padding: '6px 12px', borderRadius: '6px', background: terminalOpen ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (terminalOpen ? '#A855F7' : 'rgba(255,255,255,0.1)'), color: terminalOpen ? '#C084FC' : '#E2E8F0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Terminal size={14} /> CLI Terminal
          </button>

          {/* Close Canvas Option */}
          {onClose && (
            <button
              onClick={onClose}
              style={{ padding: '6px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <X size={14} /> Close Canvas
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Split View */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        
        {/* Left Toolbar Icon Column */}
        <div style={{ width: '48px', background: '#11141C', borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: '14px', zIndex: 10 }}>
          <button title="Select Cursor" style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer' }}><MousePointer2 size={18} /></button>
          <button title="Zoom Stage" style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><Search size={18} /></button>
          <button title="Delete Item" style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><X size={18} /></button>
          <button title="Inspect Properties" style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer' }}><Sliders size={18} /></button>
          <button title="Connect Cable" style={{ background: 'none', border: 'none', color: '#4ADE80', cursor: 'pointer' }}><Zap size={18} /></button>
          <button title="Ping Packet Test" style={{ background: 'none', border: 'none', color: '#C084FC', cursor: 'pointer' }}><Mail size={18} /></button>
        </div>

        {/* Center Stage: Three.js 3D Spatial Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

          {/* Bottom Floating Device Dock */}
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#121622', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', zIndex: 10 }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>End Device:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#38BDF8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}><Monitor size={14} /> PC</button>
              <button style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}><Smartphone size={14} /> Mobile</button>
              <button style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#4ADE80', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}><Server size={14} /> Server</button>
              <button style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#C084FC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}><Network size={14} /> Router</button>
            </div>
          </div>
        </div>

        {/* Right Simulation Panel */}
        <div style={{ width: '320px', background: '#11141C', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>Simulation Panel</h3>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Play Controls</span>
          </div>

          {/* Simulation Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '8px 16px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>

          {/* Event List Table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Event List</span>
              <span style={{ color: '#38BDF8', cursor: 'pointer' }}>Reset Simulation</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {simulationEvents.map((ev, idx) => (
                <div key={idx} style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B' }}>{ev.time}s</span>
                  <span style={{ color: '#F1F5F9' }}>{ev.atDevice}</span>
                  <span style={{ color: ev.color, fontWeight: 700 }}>{ev.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event List Filter Chips */}
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>Protocol Filters</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['ARP', 'BGP', 'DHCP', 'DNS', 'ICMP', 'OSPF'].map(p => (
                <span key={p} style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', fontSize: '10px', color: '#CBD5E1', cursor: 'pointer' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Togglable Terminal Console */}
      {terminalOpen && (
        <div style={{ height: '160px', background: '#090D16', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: '#4ADE80', fontWeight: 700 }}>
            <span>KYRO INTERACTIVE TERMINAL (PUKU AI CONNECTED)</span>
            <button onClick={() => setTerminalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
            {termLogs.map((l, i) => (
              <div key={i} style={{ color: l.startsWith('kyro-cli>') ? '#38BDF8' : '#CBD5E1' }}>{l}</div>
            ))}
          </div>
          <form onSubmit={handleTermSubmit} style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#4ADE80', fontWeight: 700 }}>kyro-cli&gt;</span>
            <input
              type="text"
              value={termInput}
              onChange={e => setTermInput(e.target.value)}
              placeholder="Type CLI command (e.g. ping 192.168.21.2, puku analyze INC-9042, help)..."
              style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '6px 10px', color: '#FFF', fontFamily: 'monospace' }}
            />
          </form>
        </div>
      )}
    </div>
  );
}
