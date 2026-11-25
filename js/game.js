const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const scoreLeftEl = document.getElementById('scoreLeft');
const scoreRightEl = document.getElementById('scoreRight');

const W = 800;
const H = 450;

let gameRunning = true;
let animId = null;

const leftPaddle  = { x: 30,          y: H/2 - 35, w: 12, h: 70, speed: 5, score: 0 };
const rightPaddle = { x: W - 30 - 12, y: H/2 - 35, w: 12, h: 70, speed: 5, score: 0 };
const ball = { x: W/2, y: H/2, radius: 8, dx: 4, dy: 3, speed: 5 };

const keys = { w: false, s: false, arrowup: false, arrowdown: false };

// ---------- КЛЮЧИ ----------
function handleKeyDown(e) {
    const k = e.key;
    const c = e.code;

    if (k === 'w' || k === 'W' || k === 'ц' || k === 'Ц' || c === 'KeyW') {
        keys.w = true; e.preventDefault(); return;
    }
    if (k === 's' || k === 'S' || k === 'ы' || k === 'Ы' || c === 'KeyS') {
        keys.s = true; e.preventDefault(); return;
    }
    if (k === 'ArrowUp' || c === 'ArrowUp') {
        keys.arrowup = true; e.preventDefault(); return;
    }
    if (k === 'ArrowDown' || c === 'ArrowDown') {
        keys.arrowdown = true; e.preventDefault(); return;
    }
}

function handleKeyUp(e) {
    const k = e.key;
    const c = e.code;

    if (k === 'w' || k === 'W' || k === 'ц' || k === 'Ц' || c === 'KeyW') {
        keys.w = false; e.preventDefault(); return;
    }
    if (k === 's' || k === 'S' || k === 'ы' || k === 'Ы' || c === 'KeyS') {
        keys.s = false; e.preventDefault(); return;
    }
    if (k === 'ArrowUp' || c === 'ArrowUp') {
        keys.arrowup = false; e.preventDefault(); return;
    }
    if (k === 'ArrowDown' || c === 'ArrowDown') {
        keys.arrowdown = false; e.preventDefault(); return;
    }
}

// Вешаем и на document, и на window — на случай, если фокус "улетел"
document.addEventListener('keydown', handleKeyDown, false);
document.addEventListener('keyup',   handleKeyUp,   false);
window.addEventListener('keydown',   handleKeyDown, false);
window.addEventListener('keyup',     handleKeyUp,   false);

// Клик по canvas — ставим фокус, чтобы клавиатура точно работала
canvas.setAttribute('tabindex', '0');
canvas.addEventListener('click', () => canvas.focus());
canvas.focus();

// Сброс клавиш при потере фокуса
window.addEventListener('blur', () => {
    keys.w = keys.s = keys.arrowup = keys.arrowdown = false;
});

// ---------- ЗВУК ----------
let audioCtx = null;
function playHitSound() {
    if (window.soundEnabled === false) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = 440 + Math.random() * 200;
        osc.type = 'square';
        gain.gain.value = 0.1;
        osc.start(); osc.stop(audioCtx.currentTime + 0.08);
    } catch (err) {}
}

// ---------- ЦВЕТА ----------
function getAccentColors() {
    const isLight = document.body.classList.contains('light-theme');
    return isLight
        ? { leftPaddle: '#0088cc', rightPaddle: '#e94560', ball: '#1a1a2e', centerLine: '#c8d0e0' }
        : { leftPaddle: '#00d4ff', rightPaddle: '#ff6b81', ball: '#ffffff', centerLine: '#2a3a6a' };
}

// ---------- СБРОС ----------
function resetBall(direction) {
    ball.x = W/2; ball.y = H/2; ball.speed = 5;
    ball.dx = direction * ball.speed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
}
function fullReset() {
    leftPaddle.score = rightPaddle.score = 0;
    leftPaddle.y = rightPaddle.y = H/2 - 35;
    ball.speed = 5; resetBall(1); updateScoreDisplay();
}
function updateScoreDisplay() {
    scoreLeftEl.textContent  = leftPaddle.score;
    scoreRightEl.textContent = rightPaddle.score;
}

// ---------- СТОЛКНОВЕНИЯ ----------
function handleCollisions() {
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= H) {
        ball.dy = -ball.dy; playHitSound();
    }
    if (ball.dx < 0) {
        const p = leftPaddle;
        if (ball.x - ball.radius <= p.x + p.w && ball.x + ball.radius >= p.x &&
            ball.y >= p.y && ball.y <= p.y + p.h) {
            ball.dx = -ball.dx;
            const hitPos = (ball.y - p.y) / p.h;
            ball.dy = (hitPos - 0.5) * 8;
            ball.speed += 0.2;
            const cur = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
            if (cur > 0) { ball.dx = (ball.dx/cur)*ball.speed; ball.dy = (ball.dy/cur)*ball.speed; }
            playHitSound();
        }
    }
    if (ball.dx > 0) {
        const p = rightPaddle;
        if (ball.x + ball.radius >= p.x && ball.x - ball.radius <= p.x + p.w &&
            ball.y >= p.y && ball.y <= p.y + p.h) {
            ball.dx = -ball.dx;
            const hitPos = (ball.y - p.y) / p.h;
            ball.dy = (hitPos - 0.5) * 8;
            ball.speed += 0.2;
            const cur = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
            if (cur > 0) { ball.dx = (ball.dx/cur)*ball.speed; ball.dy = (ball.dy/cur)*ball.speed; }
            playHitSound();
        }
    }
    if (ball.x - ball.radius < 0) { rightPaddle.score++; updateScoreDisplay(); resetBall(1); }
    else if (ball.x + ball.radius > W) { leftPaddle.score++; updateScoreDisplay(); resetBall(-1); }
}

// ---------- ОБНОВЛЕНИЕ ----------
function update() {
    if (keys.w && leftPaddle.y > 0) leftPaddle.y -= leftPaddle.speed;
    if (keys.s && leftPaddle.y + leftPaddle.h < H) leftPaddle.y += leftPaddle.speed;
    if (keys.arrowup && rightPaddle.y > 0) rightPaddle.y -= rightPaddle.speed;
    if (keys.arrowdown && rightPaddle.y + rightPaddle.h < H) rightPaddle.y += rightPaddle.speed;

    ball.x += ball.dx; ball.y += ball.dy;
    handleCollisions();
}

// ---------- ОТРИСОВКА ----------
function draw() {
    ctx.clearRect(0, 0, W, H);
    const colors = getAccentColors();

    ctx.strokeStyle = colors.centerLine; ctx.lineWidth = 2;
    ctx.setLineDash([15, 15]);
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath(); ctx.arc(W/2, H/2, 60, 0, Math.PI*2);
    ctx.strokeStyle = colors.centerLine; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = colors.leftPaddle; ctx.shadowColor = colors.leftPaddle; ctx.shadowBlur = 15;
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.w, leftPaddle.h); ctx.shadowBlur = 0;

    ctx.fillStyle = colors.rightPaddle; ctx.shadowColor = colors.rightPaddle; ctx.shadowBlur = 15;
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.w, rightPaddle.h); ctx.shadowBlur = 0;

    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = colors.ball; ctx.shadowColor = colors.ball; ctx.shadowBlur = 25;
    ctx.fill(); ctx.shadowBlur = 0;
}

// ---------- ЦИКЛ ----------
function gameLoop() {
    if (!gameRunning) return;
    update(); draw();
    animId = requestAnimationFrame(gameLoop);
}
function initGame() {
    gameRunning = true; fullReset();
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    gameLoop();
}

// ---------- СОХРАНЕНИЕ РЕЗУЛЬТАТА ----------
function saveGameResult() {
    if (!gameRunning) return;
    const winnerScore = Math.max(leftPaddle.score, rightPaddle.score);
    if (winnerScore > 0 && typeof addRecord === 'function') {
        const name = prompt('🎉 Игра окончена! Введите ваше имя:', 'Игрок');
        if (name !== null) addRecord(name.trim() || 'Аноним', winnerScore);
    }
    gameRunning = false;
    if (animId) { cancelAnimationFrame(animId); animId = null; }
}
window.addEventListener('beforeunload', saveGameResult);

initGame();
