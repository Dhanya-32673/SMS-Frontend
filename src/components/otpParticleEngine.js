/**
 * otpParticleEngine.js
 * Canvas-based high-performance particle system for dark cyber-security background & burst effects.
 */

export class OTPParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.burstParticles = [];
    this.animationFrameId = null;
    this.mode = 'DEFAULT'; // 'DEFAULT' | 'SUCCESS' | 'ERROR'
    this.width = 0;
    this.height = 0;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', this.resize);
    this.spawnBackgroundParticles(70);
    this.loop();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  setMode(mode) {
    this.mode = mode;
  }

  spawnBackgroundParticles(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const isPurple = Math.random() > 0.4;
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2, // Slight upward drift
      alpha: Math.random() * 0.6 + 0.2,
      baseAlpha: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      color: isPurple ? '157, 78, 221' : '255, 0, 127', // Neon Purple / Pink
    };
  }

  burst(centerX, centerY, mode = 'SUCCESS') {
    const count = 90;
    const colorRGB = mode === 'SUCCESS' ? '0, 255, 136' : '255, 0, 85'; // Neon Green or Neon Red

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      this.burstParticles.push({
        x: centerX || this.width / 2,
        y: centerY || this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        colorRGB: colorRGB,
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'lighter';

    // 1. Draw Ambient Floating Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Alpha pulse
      p.alpha = p.baseAlpha + Math.sin(Date.now() * p.pulseSpeed) * 0.2;

      let particleColor = p.color;
      if (this.mode === 'SUCCESS') {
        particleColor = '0, 255, 136'; // Neon Green
      } else if (this.mode === 'ERROR') {
        particleColor = '255, 0, 85'; // Neon Red
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${particleColor}, ${Math.max(0, p.alpha)})`;
      this.ctx.shadowBlur = p.radius * 4;
      this.ctx.shadowColor = `rgba(${particleColor}, 0.8)`;
      this.ctx.fill();
    }

    // 2. Draw Explosive Burst Particles
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const bp = this.burstParticles[i];

      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vx *= 0.96; // Drag
      bp.vy *= 0.96;
      bp.alpha -= bp.decay;

      if (bp.alpha <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${bp.colorRGB}, ${bp.alpha})`;
      this.ctx.shadowBlur = bp.radius * 6;
      this.ctx.shadowColor = `rgba(${bp.colorRGB}, ${bp.alpha})`;
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  destroy() {
    window.removeEventListener('resize', this.resize);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
