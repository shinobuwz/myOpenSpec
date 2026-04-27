# AI Knowledge Logs

Append-only audit logs for `.aiknowledge` maintenance.

Logs are sharded by month to keep each file small and rarely-read:

- [2026-04](logs/2026-04.md)

Knowledge maintenance skills should append to the current monthly shard, for example `.aiknowledge/logs/2026-04.md`.

`log.md` is only the log index. Agents usually do not need to read historical log shards unless they are auditing a previous knowledge mutation.
