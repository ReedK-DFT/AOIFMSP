import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

import type { ConnectionAuthType, ConnectorSourceType } from '../../../../src/index.js';

const nodeRequire = createRequire(import.meta.url);
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

type HttpMethod = (typeof httpMethods)[number];

type JsonRecord = Record<string, unknown>;

export interface ConnectorImportRequest {
  connectorId?: string;
  displayName?: string;
  providerName?: string;
  category?: string | undefined;
  sourceType: ConnectorSourceType;
  defaultAuthType?: ConnectionAuthType;
  visibility?: 'private' | 'shared';
  versionLabel?: string;
  importSource?: string;
  specificationText?: string;
  documentationText?: string;
  documentationUrl?: string;
  summary?: string | undefined;
}

export interface DerivedConnectorAction {
  actionId: string;
  operationId: string;
  displayName: string;
  category?: string | undefined;
  method: Uppercase<HttpMethod>;
  pathTemplate: string;
  inputSchemaRef?: string | undefined;
  outputSchemaRef?: string | undefined;
  authRequirement?: string | undefined;
  isTriggerCapable: boolean;
  isDeprecated: boolean;
  summary?: string | undefined;
}

export interface ConnectorImportPreview {
  connectorId: string;
  displayName: string;
  providerName: string;
  category: string;
  sourceType: ConnectorSourceType;
  defaultAuthType: ConnectionAuthType;
  visibility: 'private' | 'shared';
  versionLabel: string;
  importSource: string;
  summary?: string | undefined;
  authSchemes: string[];
  schemas: string[];
  actions: DerivedConnectorAction[];
  contentDigestSha256: string;
  warnings: string[];
  sourceDocument: unknown;
}

export function deriveConnectorImportPreview(request: ConnectorImportRequest): ConnectorImportPreview {
  const warnings: string[] = [];

  if (request.sourceType === 'manual-adapter') {
    const manualPreview = deriveManualAdapterPreview(request, warnings);
    return {
      ...manualPreview,
      contentDigestSha256: createDigest(JSON.stringify(manualPreview.sourceDocument)),
      warnings,
    };
  }

  const specificationText = request.specificationText?.trim();

  if (!specificationText) {
    throw new Error('specification_text_required');
  }

  const document = parseStructuredDocument(specificationText, warnings);
  const parsedRecord = asRecord(document);
  const info = asRecord(parsedRecord.info);
  const paths = asRecord(parsedRecord.paths);
  const schemas = listSchemas(parsedRecord);
  const authSchemes = listSecuritySchemes(parsedRecord);
  const actions = deriveActionsFromOpenApi(paths, parsedRecord.security, warnings);

  if (actions.length === 0) {
    warnings.push('No operations were discovered under the OpenAPI paths object.');
  }

  return {
    connectorId: normalizeIdentifier(stringOrFallback(request.connectorId, request.displayName, info.title, request.providerName, 'connector'), 'connector'),
    displayName: stringOrFallback(request.displayName, info.title, request.providerName, 'Imported Connector'),
    providerName: stringOrFallback(request.providerName, info['x-providerName'], info.title, 'Custom Provider'),
    category: stringOrFallback(request.category, firstTag(actions), 'Custom Integration'),
    sourceType: request.sourceType,
    defaultAuthType: request.defaultAuthType ?? inferDefaultAuthType(authSchemes),
    visibility: request.visibility ?? 'private',
    versionLabel: request.versionLabel?.trim() || stringOrFallback(info.version, 'v1'),
    importSource: request.importSource?.trim() || request.documentationUrl?.trim() || 'direct-upload',
    summary: request.summary?.trim() || stringOrFallback(info.summary, info.description),
    authSchemes,
    schemas,
    actions,
    contentDigestSha256: createDigest(specificationText),
    warnings,
    sourceDocument: document,
  };
}

function deriveManualAdapterPreview(request: ConnectorImportRequest, warnings: string[]): Omit<ConnectorImportPreview, 'contentDigestSha256' | 'warnings'> {
  const documentationText = request.documentationText?.trim();
  const sourceLines = documentationText
    ? documentationText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    : [];

  const actionLines = sourceLines.filter((line) => /^[-*\d]/.test(line) || /\b(create|list|get|search|update|sync|run|queue|lookup)\b/i.test(line));
  const sourceActions = actionLines.length > 0 ? actionLines : sourceLines;
  const actions = sourceActions.slice(0, 10).map((line, index) => deriveManualAction(line, request.category, index));

  if (actions.length === 0) {
    warnings.push('Documentation import is using a placeholder action until endpoint notes are provided.');
    actions.push({
      actionId: 'reviewDocumentation',
      operationId: 'reviewDocumentation',
      displayName: 'Review Documentation Adapter',
      category: request.category?.trim() || 'Manual Adapter',
      method: 'POST',
      pathTemplate: '/manual/review-documentation',
      authRequirement: request.defaultAuthType ?? 'custom',
      isTriggerCapable: false,
      isDeprecated: false,
      summary: request.documentationUrl?.trim() || 'Manual documentation-backed connector action.',
    });
  }

  return {
    connectorId: normalizeIdentifier(stringOrFallback(request.connectorId, request.displayName, request.providerName, 'connector'), 'connector'),
    displayName: stringOrFallback(request.displayName, request.providerName, 'Documentation Adapter'),
    providerName: stringOrFallback(request.providerName, request.displayName, 'Custom Provider'),
    category: stringOrFallback(request.category, 'Manual Adapter'),
    sourceType: 'manual-adapter',
    defaultAuthType: request.defaultAuthType ?? 'custom',
    visibility: request.visibility ?? 'private',
    versionLabel: request.versionLabel?.trim() || 'v1',
    importSource: request.importSource?.trim() || request.documentationUrl?.trim() || 'manual-documentation',
    summary: request.summary?.trim() || request.documentationUrl?.trim() || 'Connector scaffolded from documentation notes.',
    authSchemes: [request.defaultAuthType ?? 'custom'],
    schemas: [],
    actions,
    sourceDocument: {
      documentationUrl: request.documentationUrl?.trim(),
      documentationText: documentationText ?? null,
      sourceLines,
    },
  };
}

function deriveManualAction(line: string, category: string | undefined, index: number): DerivedConnectorAction {
  const normalizedLine = line.replace(/^[-*\d.\s]+/, '').trim();
  const method = inferMethodFromText(normalizedLine);
  const actionId = normalizeIdentifier(normalizedLine, `manualAction${index + 1}`);

  return {
    actionId,
    operationId: actionId,
    displayName: toDisplayName(normalizedLine || `Manual Action ${index + 1}`),
    category: category?.trim() || 'Manual Adapter',
    method,
    pathTemplate: `/manual/${actionId}`,
    authRequirement: 'custom',
    isTriggerCapable: method === 'GET',
    isDeprecated: false,
    summary: normalizedLine || 'Documentation-backed action scaffold.',
  };
}

function inferMethodFromText(value: string): Uppercase<HttpMethod> {
  const normalized = value.toLowerCase();

  if (/\b(get|list|search|lookup|fetch|read)\b/.test(normalized)) {
    return 'GET';
  }

  if (/\b(update|patch|modify)\b/.test(normalized)) {
    return 'PATCH';
  }

  if (/\b(delete|remove|archive)\b/.test(normalized)) {
    return 'DELETE';
  }

  if (/\b(create|add|post|queue|run|assign|trigger|start|sync)\b/.test(normalized)) {
    return 'POST';
  }

  return 'POST';
}

function parseStructuredDocument(specificationText: string, warnings: string[]): unknown {
  try {
    return JSON.parse(specificationText) as unknown;
  } catch {
    warnings.push('The specification was parsed as YAML rather than JSON.');
  }

  try {
    const yamlModule = requireYamlModule();
    return yamlModule.parse(specificationText) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_parse_error';
    throw new Error(`invalid_specification:${message}`);
  }
}

function requireYamlModule(): { parse: (input: string) => unknown } {
  return nodeRequire('yaml') as { parse: (input: string) => unknown };
}

function deriveActionsFromOpenApi(paths: JsonRecord, globalSecurity: unknown, warnings: string[]): DerivedConnectorAction[] {
  const actions: DerivedConnectorAction[] = [];

  for (const [pathTemplate, pathValue] of Object.entries(paths)) {
    const operations = asRecord(pathValue);

    for (const method of httpMethods) {
      const operation = asRecord(operations[method]);

      if (!operation) {
        continue;
      }

      const operationId = stringOrFallback(operation.operationId, `${method}_${pathTemplate.replace(/[^a-zA-Z0-9]+/g, '_')}`);
      const inputSchemaRef = extractRequestSchemaRef(operation.requestBody);
      const outputSchemaRef = extractResponseSchemaRef(operation.responses);
      const authRequirement = formatSecurityRequirement(operation.security ?? globalSecurity);
      const category = stringOrFallback(firstString(asArray(operation.tags)), firstPathCategory(pathTemplate), 'General');

      actions.push({
        actionId: normalizeIdentifier(operationId, `${method}_${pathTemplate}`),
        operationId,
        displayName: toDisplayName(stringOrFallback(operation.summary, operation.operationId, `${method.toUpperCase()} ${pathTemplate}`)),
        category,
        method: method.toUpperCase() as Uppercase<HttpMethod>,
        pathTemplate,
        inputSchemaRef,
        outputSchemaRef,
        authRequirement,
        isTriggerCapable: method === 'get',
        isDeprecated: Boolean(operation.deprecated),
        summary: stringOrFallback(operation.summary, operation.description),
      });
    }
  }

  if (Object.keys(paths).length === 0) {
    warnings.push('The parsed document did not include any path definitions.');
  }

  return actions;
}

function extractRequestSchemaRef(requestBody: unknown): string | undefined {
  const requestRecord = asRecord(requestBody);
  const content = asRecord(requestRecord.content);

  for (const mediaType of Object.values(content)) {
    const schema = asRecord(asRecord(mediaType).schema);
    const ref = asString(schema.$ref);

    if (ref) {
      return ref;
    }
  }

  return undefined;
}

function extractResponseSchemaRef(responses: unknown): string | undefined {
  const responseRecord = asRecord(responses);

  for (const response of Object.values(responseRecord)) {
    const content = asRecord(asRecord(response).content);

    for (const mediaType of Object.values(content)) {
      const schema = asRecord(asRecord(mediaType).schema);
      const ref = asString(schema.$ref);

      if (ref) {
        return ref;
      }
    }
  }

  return undefined;
}

function listSchemas(document: JsonRecord): string[] {
  const components = asRecord(document.components);
  const schemas = asRecord(components.schemas);
  return Object.keys(schemas);
}

function listSecuritySchemes(document: JsonRecord): string[] {
  const components = asRecord(document.components);
  const securitySchemes = asRecord(components.securitySchemes);
  return Object.keys(securitySchemes);
}

function inferDefaultAuthType(authSchemes: string[]): ConnectionAuthType {
  const joined = authSchemes.join(' ').toLowerCase();

  if (joined.includes('oauth')) {
    return 'oauth2-client-credentials';
  }

  if (joined.includes('basic')) {
    return 'basic-auth';
  }

  if (joined.includes('api') || joined.includes('key')) {
    return 'api-key';
  }

  return 'custom';
}

function formatSecurityRequirement(value: unknown): string | undefined {
  const requirements = asArray(value)
    .map((item) => Object.keys(asRecord(item)))
    .flat()
    .filter(Boolean);

  if (requirements.length === 0) {
    return undefined;
  }

  return requirements.join(', ');
}

function firstPathCategory(pathTemplate: string): string | undefined {
  const segment = pathTemplate
    .split('/')
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith('{'));

  return segment ? toDisplayName(segment) : undefined;
}

function firstTag(actions: DerivedConnectorAction[]): string | undefined {
  return actions.find((action) => Boolean(action.category))?.category;
}

function normalizeIdentifier(value: string | undefined, fallback: string): string {
  const normalized = (value ?? fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);

  return normalized || fallback;
}

function toDisplayName(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, (token) => token.toUpperCase());
}

function createDigest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stringOrFallback(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function firstString(values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim();
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}


