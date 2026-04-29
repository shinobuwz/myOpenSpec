#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import path from "node:path";

import { installSkills } from "./opsx.mjs";

function isTruthy(value) {
  return /^(1|true|yes|on)$/i.test(String(value ?? ""));
}

export function shouldRunPostinstall(env = process.env) {
  if (isTruthy(env.OPSX_SKIP_POSTINSTALL)) {
    return false;
  }

  return (
    isTruthy(env.OPSX_POSTINSTALL) ||
    isTruthy(env.npm_config_global) ||
    env.npm_config_location === "global"
  );
}

export function runPostinstall({
  env = process.env,
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  if (!shouldRunPostinstall(env)) {
    return 0;
  }

  try {
    const result = installSkills({
      targetRoot: env.OPSX_AGENTS_SKILLS_HOME,
      commonRoot: env.OPSX_COMMON_HOME,
    });
    stdout.write(`Installed ${result.count} OPSX skills: ${result.targetRoot}\n`);
    stdout.write(`Installed ${result.commonCount} OPSX common contracts: ${result.commonRoot}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`OPSX postinstall skipped: ${message}\n`);
  }

  return 0;
}

function isCliEntryPoint() {
  if (!process.argv[1]) {
    return false;
  }

  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isCliEntryPoint()) {
  process.exitCode = runPostinstall();
}
