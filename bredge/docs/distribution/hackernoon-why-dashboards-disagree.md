# Why Dashboards Disagree: The Data Engineering Problem Behind the BI Layer

There is a particular silence that falls in a meeting when two people are
looking at two dashboards showing two different numbers for the same thing. The
sales director's screen says revenue was £4.5m. The board pack says £4.2m.
Someone from finance, a little quieter, says their ledger has it at £4.3m.
Nobody is lying. Nobody has made an obvious mistake. And yet the numbers will
not agree, and the meeting is about to spend forty minutes not resolving it.

If you work anywhere near a BI layer, you have been in this room. The instinct
is almost always to blame the dashboard — the tool, the chart, the person who
built it — and to ask for it to be rebuilt. That instinct is wrong, and
understanding why is the whole point of this piece.

## The dashboard is not the problem

A dashboard is a renderer. It runs a query and draws whatever comes back. It
has no opinion about what revenue means, when it should be counted, or who the
customer is. Every one of those decisions was made upstream — in the source
systems, in the pipelines, in the models — long before a pixel was drawn.

So when two dashboards disagree, the disagreement is not in the visualisation.
It is in the data engineering underneath: in the sources, the joins, the
definitions, and the identity resolution that either happened or didn't.
Rebuilding the dashboard moves the argument to a new chart. It does not settle
it, because the cause was never on the screen.

The good news is that the disagreement is almost always explainable, and it
almost always decomposes along the same four axes: **time**, **grain**,
**identity**, and **definition**. Name the axis and you have named the cause.

## The four axes

**Time.** Are the two numbers measured over the exact same window, and pulled
at the same moment? A source that refreshes hourly and one that refreshes
nightly will disagree every morning, and both will be right. Half the "bugs" in
a reconciliation are really two clocks.

**Grain.** What does one row represent? An orders table has one row per order;
an order-lines table has one row per line. Sum the wrong one, or let a
one-to-many join fan out, and you count the same money several times. Grain is
where duplication hides.

**Identity.** When are two records the same customer? Source systems mint their
own keys, so one company becomes several accounts. If "customer" resolves
differently in two systems, every per-customer figure inherits the difference.
Identity is the deepest and least visible of the four.

**Definition.** Do the two systems mean the same thing by the word? Sales books
revenue when a deal is signed. Finance recognises it over the months the
service is delivered. Both are called "revenue". They are not the same
quantity, and no amount of query-fixing will make them equal, because they are
answers to different questions.

## A worked example

Here is the meeting above, reconciled properly. All figures are synthetic. The
job is not to force the three numbers into one — it is to explain every pound
of the gap until nothing is left unaccounted for.

Start with the two systems that should be closest: sales (CRM) at £4.5m and
finance at £4.3m. A £0.2m gap. Working from records rather than totals, it
breaks down like this.

| Axis | Reconciling item | Effect |
| --- | --- | --- |
| Definition | CRM books the full contract value at signature; finance recognises it monthly over the term. One multi-year deal signed in June carries value not yet recognised. | −£0.15m |
| Timing | A handful of deals signed on 30 June had not yet been processed into the ledger when the figures were pulled. | −£0.03m |
| Identity | Two CRM accounts turned out to be one customer, double-counting a renewal. | −£0.02m |
| | **Explained** | **−£0.20m** |

The £0.2m is fully accounted for. Nothing was wrong. Sales and finance were
measuring two genuinely different quantities, plus a timing lag and one
unresolved duplicate. The reconciliation is *finished* — not because the
numbers now match, but because the difference has a reason.

Now finance at £4.3m against the board pack at £4.2m. A £0.1m gap.

| Axis | Reconciling item | Effect |
| --- | --- | --- |
| Grain / scope | The board figure deliberately excludes intercompany trade and a divested unit that finance still carries in the group ledger. | −£0.08m |
| Timing | The board pack was cut on the third working day, from a snapshot taken before some late adjustments landed. | −£0.02m |
| | **Explained** | **−£0.10m** |

Again, every pound is placed. The board number is not wrong; it is a
deliberately narrower figure, cut early. Three "conflicting" numbers turn out
to be one reality viewed through three defensible definitions and two different
clocks.

## Where the fix actually lives

Notice what the reconciliation revealed. One of the four causes — the duplicate
customer — is a data engineering bug, and it should be fixed upstream with
proper identity resolution so it never recurs. One — the timing lag — is a
pipeline scheduling question. But the largest single item, the definition gap,
is not an engineering bug at all. It is a business decision that nobody has made
explicit: which definition of revenue is *the* definition for the board.

That decision needs a home, and the home is a **semantic layer** — one governed
place where a metric like "revenue" is defined once, in plain language, owned by
a named person, and reused by every report. Without it, each analyst
re-implements the metric in their own query, and the definitions drift apart
within weeks. The dashboards then disagree not because anyone erred, but because
the organisation quietly maintains four definitions of the same word and asks
software to reconcile what the business never did.

This is the part that gets misdiagnosed most often. Teams treat a definition
problem as a data quality problem, spend a quarter "cleaning the data", and are
back in the same meeting the following year — because you cannot clean your way
out of an ambiguity nobody has resolved.

## What good looks like

Good does not mean every system holds an identical number. Systems built for
different jobs *should* report different figures. Good means every figure is
explainable and traceable:

- One governed definition per metric, written down and owned — not forty copies
  scattered across forty queries.
- Sources reconciled on a routine, so the gap is a monitored check rather than a
  monthly fire drill.
- Identity resolved once, upstream, so "customer" means the same thing
  everywhere.
- Tests that fail loudly when a join fans out or a source double-counts.
- Lineage you can follow from any tile back to the source row it came from.

When those are in place, a disagreement stops being a crisis and becomes
information. It tells you two definitions have diverged, and you can say exactly
where and why — in minutes, not in another forty-minute meeting.

The next time two dashboards disagree, resist the urge to rebuild the chart.
Pull the records, line them up on the same window, and sort the gap into time,
grain, identity, and definition. The number was never wrong. The organisation
just had more than one of them.

---

*The team at The Bredge builds and repairs the data engineering underneath the
BI layer. This piece draws on synthetic examples; the reconciliation checks it
references are open-source under the MIT licence.*
