type ExpenseCategory = "hotel" | "travel" | "meal" | "equipment";

type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  vendorId: string;
  hasManagerApproval: boolean;
  hasReceipt: boolean;
};

// AuditEntry — what the engine records (engine's responsibility)
type AuditEntry = {
  ruleName: string;
  passed: boolean;
  reason?: string;
  ranAt: string;
};

type RuleResult = {
  passed: boolean;
  reason?: string;
};

interface IExpenseRule {
  ruleName: string;
  priority: number;
  validate(expense: Expense): RuleResult;
}

// Rules

class AmountRule implements IExpenseRule {
  ruleName = "amount-limit";
  priority: number = 0;
  constructor(private maxAmount: number) {}
  validate(expense: Expense): RuleResult {
    if (expense.amount > this.maxAmount) {
      return {
        passed: false,
        reason: `Amount exceeds limit of ${this.maxAmount}`,
      };
    }
    return { passed: true };
  }
}

class RestrictedVendorRule implements IExpenseRule {
  ruleName = "restricted-vendor";
  priority: number = 2;
  constructor(private blockedVendors: Set<string>) {}

  validate(expense: Expense): RuleResult {
    if (this.blockedVendors.has(expense.vendorId)) {
      return {
        passed: false,
        reason: `Vendor ${expense.vendorId} is restricted vendor`,
      };
    }
    return { passed: true };
  }
}

class HotelReceiptRule implements IExpenseRule {
  ruleName = "hotel-receipt";
  priority: number = 3;
  validate(expense: Expense): RuleResult {
    if (
      expense.category === "hotel" &&
      expense.amount > 30000 &&
      !expense.hasReceipt
    ) {
      return { passed: false, reason: "No receipt for hotel expense" };
    }
    return { passed: true };
  }
}

class TravelApprovalRule implements IExpenseRule {
  ruleName = "travel-approval";
  priority: number = 3;
  validate(expense: Expense): RuleResult {
    if (expense.category === "travel" && !expense.hasManagerApproval) {
      return {
        passed: false,
        reason: "Travel expense requires manager approval",
      };
    }
    return { passed: true };
  }
}

class ExpenseValidationEngine {
  private rules: IExpenseRule[] = [];
  private criticalRules: IExpenseRule[] = [];
  addRule(rule: IExpenseRule): this {
    this.rules.push(rule);
    return this;
  }
  addCriticalRule(rule: IExpenseRule): this {
    this.criticalRules.push(rule);
    return this;
  }

  validate(expense: Expense): { passed: boolean, failures: string[], auditLog: AuditEntry[]} {
    const auditLog: AuditEntry[] = [];
    const failures: string[] = [];
    const sortedRules = [...this.rules].sort((a, b) => a.priority - b.priority);

    for (const rule of [...this.criticalRules, ...sortedRules]) {
      const result = rule.validate(expense);
      auditLog.push({
        ruleName: rule.ruleName,
        passed: result.passed,
        reason: result.reason,
        ranAt: new Date().toISOString(),
      })
      if (!result.passed && result.reason) {
        failures.push(`${rule.ruleName}: ${result.reason}`);
      }
    }
    return { passed: failures.length === 0, failures, auditLog};
  }
}

const engine = new ExpenseValidationEngine()
  .addCriticalRule(new AmountRule(5000))
  .addRule(new RestrictedVendorRule(new Set(["vendor1", "vendor2"])))
  .addRule(new TravelApprovalRule())
  .addRule(new HotelReceiptRule());

const expense: Expense = {
  id: "exp-001",
  category: "hotel",
  amount: 32200000,
  vendorId: "vendor-x",
  hasManagerApproval: false,
  hasReceipt: false,
};

const validationResult = engine.validate(expense);
console.log(validationResult);
