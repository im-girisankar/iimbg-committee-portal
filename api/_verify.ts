import { app } from "./app.ts";

async function main() {
  const tests = [
    { name: "GET /api/health", req: () => app.request("/api/health"), expectStatus: 200 },
    { name: "GET /api/events", req: () => app.request("/api/events"), expectStatus: 200 },
    { name: "GET /api/events?category=Workshop", req: () => app.request("/api/events?category=Workshop"), expectStatus: 200 },
    { name: "GET /api/events?q=GenAI", req: () => app.request("/api/events?q=GenAI"), expectStatus: 200 },
    { name: "GET /api/events/tech-tuesday-genai-08", req: () => app.request("/api/events/tech-tuesday-genai-08"), expectStatus: 200 },
    { name: "GET /api/events/nope", req: () => app.request("/api/events/nope"), expectStatus: 404 },
    { name: "GET /api/team", req: () => app.request("/api/team"), expectStatus: 200 },
    { name: "GET /api/docs", req: () => app.request("/api/docs"), expectStatus: 200 },
    { name: "POST /api/registrations (invalid)", req: () => app.request("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bad: "data" }) }), expectStatus: 400 },
    { name: "POST /api/registrations (unknown event)", req: () => app.request("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_id: "nonexistent", name: "Test", email: "test@example.com", phone: "9999999999", program: "MBA", notes: "" }) }), expectStatus: 400 },
    { name: "GET /api/unknown", req: () => app.request("/api/unknown"), expectStatus: 404 },
  ];

  let passed = 0;
  for (const test of tests) {
    const res = await test.req();
    const text = await res.text();
    const ok = res.status === test.expectStatus;
    console.log(`${ok ? "✓" : "✗"} ${test.name}: ${res.status} ${text.slice(0, 100)}`);
    if (ok) passed++;
  }

  console.log(`\n${passed}/${tests.length} tests passed`);
  if (passed !== tests.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });