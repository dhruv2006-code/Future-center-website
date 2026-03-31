/* ============================================================
   FUTURE COMPUTER CENTER – main.js
   Fixed: Backend Integration for Contact Form (fname/lname)
   ============================================================ */

// ── NAVBAR SCROLL ──────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── HAMBURGER MENU ─────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    hamburger.classList.toggle('active');
    if (hamburger.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

// ── THREE.JS HERO CANVAS ───────────────────────────────────
function initHeroCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const count = 2000;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);
  const col   = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    const r = Math.random();
    if (r < 0.33) { col[i*3]=0; col[i*3+1]=0.83; col[i*3+2]=1; }
    else if (r < 0.66) { col[i*3]=0.48; col[i*3+1]=0.18; col[i*3+2]=1; }
    else { col[i*3]=1; col[i*3+1]=1; col[i*3+2]=1; }
    speeds[i] = 0.002 + Math.random() * 0.006;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat  = new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.85 });
  const pts  = new THREE.Points(geo, mat);
  scene.add(pts);

  const gridGeo = new THREE.BufferGeometry();
  const gridVerts = [];
  const step = 1.5, extent = 12;
  for (let x = -extent; x <= extent; x += step) {
    gridVerts.push(x, -extent, -3, x, extent, -3);
    gridVerts.push(-extent, x, -3, extent, x, -3);
  }
  gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridVerts), 3));
  const gridMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.04 });
  scene.add(new THREE.LineSegments(gridGeo, gridMat));

  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 0.4;
    my = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  const onResize = () => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  const tick = () => {
    requestAnimationFrame(tick);
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p[i * 3 + 1] += speeds[i];
      if (p[i * 3 + 1] > 10) p[i * 3 + 1] = -10;
    }
    geo.attributes.position.needsUpdate = true;
    pts.rotation.y += 0.0008;
    camera.position.x += (mx - camera.position.x) * 0.03;
    camera.position.y += (-my - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  tick();
}

// ── THREE.JS WHY CANVAS ────────────────────────────────────
function initWhyCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  camera.position.z = 5;

  const torusGeo = new THREE.TorusGeometry(1.8, 0.6, 12, 48);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.25 });
  const torus    = new THREE.Mesh(torusGeo, torusMat);
  scene.add(torus);

  const sphereGeo = new THREE.SphereGeometry(0.8, 24, 24);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0x7b2fff, wireframe: true, transparent: true, opacity: 0.3 });
  scene.add(new THREE.Mesh(sphereGeo, sphereMat));

  const pGeo  = new THREE.BufferGeometry();
  const pPos  = [];
  for (let i = 0; i < 400; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 2.5 + Math.random() * 1.5;
    pPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pPos), 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.06, transparent: true, opacity: 0.7 })));

  const tick = () => {
    requestAnimationFrame(tick);
    torus.rotation.x += 0.005;
    torus.rotation.y += 0.008;
    renderer.render(scene, camera);
  };
  tick();
}

// ── SCROLL ANIMATIONS ──────────────────────────────────────
function initScrollAnimations() {
  const targets = document.querySelectorAll('.course-card, .feature, .testi-card, .team-card, .tl-card, .info-card, .visual-card, .course-detail-card, .faq-item');
  targets.forEach(el => el.classList.add('fade-up'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay ? parseInt(e.target.dataset.delay) : 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => io.observe(el));
}

// ── COURSE FILTER ──────────────────────────────────────────
function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.course-detail-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? 'block' : 'none';
        card.style.opacity = match ? '1' : '0';
      });
    });
  });
}

// ── FAQ ACCORDION ──────────────────────────────────────────
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-q');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── CONTACT FORM (FIXED FOR PYTHON BACKEND) ────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    const txt = document.getElementById('btnText');
    const suc = document.getElementById('formSuccess');

    // 1. Gather data (MATCHES PYTHON fname/lname)
    const formData = {
      fname:   document.getElementById('fname').value,
      lname:   document.getElementById('lname').value,
      email:   document.getElementById('email').value,
      phone:   document.getElementById('phone').value,
      course:  document.getElementById('course').value,
      message: document.getElementById('message').value
    };

    // 2. Loading state
    btn.disabled = true;
    txt.textContent = 'Sending Message...';
    btn.style.opacity = '0.7';

    try {
      // 3. Send to Python Backend (URL fixed to /contact)
      const response = await fetch('http://127.0.0.1:8000/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        suc.style.display = 'block';
        suc.textContent = "✅ Success! We've received your message.";
        form.reset();
      } else {
        const errorData = await response.json();
        alert("Server Error: " + (errorData.detail || "Something went wrong"));
      }
    } catch (err) {
      console.error("Connection Error:", err);
      alert("Could not connect to the backend. Ensure 'python -m uvicorn main:app --reload' is running.");
    } finally {
      btn.disabled = false;
      txt.textContent = 'Send Message ✦';
      btn.style.opacity = '1';
      setTimeout(() => { suc.style.display = 'none'; }, 6000);
    }
  });
}

// ── COUNTER ANIMATIONS ─────────────────────────────────────
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.round(current) + suffix;
  }, 25);
}

function initCounters() {
  const nums = document.querySelectorAll('.stat .num, .vc-num');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const raw = el.textContent.replace(/[^0-9]/g, '');
        const suf = el.textContent.replace(/[0-9]/g, '');
        if (raw) animateCounter(el, parseInt(raw), suf);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
}

// ── CARD TILT ──────────────────────────────────────────────
function initTilt() {
  document.querySelectorAll('.course-card, .testi-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;
      const rx = (y - cy) / cy * -8, ry = (x - cx) / cx * 8;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

// ── CURSOR GLOW ────────────────────────────────────────────
function initCursorGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,0.06) 0%,transparent 70%);transform:translate(-50%,-50%);`;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ── TYPING ─────────────────────────────────────────────────
function initTyping() {
  const el = document.querySelector('.hero-sub');
  if (!el) return;
  const text = el.textContent;
  el.textContent = '';
  el.style.opacity = '1';
  let i = 0;
  setTimeout(() => {
    const timer = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) clearInterval(timer);
    }, 22);
  }, 800);
}

// ── SECTION REVEAL ─────────────────────────────────────────
function initSectionReveal() {
  const sections = document.querySelectorAll('section');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });
  sections.forEach(s => {
    if (!s.classList.contains('hero') && !s.classList.contains('page-hero')) {
      s.style.opacity = '0';
      s.style.transform = 'translateY(20px)';
      s.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }
    io.observe(s);
  });
}

// ── INIT EVERYTHING ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas('heroCanvas');
  initWhyCanvas('whyCanvas');
  initScrollAnimations();
  initFilter();
  initFAQ();
  initContactForm();
  initCounters();
  initTilt();
  initCursorGlow();
  initTyping();
  initSectionReveal();
});