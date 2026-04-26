(function initYear() {
  const el = document.getElementById('footYear');
  if (el) el.textContent = String(new Date().getFullYear());
})();

(function initTheme() {
  const btn = document.getElementById('themeBtn');
  if (!btn) return;
  if (localStorage.getItem('sentinel-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('sentinel-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sentinel-theme', 'dark');
    }
  });
})();

(function initCounter() {
  const el = document.getElementById('counter');
  if (!el) return;
  const target = 47;
  let n = 0;
  const id = setInterval(() => {
    n += Math.ceil((target - n) / 6);
    el.textContent = n;
    if (n >= target) { el.textContent = target; clearInterval(id); }
  }, 40);
})();

(function initFeed() {
  const feed = document.getElementById('feed');
  if (!feed) return;

  const samples = [
    { src: 'docker',   msg: 'api-server      started',   tag: 'ok',   tagText: 'up' },
    { src: 'postgres', msg: 'prod-db         healthy',   tag: 'ok',   tagText: '23ms' },
    { src: 'http',     msg: '/v1/users       200',       tag: 'info', tagText: '14ms' },
    { src: 'docker',   msg: 'worker-3        restarted', tag: 'warn', tagText: 'retry 1' },
    { src: 'redis',    msg: 'cache           healthy',   tag: 'ok',   tagText: '1ms' },
    { src: 'http',     msg: '/v1/checkout    200',       tag: 'info', tagText: '42ms' },
    { src: 'docker',   msg: 'queue-runner    started',   tag: 'ok',   tagText: 'up' },
    { src: 'postgres', msg: 'replica-1       lag 0.2s',  tag: 'ok',   tagText: 'ok' },
    { src: 'http',     msg: '/v1/auth        401',       tag: 'err',  tagText: 'block' },
    { src: 'docker',   msg: 'api-server      cpu 64%',   tag: 'warn', tagText: 'warn' },
    { src: 'mysql',    msg: 'analytics       healthy',   tag: 'ok',   tagText: '12ms' },
    { src: 'http',     msg: '/v1/billing     200',       tag: 'info', tagText: '88ms' },
  ];

  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const ts = () => {
    const d = new Date();
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  };

  let idx = 0;
  function pushRow() {
    const s = samples[idx++ % samples.length];
    const row = document.createElement('div');
    row.className = 'feed-row';
    row.innerHTML =
      `<span class="ts">${ts()}</span>` +
      `<span class="src">${s.src}</span>` +
      `<span class="msg">${s.msg}</span>` +
      `<span class="tag ${s.tag}">${s.tagText}</span>`;
    feed.prepend(row);
    while (feed.childElementCount > 18) feed.removeChild(feed.lastChild);
  }

  for (let i = 0; i < 6; i++) pushRow();
  setInterval(pushRow, 2200);
})();

(function initDriftAndSparkline() {
  const containers = document.getElementById('containers');
  const latency = document.getElementById('latency');
  const path = document.getElementById('sparkPath');
  const fill = document.getElementById('sparkFill');
  if (!containers || !latency) return;

  const W = 200, H = 32, N = 24;
  const series = Array.from({ length: N }, () => 70 + Math.random() * 50);

  function renderSparkline() {
    if (!path || !fill) return;
    const min = Math.min(...series) - 4;
    const max = Math.max(...series) + 4;
    const range = Math.max(max - min, 1);
    const dx = W / (N - 1);
    const d = series.map((v, i) => {
      const x = i * dx;
      const y = H - ((v - min) / range) * H;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
    path.setAttribute('d', d);
    fill.setAttribute('d', `${d} L${W},${H} L0,${H} Z`);
  }

  renderSparkline();
  setInterval(() => {
    const next = 70 + Math.floor(Math.random() * 50);
    containers.textContent = 45 + Math.floor(Math.random() * 5);
    latency.textContent = next;
    series.push(next);
    series.shift();
    renderSparkline();
  }, 2400);
})();

(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
})();

(function initTypedPlaceholder() {
  const inputs = document.querySelectorAll('form[data-typed-placeholder] input[type="email"]');
  if (!inputs.length) return;

  const samples = ['you@company.com', 'alex@startup.io', 'devops@yourbiz.com', 'sre@acme.dev'];
  let sampleIdx = 0, charIdx = 0, typing = true, pause = 0;

  setInterval(() => {
    const target = samples[sampleIdx];
    if (pause > 0) { pause--; return; }
    if (typing) {
      charIdx++;
      if (charIdx >= target.length) { typing = false; pause = 24; }
    } else {
      charIdx--;
      if (charIdx <= 0) { typing = true; sampleIdx = (sampleIdx + 1) % samples.length; }
    }
    const text = target.slice(0, charIdx);
    inputs.forEach((el) => {
      if (document.activeElement !== el && !el.value) el.placeholder = text;
    });
  }, 80);
})();

(function initShortcut() {
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    const inField = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (e.key !== '/' || inField || e.metaKey || e.ctrlKey || e.altKey) return;
    const input = document.getElementById('heroEmail');
    if (!input) return;
    e.preventDefault();
    input.focus();
    input.classList.add('kbd-flash');
    setTimeout(() => input.classList.remove('kbd-flash'), 700);
  });
})();

const EMAILJS_PUBLIC_KEY = 'BUF8TbNjYzJSj-8n_';
const EMAILJS_SERVICE_ID = 'service_hxnem8h';
const EMAILJS_TEMPLATE_ID = 'template_6shfd4c';

window.addEventListener('load', () => {
  if (window.emailjs) window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
});

let captchaToken = null;
const gateEl = document.getElementById('gate');
const gateWidget = gateEl ? gateEl.querySelector('.cf-turnstile') : null;

function resetCaptcha() {
  if (window.turnstile && gateWidget) window.turnstile.reset(gateWidget);
}

function openGate() {
  if (!gateEl) return;
  document.body.classList.add('gated');
  gateEl.classList.remove('passed');
  resetCaptcha();
}

function closeGate() {
  if (!gateEl) return;
  gateEl.classList.add('passed');
  document.body.classList.remove('gated');
}

window.onCaptchaPass = (token) => {
  captchaToken = token;
  closeGate();
};

window.onCaptchaExpired = () => {
  captchaToken = null;
};

window.onCaptchaError = () => {
  captchaToken = null;
};

(function initForms() {
  const toast = document.getElementById('toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  document.querySelectorAll('form[data-waitlist]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const honeypot = form.querySelector('input[name="botcheck"]');
      const btn = form.querySelector('button');
      const email = (input.value || '').trim();
      if (!email || !email.includes('@')) { input.focus(); return; }
      if (honeypot && honeypot.checked) return;
      if (!captchaToken) {
        showToast('Re-verifying — one moment.');
        openGate();
        return;
      }

      captchaToken = null;
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Adding…';
      try {
        if (!window.emailjs) throw new Error('emailjs not loaded');
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          email,
          from_name: email,
        });
        input.value = '';
        btn.textContent = '✓ You\'re in';
        showToast(`Thanks — we'll email ${email} when beta opens.`);
        setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 2400);
      } catch (err) {
        btn.innerHTML = original;
        btn.disabled = false;
        showToast('Something went wrong. Try again?');
      } finally {
        if (window.turnstile && gateWidget) window.turnstile.reset(gateWidget);
      }
    });
  });
})();
