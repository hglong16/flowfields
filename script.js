const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;

class Helper {
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }
}

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.speedX;
    this.speedY;
    this.speedModifier = Helper.random(1, 3);
    this.history = [{ x: this.x, y: this.y }];
    this.maxLength = Helper.random(10, 100);
    this.timer = this.maxLength * 2;
    this.angle = 0;
    this.colors = ["#D4F1F4", "#75E6DA", "#189AB4", "#05445E", "white"];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
  }
  draw(context) {
    let firstHistory = this.history[0];
    context.strokeStyle = this.color;
    context.lineWidth = 0.5;

    context.beginPath();
    context.moveTo(firstHistory.x, firstHistory.y);
    for (let i = 0; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.stroke();
  }
  update() {
    this.timer--;
    if (this.timer >= 1) {
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;
      this.angle = this.effect.flowField[index];
      this.speedX = Math.cos(this.angle);
      this.speedY = Math.sin(this.angle);
      this.x += this.speedX * this.speedModifier;
      this.y += this.speedY * this.speedModifier;
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }

  reset() {
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.history = [{ x: this.x, y: this.y }];
    this.timer = this.maxLength * 2;
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 2048;
    this.cellSize = 8;
    this.rows;
    this.cols;
    this.flowField = [];
    this.curve = 1.6;
    this.zoom = 0.55;
    this.debug = false;
    this.init();

    window.addEventListener("keydown", (e) => {
      if (e.key === "d") {
        this.debug = !this.debug;
      }
    });

    window.addEventListener("resize", (e) => {
      this.resize(e.target.innerWidth, e.target.innerHeight);
    });

    window.addEventListener("mousemove", (e) => {
      let x = Math.floor(e.pageX / this.cellSize);
      let y = Math.floor(e.pageY / this.cellSize);
      let index = y * this.cols + x;
      this.flowField[index] *= 1.5;
    });
  }
  init() {
    //flow fields
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);
    this.flowField = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let angle =
          (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
        this.flowField.push(angle);
      }
    }

    // particles
    this.particles = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }

  drawGrid(context) {
    context.save();
    context.strokeStyle = "green";
    context.lineWidth = 0.3;
    for (let c = 0; c < this.cols; c++) {
      context.beginPath();
      context.moveTo(c * this.cellSize, 0);
      context.lineTo(c * this.cellSize, this.height);
      context.stroke();
    }

    for (let r = 0; r < this.rows; r++) {
      context.beginPath();
      context.moveTo(0, r * this.cellSize);
      context.lineTo(this.width, r * this.cellSize);
      context.stroke();
    }

    context.restore();
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.init();
  }
  render(context) {
    if (this.debug) this.drawGrid(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
}

const effect = new Effect(canvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.render(ctx);
  requestAnimationFrame(animate);
}

animate();
