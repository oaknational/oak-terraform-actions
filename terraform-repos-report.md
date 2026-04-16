# Oaknational Repositories Containing Terraform Files

This report identifies all public repositories in the [oaknational](https://github.com/oaknational) GitHub organization that contain at least one Terraform (`.tf`) file.

> **Generated:** 2026-04-16  
> **Method:** GitHub code search (`org:oaknational extension:tf`)  
> **Total repositories scanned:** 22  

---

## Repositories with Terraform Files

| Repository | Link | `.tf` File Count | Notes |
|---|---|---|---|
| Oak-Web-Application | [oaknational/Oak-Web-Application](https://github.com/oaknational/Oak-Web-Application) | 10 | Infrastructure under `infrastructure/project/` and `infrastructure/web/` |
| oak-ai-lesson-assistant | [oaknational/oak-ai-lesson-assistant](https://github.com/oaknational/oak-ai-lesson-assistant) | 3 | Infrastructure under `infrastructure/project/` |
| oak-components | [oaknational/oak-components](https://github.com/oaknational/oak-components) | 4 | Infrastructure under `infrastructure/project/` |
| oak-robots-txt | [oaknational/oak-robots-txt](https://github.com/oaknational/oak-robots-txt) | 3 | Infrastructure under `infrastructure/project/` |
| oak-terraform-actions | [oaknational/oak-terraform-actions](https://github.com/oaknational/oak-terraform-actions) | 16 | Test fixtures and examples for the oak-terraform-linter tool |
| oak-terraform-modules | [oaknational/oak-terraform-modules](https://github.com/oaknational/oak-terraform-modules) | 36 | Terraform modules library; modules under `modules/` and usage examples under `examples/` |
| cloud-ops-ci-sandbox | [oaknational/cloud-ops-ci-sandbox](https://github.com/oaknational/cloud-ops-ci-sandbox) | 2 | Infrastructure under `infrastructure/project/` |

**Total: 7 repositories**

---

## Detailed Breakdown

### [Oak-Web-Application](https://github.com/oaknational/Oak-Web-Application) — 10 `.tf` files

| File Path |
|---|
| `infrastructure/project/builds.tf` |
| `infrastructure/project/firestore.tf` |
| `infrastructure/project/locals.tf` |
| `infrastructure/project/main.tf` |
| `infrastructure/project/variables.tf` |
| `infrastructure/web/lesson_video_buckets.tf` |
| `infrastructure/web/main.tf` |
| `infrastructure/web/monitoring.tf` |
| `infrastructure/web/terraform.tf` |
| `infrastructure/web/variables.tf` |

---

### [oak-ai-lesson-assistant](https://github.com/oaknational/oak-ai-lesson-assistant) — 3 `.tf` files

| File Path |
|---|
| `infrastructure/project/main.tf` |
| `infrastructure/project/terraform.tf` |
| `infrastructure/project/variables.tf` |

---

### [oak-components](https://github.com/oaknational/oak-components) — 4 `.tf` files

| File Path |
|---|
| `infrastructure/project/locals.tf` |
| `infrastructure/project/main.tf` |
| `infrastructure/project/terraform.tf` |
| `infrastructure/project/variables.tf` |

---

### [oak-robots-txt](https://github.com/oaknational/oak-robots-txt) — 3 `.tf` files

| File Path |
|---|
| `infrastructure/project/main.tf` |
| `infrastructure/project/terraform.tf` |
| `infrastructure/project/variables.tf` |

---

### [oak-terraform-actions](https://github.com/oaknational/oak-terraform-actions) — 16 `.tf` files

> Note: These are test fixtures and examples for the `oak-terraform-linter` tool, not production infrastructure.

| File Path |
|---|
| `oak-terraform-linter/examples/terraform-samples/bad.tf` |
| `oak-terraform-linter/examples/terraform-samples/good.tf` |
| `oak-terraform-linter/examples/terraform-samples/variables.tf` |
| `oak-terraform-linter/src/commands/parse/input.tf` |
| `oak-terraform-linter/tests/integration/fixtures/invalid-terraform/backend.tf` |
| `oak-terraform-linter/tests/integration/fixtures/invalid-terraform/bad-naming.tf` |
| `oak-terraform-linter/tests/integration/fixtures/invalid-terraform/main.tf` |
| `oak-terraform-linter/tests/integration/fixtures/invalid-terraform/nested/modules.tf` |
| `oak-terraform-linter/tests/integration/fixtures/invalid-terraform/not-variables.tf` |
| `oak-terraform-linter/tests/integration/fixtures/invalid-terraform/terraform.tf` |
| `oak-terraform-linter/tests/integration/fixtures/valid-terraform/good-naming.tf` |
| `oak-terraform-linter/tests/integration/fixtures/valid-terraform/infrastructure/project/vercel.tf` |
| `oak-terraform-linter/tests/integration/fixtures/valid-terraform/modules.tf` |
| `oak-terraform-linter/tests/integration/fixtures/valid-terraform/outputs.tf` |
| `oak-terraform-linter/tests/integration/fixtures/valid-terraform/terraform.tf` |
| `oak-terraform-linter/tests/integration/fixtures/valid-terraform/variables.tf` |

---

### [oak-terraform-modules](https://github.com/oaknational/oak-terraform-modules) — 36 `.tf` files

| File Path |
|---|
| `examples/gcp_api/module.tf` |
| `examples/gcp_api/terraform.tf` |
| `examples/gcp_api/variables.tf` |
| `examples/gcp_function/main.tf` |
| `examples/gcp_function/module.tf` |
| `examples/gcp_function/terraform.tf` |
| `examples/gcp_function/variables.tf` |
| `examples/gcp_job/main.tf` |
| `examples/gcp_job/module.tf` |
| `examples/gcp_job/terraform.tf` |
| `examples/gcp_job/variables.tf` |
| `modules/gcp_api/domain.tf` |
| `modules/gcp_api/functions.tf` |
| `modules/gcp_api/gateway.tf` |
| `modules/gcp_api/outputs.tf` |
| `modules/gcp_api/terraform.tf` |
| `modules/gcp_api/variables.tf` |
| `modules/gcp_firestore/main.tf` |
| `modules/gcp_firestore/outputs.tf` |
| `modules/gcp_firestore/terraform.tf` |
| `modules/gcp_firestore/variables.tf` |
| `modules/gcp_function/function.tf` |
| `modules/gcp_function/outputs.tf` |
| `modules/gcp_function/terraform.tf` |
| `modules/gcp_function/variables.tf` |
| `modules/gcp_job/jobs.tf` |
| `modules/gcp_job/terraform.tf` |
| `modules/gcp_job/variables.tf` |
| `modules/gcp_sql/instance.tf` |
| `modules/gcp_sql/outputs.tf` |
| `modules/gcp_sql/terraform.tf` |
| `modules/gcp_sql/variables.tf` |
| `modules/vercel_project/dns.tf` |
| `modules/vercel_project/main.tf` |
| `modules/vercel_project/terraform.tf` |
| `modules/vercel_project/variables.tf` |

---

### [cloud-ops-ci-sandbox](https://github.com/oaknational/cloud-ops-ci-sandbox) — 2 `.tf` files

| File Path |
|---|
| `infrastructure/project/main.tf` |
| `infrastructure/project/terraform.tf` |

---

## Repositories Without Terraform Files

The following repositories in the `oaknational` organization were found to contain **no** `.tf` files:

| Repository | Link |
|---|---|
| .github | [oaknational/.github](https://github.com/oaknational/.github) |
| oak-ai-autoeval-tools | [oaknational/oak-ai-autoeval-tools](https://github.com/oaknational/oak-ai-autoeval-tools) |
| oak-ai-pr-reviewer | [oaknational/oak-ai-pr-reviewer](https://github.com/oaknational/oak-ai-pr-reviewer) |
| oak-components-sandbox | [oaknational/oak-components-sandbox](https://github.com/oaknational/oak-components-sandbox) |
| oak-consent-client | [oaknational/oak-consent-client](https://github.com/oaknational/oak-consent-client) |
| oak-curriculum-ontology | [oaknational/oak-curriculum-ontology](https://github.com/oaknational/oak-curriculum-ontology) |
| oak-curriculum-schema | [oaknational/oak-curriculum-schema](https://github.com/oaknational/oak-curriculum-schema) |
| oak-open-curriculum-ecosystem | [oaknational/oak-open-curriculum-ecosystem](https://github.com/oaknational/oak-open-curriculum-ecosystem) |
| oak-release-actions | [oaknational/oak-release-actions](https://github.com/oaknational/oak-release-actions) |
| oak-repo-templates | [oaknational/oak-repo-templates](https://github.com/oaknational/oak-repo-templates) |
| oak-sre-interview-task | [oaknational/oak-sre-interview-task](https://github.com/oaknational/oak-sre-interview-task) |
| Retool-Helpers | [oaknational/Retool-Helpers](https://github.com/oaknational/Retool-Helpers) |
| netlify_github_deployment_plugin | [oaknational/netlify_github_deployment_plugin](https://github.com/oaknational/netlify_github_deployment_plugin) |
| youtube-bulk-upload | [oaknational/youtube-bulk-upload](https://github.com/oaknational/youtube-bulk-upload) |
| zero-rating | [oaknational/zero-rating](https://github.com/oaknational/zero-rating) |
