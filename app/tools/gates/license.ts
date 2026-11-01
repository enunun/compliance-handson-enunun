// SBOM(CycloneDX)の依存関係のライセンスが，基準値で許可したものかを検査する．
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { readStandards } from "../ops/standards.ts";

type Component = {
  type: string;
  name: string;
  version?: string;
  licenses?: {
    license?: { id?: string; name?: string };
    expression?: string;
  }[];
};

/** 部品のライセンスを，SPDXの識別子か式の配列で返す． */
function licensesOf(component: Component): string[] {
  return (component.licenses ?? []).flatMap((l) => {
    const value = l.license?.id ?? l.license?.name ?? l.expression;
    return value ? [value] : [];
  });
}

/** 許可されないライセンスの部品を返す．ライセンスが分からない部品も返す． */
export function checkLicenses(
  components: Component[],
  allowed: string[],
): string[] {
  return (
    components
      // ロックファイルや自分たちのモジュールは，版を持たないので外す．
      .filter((c) => c.type !== "application" && c.version)
      .flatMap((c) => {
        const licenses = licensesOf(c);
        const name = `${c.name}@${c.version}`;
        if (licenses.length === 0) {
          return [`${name}: ライセンスが分からない`];
        }
        const denied = licenses.filter((l) => !allowed.includes(l));
        return denied.length > 0
          ? [`${name}: ${denied.join(", ")} は許可されていない`]
          : [];
      })
  );
}

if (import.meta.main) {
  const { values, positionals } = parseArgs({
    options: { ops: { type: "string", default: "ops" } },
    allowPositionals: true,
  });
  const allowed = readStandards(values.ops).license.allowed;
  const problems = positionals.flatMap((file) => {
    const sbom = JSON.parse(readFileSync(file, "utf8")) as {
      components?: Component[];
    };
    return checkLicenses(sbom.components ?? [], allowed).map(
      (p) => `${file}: ${p}`,
    );
  });
  for (const problem of problems) {
    console.error(problem);
  }
  if (problems.length > 0) {
    process.exit(1);
  }
  console.log(`license: ${positionals.length} SBOMs, all allowed`);
}
