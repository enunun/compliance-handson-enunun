// 依存関係の既知の脆弱性を，Trivyで検査する．
// 基準値の重大度以上の脆弱性があれば失敗する．例外に載った脆弱性は，期限まで外す．
import { parseArgs } from "node:util";
import { evidenceDirOf, runTrivy } from "./trivy.ts";

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      target: { type: "string", default: "." },
      ops: { type: "string", default: "ops" },
      exceptions: { type: "string", default: "ops/exceptions.yaml" },
    },
  });
  const { status } = runTrivy({
    args: [
      "fs",
      "--scanners",
      "vuln",
      "--skip-dirs",
      "**/node_modules,tests/gates/fixtures",
      values.target,
    ],
    evidenceDir: evidenceDirOf("sca"),
    ops: values.ops,
    exceptions: values.exceptions,
  });
  process.exit(status);
}
