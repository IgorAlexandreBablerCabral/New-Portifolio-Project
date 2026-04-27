let scene, camera, renderer, mesh;
let isRunning = true;
let animationId;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // geometria (muitos segmentos = mais realismo)
  const geometry = new THREE.PlaneGeometry(6, 4, 100, 80);

  // textura (imagem)
  const texture = new THREE.TextureLoader().load(
    "https://picsum.photos/1200/800"
  );

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

function animate() {
  if (!isRunning) return;

  const time = Date.now() * 0.002;

  // deformar vértices (vento)
  const pos = mesh.geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    const wave =
      Math.sin(x * 2 + time) * 0.2 +
      Math.cos(y * 3 + time) * 0.1;

    pos.setZ(i, wave);
  }

  pos.needsUpdate = true;

  renderer.render(scene, camera);

  animationId = requestAnimationFrame(animate);
}

// botão pause/play
document.getElementById("toggleBtn").addEventListener("click", () => {
  if (isRunning) {
    cancelAnimationFrame(animationId);
    document.getElementById("toggleBtn").textContent = "Play";
  } else {
    isRunning = true;
    animate();
    document.getElementById("toggleBtn").textContent = "Pause";
  }

  isRunning = !isRunning;
});

// resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
