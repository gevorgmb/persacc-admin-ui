import { createPromiseClient, type Interceptor } from "@bufbuild/connect";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { AdminService } from "../gen/admin_connect";

const authInterceptor: Interceptor = (next) => async (req) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        req.header.set('Authorization', `Bearer ${token}`);
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
