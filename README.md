# preperations-concepts-etcetc

This is a folder of conversations to learn and push my learnings and stuff like that as I
prepare for interviews, learn new things. I usually learn by doing it and doing it
consistently.

Each "Build" below is a small, self-contained project where I practice a concept end to end.

## Builds

### Build 1 — Expense Tracker (`src/expense-tracker`)

An expense rules engine built in TypeScript (Bun runtime).

- **Concepts practiced:** Strategy Pattern, Open-Closed Principle (add new rules without
  touching the engine), rule priority ordering, and an audit log.
- **Key design:**
  - `IExpenseRule` interface — each rule (`AmountRule`, `RestrictedVendorRule`,
    `HotelReceiptRule`, `TravelApprovalRule`) implements `validate(expense)` and carries a
    `priority`.
  - `ExpenseValidationEngine` collects rules via a chainable `addRule` / `addCriticalRule`
    API, runs critical rules first, then the rest sorted by priority.
  - Every rule run is recorded in an audit log (`ruleName`, `passed`, `reason`, `ranAt`),
    and failures are collected into a single result.
- **Context:** Round 4 (Rules Engine Design) interview prep.
- **Run it:**
  ```bash
  cd src/expense-tracker
  bun install
  bun run index.ts
  ```