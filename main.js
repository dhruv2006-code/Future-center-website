/* ============================================================
   FUTURE COMPUTER CENTER – main.js (Production Ready)
   ============================================================ */

// ── CONFIGURATION ────────────────────────────────────────────
const API_URL = "https://future-center-website.onrender.com/contact";

// ── NAVBAR & UI ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
});

const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
}

// ── CONTACT FORM LOGIC ───────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const txt = document.getElementById('btnText');

    const formData = {
      fname:   document.getElementById('fname').value,
      lname:   document.getElementById('lname').value,
      email:   document.getElementById('email').value,
      phone:   document.getElementById('phone').value,
      course:  document.getElementById('course').value,
      message: document.getElementById('message').value
    };

    btn.disabled = true;
    txt.textContent = 'Sending... (Server waking up)';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("✅ Success! We've received your message.");
        form.reset();
      } else {
        alert("Server error. Please try again in 30 seconds.");
      }
    } catch (err) {
      alert("The server is starting up. Please wait 30 seconds and click Send again.");
    } finally {
      btn.disabled = false;
      txt.textContent = 'Send Message ✦';
    }
  });
}

// ── THREE.JS HERO CANVAS (SIMPLIFIED FOR PERFORMANCE) ────────
function initHeroCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  camera.position.z = 5;

  const geo = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
  const mat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.2 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
}

// ── INITIALIZE EVERYTHING ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initHeroCanvas('heroCanvas');
});
