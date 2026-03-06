import { createPromiseClient } from "@bufbuild/connect";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { AdminService } from "../gen/admin_connect";

// The base URL for the backend API.
// Adjust this to match your backend server address (e.g., http://localhost:8080)
const transport = createGrpcWebTransport({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

export const client = createPromiseClient(AdminService, transport);
