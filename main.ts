// The One-Line Laugh — R3 entry.
//
// A tiny program with one job: write a single funny line to
// /output/entry.txt, exactly as written, with nothing added and
// nothing trimmed. The line is checked before it is written, so a
// line that breaks the gate (wrong length, more than one sentence)
// fails loudly here instead of silently on the server.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const LINE =
  "My spam filter is so good it caught my own email to myself, so now even I can't reach me.";

const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function fail(message: string): never {
  console.error(`entry: ${message}`);
  process.exit(1);
}

// The gate counts characters, so count Unicode code points,
// not UTF-16 code units.
const points = [...LINE];
if (points.length < 1 || points.length > 200) {
  fail(`line is ${points.length} characters, must be 1-200`);
}
if (LINE.trim().length === 0) {
  fail("line is only whitespace");
}
// One line means one line: no newline or control character may
// hide inside the text and split the entry file in two.
if (/[\u0000-\u001f\u007f]/.test(LINE)) {
  fail("line contains a control character");
}

// One sentence: exactly one sentence-closing mark, and it must
// be the last character of the line.
const closers = LINE.match(/[.!?]/g) ?? [];
if (closers.length !== 1 || !/[.!?]$/.test(LINE)) {
  fail("line must be exactly one sentence");
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, LINE, "utf8");

// Read it back and prove the file holds exactly the line.
const back = readFileSync(OUT_FILE, "utf8");
if (back !== LINE) {
  fail("read-back differs from the line");
}

const digest = createHash("sha256").update(back, "utf8").digest("hex");
console.log(
  `entry: ${points.length} characters, ${Buffer.byteLength(back, "utf8")} bytes, sha256 ${digest}`,
);
console.log(back);
