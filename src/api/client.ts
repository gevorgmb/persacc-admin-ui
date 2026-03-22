import { createPromiseClient, type Interceptor } from "@bufbuild/connect";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { AdminService } from "../gen/admin_connect";

const authInterceptor: Interceptor = (next) => async (req) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        req.header.set('Authorization', `Bearer ${token}`);
    }

    const activeOrgId = localStorage.getItem('active_organization_id');
    // Do not attach organization_id to OAuth or Organization-related requests
    if (activeOrgId && !req.method.name.startsWith('OAuth') && !req.method.name.startsWith('Organization') && !req.method.name.startsWith('CreateOrganization') && !req.method.name.startsWith('ListOrganizations') && !req.method.name.startsWith('GetOrganization') && !req.method.name.startsWith('UpdateOrganization') && !req.method.name.startsWith('DeleteOrganization')) {
        req.header.set('organization_id', activeOrgId);
    }
    
    return await next(req);
};

// The base URL for the backend API.
// Adjust this to match your backend server address (e.g., http://localhost:8080)
const transport = createGrpcWebTransport({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    interceptors: [authInterceptor],
});

export const client = createPromiseClient(AdminService, transport);
