// ===== SETUP =====
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
  setupRoad();
  resetPlayers();
});

let level = 1;
let speed = 5;
let roadY = 0;
let blueLives = 3;
let redLives = 3;
let finished = false;
let traffic = [];
const keys = {};

window.focus(); // ensure the canvas gets keyboard focus

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// ===== ROAD =====
const lanes = 4;
let laneWidth, roadWidth, roadX;

function setupRoad() {
  laneWidth = width / 2.5 / lanes;
  roadWidth = laneWidth * lanes;
  roadX = (width - roadWidth) / 2;
}
setupRoad();

// ===== PLAYERS =====
const blue = { x: 0, y: 0, w: 60, h: 100, img: new Image() };
const red = { x: 0, y: 0, w: 60, h: 100, img: new Image() };

blue.img.src = "https://opengameart.org/sites/default/files/car-blue.png";
red.img.src = "https://opengameart.org/sites/default/files/car-red.png";

function resetPlayers() {
  blue.x = roadX + laneWidth * 1 - blue.w / 2;
  red.x = roadX + laneWidth * 2 - red.w / 2;
  blue.y = height - 180;
  red.y = height - 180;
}
resetPlayers();

// ===== TRAFFIC =====
function resetTraffic() {
  traffic = [];
  for (let i = 0; i < 5 + level * 2; i++) {
    const car = {
      lane: Math.floor(Math.random() * lanes),
      y: Math.random() * -3000,
      w: 60,
      h: 100,
      img: new Image()
    };
    car.img.src = "https://opengameart.org/sites/default/files/car-gray.png";
    car.x = roadX + car.lane * laneWidth + laneWidth / 2 - car.w / 2;
    traffic.push(car);
  }
}
resetTraffic();

// ===== GAME LOGIC =====
function movePlayer(p, up, down, left, right) {
  if (keys[up]) p.y -= 8;
  if (keys[down]) p.y += 8;
  if (keys[left]) p.x -= 8;
  if (keys[right]) p.x += 8;
}

function collide(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
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

// ===== DRAWING =====
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

function drawCar(p) {
  ctx.drawImage(p.img, p.x, p.y, p.w, p.h);
}

// ===== MAIN LOOP =====
function gameLoop() {
  if (finished) return;
  ctx.clearRect(0, 0, width, height);

  roadY += speed;
  if (roadY >= height) roadY = 0;
  drawRoad();

  movePlayer(blue, "w", "s", "a", "d");
  movePlayer(red, "arrowup", "arrowdown", "arrowleft", "arrowright");

  for (const car of traffic) {
    car.y += speed + 3;
    if (car.y > height) {
      car.y = Math.random() * -2000;
      car.lane = Math.floor(Math.random() * lanes);
      car.x = roadX + car.lane * laneWidth + laneWidth / 2 - car.w / 2;
    }
    ctx.drawImage(car.img, car.x, car.y, car.w, car.h);

    if (collide(blue, car)) { blueLives--; updateLives(); resetRound(); }
    if (collide(red, car)) { redLives--; updateLives(); resetRound(); }
  }

  if (collide(blue, red)) { blue.x -= 20; red.x += 20; }

  drawCar(blue);
  drawCar(red);

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
