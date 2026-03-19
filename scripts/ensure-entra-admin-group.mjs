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
    await ensureGroupMember(token, group.id, adminUser.id, group.createdByScript === true);
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
    {
      operation: 'lookup_admin_group',
    },
  );
  const current = Array.isArray(existing.value) ? existing.value[0] : null;

  if (current) {
    return {
      ...current,
      createdByScript: false,
    };
  }

  const created = await graphRequest(token, 'https://graph.microsoft.com/v1.0/groups', {
    method: 'POST',
    operation: 'create_admin_group',
    body: {
      displayName: groupDisplayName,
      description: 'AOIFMSP platform administrators in the MSP tenant.',
      mailEnabled: false,
      mailNickname: groupMailNickname,
      securityEnabled: true,
    },
  });

  return {
    ...created,
    createdByScript: true,
  };
}

async function resolveAdminUser(token) {
  if (!adminObjectId && !adminUserPrincipalName) {
    return null;
  }

  if (adminObjectId) {
    return graphRequest(token, `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(adminObjectId)}?$select=id,userPrincipalName`, {
      operation: 'resolve_bootstrap_admin_by_object_id',
    });
  }

  return graphRequest(token, `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(adminUserPrincipalName)}?$select=id,userPrincipalName`, {
    operation: 'resolve_bootstrap_admin_by_upn',
  });
}

async function ensureGroupMember(token, groupId, userId, shouldRetryForPropagation) {
  const maxAttempts = shouldRetryForPropagation ? 6 : 1;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await graphRequest(token, `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(groupId)}/members/$ref`, {
        method: 'POST',
        operation: 'add_bootstrap_admin_to_group',
        body: {
          '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${userId}`,
        },
        allowNoContent: true,
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';

      if (message.includes('added object references already exist')) {
        return;
      }

      const isNotFound = message.includes('graph_request_failed:add_bootstrap_admin_to_group:404');
      if (!isNotFound || attempt === maxAttempts) {
        lastError = error;
        break;
      }

      await sleep(attempt * 2000);
    }
  }

  throw lastError instanceof Error
    ? new Error(`${lastError.message}:groupId=${groupId}:userId=${userId}`)
    : lastError;
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
    throw new Error(`graph_request_failed:${options.operation ?? 'unknown'}:${response.status}:${body}`);
  }

  return response.json();
}

function escapeFilterValue(value) {
  return value.replace(/'/g, "''");
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
