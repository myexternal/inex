/* Inex v3 · 3D four-burner range (Higgsfield image-to-3D from a frame of Inex's own video).
   three.js is only fetched when the visitor gets near the equipment cards. Renders on demand. */
let THREE;
const cell = document.querySelector('[data-3d]');
const canvas = cell && cell.querySelector('[data-canvas]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

if (cell && canvas && webglOK()) {
  let started = false;
  const io = new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; io.disconnect(); init(); }
  }, { rootMargin: innerWidth < 860 ? '250px 0px' : '600px 0px' });
  io.observe(cell);
}

// dark studio with long softboxes: polished steel needs something to reflect
function studio() {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), new THREE.MeshBasicMaterial({ color: 0x6a7378, side: THREE.BackSide })));
  const box = (w, h, color, x, y, z, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m);
  };
  box(6, 1.2, 0xffffff, 0, 2.9, 0, 0, Math.PI / 2);
  box(1.0, 3.6, 0xf2f4f8, -4.9, 0.6, 1.5, Math.PI / 2);
  box(0.6, 3.2, 0xd8f0f2, 4.9, 0.4, -1.2, -Math.PI / 2);
  box(2.2, 0.22, 0xa00d14, 2.2, -0.6, -4.9);
  box(7, 3.2, 0xffffff, 0, 1.0, 4.9, Math.PI);
  box(10, 10, 0x2c3336, 0, -2.95, 0, 0, Math.PI / 2);
  return env;
}

async function init() {
  const small = innerWidth < 860;
  let GLTFLoader, MeshoptDecoder;
  try {
    [THREE, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import('three'),
      import('../vendor/jsm/loaders/GLTFLoader.js'),
      import('../vendor/jsm/libs/meshopt_decoder.module.js'),
    ]);
  } catch (e) { console.warn('3D unavailable, keeping the photo', e); return; }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: devicePixelRatio < 2, alpha: true, powerPreference: small ? 'default' : 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(), 0.02).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 50);
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-2, 3, 2.5); scene.add(key);
  const rim = new THREE.PointLight(0xff3030, small ? 1.2 : 2.2, 5, 1.8); rim.position.set(1.2, 0.35, -1.4); scene.add(rim);
  const fill = new THREE.PointLight(0xf4f6f8, 1.1, 6, 2); fill.position.set(-1.6, 0.3, 1.2); scene.add(fill);

  // soft contact shadow
  const sh = document.createElement('canvas'); sh.width = sh.height = 128;
  const g = sh.getContext('2d'); const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,.8)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; scene.add(shadow);

  const pivot = new THREE.Group(); scene.add(pivot);
  let model;
  try {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(small ? 'media/range3d-m.glb' : 'media/range3d.glb');
    model = gltf.scene;
  } catch (e) { console.warn('3D model failed, keeping the photo', e); return; }

  model.traverse(o => {
    if (!o.isMesh) return;
    const src = o.material;
    // keep the photo colours (red knobs, brass); swap the baked metal map for brushed steel that reads well in the dark cell
    if (src.metalnessMap) src.metalnessMap.dispose();
    o.material = new THREE.MeshStandardMaterial({
      map: src.map, normalMap: src.normalMap || null,
      metalness: 0.68, roughness: 0.34, envMapIntensity: 1.9,
    });
    src.dispose();
  });
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()); const c = box.getCenter(new THREE.Vector3());
  model.position.set(-c.x, -box.min.y, -c.z);
  pivot.add(model);
  shadow.scale.set(size.x * 1.5, size.z * 1.9, 1);
  shadow.position.y = 0.002;
  // on narrow cells the caption sits over the lower third, so aim lower to lift the model
  const tall = () => canvas.clientHeight / Math.max(1, canvas.clientWidth) > 1.05;
  const target = new THREE.Vector3(0, size.y * 0.5, 0);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const half = THREE.MathUtils.degToRad(camera.fov / 2);
    const needH = size.y * (small ? 1.62 : 1.42), needW = Math.max(size.x, size.z) * 1.35;
    target.y = size.y * (small ? 0.3 : 0.46);
    camera.userData.dist = Math.max(needH / 2 / Math.tan(half), needW / 2 / (Math.tan(half) * camera.aspect));
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(() => { resize(); wake(); }).observe(canvas);

  // input: drag with inertia, scroll adds a slow turn. Sleeps when nothing moves.
  let drag = 0, dragV = 0, dragging = false, lastX = 0, lastY = 0, axis = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; axis = 0; lastX = e.clientX; lastY = e.clientY; wake(); });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (!axis && Math.hypot(dx, dy) > 6) { axis = Math.abs(dx) > Math.abs(dy) ? 1 : 2; if (axis === 1) canvas.setPointerCapture(e.pointerId); }
    if (axis !== 1) return;
    lastX = e.clientX; lastY = e.clientY;
    dragV = dx * 0.009; drag += dragV; wake();
  });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('lostpointercapture', end);
  addEventListener('scroll', () => wake(), { passive: true });

  const media = cell.querySelector('.card__media');
  const progress = () => {
    const r = cell.getBoundingClientRect();
    return Math.min(1, Math.max(0, (innerHeight - r.top) / (r.height + innerHeight)));
  };
  let visible = true, rotY = -2.4, elev = 0.22;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(cell);

  function frame() {
    const p = progress();
    if (!dragging) { dragV *= 0.93; drag += dragV; }
    const targetRot = reduce ? -1.25 : (-1.75 + p * 0.95);
    const targetElev = reduce ? 0.2 : 0.12 + p * 0.22;
    const dr = targetRot + drag - rotY, de = targetElev - elev;
    rotY += dr * 0.075; elev += de * 0.06;
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
  cell.classList.add('has-3d');
  wake();
  window.__inex3d = { frame, scene, camera, renderer };
}
