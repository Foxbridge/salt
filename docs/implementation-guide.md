# Foxbridge Build Directions (Squarespace + Airtable + Cloudflare Worker + Optional Zapier)

This guide is the complete, step-by-step build order to ship the Foxbridge workflow without exposing Airtable/OpenAI keys in browser code.

## Architecture (what you are building)

- **Public website (Squarespace):** Home, Supply Verification, Quality & Compliance, Upstream Alignment, RFQ.
- **Secure portal (Squarespace Member Areas):** gated buyer pages.
- **Server gateway (Cloudflare Worker):** writes to Airtable and calls OpenAI.
- **Data layer (Airtable):** `BUYERS`, `ACTIVITY_LOG`, `RFQS`, `DOCS`.
- **Optional alerting (Zapier):** notify `jason@foxbridgeholdings.org` when buyer intent is high.

## 0) Prerequisites

- Airtable base available: `appP4XPIn4fl0CsVS`
- Cloudflare account with Workers enabled
- Squarespace site with Member Areas enabled
- OpenAI API key
- Optional: Zapier account

## 1) Airtable build

Create or verify these tables and fields exactly:

### BUYERS
- BuyerID (formula/autonumber)
- Email (email)
- Company (single line)
- Name (single line)
- Phone (single line)
- Role (single line)
- Country (single select)
- AnnualVolumeMT (number)
- Qualified (checkbox)
- Tier (single select: Prospect / Registered / Qualified / Agreement / Active)
- InterestScore (number, default `0`)
- LastSeen (date time)
- Notes (long text)

### ACTIVITY_LOG
- Timestamp (created time OR date time)
- Event (single select: registration, login, document_view, rfq_submit, docqa_question)
- Email (email)
- Page (url)
- DocumentKey (single line)
- Meta (long text)
- IP (single line)
- UserAgent (single line)

### RFQS
- Timestamp (created time)
- Email (email)
- Company (single line)
- Product (single select: Edible Pink Salt / Industrial Salt / Other)
- Granulation (single line)
- QuantityMT (number)
- Incoterm (single select: CFR NY/NJ / FOB Karachi / Other)
- TargetDelivery (date)
- Notes (long text)
- Status (single select: New / Reviewing / Quoted / Closed)

### DOCS
- DocumentKey (single line)
- Title (single line)
- URL (url)
- RequiresQualified (checkbox)

## 2) Cloudflare Worker build + deploy

### 2.1 Worker code source

Use the repository Worker file:

- `cloudflare/worker.js`

### 2.2 Create Worker

1. Cloudflare Dashboard → **Workers & Pages** → **Create Worker**.
2. Name: `foxbridge-gateway`.
3. Paste contents of `cloudflare/worker.js`.
4. Deploy.

### 2.3 Configure Worker secrets

Add these environment variables/secrets:

- `AIRTABLE_TOKEN` = Airtable Personal Access Token
- `AIRTABLE_BASE_ID` = `appP4XPIn4fl0CsVS`
- `AIRTABLE_BUYERS_TABLE` = `BUYERS`
- `AIRTABLE_ACTIVITY_TABLE` = `ACTIVITY_LOG`
- `AIRTABLE_RFQ_TABLE` = `RFQS`
- `OPENAI_API_KEY` = OpenAI API key
- `ALERT_EMAIL_TO` = `jason@foxbridgeholdings.org` (optional)

### 2.4 Endpoints exposed by worker

- `POST /api/event`
- `POST /api/lead`
- `POST /api/rfq`
- `POST /api/docqa`

## 3) Squarespace build

All copy-paste snippets live in `docs/squarespace-snippets.md`.

### 3.1 Global header CSS

Squarespace → **Settings → Advanced → Code Injection → Header**

Paste section: **Global header CSS**.

### 3.2 Global footer JS

Squarespace → **Settings → Advanced → Code Injection → Footer**

Paste section: **Global footer JS** and replace:

- `YOUR_WORKER_URL` with your deployed worker URL (example: `https://foxbridge-gateway.<account>.workers.dev`).

### 3.3 Public pages

Create/edit these pages and insert the corresponding code block snippets:

- `/` (Home) → **Home hero block**
- `/rfq` → **RFQ page block**

### 3.4 Portal (Member Area)

Create Member Area: **Secure Buyer Portal**.

Create pages:
- `/portal/dashboard`
- `/portal/compliance`
- `/portal/coa-viewer`
- `/portal/production-calendar`

Add the portal marker snippet at the top of each portal page:
- **Portal marker** (`data-fx-portal="true"`)

On `/portal/compliance`, add:
- **Compliance packet tracking cards**

On any portal page, add:
- **AI documentation assistant widget**

## 4) Optional high-interest alerts (Zapier)

Create a Zap:

1. **Trigger:** Airtable `Record Matches Conditions` in `BUYERS` where `InterestScore >= 8`.
2. **Action:** Gmail/Email by Zapier → send to `jason@foxbridgeholdings.org`.

Worker scoring already increments:
- `document_view` +2
- `login` +1
- `rfq_submit` +5
- `docqa_question` +2 (if email is present)

## 5) Test plan (run in order)

1. Submit RFQ on `/rfq`.
   - Expect new `RFQS` row.
   - Expect new `ACTIVITY_LOG` row with `rfq_submit`.
2. Open a tracked compliance document button.
   - Expect `document_view` in `ACTIVITY_LOG`.
3. Ask a question in AI widget.
   - Expect text response.
   - Expect `docqa_question` in `ACTIVITY_LOG`.
4. Review BUYERS row.
   - Expect `InterestScore` increased from interactions.

## 6) Build checklist (quick handoff)

- [ ] Airtable tables and fields created
- [ ] Worker deployed with secrets
- [ ] Header CSS injected in Squarespace
- [ ] Footer JS injected with real Worker URL
- [ ] Home + RFQ blocks pasted
- [ ] Member Area pages created
- [ ] Portal marker pasted on portal pages
- [ ] Compliance tracking buttons pasted
- [ ] AI assistant widget pasted
- [ ] End-to-end tests passed
- [ ] Optional Zapier alert enabled
