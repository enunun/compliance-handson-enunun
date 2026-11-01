import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evidenceDir, fixture, run } from "./helpers.ts";

/** fixtures/sca/<target> を，fixtures/exceptions/<exceptions>.yaml の例外で検査する． */
function sca(target: string, exceptions: string) {
  return run("pnpm", [
    "exec",
    "tsx",
    "tools/gates/sca.ts",
    "--target",
    fixture("sca", target),
    "--exceptions",
    fixture("exceptions", `${exceptions}.yaml`),
  ]);
}

describe("gate:sca", () => {
  it("基準値以上の脆弱性があれば失敗し，証跡のJSONに残す", () => {
    const result = sca("vulnerable", "none");
    expect(result.output).toContain("CVE-2021-23337");
    expect(result.status).toBe(1);
    const report = readFileSync(join(evidenceDir, "sca/trivy.json"), "utf8");
    expect(report).toContain("CVE-2021-23337");
  });

  it("基準値以上の脆弱性がなければ通る", () => {
    expect(sca("fixed", "none").status).toBe(0);
  });

  it("例外に載った脆弱性は外す", () => {
    expect(sca("vulnerable", "lodash").status).toBe(0);
  });

  it("期限を過ぎた例外では外さない", () => {
    expect(sca("vulnerable", "lodash-expired").status).toBe(1);
  });
});
