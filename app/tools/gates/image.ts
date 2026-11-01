// コンテナイメージを，Trivyで検査する．
// 基準値の重大度以上の脆弱性があるか，サポートが終わったOSを使っていれば失敗する．
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { evidenceDirOf, runTrivy } from "./trivy.ts";

type Report = {
  Metadata?: { OS?: { Family: string; Name: string; EOSL?: boolean } };
};

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      image: { type: "string", default: "app-api:local" },
      ops: { type: "string", default: "ops" },
      exceptions: { type: "string", default: "ops/exceptions.yaml" },
    },
  });
  const { status, report } = runTrivy({
    args: ["image", "--scanners", "vuln", values.image],
    evidenceDir: evidenceDirOf("image"),
    ops: values.ops,
    exceptions: values.exceptions,
  });
  const os = (JSON.parse(readFileSync(report, "utf8")) as Report).Metadata?.OS;
  if (os?.EOSL) {
    console.error(
      `${values.image}: ${os.Family} ${os.Name} はサポートが終わっている`,
    );
    process.exit(1);
  }
  process.exit(status);
}
