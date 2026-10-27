import { redirect } from "next/navigation";
import { redirectedResources } from "../../../lib/resources";

// Folded into the parent insight, which already carries the six readiness
// questions; this URL stays alive for old links and bookmarks.
export default function Page() {
  redirect(redirectedResources["data-warehouse-readiness"]);
}
