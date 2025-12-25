import { createAuthClient } from "better-auth/vue";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://10.0.0.26:3000",
});
