// ── Replace these with your real values ───────────────────────────────────────
// Stripe: create a Payment Link at dashboard.stripe.com → Payment Links
// Product name: "Support Libra"
// Description:  "Voluntary tip to support Libra — a free personal reading tracker. No product is delivered."
const STRIPE_URL = 'https://donate.stripe.com/14A4gAfl0bws82t1e58bS03';

const ADDRESSES = {
  BTC: '3CnYJidSvWZwooemAtoJxBbWFgKAafS4aT',
  ETH: '0xC0B3934a621C9124E35E5f023dD58df5Cd91a072',
  SOL: '9WuCR65iN9PKPPSZUoAnf7e2BEbCtUa8CAvSGnDZ1AnY',
};
// ──────────────────────────────────────────────────────────────────────────────

function cryptoRowHTML(symbol, address) {
  return `
    <div class="crypto-row" data-crypto="${symbol}">
      <span class="crypto-symbol">${symbol}</span>
      <span class="crypto-address" title="${address}">${address}</span>
      <button class="crypto-copy-btn" data-address="${address}">[ COPY ]</button>
    </div>`;
}

function buildDonateHTML() {
  return `
    <div class="donate-intro">
      <div class="donate-tagline">&gt; Libra is free and open-source.</div>
      <div class="donate-tagline">&gt; If it's useful to you, a tip keeps it going.</div>
    </div>

    <div class="donate-section">
      <div class="donate-section-label">&gt; CARD PAYMENT</div>
      <a class="donate-stripe-btn" href="${STRIPE_URL}" target="_blank" rel="noopener noreferrer">
        ↗ DONATE WITH CARD (STRIPE)
      </a>
    </div>

    <div class="donate-divider">────────────────────────────────────────────</div>

    <div class="donate-section">
      <div class="donate-section-label">&gt; CRYPTOCURRENCY</div>
      ${cryptoRowHTML('BTC', ADDRESSES.BTC)}
      ${cryptoRowHTML('ETH', ADDRESSES.ETH)}
      ${cryptoRowHTML('SOL', ADDRESSES.SOL)}
    </div>

    <div class="donate-divider">────────────────────────────────────────────</div>

    <div class="donate-section" id="donate-thankyou-section">
      <div class="donate-section-label">&gt; RECEIVE APPRECIATION MESSAGE</div>
      <div class="donate-email-hint">&gt; Donated? Drop your email — we'll send a thank-you transmission.</div>
      <div class="donate-email-row">
        <input type="text" id="donate-name-input" class="donate-name-input" placeholder="your name (optional)" maxlength="80" autocomplete="name">
        <input type="email" id="donate-email-input" class="donate-email-input" placeholder="your@email.com" maxlength="320" autocomplete="email">
        <button class="donate-send-btn" id="donate-send-btn">[ SEND ]</button>
      </div>
      <div id="donate-send-status" class="donate-send-status"></div>
    </div>

    <div class="donate-footer">
      &gt; Thank you for supporting this project. Every contribution is appreciated.
    </div>`;
}

function bindCopyButtons() {
  document.querySelectorAll('.crypto-copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const address = btn.dataset.address;
      try {
        await navigator.clipboard.writeText(address);
        btn.textContent = '[ COPIED! ]';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '[ COPY ]';
          btn.classList.remove('copied');
        }, 1500);
      } catch {
        btn.textContent = '[ FAILED ]';
        setTimeout(() => { btn.textContent = '[ COPY ]'; }, 1500);
      }
    });
  });
}

function setStatus(el, text, type) {
  el.textContent = text;
  el.dataset.type = type;
}

function bindSendButton() {
  const btn    = document.getElementById('donate-send-btn');
  const emailEl = document.getElementById('donate-email-input');
  const nameEl  = document.getElementById('donate-name-input');
  const status  = document.getElementById('donate-send-status');
  if (!btn || !emailEl || !status) return;

  btn.addEventListener('click', async () => {
    const email = emailEl.value.trim();
    const name  = nameEl?.value.trim() ?? '';

    if (!email?.includes('@')) {
      setStatus(status, '> ERROR — enter a valid email address', 'error');
      emailEl.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = '[ SENDING... ]';
    setStatus(status, '> TRANSMITTING...', 'loading');

    try {
      const res = await fetch('/api/thank-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok) {
        setStatus(status, '> TRANSMISSION COMPLETE — check your inbox', 'success');
        btn.textContent = '[ SENT ✓ ]';
        emailEl.value = '';
        if (nameEl) nameEl.value = '';
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus(status, `> FAILED — ${data.error ?? 'try again later'}`, 'error');
        btn.disabled = false;
        btn.textContent = '[ SEND ]';
      }
    } catch {
      setStatus(status, '> NETWORK ERROR — check connection', 'error');
      btn.disabled = false;
      btn.textContent = '[ SEND ]';
    }
  });
}

export function openDonatePanel() {
  document.getElementById('donate-content').innerHTML = buildDonateHTML();
  bindCopyButtons();
  bindSendButton();
  document.getElementById('donate-panel').style.display = 'flex';
  document.getElementById('modal-overlay').style.display = 'block';
}

export function closeDonatePanel() {
  document.getElementById('donate-panel').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

export function initDonatePanel() {
  document.getElementById('close-donate-panel').addEventListener('click', closeDonatePanel);
}
