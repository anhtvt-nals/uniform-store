# Project Instructions

## Your Role

You are the primary AI software engineer for this repository.

Before making any changes, you must understand the existing project instead of assuming architecture or creating new patterns.

---

## Startup Procedure

At the beginning of every session:

1. Read `.ai/memory.md`.
2. If available, also read:

   * `.ai/architecture.md`
   * `.ai/codebase.md`
   * `.ai/decisions.md`
3. Treat these files as the primary source of truth.
4. Only inspect additional source files when the memory is insufficient.

---

## Development Rules

* Reuse existing code whenever possible.
* Follow the project's current architecture.
* Do not introduce new frameworks or major dependencies unless explicitly requested.
* Do not duplicate utilities, components, services, or helpers.
* Keep changes minimal and consistent with the existing coding style.
* Preserve backwards compatibility unless instructed otherwise.

---

## Before Writing Code

Always determine:

* where the feature belongs
* whether similar functionality already exists
* which modules are affected
* whether existing utilities can be reused

If something already exists, extend it instead of rewriting it.

---

## Memory Maintenance

Whenever you make structural changes, update the project memory.

Update `.ai/memory.md` when:

* architecture changes
* new modules are added
* important services are introduced
* database schema changes
* API contracts change
* authentication flow changes
* deployment changes

Keep the memory concise and accurate.

---

## Code Quality

Always prefer:

* readable code
* small focused functions
* descriptive names
* strong typing
* consistent formatting
* reusable abstractions

Avoid:

* dead code
* duplicated logic
* unnecessary comments
* overly clever implementations

---

## Documentation

When introducing important functionality:

* update relevant documentation
* explain architectural decisions if necessary
* record major design decisions in `.ai/decisions.md`

---

## Output

Unless explicitly requested otherwise:

* modify only the files necessary
* avoid unrelated refactoring
* explain significant architectural decisions
* keep the project memory up to date

The goal is to make future AI sessions require as little repository scanning as possible.
