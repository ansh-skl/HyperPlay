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

// Load assets
const roadImg = new Image();
roadImg.src = "https://i.imgur.com/4E0rFqB.jpg"; // Asphalt texture
const blueCar = new Image();
blueCar.src = "https://i.imgur.com/1jY0YxZ.png"; // Blue kart
const redCar = new Image();
redCar.src = "https://i.imgur.com/dZyJ7Tw.png"; // Red kart
const trafficCars = [
  "https://i.imgur.com/xldcRlo.png",
  "https://i.imgur.com/XIo3hi7.png"
].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

// Sounds
const crashSound = new Audio("https://cdn.pixabay.com/audio/2021/09/09/audio_5f3a44d42a.mp3");
const levelUpSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_93b46a42c8.mp3");
const bgMusic = new Audio("https://cdn.pixabay.com/audio/2022/03/14/audio_73ab1eb0b2.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;
bgMusic.play().catch(() => {});

// Game variables
let level = 1;
let speed = 6;
let roadY = 0;
let blueLives = 3;
let redLives = 3;
let finished = false;
let traffic = [];
let keys = {};

const lanes = 4;
const laneWidth = width / 2.5 / lanes;
const roadWidth = laneWidth * lanes;
const roadX = (width - roadWidth) / 2;
const finishLineY = -5000;

const blue = { x: roadX + laneWidth, y: height - 150, w: 50, h: 90, color: "blue" };
const red = { x: roadX + laneWidth * 2, y: height - 150, w: 50, h: 90, color: "red" };

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function resetTraffic() {
  traffic = [];
  for (let i = 0; i < 5 + level; i++) {
    const car = {
      x: roadX + laneWidth * Math.floor(Math.random() * lanes),
      y: Math.random() * -2000,
      w: 50,
      h: 90,
      img: trafficCars[Math.floor(Math.random() * trafficCars.length)]
    };
    traffic.push(car);
  }
}

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
    crashSound.play();
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
  blue.x = roadX + laneWidth;
  red.x = roadX + laneWidth * 2;
  blue.y = height - 150;
  red.y = height - 150;
  resetTraffic();
  if (blueLives <= 0 || redLives <= 0) endGame();
}

function endGame() {
  finished = true;
  const msg = document.getElementById("message");
  msg.style.display = "block";
  msg.textContent = blueLives > redLives ? "🔵 Blue Wins!" : "🔴 Red Wins!";
  setTimeout(() => {
    msg.innerHTML = "<button onclick='restartGame()'>Play Again</button>";
  }, 2000);
}

window.restartGame = function() {
  blueLives = 3;
  redLives = 3;
  level = 1;
  speed = 6;
  finished = false;
  updateLives();
  resetTraffic();
  document.getElementById("level").textContent = level;
  document.getElementById("message").style.display = "none";
  gameLoop();
};

resetTraffic();

function gameLoop() {
  if (finished) return;

  ctx.clearRect(0, 0, width, height);

  // Draw scrolling road
  roadY += speed;
  if (roadY >= height) roadY = 0;
  ctx.drawImage(roadImg, roadX, roadY - height, roadWidth, height);
  ctx.drawImage(roadImg, roadX, roadY, roadWidth, height);

  // Finish line
  const finishY = finishLineY + roadY;
  ctx.fillStyle = "white";
  ctx.fillRect(roadX, finishY, roadWidth, 20);

  // Move players
  movePlayer(blue, "w", "s", "a", "d");
  movePlayer(red, "arrowup", "arrowdown", "arrowleft", "arrowright");

  // Traffic update
  for (let car of traffic) {
    car.y += speed + 3;
    if (car.y > height) {
      car.y = -2000 * Math.random() - 200;
      car.x = roadX + laneWidth * Math.floor(Math.random() * lanes);
    }
    ctx.drawImage(car.img, car.x, car.y, car.w, car.h);

    // Collisions
    if (collide(blue, car)) {
      crashSound.play();
      blueLives--;
      updateLives();
      resetRound();
    }
    if (collide(red, car)) {
      crashSound.play();
      redLives--;
      updateLives();
      resetRound();
    }
  }

  // Player vs player bump
  if (collide(blue, red)) {
    blue.x -= 20;
    red.x += 20;
  }

  // Draw players
  ctx.drawImage(blueCar, blue.x, blue.y, blue.w, blue.h);
  ctx.drawImage(redCar, red.x, red.y, red.w, red.h);

  checkBoundaries(blue, true);
  checkBoundaries(red, false);

  // Finish line check
  if (blue.y < 0 && red.y < 0) {
    level++;
    speed += 2;
    levelUpSound.play();
    document.getElementById("level").textContent = level;
    resetRound();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
