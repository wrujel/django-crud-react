import axios from "axios";

/**
 * Base URL resolution:
 *  - dev: talk to the local Django server on :8000
 *  - prod: same-origin by default (Django serves the built SPA), unless an
 *    explicit VITE_BACKEND_URL is provided.
 */
const baseURL =
  import.meta.env.VITE_BACKEND_URL ??
  (import.meta.env.PROD ? "" : "http://localhost:8000");

// A request timeout keeps a slow/unreachable/cold-starting backend from
// leaving the UI hung on a loading state forever — it fails fast so the
// error + retry path can take over.
export const http = axios.create({ baseURL, timeout: 15000 });

/** True when an error is just an aborted/superseded request (not a failure). */
export function isCanceled(err) {
  return axios.isCancel(err) || err?.code === "ERR_CANCELED";
}

/** Pull a human-readable message out of a DRF/axios error. */
export function getErrorMessage(err, fallback = "Something went wrong") {
  if (err?.code === "ECONNABORTED")
    return "The server took too long to respond.";
  if (err?.code === "ERR_NETWORK")
    return "Can't reach the server — is it running?";
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first)) return first[0];
    if (typeof first === "string") return first;
  }
  return err?.message ?? fallback;
}
