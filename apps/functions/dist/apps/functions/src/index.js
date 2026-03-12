import { app } from '@azure/functions';
import './http/health.js';
import './http/bootstrap-context.js';
import './http/session.js';
import './http/technician-home.js';
import './http/tenants.js';
import './http/workflows.js';
app.setup({
    enableHttpStream: true,
});
