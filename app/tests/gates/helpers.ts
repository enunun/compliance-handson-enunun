import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

/** 題材のディレクトリ(app/)． */
export const appRoot = resolve(import.meta.dirname, "../..");

/** ゲートのテストに使う入力の場所． */
export function fixture(...parts: string[]): string {
  return resolve(import.meta.dirname, "fixtures", ...parts);
}

/**
 * ゲートが証跡を書く場所．テストごとに一時的な場所にして，
 * 本物の証跡(out/evidence/)や，並列に動くほかのゲートと混ざらないようにする．
 */
export const evidenceDir = mkdtempSync(join(tmpdir(), "gate-evidence-"));

/** コマンドを実行し，終了コードと出力を返す． */
export function run(command: string, args: string[], cwd = appRoot) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, EVIDENCE_DIR: evidenceDir },
  });
  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
  };
}
