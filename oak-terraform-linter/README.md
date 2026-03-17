# oak-terraform-linter

A custom rule-based linter for Terraform code.

## Features

- **Rule-based validation**: Define custom linting rules in TypeScript
- **JSON configuration**: Configure which rules to apply via JSON files
- **Actionable suggestions**: Rules can provide remediation suggestions
- **Extensibility**: Implement and register custom rules
- **Strict mode**: Treat warnings as errors for CI/CD pipelines
- **Environment-aware**: Rules can access execution context (e.g., private repo flag)

## Installation

```bash
npm install
npm run build
```

## Quick Start

### Run with Defaults

```bash
npm run linter -- --path ./path/to/terraform
```

### Use Custom Rules

```bash
npm run linter -- --path ./path/to/terraform --rules ./path/to/my-rules.json
```

### Strict Mode (fails on warning logs)

```bash
npm run linter -- --path ./path/to/terraform --strict
```

## Documentation

- [Rule Authoring Guide](src/rules/RULE_AUTHORING.md) - Create custom rules
- [Examples](examples/README.md) - Sample configurations and Terraform files

## Architecture

The linter is built around four core components:

1. **Parser** (`src/core/parser.ts`) - Converts HCL2 to JSON using @cdktf/hcl2json
2. **Rules Engine** (`src/rules/engine.ts`) - Loads and executes rules against the parsed JSON
3. **Rule Loader** (`src/rules/loader.ts`) - Instantiates rules from configuration files
4. **Reporters** (`src/reporters/`) - Formats and outputs results

Rules are implemented as TypeScript classes that process the parsed configuration JSON.

