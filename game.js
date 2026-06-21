// Game State & Core Configurations
const STATE_MENU = 'menu';
const STATE_CHAR_SELECT = 'select';
const STATE_FIGHT = 'fight';
const STATE_RESULTS = 'results';

let gameState = STATE_MENU;
let gameMode = 'cpu'; // 'cpu', 'vs', 'training'
let selectedP1 = 'jin';
let selectedP2 = 'king';
let confirmP1 = false;
let confirmP2 = false;

// Audio & Voice Engine
class SoundManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playPunch() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playKick() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playHit() {
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playBlock() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playSpecial() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playRage() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 0.75;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david')));
      if (englishVoice) utterance.voice = englishVoice;
      window.speechSynthesis.speak(utterance);
    }
  }
}

const soundManager = new SoundManager();

// Setup canvas details
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game configurations
const gravity = 1.2;
const stageY = 560; // Ground position
let cameraShake = { x: 0, y: 0, duration: 0, intensity: 0 };

// Particle engine supporting sparks, dust, cherry blossoms, and rising fire embers
class Particle {
  constructor(x, y, color, type = 'spark') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = type;
    this.alpha = 1;
    this.size = Math.random() * 6 + 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.1;
    
    if (type === 'spark') {
      this.vx = (Math.random() - 0.5) * 14;
      this.vy = (Math.random() - 0.5) * 14 - 3;
      this.decay = Math.random() * 0.05 + 0.03;
    } else if (type === 'dust') {
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = -Math.random() * 2 - 0.5;
      this.decay = 0.02;
      this.size = Math.random() * 12 + 5;
    } else if (type === 'fire') {
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = -Math.random() * 5 - 2;
      this.decay = 0.015;
      this.size = Math.random() * 8 + 3;
    } else if (type === 'electric') {
      this.vx = (Math.random() - 0.5) * 10;
      this.vy = (Math.random() - 0.5) * 10;
      this.decay = 0.07;
      this.size = Math.random() * 3 + 1.5;
    } else if (type === 'sakura') { // Cherry blossoms for Temple Stage
      this.vx = -Math.random() * 2 - 1.5; // drift left
      this.vy = Math.random() * 1.5 + 1.0; // fall down
      this.decay = 0.003 + Math.random() * 0.002;
      this.size = Math.random() * 6 + 4;
      this.waveOffset = Math.random() * Math.PI * 2;
    }
  }

  update() {
    if (this.type === 'sakura') {
      // Sinuous swaying motion
      this.x += this.vx + Math.sin(Date.now() * 0.002 + this.waveOffset) * 0.8;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }
    
    this.alpha -= this.decay;
    
    if (this.type === 'fire') {
      this.vy -= 0.08;
    }
  }

  draw(c) {
    c.save();
    c.globalAlpha = this.alpha;
    
    if (this.type === 'sakura') {
      c.translate(this.x, this.y);
      c.rotate(this.rotation);
      c.fillStyle = '#ffb7c5'; // Pink cherry blossom color
      c.beginPath();
      // Draw organic petal shape
      c.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      c.fill();
    } else if (this.type === 'electric') {
      c.strokeStyle = this.color;
      c.lineWidth = this.size;
      c.shadowBlur = 10;
      c.shadowColor = this.color;
      c.beginPath();
      c.moveTo(this.x, this.y);
      c.lineTo(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20);
      c.stroke();
    } else if (this.type === 'fire') {
      c.fillStyle = this.color;
      c.shadowBlur = 15;
      c.shadowColor = '#ff4c00';
      c.beginPath();
      c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillStyle = this.color;
      c.beginPath();
      c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      c.fill();
    }
    
    c.restore();
  }
}

let particles = [];
function spawnParticles(x, y, color, type = 'spark', count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color, type));
  }
}

// Background Stage with premium parallax scrolling and mirror reflections
class Stage {
  constructor() {
    this.timer = 0;
  }

  update() {
    this.timer++;
    
    // Ambient spawn rates for particles
    if (gameState === STATE_FIGHT) {
      if (selectedP2 === 'ogre') { // Volcano stage ash
        if (Math.random() > 0.65) {
          spawnParticles(Math.random() * 1280, 720, '#ff3c00', 'fire', 1);
        }
      } else { // Temple cherry blossoms
        if (Math.random() > 0.4) {
          particles.push(new Particle(Math.random() * 1400 + 100, -20, '#ffb7c5', 'sakura'));
        }
      }
    }
  }

  draw(c, cameraOffset = 0) {
    // Parallax Factor calculations
    const bgParallax = cameraOffset * 0.15;
    const midParallax = cameraOffset * 0.35;

    if (selectedP2 === 'ogre') { // Volcano stage
      // Sky
      const skyGrad = c.createLinearGradient(0, 0, 0, stageY);
      skyGrad.addColorStop(0, '#100200');
      skyGrad.addColorStop(0.5, '#2c0800');
      skyGrad.addColorStop(1, '#0e0303');
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, 1280, stageY);

      // Bubbling Lava backdrop (Far Background)
      c.fillStyle = '#ff2c00';
      c.shadowBlur = 30;
      c.shadowColor = '#ff2c00';
      c.beginPath();
      for (let x = 0; x <= 1280; x += 60) {
        const bubble = Math.sin(this.timer * 0.03 + x * 0.05) * 12;
        c.lineTo(x, stageY - 120 + bubble);
      }
      c.lineTo(1280, stageY);
      c.lineTo(0, stageY);
      c.fill();
      c.shadowBlur = 0; // reset

      // Dark volcanic mountain silhouettes (Mid Background)
      c.fillStyle = '#1c0c0c';
      c.save();
      c.translate(-midParallax, 0);
      c.beginPath();
      c.moveTo(-100, stageY);
      c.lineTo(200, 180);
      c.lineTo(400, 180);
      c.lineTo(700, stageY);
      c.lineTo(850, 150);
      c.lineTo(1000, 150);
      c.lineTo(1400, stageY);
      c.fill();
      c.restore();

    } else { // Temple Stage
      // Sky
      const skyGrad = c.createLinearGradient(0, 0, 0, stageY);
      skyGrad.addColorStop(0, '#04060d');
      skyGrad.addColorStop(0.6, '#0f172a');
      skyGrad.addColorStop(1, '#080912');
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, 1280, stageY);

      // Moon
      c.save();
      c.translate(-bgParallax, 0);
      c.fillStyle = '#fffaed';
      c.shadowBlur = 50;
      c.shadowColor = 'rgba(255, 250, 237, 0.6)';
      c.beginPath();
      c.arc(1000, 140, 60, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Distant Pagodas and mountains (Far Background)
      c.fillStyle = '#0a0d1a';
      c.save();
      c.translate(-bgParallax, 0);
      c.beginPath();
      c.moveTo(-50, stageY);
      c.lineTo(150, 320);
      c.lineTo(350, 320);
      c.lineTo(550, stageY);
      c.fill();
      // Temple tower structures
      c.fillRect(100, 200, 40, 120);
      c.fillRect(90, 240, 60, 10);
      c.fillRect(80, 280, 80, 10);
      c.restore();

      // Midground mountains and Torii gate
      c.fillStyle = '#12182c';
      c.save();
      c.translate(-midParallax, 0);
      c.beginPath();
      c.moveTo(200, stageY);
      c.lineTo(500, 240);
      c.lineTo(750, 380);
      c.lineTo(1050, 210);
      c.lineTo(1350, stageY);
      c.fill();
      
      // Torii Gate
      c.fillStyle = '#4a0f12'; // Maroon torii gate
      c.fillRect(580, 280, 15, 120);
      c.fillRect(685, 280, 15, 120);
      c.fillRect(550, 270, 180, 18); // top bar
      c.fillRect(565, 295, 150, 12); // mid bar
      c.restore();
    }

    // Dojo Mirror-finished wooden floor (Draws flipped player reflections under floor)
    const gradient = c.createLinearGradient(0, stageY, 0, 720);
    gradient.addColorStop(0, 'rgba(20, 22, 35, 0.95)');
    gradient.addColorStop(0.4, 'rgba(8, 9, 15, 0.98)');
    gradient.addColorStop(1, 'rgba(2, 3, 5, 0.99)');
    c.fillStyle = gradient;
    c.fillRect(0, stageY, 1280, 160);

    // Floor Perspective guidelines
    c.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    c.lineWidth = 2;
    for (let y = stageY; y < 720; y += 20) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(1280, y);
      c.stroke();
    }
    const horizonX = 640;
    for (let x = -800; x <= 2080; x += 120) {
      c.beginPath();
      c.moveTo(horizonX + (x - horizonX) * 0.1, stageY);
      c.lineTo(x, 720);
      c.stroke();
    }

    // Red boundary caution lines
    c.strokeStyle = 'rgba(255, 60, 0, 0.35)';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(50, stageY);
    c.lineTo(1230, stageY);
    c.stroke();
  }

  // Draw reflected fighter silhouettes onto floor
  drawReflections(c, f1, f2) {
    c.save();
    // Clip drawing area to mirror floor only
    c.beginPath();
    c.rect(0, stageY, 1280, 160);
    c.clip();

    // Set reflection look: low opacity, slightly blurred/smeared
    c.globalAlpha = 0.15;
    
    // Draw Player 1 Reflection
    c.save();
    c.translate(0, stageY * 2);
    c.scale(1, -1); // mirror vertically
    f1.draw(c);
    c.restore();

    // Draw Player 2 Reflection
    c.save();
    c.translate(0, stageY * 2);
    c.scale(1, -1);
    f2.draw(c);
    c.restore();

    c.restore();
  }
}

const stage = new Stage();

// Floating text combat notifications
class DamageText {
  constructor(x, y, text, color = '#ffcc00') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.vy = -3;
    this.alpha = 1;
  }

  update() {
    this.y += this.vy;
    this.alpha -= 0.02;
  }

  draw(c) {
    c.save();
    c.globalAlpha = this.alpha;
    c.fillStyle = this.color;
    c.font = 'bold 24px Outfit';
    c.textAlign = 'center';
    c.fillText(this.text, this.x, this.y);
    c.restore();
  }
}
let damageTexts = [];

// Fighter stats definitions
const fighterStats = {
  jin: {
    name: "JIN KAZAMA",
    color: "#ff3c00",
    particleColor: "#00e5ff",
    speed: 6.5,
    maxHp: 100,
    specialName: "ELECTRIC FIST",
    specialDmg: 15,
    ultimateDmg: 30,
    moves: { punch: 5, kick: 8 }
  },
  king: {
    name: "KING",
    color: "#0088cc",
    particleColor: "#ffd700",
    speed: 5.5,
    maxHp: 110,
    specialName: "GIANT SWING",
    specialDmg: 18,
    ultimateDmg: 35,
    moves: { punch: 6, kick: 9 }
  },
  paul: {
    name: "PAUL PHOENIX",
    color: "#cca300",
    particleColor: "#ffffff",
    speed: 5.0,
    maxHp: 100,
    specialName: "DEATHFIST",
    specialDmg: 22,
    ultimateDmg: 40,
    moves: { punch: 8, kick: 7 }
  },
  ogre: {
    name: "OGRE",
    color: "#23851b",
    particleColor: "#32cd32",
    speed: 4.8,
    maxHp: 120,
    specialName: "FIRE BREATH",
    specialDmg: 20,
    ultimateDmg: 42,
    moves: { punch: 7, kick: 10 }
  }
};

// Fighter Class representing P1 and P2
class Fighter {
  constructor(x, side, charKey) {
    this.x = x;
    this.y = stageY;
    this.side = side;
    this.charKey = charKey;
    this.stats = fighterStats[charKey];
    
    this.width = 85;
    this.height = 175;
    
    this.vx = 0;
    this.vy = 0;
    this.isJumping = false;
    this.isCrouching = false;
    
    this.hp = this.stats.maxHp;
    this.rage = 0;
    this.rageActive = false;
    
    this.state = 'idle';
    this.stateTimer = 0;
    this.actionFrame = 0;
    
    this.comboBuffer = [];
    this.comboCounter = 0;
    this.comboTimer = 0;
    
    this.facing = side === 1 ? 1 : -1;
    this.target = null;
    
    // Ghost trail array for high speed actions
    this.ghosts = [];
    this.animStep = 0;
  }

  reset(x, charKey) {
    this.x = x;
    this.y = stageY;
    this.charKey = charKey;
    this.stats = fighterStats[charKey];
    this.hp = this.stats.maxHp;
    this.rage = 0;
    this.rageActive = false;
    this.vx = 0;
    this.vy = 0;
    this.isJumping = false;
    this.isCrouching = false;
    this.state = 'idle';
    this.stateTimer = 0;
    this.actionFrame = 0;
    this.comboCounter = 0;
    this.comboTimer = 0;
    this.comboBuffer = [];
    this.facing = this.side === 1 ? 1 : -1;
    this.ghosts = [];
  }

  jump() {
    if (!this.isJumping && this.state !== 'knockdown' && !this.isCrouching) {
      this.vy = -26;
      this.isJumping = true;
      this.state = 'jump';
      spawnParticles(this.x + this.width / 2, this.y, '#666', 'dust', 6);
    }
  }

  crouch(isCrouching) {
    if (this.state === 'knockdown') return;
    this.isCrouching = isCrouching;
    if (isCrouching && !this.isJumping) {
      this.state = 'crouch';
    } else if (!isCrouching && this.state === 'crouch') {
      this.state = 'idle';
    }
  }

  move(dir) {
    if (this.state === 'knockdown' || this.isCrouching) return;
    if (this.state.startsWith('attack') || this.state === 'hit') return;

    this.vx = dir * this.stats.speed;

    if (dir !== 0) {
      const isMovingForward = (dir === 1 && this.facing === 1) || (dir === -1 && this.facing === -1);
      this.state = isMovingForward ? 'walk-fwd' : 'walk-bwd';
      this.animStep += 0.16;
      
      if (Math.random() > 0.65 && !this.isJumping) {
        spawnParticles(this.x + this.width / 2, this.y, '#555', 'dust', 1);
      }
    } else {
      if (!this.isJumping) this.state = 'idle';
    }
  }

  attack(type) {
    if (this.state.startsWith('attack') || this.state === 'knockdown' || this.state === 'hit') return;
    
    if (type === 'ultimate' && !this.rageActive) {
      damageTexts.push(new DamageText(this.x + this.width / 2, this.y - 200, "RAGE NEEDED!", "#ff0055"));
      return;
    }

    this.state = `attack-${type}`;
    this.stateTimer = 0;
    this.actionFrame = 0;
    this.vx = 0;

    if (type === 'special') {
      this.vx = this.facing * 14;
      soundManager.playSpecial();
      spawnParticles(this.x + this.width/2, this.y - 70, this.stats.particleColor, 'electric', 10);
    } else if (type === 'ultimate') {
      this.vx = this.facing * 23;
      soundManager.playRage();
      this.rageActive = false;
      this.rage = 0;
      spawnParticles(this.x + this.width/2, this.y - 90, '#ff0055', 'electric', 20);
      cameraShake = { x: 0, y: 0, duration: 20, intensity: 12 };
      
      document.getElementById(`p${this.side}-rage`).classList.remove('rage-active');
      document.getElementById(`p${this.side}-rage`).innerText = 'RAGE';
    } else if (type === 'punch') {
      soundManager.playPunch();
    } else if (type === 'kick') {
      soundManager.playKick();
    }

    this.comboBuffer.push(type);
    if (this.comboBuffer.length > 4) this.comboBuffer.shift();
    this.checkComboSequences();
  }

  checkComboSequences() {
    const comboStr = this.comboBuffer.join('-');
    if (comboStr.endsWith('punch-punch-kick')) {
      this.attack('special');
      damageTexts.push(new DamageText(this.x + this.width / 2, this.y - 210, "COMBO CRITICAL!", "#ffcc00"));
      this.comboBuffer = [];
    }
  }

  takeDamage(amount, isPunch, attackX, attackY) {
    if (this.state === 'knockdown') return;

    const isMovingBackward = (this.vx < 0 && this.facing === 1) || (this.vx > 0 && this.facing === -1) || (this.state === 'walk-bwd');
    const isNotAttacking = !this.state.startsWith('attack');

    if (isMovingBackward && isNotAttacking) {
      this.state = 'block';
      this.stateTimer = 6;
      soundManager.playBlock();
      spawnParticles(attackX, attackY, '#00e5ff', 'spark', 7);
      damageTexts.push(new DamageText(this.x + this.width / 2, this.y - 200, "BLOCKED!", "#00e5ff"));
      return;
    }

    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;

    if (this.hp > 0) {
      this.rage += amount * 1.6;
      if (this.rage >= 100) {
        this.rage = 100;
        this.rageActive = true;
        soundManager.playRage();
        const rageLabel = document.getElementById(`p${this.side}-rage`);
        rageLabel.classList.add('rage-active');
        rageLabel.innerText = 'RAGE ACTIVE';
      }
    }

    soundManager.playHit();
    spawnParticles(attackX, attackY, this.side === 1 ? '#ff3c00' : '#00e5ff', 'spark', 18);
    cameraShake = { x: 0, y: 0, duration: 10, intensity: 6 };

    if (this.target) {
      this.target.comboCounter++;
      this.target.comboTimer = 90;
      
      const comboUI = document.getElementById(`p${this.target.side}-combo-ui`);
      const comboCount = document.getElementById(`p${this.target.side}-combo-count`);
      comboCount.innerText = `${this.target.comboCounter} HITS`;
      comboUI.classList.add('active');
    }

    damageTexts.push(new DamageText(this.x + this.width / 2, this.y - 200, `-${amount}`, '#ff3c00'));

    if (this.hp <= 0) {
      this.state = 'knockdown';
      this.vx = -this.facing * 6;
      this.vy = -14;
    } else {
      this.state = 'hit';
      this.stateTimer = 14;
      this.vx = -this.facing * 5;
    }
  }

  update() {
    this.stateTimer = Math.max(0, this.stateTimer - 1);
    
    if (this.target && this.state !== 'knockdown' && this.state !== 'hit') {
      this.facing = this.x < this.target.x ? 1 : -1;
    }

    // Ghost trails calculations during special/ultimate speed dashes
    if (this.state === 'attack-special' || this.state === 'attack-ultimate') {
      if (this.actionFrame % 2 === 0) {
        this.ghosts.push({ x: this.x, y: this.y, alpha: 0.5, facing: this.facing });
      }
    }
    // Fade out ghosts
    this.ghosts.forEach(g => g.alpha -= 0.08);
    this.ghosts = this.ghosts.filter(g => g.alpha > 0);

    // Apply physics
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 50) this.x = 50;
    if (this.x > 1230 - this.width) this.x = 1230 - this.width;

    if (this.y < stageY) {
      this.vy += gravity;
      this.isJumping = true;
    } else {
      this.y = stageY;
      this.vy = 0;
      this.isJumping = false;
      if (this.state === 'jump') this.state = 'idle';
    }

    if (this.state === 'hit' && this.stateTimer === 0) {
      this.state = 'idle';
      this.vx = 0;
    }
    
    if (this.state === 'block' && this.stateTimer === 0) {
      this.state = 'idle';
    }

    if (this.state.startsWith('attack')) {
      this.actionFrame++;
      this.vx *= 0.86;

      const startup = 6;
      const active = 8;
      const recovery = 6;

      if (this.actionFrame >= startup && this.actionFrame < startup + active) {
        this.checkHitboxCollisions();
      }

      if (this.actionFrame >= startup + active + recovery) {
        this.state = 'idle';
        this.vx = 0;
      }
    }

    if (this.state === 'knockdown') {
      this.vx *= 0.95;
      if (this.y === stageY && Math.abs(this.vy) < 0.1) {
        this.vx = 0;
      }
    }

    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer === 0) {
        this.comboCounter = 0;
        document.getElementById(`p${this.side}-combo-ui`).classList.remove('active');
      }
    }

    // Updates HUD labels
    const hpPct = (this.hp / this.stats.maxHp) * 100;
    document.getElementById(`p${this.side}-health`).style.width = `${hpPct}%`;
    setTimeout(() => {
      const drainEl = document.getElementById(`p${this.side}-health-drain`);
      if (drainEl) drainEl.style.width = `${hpPct}%`;
    }, 450);

    const ragePct = this.rage;
    const rageEl = document.getElementById(`p${this.side}-rage`);
    if (rageEl && !this.rageActive) {
      rageEl.style.width = `${ragePct}%`;
    }
  }

  checkHitboxCollisions() {
    if (!this.target) return;

    let attackWidth = 65;
    let attackHeight = 45;
    let attackX = this.facing === 1 ? this.x + this.width : this.x - attackWidth;
    let attackY = this.y - 130;

    let damage = 5;

    if (this.state === 'attack-kick') {
      attackY = this.y - 50;
      attackWidth = 75;
      damage = 8;
    } else if (this.state === 'attack-special') {
      attackY = this.y - 110;
      attackWidth = 110;
      attackHeight = 65;
      damage = this.stats.specialDmg;
    } else if (this.state === 'attack-ultimate') {
      attackY = this.y - 130;
      attackWidth = 135;
      attackHeight = 85;
      damage = this.stats.ultimateDmg;
    }

    const targetHurtX = this.target.x;
    const targetHurtY = this.target.y - this.target.height;
    const targetWidth = this.target.width;
    const targetHeight = this.target.height;

    const hitX = Math.max(attackX, targetHurtX);
    const hitY = attackY + attackHeight/2;

    if (
      attackX < targetHurtX + targetWidth &&
      attackX + attackWidth > targetHurtX &&
      attackY < targetHurtY + targetHeight &&
      attackY + attackHeight > targetHurtY
    ) {
      if (this.actionFrame === 7) {
        const isPunch = this.state === 'attack-punch';
        this.target.takeDamage(damage, isPunch, hitX, hitY);
        
        if (this.state === 'attack-special') {
          spawnParticles(hitX, hitY, this.stats.particleColor, 'electric', 12);
        } else if (this.state === 'attack-ultimate') {
          spawnParticles(hitX, hitY, '#ff0055', 'fire', 25);
        }
      }
    }
  }

  // Draw procedural character with connecting vector limbs
  draw(c) {
    // Draw motion trail ghosts first
    this.ghosts.forEach(ghost => {
      c.save();
      c.globalAlpha = ghost.alpha * 0.4;
      c.translate(ghost.x + this.width / 2, ghost.y);
      c.scale(ghost.facing, 1);
      this.drawVectorBody(c, 0, '#00e5ff');
      c.restore();
    });

    c.save();
    c.shadowBlur = 15;
    c.shadowColor = this.stats.color;

    c.translate(this.x + this.width / 2, this.y);
    c.scale(this.facing, 1);

    const wobble = Math.sin(Date.now() * 0.007) * 3.5;
    
    // Draw actual character skeleton
    this.drawVectorBody(c, wobble);

    c.restore();
  }

  // Visual anatomical vector limb drawer
  drawVectorBody(c, wobble, overrideColor = null) {
    const primary = overrideColor || this.stats.color;
    const secondary = this.stats.particleColor;
    const skin = '#ffd2ad';

    // Stance/Jump coordinate calculations
    const hY = -145 + wobble; // Head height
    const tY = -115 + wobble; // Torso height
    const lY = -70;          // Leg joints

    // Character specific custom aesthetics
    if (this.charKey === 'jin') {
      // Draw Legs
      c.fillStyle = '#111'; // Pants
      c.fillRect(-22, lY, 16, 70);
      c.fillRect(6, lY, 16, 70);
      // Flame patterns on legs
      c.fillStyle = primary;
      c.fillRect(-22, lY + 30, 8, 30);
      c.fillRect(14, lY + 20, 8, 20);

      // Torso & chest definition
      c.fillStyle = skin;
      c.fillRect(-18, tY, 36, 50);
      c.fillStyle = 'rgba(0,0,0,0.15)'; // Chest shading
      c.fillRect(-18, tY + 25, 36, 6);

      // Head with spiky hair
      c.fillStyle = skin;
      c.fillRect(-14, hY, 28, 28);
      c.fillStyle = '#000'; // Hair
      c.fillRect(-18, hY - 14, 36, 16);
      c.beginPath();
      c.moveTo(-18, hY + 2);
      c.lineTo(-8, hY + 12);
      c.lineTo(2, hY + 2);
      c.lineTo(12, hY + 12);
      c.lineTo(18, hY + 2);
      c.fill();

      // Red fist guards / gauntlets
      c.fillStyle = primary;
      if (this.state === 'attack-punch') {
        c.fillRect(18, tY + 10, 40, 16);
        c.fillStyle = secondary; // Electric sparks on fist
        c.fillRect(45, tY + 6, 16, 24);
      } else {
        c.fillRect(12, tY + 15, 14, 16);
        c.fillRect(-24, tY + 15, 14, 16);
      }
    } 
    else if (this.charKey === 'king') {
      // Wrestler tights
      c.fillStyle = '#0088cc';
      c.fillRect(-24, lY, 18, 70);
      c.fillRect(6, lY, 18, 70);

      // Torso
      c.fillStyle = skin;
      c.fillRect(-22, tY, 44, 52);

      // Leopard mask
      c.fillStyle = '#ffd700'; // Yellow leopard
      c.fillRect(-20, hY - 4, 40, 32);
      c.fillStyle = '#000'; // Spot details
      c.fillRect(-12, hY + 5, 4, 4);
      c.fillRect(8, hY + 5, 4, 4);
      c.fillStyle = '#ff3c00'; // Glowing eyes
      c.fillRect(-10, hY + 12, 5, 4);
      c.fillRect(5, hY + 12, 5, 4);

      // Wrestler Cape
      c.fillStyle = '#6a0dad'; // Purple cape flutters
      const flutter = Math.sin(Date.now() * 0.015) * 8;
      c.beginPath();
      c.moveTo(-20, tY);
      c.lineTo(-50 - flutter, tY + 60);
      c.lineTo(-20, tY + 50);
      c.fill();

      if (this.state === 'attack-punch') {
        c.fillStyle = skin;
        c.fillRect(18, tY + 10, 42, 18);
      }
    } 
    else if (this.charKey === 'paul') {
      // Red gi pants
      c.fillStyle = primary;
      c.fillRect(-20, lY, 16, 70);
      c.fillRect(4, lY, 16, 70);
      c.fillStyle = '#ffeb3b'; // Belt
      c.fillRect(-22, lY - 4, 44, 6);

      // Red gi top
      c.fillStyle = primary;
      c.fillRect(-20, tY, 40, 52);

      // Head
      c.fillStyle = skin;
      c.fillRect(-14, hY, 28, 28);

      // Tall Blonde flat top hair
      c.fillStyle = '#ffeb3b';
      c.fillRect(-14, hY - 50, 28, 50);

      if (this.state === 'attack-punch') {
        c.fillStyle = '#ffd700'; // Golden energy fist
        c.fillRect(18, tY + 8, 44, 20);
      }
    } 
    else if (this.charKey === 'ogre') {
      // Dark green scaly legs
      c.fillStyle = '#1b4d3e';
      c.fillRect(-24, lY, 18, 70);
      c.fillRect(6, lY, 18, 70);

      // Torso
      c.fillStyle = '#e2b13c'; // Gold plates
      c.fillRect(-22, tY, 44, 55);

      // Horned head
      c.fillStyle = '#1b4d3e';
      c.fillRect(-18, hY, 36, 30);
      c.fillStyle = '#ffeb3b'; // Horns
      c.beginPath();
      c.moveTo(-14, hY);
      c.lineTo(-32, hY - 20);
      c.lineTo(-6, hY);
      c.moveTo(14, hY);
      c.lineTo(32, hY - 20);
      c.lineTo(6, hY);
      c.fill();

      // Glowing wings
      c.fillStyle = 'rgba(255, 60, 0, 0.4)';
      const wingFlap = Math.sin(Date.now() * 0.01) * 12;
      c.beginPath();
      c.moveTo(0, tY);
      c.lineTo(-80, tY - 40 + wingFlap);
      c.lineTo(-40, tY + 20);
      c.fill();

      if (this.state === 'attack-punch') {
        c.fillStyle = '#4caf50'; // Green fire punch
        c.fillRect(18, tY + 8, 44, 22);
      }
    }

    // Common body overlays like knockdown orientations
    if (this.state === 'knockdown') {
      c.restore();
      c.save();
      c.translate(this.x + this.width/2, this.y);
      c.rotate(Math.PI / 2 * this.facing);
      c.fillStyle = primary;
      c.fillRect(-22, -60, 44, 110);
      c.fillStyle = skin;
      c.fillRect(-14, -85, 28, 25);
    }
  }
}

// Instantiate Players
const player1 = new Fighter(300, 1, 'jin');
const player2 = new Fighter(900, 2, 'king');
player1.target = player2;
player2.target = player1;

// Global inputs tracker
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }

  if (gameState === STATE_MENU) {
    if (e.key === 'Enter' || e.key === ' ') {
      startGameplayMode('cpu');
    }
  } else if (gameState === STATE_CHAR_SELECT) {
    handleCharacterSelectionKeys(e.key);
  } else if (gameState === STATE_FIGHT) {
    handleCombatKeyPresses(e.key);
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function handleCombatKeyPresses(key) {
  if (key.toLowerCase() === 'j') player1.attack('punch');
  if (key.toLowerCase() === 'k') player1.attack('kick');
  if (key.toLowerCase() === 'u') player1.attack('special');
  if (key.toLowerCase() === 'i') player1.attack('ultimate');

  if (gameMode === 'vs') {
    if (key === '1') player2.attack('punch');
    if (key === '2') player2.attack('kick');
    if (key === '4') player2.attack('special');
    if (key === '5') player2.attack('ultimate');
  }
}

document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.getAttribute('data-mode');
    if (mode) {
      startGameplayMode(mode);
    }
  });
});

document.getElementById('instructions-btn').addEventListener('click', () => {
  document.getElementById('instructions-modal').classList.add('active');
});
document.querySelector('.close-modal').addEventListener('click', () => {
  document.getElementById('instructions-modal').classList.remove('active');
});

document.getElementById('rematch-btn').addEventListener('click', startFightRoundReset);
document.getElementById('char-select-btn').addEventListener('click', showCharacterSelector);
document.getElementById('main-menu-btn').addEventListener('click', () => {
  transitionToScreen('main-menu');
  gameState = STATE_MENU;
});

function startGameplayMode(mode) {
  gameMode = mode;
  document.querySelector('.match-mode-tag').innerText = mode.toUpperCase() === 'CPU' ? 'VS CPU' : (mode.toUpperCase() === 'VS' ? 'VS HUMAN' : 'TRAINING');
  showCharacterSelector();
}

function showCharacterSelector() {
  transitionToScreen('character-select');
  gameState = STATE_CHAR_SELECT;
  confirmP1 = false;
  confirmP2 = false;
  updateCharSelectVisuals();
  soundManager.speak("Select your fighter");
}

function handleCharacterSelectionKeys(key) {
  const chars = ['jin', 'king', 'paul', 'ogre'];
  let idx1 = chars.indexOf(selectedP1);
  let idx2 = chars.indexOf(selectedP2);

  if (!confirmP1) {
    if (key === 'a') selectedP1 = chars[(idx1 - 1 + chars.length) % chars.length];
    if (key === 'd') selectedP1 = chars[(idx1 + 1) % chars.length];
    if (key === 'j' || key === ' ') {
      confirmP1 = true;
      soundManager.speak(selectedP1.toUpperCase());
    }
  }

  if (gameMode === 'vs') {
    if (!confirmP2) {
      if (key === 'ArrowLeft') selectedP2 = chars[(idx2 - 1 + chars.length) % chars.length];
      if (key === 'ArrowRight') selectedP2 = chars[(idx2 + 1) % chars.length];
      if (key === '1' || key === 'Enter') {
        confirmP2 = true;
        soundManager.speak(selectedP2.toUpperCase());
      }
    }
  } else {
    if (!confirmP2) {
      selectedP2 = chars[(chars.indexOf(selectedP1) + 1) % chars.length];
      confirmP2 = true;
    }
  }

  updateCharSelectVisuals();

  if (confirmP1 && confirmP2) {
    setTimeout(startFightRoundReset, 1000);
  }
}

document.querySelectorAll('.char-card').forEach(card => {
  card.addEventListener('click', () => {
    if (gameState !== STATE_CHAR_SELECT) return;
    const char = card.getAttribute('data-char');
    if (!confirmP1) {
      selectedP1 = char;
      confirmP1 = true;
      soundManager.speak(char.toUpperCase());
      updateCharSelectVisuals();
    } else if (!confirmP2 && gameMode === 'vs') {
      selectedP2 = char;
      confirmP2 = true;
      soundManager.speak(char.toUpperCase());
      updateCharSelectVisuals();
    }
    
    if (confirmP1 && (confirmP2 || gameMode !== 'vs')) {
      if (gameMode !== 'vs') {
        const chars = ['jin', 'king', 'paul', 'ogre'];
        selectedP2 = chars.find(c => c !== selectedP1) || 'king';
        confirmP2 = true;
      }
      setTimeout(startFightRoundReset, 1000);
    }
  });
});

function updateCharSelectVisuals() {
  document.querySelectorAll('.char-card').forEach(card => {
    const char = card.getAttribute('data-char');
    card.className = 'char-card';
    
    if (selectedP1 === char && selectedP2 === char) {
      card.classList.add('selected-both');
    } else if (selectedP1 === char) {
      card.classList.add('selected-p1');
    } else if (selectedP2 === char) {
      card.classList.add('selected-p2');
    }
  });

  const stat1 = fighterStats[selectedP1];
  const p1Preview = document.getElementById('p1-preview');
  p1Preview.querySelector('.preview-name').innerText = stat1.name;
  p1Preview.querySelector('.preview-stance').innerText = stat1.specialName;
  p1Preview.querySelector('.preview-style').innerText = `Style: ${stat1.name === 'KING' ? 'Wrestling' : (stat1.name === 'JIN KAZAMA' ? 'Karate' : (stat1.name === 'OGRE' ? 'Ancient Power' : 'Judo'))}`;
  
  const stat2 = fighterStats[selectedP2];
  const p2Preview = document.getElementById('p2-preview');
  p2Preview.querySelector('.preview-name').innerText = stat2.name;
  p2Preview.querySelector('.preview-stance').innerText = stat2.specialName;
  p2Preview.querySelector('.preview-style').innerText = `Style: ${stat2.name === 'KING' ? 'Wrestling' : (stat2.name === 'JIN KAZAMA' ? 'Karate' : (stat2.name === 'OGRE' ? 'Ancient Power' : 'Judo'))}`;
}

let roundTimerVal = 99;
let roundTimerInterval = null;
let p1RoundWins = 0;
let p2RoundWins = 0;
const roundsToWin = 2;
let fightActive = false;

function startFightRoundReset() {
  transitionToScreen('gameplay-hud');
  gameState = STATE_FIGHT;
  
  clearInterval(roundTimerInterval);
  roundTimerVal = 99;
  document.getElementById('round-timer').innerText = roundTimerVal;
  document.getElementById('round-timer').classList.remove('low-time');

  player1.reset(300, selectedP1);
  player2.reset(900, selectedP2);
  
  particles = [];
  damageTexts = [];
  fightActive = false;

  renderRoundBadges();

  document.getElementById('p1-combo-ui').classList.remove('active');
  document.getElementById('p2-combo-ui').classList.remove('active');
  document.getElementById('training-info').style.display = gameMode === 'training' ? 'block' : 'none';

  const currentRound = p1RoundWins + p2RoundWins + 1;
  const annEl = document.getElementById('announcement');
  
  if (gameMode === 'training') {
    annEl.innerText = "TRAINING";
    annEl.classList.add('show');
    soundManager.speak("Training Mode... Fight!");
    setTimeout(() => {
      annEl.classList.remove('show');
      fightActive = true;
    }, 1500);
  } else {
    annEl.innerText = `ROUND ${currentRound}`;
    annEl.classList.add('show');
    soundManager.speak(`Round ${currentRound}`);
    
    setTimeout(() => {
      annEl.innerText = "FIGHT!";
      soundManager.speak("Fight!");
      cameraShake = { x: 0, y: 0, duration: 10, intensity: 4 };
      
      setTimeout(() => {
        annEl.classList.remove('show');
        fightActive = true;
        startTimerCountdown();
      }, 1000);
    }, 1500);
  }
}

function startTimerCountdown() {
  if (gameMode === 'training') return;
  
  roundTimerInterval = setInterval(() => {
    if (!fightActive) return;
    roundTimerVal--;
    document.getElementById('round-timer').innerText = roundTimerVal;

    if (roundTimerVal <= 10) {
      document.getElementById('round-timer').classList.add('low-time');
    }

    if (roundTimerVal <= 0) {
      clearInterval(roundTimerInterval);
      handleRoundEnd(true);
    }
  }, 1000);
}

function renderRoundBadges() {
  const p1Badges = document.getElementById('p1-rounds');
  const p2Badges = document.getElementById('p2-rounds');
  
  p1Badges.innerHTML = '';
  p2Badges.innerHTML = '';

  for (let i = 0; i < roundsToWin; i++) {
    const b1 = document.createElement('span');
    b1.className = `badge ${i < p1RoundWins ? 'active' : ''}`;
    p1Badges.appendChild(b1);

    const b2 = document.createElement('span');
    b2.className = `badge ${i < p2RoundWins ? 'active' : ''}`;
    p2Badges.appendChild(b2);
  }
}

function handleRoundEnd(isTimeUp = false) {
  fightActive = false;
  clearInterval(roundTimerInterval);

  const annEl = document.getElementById('announcement');
  
  if (isTimeUp) {
    annEl.innerText = "TIME UP";
    soundManager.speak("Time up");
  } else {
    annEl.innerText = "K.O.";
    soundManager.speak("K O");
  }
  annEl.classList.add('show');

  setTimeout(() => {
    let winner = null;
    if (player1.hp > player2.hp) {
      winner = player1;
      p1RoundWins++;
    } else if (player2.hp > player1.hp) {
      winner = player2;
      p2RoundWins++;
    }

    renderRoundBadges();

    if (winner) {
      annEl.innerText = `${winner.stats.name} WINS`;
      soundManager.speak(`${winner.stats.name} wins`);
      winner.state = 'victory';
    } else {
      annEl.innerText = "DRAW";
      soundManager.speak("Draw match");
    }

    setTimeout(() => {
      annEl.classList.remove('show');
      if (p1RoundWins >= roundsToWin || p2RoundWins >= roundsToWin) {
        showMatchResults();
      } else {
        startFightRoundReset();
      }
    }, 2500);
  }, 2000);
}

function showMatchResults() {
  gameState = STATE_RESULTS;
  transitionToScreen('match-results');

  const winText = p1RoundWins >= roundsToWin ? player1.stats.name : player2.stats.name;
  document.getElementById('winner-announcement').innerText = `${winText} WINS`;
  
  const isPerfect = (p1RoundWins >= roundsToWin && player1.hp === player1.stats.maxHp) || (p2RoundWins >= roundsToWin && player2.hp === player2.stats.maxHp);
  document.getElementById('results-details').innerText = isPerfect ? "PERFECT VICTORY!" : "CHAMPION DETERMINED!";

  p1RoundWins = 0;
  p2RoundWins = 0;
}

function transitionToScreen(screenId) {
  document.querySelectorAll('.screen').forEach(scr => scr.classList.remove('active'));
  document.getElementById('gameplay-hud').classList.remove('active');
  
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

// AI Opponent Decision Loop (Player 2 CPU)
class CPU_Controller {
  constructor(fighter) {
    this.fighter = fighter;
    this.decisionTimer = 0;
    this.reactionSpeed = 14;
  }

  update() {
    if (!fightActive || gameMode !== 'cpu') return;

    this.decisionTimer++;
    if (this.decisionTimer < this.reactionSpeed) return;
    this.decisionTimer = 0;

    const target = this.fighter.target;
    if (!target) return;

    const distance = Math.abs(this.fighter.x - target.x);

    if (distance > 260) {
      this.fighter.move(this.fighter.facing);
      if (Math.random() > 0.85) {
        this.fighter.jump();
      } else if (Math.random() > 0.8 && this.fighter.charKey === 'ogre') {
        this.fighter.attack('special');
      }
    } 
    else if (distance <= 260 && distance > 90) {
      if (Math.random() > 0.45) {
        this.fighter.move(this.fighter.facing);
      } else {
        this.fighter.attack('special');
      }
    } 
    else {
      this.fighter.move(0);
      if (target.state.startsWith('attack') && Math.random() > 0.5) {
        this.fighter.move(-this.fighter.facing);
      } else {
        const roll = Math.random();
        if (roll < 0.35) {
          this.fighter.attack('punch');
        } else if (roll < 0.65) {
          this.fighter.attack('kick');
        } else if (roll < 0.85) {
          this.fighter.attack('punch');
          setTimeout(() => this.fighter.attack('kick'), 130);
        } else {
          if (this.fighter.rageActive) {
            this.fighter.attack('ultimate');
          } else {
            this.fighter.attack('special');
          }
        }
      }
    }
  }
}

const cpuController = new CPU_Controller(player2);

function handleKeyboardInputs() {
  if (!fightActive) return;

  // P1 inputs poll
  let p1Dir = 0;
  if (keys['a']) p1Dir = -1;
  if (keys['d']) p1Dir = 1;
  player1.move(p1Dir);

  if (keys['w']) player1.jump();
  player1.crouch(keys['s']);

  // P2 local human inputs poll
  if (gameMode === 'vs') {
    let p2Dir = 0;
    if (keys['arrowleft']) p2Dir = -1;
    if (keys['arrowright']) p2Dir = 1;
    player2.move(p2Dir);

    if (keys['arrowup']) player2.jump();
    player2.crouch(keys['arrowdown']);
  }
}

// Main Render Loop
function mainLoop() {
  ctx.clearRect(0, 0, 1280, 720);

  ctx.save();
  if (cameraShake.duration > 0) {
    const dx = (Math.random() - 0.5) * cameraShake.intensity;
    const dy = (Math.random() - 0.5) * cameraShake.intensity;
    ctx.translate(dx, dy);
    cameraShake.duration--;
  }

  // Calculate mid camera camera scroll offset based on character midpoint positions
  const midX = (player1.x + player2.x) / 2;
  const cameraOffset = midX - 640;

  // Draw scrolling stages
  stage.update();
  stage.draw(ctx, cameraOffset);

  if (gameState === STATE_FIGHT) {
    handleKeyboardInputs();
    cpuController.update();

    player1.update();
    player2.update();

    // Characters pass-through collision push
    const overlap = 55;
    const dist = Math.abs(player1.x - player2.x);
    if (dist < overlap && player1.y === stageY && player2.y === stageY) {
      const push = (overlap - dist) / 2;
      if (player1.x < player2.x) {
        player1.x -= push;
        player2.x += push;
      } else {
        player1.x += push;
        player2.x -= push;
      }
    }

    // Draw Mirror Ground Reflections FIRST (under players)
    stage.drawReflections(ctx, player1, player2);

    // Draw characters on top of floor reflections
    player1.draw(ctx);
    player2.draw(ctx);

    // Update floating damage values
    for (let i = damageTexts.length - 1; i >= 0; i--) {
      damageTexts[i].update();
      damageTexts[i].draw(ctx);
      if (damageTexts[i].alpha <= 0) {
        damageTexts.splice(i, 1);
      }
    }

    if (fightActive && (player1.hp <= 0 || player2.hp <= 0)) {
      handleRoundEnd(false);
    }
  }

  // Draw background and collision particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw(ctx);
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  ctx.restore();
  requestAnimationFrame(mainLoop);
}

mainLoop();
