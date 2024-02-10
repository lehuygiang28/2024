class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  append(data) {
    const newNode = new Node(data);

    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }

    return newNode;
  }

  remove(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }
}

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Function to update canvas size
function updateCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Update canvas size initially
updateCanvasSize();

// Update canvas size whenever the window is resized
window.addEventListener("resize", updateCanvasSize);

// Particle pool
let particlePool = [];
let particles = new DoublyLinkedList();

// Maximum number of fireworks
const maxFireworks = 5;
let currentFireworks = 0;

class Particle {
  constructor(x, y, size, color, velocity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.node = null;
  }

  draw() {
    // const gradient = ctx.createRadialGradient(
    //   this.x,
    //   this.y,
    //   0,
    //   this.x,
    //   this.y,
    //   this.size
    // );
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    // gradient.addColorStop(0, this.color);
    // gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = this.color; // Use a solid color instead of a gradient
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= 0.99;
    this.velocity.y *= 0.99;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.005;
  }

  reset(x, y, size, color, velocity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.node = null;
  }
}

function addFirework() {
  if (currentFireworks >= maxFireworks) {
    return;
  }

  const numParticles = Math.random() * 25 + 25; // Reduced the number of particles

  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const colors = [
    "#ff0000", // Red
    "#ff7f00", // Orange
    "#ffff00", // Yellow
    "#00ff00", // Green
    "#0000ff", // Blue
    "#4b0082", // Indigo
    "#8f00ff", // Violet
    "#ff00ff", // Magenta
    "#00ffff", // Cyan
    "#ffffff", // White
    "#ff1493", // DeepPink
    "#1e90ff", // DodgerBlue
    "#adff2f", // GreenYellow
    "#ff4500", // OrangeRed
    "#8a2be2", // BlueViolet
  ];

  for (let i = 0; i < numParticles; i++) {
    const size = Math.random() * 2 + 1; // Vary the size of the particles
    const color = colors[Math.floor(Math.random() * colors.length)]; // Choose a random color for each particle
    let particle;

    // Reuse a particle from the pool if available
    if (particlePool.length > 0) {
      particle = particlePool.pop();
      particle.reset(x, y, size, color, {
        x: (Math.random() - 0.5) * (Math.random() * 6),
        y: (Math.random() - 0.5) * (Math.random() * 6),
      });
    } else {
      particle = new Particle(x, y, size, color, {
        x: (Math.random() - 0.5) * (Math.random() * 6),
        y: (Math.random() - 0.5) * (Math.random() * 6),
      });
    }

    // particles.push(particle);
    particle.node = particles.append(particle);
  }

  // Increment the counter when a new firework is added
  currentFireworks++;
}

let animationId;
let intervalId;

function animate() {
  // If the page is visible, request the next animation frame
  if (!document.hidden) {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0, 0, 0, 0.05";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let particle = particles.head;
    while (particle) {
      const nextParticle = particle.next;

      const isAlive = particle.data.alpha > 0;
      const isOnScreen =
        particle.data.x > 0 &&
        particle.data.x < canvas.width &&
        particle.data.y > 0 &&
        particle.data.y < canvas.height;

      if (!isAlive || !isOnScreen) {
        particlePool.push(particle.data);
        particles.remove(particle.data.node);

        // Decrement the counter when a firework is removed
        currentFireworks--;
      } else {
        particle.data.update();
      }

      particle = nextParticle;
    }
  }
}

// Start the animation and interval initially
animationId = requestAnimationFrame(animate);
intervalId = setInterval(addFirework, 400);

function cancelAnimation() {
  cancelAnimationFrame(animationId);
  clearInterval(intervalId);
}

function focusAnimation() {
  animationId = requestAnimationFrame(animate);
  intervalId = setInterval(addFirework, 400);
}

// Listen for visibility changes
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    // If the page is hidden, cancel the animation and interval
    cancelAnimation();
  } else {
    // If the page is visible, restart the animation and interval
    focusAnimation();
  }
});
