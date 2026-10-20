import axios, { isAxiosError } from "axios";
import { readAdminToken } from "../admin/token";
import i18n from "../i18n";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// No default Content-Type: axios picks JSON for objects and multipart (with
// the boundary) for FormData. Forcing JSON turned FormData into JSON bodies.
export const client = axios.create({ baseURL: apiBaseUrl });

client.interceptors.request.use((config) => {
  const token = readAdminToken();
  if (token) {
    config.headers["X-Admin-Token"] = token;
  }
  return config;
});

interface ValidationIssue {
  loc?: (string | number)[];
  msg: string;
}

/** Turns an API error into a message fit for showing to the user. */
export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : String(error);
  }
  if (!error.response) {
    return i18n.t("errors.offline");
  }
  if (error.response.status === 401) {
    return i18n.t("errors.unauthorized");
  }
  const detail = (error.response.data as { detail?: unknown } | undefined)
    ?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return (detail as ValidationIssue[])
      .map((issue) => {
        const field = issue.loc?.filter((part) => part !== "body").at(-1);
        return field ? `${field}: ${issue.msg}` : issue.msg;
      })
      .join("; ");
  }
  return i18n.t("errors.requestFailed", { status: error.response.status });
}
