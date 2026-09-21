// ======================================
// Love Heart Tree Engine - Fixed Version
// ======================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const isSmallDevice = window.matchMedia("(max-width: 768px)").matches;
const qualityScale = isSmallDevice ? 0.55 : 0.75;

// Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ==========================
// Animation Variables
// ==========================
let frame = 0;
let experienceStarted = false;
let experienceStartTime = 0;

// ==========================
// Background
// ==========================
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#120014");
    gradient.addColorStop(0.5, "#32002c");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ==========================
// Stars
// ==========================
const stars = [];
for (let i = 0; i < Math.round(120 * qualityScale); i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2,
        a: Math.random()
    });
}

function drawStars() {
    stars.forEach(s => {
        s.a += (Math.random() - 0.5) * 0.05;
        if (s.a < 0) s.a = 0;
        if (s.a > 1) s.a = 1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
    });
}

// ==========================
// Heart Particles (floating up)
// ==========================
const particles = [];

class HeartParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 300;
        this.size = 8 + Math.random() * 16;
        this.speed = 0.4 + Math.random();
        this.alpha = 0.2 + Math.random() * 0.8;
    }

    update() {
        this.y -= this.speed;
        if (this.y < -30) {
            this.reset();
            this.y = canvas.height + 30;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.size / 20, this.size / 20);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "#ff4f9d";
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.bezierCurveTo(10, -18, 28, 2, 0, 22);
        ctx.bezierCurveTo(-28, 2, -10, -18, 0, -5);
        ctx.fill();
        ctx.restore();
    }
}

for (let i = 0; i < Math.round(100 * qualityScale); i++) {
    particles.push(new HeartParticle());
}

// =====================================
// PART 4 - Tree Engine
// =====================================
class Branch {
    constructor(x, y, length, angle, width, level = 0) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.angle = angle;
        this.width = width;
        this.level = level;
        this.progress = 0;
        this.children = [];
        this.finished = false;
        this.hasCreatedExtras = false; // important flag
    }

    update() {
        if (this.finished) return;

        this.progress += 2.2;

        if (this.progress >= this.length) {
            this.progress = this.length;
            this.finished = true;

            if (this.level < 8) {
                let random = Math.random() * 15 - 7;

                this.children.push(
                    new Branch(
                        this.endX(),
                        this.endY(),
                        this.length * 0.78,
                        this.angle - 22 + random,
                        this.width * 0.74,
                        this.level + 1
                    )
                );

                this.children.push(
                    new Branch(
                        this.endX(),
                        this.endY(),
                        this.length * 0.78,
                        this.angle + 22 + random,
                        this.width * 0.74,
                        this.level + 1
                    )
                );
            }
        }
    }

    endX() {
        return this.x + Math.cos(this.angle * Math.PI / 180) * this.progress;
    }

    endY() {
        return this.y + Math.sin(this.angle * Math.PI / 180) * this.progress;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.endX(), this.endY());
        ctx.strokeStyle = "#6a3b16";
        ctx.lineWidth = this.width;
        ctx.lineCap = "round";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#690f3c";
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

const branches = [];
branches.push(
    new Branch(
        canvas.width / 2,
        canvas.height - 40,
        120,
        -90,
        14
    )
);

function updateTree() {
    for (let i = 0; i < branches.length; i++) {
        const b = branches[i];
        b.update();
        b.draw();

        if (b.finished && !b.hasCreatedExtras) {
            b.hasCreatedExtras = true;

            // Blossom only on thin branches
            if (b.width < 3.5) {
                createBlossom(b);
            }

            // Create some leaves
            if (Math.random() < 0.55) {
                createLeaf(b.endX(), b.endY());
            }

            // Occasional sparkles
            if (b.width < 3 && Math.random() < 0.08) {
                createSparkles(b.endX(), b.endY());
            }

            // Add children to main array
            if (b.children.length > 0) {
                branches.push(...b.children);
                b.children = [];
            }
        }
    }
}

// =====================================
// PART 5 - Heart Blossom
// =====================================
class Blossom {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.max = 4 + Math.random() * 8;
        this.alpha = 0;
    }

    update() {
        if (this.size < this.max) {
            this.size += 0.15;
            this.alpha += 0.02;
            if (this.alpha > 1) this.alpha = 1;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.size / 12, this.size / 12);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "#ff4fa3";
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#ff66cc";
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.bezierCurveTo(10, -18, 28, 2, 0, 22);
        ctx.bezierCurveTo(-28, 2, -10, -18, 0, -5);
        ctx.fill();
        ctx.restore();
    }
}

const blossoms = [];

function createBlossom(branch) {
    blossoms.push(new Blossom(branch.endX(), branch.endY()));
}

// =====================================
// PART 6 - Heart Rain
// =====================================
class HeartRain {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20 - Math.random() * canvas.height;
        this.size = 6 + Math.random() * 10;
        this.speed = 1 + Math.random() * 2;
        this.alpha = 0.4 + Math.random() * 0.6;
        this.swing = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.speed;
        this.x += Math.sin(this.swing) * 0.6;
        this.swing += 0.03;

        if (this.y > canvas.height + 30) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.size / 18, this.size / 18);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "#ff5ba8";
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.bezierCurveTo(10, -18, 28, 2, 0, 22);
        ctx.bezierCurveTo(-28, 2, -10, -18, 0, -5);
        ctx.fill();
        ctx.restore();
    }
}

const rainHearts = [];
for (let i = 0; i < Math.round(42 * qualityScale); i++) {
    rainHearts.push(new HeartRain());
}

// =====================================
// PART 7 - Bloom Sparkles
// =====================================
class Sparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2.2;
        this.vy = -Math.random() * 2.5;
        this.life = 90;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.025;
        this.life--;
    }

    draw() {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life / 90;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd6f5";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ff66cc";
        ctx.fill();
        ctx.restore();
    }
}

const sparkles = [];

function createSparkles(x, y) {
    for (let i = 0; i < 5; i++) {
        sparkles.push(new Sparkle(x, y));
    }
}

// =====================================
// PART 11 - Leaf Glow System
// =====================================
class Leaf {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 3 + Math.random() * 5;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.2 + Math.random() * 0.5;
        this.alpha = 0.35 + Math.random() * 0.6;
        this.life = 400 + Math.random() * 200;
    }

    update() {
        this.y += Math.sin(this.angle) * this.speed;
        this.x += Math.cos(this.angle) * this.speed * 0.7;
        this.angle += 0.012;
        this.life--;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha * (this.life / 500);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#ff8acb";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ff4fa3";
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const leaves = [];

function createLeaf(x, y) {
    for (let i = 0; i < 2; i++) {
        leaves.push(new Leaf(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10));
    }
}

// =====================================
// PART 9 - Camera Zoom Effect
// =====================================
let camera = {
    zoom: 1,
    target: 1.18,
    speed: 0.0018
};

function updateCamera() {
    if (camera.zoom < camera.target) {
        camera.zoom += camera.speed;
    }
}

function applyCamera() {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

function restoreCamera() {
    ctx.restore();
}

// =====================================
// PART 12 - Cinematic Effects
// =====================================
let cameraShake = 0;

function shakeCamera() {
    cameraShake = 9;
}

function applyShake() {
    if (cameraShake > 0) {
        let x = (Math.random() - 0.5) * cameraShake;
        let y = (Math.random() - 0.5) * cameraShake;
        ctx.translate(x, y);
        cameraShake *= 0.88;
        if (cameraShake < 0.25) cameraShake = 0;
    }
}

// =====================================
// Big Heart Bloom
// =====================================
class BigHeart {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2 - 90;
        this.size = 0;
        this.alpha = 1;
        this.started = false;
    }

    start() {
        this.started = true;
    }

    update() {
        if (!this.started) return;
        if (this.size < 85) {
            this.size += 1.6;
        }
    }

    draw() {
        if (!this.started || this.size <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.size / 50, this.size / 50);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "#ff2f92";
        ctx.shadowBlur = 45;
        ctx.shadowColor = "#ff66cc";
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.bezierCurveTo(20, -40, 70, -20, 0, 60);
        ctx.bezierCurveTo(-70, -20, -20, -40, 0, -10);
        ctx.fill();
        ctx.restore();
    }
}

const bigHeart = new BigHeart();

// =====================================
// Glow Pulse
// =====================================
let pulse = 0;
function glowPulse() {
    pulse += 0.03;
}

// =====================================
// Animation Loop
// =====================================
function animate() {
    requestAnimationFrame(animate);
    frame++;

    glowPulse();
    drawBackground();

    applyCamera();
    applyShake();

    if (experienceStarted) {
    drawStars();

        // Floating heart particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Tree
        updateTree();

        // Blossoms
        blossoms.forEach(f => {
            f.update();
            f.draw();
        });

        // Heart rain
        rainHearts.forEach(h => {
            h.update();
            h.draw();
        });

        // Leaves
        for (let i = leaves.length - 1; i >= 0; i--) {
            const l = leaves[i];
            l.update();
            l.draw();
            if (l.life <= 0 || l.y > canvas.height + 60) {
                leaves.splice(i, 1);
            }
        }

        // Sparkles
        for (let i = sparkles.length - 1; i >= 0; i--) {
            const s = sparkles[i];
            s.update();
            s.draw();
            if (s.life <= 0) {
                sparkles.splice(i, 1);
            }
        }

        // Big Heart
        bigHeart.update();
        bigHeart.draw();
    }

    restoreCamera();
    if (experienceStarted) updateCamera();
}

// =====================================
// PART 8 - VS Code Typing Animation
// =====================================
const editor = document.getElementById("editor");
const typing = document.getElementById("typing");

const code = `
🚨 SYSTEM ALERT 🚨
━━━━━━━━━━━━━━━━━━━━━━
📢 BREAKING NEWS!

আজ পৃথিবীর বুকে আরও এক বছর পূর্ণ করলো
একজন বিশেষ ব্যক্তি... 😌

> Age        : 🔒 CLASSIFIED
> Intelligence: ⚠️ SUSPICIOUS
> Attitude   : 🌍 INTERNATIONAL LEVEL
> Drama      : ♾️ UNLIMITED
━━━━━━━━━━━━━━━━━━━━━━
📡 SYSTEM MESSAGE:

আমার পক্ষ থেকে তার প্রতি রইলো অনেক দোয়া—
"যেন এবার অন্তত একটু মানুষ হয়!" 😭😂

🎂 শুভ জন্মদিন আফা ❤️

Age নিয়ে চিন্তা কইরেন না...
System এখনও আপনাকে YOUNG দেখাচ্ছে! 😎

কিন্তু আফনে এখনো দেখতে...

[ ERROR 404: মিথ্যা বলার মতো কিছু পাওয়া যায়নি ] 🤣🌚
━━━━━━━━━━━━━━━━━━━━━━
💻 Status: Birthday Mode ON 🎉
🔥 Roast Mode: ENABLED
`;

let typeIndex = 0;

function showEditor() {
    if (editor) {
        editor.style.opacity = "1";
        editor.style.transform = "translateY(0px)";
    }
}
function typingEffect() {
    if (typeIndex < code.length && typing) {
        typing.innerHTML += code.charAt(typeIndex);
        typeIndex++;
        setTimeout(typingEffect, 32);
    }
}

// =====================================
// Love Text
// =====================================
function showLoveText() {
    const loveBox = document.getElementById("loveBox");
    if (loveBox) loveBox.style.opacity = "1";

    const title = document.getElementById("loveTitle");
    const message = document.getElementById("loveMessage");

    if (title) title.innerHTML = "❤️ Happy Birthday ❤️";
    if (message) {
        message.innerHTML = `
            May every heartbeat bring happiness,<br>
            love and endless smiles.<br>
            Stay Blessed ❤️
        `;
    }
}

// =====================================
// Music
// =====================================
const musicPlayer = document.getElementById("music");

function startMusic() {
    if (!musicPlayer || !musicPlayer.paused) return;
    if (musicPlayer.readyState === 0) musicPlayer.load();
    const playRequest = musicPlayer.play();
    if (playRequest) playRequest.catch(() => {});
}

// =====================================
// Final Scene
// =====================================
function showFinalScene() {
    const box = document.getElementById("loveBox");
    if (box) {
        box.style.opacity = "1";
        box.style.transition = "2s";
    }

    const title = document.getElementById("loveTitle");
    const message = document.getElementById("loveMessage");

    if (title) title.innerHTML = "❤️ Happy Birthday For You ❤️";
    if (message) {
        message.innerHTML = `
            Every moment is special ✨<br>
            Every smile is beautiful 💖<br>
            Stay Happy Always 🌸
        `;
    }
}

// =====================================
// Start System - Hold Fingerprint Reactor
// =====================================
const loader = document.getElementById("loader");
const startBtn = document.getElementById("startBtn");
const lovePowerEl = document.getElementById("lovePower");
const reactorStateEl = document.getElementById("reactorState");
const reactorStatusTextEl = document.getElementById("reactorStatusText");
const chargeProgressBar = document.getElementById("chargeProgressBar");

let holdProgress = 0;
let holdTimer = null;
let chargeCompleted = false;
const HOLD_TIME = 2400;

function updateChargeUI() {
    const percent = Math.min(100, Math.round(holdProgress * 100));
    if (lovePowerEl) lovePowerEl.textContent = percent + "%";
    if (chargeProgressBar) chargeProgressBar.style.width = percent + "%";
    if (startBtn) startBtn.style.setProperty("--charge", percent + "%");
    if (reactorStatusTextEl) {
        reactorStatusTextEl.textContent = percent > 0 ? "SCANNING..." : "SCAN YOUR FINGERPRINT...";
    }
    if (reactorStateEl) {
        const isScanning = percent > 0 || startBtn?.classList.contains("holding");
        reactorStateEl.textContent = percent >= 100 ? "READY" : isScanning ? "SCANNING..." : "STANDBY";
    }
}

function resetCharge() {
    if (chargeCompleted || experienceStarted) return;
    clearInterval(holdTimer);
    holdTimer = null;
    holdProgress = 0;
    if (startBtn) startBtn.classList.remove("holding");
    updateChargeUI();
}

function completeCharge() {
    if (chargeCompleted) return;
    chargeCompleted = true;
    clearInterval(holdTimer);
    holdTimer = null;
    holdProgress = 1;
    updateChargeUI();

    if (startBtn) startBtn.classList.add("charged");
    if (loader) loader.classList.add("reactor-complete");
    if (reactorStateEl) reactorStateEl.textContent = "ONLINE";

    // Give the charged heart a short bloom/opening moment, then reveal the tree.
    setTimeout(startExperience, 1800);
}

function startHolding(e) {
    if (chargeCompleted || experienceStarted) return;
    if (e && e.pointerType === "mouse" && e.button !== 0) return;
    if (e && e.cancelable) e.preventDefault();

    // Begin during the user's press so autoplay policy permits playback.
    startMusic();

    clearInterval(holdTimer);
    if (startBtn) {
        startBtn.classList.add("holding");
        updateChargeUI();
        if (startBtn.setPointerCapture && e && e.pointerId !== undefined) {
            try { startBtn.setPointerCapture(e.pointerId); } catch (_) {}
        }
    }

    const startedAt = performance.now();
    holdTimer = setInterval(() => {
        holdProgress = Math.min(1, (performance.now() - startedAt) / HOLD_TIME);
        updateChargeUI();
        if (holdProgress >= 1) completeCharge();
    }, 16);
}

function stopHolding() {
    if (!chargeCompleted) resetCharge();
}

if (startBtn) {
    startBtn.addEventListener("pointerdown", startHolding);
    startBtn.addEventListener("pointerup", stopHolding);
    startBtn.addEventListener("pointercancel", stopHolding);
    startBtn.addEventListener("lostpointercapture", stopHolding);
    startBtn.addEventListener("contextmenu", e => e.preventDefault());
}

function startExperience() {
    if (experienceStarted) return;
    experienceStarted = true;
    experienceStartTime = performance.now();
    document.body.classList.add("experience-started");
    animate();

    startMusic();

    if (loader) {
        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";
        setTimeout(() => loader.remove(), 1200);
    }

    setTimeout(showEditor, 1000);
    setTimeout(typingEffect, 1800);
    setTimeout(showLoveText, 14000);
    setTimeout(() => showFinalScene(), 20000);
    setTimeout(() => {
        bigHeart.start();
        shakeCamera();
    }, 17500);
    setTimeout(finalFade, 25000);
    // Keep page 2 on screen until the user chooses to continue.
    setTimeout(revealNextPageButton, 21500);
}

// Final Fade
function finalFade() {
    document.body.style.transition = "3s";
    document.body.style.filter = "brightness(1.25)";
}

// =====================================
// Memory Gallery — Next Page
// =====================================
const memoryPage = document.getElementById("memoryPage");
const photoLightbox = document.getElementById("photoLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.querySelector(".lightboxClose");

function showMemoryGallery() {
    if (!memoryPage) return;
    memoryPage.classList.add("gallery-visible");

    // The document, rather than the gallery section, owns the scroll position.
    requestAnimationFrame(() => {
        window.scrollTo({ top: memoryPage.offsetTop, behavior: "smooth" });
    });
}



// =====================================
// Page 2 -> Page 3 navigation
// =====================================
const nextPageBtn = document.getElementById("nextPageBtn");

function revealNextPageButton() {
    if (nextPageBtn) nextPageBtn.classList.add("show");
}

function goToMemoryPage() {
    if (!memoryPage) return;
    if (nextPageBtn) nextPageBtn.classList.remove("show");
    showMemoryGallery();
}

if (nextPageBtn) {
    nextPageBtn.addEventListener("click", goToMemoryPage);
}

document.querySelectorAll(".memoryCard").forEach(card => {
    card.addEventListener("click", () => {
        if (!photoLightbox || !lightboxImage) return;
        lightboxImage.src = card.dataset.full;
        photoLightbox.classList.add("open");
        photoLightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    });
});

function closePhoto() {
    if (!photoLightbox) return;
    photoLightbox.classList.remove("open");
    photoLightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => {
        if (lightboxImage) lightboxImage.src = "";
    }, 350);
}

if (lightboxClose) lightboxClose.addEventListener("click", closePhoto);
if (photoLightbox) {
    photoLightbox.addEventListener("click", e => {
        if (e.target === photoLightbox) closePhoto();
    });
}
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePhoto();
});
