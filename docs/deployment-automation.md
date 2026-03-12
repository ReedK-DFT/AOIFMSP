# AOIFMSP Self-Service Deployment Model

## Purpose

AOIFMSP should be deployable by an MSP from a cloned repository with GitHub Actions as the standard deployment path.

This document defines that operating model.

## Deployment Goal

The target operator experience is:

1. Clone or fork the repo
2. Configure Azure authentication for the repo
3. Set a small set of GitHub secrets and workflow inputs
4. Run the deployment workflows
5. Get a functioning AOIFMSP platform foundation with security-sensitive Azure role assignments created automatically

## Deployment Boundary

The current repo now includes the first deployable platform foundation:

- Azure Storage account for AOIFMSP data services
- Azure Key Vault
- Log Analytics and Application Insights
- Azure Functions hosting plan and Function App
- Function App managed identity
- Azure RBAC assignments for Storage and Key Vault access
- Optional management-group policy deployment workflow for the AOIFMSP security baseline

This is the infrastructure and runtime-identity baseline. Application package publishing and richer network topology can layer onto the same workflow model.

## One-Time Bootstrap Requirement

GitHub Actions cannot deploy to Azure until the repo has an Azure identity it can use.

That means each MSP still needs one one-time bootstrap step outside the main deployment workflow:

- Create a Microsoft Entra application or user-assigned managed identity for GitHub Actions
- Add a federated identity credential that trusts the GitHub repo and branch or environment
- Grant Azure RBAC to that deployment identity
- Store the identity details in GitHub repository or environment secrets

This is a platform bootstrap, not a per-deployment manual process.

## Recommended GitHub Authentication Model

Preferred model:

- GitHub Actions OIDC with `azure/login`
- No long-lived Azure client secret stored in GitHub
- One deployment identity per MSP-owned AOIFMSP deployment repo or environment

Required GitHub secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

## Required Azure Permissions for the Deployment Identity

To let the workflow create resources and assign RBAC, the deployment identity should have:

- `Contributor` on the target subscription or deployment resource group scope
- `User Access Administrator` or equivalent role-assignment permission on the same scope

Without role-assignment permission, the workflow can create resources but cannot set the Function App access roles for Storage and Key Vault.

## Runtime Identity Model

The deployed Function App uses a system-assigned managed identity.

The deployment templates automatically assign it these data-plane roles:

- `Storage Blob Data Contributor`
- `Storage Queue Data Contributor`
- `Storage Table Data Contributor`
- `Key Vault Secrets User`

This matches the AOIFMSP architecture and security baseline: the application runtime should use Microsoft Entra-based authorization rather than storage keys or embedded secrets.

## GitHub Workflows in This Repo

### Validate Platform

Path:

- `.github/workflows/validate-platform.yml`

Purpose:

- Install dependencies
- Run TypeScript typecheck
- Build the Bicep templates

### Deploy Platform

Path:

- `.github/workflows/deploy-platform.yml`

Purpose:

- Authenticate to Azure with OIDC
- Deploy the subscription-scope AOIFMSP platform foundation
- Create runtime resources and RBAC assignments
- Emit deployment outputs in the workflow summary

### Deploy Policy Pack

Path:

- `.github/workflows/deploy-policy.yml`

Purpose:

- Deploy the AOIFMSP custom policy initiative to a management group

## Repo Inputs for the Platform Deployment Workflow

The workflow currently asks for:

- Azure region
- Resource group name
- Name prefix
- Environment name
- Storage public network access mode
- Key Vault public network access mode
- Function App public network access mode

These are intentionally explicit so each MSP can choose a lower-friction dev/test posture or a more locked-down production posture.

## Important Security Note

A repo that is easy to deploy must not become a repo that is easy to misconfigure.

For that reason, AOIFMSP keeps these design rules:

- OIDC is preferred over stored Azure secrets
- Runtime identity is managed identity first
- RBAC is created by infrastructure-as-code, not by post-deployment click paths
- Security policy deployment is available as a workflow, not a tribal-knowledge step
- Production hardening requirements remain governed by [security-baseline.md](/C:/Codex/AOIFMSP/docs/security-baseline.md)

## Known Next Deployment Gaps

The current baseline does not yet automate all final platform deployment concerns.

Still to add:

- Frontend hosting and publish path
- Application package deployment for the Function App
- Private endpoints and private DNS topology
- Protected ingress such as Front Door or equivalent edge
- Foundry resource deployment profiles
- Microsoft Entra app registration and AOIFMSP app-role seeding where needed
- Post-deploy connectivity and readiness checks

## Recommended Next Step

Use this repo baseline as the standard deploy path, then add:

1. application artifact build and publish workflows
2. production-grade private networking modules
3. post-deployment smoke tests and health validation
