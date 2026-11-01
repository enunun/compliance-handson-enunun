// 例外の期限を検査する．期限切れの例外と，基準値の最長の日数を超える例外があれば失敗する．
import { parseArgs } from "node:util";
import {
  type Exception,
  readExceptions,
  readStandards,
} from "../ops/standards.ts";

const day = 24 * 60 * 60 * 1000;

/** 例外の期限の問題を返す．today は YYYY-MM-DD である． */
export function checkExceptions(
  exceptions: Exception[],
  maxDays: number,
  today: string,
): string[] {
  const now = Date.parse(today);
  return exceptions.flatMap((e) => {
    const days = (Date.parse(e.expires) - now) / day;
    if (days < 0) {
      return [`${e.id}: 期限(${e.expires})を過ぎている`];
    }
    if (days > maxDays) {
      return [`${e.id}: 期限(${e.expires})が基準値の${maxDays}日を超えている`];
    }
    return [];
  });
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      ops: { type: "string", default: "ops" },
      exceptions: { type: "string", default: "ops/exceptions.yaml" },
      today: {
        type: "string",
        default: new Date().toISOString().slice(0, 10),
      },
    },
  });
  const exceptions = readExceptions(values.exceptions);
  const problems = checkExceptions(
    exceptions,
    readStandards(values.ops).exception.max_days,
    values.today,
  );
  for (const problem of problems) {
    console.error(problem);
  }
  if (problems.length > 0) {
    process.exit(1);
  }
  console.log(`exceptions: ${exceptions.length} active, 0 expired`);
}
