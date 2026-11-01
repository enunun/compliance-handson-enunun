import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { type ItemsFile, readYaml } from "./items.ts";

const header = `<!-- このファイルは mise run ops:render で items.yaml から生成する．手で編集しない． -->

# 運用項目一覧
`;

/** 運用項目一覧のMarkdownを作る． */
export function render({ items }: ItemsFile): string {
  const rows = items.map((item) =>
    [
      item.id,
      item.title,
      item.category,
      item.requirements.join("<br>"),
      item.mechanisms.map((m) => `${m.workflow}: ${m.job}`).join("<br>"),
      item.evidence,
      item.timing,
      item.actor,
      item.runbook ? `[手順書](${item.runbook})` : "",
    ].join(" | "),
  );
  return [
    header,
    "| ID | 項目 | 分類 | 要求 | 仕組み | 証跡 | タイミング | 実施者 | 手順書 |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((row) => `| ${row} |`),
    "",
  ].join("\n");
}

/** 一覧のファイルの場所． */
export function renderedPath(opsDir: string): string {
  return join(opsDir, "items.md");
}

if (import.meta.main) {
  const opsDir = "ops";
  const items = readYaml(join(opsDir, "items.yaml")) as ItemsFile;
  writeFileSync(renderedPath(opsDir), render(items));
  console.log(`wrote ${renderedPath(opsDir)}`);
}
