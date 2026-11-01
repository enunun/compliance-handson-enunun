import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { type ItemsFile, readYaml } from "./items.ts";
import { render, renderedPath } from "./render.ts";

/** 検証で見つかった問題． */
export type Problem = { file: string; message: string };

export type VerifyOptions = {
  /** standards.yaml と items.yaml がある場所． */
  opsDir: string;
  /** ワークフローがある場所． */
  workflowsDir: string;
  /** JSON Schemaがある場所． */
  schemaDir: string;
};

/** 基準値と運用項目を検証し，見つかった問題を返す． */
export function verify(options: VerifyOptions): Problem[] {
  const problems: Problem[] = [];
  const ajv = new Ajv2020({ allErrors: true });
  addFormats.default(ajv);

  const validate = (name: string): unknown => {
    const file = join(options.opsDir, `${name}.yaml`);
    const data = readYaml(file);
    const schema = JSON.parse(
      readFileSync(join(options.schemaDir, `${name}.schema.json`), "utf8"),
    );
    if (!ajv.validate(schema, data)) {
      for (const error of ajv.errors ?? []) {
        problems.push({
          file,
          message: `${error.instancePath || "/"} ${error.message}`,
        });
      }
      return undefined;
    }
    return data;
  };

  validate("standards");
  if (existsSync(join(options.opsDir, "exceptions.yaml"))) {
    validate("exceptions");
  }
  const items = validate("items") as ItemsFile | undefined;
  if (!items) {
    return problems;
  }

  const itemsFile = join(options.opsDir, "items.yaml");
  for (const item of items.items) {
    for (const { workflow, job } of item.mechanisms) {
      const path = join(options.workflowsDir, workflow);
      if (!existsSync(path)) {
        problems.push({
          file: itemsFile,
          message: `${item.id}: ワークフロー ${workflow} がない`,
        });
        continue;
      }
      const jobs = (readYaml(path) as { jobs?: Record<string, unknown> }).jobs;
      if (!jobs || !(job in jobs)) {
        problems.push({
          file: itemsFile,
          message: `${item.id}: ${workflow} にジョブ ${job} がない`,
        });
      }
    }
    if (item.runbook && !existsSync(join(options.opsDir, item.runbook))) {
      problems.push({
        file: itemsFile,
        message: `${item.id}: 手順書 ${item.runbook} がない`,
      });
    }
  }

  const rendered = renderedPath(options.opsDir);
  if (
    !existsSync(rendered) ||
    readFileSync(rendered, "utf8") !== render(items)
  ) {
    problems.push({
      file: rendered,
      message: "items.yaml と合わない．mise run ops:render で作り直す",
    });
  }
  return problems;
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      ops: { type: "string", default: "ops" },
      workflows: { type: "string", default: "../.github/workflows" },
      schema: { type: "string", default: "ops/schema" },
    },
  });
  const problems = verify({
    opsDir: values.ops,
    workflowsDir: values.workflows,
    schemaDir: values.schema,
  });
  for (const { file, message } of problems) {
    console.error(`${file}: ${message}`);
  }
  if (problems.length > 0) {
    process.exit(1);
  }
  console.log("ops: ok");
}
