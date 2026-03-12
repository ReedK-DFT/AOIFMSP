export function json(body, init = {}) {
    return {
        ...init,
        jsonBody: body,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            ...(init.headers ?? {}),
        },
    };
}
export function methodNotAllowed(request) {
    return json({
        error: 'method_not_allowed',
        method: request.method,
    }, { status: 405 });
}
export function logRequest(context, request) {
    context.log(`HTTP ${request.method} ${request.url}`);
}
