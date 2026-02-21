# Foxbridge Squarespace + Airtable + Worker Build Guide

This repository now includes a production-ready Cloudflare Worker at `cloudflare/worker.js` for secure Airtable/OpenAI integration.

## 1) Airtable setup

Base ID: `appP4XPIn4fl0CsVS`

Create these tables and fields:

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
- Timestamp (created time or date time)
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

## 2) Cloudflare Worker deployment

1. Create a Worker named `foxbridge-gateway`.
2. Copy `cloudflare/worker.js` into the Worker editor (or deploy with Wrangler).
3. Add Worker secrets:
   - `AIRTABLE_TOKEN`
   - `AIRTABLE_BASE_ID=appP4XPIn4fl0CsVS`
   - `AIRTABLE_BUYERS_TABLE=BUYERS`
   - `AIRTABLE_ACTIVITY_TABLE=ACTIVITY_LOG`
   - `AIRTABLE_RFQ_TABLE=RFQS`
   - `OPENAI_API_KEY`
   - `ALERT_EMAIL_TO=jason@foxbridgeholdings.org` (optional)

## 3) Squarespace integration snippets

Use these snippets in Squarespace Code Injection / Code Blocks.

### Header CSS
See `docs/squarespace-snippets.md` under **Global header CSS**.

### Footer JavaScript
See `docs/squarespace-snippets.md` under **Global footer JS** and replace `YOUR_WORKER_URL`.

### Page blocks
Use the corresponding sections in `docs/squarespace-snippets.md` for:
- Home hero
- RFQ page
- Portal marker
- Compliance doc tracking cards
- AI documentation assistant

## 4) Endpoint summary

- `POST /api/event`: write activity events and increment score for high-interest actions.
- `POST /api/lead`: upsert buyer by email and log registration.
- `POST /api/rfq`: create RFQ + log submission + scoring bump.
- `POST /api/docqa`: log question + optional score bump + OpenAI response.

## 5) Verification checklist

- RFQ submit creates one row in `RFQS` and one row in `ACTIVITY_LOG`.
- Clicking tracked portal docs writes `document_view` in `ACTIVITY_LOG`.
- AI question returns text and logs `docqa_question`.
- Buyer `InterestScore` changes after `login`, `document_view`, and `rfq_submit`.
