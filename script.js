/* ═══════════════════════════════════════════════
   PORTFOLIO — SCRIPT.JS
   All animations, 3D effects, scroll magic
═══════════════════════════════════════════════ */

/* ─── CURSOR ─────────────────────────────────── */
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.12;
  cursorY += (mouseY - cursorY) * 0.12;
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor scale on hover
document.querySelectorAll('a, button, .tab, .project-card, .orbit-item span').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2)';
    cursor.style.background = 'rgba(232,255,62,0.1)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.background = 'transparent';
  });
});

/* ─── NAV SCROLL ─────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* ─── HERO CANVAS — Particle Grid ──────────────── */
const heroCanvas = document.getElementById('heroCanvas');
const ctx = heroCanvas.getContext('2d');
let particles = [];
let animId;

function resizeCanvas() {
  heroCanvas.width  = heroCanvas.offsetWidth;
  heroCanvas.height = heroCanvas.offsetHeight;
  initParticles();
}

function initParticles() {
  particles = [];
  const cols = Math.floor(heroCanvas.width  / 60);
  const rows = Math.floor(heroCanvas.height / 60);
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      particles.push({
        x: (i / cols) * heroCanvas.width,
        y: (j / rows) * heroCanvas.height,
        ox: (i / cols) * heroCanvas.width,
        oy: (j / rows) * heroCanvas.height,
        vx: 0, vy: 0,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
  }
}

let heroMx = -1000, heroMy = -1000;
heroCanvas.addEventListener('mousemove', (e) => {
  const rect = heroCanvas.getBoundingClientRect();
  heroMx = e.clientX - rect.left;
  heroMy = e.clientY - rect.top;
});
heroCanvas.addEventListener('mouseleave', () => { heroMx = -1000; heroMy = -1000; });

function drawParticles() {
  ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

  particles.forEach((p, i) => {
    // Mouse repulsion
    const dx = p.x - heroMx;
    const dy = p.y - heroMy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      p.vx += (dx / dist) * force * 3;
      p.vy += (dy / dist) * force * 3;
    }
    // Spring back
    p.vx += (p.ox - p.x) * 0.03;
    p.vy += (p.oy - p.y) * 0.03;
    p.vx *= 0.85; p.vy *= 0.85;
    p.x += p.vx; p.y += p.vy;

    // Draw dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,255,62,${p.opacity})`;
    ctx.fill();

    // Draw connecting lines
    particles.forEach((p2, j) => {
      if (j <= i) return;
      const d = Math.hypot(p2.x - p.x, p2.y - p.y);
      if (d < 80) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(232,255,62,${(1 - d/80) * 0.12})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });

  requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
window.addEventListener('resize', resizeCanvas);

/* ─── GENERATIVE ART CANVAS ──────────────────── */
function drawArtCanvas(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const cx = c.getContext('2d');
  c.width  = c.offsetWidth;
  c.height = c.offsetHeight;
  const W = c.width, H = c.height;

  cx.fillStyle = '#0d0818';
  cx.fillRect(0, 0, W, H);

  const colors = ['#ff3e8a','#e8ff3e','#3effcf','#7b4fff','#ff6b35'];

  // Draw generative shapes
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 40 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const grad = cx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color + 'aa');
    grad.addColorStop(1, 'transparent');
    cx.beginPath();
    cx.arc(x, y, r, 0, Math.PI * 2);
    cx.fillStyle = grad;
    cx.fill();
  }

  // Draw lines
  cx.lineWidth = 0.5;
  for (let i = 0; i < 8; i++) {
    const x1 = Math.random() * W, y1 = Math.random() * H;
    const x2 = Math.random() * W, y2 = Math.random() * H;
    cx.beginPath();
    cx.moveTo(x1, y1);
    cx.lineTo(x2, y2);
    cx.strokeStyle = colors[Math.floor(Math.random() * colors.length)] + '44';
    cx.stroke();
  }
}

drawArtCanvas('artCanvas1');

/* ─── SCROLL REVEAL ──────────────────────────── */
const revealEls = document.querySelectorAll(
  '.reveal-up, .reveal-left, .reveal-right, .reveal-card'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ─── COUNTER ANIMATION ──────────────────────── */
function animateCount(el) {
  const target = parseInt(el.dataset.target);
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 40);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.count').forEach(animateCount);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroSection = document.querySelector('.hero');
if (heroSection) counterObs.observe(heroSection);

/* ─── SKILL BAR ANIMATION ────────────────────── */
const sbObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.sb-fill').forEach(bar => {
        const w = bar.dataset.width;
        setTimeout(() => { bar.style.width = w + '%'; }, 200);
      });
      sbObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillBars = document.querySelector('.skill-bars');
if (skillBars) sbObs.observe(skillBars);

/* ─── 3D CARD TILT ───────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  const inner = card.querySelector('.card-inner');

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    const tiltX = (y - 0.5) * -12;
    const tiltY = (x - 0.5) * 12;
    inner.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  });
});

/* ─── 3D ABOUT CARD TILT ─────────────────────── */
const aboutCard = document.querySelector('.a3d-inner');
if (aboutCard) {
  const aboutRight = document.querySelector('.about-right');
  aboutRight.addEventListener('mousemove', (e) => {
    const rect = aboutRight.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    const tX = (y - 0.5) * -16;
    const tY = (x - 0.5) * 16;
    aboutCard.style.transform = `perspective(1000px) rotateX(${tX}deg) rotateY(${tY}deg)`;
  });
  aboutRight.addEventListener('mouseleave', () => {
    aboutCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  });
}

/* ─── FILTER TABS ─────────────────────────────── */
const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('.project-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    cards.forEach(card => {
      const cat = card.dataset.category;
      const show = filter === 'all' || cat === filter;
      if (show) {
        card.classList.remove('hidden');
        card.style.animation = 'none';
        requestAnimationFrame(() => {
          card.style.animation = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.97)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ─── PARALLAX HERO ──────────────────────────── */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
    heroContent.style.opacity = Math.max(0, 1 - scrollY / 500);
  }
  const cube = document.getElementById('cube3d');
  if (cube) {
    cube.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.15}px))`;
  }
});

/* ─── MARQUEE PAUSE ON HOVER ─────────────────── */
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

/* ─── SMOOTH SCROLL NAV ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── SCROLL PROGRESS BAR ────────────────────── */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed; top: 0; left: 0; height: 2px; width: 0%;
  background: linear-gradient(90deg, #e8ff3e, #3effcf, #ff3e8a);
  z-index: 10000; transition: width 0.1s;
  box-shadow: 0 0 8px rgba(232,255,62,0.6);
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollPct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = scrollPct + '%';
});

/* ─── HERO TITLE GLITCH EFFECT ───────────────── */
const accentLine = document.querySelector('.accent-line');
if (accentLine) {
  setInterval(() => {
    if (Math.random() > 0.85) {
      accentLine.style.textShadow = '2px 0 #ff3e8a, -2px 0 #3effcf';
      accentLine.style.transform = 'skewX(-2deg)';
      setTimeout(() => {
        accentLine.style.textShadow = 'none';
        accentLine.style.transform = 'skewX(0)';
      }, 80);
    }
  }, 1500);
}

/* ─── CONTACT SECTION GRID PARALLAX ─────────── */
const contactBgGrid = document.querySelector('.cbg-grid');
if (contactBgGrid) {
  window.addEventListener('scroll', () => {
    const contactRect = document.querySelector('.contact').getBoundingClientRect();
    const offset = -contactRect.top * 0.2;
    contactBgGrid.style.transform = `translateY(${offset}px)`;
  });
}

/* ─── TYPING EFFECT FOR NAV STATUS ──────────── */
const statusText = document.querySelector('.nav-status span:last-child');
if (statusText) {
  const phrases = ['AVAILABLE FOR WORK', 'OPEN TO PROJECTS', 'LET\'S COLLABORATE'];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeEffect() {
    const phrase = phrases[phraseIndex];
    if (!deleting) {
      statusText.textContent = phrase.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(typeEffect, 2000);
        return;
      }
    } else {
      statusText.textContent = phrase.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeEffect, deleting ? 50 : 100);
  }
  setTimeout(typeEffect, 2000);
}

/* ─── ORBIT INTERACTION ──────────────────────── */
const orbitItems = document.querySelectorAll('.orbit-item span');
orbitItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    document.querySelector('.orbit-core').textContent = item.textContent;
    document.querySelector('.orbit-core').style.color = '#3effcf';
  });
  item.addEventListener('mouseleave', () => {
    document.querySelector('.orbit-core').textContent = 'ME';
    document.querySelector('.orbit-core').style.color = 'var(--accent)';
  });
});

/* ─── INIT LOG ───────────────────────────────── */
console.log('%c[ DEVFOLIO ] ', 'background:#e8ff3e;color:#000;font-weight:bold;padding:4px 8px;font-family:monospace;');
console.log('%cPortfolio loaded. Crafted with ♥ and code.', 'color:#8888aa;font-family:monospace;');
