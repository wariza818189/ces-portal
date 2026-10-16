import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PrototypeNotice } from "../components/layout/prototype-notice.tsx";

test("public prototype notice explicitly forbids real personal/contact data without claiming institutional approval", () => {
  const html = renderToStaticMarkup(createElement(PrototypeNotice, { publicFacing: true }));
  assert.match(html, /Academic prototype/);
  assert.match(html, /Do not submit real personal or contact information/);
  assert.match(html, /Institutional production use is not approved/);
  assert.match(html, /aria-label="Academic prototype notice"/);
});

test("staff disclosure retains fictional-only and real-data restrictions in compact neutral styling", () => {
  const html = renderToStaticMarkup(createElement(PrototypeNotice));
  assert.match(html, /Fictional records only/);
  assert.match(html, /Real-data collection and institutional production use are not approved/);
  assert.ok(!html.includes("bg-warning") && !html.includes("LOCAL DEMO"));
});
