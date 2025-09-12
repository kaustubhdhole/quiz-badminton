const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const rulesDiv = document.getElementById('rules');
const configDiv = document.getElementById('config');

function resizeCanvas() {
  const availableWidth = window.innerWidth - rulesDiv.offsetWidth - configDiv.offsetWidth;
  canvas.width = availableWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

let score = 0;
const scoreDiv = document.getElementById('score');
const cheatHeader = document.getElementById('cheats-header');
const cheatList = document.getElementById('cheats-list');
let cheatsUnlocked = false;

const skateboardHeight = 12;
let skateboardWidth = 120;
let skateboardX = (canvas.width - skateboardWidth) / 2;

const skateboardSizeMap = {
  small: 80,
  medium: 120,
  large: 160
};

const sizeSelect = document.getElementById('size-select');
const greenCountInput = document.getElementById('green-count');
const gravityInput = document.getElementById('gravity-select');
const citySelect = document.getElementById('city-select');

let gravity = parseFloat(gravityInput.value);
let quizBrickCount = parseInt(greenCountInput.value, 10);
let city = citySelect.value;

sizeSelect.addEventListener('change', (e) => {
  skateboardWidth = skateboardSizeMap[e.target.value];
  if (skateboardX > canvas.width - skateboardWidth) {
    skateboardX = canvas.width - skateboardWidth;
  }
  sizeSelect.blur();
});

greenCountInput.addEventListener('change', (e) => {
  quizBrickCount = parseInt(e.target.value, 10);
  initializeBricks();
  greenCountInput.blur();
});

gravityInput.addEventListener('change', (e) => {
  gravity = parseFloat(e.target.value);
  dx = Math.sign(dx) * gravity;
  dy = Math.sign(dy) * gravity;
  gravityInput.blur();
});

citySelect.addEventListener('change', (e) => {
  city = e.target.value;
  initializeCity();
  citySelect.blur();
});

const defaultBallRadius = 10;
let ballRadius = defaultBallRadius;
const defaultBallColor = '#f1c40f';
const cheatBallColor = '#00ff00';
let ballColor = defaultBallColor;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = gravity;
let dy = -gravity;
let lastSpacePress = 0;
let cheatActive = false;

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('wheel', wheelHandler, { passive: false });
document.addEventListener('mousemove', mouseMoveHandler, false);

window.addEventListener('resize', () => {
  resizeCanvas();
  if (skateboardX > canvas.width - skateboardWidth) {
    skateboardX = canvas.width - skateboardWidth;
  }
  updateBrickLayout();
  if (city === 'nyc') initializeBuildings();
});

const brickRowCount = 5;
const brickColumnCount = 14;
let brickWidth = 55;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
let brickOffsetLeft = 30;

function updateBrickLayout() {
  brickWidth =
    (canvas.width - 2 * brickOffsetLeft - (brickColumnCount - 1) * brickPadding) /
    brickColumnCount;
}
updateBrickLayout();

let bricks = [];
let remainingBricks = 0;

function initializeBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, quiz: false };
    }
  }
  let quizBricks = Math.min(quizBrickCount, brickRowCount * brickColumnCount);
  while (quizBricks > 0) {
    const c = Math.floor(Math.random() * brickColumnCount);
    const r = Math.floor(Math.random() * brickRowCount);
    const b = bricks[c][r];
    if (!b.quiz) {
      b.quiz = true;
      quizBricks--;
    }
  }
  remainingBricks = brickRowCount * brickColumnCount;
}

initializeBricks();

let buildings = [];
const windowWidth = 8;
const windowHeight = 10;
const windowPadding = 4;

function initializeBuildings() {
  const colors = ['#2c3e50', '#34495e', '#3d566e', '#4b6584', '#2f3640'];
  const positions = [0.05, 0.25, 0.55, 0.75];
  const bWidth = canvas.width * 0.1;
  buildings = positions.map((p, i) => {
    const height = canvas.height * (0.2 + Math.random() * 0.3);
    const xPos = canvas.width * p;
    const yPos = canvas.height - height;
    const windows = [];
    for (
      let wy = yPos + windowPadding;
      wy < yPos + height - windowHeight;
      wy += windowHeight + windowPadding
    ) {
      for (
        let wx = xPos + windowPadding;
        wx < xPos + bWidth - windowWidth;
        wx += windowWidth + windowPadding
      ) {
        windows.push({ x: wx, y: wy, on: Math.random() < 0.5 });
      }
    }
    return {
      x: xPos,
      width: bWidth,
      height,
      color: colors[i % colors.length],
      y: yPos,
      windows
    };
  });
  if (buildings[1] && buildings[2]) {
    const gapStart = buildings[1].x + buildings[1].width;
    const gapEnd = buildings[2].x;
    skateboardX = gapStart + (gapEnd - gapStart - skateboardWidth) / 2;
  }
}

function initializeCity() {
  if (city === 'nyc') {
    initializeBuildings();
  } else {
    buildings = [];
  }
}

initializeCity();

let questionMap = {};

async function loadQuestions() {
  const res = await fetch('questions.json');
  questionMap = await res.json();
  populateTopics();
}

function populateTopics() {
  const fieldset = document.getElementById('topics');
  if (!fieldset) return;
  Object.keys(questionMap).forEach(topic => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'topic-checkbox';
    checkbox.value = topic;
    checkbox.checked = true;
    label.appendChild(checkbox);
    label.append(` ${topic}`);
    fieldset.appendChild(label);
  });
}

let cheatData = [];

async function loadCheats() {
  const res = await fetch('cheats.json');
  cheatData = await res.json();
  cheatData.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.name}: ${c.description}`;
    cheatList.appendChild(li);
  });
  cheatHeader.classList.remove('hidden');
  cheatList.classList.remove('hidden');
}

function checkCheatsUnlock() {
  if (score >= 200 && !cheatsUnlocked) {
    cheatsUnlocked = true;
    loadCheats();
  }
}

function askQuestion() {
  const selected = Array.from(document.querySelectorAll('.topic-checkbox:checked')).map(cb => cb.value);
  const fallback = Object.keys(questionMap)[0];
  const activeTopics = selected.length ? selected : [fallback];
  const pool = activeTopics.flatMap(topic => questionMap[topic]);
  const q = pool[Math.floor(Math.random() * pool.length)];
  const choices = q.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  const response = prompt(`${q.question}\n${choices}`);
  return parseInt(response, 10) === q.answer;
}

function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = true;
  } else if (e.key === ' ' || e.key === 'Spacebar') {
    lastSpacePress = Date.now();
  }
}

function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = false;
  }
}

function wheelHandler(e) {
  e.preventDefault();
  skateboardX += e.deltaY * 0.2;
  if (skateboardX < 0) {
    skateboardX = 0;
  } else if (skateboardX > canvas.width - skateboardWidth) {
    skateboardX = canvas.width - skateboardWidth;
  }
}

function mouseMoveHandler(e) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = e.clientX - rect.left;
  skateboardX = relativeX - skateboardWidth / 2;
  if (skateboardX < 0) {
    skateboardX = 0;
  } else if (skateboardX > canvas.width - skateboardWidth) {
    skateboardX = canvas.width - skateboardWidth;
  }
}

function drawSkateboard() {
  ctx.beginPath();
  ctx.rect(skateboardX, canvas.height - skateboardHeight, skateboardWidth, skateboardHeight);
  ctx.fillStyle = '#ff6f61';
  ctx.fill();
  ctx.closePath();
}

function drawFootball() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

function activateCheat() {
  ballRadius = defaultBallRadius * 2;
  ballColor = cheatBallColor;
  cheatActive = true;
}

function deactivateCheat() {
  ballRadius = defaultBallRadius;
  ballColor = defaultBallColor;
  cheatActive = false;
}

function destroyBrick(c, r, triggerQuiz = true) {
  const b = bricks[c][r];
  if (!b || b.status !== 1) return;
  b.status = 0;
  const brickX = b.x;
  const brickY = b.y;
  if (b.quiz && triggerQuiz) {
    if (askQuestion()) {
      score += 50;
      showPoints('+50', brickX + brickWidth / 2, brickY);
    }
  } else {
    score += 10;
    showPoints('+10', brickX + brickWidth / 2, brickY);
  }
  remainingBricks--;
  scoreDiv.textContent = `Score: ${score}`;
  checkCheatsUnlock();
  if (remainingBricks === 0) {
    endGame();
  }
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        b.x = brickX;
        b.y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = b.quiz ? '#27ae60' : '#2980b9';
        ctx.fill();
        if (b.quiz) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Q', brickX + brickWidth / 2, brickY + brickHeight / 2);
          ctx.textAlign = 'start';
          ctx.textBaseline = 'alphabetic';
        }
        ctx.closePath();
      }
    }
  }
}

function drawBuildings() {
  buildings.forEach(b => {
    // building body
    ctx.beginPath();
    ctx.rect(b.x, b.y, b.width, b.height);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.closePath();

    // windows
    b.windows.forEach(w => {
      ctx.fillStyle = w.on ? '#f1c40f' : '#000000';
      ctx.fillRect(w.x, w.y, windowWidth, windowHeight);
    });
  });
}

function flickerLights(building) {
  const lights = building.windows.filter(() => Math.random() < 0.3);
  lights.forEach(w => {
    if (w.flickerInterval) {
      clearInterval(w.flickerInterval);
      clearTimeout(w.flickerTimeout);
    }
    const original = w.on;
    w.flickerInterval = setInterval(() => {
      w.on = !w.on;
    }, 100);
    w.flickerTimeout = setTimeout(() => {
      clearInterval(w.flickerInterval);
      w.on = original;
      w.flickerInterval = null;
    }, 1000 + Math.random() * 1000);
  });
}

function buildingCollisionDetection() {
  buildings.forEach(b => {
    const left = b.x;
    const right = b.x + b.width;
    const top = b.y;
    if (x + ballRadius > left && x - ballRadius < right && y + ballRadius > top) {
      flickerLights(b);
      const overlapLeft = x + ballRadius - left;
      const overlapRight = right - (x - ballRadius);
      const overlapTop = y + ballRadius - top;
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop);
      if (minOverlap === overlapTop) {
        dy = -Math.abs(dy);
        y = top - ballRadius;
      } else if (overlapLeft < overlapRight) {
        dx = -Math.abs(dx);
        x = left - ballRadius;
      } else {
        dx = Math.abs(dx);
        x = right + ballRadius;
      }
    }
  });
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        b.x = brickX;
        b.y = brickY;
        if (x > brickX && x < brickX + brickWidth && y > brickY && y < brickY + brickHeight) {
          dy = -dy;
          destroyBrick(c, r, true);
          if (cheatActive) {
            const neighbors = [
              [c - 1, r],
              [c + 1, r],
              [c, r - 1],
              [c, r + 1]
            ];
            neighbors.forEach(([nc, nr]) => {
              if (nc >= 0 && nc < brickColumnCount && nr >= 0 && nr < brickRowCount) {
                destroyBrick(nc, nr, false);
              }
            });
            deactivateCheat();
          }
        }
      }
    }
  }
}

function showPoints(text, x, y) {
  const container = document.getElementById('points-container');
  const span = document.createElement('span');
  span.className = 'points';
  if (text === '+50') span.classList.add('special');
  span.textContent = text;
  span.style.left = x + 'px';
  span.style.top = y + 'px';
  container.appendChild(span);
  span.addEventListener('animationend', () => span.remove());
}

function endGame() {
  const message = document.getElementById('message');
  message.textContent = `Game Over! Final Score: ${score}`;
  message.classList.remove('hidden');
  cancelAnimationFrame(animationId);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBuildings();
  drawFootball();
  drawSkateboard();
  collisionDetection();
  if (buildings.length) buildingCollisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > skateboardX && x < skateboardX + skateboardWidth) {
      dy = -dy;
      if (Date.now() - lastSpacePress < 300) {
        activateCheat();
      }
    } else {
      endGame();
      return;
    }
  }

  x += dx;
  y += dy;

  if (rightPressed && skateboardX < canvas.width - skateboardWidth) {
    skateboardX += 5;
  } else if (leftPressed && skateboardX > 0) {
    skateboardX -= 5;
  }

  animationId = requestAnimationFrame(draw);
}

let animationId;
loadQuestions().then(() => {
  animationId = requestAnimationFrame(draw);
});

