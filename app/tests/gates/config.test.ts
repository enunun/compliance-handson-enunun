import { describe, expect, it } from "vitest";
import { fixture, run } from "./helpers.ts";

/** fixtures/config/<target> の設定を検査する． */
function config(target: string) {
  return run("pnpm", [
    "exec",
    "tsx",
    "tools/gates/config.ts",
    "--target",
    fixture("config", target),
    "--exceptions",
    fixture("exceptions", "none.yaml"),
  ]);
}

describe("gate:config", () => {
  it("rootで動くDockerfileがあれば失敗する", () => {
    const result = config("root-user");
    expect(result.output).toContain("DS-0002");
    expect(result.status).toBe(1);
  });

  it("誰でも読めるS3のバケットがあれば失敗する", () => {
    const result = config("public-bucket");
    expect(result.output).toContain("AWS-0087");
    expect(result.status).toBe(1);
  });

  it("設定の誤りがなければ通る", () => {
    expect(config("good").status).toBe(0);
  });
});
