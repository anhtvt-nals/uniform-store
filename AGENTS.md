# Project Instructions

Before making changes:
1. Read .ai/memory.md
2. Follow architecture rules
3. Update .ai/memory.md when major changes happen

## Golden Rule: Frontend-First API Implementation

Before implementing any backend endpoint:
1. Find which frontend component/page consumes the data (check `.ai/frontend-api-inventory.md` and `.ai/frontend-analysis.md`)
2. Match the expected response shape exactly — do not redesign unless necessary
3. If changing the API contract is unavoidable, document the rationale in `.ai/decisions.md`

Backend exists to serve the storefront, not the other way around.

Project memory:
@.ai/memory.md