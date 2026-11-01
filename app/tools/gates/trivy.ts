// Trivyを使うゲート(sca，image，config)に共通の処理．
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify } from "yaml";
import {
  type Exception,
  readExceptions,
  readStandards,
  severitiesFrom,
} from "../ops/standards.ts";

/** ゲートの証跡の置き場所．ゲートのテストでは EVIDENCE_DIR で一時的な場所に替える． */
export function evidenceDirOf(gate: string): string {
  const dir = join(process.env.EVIDENCE_DIR ?? "out/evidence", gate);
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** 例外を，Trivyの除外の設定(.trivyignore.yaml の形)に変える．脆弱性と設定の誤りの両方に使う． */
export function toTrivyIgnore(exceptions: Exception[]) {
  const entries = exceptions.map((e) => ({
    id: e.target,
    statement: `${e.id}: ${e.reason} (承認：${e.approver})`,
    expired_at: e.expires,
  }));
  return { vulnerabilities: entries, misconfigurations: entries };
}

export type TrivyOptions = {
  /** trivy のサブコマンドと，それに固有の引数． */
  args: string[];
  /** 証跡の置き場所(evidenceDirOf の結果)． */
  evidenceDir: string;
  ops: string;
  exceptions: string;
};

/**
 * 基準値の重大度と例外を使ってTrivyを実行し，結果をJSONで証跡に残す．
 * 人が読む表も表示する．Trivyの終了コードを返す．
 */
export function runTrivy(options: TrivyOptions): {
  status: number;
  report: string;
} {
  const severity = severitiesFrom(
    readStandards(options.ops).vulnerability.fail_severity,
  );
  // どの例外を適用したかの記録として，除外の設定も証跡に含める．
  const ignoreFile = join(options.evidenceDir, "trivyignore.yaml");
  writeFileSync(
    ignoreFile,
    stringify(toTrivyIgnore(readExceptions(options.exceptions))),
  );
  const report = join(options.evidenceDir, "trivy.json");
  const scan = spawnSync(
    "trivy",
    [
      ...options.args,
      "--severity",
      severity.join(","),
      "--ignorefile",
      ignoreFile,
      "--exit-code",
      "1",
      "--quiet",
      "--format",
      "json",
      "--output",
      report,
    ],
    { stdio: "inherit" },
  );
  spawnSync("trivy", ["convert", "--quiet", "--format", "table", report], {
    stdio: "inherit",
  });
  return { status: scan.status ?? 1, report };
}
