import { join } from "node:path";
import { readYaml } from "./items.ts";

export const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof severities)[number];

/** 基準値．ops/schema/standards.schema.json の形に合う． */
export type Standards = {
  change: { required_approvals: number };
  vulnerability: { fail_severity: Severity };
  exception: { max_days: number };
  license: { allowed: string[] };
  evidence: { retention_days: number };
};

/** 例外．ops/schema/exceptions.schema.json の形に合う． */
export type Exception = {
  id: string;
  target: string;
  package?: string;
  path?: string;
  reason: string;
  approver: string;
  expires: string;
};

export function readStandards(opsDir: string): Standards {
  return readYaml(join(opsDir, "standards.yaml")) as Standards;
}

export function readExceptions(path: string): Exception[] {
  return (readYaml(path) as { exceptions: Exception[] }).exceptions;
}

/** fail_severity 以上の重大度を返す． */
export function severitiesFrom(failSeverity: Severity): Severity[] {
  return severities.slice(severities.indexOf(failSeverity));
}
