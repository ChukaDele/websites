/** Confirm the Apps Script actually acknowledged this exact durable lead ID.
 * Apps Script can return HTTP 200 for {ok:false} errors; the transport status
 * by itself is never proof that a Google Sheets row was saved.
 */
export function isSavedLeadReceipt(value: unknown, submissionId: string): boolean {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) return false;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const receipt = value as { ok?: unknown; id?: unknown; duplicate?: unknown };
  return receipt.ok === true &&
    typeof receipt.id === "string" &&
    receipt.id.toLowerCase() === ("BR-" + submissionId.toLowerCase()).toLowerCase();
}
