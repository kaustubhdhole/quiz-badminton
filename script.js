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

const skateboardHeight = 12;
let skateboardWidth = 120;
let skateboardX = (canvas.width - skateboardWidth) / 2;

const skateboardSizeMap = {
  small: 80,
  medium: 120,
  large: 160
};

document.getElementById('size-select').addEventListener('change', (e) => {
  skateboardWidth = skateboardSizeMap[e.target.value];
  if (skateboardX > canvas.width - skateboardWidth) {
    skateboardX = canvas.width - skateboardWidth;
  }
});

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

const questionMap = {
  ml: [
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
  ],
  agents: [
    {
      question: 'What component of an AI agent selects actions to achieve goals?',
      options: ['Planner', 'Sensor', 'Actuator', 'Environment'],
      answer: 1
    },
    {
      question: 'Which architecture combines perception, decision, and action layers?',
      options: ['BDI', 'Reactive', 'Hybrid', 'Rule-based'],
      answer: 3
    },
    {
      question: "An agent's ability to consider consequences of actions is called?",
      options: ['Learning', 'Deliberation', 'Perception', 'Execution'],
      answer: 2
    }
  ],
  lm: [
    {
      question: 'What does a language model assign to sequences of words?',
      options: ['Syntax trees', 'Part-of-speech tags', 'Probability', 'Embeddings'],
      answer: 3
    },
    {
      question: 'Which technique predicts the next word given previous words?',
      options: ['Clustering', 'Next-token prediction', 'Machine translation', 'Summarization'],
      answer: 2
    },
    {
      question: 'What is a common pretraining objective for transformers?',
      options: ['Autoencoding', 'Reinforcement learning', 'Rule mining', 'Decision trees'],
      answer: 1
    }
  ],
  rag: [
    {
      question: 'What does RAG combine?',
      options: ['Generation with perception', 'Retrieval with generation', 'Planning with control', 'Classification with regression'],
      answer: 2
    },
    {
      question: 'In RAG, retrieved documents are used to:',
      options: ['Train the model from scratch', 'Improve prompts', 'Provide context for generation', 'Evaluate system performance'],
      answer: 3
    },
    {
      question: 'Which component retrieves relevant documents in RAG?',
      options: ['Generator', 'Retriever', 'Decoder', 'Optimizer'],
      answer: 2
    }
  ]
};

function askQuestion() {
  const selected = Array.from(document.querySelectorAll('.topic-checkbox:checked')).map(cb => cb.value);
  const activeTopics = selected.length ? selected : ['ml'];
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
            }
          } else {
            score += 10;
            showPoints('+10', brickX + brickWidth / 2, brickY);
          }
          remainingBricks--;
          scoreDiv.textContent = `Score: ${score}`;
          if (remainingBricks === 0) {
            endGame();
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

