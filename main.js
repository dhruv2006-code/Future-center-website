/* REPLACE THE initContactForm FUNCTION IN YOUR main.js 
   Change 'your-render-app-name' to your actual Render URL
*/

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    const txt = document.getElementById('btnText');
    const suc = document.getElementById('formSuccess');

    const formData = {
      fname:   document.getElementById('fname').value,
      lname:   document.getElementById('lname').value,
      email:   document.getElementById('email').value,
      phone:   document.getElementById('phone').value,
      course:  document.getElementById('course').value,
      message: document.getElementById('message').value
    };

    // UI Loading State (Critical for Render Free Tier)
    btn.disabled = true;
    txt.textContent = 'Waking up server...'; 
    btn.style.opacity = '0.6';

    try {
      // 🚀 REPLACE THIS URL with the link Render gives you
      const LIVE_URL = "https://your-render-app-name.onrender.com/contact";

      const response = await fetch(LIVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        if(suc) {
            suc.style.display = 'block';
            suc.textContent = "✅ Success! We've received your message.";
        }
        form.reset();
      } else {
        alert("The server is busy. Please try again in 30 seconds.");
      }
    } catch (err) {
      console.error("Connection Error:", err);
      alert("The server is starting up. Please wait 30 seconds and click Send again.");
    } finally {
      btn.disabled = false;
      txt.textContent = 'Send Message ✦';
      btn.style.opacity = '1';
      if(suc) setTimeout(() => { suc.style.display = 'none'; }, 6000);
    }
  });
}
