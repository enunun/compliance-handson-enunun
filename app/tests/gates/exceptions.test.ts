import { describe, expect, it } from "vitest";
import { fixture, run } from "./helpers.ts";

/** fixtures/exceptions/<name>.yaml の例外を，2026-10-04 の時点で検査する． */
function checkExceptions(name: string) {
  return run("pnpm", [
    "exec",
    "tsx",
    "tools/gates/exceptions.ts",
    "--exceptions",
    fixture("exceptions", `${name}.yaml`),
    "--today",
    "2026-10-04",
  ]);
}

describe("gate:exceptions", () => {
  it("期限内の例外なら通る", () => {
    const result = checkExceptions("within");
    expect(result.output).toContain("1 active, 0 expired");
    expect(result.status).toBe(0);
  });

  it("期限を過ぎた例外があれば失敗する", () => {
    const result = checkExceptions("expired");
    expect(result.output).toContain("EXC-001: 期限(2026-09-30)を過ぎている");
    expect(result.status).toBe(1);
  });

  it("期限が基準値の最長の日数を超える例外があれば失敗する", () => {
    const result = checkExceptions("too-long");
    expect(result.output).toContain("基準値の90日を超えている");
    expect(result.status).toBe(1);
  });
});
