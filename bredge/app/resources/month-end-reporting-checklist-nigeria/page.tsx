import { redirect } from "next/navigation";
import { redirectedResources } from "../../../lib/resources";

// Retired in the US and UK refocus. The data side of the close is covered by
// the reporting automation map; this URL stays alive for old links.
export default function Page() {
  redirect(redirectedResources["month-end-reporting-checklist-nigeria"]);
}
