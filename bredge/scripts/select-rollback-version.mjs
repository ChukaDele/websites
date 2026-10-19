/** Determine the exact currently active Worker version for fail-closed rollback.
 * Never silently fall back to an older 100% deployment if the newest
 * deployment is split, malformed, or absent.
 */
export function selectCurrentWorkerVersion(history) {
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error("No Worker deployment history.");
  }
  const deployments = history.map((record) => {
    const timestamp = Date.parse(record?.created_on || "");
    if (!Number.isFinite(timestamp)) throw new Error("Malformed Worker deployment timestamp.");
    return { timestamp, record };
  });
  deployments.sort((a, b) => b.timestamp - a.timestamp);
  const newest = deployments[0].record;
  if (!Array.isArray(newest.versions) || newest.versions.length !== 1 ||
      Number(newest.versions[0]?.percentage) !== 100) {
    throw new Error("Current Worker deployment is not a single 100% version.");
  }
  const id = newest.versions[0].version_id;
  if (typeof id !== "string" || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) {
    throw new Error("Current Worker version identifier is invalid.");
  }
  return id;
}
