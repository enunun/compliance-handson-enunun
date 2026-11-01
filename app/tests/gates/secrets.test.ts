import { cpSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appRoot, fixture, run } from "./helpers.ts";

const leakedKey = "pk_51c8e3a9f07b2d46e1a5c9f38b7d2e04";

function git(dir: string, ...args: string[]) {
  run(
    "git",
    ["-c", "user.name=t", "-c", "user.email=t@example.com", ...args],
    dir,
  );
}

/**
 * fixtures/secrets/<name> を中身にした，一時的なgitのリポジトリを作る．
 * commit が false なら，中身をステージするだけでコミットしない．
 */
function repoFrom(name: string, { commit = true } = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "gate-secrets-"));
  git(dir, "init", "-q");
  git(dir, "commit", "-q", "--allow-empty", "-m", "init");
  cpSync(fixture("secrets", name), dir, { recursive: true });
  git(dir, "add", "-A");
  if (commit) {
    git(dir, "commit", "-qm", name);
  }
  return dir;
}

describe("gate:secrets", () => {
  it("キーを含むコミットが履歴にあれば失敗する", () => {
    const result = run("mise", ["run", "gate:secrets", repoFrom("leaked")]);
    expect(result.output).toContain("leaks found: 1");
    expect(result.status).not.toBe(0);
  });

  it("キーを含まないリポジトリでは通る", () => {
    const result = run("mise", ["run", "gate:secrets", repoFrom("clean")]);
    expect(result.output).toContain("no leaks found");
    expect(result.status).toBe(0);
  });

  it("出力と証跡にキーそのものを書かない", () => {
    const result = run("mise", ["run", "gate:secrets", repoFrom("leaked")]);
    const report = readFileSync(
      join(appRoot, "out/evidence/secrets/gitleaks.json"),
      "utf8",
    );
    expect(report).toContain("generic-api-key");
    expect(result.output).not.toContain(leakedKey);
    expect(report).not.toContain(leakedKey);
  });
});

describe("gate:secrets:staged", () => {
  it("コミットしようとしている変更にキーがあれば失敗する", () => {
    const repo = repoFrom("leaked", { commit: false });
    const result = run("mise", ["run", "gate:secrets:staged", repo]);
    expect(result.output).toContain("leaks found: 1");
    expect(result.status).not.toBe(0);
  });

  it("コミットしようとしている変更にキーがなければ通る", () => {
    const repo = repoFrom("clean", { commit: false });
    const result = run("mise", ["run", "gate:secrets:staged", repo]);
    expect(result.status).toBe(0);
  });
});
