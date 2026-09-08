import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/controls/OrbitControls.js";

const host = document.querySelector("#scene");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060b17);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(7.2, 5.7, 8.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(host.clientWidth, host.clientHeight);
host.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.target.set(1.35, 0.75, 0.95);
orbit.minDistance = 5;
orbit.maxDistance = 15;

// Lighting
scene.add(new THREE.HemisphereLight(0xc9d7ff, 0x0c1222, 2.0));
const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(4, 8, 5);
scene.add(key);

// Ground grid
const grid = new THREE.GridHelper(12, 12, 0x33415f, 0x151f34);
grid.position.y = -0.02;
scene.add(grid);

// Fixed ground/reference frame
const ground = new THREE.Group();
scene.add(ground);
addAxes(ground, 2.9, [0xaab4c8, 0xaab4c8, 0xaab4c8], 0.065);

// Ground origin marker
const origin = new THREE.Mesh(
  new THREE.SphereGeometry(0.11, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xb6c0d1 })
);
ground.add(origin);

// Movable aircraft + aircraft/body reference frame.
// The aircraft is NOT constrained to X/Y/Z ground axes.
const body = new THREE.Group();
body.position.set(2.8, 1.15, 1.9);
scene.add(body);
addAxes(body, 2.45, [0xff626d, 0x55d99e, 0x5e9dff], 0.095);

// Stylized aircraft fuselage
const bodyShape = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.28, 1.55, 8, 16),
  new THREE.MeshStandardMaterial({
    color: 0x263b64,
    transparent: true,
    opacity: 0.56,
    roughness: 0.4,
    metalness: 0.25
  })
);
bodyShape.rotation.z = Math.PI / 2;
bodyShape.position.set(0, 0.28, 0);
body.add(bodyShape);

// Wings
const wing = new THREE.Mesh(
  new THREE.BoxGeometry(2.35, 0.08, 0.42),
  new THREE.MeshStandardMaterial({
    color: 0x31548a,
    transparent: true,
    opacity: 0.92,
    roughness: 0.35,
    metalness: 0.25
  })
);
wing.position.set(0, 0.25, 0);
body.add(wing);

// Tail plane + vertical stabilizer
const tail = new THREE.Mesh(
  new THREE.BoxGeometry(0.82, 0.06, 0.24),
  new THREE.MeshStandardMaterial({ color: 0x4d79b5, roughness: 0.35, metalness: 0.2 })
);
tail.position.set(-0.82, 0.32, 0);
body.add(tail);

const fin = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.38, 0.07),
  new THREE.MeshStandardMaterial({ color: 0x5d89c7, roughness: 0.35, metalness: 0.2 })
);
fin.position.set(-0.78, 0.47, 0);
body.add(fin);

// Body origin marker + dashed position link from ground origin to body origin.
const bodyOriginMarker = new THREE.Mesh(
  new THREE.SphereGeometry(0.105, 18, 18),
  new THREE.MeshBasicMaterial({ color: 0x5e9dff })
);
bodyOriginMarker.position.set(0,0,0);
body.add(bodyOriginMarker);

const linkMaterial = new THREE.LineDashedMaterial({
  color: 0x55749f, dashSize: 0.14, gapSize: 0.10, transparent: true, opacity: 0.65
});
const linkGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0,0,0), body.position.clone()
]);
const originLink = new THREE.Line(linkGeometry, linkMaterial);
originLink.computeLineDistances();
scene.add(originLink);

function updateOriginLink() {
  const points = [new THREE.Vector3(0, 0, 0), body.position.clone()];
  originLink.geometry.setFromPoints(points);
  originLink.computeLineDistances();
}

function updatePositionUI() {
  const pos = body.position;
  const el = document.querySelector("#positionValue");
  if (el) el.textContent = `[ ${fmt(pos.x)}, ${fmt(pos.y)}, ${fmt(pos.z)} ]`;
  const tag = document.querySelector("#bodyLocation");
  if (tag) tag.textContent = `AIRCRAFT POSITION  [ ${fmt(pos.x)}, ${fmt(pos.y)}, ${fmt(pos.z)} ]`;
}

const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(bodyShape.geometry),
  new THREE.LineBasicMaterial({ color: 0x8db8ff, transparent: true, opacity: 0.8 })
);
bodyShape.add(edges);

// Subtle rings showing rotational degrees of freedom
const rings = {};
[
  ["x", 0xff626d, new THREE.Euler(0, Math.PI / 2, 0)],
  ["y", 0x55d99e, new THREE.Euler(Math.PI / 2, 0, 0)],
  ["z", 0x5e9dff, new THREE.Euler(0, 0, 0)]
].forEach(([axis, color, rotation]) => {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.012, 8, 96),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22 })
  );
  ring.rotation.copy(rotation);
  body.add(ring);
  rings[axis] = ring;
});

function addAxes(group, length, colors, radius) {
  const dirs = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1)
  ];

  dirs.forEach((dir, i) => {
    const material = new THREE.MeshBasicMaterial({ color: colors[i] });

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length * 0.78, 12),
      material
    );
    shaft.position.copy(dir).multiplyScalar(length * 0.39);
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    group.add(shaft);

    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 2.2, length * 0.18, 12),
      material
    );
    tip.position.copy(dir).multiplyScalar(length * 0.88);
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    group.add(tip);
  });
}

// State
let roll = 0;
let pitch = 0;
let yaw = 0;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rad = d => d * Math.PI / 180;
const deg = r => r * 180 / Math.PI;

function rotationMatrix(rollDeg, pitchDeg, yawDeg) {
  const r = rad(rollDeg), p = rad(pitchDeg), y = rad(yawDeg);
  const cr = Math.cos(r), sr = Math.sin(r);
  const cp = Math.cos(p), sp = Math.sin(p);
  const cy = Math.cos(y), sy = Math.sin(y);

  // R = Rz(yaw) Ry(pitch) Rx(roll)
  return [
    cy*cp, cy*sp*sr - sy*cr, cy*sp*cr + sy*sr,
    sy*cp, sy*sp*sr + cy*cr, sy*sp*cr - cy*sr,
    -sp,   cp*sr,            cp*cr
  ];
}

function matrix4From3(m) {
  // THREE.Matrix4.set arguments are row-major, despite internal column-major storage.
  return new THREE.Matrix4().set(
    m[0],m[1],m[2],0,
    m[3],m[4],m[5],0,
    m[6],m[7],m[8],0,
    0,0,0,1
  );
}

function determinant(m) {
  return m[0]*(m[4]*m[8]-m[5]*m[7])
       - m[1]*(m[3]*m[8]-m[5]*m[6])
       + m[2]*(m[3]*m[7]-m[4]*m[6]);
}

function orthError(m) {
  let sum = 0;
  for(let i=0;i<3;i++){
    for(let j=0;j<3;j++){
      let s = 0;
      for(let k=0;k<3;k++) s += m[k*3+i] * m[k*3+j];
      if(i===j) s -= 1;
      sum += s*s;
    }
  }
  return Math.sqrt(sum);
}

function fmt(v) {
  return v.toFixed(3);
}

function updateUI() {
  const m = rotationMatrix(roll, pitch, yaw);
  body.setRotationFromMatrix(matrix4From3(m));

  document.querySelector("#rollValue").textContent = `${roll.toFixed(1)}°`;
  document.querySelector("#pitchValue").textContent = `${pitch.toFixed(1)}°`;
  document.querySelector("#yawValue").textContent = `${yaw.toFixed(1)}°`;
  const rollMini = document.querySelector("#rollMini");
  if (rollMini) rollMini.textContent = `${roll.toFixed(1)}°`;

  document.querySelector("#matrix").innerHTML = m.map(v => `<span>${fmt(v)}</span>`).join("");

  // Columns = body X, Y, Z axes expressed in ground coordinates.
  document.querySelector("#xAxis").textContent = `[ ${fmt(m[0])}, ${fmt(m[3])}, ${fmt(m[6])} ]`;
  document.querySelector("#yAxis").textContent = `[ ${fmt(m[1])}, ${fmt(m[4])}, ${fmt(m[7])} ]`;
  document.querySelector("#zAxis").textContent = `[ ${fmt(m[2])}, ${fmt(m[5])}, ${fmt(m[8])} ]`;

  document.querySelector("#det").textContent = determinant(m).toFixed(6);
  document.querySelector("#orth").textContent = orthError(m).toFixed(6);

  syncDirectInputs();

  // Dial indicators
  const dialValues = { roll, pitch, yaw };
  document.querySelectorAll(".dial-control").forEach(el => {
    const axis = el.querySelector(".dial").dataset.axis;
    const value = dialValues[axis];
    const tick = el.querySelector(".dial-tick");
    tick.style.transform = `rotate(${value + 0}deg)`;
  });
}

document.querySelector("#resetBtn").addEventListener("click", () => {
  roll = pitch = yaw = 0;
  body.position.set(2.8, 1.15, 1.9);
  updateOriginLink();
  updatePositionUI();
  updateUI();
  if (joystickKnob) joystickKnob.style.transform = "translate(0px,0px)";
});

// Copy matrix
document.querySelector("#copyBtn").addEventListener("click", async () => {
  const m = rotationMatrix(roll, pitch, yaw);
  const text = [
    m.slice(0,3).map(fmt).join("\t"),
    m.slice(3,6).map(fmt).join("\t"),
    m.slice(6,9).map(fmt).join("\t")
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    const btn = document.querySelector("#copyBtn");
    btn.textContent = "COPIED";
    setTimeout(() => btn.textContent = "COPY", 900);
  } catch {}
});

// Dial controls: drag vertically for continuous fine adjustment.
document.querySelectorAll(".dial-control").forEach(control => {
  const dial = control.querySelector(".dial");
  let lastY = 0;
  let active = false;

  dial.addEventListener("pointerdown", e => {
    active = true;
    lastY = e.clientY;
    dial.setPointerCapture(e.pointerId);
  });

  dial.addEventListener("pointermove", e => {
    if(!active) return;
    const dy = lastY - e.clientY;
    lastY = e.clientY;
    const axis = dial.dataset.axis;
    if(axis === "roll") roll = clamp(roll + dy * 0.45, -180, 180);
    if(axis === "pitch") pitch = clamp(pitch + dy * 0.45, -90, 90);
    if(axis === "yaw") yaw = clamp(yaw + dy * 0.45, -180, 180);
    updateUI();
  });

  dial.addEventListener("pointerup", () => active = false);
  dial.addEventListener("pointercancel", () => active = false);
});

// 3D aircraft interaction.
// Dragging the aircraft moves its origin freely in the camera-facing plane:
// no snapping to ground X/Y/Z axes and no ground-plane constraint.
let bodyDrag = null;
const movePlane = new THREE.Plane();
const dragStartPoint = new THREE.Vector3();
const dragStartBody = new THREE.Vector3();
const dragRaycaster = new THREE.Raycaster();
const dragPointer = new THREE.Vector2();

function pointerToNDC(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
    y: -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  };
}

function getCameraPlanePoint(e, target = new THREE.Vector3()) {
  const p = pointerToNDC(e);
  dragPointer.set(p.x, p.y);
  dragRaycaster.setFromCamera(dragPointer, camera);
  return dragRaycaster.ray.intersectPlane(movePlane, target);
}

function beginAircraftMove(e) {
  const p = pointerToNDC(e);
  dragPointer.set(p.x, p.y);
  dragRaycaster.setFromCamera(dragPointer, camera);

  // A plane through the aircraft origin, parallel to the camera image plane.
  const normal = new THREE.Vector3();
  camera.getWorldDirection(normal);
  movePlane.set(normal, -normal.dot(body.getWorldPosition(new THREE.Vector3())));

  const hit = dragRaycaster.ray.intersectPlane(movePlane, dragStartPoint);
  if (!hit) return false;

  dragStartBody.copy(body.position);
  bodyDrag = { mode: "move", x: e.clientX, y: e.clientY };
  orbit.enabled = false;
  renderer.domElement.setPointerCapture(e.pointerId);
  return true;
}

renderer.domElement.addEventListener("pointerdown", e => {
  if (e.button !== 0) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

  // Center region: move the aircraft freely in an arbitrary plane.
  if (nx*nx + ny*ny < 0.52) {
    beginAircraftMove(e);
  }
});

renderer.domElement.addEventListener("pointermove", e => {
  if (!bodyDrag) return;

  if (bodyDrag.mode === "move") {
    const hit = getCameraPlanePoint(e);
    if (!hit) return;

    // Preserve the exact 3D displacement from the drag start.
    const deltaWorld = hit.clone().sub(dragStartPoint);
    const newWorld = dragStartBody.clone().add(deltaWorld);

    // body is parented to the scene, so world and local coordinates match.
    body.position.copy(newWorld);
    updateOriginLink();
    updatePositionUI();
  }
});

function releaseBodyDrag(){
  if (bodyDrag) {
    bodyDrag = null;
    orbit.enabled = true;
  }
}
renderer.domElement.addEventListener("pointerup", releaseBodyDrag);
renderer.domElement.addEventListener("pointercancel", releaseBodyDrag);

// Virtual joystick: horizontal = yaw, vertical = pitch.
const joystick = document.querySelector("#joystick");
const joystickKnob = document.querySelector("#joystickKnob");
let joystickActive = false;

function setJoystick(clientX, clientY){
  const r = joystick.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const max = r.width * 0.34;

  let dx = clientX - cx;
  let dy = clientY - cy;
  const mag = Math.hypot(dx,dy);
  if (mag > max) {
    dx *= max / mag;
    dy *= max / mag;
  }

  joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  yaw = clamp((dx / max) * 180, -180, 180);
  pitch = clamp((-dy / max) * 90, -90, 90);
  updateUI();
}

joystick.addEventListener("pointerdown", e => {
  joystickActive = true;
  joystick.setPointerCapture(e.pointerId);
  setJoystick(e.clientX, e.clientY);
});
joystick.addEventListener("pointermove", e => {
  if (joystickActive) setJoystick(e.clientX, e.clientY);
});
joystick.addEventListener("pointerup", () => joystickActive = false);
joystick.addEventListener("pointercancel", () => joystickActive = false);

document.querySelector("#rollLeft").addEventListener("click", () => {
  roll = clamp(roll - 5, -180, 180);
  updateUI();
});
document.querySelector("#rollRight").addEventListener("click", () => {
  roll = clamp(roll + 5, -180, 180);
  updateUI();
});

// Keep joystick centered when Reset is used.
const originalReset = document.querySelector("#resetBtn");
originalReset.addEventListener("click", () => {
  joystickKnob.style.transform = "translate(0,0)";
});


// ----- Direct X/Y/Z orientation entry -----
// X = roll, Y = pitch, Z = yaw.
const xInput = document.querySelector("#xInput");
const yInput = document.querySelector("#yInput");
const zInput = document.querySelector("#zInput");
const applyXYZ = document.querySelector("#applyXYZ");

function syncDirectInputs(){
  if(xInput) xInput.value = roll.toFixed(1);
  if(yInput) yInput.value = pitch.toFixed(1);
  if(zInput) zInput.value = yaw.toFixed(1);

  const knob=document.querySelector("#joystickKnob");
  const joy=document.querySelector("#joystick");
  if(knob && joy){
    const max=joy.clientWidth*.34;
    knob.style.transform=`translate(${(yaw/180)*max}px,${(-pitch/90)*max}px)`;
  }
}
function applyDirectXYZ(){
  const xv=Number(xInput?.value), yv=Number(yInput?.value), zv=Number(zInput?.value);
  roll=clamp(Number.isFinite(xv)?xv:0,-180,180);
  pitch=clamp(Number.isFinite(yv)?yv:0,-90,90);
  yaw=clamp(Number.isFinite(zv)?zv:0,-180,180);
  updateUI();
  syncDirectInputs();
}
applyXYZ?.addEventListener("click",applyDirectXYZ);
[xInput,yInput,zInput].forEach(input=>{
  input?.addEventListener("keydown",e=>{if(e.key==="Enter")applyDirectXYZ()});
});

function resize() {
  const w = host.clientWidth;
  const h = host.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", resize);

updateOriginLink();
updatePositionUI();
updateUI();

function animate() {
  requestAnimationFrame(animate);
  orbit.update();
  renderer.render(scene, camera);
}
animate();
