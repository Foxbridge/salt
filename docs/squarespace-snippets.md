# Squarespace Snippets

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
  body{ background: var(--fx-bg); color: var(--fx-text); }
  .fx-wrap{ max-width: var(--fx-max); margin: 0 auto; padding: 24px; }
  .fx-card{ background: var(--fx-panel); border: 1px solid var(--fx-border); border-radius: var(--fx-radius); box-shadow: var(--fx-shadow); padding: 22px; }
  .fx-h1{ font-size: 40px; line-height: 1.1; letter-spacing: -.02em; margin: 0 0 10px; }
  .fx-h2{ font-size: 22px; line-height: 1.2; margin: 0 0 10px; }
  .fx-p{ color: var(--fx-muted); line-height: 1.6; margin: 0 0 14px; }
  .fx-row{ display: grid; grid-template-columns: 1.2fr .8fr; gap: 16px; align-items: start; }
  @media (max-width: 820px){ .fx-row{ grid-template-columns: 1fr; } }
  .fx-btn{ display:inline-flex; gap:10px; align-items:center; justify-content:center; padding: 12px 16px; border-radius: 14px; border: 1px solid var(--fx-border); text-decoration:none; color: var(--fx-text); background: rgba(255,255,255,.04); transition: transform .08s ease, background .15s ease; font-weight: 600; }
  .fx-btn:hover{ transform: translateY(-1px); background: rgba(255,255,255,.07); }
  .fx-btn-primary{ background: linear-gradient(135deg, rgba(122,162,255,.25), rgba(65,209,182,.12)); border-color: rgba(122,162,255,.35); }
  .fx-pill{ display:inline-flex; align-items:center; gap:8px; border:1px solid var(--fx-border); border-radius:999px; padding:8px 12px; color: var(--fx-muted); background: rgba(255,255,255,.03); font-size: 13px; }
  .fx-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  @media (max-width: 820px){ .fx-grid{ grid-template-columns: 1fr; } }
  .fx-input, .fx-select, .fx-textarea{ width:100%; background: rgba(255,255,255,.03); border: 1px solid var(--fx-border); color: var(--fx-text); border-radius: 12px; padding: 12px 12px; outline: none; }
  .fx-textarea{ min-height: 110px; resize: vertical; }
  .fx-label{ font-size: 13px; color: var(--fx-muted); margin: 10px 0 6px; display:block; }
  .fx-small{ font-size: 12px; color: var(--fx-muted); }
</style>
```

## Global footer JS

```html
<script>
  window.FOXBRIDGE = { apiBase: "YOUR_WORKER_URL" };

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

  function fxGetEmail(){ return (localStorage.getItem("fx_email") || "").toLowerCase(); }
  function fxSetEmail(email){ localStorage.setItem("fx_email", (email||"").toLowerCase()); }

  async function fxLog(event, meta){
    return fxPost("/api/event", { event, email: fxGetEmail(), page: location.href, meta: meta || {} });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const portalMarker = document.querySelector("[data-fx-portal='true']");
    if(portalMarker){ fxLog("login", { pageType: "portal" }); }
  });

  window.fxLog = fxLog;
  window.fxPost = fxPost;
  window.fxSetEmail = fxSetEmail;
  window.fxGetEmail = fxGetEmail;
</script>
```

## Page snippets

The full page snippets (Home hero, RFQ block, portal compliance cards, and AI assistant widget) should be copied from the implementation spec in this repo issue/request and inserted as Squarespace Code Blocks.
