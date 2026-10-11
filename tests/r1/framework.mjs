// Request-scoped framework adapters for focused server tests. Browser/HTTP
// acceptance separately exercises real Next.js; these do not simulate its wire protocol.
import { AsyncLocalStorage } from "node:async_hooks";
export const requests = new AsyncLocalStorage();
export function withRequest(token, work, options = {}) {
  return requests.run({ token, writes: [], ...options }, work);
}
export async function cookies() {
  const request = requests.getStore();
  if (!request) throw new Error("Missing test request.");
  return {
    get: () => request.token ? { value: request.token } : undefined,
    set: (name, value, options) => request.writes.push({ name, value, options }),
  };
}
export function redirect(path) {
  const error = new Error("Test redirect.");
  error.destination = path;
  throw error;
}
export function revalidatePath(path) {
  const request = requests.getStore();
  request?.refreshPaths?.push(path);
  request?.onRefresh?.(path);
  if (request?.refreshFails) throw new Error("Injected refresh failure.");
}
export async function connection() {}

// Minimal hooks for static component markup checks; browser tests cover interaction.
export function useRouter() { return { refresh() {} }; }
export function usePathname() { return "/activities"; }
