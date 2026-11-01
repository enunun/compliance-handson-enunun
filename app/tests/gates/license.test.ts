import { describe, expect, it } from "vitest";
import { fixture, run } from "./helpers.ts";

/** fixtures/license/<name>.cdx.json のSBOMを検査する． */
function license(name: string) {
  return run("pnpm", [
    "exec",
    "tsx",
    "tools/gates/license.ts",
    fixture("license", `${name}.cdx.json`),
  ]);
}

describe("gate:license", () => {
  it("許可したライセンスだけなら通る", () => {
    const result = license("allowed");
    expect(result.output).toContain("all allowed");
    expect(result.status).toBe(0);
  });

  it("許可していないライセンスがあれば失敗し，部品とライセンスを表示する", () => {
    const result = license("denied");
    expect(result.output).toContain(
      "tinymce@7.9.3: GPL-2.0-or-later は許可されていない",
    );
    expect(result.status).toBe(1);
  });

  it("ライセンスが分からない部品があれば失敗する", () => {
    const result = license("unknown");
    expect(result.output).toContain("mystery@1.0.0: ライセンスが分からない");
    expect(result.status).toBe(1);
  });
});
