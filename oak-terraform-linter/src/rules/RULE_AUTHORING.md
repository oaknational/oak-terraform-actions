# Rule Authoring Guide

## Overview

Rules are TypeScript classes that implement the `Rule` interface. They validate Terraform configurations against specific requirements.

## Rule Interface

```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  severity: "error" | "warning" | "info";
  params?: Record<string, unknown>;
  validate(
    context: TerraformFileContext,
    executionContext: ExecutionContext,
    params?: Record<string, unknown>
  ): LintViolation[];
}
```

## Creating a Custom Rule

### Step 1: Create the Rule Class

The Rule Engine will loop through all `.tf` files found in the linter's target path and call your rule's `validate` function on each one.

```typescript
import { Rule, TerraformFileContext, ExecutionContext, LintViolation } from "../core/types";

export class MyCustomRule implements Rule {
  id = "custom-my-rule-001";
  name = "My Custom Rule";
  description = "Description of what this rule checks";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    context: TerraformFileContext,
    executionContext: ExecutionContext,
    params?: Record<string, unknown>
  ): LintViolation[] {
    const violations: LintViolation[] = [];

    // Your validation logic here.

    // You can examine:
    // - context: Information about a specific .tf file including parsed HCL.
    // - executionContext: If this is running in a private repo etc. Please extend this as needed.
    // to generate violations.

    // Check parser.ts for an example of the structure of the parsed HCL JSON so you know how to manipulate it.
    // You can also use 'npm run parse' to output parsed HCL JSON of any terraform file.
    // See src/commands/parse/README.md for details.

    return violations;
  }
}
```

### Step 2: Register the Rule

Add your rule to `src/rules` and update `AVAILABLE_RULES` in `src/rules/loader.ts`:

```typescript
import { MyCustomRule } from "./my-custom";

const AVAILABLE_RULES: Record<string, new () => Rule> = {
  "naming-convention": NamingConventionRule,
  "my-custom": MyCustomRule,
};
```

### Step 3: Decide if it should be added to the Default configuration

Update `DEFAULT_RULES` in `src/rules/loader.ts`:

```typescript
const DEFAULT_RULES: RuleConfig[] = [
  {
    ruleType: "my-custom",
    enabled: true, // optional, true if omitted
    params: {
      // optional
      option1: "value1",
    },
  },
];
```

### Step 4: Add the Rule to an external config

If added to `DEFAULT_RULES` your new rule will be run if no config file is passed. However if a configuration file (json) is passed to the linter you will need to make sure your new rule is included:

```json
{
  "rules": [
    {
      "ruleType": "my-custom",
      "enabled": true,
      "params": {
        "option1": "value1"
      }
    }
  ]
}
```

### Step 5: Tests

As well as writing unit tests for your rule please also:

1. Add it to `tests/integration/configs/all.json`
1. Update or add to the files in `tests/integration/fixtures/valid-terraform/` so your rule will pass.
1. Update or add to the files in `tests/integration/fixtures/invalid-terraform/` so your rule will detect at least 1 violation.
1. Make sure all end-to-end tests pass `npm run test -- tests/integration`
1. There should be no need to add new end-to-end tests but use your judgement.

## Best Practices

1. **Clear IDs**: Use format `{organization}-{rule-name}-{version}` (e.g., `oak-naming-001`)
1. **Clear Filenames** Use format `rule-{rule-name}.ts`
1. **Helpful Messages**: Violation messages should clearly explain what's wrong
1. **Suggestions**: Provide actionable suggestions when possible
1. **Error Handling**: Gracefully handle unexpected JSON structures from the parser
1. **Documentation**: Add descriptions explaining the rule's purpose
