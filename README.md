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

### Build 2 — Delivery Cost Tracker (`src/delivery-tracker`)

A delivery cost tracker built in TypeScript (Bun runtime).

- **Concepts practiced:** Encapsulated domain state with `Map`-backed lookups, time-based
  cost calculation, and incremental settlement of outstanding balances.
- **Key design:**
  - `DeliveryCostTracker` owns `drivers` and `deliveries` maps plus a running `totalCost`.
  - `add_driver` / `add_delivery` register entities; delivery cost is derived from duration
    (`RATE_PER_MINUTE`), and each delivery tracks an `"unpaid" | "paid"` status.
  - `pay_up_to_time(timestamp)` settles every delivery that ended on or before a cutoff,
    while `get_total_cost` / `get_cost_to_be_paid` report lifetime and outstanding amounts.
- **Context:** Interview prep — modeling stateful domain logic.
- **Run it:**
  ```bash
  cd src/delivery-tracker
  bun install
  bun run src/delivery-tracker.ts
  ```