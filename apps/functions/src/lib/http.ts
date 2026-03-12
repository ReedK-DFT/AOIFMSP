import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export function json(body: unknown, init: HttpResponseInit = {}): HttpResponseInit {
  return {
    ...init,
    jsonBody: body,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers ?? {}),
    },
  };
}

export function methodNotAllowed(request: HttpRequest): HttpResponseInit {
  return json(
    {
      error: 'method_not_allowed',
      method: request.method,
    },
    { status: 405 },
  );
}

export function logRequest(context: InvocationContext, request: HttpRequest): void {
  context.log(`HTTP ${request.method} ${request.url}`);
}
