import { createPromiseClient, type Interceptor } from "@bufbuild/connect";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { AdminService } from "../gen/admin_connect";

const authInterceptor: Interceptor = (next) => async (req) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        req.header.set('Authorization', `Bearer ${token}`);
    }

    const activeOrgId = localStorage.getItem('active_organization_id');
    // Do not attach organization-id to OAuth or Organization-related requests
    const isSpecialRequest = req.method.name.startsWith('OAuth') ||
        req.method.name.toLowerCase().includes('organization');

    if (activeOrgId && !isSpecialRequest) {
        console.log(`Setting organization-id: ${activeOrgId} for ${req.method.name}`);
        req.header.set('organization-id', activeOrgId);
    } else {
        console.log(`Skipping organization-id for ${req.method.name} (orgId: ${activeOrgId}, isSpecial: ${isSpecialRequest})`);
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
