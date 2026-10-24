import test from "node:test";
import assert from "node:assert/strict";
import { noticeIdSchema, noticeRevisionSchema, noticeTitleSchema, noticeMessageSchema,
  noticeCreateSchema, noticeEditSchema, noticeMutationSchema, readNoticeForm } from "@/lib/validation/notices";

test("Notice IDs remain exact canonical UINT64 strings", () => {
  for (const id of ["1", "2", "9007199254740993", "18446744073709551615"]) assert.equal(noticeIdSchema.parse(id), id);
  for (const id of ["0", "01", "+1", "-1", "1.0", "1e3", " 1", "1 ", "18446744073709551616", "9".repeat(100), "abc", "", null, 1]) {
    assert.equal(noticeIdSchema.safeParse(id).success, false, String(id));
  }
});
test("Notice revisions accept exactly canonical UINT32 strings", () => {
  for (const revision of ["1", "4294967295"]) assert.equal(noticeRevisionSchema.parse(revision), Number(revision));
  for (const revision of ["0", "-1", "+1", "01", "1.0", "1e3", " 1", "1 ", "4294967296", "abc", "9".repeat(100), 1, null]) {
    assert.equal(noticeRevisionSchema.safeParse(revision).success, false, String(revision));
  }
});
test("Notice title trims, counts code points, rejects blanks/controls and never truncates", () => {
  assert.equal(noticeTitleSchema.parse("😀"), "😀");
  assert.equal(noticeTitleSchema.parse("  Synthetic  heading  "), "Synthetic  heading");
  assert.equal(noticeTitleSchema.parse("😀".repeat(120)), "😀".repeat(120));
  for (const value of ["😀".repeat(121), "x".repeat(121), "", "  ", "x\n", "\tx", "x\u0000", "x\u0085", 1, null]) {
    assert.equal(noticeTitleSchema.safeParse(value).success, false);
  }
});
test("Notice title preserves HTML-looking text literally after trimming", () => {
  assert.equal(noticeTitleSchema.parse("  <b>Demo</b>  "), "<b>Demo</b>");
});
test("Notice message normalizes CRLF/CR, preserves paragraphs/tabs/spaces, rejects other controls", () => {
  assert.equal(noticeMessageSchema.parse(" \r\nFirst  line\r\n\tSecond\rThird \n"), "First  line\n\tSecond\nThird");
  assert.equal(noticeMessageSchema.parse("😀"), "😀");
  assert.equal(noticeMessageSchema.parse("😀".repeat(2000)), "😀".repeat(2000));
  for (const value of ["😀".repeat(2001), "x".repeat(2001), "", " \n\t", "x\u0000", "\u000bx", "x\u007f", "x\u0085", 1, null]) {
    assert.equal(noticeMessageSchema.safeParse(value).success, false);
  }
  for (const value of ["'); DELETE FROM notices; --", '" OR 1=1 --', "<b>Plain text</b>"]) assert.equal(noticeMessageSchema.parse(value), value);
});
test("all expected FormData fields reject duplicate/missing/file scalars", () => {
  const valid = { id: "9007199254740993", revision: "1", title: "Synthetic", message: "Body" };
  for (const field of Object.keys(valid)) for (const kind of ["missing", "duplicate", "file"]) {
    const form = new FormData();
    for (const [key, value] of Object.entries(valid)) form.set(key, value);
    if (kind === "missing") form.delete(field);
    if (kind === "duplicate") form.append(field, valid[field]);
    if (kind === "file") form.set(field, new Blob(["Synthetic"]), "fixture.txt");
    const parsed = noticeEditSchema.safeParse(readNoticeForm(form, Object.keys(valid)));
    assert.equal(parsed.success, false, `${field}: ${kind}`);
  }
});
test("Notice create/mutation schemas strip untrusted actor and timestamp fields", () => {
  const extra = { created_by: "999", actor_id: "999", role: "ADMIN", created_at: "forged", updated_at: "forged" };
  assert.deepEqual(noticeCreateSchema.parse({ title: " Synthetic ", message: " Body ", ...extra }), { title: "Synthetic", message: "Body" });
  assert.deepEqual(noticeMutationSchema.parse({ id: "1", revision: "1", ...extra }), { id: "1", revision: 1 });
});
