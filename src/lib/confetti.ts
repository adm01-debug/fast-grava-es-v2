// Confetti animation utility for celebrations
interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  'hsl(234, 89%, 63%)', // Primary
  'hsl(262, 83%, 58%)', // Accent
  'hsl(160, 84%, 39%)', // Success
  'hsl(45, 93%, 47%)',  // Gold
  'hsl(38, 92%, 50%)',  // Warning
];

class ConfettiManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: ConfettiParticle[] = [];
  private animationId: number | null = null;

  private createCanvas() {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', this.resize.bind(this));
  }

  private resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createParticle(x: number, y: number): ConfettiParticle {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 20,
      vy: Math.random() * -15 - 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    };
  }

  private animate() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // Gravity
      p.vx *= 0.99; // Air resistance
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.005;

      if (p.opacity <= 0 || p.y > this.canvas!.height) return false;

      this.ctx!.save();
      this.ctx!.translate(p.x, p.y);
      this.ctx!.rotate((p.rotation * Math.PI) / 180);
      this.ctx!.globalAlpha = p.opacity;
      this.ctx!.fillStyle = p.color;
      this.ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx!.restore();

      return true;
    });

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    } else {
      this.cleanup();
    }
  }

  private cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
  }

  fire(options?: { x?: number; y?: number; particleCount?: number }) {
    this.createCanvas();

    const {
      x = window.innerWidth / 2,
      y = window.innerHeight / 2,
      particleCount = 100,
    } = options || {};

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this.createParticle(x, y));
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  burst(x: number, y: number, count = 30) {
    this.fire({ x, y, particleCount: count });
  }

  rain(duration = 3000) {
    this.createCanvas();
    const interval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * window.innerWidth;
        this.particles.push(this.createParticle(x, -10));
      }
    }, 50);

    setTimeout(() => clearInterval(interval), duration);

    if (!this.animationId) {
      this.animate();
    }
  }
}

export default new ConfettiManager();
