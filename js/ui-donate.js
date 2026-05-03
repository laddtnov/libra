// ── Replace these with your real values ───────────────────────────────────────
// Stripe: create a Payment Link at dashboard.stripe.com → Payment Links
// Product name: "Support Book.Archive"
// Description:  "Voluntary tip to support Book.Archive — a free personal reading tracker. No product is delivered."
const STRIPE_URL = 'https://buy.stripe.com/YOUR_STRIPE_LINK';

const ADDRESSES = {
  BTC: 'YOUR_BTC_ADDRESS',
  ETH: 'YOUR_ETH_ADDRESS',
  SOL: 'YOUR_SOL_ADDRESS',
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
      <div class="donate-tagline">&gt; Book.Archive is free and open-source.</div>
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

export function openDonatePanel() {
  document.getElementById('donate-content').innerHTML = buildDonateHTML();
  bindCopyButtons();
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
