/* Inex: 3D burner table (Higgsfield image-to-3D from Inex's own photo), turned by scroll and drag */
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/jsm/loaders/GLTFLoader.js';

const section = document.querySelector('.build');
const canvas = document.querySelector('[data-canvas]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

if (section && canvas && webglOK()) {
  let started = false;
  const io = new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; init(); }
  }, { rootMargin: '600px 0px' });
  io.observe(section);
}

// A dark photo studio: black room, long white softboxes and one red strip.
// Polished steel only looks like steel when it has dark things to reflect.
function studio() {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), new THREE.MeshBasicMaterial({ color: 0x4a4d53, side: THREE.BackSide }));
  env.add(room);
  const box = (w, h, color, x, y, z, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m);
  };
  box(6, 1.2, 0xffffff, 0, 2.9, 0, 0, Math.PI / 2);         // overhead strip
  box(1.0, 3.6, 0xf2f4f8, -4.9, 0.6, 1.5, Math.PI / 2);      // left softbox
  box(0.5, 3.2, 0xdfe6ff, 4.9, 0.4, -1.2, -Math.PI / 2);     // right strip, cool
  box(2.2, 0.22, 0x9e0c12, 2.2, -0.6, -4.9);                 // red strip behind
  box(7, 3.2, 0xffffff, 0, 1.0, 4.9, Math.PI);            // big soft panel behind the camera
  box(10, 10, 0x3a3d42, 0, -2.95, 0, 0, Math.PI / 2);        // floor bounce
  return env;
}

async function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const small = innerWidth < 860;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(), 0.02).texture;

  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 50);

  // lights: soft key + the brand's red rim from behind-right
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-2, 3, 2.5); scene.add(key);
  const rim = new THREE.PointLight(0xff2a2a, 6, 6, 1.6); rim.position.set(1.4, 0.7, -1.4); scene.add(rim);
  const fill = new THREE.PointLight(0x9fb4ff, 1.2, 6, 2); fill.position.set(-1.6, 0.2, 1.2); scene.add(fill);

  // contact shadow
  const sh = document.createElement('canvas'); sh.width = sh.height = 256;
  const g = sh.getContext('2d'); const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,.75)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  const pivot = new THREE.Group(); scene.add(pivot);
  let model;
  try {
    const gltf = await new GLTFLoader().loadAsync('media/range.glb');
    model = gltf.scene;
  } catch (e) { console.warn('3D model failed, keeping photo', e); return; }

  model.traverse(o => {
    if (!o.isMesh) return;
    const src = o.material;
    // Polished stainless: keep the photo-derived texture as roughness variation, so it reads as brushed steel
    o.material = new THREE.MeshStandardMaterial({
      color: 0xc8cdd3, metalness: 1, roughness: 0.36,
      normalMap: src.normalMap || null,
      envMapIntensity: 1.6,
    });
  });
  // centre and sit on the floor
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()); const c = box.getCenter(new THREE.Vector3());
  model.position.set(-c.x, -box.min.y, -c.z);
  pivot.add(model);
  shadow.scale.set(size.x * 1.25, size.z * 1.6, 1);
  shadow.position.y = 0.002;
  const target = new THREE.Vector3(0, size.y * 0.46, 0);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // fit the model: distance from its largest dimension
    const fit = Math.max(size.x, size.y * camera.aspect * 0.9) / camera.aspect;
    const dist = (Math.max(fit, size.y) * 1.25) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.aspect < 1 ? 0.9 : 0.52);
    camera.userData.dist = dist;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  // ----- input: scroll progress + drag with inertia. Renders on demand, then sleeps -----
  let drag = 0, dragV = 0, dragging = false, lastX = 0, step = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); wake(); });
  canvas.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; dragV = dx * 0.008; drag += dragV; wake(); });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  addEventListener('inex:step', e => { step = e.detail; wake(); });
  addEventListener('scroll', () => wake(), { passive: true });
  addEventListener('resize', () => wake());

  const progress = () => {
    const r = section.getBoundingClientRect();
    return Math.min(1, Math.max(0, (innerHeight - r.top) / (r.height + innerHeight)));
  };

  let visible = true, rotY = -1.15, elev = 0.28;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(section);

  // per-step camera elevation: front, three-quarter, top-down onto the burners, low for the under-shelf
  const ELEV = [0.28, 0.38, 0.72, 0.12];

  // returns true while still moving
  function frame() {
    const p = progress();
    if (!dragging) { dragV *= 0.92; drag += dragV; }
    const targetRot = reduce ? -0.5 : (-1.15 + p * 2.3);
    const targetElev = reduce ? 0.3 : (ELEV[step] ?? 0.3);
    const dr = targetRot + drag - rotY, de = targetElev - elev;
    rotY += dr * 0.08;
    elev += de * 0.05;
    pivot.rotation.y = rotY;
    const d = camera.userData.dist;
    camera.position.set(0, target.y + d * Math.sin(elev), d * Math.cos(elev));
    camera.lookAt(target);
    renderer.render(scene, camera);
    return dragging || Math.abs(dr) > 0.0015 || Math.abs(de) > 0.0015 || Math.abs(dragV) > 0.0005;
  }
  let raf = 0;
  function wake() {
    if (raf || !visible) return;
    const tick = () => { raf = 0; if (!visible) return; if (frame()) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }
  frame();
  canvas.classList.add('is-ready');
  section.classList.add('has-3d');
  wake();
  window.__inex3d = { frame, scene, camera, renderer };
}
