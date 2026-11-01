import { describe, expect, it } from "vitest";
import { fixture, run } from "./helpers.ts";

/** fixtures/sast/<target> を，fixtures/exceptions/<exceptions>.yaml の例外で検査する． */
function sast(target: string, exceptions = "none") {
  return run("pnpm", [
    "exec",
    "tsx",
    "tools/gates/sast.ts",
    "--target",
    fixture("sast", target),
    "--exceptions",
    fixture("exceptions", `${exceptions}.yaml`),
  ]);
}

describe("gate:sast", () => {
  it("SQLを文字列の組み立てで作るコードがあれば失敗する", () => {
    const result = sast("sql");
    expect(result.output).toContain("pgx-sql-built-from-string");
    expect(result.status).toBe(1);
  });

  it("raw()に変数を渡すコードがあれば失敗する", () => {
    const result = sast("xss");
    expect(result.output).toContain("hono-raw-with-variable");
    expect(result.status).toBe(1);
  });

  it("直したコードでは通る", () => {
    const result = sast("safe");
    expect(result.output).toContain("sast: no findings");
    expect(result.status).toBe(0);
  });

  it("例外に載った検出は外す", () => {
    expect(sast("sha1").status).toBe(1);
    expect(sast("sha1", "sha1").status).toBe(0);
  });
});
