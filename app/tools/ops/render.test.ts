import { describe, expect, it } from "vitest";
import { render } from "./render.ts";

describe("render", () => {
  it("運用項目を1行ずつ表にする", () => {
    const md = render({
      items: [
        {
          id: "change-management",
          title: "変更管理",
          category: "運用管理",
          requirements: ["SOC2:CC8.1", "ISO27001:A.8.32"],
          mechanisms: [{ workflow: "ci.yml", job: "check" }],
          evidence: "レビュー記録",
          timing: "定常(変更ごと)",
          actor: "自動",
          runbook: "runbooks/emergency-change.md",
        },
      ],
    });
    expect(md).toContain(
      "| change-management | 変更管理 | 運用管理 | SOC2:CC8.1<br>ISO27001:A.8.32 | ci.yml: check | レビュー記録 | 定常(変更ごと) | 自動 | [手順書](runbooks/emergency-change.md) |",
    );
  });

  it("手順書のない項目は手順書の列を空にする", () => {
    const md = render({
      items: [
        {
          id: "x",
          title: "X",
          category: "基盤運用",
          requirements: ["R"],
          mechanisms: [{ workflow: "ci.yml", job: "x" }],
          evidence: "E",
          timing: "T",
          actor: "人",
        },
      ],
    });
    expect(md).toContain("| 人 |  |");
  });
});
