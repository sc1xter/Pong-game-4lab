// ================================================================
//  🏓  PONG — игровая логика (страница game.html) — исправленная версия
// ================================================================

const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const scoreLeftEl = document.getElementById('scoreLeft');
const scoreRightEl = document.getElementById('scoreRight');

const W = 800;
const H = 450;

let gameRunning = true;
let animId = null;

const leftPaddle = {
    x: 30,
    y: H / 2 - 35,
    w: 12,
    h: 70,
    speed: 5,
    score: 0
};

const rightPaddle = {
    x: W - 30 - 12,
    y: H / 2 - 35,
    w: 12,
    h: 70,
    speed: 5,
    score: 0
};

const ball = {
    x: W / 2,
    y: H / 2,
    radius: 8,
    dx: 4,
    dy: 3,
    speed: 5
};

const keys = {
    w: false,
    s: false,
    arrowup: false,
    arrowdown: false
};

// ---------- ОБРАБОТЧИКИ КЛАВИАТУРЫ ----------
// Используем e.code — он не зависит от раскладки и надёжнее для стрелок
document.addEventListener('keydown', function (e) {
    switch (e.code) {
        case 'KeyW':      keys.w = true;        e.preventDefault(); break;
        case 'KeyS':      keys.s = true;        e.preventDefault(); break;
        case 'ArrowUp':   keys.arrowup = true;  e.preventDefault(); break;
        case 'ArrowDown': keys.arrowdown = true;e.preventDefault(); break;
    }
});

document.addEventListener('keyup', function (e) {
    switch (e.code) {
        case 'KeyW':      keys.w = false;        e.preventDefault(); break;
        case 'KeyS':      keys.s = false;        e.preventDefault(); break;
        case 'ArrowUp':   keys.arrowup = false;  e.preventDefault(); break;
        case 'ArrowDown': keys.arrowdown = false;e.preventDefault(); break;
    }
});

// Если окно теряет фокус — сбрасываем все клавиши, чтобы ракетка не "залипала"
window.addEventListener('blur', function () {
    keys.w = false;
    keys.s = false;
    keys.arrowup = false;
    keys.arrowdown = false;
});

// ---------- ЗВУК ----------
let audioCtx = null;

function playHitSound() {
    if (window.soundEnabled === false) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 440 + Math.random() * 200;
        osc.type = 'square';
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } catch (err) {}
}

// ---------- ЦВЕТА ----------
function getAccentColors() {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
        return {
            leftPaddle: '#0088cc',
            rightPaddle: '#e94560',
            ball: '#1a1a2e',
            centerLine: '#c8d0e0'
        };
    }
    return {
        leftPaddle: '#00d4ff',
        rightPaddle: '#ff6b81',
        ball: '#ffffff',
        centerLine: '#2a3a6a'
    };
}

// ---------- СБРОС МЯЧА ----------
function resetBall(direction) {
    ball.x = W / 2;
    ball.y = H / 2;
    ball.speed = 5;
    ball.dx = direction * ball.speed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
}

function fullReset() {
    leftPaddle.score = 0;
    rightPaddle.score = 0;
    leftPaddle.y = H / 2 - 35;
    rightPaddle.y = H / 2 - 35;
    ball.speed = 5;
    resetBall(1);
    updateScoreDisplay();
}

function updateScoreDisplay() {
    scoreLeftEl.textContent = leftPaddle.score;
    scoreRightEl.textContent = rightPaddle.score;
}

// ---------- СТОЛКНОВЕНИЯ ----------
function handleCollisions() {
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= H) {
        ball.dy = -ball.dy;
        playHitSound();
    }

    if (ball.dx < 0) {
        const p = leftPaddle;
        if (ball.x - ball.radius <= p.x + p.w &&
            ball.x + ball.radius >= p.x &&
            ball.y >= p.y && ball.y <= p.y + p.h) {
            ball.dx = -ball.dx;
            const hitPos = (ball.y - p.y) / p.h;
            ball.dy = (hitPos - 0.5) * 8;
            ball.speed += 0.2;
            const curSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            if (curSpeed > 0) {
                ball.dx = (ball.dx / curSpeed) * ball.speed;
                ball.dy = (ball.dy / curSpeed) * ball.speed;
            }
            playHitSound();
        }
    }

    if (ball.dx > 0) {
        const p = rightPaddle;
        if (ball.x + ball.radius >= p.x &&
            ball.x - ball.radius <= p.x + p.w &&
            ball.y >= p.y && ball.y <= p.y + p.h) {
            ball.dx = -ball.dx;
            const hitPos = (ball.y - p.y) / p.h;
            ball.dy = (hitPos - 0.5) * 8;
            ball.speed += 0.2;
            const curSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            if (curSpeed > 0) {
                ball.dx = (ball.dx / curSpeed) * ball.speed;
                ball.dy = (ball.dy / curSpeed) * ball.speed;
            }
            playHitSound();
        }
    }

    if (ball.x - ball.radius < 0) {
        rightPaddle.score++;
        updateScoreDisplay();
        resetBall(1);
    } else if (ball.x + ball.radius > W) {
        leftPaddle.score++;
        updateScoreDisplay();
        resetBall(-1);
    }
}

// ---------- ОБНОВЛЕНИЕ ----------
function update() {
    // Левая ракетка (синяя — W/S)
    if (keys.w && leftPaddle.y > 0) {
        leftPaddle.y -= leftPaddle.speed;
    }
    if (keys.s && leftPaddle.y + leftPaddle.h < H) {
        leftPaddle.y += leftPaddle.speed;
    }

    // Правая ракетка (красная — стрелки)
    if (keys.arrowup && rightPaddle.y > 0) {
        rightPaddle.y -= rightPaddle.speed;
    }
    if (keys.arrowdown && rightPaddle.y + rightPaddle.h < H) {
        rightPaddle.y += rightPaddle.speed;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    handleCollisions();
}

// ---------- ОТРИСОВКА ----------
function draw() {
    ctx.clearRect(0, 0, W, H);

    const colors = getAccentColors();

    ctx.strokeStyle = colors.centerLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 60, 0, Math.PI * 2);
    ctx.strokeStyle = colors.centerLine;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = colors.leftPaddle;
    ctx.shadowColor = colors.leftPaddle;
    ctx.shadowBlur = 15;
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.w, leftPaddle.h);
    ctx.shadowBlur = 0;

    ctx.fillStyle = colors.rightPaddle;
    ctx.shadowColor = colors.rightPaddle;
    ctx.shadowBlur = 15;
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.w, rightPaddle.h);
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.ball;
    ctx.shadowColor = colors.ball;
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// ---------- ИГРОВОЙ ЦИКЛ ----------
function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    animId = requestAnimationFrame(gameLoop);
}

function initGame() {
    gameRunning = true;
    fullReset();
    if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
    }
    gameLoop();
}

// ---------- СОХРАНЕНИЕ РЕЗУЛЬТАТА ----------
function saveGameResult() {
    if (!gameRunning) return;
    const leftScore = leftPaddle.score;
    const rightScore = rightPaddle.score;
    const winnerScore = Math.max(leftScore, rightScore);
    if (winnerScore > 0) {
        const name = prompt('🎉 Игра окончена! Введите ваше имя для таблицы лидеров:', 'Игрок');
        if (name !== null && name.trim() !== '') {
            addRecord(name.trim(), winnerScore);
        } else if (name !== null) {
            addRecord('Аноним', winnerScore);
        }
    }
    gameRunning = false;
    if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
    }
}

window.addEventListener('beforeunload', saveGameResult);

// ---------- СТАРТ ----------
initGame();
