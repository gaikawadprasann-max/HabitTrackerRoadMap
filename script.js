/* ============================================
   PRASANN'S ROADMAP — SCRIPT.JS
   Interactive: Cursor, Canvas, Scroll, Toggle
   ============================================ */

'use strict';

/* ── CUSTOM CURSOR ── */
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

// Smooth trail
(function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  trail.style.left = trailX + 'px';
  trail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
})();

document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
  trail.style.opacity  = '0';
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity = '1';
  trail.style.opacity  = '1';
});


/* ── CANVAS GRID ── */
const canvas = document.getElementById('gridCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let dotTime = 0;
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const spacing = 60;
  const cols = Math.ceil(canvas.width  / spacing) + 1;
  const rows = Math.ceil(canvas.height / spacing) + 1;

  dotTime += 0.003;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * spacing;
      const y = r * spacing;

      // Distance from cursor for glow effect
      const dx = x - mouseX;
      const dy = y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 200;

      // Wave effect
      const wave = Math.sin(dotTime + c * 0.3 + r * 0.4) * 0.3 + 0.7;

      let alpha = 0.06 * wave;
      let radius = 1;

      if (dist < maxDist) {
        const proximity = 1 - dist / maxDist;
        alpha = Math.min(0.06 + proximity * 0.35, 0.4);
        radius = 1 + proximity * 2;
        ctx.fillStyle = `rgba(245, 197, 24, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(46, 58, 74, ${alpha})`;
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(drawGrid);
}
drawGrid();


/* ── SCROLL PROGRESS BAR ── */
const progressBar  = document.getElementById('progressBar');
const progressWrap = document.getElementById('progressWrap');
const weekLinks    = document.querySelectorAll('.progress-weeks span');

function updateProgress() {
  const scrollTop  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
  const progress   = Math.min((scrollTop / docHeight) * 100, 100);
  progressBar.style.setProperty('--progress', progress + '%');

  // Active week highlight
  const weeks = document.querySelectorAll('.week-section');
  let activeWeek = null;
  weeks.forEach(w => {
    const rect = w.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.5) {
      activeWeek = w.dataset.week;
    }
  });
  weekLinks.forEach(l => {
    l.classList.toggle('active', l.dataset.week === activeWeek);
  });
}

window.addEventListener('scroll', updateProgress, { passive: true });

// Click week to scroll
weekLinks.forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById('week' + link.dataset.week);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ── INTERSECTION OBSERVER — Animate on scroll ── */
const observerOptions = {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = parseFloat(entry.target.dataset.delay || 0) * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all animatable elements
document.querySelectorAll('[data-animate], .topic-block, .stack-card').forEach(el => {
  observer.observe(el);
});


/* ── TOPIC ACCORDION ── */
document.querySelectorAll('.topic-head').forEach(head => {
  head.addEventListener('click', () => {
    const item   = head.closest('.topic-item');
    const isOpen = item.classList.contains('open');

    // Close all siblings
    item.closest('.topic-list').querySelectorAll('.topic-item').forEach(i => {
      i.classList.remove('open');
    });

    // Toggle current
    if (!isOpen) {
      item.classList.add('open');

      // Smooth scroll into view if needed
      setTimeout(() => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 60) {
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 350);
    }
  });
});

// Open first topic in each block by default
document.querySelectorAll('.topic-block').forEach(block => {
  const first = block.querySelector('.topic-item');
  if (first) first.classList.add('open');
});


/* ── NAME GLITCH EFFECT (click to trigger) ── */
const nameMain = document.querySelector('.name-main');
let glitchInterval = null;
const glitchChars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
const originalName = 'PRASANN';

function triggerGlitch() {
  if (glitchInterval) return;
  let iterations = 0;
  const maxIterations = 16;

  glitchInterval = setInterval(() => {
    nameMain.textContent = originalName
      .split('')
      .map((char, i) => {
        if (i < iterations / 2) return char;
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      })
      .join('');

    if (iterations >= maxIterations) {
      nameMain.textContent = originalName;
      clearInterval(glitchInterval);
      glitchInterval = null;
    }
    iterations++;
  }, 50);
}

if (nameMain) {
  nameMain.style.cursor = 'none';
  nameMain.addEventListener('click', triggerGlitch);
  // Auto-glitch on load after delay
  setTimeout(triggerGlitch, 2000);
}


/* ── WEEK SECTION SIDE GLOW on scroll ── */
const weekColors = {
  '1': 'rgba(245,197,24,0.03)',
  '2': 'rgba(0,212,255,0.03)',
  '3': 'rgba(0,255,136,0.03)',
  '4': 'rgba(255,107,53,0.03)'
};

const weekObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const week = entry.target.dataset.week;
      document.body.style.backgroundColor = '#080A0E';
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.week-section').forEach(w => weekObserver.observe(w));


/* ── CODE SNIPPET COPY ── */
document.querySelectorAll('.code-snip').forEach(snip => {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  snip.parentNode.insertBefore(wrapper, snip);
  wrapper.appendChild(snip);

  const btn = document.createElement('button');
  btn.textContent = 'copy';
  btn.style.cssText = `
    position: absolute; top: 0.5rem; right: 0.5rem;
    font-family: 'DM Mono', monospace; font-size: 0.6rem;
    letter-spacing: 0.1em; padding: 0.2rem 0.5rem;
    background: transparent; border: 1px solid #2E3A4A;
    color: #64748B; border-radius: 3px; cursor: pointer;
    transition: all 0.2s;
  `;
  btn.addEventListener('mouseenter', () => { btn.style.color = '#00FF88'; btn.style.borderColor = '#00FF88'; });
  btn.addEventListener('mouseleave', () => { btn.style.color = '#64748B'; btn.style.borderColor = '#2E3A4A'; });
  btn.addEventListener('click', () => {
    const text = snip.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'copied!';
      btn.style.color = '#00FF88';
      setTimeout(() => {
        btn.textContent = 'copy';
        btn.style.color = '#64748B';
      }, 2000);
    });
  });
  wrapper.appendChild(btn);
});


/* ── KEYBOARD NAVIGATION ── */
document.addEventListener('keydown', (e) => {
  const weeks = ['week1', 'week2', 'week3', 'week4'];
  const current = weeks.findIndex(id => {
    const el = document.getElementById(id);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top >= -100 && rect.top < window.innerHeight * 0.5;
  });

  if (e.key === 'ArrowDown' && current < weeks.length - 1) {
    e.preventDefault();
    document.getElementById(weeks[current + 1])?.scrollIntoView({ behavior: 'smooth' });
  }
  if (e.key === 'ArrowUp' && current > 0) {
    e.preventDefault();
    document.getElementById(weeks[current - 1])?.scrollIntoView({ behavior: 'smooth' });
  }
});


/* ── STACK CARD TILT ── */
document.querySelectorAll('.stack-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect  = card.getBoundingClientRect();
    const x     = (e.clientX - rect.left) / rect.width  - 0.5;
    const y     = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ── SCROLL TO TOP ── */
const scrollBtn = document.createElement('button');
scrollBtn.innerHTML = '↑';
scrollBtn.title = 'Back to top';
scrollBtn.style.cssText = `
  position: fixed; bottom: 2rem; right: 2rem; z-index: 999;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--card, #111620); border: 1px solid #2E3A4A;
  color: #64748B; font-size: 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s, color 0.2s, border-color 0.2s;
  font-family: monospace;
`;
document.body.appendChild(scrollBtn);

scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
scrollBtn.addEventListener('mouseenter', () => {
  scrollBtn.style.color = '#F5C518';
  scrollBtn.style.borderColor = '#F5C518';
});
scrollBtn.addEventListener('mouseleave', () => {
  scrollBtn.style.color = '#64748B';
  scrollBtn.style.borderColor = '#2E3A4A';
});

window.addEventListener('scroll', () => {
  scrollBtn.style.opacity = window.scrollY > 500 ? '1' : '0';
}, { passive: true });


/* ── INIT ── */
console.log('%cPRASANN\'S ROADMAP 🚀', 'font-size:18px; font-family:monospace; color:#F5C518;');
console.log('%cASP.NET MVC Habit Tracker — 30 Days', 'font-size:12px; font-family:monospace; color:#64748B;');
console.log('%cgithub.com/Prasannthedeveloper', 'font-size:11px; font-family:monospace; color:#00D4FF;');
