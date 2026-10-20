import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Filter, MapPin, Activity } from 'lucide-react';

export default function FlowGlobe({ previewMode = false, onSelectFacility }) {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubberDay, setScrubberDay] = useState(14);
  const [selectedNode, setSelectedNode] = useState(null);

  // Network Facilities
  const facilities = [
    { id: 'f1', name: 'Rotterdam Circular Hub', lat: 51.9, lng: 4.5, tons: 18500, carbonClass: 'carbon_positive' },
    { id: 'f2', name: 'Antwerp Depot', lat: 51.2, lng: 4.4, tons: 24000, carbonClass: 'carbon_positive' },
    { id: 'f3', name: 'Duisburg Logistics', lat: 51.4, lng: 6.7, tons: 14200, carbonClass: 'marginal' },
    { id: 'f4', name: 'Frankfurt Reprocess Hub', lat: 50.1, lng: 8.6, tons: 8500, carbonClass: 'carbon_negative' },
    { id: 'f5', name: 'Lille Circular Terminal', lat: 50.6, lng: 3.1, tons: 21000, carbonClass: 'carbon_positive' },
    { id: 'f6', name: 'Hamburg Green Yard', lat: 53.5, lng: 10.0, tons: 31000, carbonClass: 'carbon_positive' },
  ];

  // Trade Arcs
  const arcs = [
    { from: 'f1', to: 'f2', tonnage: 18500, color: 0x8ffe01 }, // lime
    { from: 'f1', to: 'f3', tonnage: 14000, color: 0x7201ff }, // purple
    { from: 'f2', to: 'f5', tonnage: 24000, color: 0x8ffe01 }, // lime
    { from: 'f3', to: 'f6', tonnage: 31000, color: 0x7201ff }, // purple
    { from: 'f4', to: 'f3', tonnage: 8500, color: 0xd3d3d3 }, // marginal gray
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = previewMode ? 3.4 : 3.0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe Sphere
    const globeRadius = 1.3;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 48, 48);
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0xf4f4f7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Inner Core Sphere
    const coreGeometry = new THREE.SphereGeometry(globeRadius * 0.98, 36, 36);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Helper: lat/lng to 3D Cartesian
    const latLngToVector3 = (lat, lng, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Node Markers & Domes
    const nodeGroup = new THREE.Group();
    const nodePosMap = {};

    facilities.forEach((f) => {
      const pos = latLngToVector3(f.lat, f.lng, globeRadius);
      nodePosMap[f.id] = pos;

      // Pin
      const pinGeom = new THREE.SphereGeometry(0.03, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: f.carbonClass === 'carbon_positive' ? 0x8ffe01 : 0x7201ff,
      });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(pos);
      nodeGroup.add(pin);

      // Break-even Radius Dome (hemisphere or ring)
      const ringGeom = new THREE.RingGeometry(0.04, 0.08, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x7201ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos.clone().multiplyScalar(1.01));
      ring.lookAt(pos.clone().multiplyScalar(2));
      nodeGroup.add(ring);
    });
    scene.add(nodeGroup);

    // Animated Arcs
    const arcGroup = new THREE.Group();
    arcs.forEach((arc) => {
      const p1 = nodePosMap[arc.from];
      const p2 = nodePosMap[arc.to];
      if (!p1 || !p2) return;

      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(globeRadius + dist * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(36);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: arc.color,
        linewidth: 2,
        transparent: true,
        opacity: 0.8,
      });
      const line = new THREE.Line(geom, mat);
      arcGroup.add(line);
    });
    scene.add(arcGroup);

    // Gentle Auto-rotation
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isPlaying) {
        globe.rotation.y += 0.0025;
        core.rotation.y += 0.0025;
        nodeGroup.rotation.y += 0.0025;
        arcGroup.rotation.y += 0.0025;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPlaying, previewMode]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#F2F2F5] via-[#F8F8FA] to-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
      {/* 3D Canvas Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Legend & Status */}
      <div className="relative z-10 p-5 flex items-start justify-between pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            ReLoop Network Flow
          </span>
          <h3 className="text-[16px] font-extrabold text-black tracking-tight">
            Trans-European Material Flow Arcs
          </h3>
          <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-gray-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8FFE01]" /> Carbon-Positive Arcs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7201FF]" /> Heavy Tonnage Corridors
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D3D3D3]" /> Marginal / Rail Feeder
            </span>
          </div>
        </div>

        {!previewMode && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-9 px-3 bg-white hover:bg-gray-100 rounded-full border border-gray-200 shadow-xs text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Live'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Historical Time Scrubber (Full mode only) */}
      {!previewMode && (
        <div className="relative z-10 p-5 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200/80 shadow-xs max-w-xl mx-auto flex items-center gap-4">
            <span className="text-xs font-bold text-black whitespace-nowrap">
              Historical Replay:
            </span>
            <input
              type="range"
              min="1"
              max="30"
              value={scrubberDay}
              onChange={(e) => setScrubberDay(Number(e.target.value))}
              className="flex-1 accent-[#7201FF] cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-[#7201FF] bg-purple-50 px-2 py-0.5 rounded-md">
              Sep {scrubberDay}, 2026
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
