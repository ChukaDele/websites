import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "gdpr-deletion-requests-data-warehouse";
const TOC = [
  { id: "why", label: "Why deletion is hard in a warehouse" },
  { id: "try-first", label: "Find every copy of the person" },
  { id: "identity", label: "Build an identity map for erasure" },
  { id: "elt", label: "Propagate deletes through ELT" },
  { id: "history", label: "Purge snapshots and SCD2 history" },
  { id: "time-travel", label: "Time travel, fail-safe and retention" },
  { id: "backups", label: "Backups and “beyond use”" },
  { id: "bi", label: "Power BI models and extracts" },
  { id: "logs", label: "Logs and query history" },
  { id: "crypto", label: "Crypto-shredding and pseudonymisation" },
  { id: "runbook", label: "An erasure runbook and audit log" },
  { id: "verify", label: "How to verify the deletion" },
  { id: "example", label: "Worked example: one request, nine places" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When erasure needs a project" },
  { id: "decision", label: "Where the person lives, and what to do" },
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
            title="An erasure request moves through the stack in order, and every step is logged"
            caption="Resolve the person to every internal key, delete at the source, then purge raw, history and modelled tables and refresh BI. Time travel and backups expire on a known schedule with the data kept beyond use. A verification query closes the request."
          >
            <svg viewBox="0 0 720 250" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <defs>
                <marker id="er-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" /></marker>
              </defs>
              <rect x="10" y="20" width="120" height="56" rx="4" fill="rgba(240,191,108,.18)" stroke="#f0bf6c" />
              <text x="70" y="44">request</text><text x="70" y="62" fill="#a9741f">identity map</text>
              {[
                ["sources", "CRM · billing · app"],
                ["raw / ELT", "soft deletes, CDC"],
                ["history", "snapshots, SCD2"],
                ["marts + BI", "refresh models"],
              ].map(([t, s], i) => (
                <g key={t}>
                  <line x1={130 + i * 145} y1="48" x2={166 + i * 145} y2="48" stroke="rgba(20,35,33,.45)" markerEnd="url(#er-a)" />
                  <rect x={170 + i * 145} y="20" width="125" height="56" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
                  <text x={232 + i * 145} y="44">{t}</text><text x={232 + i * 145} y="62" fill="#7a847f">{s}</text>
                </g>
              ))}
              <rect x="170" y="112" width="270" height="48" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" strokeDasharray="4 4" />
              <text x="305" y="132">time travel · fail-safe</text><text x="305" y="148" fill="#7a847f">expires on a known window</text>
              <rect x="460" y="112" width="250" height="48" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" strokeDasharray="4 4" />
              <text x="585" y="132">backups</text><text x="585" y="148" fill="#7a847f">beyond use until overwritten</text>
              <rect x="10" y="190" width="700" height="44" rx="4" fill="rgba(144,210,111,.12)" stroke="#90d26f" strokeWidth="1.6" />
              <text x="360" y="210">audit log: one row per action, no personal data</text>
              <text x="360" y="226" fill="#3c6b43">verification query returns zero rows in every live table</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why is deleting one person from a data warehouse so hard?</h2>
          <p>A warehouse is built to keep things. ELT tools copy every source, history tables keep every version of a customer, incremental models never look back at rows they already loaded, and the platform keeps deleted data recoverable for a while. Each of those is a feature until someone asks to be erased. Then the person exists in a dozen places, and deleting them from the CRM removes only one.</p>
          <p className="in-legal"><b>Not legal advice.</b> This is an engineering how-to. Your DPO or legal team decides whether a request is valid, which law applies, its scope and any exemptions.</p>
          <PlainEnglish>
            <p>When a customer asks you to delete their data, the law sets a deadline: in the UK and EU, one month from receipt in most cases; under California&rsquo;s rules, 45 days. The CRM is the easy part. The same person also sits in the reporting warehouse, in history tables, in Power BI files and in backups. Each needs a specific action, and you need a record showing it was done.</p>
            <ul>
              <li><strong>Ask your team</strong>: if someone asked to be deleted today, could we list every system and table that holds them?</li>
              <li><strong>Expect back</strong>: a written runbook, an owner for each step, and a log you could show a regulator.</li>
              <li><strong>Decision only you can make</strong>: what counts as in scope, and which exemptions apply. That is for your DPO or lawyer, not the data team.</li>
            </ul>
          </PlainEnglish>
          <p>The clocks come from the primary texts, and your legal team applies them:</p>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Regime</th><th>What the text says about timing</th><th>Source</th></tr></thead>
            <tbody>
              <tr><td>EU GDPR and UK GDPR</td><td>Respond without undue delay and at the latest within one month of receipt; extendable by two further months for complex or numerous requests, telling the person within the first month</td><td>GDPR Art. 12(3); ICO right to erasure guidance</td></tr>
              <tr><td>California (CCPA as amended by CPRA)</td><td>Confirm receipt within 10 business days; respond within 45 calendar days; up to 45 more (90 in total) with notice and an explanation</td><td>CCPA Regulations &sect;7021</td></tr>
            </tbody>
          </table></div>
          <p>Article 17 sets out when the right to erasure applies and, in 17(3), when it does not. Article 19 and the ICO both say recipients you disclosed the data to must be told. The California regulations (&sect;7022(b)) say a business complies by permanently and completely erasing the information from existing systems other than archived or backup systems, or by deidentifying or aggregating it, and by notifying its service providers, contractors and the third parties it sold or shared the data with.</p>
          <Pull>The deadline is a month. Finding every copy of a person for the first time takes longer than that, so the map has to exist before the request arrives.</Pull>
        </section>

        <section id="try-first">
          <h2>How to find every copy of a person in the warehouse</h2>
          <ForTheBusiness>This is the inventory that tells you how big each request really is, and it is the part most teams have never done.</ForTheBusiness>
          <TryThisFirst title="Three steps before you delete anything">
            <ol>
              <li><strong>List personal-data columns.</strong> Search the catalogue for column names that suggest identifiers. It is a starting point, not a complete list: free-text notes and JSON payloads hide identifiers under innocent names.</li>
              <li><strong>List the copies.</strong> For each source holding a person, follow it downstream: raw tables, staging, snapshots, incremental models, marts, reverse ETL destinations, BI models and scheduled exports.</li>
              <li><strong>List the retention.</strong> For each platform, write down how long deleted data stays recoverable: time travel, fail-safe, backups, logs.</li>
            </ol>
          </TryThisFirst>
          <pre>{`-- Snowflake: candidate personal-data columns in one database.
-- Run per database; extend the patterns for your own naming.
select table_schema,
       table_name,
       column_name,
       data_type
from analytics.information_schema.columns
where column_name ilike any (
        '%email%', '%phone%', '%first_name%', '%last_name%', '%full_name%',
        '%address%', '%postcode%', '%zip%', '%date_of_birth%', '%ip_address%'
      )
order by table_schema, table_name, column_name;`}</pre>
        </section>

        <section id="identity">
          <h2>How to build an identity map for erasure requests</h2>
          <ForTheBusiness>Without it, every request is a manual hunt, and the person you miss is the one who complains to the regulator.</ForTheBusiness>
          <p>A request arrives with an email address or a name. The warehouse knows the person as a HubSpot contact ID, a Stripe customer ID, an application user ID and a support ticket requester. An identity map links them under one internal <code>person_id</code>, and every erasure step works from that map rather than from the email address. It is the same matching problem as building a single customer record; <a href="/insights/one-customer-view">how to get one view of the customer</a> covers the matching rules.</p>
          <pre>{`-- Snowflake: one row per (person, system, key).
create table if not exists privacy.person_identity_map (
    person_id      varchar      not null,  -- internal surrogate, never an email
    source_system  varchar      not null,  -- 'hubspot', 'stripe', 'app_db', 'zendesk'
    source_key     varchar      not null,  -- the record's id in that system
    matched_on     varchar,                -- 'email_exact', 'stripe_metadata', 'manual'
    first_seen_at  timestamp_tz,
    primary key (person_id, source_system, source_key)
);

-- Every key for one person, used by every step below.
select source_system, source_key
from privacy.person_identity_map
where person_id = 'p_000123';`}</pre>
          <p>Two rules make the map safe to use for erasure. Matches made by fuzzy rules need a human check before anything is deleted, because deleting the wrong customer is its own incident. And the request itself is resolved to a <code>person_id</code> once, by the person handling the request, so the email address never has to appear in a delete statement (the reason is in the section on logs).</p>
        </section>

        <section id="elt">
          <h2>How to propagate deletes through ELT pipelines</h2>
          <ForTheBusiness>Deleting in the warehouse alone does not last: the next sync can load the person again from the source.</ForTheBusiness>
          <p>Delete in the source systems first, through each system&rsquo;s own deletion feature, then in the warehouse. The order matters because ELT copies whatever the source still holds:</p>
          <ul>
            <li><strong>Soft deletes keep the row.</strong> Fivetran marks rows deleted in the source with <code>_fivetran_deleted</code> rather than removing them, so the person&rsquo;s columns stay in the destination table. Remove them yourself.</li>
            <li><strong>History mode keeps every version.</strong> With Fivetran history mode, each change is a new row with <code>_fivetran_active</code>, <code>_fivetran_start</code> and <code>_fivetran_end</code>, and <code>_fivetran_deleted</code> is dropped. Every past version of the person is a row to purge.</li>
            <li><strong>Re-syncs reload.</strong> A historical re-sync copies what the source holds now. If the source deletion failed, the person returns.</li>
            <li><strong>CDC tombstones keep the old values.</strong> A merge that marks a row <code>is_deleted</code> keeps its other columns, and the append-only raw change table keeps every event. See <a href="/insights/change-data-capture">how to keep CDC data in sync</a> for the merge; for erasure, the tombstone must also null the personal columns, and the raw events must be deleted.</li>
            <li><strong>Incremental models never look back.</strong> A dbt incremental model only processes new or changed rows, so a person deleted upstream stays in it until you delete them there or run a full refresh.</li>
          </ul>
          <pre>{`-- Snowflake: hard-delete one person from a raw ELT table and log the action.
set pid = 'p_000123';
set rid = 'ER-2026-0042';

delete from raw.hubspot.contacts
where id in (
    select source_key
    from privacy.person_identity_map
    where person_id = $pid and source_system = 'hubspot'
);

-- result_scan reads the DELETE's own output, so the count is exact.
insert into privacy.erasure_actions
    (request_id, system_name, object_name, action, rows_affected, query_id, done_by)
select $rid, 'snowflake', 'raw.hubspot.contacts', 'hard_delete',
       "number of rows deleted", last_query_id(), current_user()
from table(result_scan(last_query_id()));`}</pre>
          <p>Repeat the pair for each table the person appears in, working downstream: raw, staging tables that are materialised, incremental models, marts. Views need nothing; they read from tables you have already cleaned. To stop a re-load, filter a suppression list in staging, agreed with your DPO (the California regulations, &sect;7022(e), expressly allow keeping a record of the request to make sure the information stays deleted):</p>
          <pre>{`-- models/staging/hubspot/stg_hubspot__contacts.sql
select c.*
from {{ source('hubspot', 'contacts') }} as c
where not exists (
    select 1
    from {{ ref('erasure_suppression') }} as s
    where s.source_system = 'hubspot'
      and s.source_key = c.id
)`}</pre>
        </section>

        <section id="history">
          <h2>How to purge a person from dbt snapshots and SCD2 history</h2>
          <ForTheBusiness>History tables exist to remember. Unless someone purges them on purpose, an erased customer stays in them for good.</ForTheBusiness>
          <p>dbt snapshots record every version of a row with <code>dbt_valid_from</code> and <code>dbt_valid_to</code>. With the default <code>hard_deletes: ignore</code>, dbt takes no action when a row disappears from the source, so the person&rsquo;s last version stays open indefinitely. The <code>invalidate</code> and <code>new_record</code> options (dbt 1.9 and later) record the deletion, but neither removes the earlier versions. dbt also notes that snapshots cannot be rebuilt, so a purge is a direct change to the table, made with care. The same applies to any SCD2 table you maintain yourself; <a href="/insights/customer-history-scd2">how to keep customer history</a> explains how they are built.</p>
          <p>There are two options. Which one satisfies the request is a decision for your DPO:</p>
          <pre>{`-- Option A: remove every version of the person.
delete from snapshots.customers_snapshot
where customer_id in (
    select source_key
    from privacy.person_identity_map
    where person_id = 'p_000123' and source_system = 'app_db'
);

-- Option B: keep the rows for aggregate history, strip the identifiers.
-- Facts that join on customer_id must be updated to the same value,
-- or they will still point back at the person.
update snapshots.customers_snapshot
set email     = null,
    full_name = null,
    phone     = null,
    postcode  = null,
    customer_id = 'erased_' || 'ER-2026-0042'
where customer_id in (
    select source_key
    from privacy.person_identity_map
    where person_id = 'p_000123' and source_system = 'app_db'
);`}</pre>
          <p>Option B keeps counts like &ldquo;customers by region last year&rdquo; stable. It is not automatically anonymisation: if other tables still hold the original key, or the remaining columns single someone out, the rows are still personal data. Recital 26 of the GDPR draws that line, and the ICO&rsquo;s pseudonymisation guidance says pseudonymised data remains personal data for anyone holding the additional information.</p>
        </section>

        <section id="time-travel">
          <h2>How Snowflake and BigQuery time travel affect deletion</h2>
          <ForTheBusiness>After a delete, the platform keeps the data recoverable for a fixed window. You need to know that window and tell your DPO.</ForTheBusiness>
          <ul>
            <li><strong>Snowflake permanent tables</strong>: deleted rows stay queryable through Time Travel for the table&rsquo;s retention period: 1 day by default, 0 or 1 on Standard Edition, up to 90 days on Enterprise Edition. After that they move to Fail-safe for 7 days, which is not configurable and which only Snowflake can recover from.</li>
            <li><strong>Snowflake transient and temporary tables</strong>: retention of 0 or 1 day, and no Fail-safe.</li>
            <li><strong>BigQuery</strong>: the time travel window is 7 days by default and can be set from 2 to 7 days at dataset or project level. A further 7-day fail-safe follows, not configurable, recoverable only through Cloud Customer Care.</li>
            <li><strong>Databricks Delta tables</strong>: a <code>DELETE</code> leaves the old data files in storage until <code>VACUUM</code> removes them; with deletion vectors enabled, run <code>REORG TABLE ... APPLY (PURGE)</code> first.</li>
          </ul>
          <pre>{`-- Snowflake: the effective retention on a table holding personal data.
-- If an account-level MIN_DATA_RETENTION_TIME_IN_DAYS is set, the larger value applies.
show parameters like 'DATA_RETENTION_TIME_IN_DAYS' in table analytics.marts.dim_customer;

-- Set it deliberately, agreed with whoever owns recovery and your DPO.
alter table analytics.marts.dim_customer set data_retention_time_in_days = 7;

-- BigQuery: set the dataset's time travel window (hours, multiples of 24, 48 to 168).
alter schema crm_raw set options (max_time_travel_hours = 48);

-- Databricks: physically remove deleted rows from a Delta table.
reorg table bronze.customers apply (purge);
vacuum bronze.customers;`}</pre>
          <p>A shorter window means deleted personal data disappears sooner, and also means less time to recover from a bad deploy. That is a trade-off to decide once, per schema, not per request.</p>
        </section>

        <section id="backups">
          <h2>What about backups? The ICO&rsquo;s &ldquo;beyond use&rdquo; position</h2>
          <ForTheBusiness>Nobody expects you to restore and edit every backup tape, but you must be able to say what happens to the data in them.</ForTheBusiness>
          <p>The ICO&rsquo;s guidance says erasure should reach backup systems as well as live systems, that you should be clear with the person about what will happen to their data in backups, and that the key issue is to put backup data &ldquo;beyond use&rdquo; even if it cannot be overwritten immediately: not used for any other purpose, and kept only until it is replaced under an established schedule. The California regulations (&sect;7022(d)) let a business delay deletion on archived or backup systems until that data is restored to an active system or next accessed or used for a sale, disclosure or commercial purpose.</p>
          <p>In engineering terms that means:</p>
          <ul>
            <li>A written backup retention schedule, so you can state when the data will be overwritten.</li>
            <li>Access to backups limited to restore operations, with nobody querying them for analysis.</li>
            <li>A restore procedure that re-applies the suppression list before restored data is used, so erased people do not come back.</li>
          </ul>
        </section>

        <section id="bi">
          <h2>How to remove a person from Power BI models and extracts</h2>
          <ForTheBusiness>A Power BI report can keep showing an erased customer for weeks, because the model holds its own copy of the data.</ForTheBusiness>
          <p>An import-mode Power BI semantic model stores a copy of the data it loaded. Deleting the person in the warehouse changes nothing in the model until it refreshes. Incremental refresh adds a trap: scheduled refreshes reload only the recent refresh period, and the historical partitions are not refreshed. A person who appears in last year&rsquo;s rows stays in those partitions. On Premium, Premium per user or Fabric capacity, refresh the affected historical partitions through the XMLA endpoint; Microsoft&rsquo;s documentation notes that republishing from Desktop removes the existing partitions and data, after which the next refresh reloads everything.</p>
          <ul>
            <li>Refresh every import model built on the cleaned tables, and log each refresh in the audit table.</li>
            <li>Check other copies: Excel files with exported data, extracts in other BI tools, email subscriptions and files in shared drives.</li>
            <li>If refreshes fail, the old data stays visible; <a href="/insights/power-bi-refresh-failed">why a Power BI refresh failed</a> covers the usual causes.</li>
          </ul>
        </section>

        <section id="logs">
          <h2>Logs and query history: the copy people forget</h2>
          <ForTheBusiness>The erasure job itself can write the person&rsquo;s email into a log that is kept for a year.</ForTheBusiness>
          <p>Snowflake&rsquo;s <code>ACCOUNT_USAGE.QUERY_HISTORY</code> view keeps the last 365 days of queries, including the full query text. A delete written as <code>where email = &apos;jane@example.com&apos;</code> records that address in the query history. Resolve the request to a <code>person_id</code> once, and use internal keys in every statement. Then list the other logs that can hold identifiers: ELT tool logs, dbt logs with compiled SQL, application error logs, failed-row tables, and support tickets that include data samples. Each needs a known retention, so you can describe it to the person.</p>
        </section>

        <section id="crypto">
          <h2>Crypto-shredding and pseudonymisation as a design pattern</h2>
          <ForTheBusiness>Designed in early, this makes most future deletions a single action instead of a hunt across every table.</ForTheBusiness>
          <p>Crypto-shredding encrypts each person&rsquo;s identifiers with their own key and keeps the keys in one tightly controlled table. Erasing the person means deleting their key: every encrypted copy, in every table, snapshot and extract built from it, becomes unreadable. BigQuery&rsquo;s AEAD encryption documentation describes this use directly, as deleting a key to make data encrypted with it unreadable.</p>
          <ForYourDataPerson title="BigQuery AEAD: one keyset per person, erase by deleting the key">
            <pre>{`-- One keyset per person, in a separate, tightly controlled dataset.
-- For production, Google recommends wrapped keysets with Cloud KMS.
create table if not exists privacy_keys.person_keysets as
select person_id,
       keys.new_keyset('AEAD_AES_GCM_256') as keyset
from (select distinct person_id from privacy.person_identity_map);

-- Encrypt identifiers on the way in, bound to the person.
create or replace table staging.customers_protected as
select c.person_id,
       aead.encrypt(k.keyset, c.email, c.person_id) as email_enc,
       c.region,
       c.signup_date
from staging.customers as c
join privacy_keys.person_keysets as k using (person_id);

-- Decrypt only where a use case needs the value.
select p.person_id,
       aead.decrypt_string(k.keyset, p.email_enc, p.person_id) as email
from staging.customers_protected as p
join privacy_keys.person_keysets as k using (person_id);

-- Erase: delete the key. Every copy of email_enc for this person is now unreadable.
delete from privacy_keys.person_keysets
where person_id = 'p_000123';`}</pre>
          </ForYourDataPerson>
          <p>The limits matter as much as the pattern:</p>
          <ul>
            <li>The key table has its own time travel and fail-safe, so a deleted key stays recoverable for that window.</li>
            <li>Only the columns you encrypt are protected. Free text, IDs used as join keys and anything already copied elsewhere in clear are not.</li>
            <li>While the key exists, the ciphertext is still personal data. Whether deleting the key counts as erasure for a given request is a decision for your DPO.</li>
          </ul>
        </section>

        <section id="runbook">
          <h2>An erasure request runbook and audit log table</h2>
          <ForTheBusiness>A runbook turns each request into a checklist with an owner, and the log is your evidence if anyone asks.</ForTheBusiness>
          <ol>
            <li><strong>Log the request</strong> with its received date. Legal or the DPO confirms identity verification, the regime, the deadline and the scope, including any exemptions.</li>
            <li><strong>Resolve the person</strong> to a <code>person_id</code> and every source key through the identity map. A human checks fuzzy matches.</li>
            <li><strong>Delete at the sources</strong> through each system&rsquo;s own deletion feature.</li>
            <li><strong>Purge the warehouse</strong> downstream in order: raw, staging, snapshots and history, incremental models, marts.</li>
            <li><strong>Refresh BI</strong> models and remove exports and extracts.</li>
            <li><strong>Notify recipients</strong>: processors, reverse ETL destinations and vendors you shared the data with, as Article 19 and the California regulations require.</li>
            <li><strong>Record retention windows</strong>: time travel, fail-safe, backups and logs, with the date each expires.</li>
            <li><strong>Verify</strong> with the query below, then reduce the identity map entry to the suppression record agreed with your DPO.</li>
            <li><strong>Close</strong> the request and reply to the person within the deadline.</li>
          </ol>
          <p>The audit log records actions, not personal data. The California regulations require records of requests and responses for at least 24 months (&sect;7101(a)); the ICO recommends a policy for recording requests.</p>
          <pre>{`-- Snowflake: the request and every action taken on it.
create table if not exists privacy.erasure_requests (
    request_id    varchar       not null primary key,  -- 'ER-2026-0042'
    person_id     varchar       not null,
    regime        varchar       not null,  -- 'UK GDPR', 'EU GDPR', 'CCPA'
    received_at   timestamp_tz  not null,
    respond_by    date          not null,  -- set by the DPO or legal team
    scope_note    varchar,                 -- scope and exemptions, as decided by DPO or legal
    status        varchar       not null,  -- 'received', 'in_progress', 'completed', 'refused'
    completed_at  timestamp_tz,
    verified_at   timestamp_tz
);

create table if not exists privacy.erasure_actions (
    request_id     varchar       not null,
    system_name    varchar       not null,  -- 'hubspot', 'snowflake', 'power_bi', 'backup'
    object_name    varchar       not null,  -- table, model, file or vendor
    action         varchar       not null,  -- 'hard_delete', 'pseudonymise', 'refresh',
                                            -- 'vendor_notified', 'backup_beyond_use'
    rows_affected  number,
    query_id       varchar,
    expires_on     date,                    -- when time travel or backup copies lapse
    done_by        varchar       not null,
    done_at        timestamp_tz  not null default current_timestamp()
);

-- Open requests by deadline.
select request_id, regime, received_at, respond_by,
       datediff('day', current_date(), respond_by) as days_left, status
from privacy.erasure_requests
where status in ('received', 'in_progress')
order by respond_by;`}</pre>
        </section>

        <section id="verify">
          <h2>How to verify a deletion request was completed</h2>
          <ForTheBusiness>&ldquo;We ran the deletes&rdquo; is not evidence. A query that returns zero everywhere is.</ForTheBusiness>
          <p>Before closing the request, count the person&rsquo;s rows in every table on the inventory, by key. Every count should be zero, except where your DPO decided an exemption applies, which the log records.</p>
          <pre>{`-- Snowflake: one row per table that held the person. Expect zero everywhere.
set pid = 'p_000123';

with k as (
    select source_system, source_key
    from privacy.person_identity_map
    where person_id = $pid
)
select 'raw.hubspot.contacts' as object_name, count(*) as rows_found
from raw.hubspot.contacts
where id in (select source_key from k where source_system = 'hubspot')
union all
select 'raw.stripe.customers', count(*)
from raw.stripe.customers
where id in (select source_key from k where source_system = 'stripe')
union all
select 'snapshots.customers_snapshot', count(*)
from snapshots.customers_snapshot
where customer_id in (select source_key from k where source_system = 'app_db')
union all
select 'analytics.marts.fct_orders', count(*)
from analytics.marts.fct_orders
where customer_id in (select source_key from k where source_system = 'app_db')
union all
select 'analytics.marts.dim_customer', count(*)
from analytics.marts.dim_customer
where person_id = $pid
order by rows_found desc;

-- Only when every count is zero:
update privacy.erasure_requests
set verified_at = current_timestamp(), status = 'completed', completed_at = current_timestamp()
where request_id = 'ER-2026-0042';`}</pre>
          <p>Generate this query from the inventory rather than writing it by hand, so a new table holding personal data is added once and checked on every request.</p>
        </section>

        <section id="example">
          <h2>Worked example: one request, nine places</h2>
          <Example setting="UK subscription app · HubSpot, Stripe, Postgres via CDC, Snowflake, dbt, Power BI" title="Where one customer turned up">
            <p>A customer emails asking to be deleted. Legal confirms the request and the deadline. The identity map resolves the email to one <code>person_id</code> with three source keys, and the inventory lists where they appear:</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>Where</th><th>Action</th></tr></thead>
              <tbody>
                <tr><td>HubSpot, Stripe, app database</td><td>Deleted through each system&rsquo;s own tools, per legal&rsquo;s scope</td></tr>
                <tr><td>Raw HubSpot table (soft-deleted row)</td><td>Hard delete</td></tr>
                <tr><td>Raw CDC change table (14 events)</td><td>Hard delete</td></tr>
                <tr><td>Customer snapshot (6 versions)</td><td>Identifiers stripped, key replaced, per DPO decision</td></tr>
                <tr><td>Incremental orders model</td><td>Customer key replaced to match the snapshot</td></tr>
                <tr><td>Power BI sales model (incremental refresh)</td><td>Historical partitions refreshed over XMLA</td></tr>
                <tr><td>Snowflake Time Travel and Fail-safe</td><td>Expiry dates logged</td></tr>
                <tr><td>Nightly backups</td><td>Logged as beyond use until overwritten</td></tr>
                <tr><td>Email marketing tool fed by reverse ETL</td><td>Vendor notified and deletion confirmed</td></tr>
              </tbody>
            </table></div>
            <p>The verification query returned zero in every live table. The reply to the customer listed when the remaining copies would expire.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li>Deleting in the warehouse but not the source, so the next sync or re-sync loads the person again.</li>
            <li>Treating a soft-delete flag as a deletion while the row still holds every personal column.</li>
            <li>Forgetting snapshots and incremental models, which never drop rows on their own.</li>
            <li>Putting the requester&rsquo;s email in a <code>where</code> clause, so it lands in a year of query history.</li>
            <li>Refreshing a Power BI model with incremental refresh and assuming history was reloaded.</li>
            <li>Restoring a backup without re-applying the suppression list.</li>
            <li>The data team deciding scope or exemptions instead of the DPO or legal team.</li>
            <li>Keeping an audit log that contains the very personal data it records as deleted.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When erasure needs a project</h2>
          <p>One or two requests a year across a small stack can be handled with this runbook and a spreadsheet. It becomes a system problem when requests are regular, the stack is wide, and nobody can say where a person lives without a day of searching. A <a href="/data-diagnostic">Data Diagnostic</a> maps where personal data sits today, and the <a href="/resources/data-diagnostic-checklist">data audit checklist</a> is the do-it-yourself version of that inventory.</p>
          <SystemBoundary
            conditions={[
              "Nobody can list every table and system that holds a given customer.",
              "There is no identity map, so each request starts with manual searching.",
              "dbt snapshots, SCD2 tables or history-mode connectors hold personal data with no purge process.",
              "Time travel, backup and log retention are unknown or set by default.",
              "Requests are tracked in email threads, with no audit log of actions.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Where the person lives, and what to do about each copy</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Where</th><th>Engineering action</th><th>Evidence to log</th></tr></thead>
            <tbody>
              <tr><td>Source systems</td><td>Delete through the system&rsquo;s own feature first</td><td>Date, system, confirmation</td></tr>
              <tr><td>Raw ELT tables</td><td>Hard delete soft-deleted rows and history-mode versions; suppress re-loads</td><td>Rows deleted, query ID</td></tr>
              <tr><td>CDC change tables</td><td>Delete raw events; null personal columns on tombstones</td><td>Rows deleted</td></tr>
              <tr><td>Snapshots and SCD2</td><td>Delete all versions, or strip identifiers as the DPO decides</td><td>Rows affected, method</td></tr>
              <tr><td>Incremental models and marts</td><td>Delete or update directly, or full refresh</td><td>Rows affected</td></tr>
              <tr><td>Time travel and fail-safe</td><td>Know and set retention per schema</td><td>Expiry date</td></tr>
              <tr><td>Backups</td><td>Beyond use; suppress on restore</td><td>Overwrite date</td></tr>
              <tr><td>Power BI and extracts</td><td>Refresh models, including historical partitions</td><td>Refresh time</td></tr>
              <tr><td>Logs</td><td>Use internal keys; know retention</td><td>Retention per log</td></tr>
              <tr><td>Processors and vendors</td><td>Notify and confirm</td><td>Date, reply</td></tr>
            </tbody>
          </table></div>
          <p>The purge jobs touch the same tables as your incremental builds; the <a href="/resources/dbt-incremental-strategy-picker">dbt incremental strategy picker</a> covers how each strategy treats hard deletes, and <a href="/insights/incremental-models-at-scale">processing billions of rows without full scans</a> covers rebuilding history cheaply when a full refresh is the safer route. To build the identity map, purge jobs and audit trail once, see <a href="/services/data-projects">our data projects</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
