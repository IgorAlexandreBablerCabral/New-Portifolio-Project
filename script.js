import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";

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
const geometry = new THREE.PlaneGeometry(12, 7, 120, 120);

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

// BOTÕES
const segmentsX = 120; // mesmo valor da geometria
const segmentsY = 120;

function getIndex(x, y) {
  return y * (segmentsX + 1) + x;
}

// distribuição moderna (linha central)
const buttons = [
  { el: document.getElementById("btn1"), x: 30, y: 60 },
  { el: document.getElementById("btn2"), x: 60, y: 60 },
  { el: document.getElementById("btn3"), x: 90, y: 60 }
];

// converter 3D → tela
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
}

// animação
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.002;
  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const wave =
      Math.sin(i * 0.05 + time) * 0.2 +
      Math.cos(i * 0.03 + time * 0.7) * 0.1;

    pos.setZ(i, wave);
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
