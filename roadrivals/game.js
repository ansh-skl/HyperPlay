const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

let level = 1;
let speed = 5;
let roadY = 0;
let blueLives = 3;
let redLives = 3;
let finished = false;
let traffic = [];
const keys = {};

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

const lanes = 4;
let laneWidth, roadWidth, roadX;

function setupRoad() {
  laneWidth = width / 2.5 / lanes;
  roadWidth = laneWidth * lanes;
  roadX = (width - roadWidth) / 2;
}
setupRoad();

const blue = { x: 0, y: 0, w: 50, h: 80, color: "blue" };
const red = { x: 0, y: 0, w: 50, h: 80, color: "red" };

function resetPlayers() {
  blue.x = roadX + laneWidth * 1 - blue.w / 2;
  red.x = roadX + laneWidth * 2 - red.w / 2;
  blue.y = height - 150;
  red.y = height - 150;
}
resetPlayers();

function resetTraffic() {
  traffic = [];
  for (let i = 0; i < 5 + level * 2; i++) {
    const car = {
      lane: Math.floor(Math.random() * lanes),
      y: Math.random() * -3000,
      w: 60,
      h: 120,
      color: ["#555", "#777", "#999"][Math.floor(Math.random() * 3)]
    };
    car.x = roadX + car.lane * laneWidth + laneWidth / 2 - car.w / 2;
    traffic.push(car);
  }
}
resetTraffic();

function movePlayer(p, up, down, left, right) {
  if (keys[up]) p.y -= 8;
  if (keys[down]) p.y += 8;
  if (keys[left]) p.x -= 8;
  if (keys[right]) p.x += 8;
}

function collide(a, b) {
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

function checkBoundaries(p, isBlue) {
  if (p.x < roadX || p.x + p.w > roadX + roadWidth || p.y > height) {
    if (isBlue) blueLives--; else redLives--;
    updateLives();
    resetRound();
  }
}

function updateLives() {
  document.getElementById("blueLives").textContent = blueLives;
  document.getElementById("redLives").textContent = redLives;
}

function resetRound() {
  resetPlayers();
  resetTraffic();
  if (blueLives <= 0 || redLives <= 0) endGame();
}

function endGame() {
  finished = true;
  const msg = document.getElementById("message");
  msg.style.display = "block";
  msg.textContent = blueLives > redLives ? "🔵 Blue Wins!" : "🔴 Red Wins!";
  setTimeout(() => {
    msg.innerHTML += "<br><button onclick='restartGame()'>Play Again</button>";
  }, 800);
}

window.restartGame = function () {
  blueLives = 3;
  redLives = 3;
  level = 1;
  speed = 5;
  finished = false;
  updateLives();
  resetTraffic();
  document.getElementById("level").textContent = level;
  document.getElementById("message").style.display = "none";
  gameLoop();
};

function drawRoad() {
  const g = ctx.createLinearGradient(roadX, 0, roadX + roadWidth, 0);
  g.addColorStop(0, "#222");
  g.addColorStop(0.5, "#333");
  g.addColorStop(1, "#222");
  ctx.fillStyle = g;
  ctx.fillRect(roadX, 0, roadWidth, height);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.setLineDash([30, 20]);
  for (let i = 1; i < lanes; i++) {
    const x = roadX + i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawCar(p, body, accent) {
  ctx.fillStyle = body;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = accent;
  ctx.fillRect(p.x + 10, p.y + 10, p.w - 20, p.h - 20);
  ctx.fillStyle = "#111";
  ctx.fillRect(p.x - 5, p.y + 10, 10, 20);
  ctx.fillRect(p.x - 5, p.y + p.h - 30, 10, 20);
  ctx.fillRect(p.x + p.w - 5, p.y + 10, 10, 20);
  ctx.fillRect(p.x + p.w - 5, p.y + p.h - 30, 10, 20);
}

function gameLoop() {
  if (finished) return;
  ctx.clearRect(0, 0, width, height);

  roadY += speed;
  if (roadY >= height) roadY = 0;
  drawRoad();

  // Finish line
  const finishY = -4000 + roadY;
  if (finishY < height) {
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = i % 2 ? "#000" : "#fff";
      ctx.fillRect(roadX + (i * (roadWidth / 20)), finishY, roadWidth / 20, 20);
    }
  }

  movePlayer(blue, "w", "s", "a", "d");
  movePlayer(red, "arrowup", "arrowdown", "arrowleft", "arrowright");

  for (const car of traffic) {
    car.y += speed + 3;
    if (car.y > height) {
      car.y = Math.random() * -2000;
      car.lane = Math.floor(Math.random() * lanes);
      car.x = roadX + car.lane * laneWidth + laneWidth / 2 - car.w / 2;
    }
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.w, car.h);
    ctx.fillStyle = "#222";
    ctx.fillRect(car.x + 10, car.y + 10, car.w - 20, car.h - 20);

    if (collide(blue, car)) { blueLives--; updateLives(); resetRound(); }
    if (collide(red, car)) { redLives--; updateLives(); resetRound(); }
  }

  if (collide(blue, red)) { blue.x -= 20; red.x += 20; }

  drawCar(blue, "#007bff", "#00bfff");
  drawCar(red, "#ff3b3b", "#ff6666");

  checkBoundaries(blue, true);
  checkBoundaries(red, false);

  if (blue.y < 0 && red.y < 0) {
    level++;
    speed += 1.5;
    document.getElementById("level").textContent = level;
    resetRound();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
