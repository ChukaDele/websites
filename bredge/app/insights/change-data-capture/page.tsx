import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "change-data-capture";
const TOC = [
  { id: "why", label: "Why CDC data drifts" },
  { id: "try-first", label: "How to measure CDC drift" },
  { id: "query-vs-log", label: "Query-based vs log-based CDC" },
  { id: "apply", label: "How to apply CDC changes idempotently" },
  { id: "edges", label: "Deletes, TOAST, slots and schema changes" },
  { id: "example", label: "Worked example: open orders" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When this needs a project" },
  { id: "decision", label: "Which CDC approach to use" },
];

export const metadata = insightMetadata(SLUG);

const F = { fontFamily: "var(--font-mono), ui-monospace, monospace" };

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="Log-based CDC: from the database log to an idempotent apply in the warehouse"
            caption="Committed changes are read from the log in order, delivered at least once, staged raw, then applied so the latest log position wins and deletes are explicit. Reconciliation against production closes the loop."
          >
            <svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <defs>
                <marker id="cdc-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" /></marker>
                <marker id="cdc-g" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#90d26f" /></marker>
              </defs>
              <rect x="10" y="60" width="120" height="64" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
              <text x="70" y="88">Postgres</text><text x="70" y="106" fill="#7a847f">WAL + slot</text>
              <line x1="130" y1="92" x2="172" y2="92" stroke="rgba(20,35,33,.45)" markerEnd="url(#cdc-a)" />
              <rect x="176" y="60" width="120" height="64" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
              <text x="236" y="88">connector</text><text x="236" y="106" fill="#7a847f">c · u · d · r</text>
              <line x1="296" y1="92" x2="338" y2="92" stroke="#f0bf6c" strokeWidth="1.6" markerEnd="url(#cdc-a)" />
              <text x="317" y="80" fill="#a9741f" fontSize="10">≥1×</text>
              <rect x="342" y="60" width="120" height="64" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
              <text x="402" y="88">raw changes</text><text x="402" y="106" fill="#7a847f">append only</text>
              <line x1="462" y1="92" x2="504" y2="92" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#cdc-g)" />
              <rect x="508" y="60" width="200" height="64" rx="4" fill="rgba(144,210,111,.12)" stroke="#90d26f" strokeWidth="1.6" />
              <text x="608" y="88">merge: latest LSN wins</text><text x="608" y="106" fill="#3c6b43">deletes explicit</text>
              <path d="M608 124 V178 H70 V124" fill="none" stroke="rgba(20,35,33,.3)" strokeDasharray="4 4" markerEnd="url(#cdc-a)" />
              <text x="340" y="198" fill="#7a847f">reconcile: counts and key hashes against production, on a schedule</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why does CDC data drift from the source database?</h2>
          <p>Change data capture (CDC) copies every insert, update and delete from an operational database into the warehouse, continuously or in small batches. Product companies use it to get application data into analytics. Its failures are hard to spot because the copy is almost right: counts are close, recent rows look fine, and the gap appears only when someone compares one figure with the application.</p>
          <PlainEnglish>
            <p>Many product companies copy their application database into the data warehouse so analysts can report on it. That copy drifts: deleted orders stay open, some changes arrive twice and some never arrive. The fix is to copy changes from the database&rsquo;s own log, apply them so a repeat does no harm, and compare the copy with the application on a schedule.</p>
            <ul>
              <li><strong>Ask your team</strong>: when did we last compare row counts and keys between production and the warehouse?</li>
              <li><strong>Risk to know about</strong>: a stalled replication job can fill the production database&rsquo;s disk.</li>
            </ul>
          </PlainEnglish>
          <p>The causes are specific. A sync that polls on <code>updated_at</code> never sees rows that were hard-deleted. Delivery after a failure is at least once, so the same change can arrive twice. Changes applied out of order let an older version overwrite a newer one. On PostgreSQL, an update can arrive without the values of large unchanged columns. And the schema changes under you whenever the application ships.</p>
          <Pull>Exactly-once is not something the pipeline gives you. It is something the apply step earns, by making a replayed change harmless.</Pull>
        </section>

        <section id="try-first">
          <h2>How to measure CDC drift against production</h2>
          <ForTheBusiness>Measuring drift tells you whether figures built on replicated tables can be trusted today, before anyone changes the pipeline.</ForTheBusiness>
          <TryThisFirst title="Three checks against production">
            <ol>
              <li><strong>Counts by day.</strong> For one table, count rows by created date in production (on a read replica) and in the warehouse for the last 90 days. A gap concentrated in old days points at deletes; a gap in recent days points at lag.</li>
              <li><strong>Key-level diff.</strong> For a sample of days, export primary keys plus a hash of the important columns from both sides and compare. Keys only in the warehouse are missed deletes; keys with different hashes are lost or out-of-order updates.</li>
              <li><strong>Slot lag.</strong> If you use logical replication, check how far each slot is behind. This is also an operational risk check, explained below.</li>
            </ol>
          </TryThisFirst>
          <pre>{`-- PostgreSQL: how much WAL each logical slot is holding back
select slot_name,
       active,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)) as lag
from pg_replication_slots
where slot_type = 'logical';`}</pre>
        </section>

        <section id="query-vs-log">
          <h2>Query-based vs log-based CDC: what is the difference?</h2>
          <ForTheBusiness>The cheaper method misses deleted records, which is how cancelled orders end up counted as open.</ForTheBusiness>
          <p><strong>Query-based CDC</strong> polls each table for rows changed since the last run, usually <code>where updated_at &gt; last_high_water_mark</code>. It is simple and needs no database privileges beyond reading. Its blind spots are structural:</p>
          <ul>
            <li><strong>Hard deletes are invisible.</strong> A deleted row is not returned by any query, so it lives on in the warehouse.</li>
            <li><strong>Intermediate states are lost.</strong> If an order goes from pending to paid to refunded between polls, you only ever see refunded.</li>
            <li><strong>It trusts the application to maintain <code>updated_at</code>.</strong> Bulk SQL fixes, migrations and some ORM paths change rows without touching it.</li>
            <li><strong>Late commits slip past the watermark.</strong> A long transaction can write a row with an <code>updated_at</code> earlier than the poll, but commit after it. The next poll asks for newer timestamps and never sees that row. Overlapping the watermark by a few minutes reduces this; it does not remove it.</li>
          </ul>
          <p><strong>Log-based CDC</strong> reads the database&rsquo;s transaction log: the write-ahead log (WAL) through logical replication in PostgreSQL, the binary log in MySQL. Each committed change becomes an event, in commit order, including deletes. Debezium is the common open-source implementation; managed tools such as Fivetran and Airbyte offer log-based modes for the main databases. In Debezium&rsquo;s event format, <code>op</code> is <code>c</code> (create), <code>u</code> (update), <code>d</code> (delete), <code>r</code> (read, from the initial snapshot) or <code>t</code> (truncate), and the source block carries the log sequence number (LSN), the change&rsquo;s position in the log.</p>
        </section>

        <section id="apply">
          <h2>How to apply CDC changes idempotently with MERGE</h2>
          <ForTheBusiness>This is what stops a pipeline restart from double-counting orders or revenue.</ForTheBusiness>
          <p>Debezium&rsquo;s own FAQ is candid: in normal operation each event arrives once, but after a crash or network failure consumers can see events more than once. Managed connectors have equivalent behaviour around re-syncs. So store every change raw and append-only, then apply it with three rules:</p>
          <ul>
            <li>Keep one change per key per batch: the latest.</li>
            <li>Never let an older log position overwrite a newer one.</li>
            <li>Handle deletes explicitly.</li>
          </ul>
          <p>The merge below follows all three. It never hard-deletes. A delete becomes a tombstone: the row stays, marked <code>is_deleted</code>, and keeps the log position of the delete. That matters because events can arrive out of order. If the row were removed, a late update with an older log position would find no match and be inserted again, bringing a deleted order back to life.</p>
          <pre>{`-- Snowflake: apply one batch of CDC events to the current-state table.
-- raw_cdc.orders_changes is append-only; source_lsn comes from the event.
merge into analytics.orders as t
using (
    select *
    from raw_cdc.orders_changes
    where _loaded_at > '2026-10-21 06:00:00'      -- your last applied watermark
    qualify row_number() over (
        partition by order_id
        order by source_lsn desc, _loaded_at desc
    ) = 1
) as s
on t.order_id = s.order_id
when matched and s.source_lsn > t.source_lsn and s.op = 'd' then update set
    is_deleted = true,
    source_lsn = s.source_lsn
when matched and s.source_lsn > t.source_lsn and s.op <> 'd' then update set
    status     = s.status,
    amount     = s.amount,
    updated_at = s.updated_at,
    is_deleted = false,
    source_lsn = s.source_lsn
when not matched then insert
    (order_id, status, amount, updated_at, is_deleted, source_lsn)
    values (s.order_id, s.status, s.amount, s.updated_at,
            iff(s.op = 'd', true, false), s.source_lsn);`}</pre>
          <p>What each rule protects against:</p>
          <ul>
            <li><strong>Replays</strong>: replaying a batch changes nothing, because every matched row already carries that log position and the <code>&gt;</code> comparison fails.</li>
            <li><strong>Late, older events</strong>: an update older than the tombstone is ignored, so a deleted order stays deleted.</li>
            <li><strong>Deletes for keys never seen</strong>: they are inserted as tombstones, so a later out-of-order insert for the same key cannot appear as live.</li>
            <li><strong>Re-inserted keys</strong>: a genuine insert after a delete has a newer log position, clears <code>is_deleted</code> and the row is live again.</li>
          </ul>
          <p>Filter <code>where not is_deleted</code> once, in the staging model every report reads, and keep tombstones in the table for audit. Order by the log position, not by an event timestamp: timestamps tie and clocks drift, log positions do not.</p>
          <h3>Deletes from cursor-based SaaS sources</h3>
          <p>Cursor-based SaaS sources have the same blind spot as query-based CDC. Connectors that read NetSuite, CRMs or other APIs by a last-modified cursor only see deletes if the source exposes them, through a deleted-records endpoint or a soft-delete flag. Check each connector&rsquo;s documentation for how it reports deletes, and reconcile counts against the source until you know.</p>
          <p>If you keep the history of every version rather than only the current row, the same raw table feeds a type 2 model instead; see <a href="/insights/customer-history-scd2">keeping customer history</a>.</p>
        </section>

        <section id="edges">
          <h2>How to handle deletes, TOAST values, replication slots and schema changes</h2>
          <ForTheBusiness>Each of these causes a specific wrong number, and one of them can take the production database offline.</ForTheBusiness>
          <h3>Deletes and tombstones</h3>
          <p>A Debezium delete event has <code>op = &apos;d&apos;</code> and a null <code>after</code>. By default it is followed by a tombstone: a record with the same key and a null value, which exists so Kafka log compaction can eventually drop the key. Tombstones are transport mechanics; do not load them as rows. Managed connectors usually soft-delete instead: Fivetran sets <code>_fivetran_deleted</code> to true. Decide the rule once, in staging: deleted rows are excluded from analytics models and kept in raw for audit.</p>
          <h3>Updates that arrive without every column</h3>
          <p>PostgreSQL stores large values (long text, JSON, arrays) out of line, in TOAST storage. With the default replica identity, an update that does not change such a column does not carry its value in the log, and Debezium emits a placeholder instead, configurable with <code>unavailable.value.placeholder</code>. A blind merge then overwrites a real description or JSON payload with the placeholder string. Either set <code>REPLICA IDENTITY FULL</code> on the affected tables (more WAL, full before-images) or keep the existing value whenever the incoming value equals the placeholder. Replica identity also matters for deletes: by default the before-image of a delete holds only primary key columns, and with the default setting a table without a primary key emits no update or delete events at all.</p>
          <h3>Replication slots can fill the primary&rsquo;s disk</h3>
          <p>A logical replication slot records how far the consumer has read, and PostgreSQL retains every WAL segment the slot still needs. If the connector stops for a weekend, WAL accumulates on the production primary until the connector catches up or the disk fills. Monitor slot lag with the query above and alert on it. PostgreSQL 13 and later can cap retention with <code>max_slot_wal_keep_size</code>, at the price of invalidating the slot and needing a re-snapshot. On quiet databases, Debezium&rsquo;s <code>heartbeat.interval.ms</code> lets the slot advance even when the captured tables are idle.</p>
          <h3>Schema changes from the application</h3>
          <p>Application releases change the schema under you. Each kind of change fails differently:</p>
          <ul>
            <li><strong>Added column</strong>: most connectors add it to the destination automatically</li>
            <li><strong>Renamed column</strong>: arrives as a new column, while the old one stops updating and fills with nulls from the release date</li>
            <li><strong>Changed type</strong>: the sync fails, or the connector widens the type</li>
            <li><strong>Dropped column</strong>: stops updating with no error</li>
            <li><strong>Changed meaning</strong>: a status gains a new value, or hard deletes become soft deletes, and nothing fails at all</li>
          </ul>
          <p>Catch these with dbt tests on the replicated columns your models depend on: <code>not_null</code> on keys and amounts, <code>accepted_values</code> on statuses. Run them on every load, so the first run after a release fails rather than a dashboard a week later. Ask the application team to tag migrations that drop, rename or retype those columns in their pull requests, so the change and the model update ship together.</p>
        </section>


        <section id="example">
          <h2>Worked example: open orders that never close</h2>
          <Example setting="Marketplace · PostgreSQL, query-based sync, Snowflake" title="Why the warehouse shows more open orders than the app">
            <p>Operations reports 12,400 open orders from the warehouse; the application shows 11,950. A key-level diff on the last 90 days splits the 450:</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>Cause</th><th>Evidence</th><th>Orders</th></tr></thead>
              <tbody>
                <tr><td>Hard deletes</td><td>Abandoned carts are deleted by a nightly job; the sync never sees them</td><td>310</td></tr>
                <tr><td>Bulk update without updated_at</td><td>A support script closed stale orders with raw SQL</td><td>120</td></tr>
                <tr><td>Late commit</td><td>Rows written by a long checkout transaction, committed after the poll</td><td>20</td></tr>
              </tbody>
            </table></div>
            <p>The fix was a switch to log-based capture with the idempotent merge above, a staging rule excluding deleted rows, and a weekly key-level reconciliation that now reports zero unexplained differences.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li>Ordering by event timestamp instead of log position, so ties and clock skew decide which version wins.</li>
            <li>Applying changes straight into the modelled table with no raw, append-only layer to replay from.</li>
            <li>Loading tombstones as rows, or treating a delete as an update with nulls.</li>
            <li>Merging placeholder values over real ones for unchanged large columns.</li>
            <li>Leaving a slot behind after decommissioning a connector, and finding out when the primary&rsquo;s disk alerts.</li>
            <li>Never reconciling. A copy that is not compared with its source on a schedule is assumed correct, not known to be.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When CDC reliability needs a project</h2>
          <p>One table with a polling sync can be fixed in a day. It becomes a project when many tables, several databases and a production team that ships daily are involved, because the work is as much process as code. Once the copy is trustworthy, keeping it cheap at volume is the subject of <a href="/insights/incremental-models-at-scale">processing billions of rows without full scans</a>.</p>
          <SystemBoundary
            conditions={[
              "Revenue, orders or usage figures come from replicated tables and disagree with the application.",
              "Hard deletes, bulk scripts or long transactions are normal in the source application.",
              "Connectors restart or re-sync often enough that duplicates are a real risk.",
              "Nobody monitors replication slot lag on the production database.",
              "Application schema changes regularly break models, and analytics hears about them from users.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Which CDC approach should you use?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Situation</th><th>Approach</th><th>Main risk</th></tr></thead>
            <tbody>
              <tr><td>Small tables, no hard deletes, daily freshness is enough</td><td>Query-based sync with an overlapping watermark</td><td>Late commits and bulk updates without updated_at</td></tr>
              <tr><td>Hard deletes, frequent updates, or figures that must tie to the app</td><td>Log-based CDC via a managed connector</td><td>Slot lag on the primary; connector pricing at volume</td></tr>
              <tr><td>High volume, streaming consumers beyond the warehouse</td><td>Debezium on Kafka Connect, idempotent apply</td><td>You run the infrastructure, including offsets and slots</td></tr>
              <tr><td>Billion-row tables that rarely change</td><td>Periodic full snapshot plus log-based for hot tables</td><td>Two mechanisms to reconcile</td></tr>
            </tbody>
          </table></div>
          <p>Whichever you choose, the reliability checks in <a href="/insights/is-our-data-reliable">how to know your data is reliable</a> apply: reconciliation to the source is the one that catches CDC problems.</p>
          <p>Choosing how the current-state table is rebuilt is a strategy decision; the <a href="/resources/dbt-incremental-strategy-picker">dbt incremental strategy picker</a> walks through it, and the <a href="/resources/backfill-planner">backfill planner</a> helps when a re-snapshot means reloading history. Agree how fresh the copy must be with the <a href="/resources/data-freshness-sla-calculator">data freshness SLA calculator</a>. For a full replication fix, see <a href="/services/data-projects">our data projects</a>.</p>
          <p>If ingestion cost is the issue rather than correctness, see <a href="/insights/reduce-fivetran-costs">how to reduce Fivetran costs</a>. Moving replication to a new platform needs proof that nothing changed; see <a href="/insights/warehouse-migration-parity">how to prove a migration didn&rsquo;t change the numbers</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
