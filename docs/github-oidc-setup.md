# GitHub OIDC Setup For AOIFMSP

## Purpose

This guide is the exact one-time Azure and GitHub trust setup required before the `Deploy Platform` workflow can sign in to Azure.

If the workflow fails with `AADSTS70025`, this is the document to follow.

## What AADSTS70025 Means

`AADSTS70025` means the Microsoft Entra app registration exists, but it does not have a federated identity credential that matches the GitHub Actions workflow that is trying to sign in.

For AOIFMSP, the deployment workflow runs in the GitHub environment named `production`.
That means the Azure app should trust this subject pattern:

```text
repo:OWNER/REPO:environment:production
```

Replace `OWNER/REPO` with your actual GitHub owner and repository name.

## Step-By-Step Setup

### 1. Create the deployment app registration

In Microsoft Entra admin center:

1. Open **App registrations**.
2. Select **New registration**.
3. Name it something clear such as `AOIFMSP GitHub Deploy`.
4. Use **Accounts in this organizational directory only**.
5. Create the app.

## 2. Capture the application and tenant IDs

From the app registration **Overview** page, copy:

- **Application (client) ID** -> `AZURE_CLIENT_ID`
- **Directory (tenant) ID** -> `AZURE_TENANT_ID`

## 3. Find the Enterprise Application object

This is the part that often causes confusion.

The **App registration** is the application definition.
The **Enterprise application** is the actual **service principal** object in your tenant.
That service principal is what Azure RBAC permissions are assigned to.

To find it:

1. Open **Enterprise applications**.
2. Search for the same app name you just created.
3. Open it.
4. Copy the **Object ID**.

That value is `AZURE_PRINCIPAL_OBJECT_ID`.

## 4. Add the federated credential

In the app registration:

1. Open **Certificates & secrets**.
2. Open **Federated credentials**.
3. Select **Add credential**.
4. Choose the GitHub Actions scenario.
5. Set these values:
   - **Organization / Owner**: your GitHub owner
   - **Repository**: your AOIFMSP repo or fork
   - **Entity type**: `Environment`
   - **Environment name**: `production`

This creates trust for:

```text
repo:OWNER/REPO:environment:production
```

Important:

- If you created trust for `master` or `main` branch instead, it may still fail because the deployment workflow uses the `production` environment.
- If you are deploying from a fork, the owner and repo must match the fork, not the upstream repo.

## 5. Grant Azure RBAC

On the target Azure subscription or deployment scope, assign the Enterprise application / service principal:

- `Contributor`
- `User Access Administrator`

These are needed because the deployment creates resources and role assignments.

## 6. Grant Microsoft Graph application permissions

In the app registration:

1. Open **API permissions**.
2. Add **Microsoft Graph** application permissions:
   - `Group.ReadWrite.All`
   - `User.Read.All`
3. Grant **admin consent**.

These are required so the workflow can create the `AOIFMSP Admins` group and add the initial admin.

## 7. Add GitHub secrets

In GitHub, add these as repository secrets or environment secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_PRINCIPAL_OBJECT_ID` recommended

## 8. Create the GitHub environment

In GitHub:

1. Open **Settings**.
2. Open **Environments**.
3. Create an environment named `production`.
4. Place the Azure secrets there if you want environment-scoped secrets.

## 9. Run the deployment

After the trust is in place:

1. Open the docs site deployment wizard.
2. Prepare the workflow inputs.
3. Run `Deploy Platform`.

## Troubleshooting

### AADSTS70025 still appears

Check all of these:

- The federated credential exists on the correct app registration.
- The repository owner and repo match the repo actually running the workflow.
- The entity type is `Environment`.
- The environment name is `production`.
- You did not accidentally create a branch-based subject instead.

### Graph returns Authorization_RequestDenied during AOIFMSP admin bootstrap

If the workflow reaches `scripts/ensure-entra-admin-group.mjs` and fails with:

```text
graph_request_failed:403:{"error":{"code":"Authorization_RequestDenied" ... }}
```

then Azure login is already working. The failure is now Microsoft Graph authorization.

For this script, the deployment app needs Microsoft Graph **application** permissions that can:

- read the bootstrap user, and
- create the `AOIFMSP Admins` group and add the user as a member.

For AOIFMSP, grant at least:

- `Group.ReadWrite.All` (Application)
- `User.Read.All` (Application)

Then select **Grant admin consent** for the tenant.

After adding permissions and granting consent, wait a few minutes and rerun the workflow.

### Graph returns Request_ResourceNotFound during AOIFMSP admin bootstrap

If the workflow reaches `scripts/ensure-entra-admin-group.mjs` and fails with a 404 like:

```text
graph_request_failed:add_bootstrap_admin_to_group:404:...
```

then the deployment app can already sign in and call Graph, but one of these objects is not available to the membership operation yet:

- the `AOIFMSP Admins` group was just created and has not fully propagated yet
- the bootstrap user does not exist in the MSP tenant as the object you expected
- the bootstrap value was supplied as a UPN/email, but the actual tenant object is a different guest or member identity

What to do:

1. Rerun the workflow once, because a just-created group can take a short time to propagate.
2. If it fails again, look in Microsoft Entra and confirm `AOIFMSP Admins` exists.
3. Confirm the bootstrap admin exists in the MSP tenant as a user object.
4. If the user is a guest/B2B identity, prefer supplying the **Object ID** instead of a friendly email/UPN.
5. Confirm the user object is the one that should be added to the group in the MSP tenant, not only in another tenant.

### Azure login works, but later deployment steps fail

That usually means:

- Azure RBAC is incomplete, or
- Microsoft Graph application permissions were added but **admin consent** was not granted.

## Related Docs

- [deployment-preparation.md](./deployment-preparation.md)
- [deployment-automation.md](./deployment-automation.md)
- [security-baseline.md](./security-baseline.md)
