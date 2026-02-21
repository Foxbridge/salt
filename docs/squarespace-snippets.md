# Squarespace Snippets (Copy/Paste)

## Global header CSS

```html
<style>
  :root{
    --fx-bg: #070A12;
    --fx-panel: #0B1220;
    --fx-border: rgba(255,255,255,.10);
    --fx-text: rgba(255,255,255,.92);
    --fx-muted: rgba(255,255,255,.68);
    --fx-accent: #7AA2FF;
    --fx-accent2:#41D1B6;
    --fx-danger:#FF5C7A;
    --fx-radius: 16px;
    --fx-shadow: 0 10px 40px rgba(0,0,0,.35);
    --fx-max: 1120px;
  }

  body{
    background: var(--fx-bg);
    color: var(--fx-text);
  }

  .fx-wrap{ max-width: var(--fx-max); margin: 0 auto; padding: 24px; }
  .fx-card{
    background: var(--fx-panel);
    border: 1px solid var(--fx-border);
    border-radius: var(--fx-radius);
    box-shadow: var(--fx-shadow);
    padding: 22px;
  }

  .fx-h1{ font-size: 40px; line-height: 1.1; letter-spacing: -.02em; margin: 0 0 10px; }
  .fx-h2{ font-size: 22px; line-height: 1.2; margin: 0 0 10px; }
  .fx-p{ color: var(--fx-muted); line-height: 1.6; margin: 0 0 14px; }

  .fx-row{ display: grid; grid-template-columns: 1.2fr .8fr; gap: 16px; align-items: start; }
  @media (max-width: 820px){ .fx-row{ grid-template-columns: 1fr; } }

  .fx-btn{
    display:inline-flex; gap:10px; align-items:center; justify-content:center;
    padding: 12px 16px;
    border-radius: 14px;
    border: 1px solid var(--fx-border);
    text-decoration:none;
    color: var(--fx-text);
    background: rgba(255,255,255,.04);
    transition: transform .08s ease, background .15s ease;
    font-weight: 600;
  }
  .fx-btn:hover{ transform: translateY(-1px); background: rgba(255,255,255,.07); }
  .fx-btn-primary{ background: linear-gradient(135deg, rgba(122,162,255,.25), rgba(65,209,182,.12)); border-color: rgba(122,162,255,.35); }
  .fx-pill{
    display:inline-flex; align-items:center; gap:8px;
    border:1px solid var(--fx-border); border-radius:999px; padding:8px 12px;
    color: var(--fx-muted);
    background: rgba(255,255,255,.03);
    font-size: 13px;
  }
  .fx-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  @media (max-width: 820px){ .fx-grid{ grid-template-columns: 1fr; } }

  .fx-input, .fx-select, .fx-textarea{
    width:100%;
    background: rgba(255,255,255,.03);
    border: 1px solid var(--fx-border);
    color: var(--fx-text);
    border-radius: 12px;
    padding: 12px 12px;
    outline: none;
  }
  .fx-textarea{ min-height: 110px; resize: vertical; }
  .fx-label{ font-size: 13px; color: var(--fx-muted); margin: 10px 0 6px; display:block; }

  .fx-small{ font-size: 12px; color: var(--fx-muted); }
</style>
```

## Global footer JS

Replace `YOUR_WORKER_URL` with your deployed Worker URL.

```html
<script>
  window.FOXBRIDGE = {
    apiBase: "YOUR_WORKER_URL"
  };

  async function fxPost(path, payload){
    try{
      const r = await fetch(window.FOXBRIDGE.apiBase + path, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload || {})
      });
      return await r.json();
    }catch(e){
      return { ok:false, error:String(e) };
    }
  }

  function fxGetEmail(){
    return (localStorage.getItem("fx_email") || "").toLowerCase();
  }
  function fxSetEmail(email){
    localStorage.setItem("fx_email", (email||"").toLowerCase());
  }

  async function fxLog(event, meta){
    const payload = {
      event,
      email: fxGetEmail(),
      page: location.href,
      meta: meta || {}
    };
    return fxPost("/api/event", payload);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const portalMarker = document.querySelector("[data-fx-portal='true']");
    if(portalMarker){
      fxLog("login", { pageType: "portal" });
    }
  });

  window.fxLog = fxLog;
  window.fxPost = fxPost;
  window.fxSetEmail = fxSetEmail;
  window.fxGetEmail = fxGetEmail;
</script>
```

## Home hero block

```html
<div class="fx-wrap">
  <div class="fx-row">
    <div class="fx-card">
      <div class="fx-pill">Foxbridge Trade Desk • Structured U.S. Commercial Interface</div>
      <h1 class="fx-h1">Direct sovereign-origin supply. Controlled access. Institutional execution.</h1>
      <p class="fx-p">
        Foxbridge coordinates U.S. market engagement for container-scale edible salt supply sourced from Pakistan Mineral Development Corporation (PMDC).
      </p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
        <a class="fx-btn fx-btn-primary" href="/rfq">Request Structured Evaluation</a>
        <a class="fx-btn" href="/supply-verification">View Supply Verification</a>
        <a class="fx-btn" href="https://www.pmdc.gov.pk/" target="_blank" rel="noopener">Source: PMDC</a>
      </div>
      <p class="fx-small" style="margin-top:14px;">
        Pilot pricing is validation-only. Recurring commercial terms are established after quality verification and clearance performance.
      </p>
    </div>

    <div class="fx-card">
      <h2 class="fx-h2">What buyers get</h2>
      <div class="fx-grid">
        <div class="fx-card" style="padding:14px;">
          <b>Verification</b>
          <div class="fx-small">Controlled document access and audit trail.</div>
        </div>
        <div class="fx-card" style="padding:14px;">
          <b>Compliance</b>
          <div class="fx-small">COA, traceability, and inspection coordination.</div>
        </div>
        <div class="fx-card" style="padding:14px;">
          <b>Execution</b>
          <div class="fx-small">Tri-party shipment confirmations with PMDC signatory.</div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>fxLog("document_view",{page:"home"});</script>
```

## RFQ page block

```html
<div class="fx-wrap">
  <div class="fx-card">
    <h2 class="fx-h2">Request for Quotation (RFQ)</h2>
    <p class="fx-p">Institutional buyers only. Container-scale inquiries. All submissions are logged and reviewed.</p>

    <label class="fx-label">Email</label>
    <input class="fx-input" id="fx_email" placeholder="name@company.com"/>

    <label class="fx-label">Company</label>
    <input class="fx-input" id="fx_company" placeholder="Company name"/>

    <div class="fx-row" style="grid-template-columns:1fr 1fr;">
      <div>
        <label class="fx-label">Product</label>
        <select class="fx-select" id="fx_product">
          <option>Edible Pink Salt</option>
          <option>Industrial Salt</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label class="fx-label">Incoterm</label>
        <select class="fx-select" id="fx_incoterm">
          <option>CFR NY/NJ</option>
          <option>FOB Karachi</option>
          <option>Other</option>
        </select>
      </div>
    </div>

    <div class="fx-row" style="grid-template-columns:1fr 1fr;">
      <div>
        <label class="fx-label">Granulation</label>
        <input class="fx-input" id="fx_gran" placeholder="e.g., 2–5mm / fine / powder"/>
      </div>
      <div>
        <label class="fx-label">Quantity (MT)</label>
        <input class="fx-input" id="fx_qty" type="number" placeholder="e.g., 25"/>
      </div>
    </div>

    <label class="fx-label">Target delivery date</label>
    <input class="fx-input" id="fx_date" type="date"/>

    <label class="fx-label">Notes</label>
    <textarea class="fx-textarea" id="fx_notes" placeholder="Use case, destination, packaging, compliance requirements..."></textarea>

    <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
      <button class="fx-btn fx-btn-primary" id="fx_submit">Submit RFQ</button>
      <span class="fx-small" id="fx_status"></span>
    </div>
  </div>
</div>

<script>
  document.getElementById("fx_submit").addEventListener("click", async () => {
    const email = (document.getElementById("fx_email").value || "").trim().toLowerCase();
    if(!email){ document.getElementById("fx_status").textContent = "Email required."; return; }

    fxSetEmail(email);

    const payload = {
      email,
      company: document.getElementById("fx_company").value || "",
      product: document.getElementById("fx_product").value || "",
      incoterm: document.getElementById("fx_incoterm").value || "",
      granulation: document.getElementById("fx_gran").value || "",
      quantityMT: Number(document.getElementById("fx_qty").value || 0),
      targetDelivery: document.getElementById("fx_date").value || "",
      notes: document.getElementById("fx_notes").value || "",
      page: location.href
    };

    document.getElementById("fx_status").textContent = "Submitting...";
    const res = await fxPost("/api/rfq", payload);
    if(res.ok){
      document.getElementById("fx_status").textContent = "RFQ received. We will respond through established channels.";
    }else{
      document.getElementById("fx_status").textContent = "Error submitting RFQ.";
    }
  });

  fxLog("document_view",{page:"rfq"});
</script>
```

## Portal marker (put at top of each portal page)

```html
<div data-fx-portal="true"></div>
```

## Compliance packet tracking cards

```html
<div class="fx-wrap">
  <div class="fx-card">
    <h2 class="fx-h2">Compliance Packet</h2>
    <p class="fx-p">Access is logged. For audit review, request full packet through RFQ.</p>

    <div class="fx-grid">
      <div class="fx-card" style="padding:14px;">
        <b>FSMA-Style Quality Framework</b>
        <p class="fx-small">Traceability, lot controls, documentation hierarchy.</p>
        <a class="fx-btn" href="PASTE_DOC_URL_HERE" target="_blank" rel="noopener"
           onclick="fxLog('document_view',{documentKey:'FSMA_FRAMEWORK'})">View</a>
      </div>

      <div class="fx-card" style="padding:14px;">
        <b>Sample COA Viewer</b>
        <p class="fx-small">Lot-based access, controlled downloads.</p>
        <a class="fx-btn" href="PASTE_DOC_URL_HERE" target="_blank" rel="noopener"
           onclick="fxLog('document_view',{documentKey:'COA_SAMPLE'})">View</a>
      </div>

      <div class="fx-card" style="padding:14px;">
        <b>Packaging & Labeling Spec</b>
        <p class="fx-small">Supersacks, palletization, markings.</p>
        <a class="fx-btn" href="PASTE_DOC_URL_HERE" target="_blank" rel="noopener"
           onclick="fxLog('document_view',{documentKey:'PACKAGING_SPEC'})">View</a>
      </div>
    </div>
  </div>
</div>
```

## AI documentation assistant widget

```html
<div class="fx-wrap">
  <div class="fx-card">
    <h2 class="fx-h2">AI Documentation Assistant</h2>
    <p class="fx-p">Ask a compliance or documentation question. If you reference a document, include its title.</p>

    <label class="fx-label">Your email (once per device)</label>
    <input class="fx-input" id="qa_email" placeholder="name@company.com"/>

    <label class="fx-label">Question</label>
    <textarea class="fx-textarea" id="qa_q" placeholder="e.g., Provide the compliance packet list for FSMA-style review, and what’s missing for U.S. distributor onboarding."></textarea>

    <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
      <button class="fx-btn fx-btn-primary" id="qa_btn">Ask</button>
      <span class="fx-small" id="qa_status"></span>
    </div>

    <div class="fx-card" style="margin-top:14px; padding:14px;">
      <div class="fx-small" style="margin-bottom:6px;">Response</div>
      <div id="qa_a" style="white-space:pre-wrap;"></div>
    </div>
  </div>
</div>

<script>
  document.getElementById("qa_btn").addEventListener("click", async () => {
    const email = (document.getElementById("qa_email").value || "").trim().toLowerCase();
    const q = (document.getElementById("qa_q").value || "").trim();
    if(!q){ document.getElementById("qa_status").textContent = "Question required."; return; }

    if(email){ fxSetEmail(email); }

    document.getElementById("qa_status").textContent = "Thinking...";
    const res = await fxPost("/api/docqa", {
      email: email || fxGetEmail(),
      question: q,
      docTitle: "Foxbridge Portal Documentation",
      documentKey: "PORTAL_DOCS",
      page: location.href
    });

    if(res.ok){
      document.getElementById("qa_a").textContent = res.answer || "";
      document.getElementById("qa_status").textContent = "Done.";
    }else{
      document.getElementById("qa_status").textContent = "Error.";
    }
  });
</script>
```
