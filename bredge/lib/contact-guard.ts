/** Fail-closed lead-integrity guard. Only a verified webhook write may return 200. */
export type LeadGuardResult = { status: number; error: string } | null;

export function validateLeadSubmissionGuard(body: unknown): LeadGuardResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { status: 400, error: "Invalid form submission. Please try again." };
  }
  const fields = body as { company_website?: unknown; elapsedMs?: unknown };
  if (typeof fields.company_website === "string" && fields.company_website.trim().length > 0) {
    return { status: 422, error: "We could not verify this submission. Please email hello@thebredge.com instead." };
  }
  if (fields.company_website !== undefined && typeof fields.company_website !== "string") {
    return { status: 400, error: "Invalid form submission. Please try again." };
  }
  if (typeof fields.elapsedMs !== "number" || !Number.isFinite(fields.elapsedMs)) {
    return { status: 400, error: "Please refresh the form and submit again." };
  }
  if (fields.elapsedMs < 1200) {
    return { status: 429, error: "Please wait a moment, then submit again." };
  }
  return null;
}
