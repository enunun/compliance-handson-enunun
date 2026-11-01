import { describe, expect, it } from "vitest";
import { fixture, run } from "./helpers.ts";

/** fixtures/ops-verify/<name> の運用項目を ops:verify で検証する． */
function verify(name: string) {
  return run("pnpm", [
    "exec",
    "tsx",
    "tools/ops/verify.ts",
    "--ops",
    fixture("ops-verify", name, "ops"),
    "--workflows",
    fixture("ops-verify", name, "workflows"),
  ]);
}

describe("ops:verify", () => {
  it("正しい運用項目では通る", () => {
    const result = verify("valid");
    expect(result.output).toContain("ops: ok");
    expect(result.status).toBe(0);
  });

  it("仕組みのジョブがワークフローになければ失敗する", () => {
    const result = verify("missing-job");
    expect(result.output).toContain("ci.yml にジョブ check がない");
    expect(result.status).toBe(1);
  });

  it("基準値がスキーマに合わなければ失敗する", () => {
    const result = verify("invalid-standards");
    expect(result.output).toContain("/change/required_approvals");
    expect(result.status).toBe(1);
  });

  it("運用項目一覧が items.yaml と合わなければ失敗する", () => {
    const result = verify("stale-list");
    expect(result.output).toContain("mise run ops:render");
    expect(result.status).toBe(1);
  });
});
