import { appendFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { PACKS_DIR, QUARANTINE_DIR } from "./assets.ts";

// A failed asset is moved aside with the reason, and left alone.
//
// It is NOT repaired. An automatic fix on a generated asset hides the thing
// worth knowing -- that the generator produced something off-contract -- and
// bakes a silent correction into the pipeline. Quarantine makes the failure
// visible and the decision a person's.

export function quarantine(sourcePath: string, reason: string): void {
  mkdirSync(QUARANTINE_DIR, { recursive: true });
  // Keyed by pack AND file: every pack has an attack.png, and a bare basename
  // would let one pack's failure silently overwrite another's.
  const name = relative(PACKS_DIR, sourcePath).split(sep).join("__");
  const target = join(QUARANTINE_DIR, name);
  if (existsSync(sourcePath)) copyFileSync(sourcePath, target);
  appendFileSync(
    join(QUARANTINE_DIR, "quarantine.log"),
    `${new Date().toISOString()}\t${name}\t${reason.replace(/\s+/g, " ")}\n`,
  );
}
