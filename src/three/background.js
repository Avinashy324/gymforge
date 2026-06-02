/**
 * GymForge Animated Background
 * Inspired by WorkoutGen.app and Antigravity aesthetics:
 * - Animated flowing gradient mesh blobs
 * - Subtle dot grid overlay
 * - Gym-themed pulsing energy waves
 * - Pure Canvas 2D — no Three.js needed for better performance
 */

export class AnimatedBackground {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.animationId = null;
    this.time = 0;
    this.blobs = [];
    this.dots = [];
    this.waves = [];
    this.mouse = { x: 0, y: 0 };
    this.isRunning = false;
    this.dpr = 1;
  }

  init(canvasId = 'three-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio, 2);

    this._resize();
    this._createBlobs();
    this._createDotGrid();
    this._createWaves();

    window.addEventListener('resize', () => this._resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.isRunning = true;
    this._animate();
  }

  _resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(this.dpr, this.dpr);
    this._createDotGrid();
  }

  _createBlobs() {
    // Organic gradient blobs that float and morph
    this.blobs = [
      {
        x: 0.2, y: 0.3, radius: 280,
        color1: 'rgba(255, 107, 44, 0.08)',
        color2: 'rgba(255, 107, 44, 0)',
        speedX: 0.0003, speedY: 0.0004,
        phaseX: 0, phaseY: Math.PI * 0.5,
        pulseSpeed: 0.001, pulsePhase: 0,
      },
      {
        x: 0.75, y: 0.2, radius: 320,
        color1: 'rgba(168, 85, 247, 0.06)',
        color2: 'rgba(168, 85, 247, 0)',
        speedX: 0.0002, speedY: 0.0005,
        phaseX: Math.PI, phaseY: 0,
        pulseSpeed: 0.0008, pulsePhase: Math.PI * 0.3,
      },
      {
        x: 0.5, y: 0.7, radius: 260,
        color1: 'rgba(59, 130, 246, 0.06)',
        color2: 'rgba(59, 130, 246, 0)',
        speedX: 0.0004, speedY: 0.0003,
        phaseX: Math.PI * 0.5, phaseY: Math.PI * 1.5,
        pulseSpeed: 0.0012, pulsePhase: Math.PI * 0.7,
      },
      {
        x: 0.15, y: 0.8, radius: 200,
        color1: 'rgba(34, 197, 94, 0.05)',
        color2: 'rgba(34, 197, 94, 0)',
        speedX: 0.0005, speedY: 0.0002,
        phaseX: Math.PI * 1.2, phaseY: Math.PI * 0.8,
        pulseSpeed: 0.0009, pulsePhase: Math.PI * 1.1,
      },
      {
        x: 0.85, y: 0.65, radius: 240,
        color1: 'rgba(255, 107, 44, 0.05)',
        color2: 'rgba(255, 143, 92, 0)',
        speedX: 0.0003, speedY: 0.0006,
        phaseX: Math.PI * 0.7, phaseY: Math.PI * 1.3,
        pulseSpeed: 0.0011, pulsePhase: Math.PI * 0.5,
      },
    ];
  }

  _createDotGrid() {
    this.dots = [];
    const spacing = 50;
    const cols = Math.ceil(this.width / spacing) + 1;
    const rows = Math.ceil(this.height / spacing) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.dots.push({
          baseX: col * spacing,
          baseY: row * spacing,
          x: col * spacing,
          y: row * spacing,
          baseAlpha: 0.06 + Math.random() * 0.04,
          alpha: 0.06,
          size: 1,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  _createWaves() {
    this.waves = [
      { y: 0.4, amplitude: 30, frequency: 0.008, speed: 0.0006, color: 'rgba(255, 107, 44, 0.03)', lineWidth: 1.5 },
      { y: 0.5, amplitude: 25, frequency: 0.006, speed: 0.0008, color: 'rgba(168, 85, 247, 0.03)', lineWidth: 1 },
      { y: 0.6, amplitude: 35, frequency: 0.01, speed: 0.0005, color: 'rgba(59, 130, 246, 0.025)', lineWidth: 1.5 },
    ];
  }

  _drawBlobs() {
    const ctx = this.ctx;

    this.blobs.forEach(blob => {
      const cx = blob.x * this.width + Math.sin(this.time * blob.speedX * 1000 + blob.phaseX) * 80;
      const cy = blob.y * this.height + Math.cos(this.time * blob.speedY * 1000 + blob.phaseY) * 60;
      const pulse = 1 + Math.sin(this.time * blob.pulseSpeed * 1000 + blob.pulsePhase) * 0.15;
      const r = blob.radius * pulse;

      // Mouse interaction — blobs move slightly towards mouse
      const dx = this.mouse.x - cx;
      const dy = this.mouse.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - dist / 500) * 20;
      const finalX = cx + (dx / (dist || 1)) * influence;
      const finalY = cy + (dy / (dist || 1)) * influence;

      const gradient = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, r);
      gradient.addColorStop(0, blob.color1);
      gradient.addColorStop(0.6, blob.color1.replace(/[\d.]+\)$/, (parseFloat(blob.color1.match(/[\d.]+\)$/)[0]) * 0.5) + ')'));
      gradient.addColorStop(1, blob.color2);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(finalX, finalY, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _drawDotGrid() {
    const ctx = this.ctx;

    this.dots.forEach(dot => {
      // Subtle wave displacement
      const waveX = Math.sin(this.time * 0.8 + dot.baseY * 0.01 + dot.phase) * 2;
      const waveY = Math.cos(this.time * 0.6 + dot.baseX * 0.01 + dot.phase) * 2;
      dot.x = dot.baseX + waveX;
      dot.y = dot.baseY + waveY;

      // Mouse proximity glow
      const dx = this.mouse.x - dot.x;
      const dy = this.mouse.y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mouseInfluence = Math.max(0, 1 - dist / 200);

      dot.alpha = dot.baseAlpha + mouseInfluence * 0.25;
      dot.size = 1 + mouseInfluence * 2;

      // Color based on proximity: orange when close to mouse
      if (mouseInfluence > 0.1) {
        const r = Math.round(255 * mouseInfluence + 100 * (1 - mouseInfluence));
        const g = Math.round(107 * mouseInfluence + 100 * (1 - mouseInfluence));
        const b = Math.round(44 * mouseInfluence + 100 * (1 - mouseInfluence));
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dot.alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${dot.alpha})`;
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _drawWaves() {
    const ctx = this.ctx;

    this.waves.forEach(wave => {
      ctx.beginPath();
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = wave.lineWidth;

      for (let x = 0; x <= this.width; x += 2) {
        const y = wave.y * this.height +
          Math.sin(x * wave.frequency + this.time * wave.speed * 1000) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.5 + this.time * wave.speed * 700) * wave.amplitude * 0.5;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });
  }

  _drawGymElements() {
    const ctx = this.ctx;
    const t = this.time;

    // Floating gym-themed icons (dumbbells, circles) as subtle outlines
    const icons = [
      { x: 0.1, y: 0.15, size: 18, rotation: t * 0.3, type: 'dumbbell' },
      { x: 0.88, y: 0.12, size: 14, rotation: -t * 0.2, type: 'circle' },
      { x: 0.05, y: 0.75, size: 16, rotation: t * 0.25, type: 'circle' },
      { x: 0.92, y: 0.82, size: 20, rotation: -t * 0.15, type: 'dumbbell' },
      { x: 0.5, y: 0.05, size: 12, rotation: t * 0.4, type: 'plus' },
      { x: 0.35, y: 0.9, size: 15, rotation: -t * 0.35, type: 'plus' },
    ];

    icons.forEach(icon => {
      const cx = icon.x * this.width;
      const floatY = icon.y * this.height + Math.sin(t * 0.5 + icon.x * 10) * 15;

      ctx.save();
      ctx.translate(cx, floatY);
      ctx.rotate(icon.rotation);
      ctx.strokeStyle = 'rgba(255, 107, 44, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      if (icon.type === 'dumbbell') {
        // Simple dumbbell shape
        const s = icon.size;
        ctx.beginPath();
        ctx.moveTo(-s, 0);
        ctx.lineTo(s, 0);
        ctx.stroke();
        // Weights
        ctx.strokeStyle = 'rgba(255, 107, 44, 0.1)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.4);
        ctx.lineTo(-s, s * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s, -s * 0.4);
        ctx.lineTo(s, s * 0.4);
        ctx.stroke();
      } else if (icon.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, icon.size, 0, Math.PI * 2);
        ctx.stroke();
        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, icon.size * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (icon.type === 'plus') {
        const s = icon.size;
        ctx.beginPath();
        ctx.moveTo(-s, 0);
        ctx.lineTo(s, 0);
        ctx.moveTo(0, -s);
        ctx.lineTo(0, s);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  _drawVignette() {
    const ctx = this.ctx;
    // Dark vignette around edges for depth
    const gradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.height * 0.3,
      this.width / 2, this.height / 2, this.height * 0.9
    );
    gradient.addColorStop(0, 'rgba(10, 10, 15, 0)');
    gradient.addColorStop(1, 'rgba(10, 10, 15, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  _animate() {
    if (!this.isRunning) return;
    this.animationId = requestAnimationFrame(() => this._animate());

    this.time += 0.016; // ~60fps

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Layer 1: Gradient blobs
    this._drawBlobs();

    // Layer 2: Energy waves
    this._drawWaves();

    // Layer 3: Dot grid with mouse interaction
    this._drawDotGrid();

    // Layer 4: Floating gym elements
    this._drawGymElements();

    // Layer 5: Vignette
    this._drawVignette();
  }

  dispose() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
