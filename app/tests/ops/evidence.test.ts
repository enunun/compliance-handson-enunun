import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { parse } from "yaml";
import { appRoot, run } from "../gates/helpers.ts";

// 本番の環境(mise run up で作ったMiniStackの上の環境)の，証跡の保管場所を確かめる．
let bucket: string;

function aws(...args: string[]) {
  return run("aws", ["s3api", ...args]);
}

beforeAll(() => {
  bucket = run("tofu", [
    "-chdir=infra",
    "output",
    "-raw",
    "evidence_bucket",
  ]).output.trim();
});

describe("証跡の保管場所", () => {
  it("基準値の日数だけ，消せない状態で保管する", () => {
    const standards = parse(
      readFileSync(join(appRoot, "ops/standards.yaml"), "utf8"),
    );
    const result = aws("get-object-lock-configuration", "--bucket", bucket);
    const rule = JSON.parse(result.output).ObjectLockConfiguration.Rule;
    expect(rule.DefaultRetention).toEqual({
      Mode: "COMPLIANCE",
      Days: standards.evidence.retention_days,
    });
  });

  it("保管した証跡は，版を指定しても消せない", () => {
    const file = join(tmpdir(), "evidence-test.json");
    writeFileSync(file, "{}");
    const put = JSON.parse(
      aws(
        "put-object",
        "--bucket",
        bucket,
        "--key",
        "test/evidence-test.json",
        "--body",
        file,
      ).output,
    );
    const deletion = aws(
      "delete-object",
      "--bucket",
      bucket,
      "--key",
      "test/evidence-test.json",
      "--version-id",
      put.VersionId,
    );
    expect(deletion.output).toContain("AccessDenied");
    expect(deletion.status).not.toBe(0);
  });
});
