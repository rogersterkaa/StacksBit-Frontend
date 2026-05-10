import { openContractCall } from '@stacks/connect';
import {
  stringUtf8CV, uintCV, noneCV, principalCV,
  stringAsciiCV, serializeCV, cvToHex
} from '@stacks/transactions';
// ============================================
// CONFIG
// ============================================
const CONTRACT_ADDR = 'ST3GTDAAVRPKHCC45FFW0540MPTDHGWWRMB5DS4Q0';
const GATEWAY = CONTRACT_ADDR + '.stacksbit-gateway';
const SBTC          = CONTRACT_ADDR + '.sbtc';
const EXPLORER_URL  = 'https://explorer.hiro.so/txid';
const API_URL       = 'https://api.testnet.hiro.so';

let userAddr = null;

// ============================================
// INJECT HTML
// ============================================
document.querySelector('#app').innerHTML = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0F1117;color:#F1F5F9;min-height:100vh;display:flex;font-size:14px}
.sidebar{width:220px;background:#1A1D27;border-right:1px solid rgba(255,255,255,0.07);height:100vh;position:fixed;display:flex;flex-direction:column;padding:1.25rem 0.875rem}
.logo{display:flex;align-items:center;gap:10px;padding:0.5rem 0.5rem 1.25rem;border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:0.5rem}
.logo-icon{width:32px;height:32px;background:linear-gradient(135deg,#F7931A,#FF6B00);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:16px}
.logo-text{font-size:16px;font-weight:800;color:white}
.logo-sub{font-size:10px;color:#475569}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;color:#94A3B8;font-size:13px;border:1px solid transparent;background:none;width:100%;text-align:left;transition:all 0.15s;margin-bottom:2px}
.nav-item:hover{background:rgba(255,255,255,0.05);color:#F1F5F9}
.nav-item.active{background:rgba(247,147,26,0.12);color:#F7931A;border-color:rgba(247,147,26,0.2)}
.nav-footer{margin-top:auto;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.07)}
.wallet-info{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:8px 10px;font-size:11px;color:#475569}
.main{margin-left:220px;flex:1;display:flex;flex-direction:column}
.topbar{background:rgba(15,17,23,0.9);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.07);padding:0 1.5rem;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.topbar-title{font-size:16px;font-weight:800}
.topbar-sub{font-size:12px;color:#94A3B8;margin-top:1px}
.topbar-right{display:flex;align-items:center;gap:10px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);color:#F1F5F9;transition:all 0.15s;font-family:inherit}
.btn:hover{background:rgba(255,255,255,0.08)}
.btn:active{transform:scale(0.97)}
.btn-primary{background:linear-gradient(135deg,#F7931A,#E08010);border-color:#F7931A;color:white;box-shadow:0 2px 8px rgba(247,147,26,0.3)}
.btn-primary:hover{box-shadow:0 4px 14px rgba(247,147,26,0.45);transform:translateY(-1px)}
.btn-success{background:linear-gradient(135deg,#10B981,#059669);border-color:#10B981;color:white;width:100%;padding:12px;font-size:14px;justify-content:center}
.btn-danger{background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3);color:#EF4444;width:100%;padding:12px;font-size:14px;justify-content:center}
.btn-block{width:100%;justify-content:center;padding:12px}
.btn-sm{padding:6px 12px;font-size:12px}
.page{padding:1.5rem;display:none;animation:fadeIn 0.2s ease}
.page.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.card{background:#1A1D27;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:1.25rem;transition:transform 0.2s,box-shadow 0.2s;margin-bottom:14px}
.card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}
.hero{background:linear-gradient(135deg,#1A1D27,#222536);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.75rem;margin-bottom:1.25rem;position:relative;overflow:hidden}
.hero::after{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(247,147,26,0.08),transparent 70%);border-radius:50%}
.hero-greeting{font-size:13px;color:#94A3B8;margin-bottom:5px}
.hero-name{font-size:24px;font-weight:900;margin-bottom:6px;background:linear-gradient(90deg,#fff,#94A3B8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-sub{font-size:13px;color:#94A3B8;margin-bottom:1.25rem}
.metric{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:1rem;transition:all 0.2s}
.metric:hover{background:rgba(255,255,255,0.05);transform:translateY(-2px)}
.metric-label{font-size:11px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px}
.metric-value{font-size:22px;font-weight:900;margin-bottom:2px}
.metric-sub{font-size:11px;color:#475569}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:12px;font-weight:700;color:#94A3B8;margin-bottom:6px}
.form-input{width:100%;padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#F1F5F9;font-size:13px;font-family:inherit;outline:none;transition:border-color 0.15s}
.form-input:focus{border-color:rgba(247,147,26,0.5);box-shadow:0 0 0 3px rgba(247,147,26,0.1)}
.form-input::placeholder{color:#475569}
.form-select{width:100%;padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#F1F5F9;font-size:13px;font-family:inherit;outline:none}
.form-select option{background:#1A1D27}
.form-hint{font-size:11px;color:#475569;margin-top:4px}
.alert{display:flex;gap:10px;padding:12px 14px;border-radius:8px;font-size:13px;margin-bottom:14px;border:1px solid}
.alert-info{background:rgba(59,130,246,0.08);border-color:rgba(59,130,246,0.2);color:#93C5FD}
.alert-success{background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.2);color:#6EE7B7}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}
.badge-green{background:rgba(16,185,129,0.12);color:#10B981;border:1px solid rgba(16,185,129,0.2)}
.badge-orange{background:rgba(247,147,26,0.12);color:#F7931A;border:1px solid rgba(247,147,26,0.2)}
.tx-item{display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:10px;margin-bottom:6px;cursor:pointer;transition:all 0.15s}
.tx-item:hover{background:rgba(255,255,255,0.05);transform:translateX(3px)}
.tx-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.tx-info{flex:1}
.tx-name{font-size:13px;font-weight:600}
.tx-meta{font-size:11px;color:#475569;margin-top:1px}
.progress-bar{height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-bottom:1.5rem;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#F7931A,#FF6B00);border-radius:2px;transition:width 0.3s}
.step-header{display:flex;justify-content:space-between;margin-bottom:6px}
.checkbox-group{display:flex;align-items:flex-start;gap:10px;padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;margin-bottom:14px;cursor:pointer}
.checkbox-group input{accent-color:#F7931A;margin-top:2px;flex-shrink:0}
.checkbox-text{font-size:12px;color:#94A3B8;line-height:1.6}
.success-state{text-align:center;padding:1.5rem 1rem}
.success-icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 1rem;animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)}
@keyframes popIn{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
.success-title{font-size:20px;font-weight:900;margin-bottom:6px}
.success-sub{font-size:13px;color:#94A3B8;line-height:1.6;margin-bottom:1.25rem}
.ussd-box{background:#0D1117;border-radius:10px;padding:1.25rem;font-family:monospace;font-size:12px;line-height:2;border:1px solid rgba(247,147,26,0.15)}
.connect-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center}
.connect-icon{font-size:64px;margin-bottom:1.25rem;animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.connect-title{font-size:22px;font-weight:900;margin-bottom:10px}
.connect-sub{font-size:14px;color:#94A3B8;max-width:340px;line-height:1.7;margin-bottom:1.5rem}
.divider{height:1px;background:rgba(255,255,255,0.07);margin:14px 0}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.sec-title{font-size:14px;font-weight:800}
.toast{position:fixed;bottom:20px;right:20px;background:#222536;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:11px 16px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.5);z-index:1000;display:none;align-items:center;gap:8px}
.toast.show{display:flex;animation:toastIn 0.2s ease}
@keyframes toastIn{from{transform:translateY(6px);opacity:0}to{transform:translateY(0);opacity:1}}
.dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.dot-green{background:#10B981}
.dot-orange{background:#F7931A;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}
</style>

<aside class="sidebar">
  <div class="logo">
    <div class="logo-icon">₿</div>
    <div>
      <div class="logo-text">StacksBit</div>
      <div class="logo-sub">Trust Layer · Africa</div>
    </div>
  </div>
  <button class="nav-item active" id="nav-dashboard">🏠 Dashboard</button>
  <button class="nav-item" id="nav-create">➕ Create Payment</button>
  <button class="nav-item" id="nav-pay">💳 Pay Invoice</button>
  <button class="nav-item" id="nav-register">🏪 Register Merchant</button>
  <button class="nav-item" id="nav-payments">📋 Transactions</button>
  <button class="nav-item" id="nav-risk">🛡️ Risk Panel</button>
  <div class="nav-footer">
    <div class="wallet-info">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <span class="dot dot-orange"></span>
        <span>Testnet</span>
      </div>
      <div id="nav-addr" style="font-family:monospace;font-size:10px">Not connected</div>
    </div>
  </div>
</aside>

<div class="main">
  <header class="topbar">
    <div>
      <div class="topbar-title" id="page-title">Dashboard</div>
      <div class="topbar-sub" id="page-sub">Connect wallet to get started</div>
    </div>
    <div class="topbar-right">
      <span class="badge badge-orange">Testnet</span>
      <button class="btn btn-primary btn-sm" id="wallet-btn">🔗 Connect Wallet</button>
    </div>
  </header>

  <!-- DASHBOARD -->
  <div class="page active" id="page-dashboard">
    <div id="disconnected-view">
      <div class="connect-screen">
        <div class="connect-icon">₿</div>
        <div class="connect-title">Welcome to StacksBit</div>
        <div class="connect-sub">Connect your Leather wallet to start accepting Bitcoin payments with trustless escrow.</div>
        <button class="btn btn-primary" style="padding:13px 28px;font-size:14px" id="connect-main-btn">🔗 Connect Leather Wallet</button>
        <div style="font-size:11px;color:#475569;margin-top:10px">Non-custodial · Stacks Testnet · Free</div>
      </div>
    </div>
    <div id="connected-view" style="display:none">
      <div class="hero">
        <div class="hero-greeting">👋 Welcome back</div>
        <div class="hero-name" id="hero-addr">Loading...</div>
        <div class="hero-sub">Connected to Stacks Testnet. Ready to accept Bitcoin payments.</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" id="hero-create-btn">➕ Create Payment</button>
          <button class="btn btn-sm" id="hero-tx-btn">📋 Transactions</button>
        </div>
      </div>
      <div class="g4">
        <div class="metric">
          <div class="metric-label">STX Balance</div>
          <div class="metric-value" id="stx-bal" style="color:#F7931A">--</div>
          <div class="metric-sub">Testnet STX</div>
        </div>
        <div class="metric">
          <div class="metric-label">Merchant Status</div>
          <div class="metric-value" id="merch-status" style="font-size:14px">Checking...</div>
          <div class="metric-sub" id="merch-id">--</div>
        </div>
        <div class="metric">
          <div class="metric-label">Contracts Live</div>
          <div class="metric-value" style="color:#10B981">9</div>
          <div class="metric-sub">On Stacks Testnet</div>
        </div>
        <div class="metric">
          <div class="metric-label">Unit Tests</div>
          <div class="metric-value" style="color:#10B981">31</div>
          <div class="metric-sub">All passing</div>
        </div>
      </div>
      <div class="alert alert-info"><span>ℹ️</span><div>You are on <strong>Stacks Testnet</strong>. All transactions use test STX — no real money.</div></div>
      <div class="g3">
        <div class="card" style="cursor:pointer" id="dash-register"><div style="font-size:28px;margin-bottom:10px">🏪</div><div style="font-weight:700;margin-bottom:6px">Register Merchant</div><div style="font-size:12px;color:#94A3B8">Set up your account to start accepting payments.</div></div>
        <div class="card" style="cursor:pointer" id="dash-create"><div style="font-size:28px;margin-bottom:10px">➕</div><div style="font-weight:700;margin-bottom:6px">Create Payment</div><div style="font-size:12px;color:#94A3B8">Generate a payment request for your customer.</div></div>
        <div class="card" style="cursor:pointer" id="dash-risk"><div style="font-size:28px;margin-bottom:10px">🛡️</div><div style="font-weight:700;margin-bottom:6px">Risk Panel</div><div style="font-size:12px;color:#94A3B8">View trust scores and fraud detection.</div></div>
      </div>
    </div>
  </div>

  <!-- REGISTER -->
  <div class="page" id="page-register">
    <div style="max-width:480px">
      <div id="reg-form-wrap">
        <div class="step-header">
          <span style="font-size:12px;color:#94A3B8" id="step-label">Step 1 of 2 — Business Info</span>
          <span style="font-size:12px;font-weight:700;color:#F7931A" id="step-pct">50%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" id="step-bar" style="width:50%"></div></div>
        <div class="card" id="step1">
          <div class="alert alert-info"><span>🔒</span><div>Free to register. Non-custodial — your funds stay yours.</div></div>
          <div class="form-group"><label class="form-label">Business Name</label><input class="form-input" type="text" placeholder="e.g. Lagos Coffee Shop" id="r-name"></div>
          <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" type="email" placeholder="shop@business.com" id="r-email"></div>
          <button class="btn btn-primary btn-block" id="step2-btn">Continue →</button>
        </div>
        <div class="card" id="step2" style="display:none">
          <div class="form-group"><label class="form-label">Business Type</label>
            <select class="form-select" id="r-type">
              <option value="">Select type...</option>
              <option>Food & Beverages</option>
              <option>Fashion & Clothing</option>
              <option>Electronics & Tech</option>
              <option>Services & Freelance</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Connected Wallet</label><input class="form-input" id="r-wallet" readonly style="opacity:0.6"><div class="form-hint">Auto-filled from your Leather wallet</div></div>
          <div class="checkbox-group"><input type="checkbox" id="agree"><label for="agree" class="checkbox-text"><strong>I understand StacksBit is non-custodial.</strong> Funds are held in smart contracts, never in a company wallet.</label></div>
          <button class="btn btn-primary btn-block" id="reg-btn">🏪 Register on Stacks Testnet</button>
          <button class="btn btn-block" style="margin-top:8px" id="back-btn">← Back</button>
        </div>
      </div>
      <div class="card" id="reg-success" style="display:none">
        <div class="success-state">
          <div class="success-icon" style="background:rgba(16,185,129,0.12);border:2px solid rgba(16,185,129,0.3)">🎉</div>
          <div class="success-title">Merchant Registered!</div>
          <div class="success-sub">Transaction broadcast to Stacks testnet. You can now create payment requests.</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;color:#94A3B8">Business</span><span style="font-size:12px;font-weight:700" id="reg-biz">--</span></div>
          <div style="display:flex;justify-content:space-between"><span style="font-size:12px;color:#94A3B8">TX</span><a id="reg-tx" href="#" target="_blank" style="font-size:11px;color:#F7931A">View on Explorer →</a></div>
        </div>
        <button class="btn btn-primary btn-block" id="reg-goto-create">➕ Create First Payment</button>
      </div>
    </div>
  </div>

  <!-- CREATE PAYMENT -->
  <div class="page" id="page-create">
    <div style="max-width:500px">
      <div class="alert alert-info"><span>🔒</span><div>Funds go into non-custodial smart contract escrow. StacksBit never holds your money.</div></div>
      <div class="card" id="create-form">
        <div class="form-group"><label class="form-label">Amount (sBTC)</label><input class="form-input" type="number" placeholder="0.001" id="c-amount"><div class="form-hint">Platform fee: 2.5%</div></div>
        <div class="form-group"><label class="form-label">Description</label><input class="form-input" type="text" placeholder="e.g. Coffee x2, Phone repair" id="c-desc"></div>
        <div class="form-group"><label class="form-label">Settlement</label>
          <select class="form-select" id="c-settle"><option value="btc">Receive sBTC</option><option value="ngn">Receive NGN via Paystack</option></select>
        </div>
        <div id="fee-preview" style="display:none;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:12px;margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px"><span style="color:#94A3B8">Amount</span><span id="fp-amt" style="font-weight:700">--</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px"><span style="color:#94A3B8">Fee (2.5%)</span><span id="fp-fee" style="color:#EF4444;font-weight:700">--</span></div>
          <div class="divider" style="margin:8px 0"></div>
          <div style="display:flex;justify-content:space-between;font-size:12px"><span style="font-weight:700">You receive</span><span id="fp-out" style="color:#10B981;font-weight:700">--</span></div>
        </div>
        <button class="btn btn-primary btn-block" id="create-btn">🔗 Create Payment Request</button>
      </div>
      <div class="card" id="create-success" style="display:none">
        <div class="success-state">
          <div class="success-icon" style="background:rgba(16,185,129,0.12);border:2px solid rgba(16,185,129,0.3)">✅</div>
          <div class="success-title">Payment Created!</div>
          <div class="success-sub">Transaction broadcast. Share the payment ID with your customer.</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;color:#94A3B8">TX Status</span><span style="font-size:11px;background:rgba(245,158,11,0.12);color:#F59E0B;padding:2px 8px;border-radius:4px">⏳ Pending</span></div>
          <div style="display:flex;justify-content:space-between"><span style="font-size:12px;color:#94A3B8">TX ID</span><a id="create-tx" href="#" target="_blank" style="font-size:11px;color:#F7931A">View on Explorer →</a></div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn" style="flex:1" id="new-payment-btn">New Payment</button>
          <button class="btn" style="flex:1" id="goto-pay-btn">Pay Invoice →</button>
        </div>
      </div>
    </div>
  </div>

  <!-- PAY INVOICE -->
  <div class="page" id="page-pay">
    <div style="max-width:420px;margin:0 auto">
      <div class="card">
        <div class="form-group"><label class="form-label">Payment ID</label><input class="form-input" type="number" placeholder="Enter payment ID e.g. 1" id="p-id"></div>
        <button class="btn btn-primary btn-block" id="pay-btn">💳 Pay Invoice</button>
      </div>
      <div class="card" id="pay-success" style="display:none">
        <div class="success-state">
          <div class="success-icon" style="background:rgba(247,147,26,0.12);border:2px solid rgba(247,147,26,0.3)">🔒</div>
          <div class="success-title">Payment Sent!</div>
          <div class="success-sub">Funds locked in smart contract escrow. Confirm delivery when order arrives.</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;color:#94A3B8">Status</span><span style="font-size:11px;background:rgba(247,147,26,0.12);color:#F7931A;padding:2px 8px;border-radius:4px">Locked in Escrow</span></div>
          <div style="display:flex;justify-content:space-between"><span style="font-size:12px;color:#94A3B8">Auto-refund</span><span style="font-size:12px;font-weight:700">~24 hours</span></div>
        </div>
        <button class="btn btn-success" id="confirm-btn">✅ Confirm Delivery</button>
        <button class="btn btn-danger" style="margin-top:8px" id="dispute-btn">⚠️ Raise Dispute</button>
      </div>
    </div>
  </div>

  <!-- TRANSACTIONS -->
  <div class="page" id="page-payments">
    <div class="alert alert-info"><span>ℹ️</span><div>Live transaction history from Stacks blockchain.</div></div>
    <div id="tx-container"><div style="text-align:center;padding:40px;color:#94A3B8">Connect wallet to load transactions.</div></div>
  </div>

  <!-- RISK PANEL -->
  <div class="page" id="page-risk">
    <div class="g3">
      <div class="card" style="border-top:2px solid #10B981"><div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;margin-bottom:8px">🟢 Green Zone</div><div style="font-size:30px;font-weight:900;color:#10B981">0 — 39</div><div style="font-size:12px;color:#94A3B8;margin-top:8px;line-height:1.6">Safe merchant. Auto-release enabled.</div></div>
      <div class="card" style="border-top:2px solid #F59E0B"><div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;margin-bottom:8px">🟡 Yellow Zone</div><div style="font-size:30px;font-weight:900;color:#F59E0B">40 — 69</div><div style="font-size:12px;color:#94A3B8;margin-top:8px;line-height:1.6">USSD confirmation required.</div></div>
      <div class="card" style="border-top:2px solid #EF4444"><div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;margin-bottom:8px">🔴 Red Zone</div><div style="font-size:30px;font-weight:900;color:#EF4444">70 — 100</div><div style="font-size:12px;color:#94A3B8;margin-top:8px;line-height:1.6">Blocked. Manual review required.</div></div>
    </div>
    <div class="card">
      <div style="font-size:14px;font-weight:800;margin-bottom:8px">📱 Offline USSD Confirmation</div>
      <div style="font-size:12px;color:#94A3B8;margin-bottom:1rem">No internet required. Works on any phone in Nigeria.</div>
      <div class="ussd-box">
        <div style="color:#666">Dial: <span style="color:#F7931A;font-weight:700">*384#</span></div>
        <div style="color:#ccc">&gt; 1. Confirm Delivery</div>
        <div style="color:#ccc">Enter Payment ID: <span style="color:#F7931A">1</span></div>
        <div style="color:#ccc">Enter Code: <span style="color:#F7931A">583640</span></div>
        <div style="color:#10B981;margin-top:8px;font-weight:700">END Delivery Confirmed!</div>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"><span id="t-icon">✅</span><span id="t-msg">Done!</span></div>
`;
console.log('step2-btn exists:', document.getElementById('step2-btn'));

// ============================================
// NAVIGATION
// ============================================
const PAGES = { dashboard:'Dashboard', create:'Create Payment', pay:'Pay Invoice', register:'Register Merchant', payments:'Transactions', risk:'Risk Panel' };

function nav(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.getElementById('page-title').textContent = PAGES[id] || id;
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  if (id === 'payments' && userAddr) loadTxs();
}

// Nav buttons
['dashboard','create','pay','register','payments','risk'].forEach(id => {
  document.getElementById('nav-' + id).addEventListener('click', () => nav(id));
});
document.getElementById('dash-register').addEventListener('click', () => nav('register'));
document.getElementById('dash-create').addEventListener('click', () => nav('create'));
document.getElementById('dash-risk').addEventListener('click', () => nav('risk'));
document.getElementById('hero-create-btn').addEventListener('click', () => nav('create'));
document.getElementById('hero-tx-btn').addEventListener('click', () => nav('payments'));
document.getElementById('reg-goto-create').addEventListener('click', () => nav('create'));
document.getElementById('new-payment-btn').addEventListener('click', resetCreate);
document.getElementById('goto-pay-btn').addEventListener('click', () => nav('pay'));

// ============================================
// TOAST
// ============================================
function toast(icon, msg) {
  const t = document.getElementById('toast');
  document.getElementById('t-icon').textContent = icon;
  document.getElementById('t-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ============================================
// WALLET CONNECTION
// ============================================
async function connectWallet() {
  const provider = window.LeatherProvider || window.StacksProvider;
  if (!provider) {
    toast('⚠️', 'Please install Leather Wallet');
    setTimeout(() => window.open('https://leather.io', '_blank'), 1500);
    return;
  }
  try {
    const res = await provider.request('getAddresses');
    const stxAddr = res?.result?.addresses?.find(a => a.address?.startsWith('ST'));
    if (stxAddr) {
      setConnected(stxAddr.address);
    } else {
      toast('❌', 'No Stacks address found');
    }
  } catch (err) {
    toast('❌', 'Connection failed: ' + err.message);
  }
}

function setConnected(address) {
  userAddr = address;
  const short = address.slice(0, 8) + '...' + address.slice(-6);
  document.getElementById('wallet-btn').textContent = short;
  document.getElementById('wallet-btn').className = 'btn btn-sm badge-green';
  document.getElementById('page-sub').textContent = short + ' · Testnet';
  document.getElementById('nav-addr').textContent = short;
  document.getElementById('hero-addr').textContent = short;
  document.getElementById('r-wallet').value = address;
  document.getElementById('disconnected-view').style.display = 'none';
  document.getElementById('connected-view').style.display = 'block';
  loadBalance(address);
  checkMerchant(address);
  toast('✅', 'Wallet connected!');
}

document.getElementById('wallet-btn').addEventListener('click', connectWallet);
document.getElementById('connect-main-btn').addEventListener('click', connectWallet);

// Auto-reconnect
window.addEventListener('load', async () => {
  const provider = window.LeatherProvider || window.StacksProvider;
  if (!provider) return;
  try {
    const res = await provider.request('getAddresses');
    const stxAddr = res?.result?.addresses?.find(a => a.address?.startsWith('ST'));
    if (stxAddr) setConnected(stxAddr.address);
  } catch {}
});

// ============================================
// BALANCE & MERCHANT CHECK
// ============================================
async function loadBalance(address) {
  try {
    const res = await fetch(API_URL + '/v2/accounts/' + address + '?proof=0');
    const data = await res.json();
    const stx = parseInt(data.balance, 16) / 1_000_000;
    document.getElementById('stx-bal').textContent = stx.toFixed(2) + ' STX';
  } catch { document.getElementById('stx-bal').textContent = 'Error'; }
}

async function checkMerchant(address) {
  try {
    const res = await fetch(API_URL + '/v2/contracts/call-read/' + CONTRACT_ADDR + '/stacksbit-merchants/get-merchant-id-by-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: address, arguments: [] })
    });
    const data = await res.json();
    const el = document.getElementById('merch-status');
    const sub = document.getElementById('merch-id');
    if (data.result && data.result !== '0x09' && data.result !== '0x09null') {
      el.textContent = '✅ Registered'; el.style.color = '#10B981';
      sub.textContent = 'Merchant ID: ' + data.result;
    } else {
      el.textContent = 'Not Registered'; el.style.color = '#94A3B8';
      sub.textContent = 'Register to accept payments';
    }
  } catch { document.getElementById('merch-status').textContent = 'Unknown'; }
}

// ============================================
// CONTRACT CALL — using @stacks/connect request
// ============================================
async function callContract(contractAddress, contractName, functionName, clarityArgs) {
  return new Promise((resolve, reject) => {
    openContractCall({
      contractAddress,
      contractName,
      functionName,
      functionArgs: clarityArgs,
      network: 'testnet',
      appDetails: { name: 'StacksBit', icon: '' },
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('Cancelled')),
    });
  });
}

// ============================================
// REGISTER MERCHANT
// ============================================
document.getElementById('step2-btn').addEventListener('click', () => {
  const name = document.getElementById('r-name').value;
  const email = document.getElementById('r-email').value;
  if (!name || !email) { toast('⚠️', 'Please fill in all fields'); return; }
  document.getElementById('step1').style.display = 'none';
  document.getElementById('step2').style.display = 'block';
  document.getElementById('step-bar').style.width = '100%';
  document.getElementById('step-label').textContent = 'Step 2 of 2 — Wallet & Preferences';
  document.getElementById('step-pct').textContent = '100%';
  document.getElementById('r-wallet').value = userAddr || '';
});

document.getElementById('back-btn').addEventListener('click', () => {
  document.getElementById('step2').style.display = 'none';
  document.getElementById('step1').style.display = 'block';
  document.getElementById('step-bar').style.width = '50%';
  document.getElementById('step-label').textContent = 'Step 1 of 2 — Business Info';
  document.getElementById('step-pct').textContent = '50%';
});

document.getElementById('reg-btn').addEventListener('click', async () => {
  if (!userAddr) { toast('⚠️', 'Connect wallet first'); return; }
  if (!document.getElementById('agree').checked) { toast('⚠️', 'Accept the terms'); return; }
  if (!document.getElementById('r-type').value) { toast('⚠️', 'Select business type'); return; }

  const name  = document.getElementById('r-name').value;
  const email = document.getElementById('r-email').value;
  const btn   = document.getElementById('reg-btn');
  btn.textContent = '⏳ Waiting for wallet...';
  btn.disabled = true;

  try {
    const [addr, cname] = GATEWAY.split('.');
    const txId = await callContract(addr, cname, 'register-merchant', [
      stringUtf8CV(name),
      stringUtf8CV(email)
    ]);
    document.getElementById('reg-form-wrap').style.display = 'none';
    document.getElementById('reg-success').style.display = 'block';
    document.getElementById('reg-biz').textContent = name;
    const txLink = document.getElementById('reg-tx');
    txLink.href = EXPLORER_URL + '/' + txId + '?chain=testnet';
    txLink.textContent = txId.slice(0, 14) + '... →';
    toast('🎉', 'Merchant registered!');
  } catch (err) {
    console.error('Register error:', err);
    toast('❌', err.message || 'Unknown error');
    btn.textContent = '🏪 Register on Stacks Testnet';
    btn.disabled = false;
  }
});

// ============================================
// CREATE PAYMENT
// ============================================
document.getElementById('c-amount').addEventListener('input', () => {
  const amount = parseFloat(document.getElementById('c-amount').value) || 0;
  const box = document.getElementById('fee-preview');
  if (amount > 0) {
    box.style.display = 'block';
    const fee = amount * 0.025;
    document.getElementById('fp-amt').textContent = amount.toFixed(5) + ' sBTC';
    document.getElementById('fp-fee').textContent = '-' + fee.toFixed(5) + ' sBTC';
    document.getElementById('fp-out').textContent = (amount - fee).toFixed(5) + ' sBTC';
  } else { box.style.display = 'none'; }
});

document.getElementById('create-btn').addEventListener('click', async () => {
  if (!userAddr) { toast('⚠️', 'Connect wallet first'); return; }
  const amount = document.getElementById('c-amount').value;
  const desc   = document.getElementById('c-desc').value;
  if (!amount || amount <= 0) { toast('⚠️', 'Enter a valid amount'); return; }
  if (!desc) { toast('⚠️', 'Enter a description'); return; }

  const amountMicro = Math.floor(parseFloat(amount) * 100_000_000);
  const [addr, cname] = GATEWAY.split('.');

  try {
    const txId = await callContract(addr, cname, 'create-payment-request', [
      uintCV(amountMicro),
      principalCV(SBTC),
      stringUtf8CV(desc),
      noneCV()
    ]);
    document.getElementById('create-form').style.display = 'none';
    document.getElementById('create-success').style.display = 'block';
    const txLink = document.getElementById('create-tx');
    txLink.href = EXPLORER_URL + '/' + txId + '?chain=testnet';
    txLink.textContent = txId.slice(0, 14) + '... →';
    toast('✅', 'Payment created!');
  } catch (err) {
    toast('❌', err.message || 'Unknown error');
  }
});

function resetCreate() {
  document.getElementById('create-form').style.display = 'block';
  document.getElementById('create-success').style.display = 'none';
  document.getElementById('c-amount').value = '';
  document.getElementById('c-desc').value = '';
  document.getElementById('fee-preview').style.display = 'none';
}

// ============================================
// PAY INVOICE
// ============================================
document.getElementById('pay-btn').addEventListener('click', async () => {
  if (!userAddr) { toast('⚠️', 'Connect wallet first'); return; }
  const payId = document.getElementById('p-id').value;
  if (!payId) { toast('⚠️', 'Enter a payment ID'); return; }
  const [addr, cname] = GATEWAY.split('.');
  try {
    await callContract(addr, cname, 'pay-invoice', [
      uintCV(parseInt(payId)),
      principalCV(SBTC),
      noneCV()
    ]);
    document.getElementById('pay-success').style.display = 'block';
    toast('🔒', 'Funds locked in escrow!');
  } catch (err) { toast('❌', err.message || 'Unknown error'); }
});

document.getElementById('confirm-btn').addEventListener('click', async () => {
  if (!userAddr) { toast('⚠️', 'Connect wallet first'); return; }
  const payId = document.getElementById('p-id').value;
  const [addr, cname] = GATEWAY.split('.');
  try {
    await callContract(addr, cname, 'confirm-delivery', [
      uintCV(parseInt(payId)),
      principalCV(SBTC)
    ]);
    toast('🎉', 'Delivery confirmed — funds released!');
    document.getElementById('pay-success').innerHTML = '<div class="success-state"><div class="success-icon" style="background:rgba(16,185,129,0.12);border:2px solid rgba(16,185,129,0.3)">🎉</div><div class="success-title">Delivery Confirmed!</div><div class="success-sub">Funds released to merchant.</div></div>';
  } catch (err) { toast('❌', err.message || 'Unknown error'); }
});

document.getElementById('dispute-btn').addEventListener('click', async () => {
  if (!userAddr) { toast('⚠️', 'Connect wallet first'); return; }
  const payId = document.getElementById('p-id').value;
  const [addr, cname] = GATEWAY.split('.');
  try {
    await callContract(addr, cname, 'raise-dispute', [ uintCV(parseInt(payId)) ]);
    toast('⚠️', 'Dispute raised — funds protected');
  } catch (err) { toast('❌', err.message || 'Unknown error'); }
});

// ============================================
// TRANSACTIONS
// ============================================
async function loadTxs() {
  if (!userAddr) return;
  const c = document.getElementById('tx-container');
  c.innerHTML = '<div style="text-align:center;padding:40px;color:#94A3B8">Loading...</div>';
  try {
    const res  = await fetch(API_URL + '/extended/v1/address/' + userAddr + '/transactions?limit=20');
    const data = await res.json();
    const txs  = data.results || [];
    if (!txs.length) { c.innerHTML = '<div style="text-align:center;padding:40px;color:#94A3B8">No transactions yet.</div>'; return; }
    c.innerHTML = txs.map(tx => {
      const ok   = tx.tx_status === 'success';
      const name = tx.contract_call?.function_name || tx.tx_type || 'Transaction';
      const short = tx.tx_id.slice(0, 14) + '...';
      const time  = new Date(tx.burn_block_time_iso || Date.now()).toLocaleString();
      return `<div class="tx-item" onclick="window.open('${EXPLORER_URL}/${tx.tx_id}?chain=testnet','_blank')">
        <div class="tx-icon" style="background:rgba(255,255,255,0.04)">${ok ? '✅' : '❌'}</div>
        <div class="tx-info"><div class="tx-name">${name}</div><div class="tx-meta">${short} · ${time}</div></div>
        <div style="font-size:11px;font-weight:700;color:${ok ? '#10B981' : '#EF4444'}">${tx.tx_status}</div>
      </div>`;
    }).join('');
  } catch { c.innerHTML = '<div style="text-align:center;padding:40px;color:#EF4444">Failed to load.</div>'; }
}