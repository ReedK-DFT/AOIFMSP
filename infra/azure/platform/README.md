# AOIFMSP Platform Deployment

## Purpose

This folder contains the first self-service Azure deployment baseline for AOIFMSP.

It is designed so an MSP can clone the repo, configure GitHub Actions authentication to Azure, and deploy the shared platform foundation without hand-creating each resource.

## What This Baseline Deploys

- Resource group for one AOIFMSP environment
- Azure Storage account for Tables, Blobs, and Queues
- Azure Key Vault with RBAC enabled
- Log Analytics workspace
- Application Insights
- Azure Functions consumption hosting plan
- Azure Function App with system-assigned managed identity
- Azure RBAC assignments so the Function App identity can access:
  - Storage Blob data
  - Storage Queue data
  - Storage Table data
  - Key Vault secrets

## Current Scope

This baseline is the platform foundation layer, not the complete application rollout.

It intentionally focuses on:

- Hosting and data-plane resources
- Runtime identity
- Security-sensitive role assignments
- GitHub Actions deployability

It does not yet automate every future platform component such as protected edge ingress, private endpoints, Foundry resources, or full Microsoft Entra app-role seeding. The GitHub deployment workflow now does include the first Entra bootstrap step for the `AOIFMSP Admins` group.

## Deployment Entry Point

- `main.bicep`
  Subscription-scope entry point that creates the resource group and invokes the resource-group module

- `resource-group.bicep`
  Resource-group module that provisions the AOIFMSP platform resources and role assignments

## Important Bootstrap Note

GitHub Actions still needs an Azure identity to authenticate before it can deploy anything.

That means each MSP needs a one-time bootstrap step to configure one of these for the GitHub repo:

- Microsoft Entra application with federated GitHub OIDC credential
- User-assigned managed identity with federated GitHub OIDC credential

That deployment identity also needs enough Azure RBAC to create resources and assign roles.

Minimum practical deployment rights:

- `Contributor` on the target subscription or resource group scope for resource creation
- `User Access Administrator` or equivalent role-assignment permission on the same scope if the workflow is expected to create RBAC assignments

## GitHub Actions

See these workflows:

- `.github/workflows/validate-platform.yml`
- `.github/workflows/deploy-platform.yml`
- `.github/workflows/deploy-policy.yml`

## Recommended Next Step

After deploying the foundation, configure the application code deployment path so the Function App package and frontend package publish into the created resources using the same GitHub OIDC model. For full clone-and-deploy onboarding, also provide a bootstrap admin UPN or object id so the workflow can create the `AOIFMSP Admins` group and add the initial administrator automatically.

