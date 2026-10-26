"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import type { Article, Reader } from "./types";

const LABELS: Array<[Reader, string]> = [["operator", "Running a business in Nigeria"], ["investor", "Investing from abroad"], ["seller", "Selling to Nigerian businesses"]];

/** "What it means for you": the same findings, read three ways. */
export function ReaderTabs({ readers }: { readers: Article["readers"] }) {
  const [r, setR] = useState<Reader>("operator");
  const cur = readers[r];
  return (
    <div className="ra-readers">
      <div className="rb-readers" role="radiogroup" aria-label="I am">
        {LABELS.map(([id, label]) => (
          <button key={id} type="button" role="radio" aria-checked={r === id} className={r === id ? "is-on" : undefined} onClick={() => setR(id)}>{label}</button>
        ))}
      </div>
      <h3 key={`${r}-t`}>{cur.title}</h3>
      <ul className="rb-points" key={r}>
        {cur.points.map((p) => <li key={p}><Check size={13} weight="bold" aria-hidden="true" />{p}</li>)}
      </ul>
    </div>
  );
}
