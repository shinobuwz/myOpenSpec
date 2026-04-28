function normalizeLines(input) {
  if (Array.isArray(input)) {
    return input;
  }
  return String(input ?? "").split(/\r?\n/);
}

function parseFinalJson(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isCollabTool(event, tool) {
  return event?.type === "item.completed" &&
    event.item?.type === "collab_tool_call" &&
    event.item?.tool === tool;
}

function hasReceiverThreadIds(item) {
  return Array.isArray(item?.receiver_thread_ids) && item.receiver_thread_ids.length > 0;
}

function hasCompletedAgentState(item) {
  return Object.values(item?.agents_states ?? {}).some((state) => state?.status === "completed");
}

export function parseSubagentTrace(input) {
  const events = [];
  const nonJsonLines = [];

  for (const line of normalizeLines(input)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    try {
      events.push(JSON.parse(trimmed));
    } catch {
      nonJsonLines.push(trimmed);
    }
  }

  const spawnEvents = events.filter((event) => isCollabTool(event, "spawn_agent"));
  const waitEvents = events.filter((event) => isCollabTool(event, "wait"));
  const closeEvents = events.filter((event) => isCollabTool(event, "close_agent"));
  const agentMessages = events
    .filter((event) => event?.type === "item.completed" && event.item?.type === "agent_message")
    .map((event) => event.item.text)
    .filter((text) => typeof text === "string");

  const spawnSucceeded = spawnEvents.some((event) =>
    event.item?.status === "completed" && hasReceiverThreadIds(event.item)
  );
  const waitCompleted = waitEvents.some((event) =>
    event.item?.status === "completed" && hasCompletedAgentState(event.item)
  );
  const closeCompleted = closeEvents.some((event) =>
    event.item?.status === "completed" && hasCompletedAgentState(event.item)
  );

  const finalMessage = agentMessages.at(-1) ?? "";
  const finalResult = parseFinalJson(finalMessage);

  const warnings = [];
  const reasons = [];

  if (nonJsonLines.length > 0) {
    warnings.push(`Trace contained ${nonJsonLines.length} non-JSON line(s).`);
  }

  const retryDetected = nonJsonLines.some((line) => /error|retry|rejected|fork/i.test(line)) ||
    agentMessages.some((text) => /retry|rejected/i.test(text));
  if (retryDetected && spawnSucceeded) {
    warnings.push("A spawn retry or initial spawn rejection was observed before success.");
  }

  if (!spawnSucceeded) {
    reasons.push("Missing successful spawn_agent event with receiver_thread_ids.");
  }
  if (!waitCompleted) {
    reasons.push("Missing wait event with completed subagent state.");
  }
  if (!finalResult) {
    reasons.push("Missing or malformed final JSON result.");
  } else {
    if (finalResult.status === "inconclusive") {
      warnings.push("Final JSON status is inconclusive.");
    } else if (finalResult.status !== "pass") {
      reasons.push(`Final JSON status is ${JSON.stringify(finalResult.status)}, not "pass".`);
    }
    if (finalResult.subagent_result_seen !== true) {
      reasons.push("Final JSON does not confirm subagent_result_seen=true.");
    }
  }

  if (spawnSucceeded && waitCompleted && !closeCompleted) {
    warnings.push("Subagent completed but close_agent completion was not observed.");
  }

  return {
    status: reasons.length > 0 ? "fail" : finalResult?.status === "inconclusive" ? "inconclusive" : "pass",
    spawnSucceeded,
    waitCompleted,
    closeCompleted,
    finalResult,
    warnings,
    reasons,
    metrics: {
      events: events.length,
      nonJsonLines: nonJsonLines.length,
      spawnEvents: spawnEvents.length,
      waitEvents: waitEvents.length,
      closeEvents: closeEvents.length,
    },
  };
}

export function withGitStateGuard(result, beforeStatus, afterStatus) {
  const guarded = {
    ...result,
    warnings: [...(result.warnings ?? [])],
    reasons: [...(result.reasons ?? [])],
  };

  if (beforeStatus !== afterStatus) {
    guarded.status = "fail";
    guarded.reasons.push("The working tree changed during the eval run.");
  }

  return guarded;
}
