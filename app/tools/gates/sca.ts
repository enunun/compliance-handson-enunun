// 依存関係の既知の脆弱性を，Trivyで検査する．
// 基準値の重大度以上の脆弱性があれば失敗する．例外に載った脆弱性は，期限まで外す．
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { stringify } from "yaml";
import {
  type Exception,
  readExceptions,
  readStandards,
  severitiesFrom,
} from "../ops/standards.ts";

// 証跡の置き場所．ゲートのテストでは EVIDENCE_DIR で一時的な場所に替える．
const evidenceDir = join(process.env.EVIDENCE_DIR ?? "out/evidence", "sca");
// 例外から作るTrivyの除外の設定．どの例外を適用したかの記録として証跡に含める．
const ignoreFile = join(evidenceDir, "trivyignore.yaml");

/** 例外を，Trivyの除外の設定(.trivyignore.yaml の形)に変える． */
export function toTrivyIgnore(exceptions: Exception[]) {
  return {
    vulnerabilities: exceptions.map((e) => ({
      id: e.target,
      statement: `${e.id}: ${e.reason} (承認：${e.approver})`,
      expired_at: e.expires,
    })),
  };
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      target: { type: "string", default: "." },
      ops: { type: "string", default: "ops" },
      exceptions: { type: "string", default: "ops/exceptions.yaml" },
    },
  });
  const standards = readStandards(values.ops);
  const severity = severitiesFrom(standards.vulnerability.fail_severity);

  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(
    ignoreFile,
    stringify(toTrivyIgnore(readExceptions(values.exceptions))),
  );

  const report = join(evidenceDir, "trivy.json");
  const scan = spawnSync(
    "trivy",
    [
      "fs",
      "--scanners",
      "vuln",
      "--severity",
      severity.join(","),
      "--ignorefile",
      ignoreFile,
      "--skip-dirs",
      "**/node_modules,tests/gates/fixtures",
      "--exit-code",
      "1",
      "--quiet",
      "--format",
      "json",
      "--output",
      report,
      values.target,
    ],
    { stdio: "inherit" },
  );
  // 人が読む表も出す．証跡はJSONの方である．
  spawnSync("trivy", ["convert", "--quiet", "--format", "table", report], {
    stdio: "inherit",
  });
  process.exit(scan.status ?? 1);
}
