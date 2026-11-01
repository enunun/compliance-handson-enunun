import { describe, expect, it } from "vitest";
import { fixture, run } from "./helpers.ts";

/** コンテナイメージを検査する． */
function image(ref: string) {
  return run("pnpm", [
    "exec",
    "tsx",
    "tools/gates/image.ts",
    "--image",
    ref,
    "--exceptions",
    fixture("exceptions", "none.yaml"),
  ]);
}

describe("gate:image", () => {
  it("サポートが終わったOSのイメージなら失敗する", () => {
    const result = image("alpine:3.20");
    expect(result.output).toContain("alpine 3.20");
    expect(result.output).toContain("サポートが終わっている");
    expect(result.status).toBe(1);
  });

  it("サポート中で脆弱性のないイメージなら通る", () => {
    expect(image("gcr.io/distroless/static-debian12:nonroot").status).toBe(0);
  });
});
