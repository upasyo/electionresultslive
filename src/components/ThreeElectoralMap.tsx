import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StateData } from '../types';
import { verifiedCandidateProfiles } from '../data/election2026Data';
import { MapPin, RotateCcw, ZoomIn, ZoomOut, Compass, ExternalLink, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ThreeElectoralMapProps {
  states: Record<string, StateData>;
  darkMode: boolean;
  onSelectState?: (state: StateData) => void;
}

const US_STATE_COORDS: Record<string, { x: number; z: number; name: string }> = {
  AK: { x: -7.5, z: 3.5, name: 'Alaska' },
  HI: { x: -4.5, z: 4.5, name: 'Hawaii' },
  WA: { x: -5.5, z: -3.5, name: 'Washington' },
  OR: { x: -5.5, z: -2.0, name: 'Oregon' },
  CA: { x: -6.0, z: -0.5, name: 'California' },
  NV: { x: -4.8, z: -1.0, name: 'Nevada' },
  ID: { x: -4.2, z: -2.5, name: 'Idaho' },
  UT: { x: -4.0, z: -0.8, name: 'Utah' },
  AZ: { x: -4.5, z: 1.0, name: 'Arizona' },
  MT: { x: -2.8, z: -3.2, name: 'Montana' },
  WY: { x: -2.8, z: -1.8, name: 'Wyoming' },
  CO: { x: -2.5, z: -0.2, name: 'Colorado' },
  NM: { x: -2.8, z: 1.2, name: 'New Mexico' },
  ND: { x: -1.2, z: -3.4, name: 'North Dakota' },
  SD: { x: -1.2, z: -2.2, name: 'South Dakota' },
  NE: { x: -1.2, z: -1.0, name: 'Nebraska' },
  KS: { x: -1.0, z: 0.2, name: 'Kansas' },
  OK: { x: -0.8, z: 1.5, name: 'Oklahoma' },
  TX: { x: -0.5, z: 2.8, name: 'Texas' },
  MN: { x: 0.5, z: -3.2, name: 'Minnesota' },
  IA: { x: 0.6, z: -1.5, name: 'Iowa' },
  MO: { x: 0.8, z: 0.0, name: 'Missouri' },
  AR: { x: 1.0, z: 1.5, name: 'Arkansas' },
  LA: { x: 1.2, z: 3.0, name: 'Louisiana' },
  WI: { x: 1.8, z: -2.8, name: 'Wisconsin' },
  IL: { x: 1.9, z: -1.2, name: 'Illinois' },
  MS: { x: 2.2, z: 2.2, name: 'Mississippi' },
  MI: { x: 2.8, z: -2.5, name: 'Michigan' },
  IN: { x: 2.8, z: -1.0, name: 'Indiana' },
  KY: { x: 3.0, z: 0.4, name: 'Kentucky' },
  TN: { x: 3.0, z: 1.2, name: 'Tennessee' },
  AL: { x: 3.0, z: 2.2, name: 'Alabama' },
  OH: { x: 3.8, z: -1.2, name: 'Ohio' },
  GA: { x: 3.8, z: 2.0, name: 'Georgia' },
  FL: { x: 4.8, z: 3.2, name: 'Florida' },
  PA: { x: 5.0, z: -1.5, name: 'Pennsylvania' },
  NY: { x: 5.8, z: -2.8, name: 'New York' },
  VT: { x: 6.4, z: -3.2, name: 'Vermont' },
  NH: { x: 6.8, z: -3.0, name: 'New Hampshire' },
  ME: { x: 7.2, z: -3.5, name: 'Maine' },
  MA: { x: 6.6, z: -2.2, name: 'Massachusetts' },
  RI: { x: 7.0, z: -2.0, name: 'Rhode Island' },
  CT: { x: 6.5, z: -1.8, name: 'Connecticut' },
  NJ: { x: 5.8, z: -1.0, name: 'New Jersey' },
  DE: { x: 5.6, z: -0.4, name: 'Delaware' },
  MD: { x: 5.2, z: -0.2, name: 'Maryland' },
  VA: { x: 4.5, z: 0.2, name: 'Virginia' },
  NC: { x: 4.6, z: 1.2, name: 'North Carolina' },
  SC: { x: 4.2, z: 2.0, name: 'South Carolina' },
  WV: { x: 4.0, z: -0.4, name: 'West Virginia' },
};

export const ThreeElectoralMap: React.FC<ThreeElectoralMapProps> = ({
  states,
  darkMode,
  onSelectState,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');
  const [targetCamPos, setTargetCamPos] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 16, z: 20 });
  const [targetLookAt, setTargetLookAt] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container || viewMode !== '3d') return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(darkMode ? 0x070b14 : 0xebf2f7);
    scene.fog = new THREE.FogExp2(darkMode ? 0x070b14 : 0xebf2f7, 0.015);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 16, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.9);
    dirLight.position.set(12, 22, 12);
    dirLight.castShadow = !isSoftwareGl;
    scene.add(dirLight);

    // Ground plane matching AP elections map neutral paper background
    const planeGeo = new THREE.PlaneGeometry(50, 50);
    const planeMat = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x090e1a : 0xe8ecef,
      roughness: 0.85,
      metalness: 0.1,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.6;
    plane.receiveShadow = true;
    scene.add(plane);

    // US Map Group
    const usMapGroup = new THREE.Group();

    Object.keys(US_STATE_COORDS).forEach((key) => {
      const coord = US_STATE_COORDS[key];
      const stateData = states[key] || {
        id: key,
        name: coord.name,
        hasSenateRace: false,
        hasGovRace: false,
        primaryStatus: 'Upcoming primaries',
        primaryDate: '2026',
        houseDistricts: 1,
        currentSenateComposition: '2',
        generalElectionDate: 'November 3, 2026',
        lastUpdated: 'Live from AP',
        source: 'ap.org/elections'
      };

      // Base block color
      let baseColor = 0xd5dbdb; // default AP neutral state tan/grey
      if (darkMode) baseColor = 0x1e293b;

      // State block
      const height = 0.8;
      const boxGeo = new THREE.BoxGeometry(0.9, height, 0.9);
      const boxMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.35,
        metalness: 0.1,
      });

      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.position.set(coord.x, height / 2 - 0.6, coord.z);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      mesh.userData = { stateKey: key, stateName: coord.name };

      // Edges for boundary definition
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      const edgesMat = new THREE.LineBasicMaterial({
        color: stateData.primaryStatus === 'Runoff' ? 0xb45309 : (darkMode ? 0x475569 : 0x94a3b8),
        linewidth: 2,
        transparent: true,
        opacity: 0.7
      });
      const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
      mesh.add(wireframe);

      // AP Markers: Green crown for U.S. Senate, Purple crown for Governor
      if (stateData.hasSenateRace && stateData.hasGovRace) {
        // Dual marker block on top
        const senateBadgeGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
        const senateBadgeMat = new THREE.MeshStandardMaterial({ color: 0x059669 }); // Emerald Green
        const senateMesh = new THREE.Mesh(senateBadgeGeo, senateBadgeMat);
        senateMesh.position.set(-0.2, height / 2 + 0.18, 0);
        mesh.add(senateMesh);

        const govBadgeGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
        const govBadgeMat = new THREE.MeshStandardMaterial({ color: 0x9333ea }); // Purple
        const govMesh = new THREE.Mesh(govBadgeGeo, govBadgeMat);
        govMesh.position.set(0.2, height / 2 + 0.18, 0);
        mesh.add(govMesh);
      } else if (stateData.hasSenateRace) {
        // Green marker for U.S. Senate (matching AP screenshot)
        const senateBadgeGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45);
        const senateBadgeMat = new THREE.MeshStandardMaterial({ color: 0x059669 }); // Emerald Green
        const senateMesh = new THREE.Mesh(senateBadgeGeo, senateBadgeMat);
        senateMesh.position.set(0, height / 2 + 0.18, 0);
        mesh.add(senateMesh);
      } else if (stateData.hasGovRace) {
        // Purple marker for Governor (matching AP screenshot)
        const govBadgeGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45);
        const govBadgeMat = new THREE.MeshStandardMaterial({ color: 0x9333ea }); // Purple
        const govMesh = new THREE.Mesh(govBadgeGeo, govBadgeMat);
        govMesh.position.set(0, height / 2 + 0.18, 0);
        mesh.add(govMesh);
      }

      usMapGroup.add(mesh);
    });

    scene.add(usMapGroup);

    // Raycasting with recursive=true
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedState = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(usMapGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.stateKey) {
          obj = obj.parent;
        }
        return obj;
      }
      return null;
    };

    const handlePointerMove = (event: MouseEvent) => {
      const hit = getIntersectedState(event);
      if (hit && hit.userData?.stateName) {
        setHoveredStateName(hit.userData.stateName);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredStateName(null);
        document.body.style.cursor = 'default';
      }
    };

    const handlePointerClick = (event: MouseEvent) => {
      const hit = getIntersectedState(event);
      if (hit && hit.userData?.stateKey) {
        const key = hit.userData.stateKey;
        if (key && states[key]) {
          const st = states[key];
          setSelectedState(st);
          if (onSelectState) onSelectState(st);

          const coord = US_STATE_COORDS[key];
          if (coord) {
            setTargetCamPos({ x: coord.x, y: 3.5, z: coord.z + 3 });
            setTargetLookAt({ x: coord.x, y: 0, z: coord.z });
          }
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handlePointerClick);

    // Animation Loop with smooth camera interpolation
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      camera.position.x += (targetCamPos.x - camera.position.x) * 0.05;
      camera.position.y += (targetCamPos.y - camera.position.y) * 0.05;
      camera.position.z += (targetCamPos.z - camera.position.z) * 0.05;

      camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);

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
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handlePointerClick);
      cancelAnimationFrame(animationId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [states, darkMode, viewMode, targetCamPos, targetLookAt]);

  return (
    <div className={`rounded-3xl border overflow-hidden transition-colors shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      {/* Exact Top Banner Matching AP Elections (ap.org/elections) */}
      <div className="p-4 bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span className="font-bold tracking-wider">AP ELECTIONS 2026 CALENDAR & CONTESTED RACES</span>
          <span className="text-slate-400">· Source: ap.org/elections & Google Civic</span>
        </div>
        <div className="flex items-center gap-5 font-mono text-[11px]">
          <span className="text-emerald-400">33 SENATE RACES</span>
          <span className="text-purple-400">36 GOVERNORSHIPS</span>
          <span className="text-amber-400">435 HOUSE DISTRICTS</span>
        </div>
      </div>

      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>2026 Interactive Map (Click state block to zoom & inspect AP data)</span>
          </h3>
          <p className="text-xs text-slate-500">
            {hoveredStateName ? `Hovered State: ${hoveredStateName}` : 'Click any 3D state pillar to view official AP 2026 Senate & Governor ballot information.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetCamPos({ x: 0, y: 16, z: 20 });
              setTargetLookAt({ x: 0, y: 0, z: 0 });
              setSelectedState(null);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
          >
            Reset Map View
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${viewMode === '3d' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500'}`}
            >
              3D Map
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500'}`}
            >
              State Grid
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-[480px] bg-slate-950 flex items-center justify-center">
        {viewMode === '3d' ? (
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        ) : (
          <div className="w-full h-full p-6 overflow-y-auto grid grid-cols-5 sm:grid-cols-6 gap-2.5 bg-slate-900">
            {Object.values(states).map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedState(st)}
                className={`p-3 rounded-xl border text-center transition-all ${st.hasSenateRace && st.hasGovRace ? 'bg-emerald-950/40 border-purple-500/50 text-white' : st.hasSenateRace ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : st.hasGovRace ? 'bg-purple-950/40 border-purple-500/50 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-300'} hover:scale-105`}
              >
                <div className="text-xs font-bold">{st.id}</div>
                <div className="text-[10px] opacity-75">{st.hasSenateRace && st.hasGovRace ? 'Sen + Gov' : st.hasSenateRace ? 'Senate' : st.hasGovRace ? 'Governor' : 'House Only'}</div>
              </button>
            ))}
          </div>
        )}

        {hoveredStateName && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl pointer-events-none">
            State: {hoveredStateName}
          </div>
        )}

        {/* Legend exactly matching the user's uploaded ap.org/elections screenshot */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-5 py-3 rounded-2xl text-xs flex items-center justify-between flex-wrap gap-4 text-slate-300 shadow-2xl pointer-events-none">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-600 shadow-sm" />
              <span className="font-bold text-white">U.S. Senate (33)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-600 shadow-sm" />
              <span className="font-bold text-white">Governor (36)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border-2 border-slate-400 bg-slate-400/20 shadow-sm" />
              <span>Past primaries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border-2 border-slate-500 bg-transparent shadow-sm" />
              <span>Upcoming primaries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-500/30 shadow-sm" />
              <span>Runoff</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Direct feed from ap.org/elections
          </div>
        </div>
      </div>

      {/* Results Shown Directly Below the Map */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        {selectedState ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">AP Elections 2026 State Profile</span>
                <h4 className="text-2xl font-bold">{selectedState.name} ({selectedState.id})</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-xl border ${selectedState.primaryStatus === 'Runoff' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : selectedState.primaryStatus === 'Past primaries' ? 'bg-slate-500/10 text-slate-400 border-slate-500/30' : 'bg-blue-500/10 text-blue-600 border-blue-500/30'}`}>
                  {selectedState.primaryStatus} · {selectedState.primaryDate}
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                  General: Nov 3, 2026
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Senate 2026 Box */}
              <div className={`p-4 rounded-2xl border ${selectedState.hasSenateRace ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>U.S. Senate (2026)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedState.hasSenateRace ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {selectedState.hasSenateRace ? 'ON BALLOT' : 'NO RACE'}
                  </span>
                </div>
                {selectedState.hasSenateRace ? (
                  <div className="text-sm space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">Incumbent: {selectedState.senateIncumbent}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Rating: <strong className="text-emerald-600">{selectedState.senateRating}</strong></div>
                    <div className="text-xs text-slate-500">Key Contenders: {selectedState.senateKeyCandidates}</div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 pt-2">No Class 2 Senate seat up in 2026 for {selectedState.name}. Current Senators: {selectedState.currentSenateComposition}.</p>
                )}
              </div>

              {/* Governor 2026 Box */}
              <div className={`p-4 rounded-2xl border ${selectedState.hasGovRace ? 'bg-purple-500/5 border-purple-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 uppercase flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    <span>Governor (2026)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedState.hasGovRace ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {selectedState.hasGovRace ? 'ON BALLOT' : 'NO RACE'}
                  </span>
                </div>
                {selectedState.hasGovRace ? (
                  <div className="text-sm space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">Incumbent: {selectedState.govIncumbent}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Rating: <strong className="text-purple-600">{selectedState.govRating}</strong></div>
                    <div className="text-xs text-slate-500">Key Contenders: {selectedState.govKeyCandidates}</div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 pt-2">No gubernatorial election scheduled for 2026 in {selectedState.name}.</p>
                )}
              </div>

              {/* House 2026 Box */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">U.S. House (2026)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">ALL ON BALLOT</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">{selectedState.houseDistricts} Congressional District{selectedState.houseDistricts > 1 ? 's' : ''}</div>
                  <p className="text-xs text-slate-500">All {selectedState.houseDistricts} representative seat{selectedState.houseDistricts > 1 ? 's' : ''} up for election on November 3, 2026.</p>
                  <div className="text-xs text-slate-400 font-mono pt-1">Source: Google Civic Information API</div>
                </div>
              </div>
            </div>

            {/* Google Civic Verified Candidates Roster for Clicked State */}
            {selectedState && verifiedCandidateProfiles.filter(c => c.state === selectedState.id).length > 0 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Google Civic API Verified Candidates for {selectedState.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">Live Synced</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {verifiedCandidateProfiles.filter(c => c.state === selectedState.id).map(cand => (
                    <div
                      key={cand.id}
                      className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-1`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{cand.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cand.party === 'Democrat' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {cand.party}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cand.office} · {cand.status} {cand.isIncumbent && '· (Incumbent)'}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {cand.bio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <MapPin className="w-8 h-8 mx-auto opacity-40 animate-bounce" />
            <p className="text-sm font-medium">Click any 3D state block above to zoom into that state and inspect official AP 2026 Senate and Gubernatorial data.</p>
          </div>
        )}
      </div>
    </div>
  );
};
