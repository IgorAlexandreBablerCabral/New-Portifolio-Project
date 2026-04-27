import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";

// cena
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

// geometria (papel)
const segmentsX = 120;
const segmentsY = 120;

const geometry = new THREE.PlaneGeometry(12, 7, segmentsX, segmentsY);

const texture = new THREE.TextureLoader().load(
  "https://picsum.photos/1920/1080"
);

const material = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.DoubleSide
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 5;

// =============================
// BOTÕES (layout padronizado)
// =============================
function getIndex(x, y) {
  return y * (segmentsX + 1) + x;
}

const buttons = [
  { el: document.getElementById("btn1"), x: 30, y: 60 },
  { el: document.getElementById("btn2"), x: 60, y: 60 },
  { el: document.getElementById("btn3"), x: 90, y: 60 }
];

function updateButtonPosition(btnObj) {
  const pos = geometry.attributes.position;

  const index = getIndex(btnObj.x, btnObj.y);

  const x = pos.getX(index);
  const y = pos.getY(index);
  const z = pos.getZ(index);

  const vector = new THREE.Vector3(x, y, z);
  vector.project(camera);

  const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  btnObj.el.style.left = screenX + "px";
  btnObj.el.style.top = screenY + "px";
  btnObj.el.style.transform = "translate(-50%, -50%)";
}

// =============================
// FÍSICA MAIS SUAVE (AQUOSA)
// =============================
const pos = geometry.attributes.position;
const velocities = new Float32Array(pos.count);

// mouse interação
let mouse = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// animação
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const currentZ = pos.getZ(i);

    // ondas combinadas (mais natural)
    const baseWave =
      Math.sin(x * 1.2 + time) * 0.15 +
      Math.cos(y * 1.0 + time * 0.8) * 0.1;

    // interação com mouse (ripple)
    const dist = Math.sqrt(
      Math.pow(x - mouse.x * 6, 2) +
      Math.pow(y - mouse.y * 3, 2)
    );

    const ripple = Math.exp(-dist * 2) * 0.3;

    const target = baseWave + ripple;

    // inércia (efeito líquido)
    velocities[i] += (target - currentZ) * 0.02;
    velocities[i] *= 0.90;

    pos.setZ(i, currentZ + velocities[i]);
  }

  pos.needsUpdate = true;

  // atualizar botões
  buttons.forEach(updateButtonPosition);

  renderer.render(scene, camera);
}

animate();

// responsivo
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
