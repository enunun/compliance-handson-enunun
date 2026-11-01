// コードの脆弱性をSemgrepで検査する(SAST)．
// 例外に載った検出は，期限まで外す．それ以外の検出が1つでもあれば失敗する．
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { type Exception, readExceptions } from "../ops/standards.ts";

type Finding = {
  check_id: string;
  path: string;
  start: { line: number };
  extra: { message: string; severity: string };
};

const evidenceDir = join(process.env.EVIDENCE_DIR ?? "out/evidence", "sast");

/** 検出が，期限内の例外に当たるかを返す．today は YYYY-MM-DD である． */
export function isExcepted(
  finding: Finding,
  exceptions: Exception[],
  today: string,
): boolean {
  return exceptions.some(
    (e) =>
      e.expires >= today &&
      (finding.check_id === e.target ||
        finding.check_id.endsWith(`.${e.target}`)) &&
      (!e.path || finding.path.endsWith(e.path)),
  );
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      target: { type: "string", default: "." },
      exceptions: { type: "string", default: "ops/exceptions.yaml" },
      config: {
        type: "string",
        multiple: true,
        default: ["p/golang", "p/typescript", ".semgrep"],
      },
    },
  });
  mkdirSync(evidenceDir, { recursive: true });
  const json = join(evidenceDir, "semgrep.json");
  const scan = spawnSync(
    "semgrep",
    [
      "scan",
      "--metrics",
      "off",
      "--quiet",
      ...values.config.flatMap((c) => ["--config", c]),
      // 題材全体を調べるときは，ゲートのテストの入力を外す．
      ...(values.target === "." ? ["--exclude", "fixtures"] : []),
      "--json-output",
      json,
      "--sarif-output",
      join(evidenceDir, "semgrep.sarif"),
      values.target,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  if (scan.status !== 0) {
    console.error("semgrep failed");
    process.exit(2);
  }

  const today = new Date().toISOString().slice(0, 10);
  const exceptions = readExceptions(values.exceptions);
  const findings = (
    JSON.parse(readFileSync(json, "utf8")) as { results: Finding[] }
  ).results.filter((f) => !isExcepted(f, exceptions, today));
  for (const f of findings) {
    console.error(
      `${f.path}:${f.start.line}: [${f.check_id}] ${f.extra.message}`,
    );
  }
  if (findings.length > 0) {
    process.exit(1);
  }
  console.log("sast: no findings");
}
