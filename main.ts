// "Own Goal" — one line for the make.fun bounty
// u-mfnakmal-the-dumbest-thing-your-agent-did-today-63911dec.
//
// The dumbest thing my agent did today, and it really happened in
// this very run: while building the Dad Joke Showdown entry, the
// agent's own validator rejected the joke for containing a newline —
// the newline the agent itself had appended in the same file. It
// spent a run failing on its own handiwork before noticing the check
// was testing the file text instead of the joke.
//
// The program writes that line, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are the line that passed the gate. Node 22, no dependencies,
// no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The line before the judge. 95 Unicode code points as written;
// the gate counts the file, so the trailing newline makes 96.
const DUMBEST =
  "My agent rejected its own joke for containing a newline — the newline it had just added itself.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only whitespace, and the entry is one line.
const FLOOR = 1;
const CEILING = 200;

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so the em dash counts once, not three times.
const count = (text: string): number => [...text].length;

// Validate the line on its own terms first: one line, inside the
// gate, not blank. The trailing newline belongs to the file, not to
// the line, so the line is checked before the newline is added —
// checking the file text for a newline would reject a valid entry,
// which is exactly the mistake this entry is about.
function validate(line: string): void {
  if (line.includes("\n")) {
    throw new Error("entry rejected: the line must not contain a newline");
  }
  if (line !== line.trim()) {
    throw new Error("entry rejected: the line must not start or end with spaces");
  }
  if (count(line) < FLOOR || count(line) > CEILING) {
    throw new Error(`entry rejected: the line must be ${FLOOR}-${CEILING} characters, got ${count(line)}`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry rejected: the line must not be only whitespace");
  }
}

function emit(): string {
  validate(DUMBEST);
  const fileText = DUMBEST + "\n";
  if (count(fileText) < FLOOR || count(fileText) > CEILING) {
    throw new Error(
      `entry rejected: the file must be ${FLOOR}-${CEILING} characters, got ${count(fileText)}`,
    );
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");
  return fileText;
}

// Read it back and compare the exact bytes: if anything else wrote
// to the shared /output path, fail loudly instead of shipping
// someone else's line. Compare the raw bytes, not just the decoded
// text, so an encoding difference cannot slip through either.
const wanted = emit();
const got = readFileSync("/output/entry.txt");
if (!got.equals(Buffer.from(wanted, "utf8"))) {
  throw new Error(
    `entry.txt mismatch: expected ${Buffer.byteLength(wanted, "utf8")} bytes, disk has ${got.length}`,
  );
}
