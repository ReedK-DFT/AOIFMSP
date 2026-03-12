import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
export declare function json(body: unknown, init?: HttpResponseInit): HttpResponseInit;
export declare function methodNotAllowed(request: HttpRequest): HttpResponseInit;
export declare function logRequest(context: InvocationContext, request: HttpRequest): void;
//# sourceMappingURL=http.d.ts.map