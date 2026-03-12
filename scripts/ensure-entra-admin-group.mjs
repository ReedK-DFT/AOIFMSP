import process from 'node:process';
import { execFileSync } from 'node:child_process';

const groupDisplayName = process.env.AOIFMSP_ADMIN_GROUP_NAME?.trim() || 'AOIFMSP Admins';
const groupMailNickname = process.env.AOIFMSP_ADMIN_GROUP_MAIL_NICKNAME?.trim() || 'aoifmsp-admins';
const adminUserPrincipalName = process.env.AOIFMSP_BOOTSTRAP_ADMIN_UPN?.trim() || '';
const adminObjectId = process.env.AOIFMSP_BOOTSTRAP_ADMIN_OBJECT_ID?.trim() || '';

async function main() {
  if (!adminObjectId && !adminUserPrincipalName) {
    throw new Error('bootstrap_admin_identity_required');
  }

  const token = execFileSync('az', ['account', 'get-access-token', '--resource-type', 'ms-graph', '--query', 'accessToken', '--output', 'tsv'], {
    encoding: 'utf8',
  }).trim();

  if (!token) {
    throw new Error('graph_token_unavailable');
  }

  const group = await ensureAdminGroup(token);
  const adminUser = await resolveAdminUser(token);

  if (adminUser) {
    await ensureGroupMember(token, group.id, adminUser.id);
  }

  process.stdout.write(
    `${JSON.stringify({
      groupDisplayName,
      groupObjectId: group.id,
      bootstrapAdminObjectId: adminUser?.id ?? null,
      bootstrapAdminUserPrincipalName: adminUser?.userPrincipalName ?? null,
    })}\n`,
  );
}

async function ensureAdminGroup(token) {
  const existing = await graphRequest(
    token,
    `https://graph.microsoft.com/v1.0/groups?$filter=${encodeURIComponent(`displayName eq '${escapeFilterValue(groupDisplayName)}'`)}&$select=id,displayName`,
  );
  const current = Array.isArray(existing.value) ? existing.value[0] : null;

  if (current) {
    return current;
  }

  return graphRequest(token, 'https://graph.microsoft.com/v1.0/groups', {
    method: 'POST',
    body: {
      displayName: groupDisplayName,
      description: 'AOIFMSP platform administrators in the MSP tenant.',
      mailEnabled: false,
      mailNickname: groupMailNickname,
      securityEnabled: true,
    },
  });
}

async function resolveAdminUser(token) {
  if (!adminObjectId && !adminUserPrincipalName) {
    return null;
  }

  if (adminObjectId) {
    return graphRequest(token, `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(adminObjectId)}?$select=id,userPrincipalName`);
  }

  return graphRequest(token, `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(adminUserPrincipalName)}?$select=id,userPrincipalName`);
}

async function ensureGroupMember(token, groupId, userId) {
  try {
    await graphRequest(token, `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(groupId)}/members/$ref`, {
      method: 'POST',
      body: {
        '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${userId}`,
      },
      allowNoContent: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('added object references already exist')) {
      return;
    }

    throw error;
  }
}

async function graphRequest(token, url, options = {}) {
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json; charset=utf-8',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.allowNoContent && response.status === 204) {
    return {};
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`graph_request_failed:${response.status}:${body}`);
  }

  return response.json();
}

function escapeFilterValue(value) {
  return value.replace(/'/g, "''");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
