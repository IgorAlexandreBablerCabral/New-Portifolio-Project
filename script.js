const { Engine, World, Bodies, Constraint, Body } = Matter;

const engine = Engine.create();
const world = engine.world;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const btn = document.getElementById("toggleBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

// imagem
const img = new Image();
img.src = "https://picsum.photos/1200/800";

const cols = 60;
const rows = 40;
const spacing = 10;

let points = [];

// criar malha
for (let y = 0; y < rows; y++) {
  points[y] = [];

  for (let x = 0; x < cols; x++) {
    const body = Bodies.circle(200 + x * spacing, 100 + y * spacing, 2, {
      isStatic: y === 0,
      frictionAir: 0.02
    });

    World.add(world, body);
    points[y][x] = body;

    if (x > 0) {
      World.add(world, Constraint.create({
        bodyA: points[y][x - 1],
        bodyB: body,
        stiffness: 0.4
      }));
    }

    if (y > 0) {
      World.add(world, Constraint.create({
        bodyA: points[y - 1][x],
        bodyB: body,
        stiffness: 0.4
      }));
    }
  }
}

// vento
function applyWind() {
  const time = Date.now() * 0.001;
  const force = Math.sin(time) * 0.0003;

  points.forEach(row => {
    row.forEach(p => {
      if (!p.isStatic) {
        Body.applyForce(p, p.position, { x: force, y: 0 });
      }
    });
  });
}

// desenhar imagem
function drawImage() {
  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      const p = points[y][x].position;

      ctx.drawImage(
        img,
        (x / cols) * img.width,
        (y / rows) * img.height,
        img.width / cols,
        img.height / rows,
        p.x,
        p.y,
        spacing,
        spacing
      );
    }
  }
}

// controle do loop
let animationId = null;
let isRunning = true;

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  applyWind();
  Engine.update(engine);

  drawImage();

  animationId = requestAnimationFrame(loop);
}

// botão pause/play
btn.addEventListener("click", () => {
  if (isRunning) {
    cancelAnimationFrame(animationId);
    btn.textContent = "Play";
  } else {
    loop();
    btn.textContent = "Pause";
  }

  isRunning = !isRunning;
});

// iniciar
img.onload = () => {
  loop();
};
