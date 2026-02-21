/**
 * Foxbridge Gateway Worker
 * - Logs events to Airtable (ACTIVITY_LOG)
 * - Creates/updates BUYERS (lead capture)
 * - Creates RFQs (RFQS)
 * - AI Documentation Assistant (OpenAI) with event logging
 *
 * SECURITY:
 * - No Airtable/OpenAI keys in Squarespace front-end
 * - Front-end posts to this worker
 */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return json({ ok: true });

    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/event") return await handleEvent(request, env);
      if (url.pathname === "/api/lead") return await handleLead(request, env);
      if (url.pathname === "/api/rfq") return await handleRFQ(request, env);
      if (url.pathname === "/api/docqa") return await handleDocQA(request, env);

      return json({ ok: false, error: "Not found" }, 404);
    } catch (e) {
      return json({ ok: false, error: e?.message || String(e) }, 500);
    }
  },
};

async function handleEvent(request, env) {
  const body = await request.json();

  const record = {
    Event: String(body.event || "").slice(0, 50),
    Email: (body.email || "").toLowerCase(),
    Page: body.page || "",
    DocumentKey: body.documentKey || "",
    Meta: body.meta ? JSON.stringify(body.meta).slice(0, 90000) : "",
    IP: request.headers.get("CF-Connecting-IP") || "",
    UserAgent: request.headers.get("User-Agent") || "",
    Timestamp: new Date().toISOString(),
  };

  await airtableCreate(env, env.AIRTABLE_ACTIVITY_TABLE, record);

  // OPTIONAL: Basic high-interest scoring rule (tune later)
  if (record.Email) {
    let scoreDelta = 0;
    if (record.Event === "document_view") scoreDelta = 2;
    if (record.Event === "login") scoreDelta = 1;
    if (record.Event === "rfq_submit") scoreDelta = 5;

    if (scoreDelta > 0) {
      await buyerScoreUp(env, record.Email, scoreDelta);
    }
  }

  return json({ ok: true });
}

async function handleLead(request, env) {
  const body = await request.json();

  if (!body.email) return json({ ok: false, error: "email required" }, 400);

  const email = String(body.email).toLowerCase();

  // Upsert BUYERS by Email (Airtable doesn't do true upsert natively; we search then create/update)
  const existing = await airtableFindByEmail(env, env.AIRTABLE_BUYERS_TABLE, email);

  const fields = {
    Email: email,
    Company: body.company || "",
    Name: body.name || "",
    Phone: body.phone || "",
    Role: body.role || "",
    Country: body.country || "",
    AnnualVolumeMT: body.annualVolumeMT ? Number(body.annualVolumeMT) : null,
    Tier: body.tier || "Registered",
    LastSeen: new Date().toISOString(),
  };

  if (existing?.id) {
    await airtableUpdate(env, env.AIRTABLE_BUYERS_TABLE, existing.id, fields);
  } else {
    fields.InterestScore = 0;
    await airtableCreate(env, env.AIRTABLE_BUYERS_TABLE, fields);
  }

  // log event
  await airtableCreate(env, env.AIRTABLE_ACTIVITY_TABLE, {
    Event: "registration",
    Email: email,
    Page: body.page || "",
    DocumentKey: "",
    Meta: JSON.stringify({ source: "lead_form" }),
    IP: request.headers.get("CF-Connecting-IP") || "",
    UserAgent: request.headers.get("User-Agent") || "",
    Timestamp: new Date().toISOString(),
  });

  return json({ ok: true });
}

async function handleRFQ(request, env) {
  const body = await request.json();

  if (!body.email) return json({ ok: false, error: "email required" }, 400);

  const email = String(body.email).toLowerCase();

  const record = {
    Timestamp: new Date().toISOString(),
    Email: email,
    Company: body.company || "",
    Product: body.product || "Edible Pink Salt",
    Granulation: body.granulation || "",
    QuantityMT: body.quantityMT ? Number(body.quantityMT) : null,
    Incoterm: body.incoterm || "CFR NY/NJ",
    TargetDelivery: body.targetDelivery || "",
    Notes: body.notes || "",
    Status: "New",
  };

  await airtableCreate(env, env.AIRTABLE_RFQ_TABLE, record);

  // event log
  await airtableCreate(env, env.AIRTABLE_ACTIVITY_TABLE, {
    Event: "rfq_submit",
    Email: email,
    Page: body.page || "",
    DocumentKey: "",
    Meta: JSON.stringify({ rfq: { product: record.Product, qty: record.QuantityMT } }),
    IP: request.headers.get("CF-Connecting-IP") || "",
    UserAgent: request.headers.get("User-Agent") || "",
    Timestamp: new Date().toISOString(),
  });

  // Optional scoring bump
  await buyerScoreUp(env, email, 5);

  return json({ ok: true });
}

async function handleDocQA(request, env) {
  const body = await request.json();
  const email = (body.email || "").toLowerCase();
  const question = String(body.question || "").slice(0, 2000);
  const docTitle = String(body.docTitle || "Foxbridge Documentation");

  if (!question) return json({ ok: false, error: "question required" }, 400);

  // log question event (even if anonymous)
  await airtableCreate(env, env.AIRTABLE_ACTIVITY_TABLE, {
    Event: "docqa_question",
    Email: email,
    Page: body.page || "",
    DocumentKey: body.documentKey || "",
    Meta: JSON.stringify({ docTitle, question }).slice(0, 90000),
    IP: request.headers.get("CF-Connecting-IP") || "",
    UserAgent: request.headers.get("User-Agent") || "",
    Timestamp: new Date().toISOString(),
  });

  if (email) await buyerScoreUp(env, email, 2);

  // Call OpenAI (Responses API style)
  const answer = await openaiAnswer(env.OPENAI_API_KEY, {
    docTitle,
    question,
  });

  return json({ ok: true, answer });
}

/** Airtable helpers */
async function airtableCreate(env, tableName, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields }] }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airtable create failed: ${res.status} ${t}`);
  }
  return res.json();
}

async function airtableUpdate(env, tableName, recordId, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airtable update failed: ${res.status} ${t}`);
  }
  return res.json();
}

async function airtableFindByEmail(env, tableName, email) {
  const filter = encodeURIComponent(`{Email}='${email}'`);
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=1&filterByFormula=${filter}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` },
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airtable find failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  const rec = data.records?.[0];
  return rec ? { id: rec.id, fields: rec.fields } : null;
}

async function buyerScoreUp(env, email, delta) {
  const existing = await airtableFindByEmail(env, env.AIRTABLE_BUYERS_TABLE, email);
  if (!existing?.id) return;

  const current = Number(existing.fields?.InterestScore || 0);
  const next = current + delta;

  await airtableUpdate(env, env.AIRTABLE_BUYERS_TABLE, existing.id, {
    InterestScore: next,
    LastSeen: new Date().toISOString(),
  });
}

/** OpenAI helper */
async function openaiAnswer(openaiKey, { docTitle, question }) {
  const system = `You are the Foxbridge Documentation Assistant.
You answer in a calm, institutional tone.
If a question is compliance-related, respond with structured, conservative guidance.
Do not invent certifications or test results. If unknown, say what document is required.`;

  const payload = {
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: `Document context: ${docTitle}\n\nQuestion: ${question}` },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI failed: ${res.status} ${t}`);
  }

  const data = await res.json();

  // Extract text safely
  const text = (data.output_text || "").trim();
  return text || "I can help, but I need the specific document or clause referenced.";
}
