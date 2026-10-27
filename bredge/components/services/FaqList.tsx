"use client";

import { useState } from "react";
import { CaretDown, ChatCircleText, Clock, Coins, Compass, GlobeHemisphereWest, Package, Plugs, Question, ShieldCheck, UsersThree, type Icon } from "@phosphor-icons/react";

/**
 * FAQ list, after the references: centred list of soft rounded rows, each
 * with an icon tile, the question and a round chevron; the open row turns
 * dark with light text. One open at a time (native <details name>). The
 * first six show; "Load more" reveals the rest (all answers stay in the
 * HTML for search). Styles: app/services.css (`fq-`).
 */

const ICONS: Array<[RegExp, Icon]> = [
  [/which|start with|choose|right fit|service/i, Compass],
  [/pric|cost|fee|pay|invoice|budget/i, Coins],
  [/fast|start|long|when|time|week/i, Clock],
  [/who|team|people|senior/i, UsersThree],
  [/data|confiden|secur|nda|privacy|access/i, ShieldCheck],
  [/uk|us |us\?|countr|where|time zone/i, GlobeHemisphereWest],
  [/tool|stack|switch|power bi|system/i, Plugs],
  [/deliver|get|end|hand|own|keep/i, Package],
  [/question|call|talk|contact/i, ChatCircleText],
];
const iconFor = (q: string) => ICONS.find(([re]) => re.test(q))?.[1] ?? Question;

const FIRST = 6;

export function FaqList({ items, name }: { items: Array<[string, string]>; name: string }) {
  const [all, setAll] = useState(items.length <= FIRST);
  return (
    <>
      <div className="fq-list">
        {items.map(([q, a], i) => {
          const I = iconFor(q);
          return (
            <details key={q} name={`sv-faq-${name}`} className="fq-item" hidden={!all && i >= FIRST} open={i === 0 ? true : undefined}>
              <summary>
                <span className="fq-icon" aria-hidden="true"><I size={18} /></span>
                <span className="fq-q">{q}</span>
                <span className="fq-chev" aria-hidden="true"><CaretDown size={14} weight="bold" /></span>
              </summary>
              <div className="fq-a"><p>{a}</p></div>
            </details>
          );
        })}
      </div>
      {!all && (
        <button type="button" className="fq-more" onClick={() => setAll(true)}>
          Load more <span aria-hidden="true">({items.length - FIRST})</span>
        </button>
      )}
    </>
  );
}
