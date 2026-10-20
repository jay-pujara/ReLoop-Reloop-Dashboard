import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3D, ZoomIn, ZoomOut, Box, Sparkles } from 'lucide-react';

export default function TruckLoad3D({ lots = [] }) {
  const containerRef = useRef(null);
  const [selectedLot, setSelectedLot] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 5, 8);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Trailer Bounding Box (Length: 10, Height: 2.6, Width: 2.4)
    const boxGeom = new THREE.BoxGeometry(10, 2.6, 2.4);
    const boxEdges = new THREE.EdgesGeometry(boxGeom);
    const boxLine = new THREE.LineSegments(
      boxEdges,
      new THREE.LineBasicMaterial({ color: 0x7201ff, linewidth: 2 })
    );
    boxLine.position.set(0, 1.3, 0);
    scene.add(boxLine);

    // Floor Grid inside Trailer
    const gridHelper = new THREE.GridHelper(10, 10, 0xd3d3d3, 0xeaeaea);
    gridHelper.position.set(0, 0.01, 0);
    scene.add(gridHelper);

    // Ambient & Directional Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Render Packed Lots as 3D Dimensioned Blocks
    const lotGroup = new THREE.Group();
    lots.forEach((lot) => {
      const geom = new THREE.BoxGeometry(lot.w || 1.4, lot.h || 1.1, lot.d || 1.0);
      const mat = new THREE.MeshStandardMaterial({
        color: lot.isNew ? 0x8ffe01 : lot.color || 0x7201ff,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(lot.x, lot.y, lot.z);

      // Edges outline for CAD-like precision
      const edges = new THREE.EdgesGeometry(geom);
      const edgeLine = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1.5 })
      );
      mesh.add(edgeLine);

      mesh.userData = lot;
      lotGroup.add(mesh);
    });
    scene.add(lotGroup);

    // Manual Orbit interaction via mouse drag
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { radius: 12, theta: Math.PI / 4, phi: Math.PI / 3 };

    const updateCamera = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 1, 0);
    };
    updateCamera();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      spherical.theta -= dx * 0.008;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy * 0.008));
      prevMouse = { x: e.clientX, y: e.clientY };
      updateCamera();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Render loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, [lots]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#F2F2F5] to-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Legend */}
      <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            3D Cargo Space Solver
          </span>
          <span className="text-xs font-bold text-black flex items-center gap-1.5 mt-0.5">
            <Rotate3D className="w-3.5 h-3.5 text-[#7201FF]" />
            53ft High-Cube Trailer (Drag to Orbit)
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/80 shadow-xs text-[11px] font-bold text-black flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7201FF]" /> Base Cargo
          <span className="w-2.5 h-2.5 rounded-full bg-[#8FFE01]" /> Added Dynamic Lot
        </div>
      </div>
    </div>
  );
}
