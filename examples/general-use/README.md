### Using the Terraform Action from `oaknational/oak-terraform-actions`

To use the Terraform action from the `oaknational/oak-terraform-actions` repository in your GitHub workflows, follow these steps:

1. **Create a Workflow File**: In your target repository, create a `.github/workflows` directory if it doesn't exist.

2. **Add Workflow Configuration**: Create a workflow file (e.g., `main.yml`) with the following content:

```yaml
name: oak-terraform-action

on:
  push:
    branches:
      - main

jobs:
  example-job:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0

      - name: Run Terraform Action from oak-terraform-actions
        # Update the commit SHA (and version comment) to the latest release before using:
        #   gh api repos/oaknational/oak-terraform-actions/commits/vX.Y.Z --jq .sha
        uses: oaknational/oak-terraform-actions/actions/terraform-checks@a1fe3aea1efa31ee5d29e387d584c006a2d33bcc # v1.13.1
```

### Explanation

- **uses: oaknational/oak-terraform-actions/actions/terraform-checks@\<commit-sha\> # vX.Y.Z**: Specifies the action from the `oak-terraform-actions` repository. Organisation policy requires every action to be pinned to a full-length commit SHA — tags such as `@main` or `@v4` are rejected at job setup. Keep the version comment so Dependabot can propose updates.
- **example_input**: Replace this with the actual input parameters required by the Terraform action 😉.

This setup allows you to incorporate the reusable Terraform action in your CI/CD workflows. For more details, visit the [oaknational/oak-terraform-actions repository](https://github.com/oaknational/oak-terraform-actions).
