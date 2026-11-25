# Refactoring closure and external acceptance

## Internal gate (2026-11-25)

The user reported `ALL CHECKS PASSED` after running the fail-fast sequence in [PLAN](../PLAN.md) against the intended checkpoint `f18323b7b1adfb420719460284155365bf0fc509`. This is user-reported native evidence, not an independently reproduced log. The exact local HEAD, test count, comparison counts and timings were not supplied. All 11 commands were reported successful: native regression, architecture/dead-code/layout audits, and the seven pinned pattern/strength/climate/methods/authority/transit/core verifiers. The internal structural refactor is closed at that checkpoint; later tooling changes require their own validation. No empirical validity or release promotion follows.

## Performance baseline (pending measurement)

```sh
npm run --silent benchmark:refactor > benchmark-refactor.json
```

Default baseline is the original pre-pattern-refactor commit `dde2df3feb8433ebdfb924c0eefac957357a19cc`; candidate is HEAD. Both are resolved to immutable commits and loaded from detached worktrees. Optional positional arguments: baseline SHA, candidate SHA, rounds (1–100, default 3). Run on Node 22 with full Git history.

Eight workloads cover calendar, core, pattern v10, strength v4, climate v5, authority v4, movement v6 and transit v4. Twelve fixed complete charts (three years, four months) per workload, one warmup pass, three measured passes by default. Each revision/workload uses a separate Node process. Report import time, per-call latency p50/p95/mean, peak process RSS (KiB), end heap usage, mean/max UTF-8 JSON bytes, and digest comparison. Serialization is outside timed calls. Peak RSS includes Node/import/warmup and is not per-call allocation. No threshold or speedup claim before data; repeat runs in a quiet environment and treat short-call timing and memory as noisy. JSON digest is order-sensitive and is not a substitute for deep equivalence. Corpus excludes unknown hours and historical DST cases; regression verifiers cover wider boundaries.

## Consumer acceptance (pending native runs)

Current consumer checkpoints inspected via Git trees:
- saju-friends `c9aaa67f636d190bfca02b914b0ca5ee75547ba1`, dependency pin `4097b81451b348040421b40895f7152ca7bf9e65`: all 29 old root export names retained in candidate facade (static inspection, not behavior).
- rent-or-buy-kr `3a3b7879e8565af4e7592c0edc7d717af1bae652`, vendored pin `8df498cfd18d5ef364a280514ee56fdfc814be51`: all 25 vendor blobs match the manifest and pinned upstream tree; no extra vendor files (static Git object evidence).

```sh
npm run verify:consumers -- friends ../saju-friends
npm run verify:consumers -- rent ../rent-or-buy-kr
```

Optional third argument pins candidate SHA (default HEAD). Each command reads the supplied consumer checkout's HEAD and uses a temporary detached worktree. Friends runs its existing tests, typecheck and Next build before and after installing a local candidate npm tarball; validates installed source and lockfile immutability. Requires npm registry access and ordinary build prerequisites. Rent runs existing native and saju script tests, constructs a temporary new exact-source vendor manifest from Git blobs, rewrites only old vendor identifiers in consumer code/tests, verifies vendor integrity and reruns tests including the historical movement digest. No changes to actual consumer pins, branches, working trees or deployed sites. Browser E2E, cloud deployment and any baseline fixture updates are outside this check. Failures stop execution, and worktrees are removed in finally. Do not relax historical expectations to make a candidate pass.

## Status and limitations

Native benchmark and consumer scripts have not been run against complete repositories in the assistant environment (GitHub DNS unavailable). Their implementation is acceptance tooling, not acceptance evidence. Record actual report and consumer PASS outputs, with SHAs and environment, before claiming external acceptance. Keep consumer pins unchanged until a separately reviewed migration. Next engine work: versioned 成敗救應 evidence research, not another broad refactor.
