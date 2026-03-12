# AOIFMSP

AOIFMSP stands for `Automation of Integrations for Managed Service Providers`.

It is an MSP-operated application platform that deploys into the MSP's Microsoft 365 tenant and gives the MSP one place to:

- connect core platform tools such as PSA, RMM, documentation, security, and other SaaS products
- create and govern Microsoft Graph access into managed client tenants
- normalize imported API actions into standard AOIFMSP platform objects
- design and run visual workflows across those connected systems
- provide guided tenant and user administration directly in the platform
- give technicians one unified workspace across tickets, devices, documentation, workflows, and tenant context

The design goal is to reduce swivel-chair operations for MSPs without forcing them to abandon working toolchains. AOIFMSP is intended to sit over the top of the MSP stack, identify what each tool should be authoritative for, and fill gaps where tooling or configuration is weak.

## What Problem This Platform Solves

Most MSPs already have a PSA, an RMM, documentation tooling, Microsoft 365 admin responsibilities, and a growing list of niche SaaS integrations. The problem is usually not a total lack of tools. The problem is that the tools are fragmented, overlapping, inconsistently configured, and expensive in technician attention.

AOIFMSP is built to solve that by providing:

- a normalized integration layer over existing MSP tools
- a governed action catalog derived from imported Swagger/OpenAPI and curated platform review
- a workflow engine for orchestration and automation
- technician-first and admin-first interfaces that reuse the same action model
- a deployment model that an MSP can run from its own cloned repo with GitHub Actions

## Core Functional Areas

The current product direction centers on four major surfaces:

1. Technician Workspace
   Ticket-centered operations that bring together PSA, RMM, documentation, alerts, and workflow context in one scene.
2. Workflow Designer
   A MakeCode-style visual workflow environment with room for curated action blocks, custom JavaScript blocks, and Azure AI Foundry-assisted drafting.
3. Tenant Administration
   Guided MSP-centric tenant and user administration over GDAP-backed delegated access and platform-specific client app registrations.
4. Connector Studio
   Platform-admin tools for importing APIs, creating authenticated connections, reviewing normalized action mappings, and governing overlap across PSA, RMM, docs, Graph, and custom tools.

## Platform Principles

- Deploy into the MSP's Microsoft 365 tenant.
- Assume GDAP relationships with customer tenants are already in place.
- Keep production security aligned to Microsoft best practices.
- Favor low-cost Azure services and managed identity over dedicated compute and stored secrets.
- Treat imported connector actions as source material, not automatically trusted end-user features.
- Normalize platform actions so AOIFMSP does not duplicate healthy existing MSP workflows.
- Prefer guided, digestible UI patterns over expert-first admin sprawl.

## Azure Foundation

The current hosted baseline uses low-cost Azure-native building blocks where practical:

- Azure Functions
- Azure Storage Tables, Blobs, and Queues
- Azure Key Vault
- Application Insights and Log Analytics
- GitHub Actions for deployment automation

The repo also includes security baseline and Azure Policy starter material so an MSP can harden production environments rather than relying on ad hoc setup.

## Before You Deploy

An MSP preparing to deploy AOIFMSP should have these prerequisites ready:

### Microsoft 365 and Partner Readiness

- An MSP-owned Microsoft 365 tenant where AOIFMSP will be deployed.
- Existing GDAP relationships in place for customer tenants that will be managed through AOIFMSP.
- A clear understanding of which tenant users should become AOIFMSP platform administrators.

### Azure Readiness

- An Azure subscription for AOIFMSP resources.
- Permission to create resources and role assignments in that subscription.
- A decision on whether the first deployment is a `test` environment or a production-hardened environment.

### GitHub Readiness

- A cloned or forked copy of this repository owned by the MSP.
- GitHub Actions enabled for the repository.
- A GitHub-to-Azure OIDC trust configured with `azure/login`.

### Deployment Identity Readiness

The GitHub deployment identity should have:

- `Contributor` on the target subscription or resource group scope
- `User Access Administrator` or equivalent role-assignment rights on the same scope
- Microsoft Graph application permissions needed for AOIFMSP admin bootstrap:
  - `Group.ReadWrite.All`
  - `User.Read.All`

### Branding and Operator Inputs

Prepare these values before starting the deployment workflow:

- MSP display name
- MSP abbreviation
- primary brand color
- secondary brand color
- surface/background brand color
- optional logo mark image committed into the repo
- optional wordmark image committed into the repo
- initial AOIFMSP admin UPN or Entra object id

Branding values are now part of deployment so the hosted shell can reflect the MSP immediately after publish.

## How To Begin Deployment

Start here:

1. Read [deployment-automation.md](/C:/Codex/AOIFMSP/docs/deployment-automation.md).
2. Review [security-baseline.md](/C:/Codex/AOIFMSP/docs/security-baseline.md) and [security-readiness-checklist.md](/C:/Codex/AOIFMSP/docs/security-readiness-checklist.md).
3. Configure the required GitHub secrets:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`
   - optionally `AZURE_PRINCIPAL_OBJECT_ID`
4. Commit any branding assets you want to use, for example `branding/mark.png` or `branding/wordmark.svg`.
5. Run the `Deploy Platform` workflow in GitHub Actions with:
   - Azure region
   - resource group name
   - naming prefix
   - environment name
   - public network settings appropriate for test or production
   - bootstrap admin identity
   - MSP branding inputs
6. After deployment, use the workflow summary outputs to open the hosted frontend and Function App.

## Recommended First Deployment Approach

For a first MSP test deployment:

- use a dedicated `test` resource group
- keep public network access enabled for Storage and Function App unless you already have private networking planned
- provide one known-good AOIFMSP admin identity for bootstrap
- import the MSP's primary PSA, RMM, documentation, and Graph-adjacent connectors first
- review normalized connector mappings before treating imported actions as broad technician-facing features

## Important Documents

- [architecture.md](/C:/Codex/AOIFMSP/docs/architecture.md)
- [data-model.md](/C:/Codex/AOIFMSP/docs/data-model.md)
- [action-normalization.md](/C:/Codex/AOIFMSP/docs/action-normalization.md)
- [deployment-automation.md](/C:/Codex/AOIFMSP/docs/deployment-automation.md)
- [security-baseline.md](/C:/Codex/AOIFMSP/docs/security-baseline.md)
- [security-readiness-checklist.md](/C:/Codex/AOIFMSP/docs/security-readiness-checklist.md)
- [ui-ux-principles.md](/C:/Codex/AOIFMSP/docs/ui-ux-principles.md)
- [technician-workspace.md](/C:/Codex/AOIFMSP/docs/technician-workspace.md)

## Current State Of The Repo

The repo already contains:

- a shared TypeScript data model and repository layer
- Azure-backed storage adapters using Microsoft SDKs
- a deployable Azure Functions backend shell
- a deployable React frontend shell
- GitHub Actions for infrastructure and application publishing
- connector import and normalized action review scaffolding
- security baseline and policy-pack starter material

The repo is not yet a finished production application, but it is structured so an MSP can start deploying, connecting systems, and validating the operating model in a controlled environment.
