// DockerfileとOpenTofuのコードの設定の誤りを，Trivyで検査する．
// 基準値の重大度以上の誤りがあれば失敗する．例外に載った誤りは，期限まで外す．
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
      "config",
      "--skip-dirs",
      "**/node_modules,**/.terraform,tests/gates/fixtures",
      values.target,
    ],
    evidenceDir: evidenceDirOf("config"),
    ops: values.ops,
    exceptions: values.exceptions,
  });
  process.exit(status);
}
