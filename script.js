const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const rulesDiv = document.getElementById('rules');

function resizeCanvas() {
  const availableWidth = window.innerWidth - rulesDiv.offsetWidth;
  canvas.width = availableWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

let score = 0;
const scoreDiv = document.getElementById('score');

const skateboardHeight = 12;
const skateboardWidth = 120;
let skateboardX = (canvas.width - skateboardWidth) / 2;

const footballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('wheel', wheelHandler, { passive: false });

window.addEventListener('resize', () => {
  resizeCanvas();
  if (skateboardX > canvas.width - skateboardWidth) {
    skateboardX = canvas.width - skateboardWidth;
  }
});

const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 55;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1, quiz: false };
  }
}

// designate random green bricks that trigger quiz questions
let quizBricks = 3;
while (quizBricks > 0) {
  const c = Math.floor(Math.random() * brickColumnCount);
  const r = Math.floor(Math.random() * brickRowCount);
  const b = bricks[c][r];
  if (!b.quiz) {
    b.quiz = true;
    quizBricks--;
  }
}

let remainingBricks = brickRowCount * brickColumnCount;

// Machine Learning MCQs
const mlQuestions = [
  {
    question: 'Which algorithm can be used for both classification and regression?',
    options: ['K-means', 'Linear Regression', 'Decision Tree', 'Apriori'],
    answer: 3
  },
  {
    question: 'What does an activation function introduce in a neural network?',
    options: ['Bias', 'Non-linearity', 'Regularization', 'Momentum'],
    answer: 2
  },
  {
    question: 'Which metric is suitable for evaluating imbalanced classification problems?',
    options: ['Accuracy', 'Mean Squared Error', 'Precision-Recall', 'R-squared'],
    answer: 3
  }
];

function askQuestion() {
  const q = mlQuestions[Math.floor(Math.random() * mlQuestions.length)];
  const choices = q.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  const response = prompt(`${q.question}\n${choices}`);
  return parseInt(response, 10) === q.answer;
}

function showFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.remove('hidden');

  const particles = [];
  for (let i = 0; i < 5; i++) {
    const fx = {
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height / 2)
    };
    for (let j = 0; j < 50; j++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      particles.push({
        x: fx.x,
        y: fx.y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 60,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.02;
      p.life--;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    if (particles.some(p => p.life > 0)) {
      requestAnimationFrame(animate);
    } else {
      canvas.classList.add('hidden');
    }
  }
  animate();
}

function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = true;
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

function drawSkateboard() {
  ctx.beginPath();
  ctx.rect(skateboardX, canvas.height - skateboardHeight, skateboardWidth, skateboardHeight);
  ctx.fillStyle = '#ff6f61';
  ctx.fill();
  ctx.closePath();
}

function drawFootball() {
  ctx.beginPath();
  ctx.arc(x, y, footballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#f1c40f';
  ctx.fill();
  ctx.closePath();
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
        ctx.fillStyle = b.quiz ? '#9b59b6' : '#2980b9';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
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
          b.status = 0;
          if (b.quiz) {
            if (askQuestion()) {
              score += 50;
              showPoints('+50', brickX + brickWidth / 2, brickY);
              showFireworks();
            }
          } else {
            score += 10;
            showPoints('+10', brickX + brickWidth / 2, brickY);
          }
          remainingBricks--;
          scoreDiv.textContent = `Score: ${score}`;
          if (remainingBricks === 0) {
            endGame(true);
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

function endGame(won = false) {
  const message = document.getElementById('message');
  message.textContent = won ? `You Win! Final Score: ${score}` : `Game Over! Final Score: ${score}`;
  message.classList.remove('hidden');
  if (won) {
    showFireworks();
  }
  cancelAnimationFrame(animationId);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawFootball();
  drawSkateboard();
  collisionDetection();

  if (x + dx > canvas.width - footballRadius || x + dx < footballRadius) {
    dx = -dx;
  }
  if (y + dy < footballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - footballRadius) {
    if (x > skateboardX && x < skateboardX + skateboardWidth) {
      dy = -dy;
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

let animationId = requestAnimationFrame(draw);

