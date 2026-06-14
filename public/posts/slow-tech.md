---
title: Embracing Slow Tech
date: 2024-08-10
summary: On resisting the urge to optimise every second and building software that respects attention.
---

Every millisecond shaved off a load time is celebrated. Every unnecessary
dependency is purged. We optimise relentlessly, and we are proud of it.

But speed is not the only virtue.

## The culture of haste

We have built an internet that runs on impatience. Pages must load in under a
second or users will leave. Apps must notify immediately or engagement drops.
The entire system is engineered to eliminate waiting — and yet, waiting is
something humans have always done.

### What we lose

- **Depth** — when every interaction must be instant, there is no room for
  contemplation.
- **Craft** — fast iteration cycles leave little time for refinement.
- **Attention** — the more we optimise for speed, the less we design for
  presence.

## Slow software

Slow software is not sluggish software. It is software that respects the user's
time by *not demanding it*. It loads when ready, not when the bundle finishes
hydration. It processes in batches, not in real-time. It does not ping.

### Practical principles

- **Batch instead of stream** — background jobs, deferred rendering, scheduled
  syncs.
- **Progressive enhancement** — start with HTML, add JavaScript only when it
  meaningfully improves the experience.
- **Respect the idle frame** — not every interaction needs to be a SPA
  navigation.

## The pause

The next time you are tempted to add a loading spinner, ask yourself: what if
the page just took its time and arrived complete? No skeleton, no shimmer, no
placeholder — just content, when it is ready.

That pause is not a defect. It is a feature.
