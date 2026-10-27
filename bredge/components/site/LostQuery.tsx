"use client";

import { useEffect, useState } from "react";
import { trackOnce } from "../../lib/analytics";

/** The 404's joke, run against the real URL: a query that returns nothing. */
export function LostQuery() {
  const [path, setPath] = useState("/this-page");
  useEffect(() => {
    const p = window.location.pathname.slice(0, 60) || "/";
    queueMicrotask(() => setPath(p));
    trackOnce("404_view", { page_path: p });
  }, []);
  return (
    <pre className="ls-query" aria-label={`No page found at ${path}`}>
      <span className="k">select</span> page{"\n"}
      <span className="k">from</span>   thebredge.com{"\n"}
      <span className="k">where</span>  url = <span className="s">&apos;{path}&apos;</span>;{"\n"}
      <span className="c">{"-- 0 rows returned. We checked the joins twice."}</span>
    </pre>
  );
}
