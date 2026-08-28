# oak-terraform-actions

The `actions` folder is designed to house reusable GitHub Actions for **Terraform**, making it easy to manage and share automation across different repositories. See the Example folder to get started.

#### Structure

```plaintext
actions/
├── terraform-checks/
│   ├── action.yml
│   ├── scripts/ (if any)
│   └── README.md
```

### Terraform Actions 🌍

#### Terraform Checks

**Location:** `actions/terraform-checks`

**Purpose:** The Terraform Github Action checks your code fits the Oak standards.

#### Key Features

- **Infrastructure Management:** Streamlines Terraform commands in CI/CD pipelines.
- **Ease of Use:** Integrates seamlessly with your GitHub workflows.

### How to Use

```yaml
# Example Github Workflow file to run Terraform Check action
name: Terraform Checks

on: [push, pull_request]

jobs:
  example-job:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0
      - name: Run Terraform Action from oak-terraform-actions
        uses: oaknational/oak-terraform-actions/actions/terraform-checks@a1fe3aea1efa31ee5d29e387d584c006a2d33bcc # v1.13.1
```

Every `uses:` must reference a **full-length commit SHA** (organisation policy; workflows fail at job setup otherwise). Keep the `# vX.Y.Z` comment alongside the SHA so Dependabot can propose updates. To find the SHA for a release of this repository:

```bash
gh api repos/oaknational/oak-terraform-actions/commits/v1.13.1 --jq .sha
```

For more details, visit the [Oak Terraform Actions repository](https://github.com/oaknational/oak-terraform-actions).

# Commitlint

We're using [husky](https://github.com/typicode/husky) to create pre-commit hooks with commitlint and the [conventional commit plugin](https://github.com/conventional-changelog/commitlint).

```bash
# Example commit that passes
fix(docs): improving documentation
```
