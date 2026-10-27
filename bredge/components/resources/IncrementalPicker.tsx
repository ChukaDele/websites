"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, toNum } from "./ToolActions";
import { CodeBlock } from "./CodeBlock";
import { PlainSummary, Terms } from "./Explainers";

/* dbt incremental strategy picker. Answers about the warehouse, the table and
 * how its rows change produce one recommended strategy, the reasons the others
 * were rejected, a config block for that adapter, the edge cases to test, and
 * a backfill plan. Strategy support per adapter follows the dbt docs
 * ("About incremental strategy", "Incremental microbatch", and the Snowflake,
 * BigQuery and Databricks adapter config pages), checked October 2026. */

type Wh = "snowflake" | "bigquery" | "databricks" | "redshift" | "postgres";
type Size = "small" | "large" | "huge";
type Change = "append" | "update" | "delete" | "history";
type Batch = "hour" | "day" | "month";
type State = {
  wh: Wh; size: Size; change: Change; late: boolean; lookback: string; unique: "yes" | "no"; dbt19: boolean;
  model: string; key: string; eventTime: string; updatedAt: string; deleted: string;
  begin: string; end: string; rowsPerDay: string; batch: Batch;
};

const INITIAL: State = {
  wh: "snowflake", size: "huge", change: "append", late: true, lookback: "3", unique: "yes", dbt19: true,
  model: "fct_events", key: "event_id", eventTime: "event_ts", updatedAt: "updated_at", deleted: "_fivetran_deleted",
  begin: "2024-01-01", end: "2026-10-01", rowsPerDay: "20000000", batch: "day",
};

const WH: { id: Wh; label: string }[] = [
  { id: "snowflake", label: "Snowflake" }, { id: "bigquery", label: "BigQuery" }, { id: "databricks", label: "Databricks" },
  { id: "redshift", label: "Redshift" }, { id: "postgres", label: "Postgres" },
];
const SUPPORTED: Record<Wh, string> = {
  snowflake: "append, merge (default), delete+insert, insert_overwrite (whole table only), microbatch",
  bigquery: "merge (default), insert_overwrite (partitions), microbatch",
  databricks: "append, merge (default), insert_overwrite, replace_where, delete+insert (v1.11+), microbatch",
  redshift: "append (default), merge, delete+insert, microbatch",
  postgres: "append (default), merge, delete+insert, microbatch",
};

const clean = (v: string, fb: string) => (v || fb).replace(/[^A-Za-z0-9_.]/g, "") || fb;

/** Subquery giving max(col) minus N days in each dialect, for the is_incremental() filter. */
function sinceMax(wh: Wh, col: string, n: number) {
  if (n <= 0) return `(select max(${col}) from {{ this }})`;
  switch (wh) {
    case "bigquery": return `(select timestamp_sub(max(${col}), interval ${n} day) from {{ this }})`;
    case "databricks": return `(select max(${col}) - interval ${n} days from {{ this }})`;
    case "postgres": return `(select max(${col}) - interval '${n} days' from {{ this }})`;
    default: return `(select dateadd(day, -${n}, max(${col})) from {{ this }})`;
  }
}
/** "today minus N days" in each dialect, for predicates. */
function daysAgo(wh: Wh, n: number) {
  switch (wh) {
    case "bigquery": return `date_sub(current_date(), interval ${n} day)`;
    case "databricks": return `current_date() - interval ${n} days`;
    case "postgres": return `current_date - interval '${n} days'`;
    default: return `dateadd(day, -${n}, current_date)`;
  }
}

type Rec = { id: string; strategy: string; title: string; summary: string; reasons: string[]; rejected: [string, string][]; config: string; tests: string[]; microbatch: boolean };

function recommend(s: State): Rec {
  const wh = s.wh;
  const m = clean(s.model, "my_model");
  const key = clean(s.key, "id");
  const et = clean(s.eventTime, "event_ts");
  const up = clean(s.updatedAt, "updated_at");
  const del = clean(s.deleted, "_fivetran_deleted");
  const n = s.late ? Math.max(1, Math.round(toNum(s.lookback)) || 1) : 0;
  const huge = s.size === "huge";
  const guard = huge ? ",\n    full_refresh=false" : "";
  const baseTests = [
    `Run the model twice with no new data: the row count must not change (idempotency).`,
    `Add a unique test on ${key}${s.unique === "no" ? " and confirm the de-duplication keeps the latest row" : ""}.`,
    `Run with --full-refresh on a dev copy and compare row counts and a sum of a key measure with the incremental build.`,
    `Add a column upstream and confirm on_schema_change behaves as you expect.`,
  ];

  // 1. History of changes: snapshot.
  if (s.change === "history") {
    const config = s.dbt19
      ? `# snapshots/${m}_snapshot.yml  (dbt 1.9 or later)
snapshots:
  - name: ${m}_snapshot
    relation: source('app', '${m}')
    config:
      unique_key: ${key}
      strategy: timestamp
      updated_at: ${up}
      hard_deletes: new_record   # a deleted source row gets a new row marking the deletion`
      : `-- snapshots/${m}_snapshot.sql  (before dbt 1.9)
{% snapshot ${m}_snapshot %}
{{ config(
    target_schema='snapshots',
    unique_key='${key}',
    strategy='timestamp',
    updated_at='${up}',
    invalidate_hard_deletes=True
) }}
select * from {{ source('app', '${m}') }}
{% endsnapshot %}`;
    return {
      id: "snapshot", strategy: "snapshot", microbatch: false, title: "Use a dbt snapshot (type 2 history)",
      summary: "You need to know what a row looked like on a past date. Incremental models overwrite rows; a snapshot keeps every version with dbt_valid_from and dbt_valid_to.",
      reasons: [
        "A snapshot records each change it sees, so it must run at least as often as the rows change, or intermediate versions are lost.",
        "The timestamp strategy relies on a reliable updated_at. If the source does not maintain one, use strategy: check with check_cols.",
        "If your loader already keeps history (for example Fivetran history mode with _fivetran_active, _fivetran_start and _fivetran_end), model from that instead of snapshotting twice.",
      ],
      rejected: [
        ["merge", "Keeps only the latest version of each row."],
        ["microbatch", "For immutable time-series events, not for tracking changes to records."],
      ],
      config,
      tests: [
        "Update one source row twice between runs: the snapshot should hold one closed version and one open version, not three.",
        "Delete a source row: with hard_deletes set, the open version should close (invalidate) or gain a deletion record (new_record).",
        `Add a test that only one row per ${key} has dbt_valid_to null.`,
        "Never full-refresh a snapshot: history captured so far cannot be rebuilt from the source.",
      ],
    };
  }

  // 2. Small tables: do not go incremental.
  if (s.size === "small") {
    return {
      id: "table", strategy: "table", microbatch: false, title: "Keep it as a table: do not go incremental yet",
      summary: "If a full rebuild runs in a few minutes, an incremental model adds failure modes (missed late rows, duplicates, deletes) and saves little.",
      reasons: [
        "dbt's own guidance is to start with table materialisations and move to incremental when build time or cost becomes a problem.",
        "A rebuild is idempotent by construction: no lookback, no unique key, no backfill plan to maintain.",
        "Revisit when the build time or the bytes scanned per run start to matter; the cost estimator shows when.",
      ],
      rejected: [["any incremental strategy", "Adds complexity before it pays for itself."]],
      config: `{{ config(materialized='table') }}

select *
from {{ ref('stg_${m.replace(/^fct_|^dim_/, "")}') }}`,
      tests: ["Add not_null and unique tests on the grain.", "Track build time; when it grows past what your schedule allows, run this picker again with a larger size."],
    };
  }

  // 3. Append-only events.
  if (s.change === "append") {
    if (s.dbt19) {
      const extra = wh === "bigquery"
        ? `,\n    partition_by={'field': '${et}', 'data_type': 'timestamp', 'granularity': '${s.batch === "month" ? "month" : s.batch}'}`
        : wh === "postgres" ? `,\n    unique_key='${key}'` : "";
      const mech = { snowflake: "delete+insert", bigquery: "insert_overwrite", databricks: "replace_where", redshift: "delete+insert", postgres: "merge" }[wh];
      return {
        id: "microbatch", strategy: "microbatch", microbatch: true, title: "Use microbatch",
        summary: `Immutable events with an event time are what microbatch was built for. dbt splits the build into ${s.batch} batches, filters upstream models on their event_time, and on ${WH.find((x) => x.id === wh)?.label} replaces each batch with ${mech}.`,
        reasons: [
          `Each batch is its own query, so a failed batch can be retried alone with dbt retry, and history can be backfilled in ranges with --event-time-start and --event-time-end.`,
          `lookback=${Math.max(1, n)} reprocesses the previous ${Math.max(1, n)} batch${Math.max(1, n) > 1 ? "es" : ""} on every run to pick up late-arriving events.`,
          "No is_incremental() block to hand-write: the filter comes from event_time, which removes a common source of off-by-one bugs.",
          "Set event_time on the upstream models too, or dbt reads them in full for every batch.",
          ...(wh === "postgres" ? ["On Postgres, microbatch runs as a merge, so unique_key is required."] : []),
          ...(wh === "bigquery" ? ["On BigQuery, microbatch replaces partitions, so partition_by is required."] : []),
        ],
        rejected: [
          ["append", "Not idempotent: a rerun inserts the same events again."],
          ["merge", `Works, but compares every incoming row with the target on ${key}, which is wasted effort for rows that never change.`],
          ...(wh === "snowflake" ? [["insert_overwrite", "On Snowflake it truncates and reloads the whole table, not a partition."] as [string, string]] : []),
        ],
        config: `{{ config(
    materialized='incremental',
    incremental_strategy='microbatch',
    event_time='${et}',
    begin='${s.begin || "2024-01-01"}',
    batch_size='${s.batch}',
    lookback=${Math.max(1, n)}${extra}${guard ? guard : ",\n    full_refresh=false"}
) }}

-- No is_incremental() filter: dbt filters this model and any upstream
-- model or source that sets event_time, one batch at a time (UTC).
select
    ${key},
    ${et}
    -- add the other columns you need here
from {{ ref('stg_events') }}`,
        tests: [
          ...baseTests.slice(0, 2),
          `Insert an event dated ${Math.max(1, n)} batch${Math.max(1, n) > 1 ? "es" : ""} ago: it should appear after the next run. One dated ${Math.max(1, n) + 1} batches ago will not, by design.`,
          "Check every upstream ref and source sets event_time, or each batch scans them in full.",
          "Confirm event_time is in UTC: microbatch treats begin, event_time and CLI dates as UTC.",
          "Backfill one small range first and compare counts per day with the source.",
        ],
      };
    }
    // Before dbt 1.9
    if (wh === "bigquery") {
      const list = Array.from({ length: n + 1 }, (_, i) => i === 0 ? "'current_date()'" : `'date_sub(current_date(), interval ${i} day)'`).join(",\n    ");
      return {
        id: "io", strategy: "insert_overwrite", microbatch: false, title: "Use insert_overwrite with static partitions",
        summary: "On BigQuery, replacing whole date partitions is the cheapest correct way to load append-only events: the bill covers the partitions in the window, not the whole table.",
        reasons: [
          "Static partitions avoid the temporary table and max-partition query of dynamic mode, which cuts bytes per run.",
          `The window (today plus ${n} days) is replaced whole, so late events inside it land without duplicates.`,
          "Add require_partition_filter on large tables so nobody downstream scans all history by accident.",
        ],
        rejected: [
          ["merge", "Bills the source window plus a key scan of every partition of the target on each run."],
          ["append", "Not available on BigQuery in dbt, and not idempotent anyway."],
        ],
        config: `{% set partitions_to_replace = [
    ${list}
] %}

{{ config(
    materialized='incremental',
    incremental_strategy='insert_overwrite',
    partition_by={'field': 'event_date', 'data_type': 'date'},
    partitions=partitions_to_replace,
    cluster_by=['${key}'],
    require_partition_filter=true${guard}
) }}

select
    date(${et}) as event_date,
    ${key}
    -- add the other columns you need here
from {{ ref('stg_events') }}
{% if is_incremental() %}
where date(${et}) in ({{ partitions_to_replace | join(',') }})
{% endif %}`,
        tests: [...baseTests.slice(0, 2), "Insert a late event inside the window and one outside it; only the first should appear.", "Confirm the dry-run bytes of the compiled SQL cover only the window."],
      };
    }
    if (wh === "databricks") {
      return {
        id: "rw", strategy: "replace_where", microbatch: false, title: "Use replace_where on the lookback window",
        summary: "On Delta tables, replace_where atomically overwrites exactly the rows matching a predicate: here, the last few days.",
        reasons: [
          "Atomic and idempotent: a rerun replaces the same window rather than appending to it.",
          "Needs file_format delta and Databricks Runtime 12.0 or later. Columns are inserted by position, so keep the select list in table order.",
        ],
        rejected: [["append", "Duplicates on rerun."], ["merge", "Compares every incoming row on the key for data that never changes."]],
        config: `{{ config(
    materialized='incremental',
    incremental_strategy='replace_where',
    file_format='delta',
    incremental_predicates=["event_date >= ${daysAgo(wh, n)}"],
    liquid_clustered_by=['event_date']${guard}
) }}

select
    to_date(${et}) as event_date,
    ${key}
    -- add the other columns you need here
from {{ ref('stg_events') }}
{% if is_incremental() %}
where to_date(${et}) >= ${daysAgo(wh, n)}
{% endif %}`,
        tests: [...baseTests.slice(0, 2), "Rerun mid-day and confirm the window is replaced, not doubled."],
      };
    }
    return {
      id: "di-date", strategy: "delete+insert", microbatch: false, title: "Use delete+insert keyed on the event date",
      summary: "Setting unique_key to the event date deletes every target row for the dates in the new batch, then inserts the batch: a whole-day replace that is safe to rerun.",
      reasons: [
        `Idempotent: rerunning replaces the same days. Late events within ${n} days are picked up.`,
        wh === "snowflake" ? "Avoids Snowflake's 'nondeterministic merge' error that a non-unique key would cause under merge." : "Works on every version of the adapter, without needing merge support.",
        "Upgrade to dbt 1.9 or later and microbatch gives you the same pattern with batch retries and ranged backfills.",
      ],
      rejected: [["append", "Duplicates on rerun."], ["merge", `Row-by-row matching on ${key} for rows that never change.`]],
      config: `{{ config(
    materialized='incremental',
    incremental_strategy='delete+insert',
    unique_key='event_date'${wh === "snowflake" ? ",\n    cluster_by=['event_date']" : ""}${guard}
) }}

select
    cast(${et} as date) as event_date,
    ${key}
    -- add the other columns you need here
from {{ ref('stg_events') }}
{% if is_incremental() %}
where cast(${et} as date) >= ${daysAgo(wh, n)}
{% endif %}`,
      tests: [...baseTests.slice(0, 2), "Insert a late event inside the window; it should appear once."],
    };
  }

  // 4. Updates (and possibly hard deletes) to existing rows.
  const delNote = s.change === "delete";
  const filter = `{% if is_incremental() %}
where ${up} >= ${sinceMax(wh, up, n)}
{% endif %}`;
  const isDel = delNote ? `,\n    coalesce(${del}, false) as is_deleted` : "";
  const srcRef = `{{ ref('stg_${m.replace(/^fct_|^dim_/, "")}') }}`;
  const body = s.unique === "no"
    ? `-- Keys repeat in the source: keep the latest row per key.
with changed as (
    select
        ${key},
        ${et},
        ${up}${isDel.replace(/\n {4}/g, "\n        ")},
        -- add the other columns you need here, each followed by a comma
        row_number() over (
            partition by ${key} order by ${up} desc
        ) as row_num
    from ${srcRef}
    ${filter.replace(/\n/g, "\n    ")}
)

select
    ${key},
    ${et},
    ${up}${delNote ? ",\n    is_deleted" : ""}
from changed
where row_num = 1`
    : `select
    ${key},
    ${et},
    ${up}${isDel}
    -- add the other columns you need here
from ${srcRef}
${filter}`;
  const useDi = wh === "redshift" || wh === "postgres" || (wh === "snowflake" && s.unique === "no");
  const strategy = useDi ? "delete+insert" : "merge";
  const extras: Record<Wh, string> = {
    snowflake: huge ? `,\n    cluster_by=['to_date(${et})']` : "",
    bigquery: `,\n    partition_by={'field': '${et}', 'data_type': 'timestamp', 'granularity': 'day'},\n    cluster_by=['${key}']`,
    databricks: `,\n    liquid_clustered_by=['${key}']`,
    redshift: "",
    postgres: "",
  };
  return {
    id: strategy, strategy, microbatch: false,
    title: strategy === "merge" ? "Use merge on the unique key" : "Use delete+insert on the unique key",
    summary: `Rows change after they first land, so the model has to find each changed row by ${key} and replace it. Filter the increment on ${up} with a ${n}-day overlap so late or slow-replicated updates are not skipped.`,
    reasons: [
      strategy === "merge"
        ? `merge updates matched rows and inserts new ones in one statement. It is the default on ${WH.find((x) => x.id === wh)?.label}.`
        : wh === "snowflake"
          ? "Snowflake's merge fails with a 'nondeterministic merge' error when unique_key is not unique; dbt's documentation points to delete+insert for this case. De-duplicate anyway."
          : `delete+insert is the long-standing pattern on ${WH.find((x) => x.id === wh)?.label}; merge is also supported in recent adapters${wh === "postgres" ? " (Postgres 15 or later)" : ""}.`,
      `The overlap of ${n} day${n === 1 ? "" : "s"} costs a little extra work per run and protects against replication lag and clock skew in ${up}.`,
      huge ? "On a table this size, the cost of merge depends on how much of the target it scans. Check the cost estimator before you add incremental_predicates: they cut the scan but miss updates to older rows." : "Set on_schema_change so a new upstream column does not break or silently drop.",
      ...(delNote ? ["Incremental models never see hard deletes: a deleted row stops arriving. Carry the loader's soft-delete flag through as is_deleted (Fivetran: _fivetran_deleted; Airbyte CDC: derive it in staging from _ab_cdc_deleted_at is not null), filter it out downstream, and reconcile row counts with the source on a schedule."] : []),
    ],
    rejected: [
      ["append", "Changed rows would be added again as duplicates."],
      ["microbatch", "Built for immutable events keyed on event time, not for records updated in place."],
      ...(wh === "bigquery" ? [["insert_overwrite", "Only correct if every updated row falls inside the partitions you overwrite; updates to old rows would be lost."] as [string, string]] : []),
      ...(strategy === "delete+insert" && wh === "snowflake" ? [["merge", "Fails on duplicate keys."] as [string, string]] : []),
    ],
    config: `{{ config(
    materialized='incremental',
    incremental_strategy='${strategy}',
    unique_key='${key}',
    on_schema_change='append_new_columns'${extras[wh]}${guard}
) }}

${body}${wh === "bigquery" && huge ? `

-- To limit the scan of the target, add this to the config above, but only
-- if updates never reach rows older than 30 days:
-- incremental_predicates=["DBT_INTERNAL_DEST.${et} >= timestamp_sub(current_timestamp(), interval 30 day)"]` : ""}`,
    tests: [
      ...baseTests,
      `Update a row with an ${up} ${n} day${n === 1 ? "" : "s"} old: it must be picked up. Then check what happens to one updated with an older ${up} (some sources backdate).`,
      ...(delNote ? ["Delete a row in the source: is_deleted should become true after the next sync and run, and the downstream count should drop by one."] : []),
      ...(s.unique === "no" ? [`Load two rows with the same ${key} in one batch: only the latest should survive.`] : []),
    ],
  };
}

const PLAIN: Record<string, string> = {
  snapshot: "you can answer what a record looked like on any past date, which audits, churn analysis and restated reports need.",
  table: "keep the simplest setup. Every run rebuilds the table, so it is always complete, and there is less to go wrong.",
  microbatch: "history loads and reloads in small, retryable pieces. A failure costs one batch of data, not a rebuild of the whole table, and late data is picked up automatically.",
  io: "each run rebuilds only the most recent days, so late data lands, reruns never double count, and the bill covers days rather than the whole history.",
  rw: "each run rebuilds only the most recent days, so late data lands and reruns never double count.",
  "di-date": "each run rebuilds only the most recent days, so late data lands and reruns never double count.",
  merge: "changed records are updated in place, so reports always show the latest version of each order or customer, without rebuilding years of history.",
  "delete+insert": "changed records are replaced in place, so reports always show the latest version of each record, without rebuilding years of history.",
};

function monthRanges(begin: string, end: string) {
  const b = new Date(`${begin}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(b.getTime()) || Number.isNaN(e.getTime()) || e <= b) return [];
  const out: [string, string][] = [];
  let cur = new Date(b);
  while (cur < e && out.length < 400) {
    const next = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
    const stop = next < e ? next : e;
    out.push([cur.toISOString().slice(0, 10), stop.toISOString().slice(0, 10)]);
    cur = stop;
  }
  return out;
}

type Opt<T extends string> = { id: T; label: string };
function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Opt<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="rs-q">
      <p className="rs-q-label">{label}</p>
      <div className="rs-seg" role="group" aria-label={label}>
        {options.map((o) => <button key={o.id} type="button" className={value === o.id ? "is-on" : undefined} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>)}
      </div>
    </div>
  );
}

export function IncrementalPicker() {
  const [raw, set, reset] = useStoredState<State>("bredge:rs:dbt-incremental:v1", INITIAL);
  const s: State = { ...INITIAL, ...raw };
  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const rec = recommend(s);

  // Backfill plan
  const ranges = monthRanges(s.begin, s.end);
  const days = ranges.length ? (new Date(`${s.end}T00:00:00Z`).getTime() - new Date(`${s.begin}T00:00:00Z`).getTime()) / 86400000 : 0;
  const perDay = Math.max(0, toNum(s.rowsPerDay));
  const batchDays = s.batch === "hour" ? 1 / 24 : s.batch === "month" ? 30.4 : 1;
  const batches = days > 0 ? Math.ceil(days / batchDays) : 0;
  const m = clean(s.model, "my_model");
  const cmds = rec.microbatch
    ? ranges.map(([a, b]) => `dbt run --select ${m} --event-time-start "${a}" --event-time-end "${b}"`)
    : ranges.map(([a, b]) => `dbt run --select ${m} --vars '{"backfill_start": "${a}", "backfill_end": "${b}"}'`);
  const shown = cmds;
  const etc = clean(s.eventTime, "event_ts");
  const backfillCode = rec.id === "snapshot" || rec.id === "table" ? "" : rec.microbatch
    ? `# ${fmtNum(batches)} ${s.batch} batches in ${ranges.length} monthly runs.\n# A failed run restarts its failed batches with: dbt retry\n${shown.join("\n")}`
    : `# ${ranges.length} monthly runs, oldest first:\n${shown.join("\n")}`;
  const backfillModel = rec.id === "snapshot" || rec.id === "table" || rec.microbatch ? "" : `-- Replace the is_incremental() block in ${m}.sql with this,
-- so a run with backfill vars loads exactly one range:
{% if var('backfill_start', none) %}
where ${etc} >= '{{ var("backfill_start") }}'
  and ${etc} <  '{{ var("backfill_end") }}'
{% elif is_incremental() %}
where ${rec.strategy === "merge" || rec.strategy === "delete+insert" ? `${clean(s.updatedAt, "updated_at")} >= ${sinceMax(s.wh, clean(s.updatedAt, "updated_at"), s.late ? Math.max(1, Math.round(toNum(s.lookback)) || 1) : 0)}` : `${etc} >= ${daysAgo(s.wh, s.late ? Math.max(1, Math.round(toNum(s.lookback)) || 1) : 0)}`}
{% endif %}`;

  const text = () => [
    `dbt incremental strategy for ${m} on ${WH.find((x) => x.id === s.wh)?.label}`,
    `Recommendation: ${rec.title}`,
    rec.summary,
    "",
    "Why:", ...rec.reasons.map((r) => `- ${r}`),
    "",
    "Rejected:", ...rec.rejected.map(([a, b]) => `- ${a}: ${b}`),
    "",
    "Config:", rec.config,
    "",
    "Test before you ship:", ...rec.tests.map((t) => `- ${t}`),
    ...(backfillCode ? ["", "Backfill:", ...(backfillModel ? [backfillModel, ""] : []), backfillCode] : []),
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="questions" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Your model</p>
          <h2>Six questions about the table</h2>
          <p className="rs-muted">Column names are used in the generated config. The starting answers are an example: an append-only event table on Snowflake.</p>
          <Terms items={[
            ["Incremental model", "A dbt model that processes only new or changed rows on each run instead of rebuilding the whole table."],
            ["Strategy", "How dbt writes those rows: merge (match on a key, update or insert), delete+insert (delete matches, then insert), insert_overwrite (replace whole partitions), microbatch (replace time batches)."],
            ["Unique key", "The column, or columns, that identify one row, such as order_id."],
            ["Append-only", "Rows are only ever added, never changed, such as page views or payments events."],
            ["Late-arriving data", "Rows that land after rows with a later event time, for example from a mobile app that was offline."],
            ["Hard delete", "A row removed from the source system, rather than flagged as deleted."],
            ["Snapshot", "A dbt table that keeps every version of each record, with valid-from and valid-to dates (type 2 history)."],
            ["Backfill", "Loading or reloading historical data, usually in date ranges."],
          ]} />
        </header>
        <div className="rs-qs">
          <Seg label="Warehouse" value={s.wh} options={WH} onChange={(wh) => update({ wh })} />
          <Seg label="How big is the model, and how long does a full rebuild take?" value={s.size} onChange={(size) => update({ size })} options={[
            { id: "small", label: "Rebuilds in a few minutes" }, { id: "large", label: "Tens of millions to a billion rows" }, { id: "huge", label: "Billions of rows" },
          ]} />
          <Seg label="How do rows change after they land?" value={s.change} onChange={(change) => update({ change })} options={[
            { id: "append", label: "Never: append-only events" }, { id: "update", label: "Updated in place" }, { id: "delete", label: "Updated, and hard-deleted in the source" }, { id: "history", label: "We need every past version" },
          ]} />
          <Seg label="Do rows arrive late (after their event time)?" value={s.late ? "yes" : "no"} onChange={(v) => update({ late: v === "yes" })} options={[{ id: "yes", label: "Yes" }, { id: "no", label: "No, never" }]} />
          {s.late && (
            <label className="rs-field rs-field-inline rs-field-narrow"><span>Up to how many days late?</span><input inputMode="numeric" value={s.lookback} onChange={(e) => update({ lookback: e.target.value })} /></label>
          )}
          <Seg label="Is the key unique in every batch from the source?" value={s.unique} onChange={(unique) => update({ unique })} options={[{ id: "yes", label: "Yes" }, { id: "no", label: "No, duplicates happen" }]} />
          <Seg label="dbt version" value={s.dbt19 ? "new" : "old"} onChange={(v) => update({ dbt19: v === "new" })} options={[{ id: "new", label: "1.9 or later (or dbt Cloud latest)" }, { id: "old", label: "Older than 1.9" }]} />
        </div>
        <div className="rs-cost-fields rs-names">
          {([["model", "Model name"], ["key", "Unique key"], ["eventTime", "Event time column"], ["updatedAt", "Updated-at column"], ...(s.change === "delete" ? [["deleted", "Soft-delete column from your loader"]] : [])] as [keyof State, string][]).map(([k, label]) => (
            <label key={k} className="rs-field"><span>{label}</span><input value={String(s[k])} spellCheck={false} onChange={(e) => update({ [k]: e.target.value } as Partial<State>)} /></label>
          ))}
        </div>
      </section>

      <section id="result" className="rs-card" aria-live="polite">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · Recommendation</p>
          <h2>{rec.title}</h2>
          <p className="rs-muted">{rec.summary}</p>
          <PlainSummary>{PLAIN[rec.id] ?? PLAIN.merge}</PlainSummary>
        </header>
        <div className="rs-lists">
          <div><h3>Why</h3><ul>{rec.reasons.map((r) => <li key={r}>{r}</li>)}</ul></div>
          <div className="is-warn"><h3>Not these, and why</h3><ul>{rec.rejected.map(([a, b]) => <li key={a}><b>{a}</b>: {b}</li>)}</ul></div>
        </div>
        <CodeBlock label={`${m}.sql config`} lang={rec.id === "snapshot" && s.dbt19 ? "YAML" : "SQL + Jinja"} code={rec.config} />
        <p className="rs-note">Strategies dbt supports on {WH.find((x) => x.id === s.wh)?.label}: {SUPPORTED[s.wh]}. Adapter behaviour changes between versions; check your adapter&apos;s release notes before you rely on an option.</p>
        <h3>Test before you ship</h3>
        <ul className="rs-checks rs-checks-plain">{rec.tests.map((t) => <li key={t}><span>{t}</span></li>)}</ul>
      </section>

      {backfillCode && (
        <section id="backfill" className="rs-card">
          <header className="rs-card-head">
            <p className="rs-label">Step 3 · Backfill history</p>
            <h2>Load the history in ranges, not in one query</h2>
            <p className="rs-muted">A single full refresh over billions of rows is the run most likely to time out, spill or blow the budget. Ranged runs can be retried one at a time and checked as they land.</p>
          </header>
          <div className="rs-cost-fields">
            <label className="rs-field"><span>History starts (begin)</span><input type="date" value={s.begin} onChange={(e) => update({ begin: e.target.value })} /></label>
            <label className="rs-field"><span>Backfill up to</span><input type="date" value={s.end} onChange={(e) => update({ end: e.target.value })} /></label>
            <label className="rs-field"><span>Rows per day (roughly)</span><input inputMode="numeric" value={s.rowsPerDay} onChange={(e) => update({ rowsPerDay: e.target.value })} /></label>
            {rec.microbatch && (
              <label className="rs-field"><span>Batch size</span>
                <select value={s.batch} onChange={(e) => update({ batch: e.target.value as Batch })}>
                  <option value="hour">hour</option><option value="day">day</option><option value="month">month</option>
                </select>
              </label>
            )}
          </div>
          <div className="rs-kpis">
            <div><small>Days of history</small><b>{fmtNum(days)}</b></div>
            <div><small>Rows to load (estimate)</small><b>{fmtNum(days * perDay)}</b></div>
            {rec.microbatch && <div><small>{s.batch} batches</small><b>{fmtNum(batches)}</b></div>}
            <div><small>Rows per {rec.microbatch ? "batch" : "monthly run"}</small><b>{fmtNum(rec.microbatch ? perDay * batchDays : perDay * 30.4)}</b></div>
          </div>
          {backfillModel && <CodeBlock label={`${m}.sql: backfill filter`} lang="SQL + Jinja" code={backfillModel} />}
          <CodeBlock label="Backfill commands" lang="shell" code={backfillCode} />
          <ul className="rs-plainlist">
            <li><b>Oldest first.</b> With a lookback, each range also reprocesses the batches before it; loading in date order keeps that cheap.</li>
            <li><b>Check as you go.</b> After each range, compare row counts per day with the source before starting the next.</li>
            {rec.microbatch && <li><b>Parallel batches.</b> dbt decides whether batches can run concurrently; set concurrent_batches to force it on or off. Check your warehouse&apos;s concurrency limits first.</li>}
            <li><b>Pause downstream schedules</b> or point them at the old table until the backfill is verified.</li>
          </ul>
        </section>
      )}

      <ToolActions getText={text} copyLabel="Copy the recommendation" onReset={reset} resetLabel="Restore the example" confirmText="Replace your answers with the example?" />
    </div>
  );
}
