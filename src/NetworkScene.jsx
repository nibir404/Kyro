import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Network, ArrowUpRight, RotateCcw, Pause, Play, MousePointer2, Layers, Radio, Activity, Server} from 'lucide-react';
import {DotMeter} from './Visuals';

export const nodes = [
 {name:'Dhaka core',tag:'CORE / 01',status:'Healthy',latency:1.2,load:47,connections:12846,capacity:100,traffic:46.82,pos:[0,0,0],type:'Aggregation router',ip:'10.24.0.1',color:'#94babe'},
 {name:'Gulshan',tag:'POP / 01',status:'Healthy',latency:3.2,load:62,connections:3428,capacity:25,traffic:15.5,pos:[-3.1,0,1.7],type:'MikroTik CCR2116',ip:'10.24.1.1',color:'#a9c895'},
 {name:'Banani',tag:'POP / 02',status:'Healthy',latency:2.8,load:41,connections:2846,capacity:25,traffic:10.25,pos:[-2.7,0,-2.1],type:'MikroTik CCR2116',ip:'10.24.2.1',color:'#94babe'},
 {name:'Dhanmondi',tag:'POP / 03',status:'Degraded',latency:12.4,load:88,connections:3192,capacity:25,traffic:22,pos:[3,0,1.6],type:'MikroTik CCR2116',ip:'10.24.3.1',color:'#ef925f'},
 {name:'Uttara',tag:'POP / 04',status:'Healthy',latency:3.4,load:53,connections:3380,capacity:25,traffic:13.25,pos:[2.7,0,-2.2],type:'MikroTik CCR2116',ip:'10.24.4.1',color:'#a9c895'}
];

export default function NetworkScene({onInspect, initialNode=0}) {
 const mount=useRef(null), labels=useRef([]),engine=useRef(null),selectedRef=useRef(initialNode),pausedRef=useRef(false);
 const[selected,setSelected]=useState(initialNode),[layer,setLayer]=useState('Health'),[paused,setPaused]=useState(false),[fallback,setFallback]=useState(false),[access,setAccess]=useState(true);
 const active=nodes[selected];
 useEffect(()=>{selectedRef.current=selected;engine.current?.highlight(selected)},[selected]);
 useEffect(()=>{pausedRef.current=paused},[paused]);
 useEffect(()=>{engine.current?.layer(layer)},[layer]);
 useEffect(()=>{if(engine.current)engine.current.access.visible=access},[access]);
 useEffect(()=>{
  const host=mount.current;
  let renderer;
  try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setFallback(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x111719,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','Interactive 3D ISP network. Drag to rotate; select a POP using the buttons below.');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x171c1e,.027);
  const camera=new THREE.PerspectiveCamera(36,1,.1,100);const start=new THREE.Vector3(9,8.5,11);camera.position.copy(start);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.1,0);controls.enableDamping=true;controls.enableZoom=false;controls.enablePan=false;controls.minPolarAngle=.3;controls.maxPolarAngle=Math.PI/2.35;controls.rotateSpeed=.45;
  scene.add(new THREE.AmbientLight(0xa9c7cf,1.8));const light=new THREE.DirectionalLight(0xffd4ad,3.5);light.position.set(3,9,4);scene.add(light);const fill=new THREE.DirectionalLight(0x6fa3ba,2);fill.position.set(-7,3,-4);scene.add(fill);
  const rigs=[],hitTargets=[],particles=[],flows=[],rings=[];const accessGroup=new THREE.Group();scene.add(accessGroup);
  const metal=new THREE.MeshStandardMaterial({color:0x29373b,roughness:.38,metalness:.7});const dark=new THREE.MeshStandardMaterial({color:0x10191e,roughness:.48,metalness:.5});
  function box(w,h,d,x,y,z,material,parent=scene){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  function edge(mesh,color,opacity=.45){const e=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color,transparent:true,opacity}));mesh.add(e);return e;}
  const ground=box(10,.1,7.5,0,-.42,0,new THREE.MeshStandardMaterial({color:0x172428,metalness:.55,roughness:.6}));edge(ground,0x6b8d8d,.32);
  const grid=new THREE.GridHelper(10,28,0x57777b,0x30494d);grid.position.y=-.35;grid.material.transparent=true;grid.material.opacity=.26;scene.add(grid);
  for(let i=0;i<18;i++){const x=-4.6+(i%9)*1.1,z=i<9?-3.25:3.25;const m=new THREE.MeshStandardMaterial({color:0x203033,roughness:.7,metalness:.3});const b=box(.62,.1+(i%3)*.1,.38,x,-.24,z,m);edge(b,0x789899,.25);}
  nodes.forEach((n,i)=>{
   const g=new THREE.Group();g.position.set(...n.pos);scene.add(g);rigs.push(g);
   const accent=new THREE.MeshStandardMaterial({color:n.color,emissive:n.color,emissiveIntensity:.65,metalness:.3,roughness:.35});
   const base=box(i?1.3:1.85,.15,i?1.1:1.65,0,-.15,0,dark,g);edge(base,n.color,.4);
   const trim=box(i?1.24:1.78,.035,i?1.04:1.58,0,-.045,0,accent,g);
   const plate=box(i?1.16:1.68,.16,i?.96:1.48,0,.04,0,metal,g);edge(plate,n.color,.4);
   // Physical router chassis: stacked rack units, ventilation, front ports and link lights.
   const count=i?2:4;
   for(let unit=0;unit<count;unit++){
    const y=.23+unit*.23;
    const chassis=box(i?.78:1.05,.19,i?.55:.8,0,y,0,metal,g);edge(chassis,0x849498,.35);chassis.userData.node=i;hitTargets.push(chassis);
    box(i?.69:.96,.12,.025,0,y,i?.29:.415,dark,g);
    for(let p=0;p<(i?5:7);p++){
     box(.058,.038,.028,-(i?.28:.4)+p*.12,y,i?.31:.43,accent,g);
     box(.055,.017,.028,-(i?.28:.4)+p*.12,y-.045,i?.31:.43,dark,g);
    }
    for(let v=0;v<5;v++)box(.18,.008,.025,0,y+.098,-.15+v*.075,dark,g);
   }
   const ring=new THREE.Mesh(new THREE.RingGeometry(i?.77:1.12,i?.79:1.14,80),new THREE.MeshBasicMaterial({color:n.color,transparent:true,opacity:.28,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.01;g.add(ring);rings.push(ring);
   if(i){
    const p=new THREE.Vector3(n.pos[0],.18,n.pos[2]);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.2,0),new THREE.Vector3(p.x*.25,.25,p.z*.1),new THREE.Vector3(p.x*.7,.25,p.z*.85),p]);
    const flowMat=new THREE.MeshBasicMaterial({color:n.color,transparent:true,opacity:.55});const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,40,.016,5,false),flowMat);scene.add(tube);flows.push({mat:flowMat,node:i});
    for(let a=0;a<3;a++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.045,8,8),new THREE.MeshBasicMaterial({color:n.color}));scene.add(dot);particles.push({dot,curve,offset:a/3,speed:.08+i*.014});}
    // Access-layer fanout: represent last-mile fiber routes, not geographic coordinates.
    for(let j=0;j<3;j++){
     const end=new THREE.Vector3(n.pos[0]+(n.pos[0]>0?.8:-.8),-.13,n.pos[2]+(j-1)*.5);
     const path=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...n.pos).add(new THREE.Vector3(0,-.13,0)),end]);const line=new THREE.Line(path,new THREE.LineBasicMaterial({color:n.color,transparent:true,opacity:.3}));accessGroup.add(line);
     box(.12,.12,.12,end.x,-.1,end.z,new THREE.MeshBasicMaterial({color:n.color}),accessGroup);
    }
   }
  });
  function highlight(index){rings.forEach((r,i)=>{r.material.opacity=i===index?.95:.18;r.scale.setScalar(i===index?1.1:1)});}
  function updateLayer(mode){flows.forEach(({mat,node})=>{mat.color.set(mode==='Utilization'?(nodes[node].load>80?'#ef925f':'#94babe'):mode==='Latency'?(nodes[node].latency>10?'#ef925f':'#a9c895'):nodes[node].color)});}
  engine.current={highlight,layer:updateLayer,access:accessGroup,reset:()=>{camera.position.copy(start);controls.target.set(0,.1,0);controls.update()}};highlight(selectedRef.current);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down={x:0,y:0};
  const pointerDown=e=>{down={x:e.clientX,y:e.clientY}};
  const pointerUp=e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(hitTargets)[0];if(hit)setSelected(hit.object.userData.node)};
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
  const size=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w/h>1.65?30:36;camera.updateProjectionMatrix();};const resize=new ResizeObserver(size);resize.observe(host);size();
  let visible=true;const observer=new IntersectionObserver(([entry])=>visible=entry.isIntersecting);observer.observe(host);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame,last=0,elapsed=0;
  function render(t){frame=requestAnimationFrame(render);if(!visible||document.hidden||t-last<32)return;const dt=Math.min((t-last)/1000,.1);last=t;if(!pausedRef.current&&!reduced)elapsed+=dt;controls.update();particles.forEach(p=>p.dot.position.copy(p.curve.getPoint((elapsed*p.speed+p.offset)%1)));nodes.forEach((n,i)=>{const label=labels.current[i];if(!label)return;const v=new THREE.Vector3(n.pos[0],i?.99:1.46,n.pos[2]).project(camera);label.style.left=`${(v.x*.5+.5)*host.clientWidth}px`;label.style.top=`${(-v.y*.5+.5)*host.clientHeight}px`;label.style.opacity=v.z>1?'0':'1';});renderer.render(scene,camera);}
  frame=requestAnimationFrame(render);
  const lost=e=>{e.preventDefault();setFallback(true)};renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();engine.current=null;};
 },[]);
 return <section className="card infrastructure-card">
  <div className="infra-heading"><div><span className="eyebrow">INFRASTRUCTURE / DIGITAL TWIN</span><h2>Your network. In another dimension<span>.</span></h2><p>A spatial view of your core, fiber uplinks, and points of presence.</p></div><div className="layer-switch" aria-label="Network visualization layer">{['Health','Utilization','Latency'].map(l=><button key={l} aria-pressed={layer===l} className={layer===l?'active':''} onClick={()=>setLayer(l)}>{l}</button>)}</div></div>
  <div className="infra-body"><div className="scene-wrap"><div className="scene-topline"><span><i className="dot green-dot"/> CORE ONLINE</span><span>5 NODES <b>/</b> 4 FIBER UPLINKS</span></div><div className="three-host" ref={mount}/>{!fallback&&<div className="scene-labels">{nodes.map((n,i)=><button ref={el=>labels.current[i]=el} key={n.name} onClick={()=>setSelected(i)} aria-pressed={selected===i} className={`scene-label ${selected===i?'selected':''} ${i===3?'warning':''}`}><span>{i===0?'Dhaka core':n.name+' POP'}</span><small>{layer==='Health'?n.status:layer==='Latency'?n.latency+' ms':n.load+'% utilized'}</small></button>)}</div>}{fallback&&<div className="scene-fallback"><Network size={45}/><h3>Network overview</h3><p>3D is unavailable on this device. All node metrics and controls remain accessible below.</p></div>}<div className="scene-bottom"><span><MousePointer2 size={12}/>Drag to orbit · Select a node</span><div><button aria-label={paused?'Resume packet animation':'Pause packet animation'} onClick={()=>setPaused(!paused)}>{paused?<Play size={13}/>:<Pause size={13}/>}</button><button aria-label="Reset camera" onClick={()=>engine.current?.reset()}><RotateCcw size={13}/></button><button aria-label="Toggle access layer" aria-pressed={access} className={access?'on':''} onClick={()=>setAccess(!access)}><Layers size={13}/></button></div></div></div>
  <div className="node-inspector"><div className="node-kicker"><span>{active.tag}</span><span className={active.status==='Healthy'?'good':'warn'}><i className="dot"/>{active.status}</span></div><h3>{active.name}{selected?' POP':''}</h3><p>{active.type}</p><div className="node-load"><span>Uplink utilization <b>{active.load}<small>%</small></b></span><DotMeter value={active.load} color={active.load>80?'orange':'cyan'} count={30}/><div><small>{active.traffic} Gbps in use</small><small>{active.capacity} Gbps capacity</small></div></div><div className="node-latency"><span>Latency<small>{active.latency<10?'Within target':'Above 10 ms target'}</small></span><b className={active.latency>10?'warn':''}>{active.latency}<small>ms</small></b></div><div className="latency-track"><i style={{width:Math.min(active.latency/20*100,100)+'%',background:active.latency>10?'#ef9966':'#aac990'}}/><span title="10 ms target"/></div><div className="node-connections"><UsersGlyph/><div><strong>{active.connections.toLocaleString()}</strong><span>Connected subscribers</span></div></div><button className="node-action" onClick={()=>onInspect?.(active)}>{active.status==='Degraded'?'Investigate 138 affected connections':'Inspect node'}<ArrowUpRight size={14}/></button></div></div>
  <div className="node-selector" aria-label="Select a network node">{nodes.map((n,i)=><button key={n.name} onClick={()=>setSelected(i)} aria-pressed={selected===i} className={selected===i?'active':''}><i style={{background:n.color}}/><span>{n.name}</span><small>{layer==='Latency'?n.latency+' ms':layer==='Utilization'?n.load+'%':n.status}</small></button>)}</div><div className="infra-caption"><span>SCHEMATIC TOPOLOGY · DEMO TELEMETRY</span><span>Orange POP status flags elevated latency or utilization. Positions are schematic.</span></div>
 </section>
}
function UsersGlyph(){return <div className="subscriber-glyph" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i}/>)}</div>}
