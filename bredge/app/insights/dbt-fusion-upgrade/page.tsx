import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "dbt-fusion-upgrade";
const TOC = [
  { id: "why", label: "Why upgrades break CI" },
  { id: "try-first", label: "Upgrade checklist" },
  { id: "deprecations", label: "The dbt 1.10 deprecations" },
  { id: "autofix", label: "Running dbt-autofix" },
  { id: "warn-error", label: "Keeping CI green during the fix" },
  { id: "adapters", label: "Packages, adapters and Snowflake" },
  { id: "rollout", label: "Rolling out dbt v2" },
  { id: "example", label: "Worked example: a red CI pipeline" },
  { id: "wrong", label: "Common upgrade mistakes" },
  { id: "boundary", label: "When to get help" },
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
            title="Upgrade in order: deprecations, autofix, packages, then the engine"
            caption="Most breakages come from deprecation warnings introduced in dbt 1.10. Clear them on your current version, then roll the new engine out environment by environment."
          >
            <svg viewBox="0 0 720 150" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <defs><marker id="df-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" /></marker></defs>
              {["read warnings", "dbt-autofix", "packages, adapters", "dev → staging → prod"].map((t, i) => (
                <g key={t}>
                  <rect x={10 + i * 180} y="50" width="160" height="46" rx="4" fill={i === 3 ? "rgba(144,210,111,.14)" : "#fff"} stroke={i === 3 ? "#90d26f" : "rgba(20,35,33,.35)"} />
                  <text x={90 + i * 180} y="78">{t}</text>
                  {i < 3 && <line x1={170 + i * 180} y1="73" x2={186 + i * 180} y2="73" stroke="rgba(20,35,33,.45)" markerEnd="url(#df-a)" />}
                </g>
              ))}
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why do dbt upgrades break CI?</h2>
          <p>dbt&rsquo;s Fusion engine became generally available on 16 September 2026, under the name dbt v2. Fusion validates projects more strictly than the old engine, and dbt 1.10 had already added deprecation warnings for patterns Fusion does not accept. Teams that run CI with <code>--warn-error</code> turn every one of those warnings into a failure, so the upgrade shows up as a wall of red builds.</p>
          <PlainEnglish>
            <p>dbt, the tool most data teams use to build their models, has a new engine. Moving to it is worthwhile but needs some tidying of old project code first. If your team treats warnings as errors, that tidying has to happen before the upgrade or every automated check will fail. The work is mostly mechanical, and dbt provides a tool that does much of it.</p>
            <ul>
              <li><strong>Ask your team</strong>: how many deprecation warnings does our project raise today, and which packages block the upgrade?</li>
              <li><strong>Expect back</strong>: a cleared warning list, a package check, and a rollout date for each environment with a rollback plan.</li>
            </ul>
          </PlainEnglish>
        </section>

        <section id="try-first">
          <h2>dbt v2 (Fusion) upgrade checklist</h2>
          <ForTheBusiness>Following this order keeps production running while the project is upgraded.</ForTheBusiness>
          <TryThisFirst title="Upgrade in this order">
            <ol>
              <li>Upgrade to the latest dbt 1.10 release and run <code>dbt parse</code>. Save the deprecation warnings.</li>
              <li>Run dbt-autofix in dry-run mode, review the changes, then apply them on a branch.</li>
              <li>Fix what autofix cannot, then confirm <code>dbt parse</code> runs without deprecation warnings.</li>
              <li>Check every package for compatibility with dbt v2 and upgrade or replace the blockers.</li>
              <li>Confirm your adapter is supported, and that dbt-snowflake is 1.10.6 or later.</li>
              <li>Roll out to development, then staging, then production, keeping a rollback to v1.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="deprecations">
          <h2>Which dbt 1.10 deprecations break builds?</h2>
          <ForTheBusiness>These are the specific code patterns that make CI fail, so the size of this list is the size of the job.</ForTheBusiness>
          <p>dbt&rsquo;s 1.10 upgrade guide lists the new deprecation warnings. The ones most projects hit:</p>
          <ul>
            <li><strong>Custom keys</strong>: unrecognised custom properties, configs and top-level keys. Custom metadata belongs under <code>config.meta</code>.</li>
            <li><strong>Properties moving under config</strong>: <code>freshness</code>, <code>meta</code>, <code>tags</code>, <code>docs</code>, <code>group</code> and <code>access</code>.</li>
            <li><strong>Duplicate YAML keys</strong> and unexpected Jinja blocks.</li>
            <li><strong>Old flags</strong>: <code>-m</code> and <code>--models</code>, and the <code>--output</code> option of source freshness.</li>
            <li><strong>Renamed options</strong>: the <code>warn_error_options</code> keys <code>include</code> and <code>exclude</code> are now <code>error</code> and <code>warn</code>; the old names were deprecated in dbt 1.8, and dbt v2 ignores them with a warning.</li>
          </ul>
          <p>A typical change, before:</p>
          <pre>{`models:
  - name: fct_orders
    meta:
      owner: finance
    tags: ["daily"]`}</pre>
          <p>After:</p>
          <pre>{`models:
  - name: fct_orders
    config:
      meta:
        owner: finance
      tags: ["daily"]`}</pre>
        </section>

        <section id="autofix">
          <h2>How to use dbt-autofix</h2>
          <ForTheBusiness>Autofix does most of the mechanical edits, so engineers only handle the cases that need judgement.</ForTheBusiness>
          <p><a href="https://github.com/dbt-labs/dbt-autofix" target="_blank" rel="noopener noreferrer">dbt-autofix</a> is a dbt Labs tool that rewrites deprecated project code. It moves configs under <code>config</code>, removes duplicate and custom top-level keys, removes orphaned <code>endmacro</code> tags and moves custom <code>config()</code> keys into <code>meta</code>. It runs through <code>uvx</code>, so it needs <a href="https://docs.astral.sh/uv/" target="_blank" rel="noopener noreferrer">uv</a> installed. Run it from the project root, on a branch:</p>
          <pre>{`uvx dbt-autofix deprecations --dry-run
uvx dbt-autofix deprecations
dbt parse`}</pre>
          <p>Fixes that change behaviour only run when you pass <code>--behavior-change</code> or <code>--all</code>; review those separately. dbt&rsquo;s upgrade guide treats autofix as the source of truth for these rewrites.</p>
        </section>

        <section id="warn-error">
          <h2>How to keep CI green while you fix deprecations</h2>
          <ForTheBusiness>This lets the team keep shipping while the deprecations are cleared, without hiding real errors.</ForTheBusiness>
          <p>If CI runs with all warnings as errors, keep that behaviour but downgrade deprecations to warnings until they are fixed. Replace the <code>--warn-error</code> flag with <code>warn_error_options</code> in <code>dbt_project.yml</code>; dbt documents that the two are mutually exclusive:</p>
          <pre>{`flags:
  warn_error_options:
    error: all
    warn:
      - Deprecations`}</pre>
          <p>Remove the <code>warn</code> entry once <code>dbt parse</code> is clean, so new deprecations fail CI again. dbt also cautions that <code>error: all</code> turns every future warning into an error, so in production jobs it recommends listing only the warnings you want to fail on. See dbt&rsquo;s <a href="https://docs.getdbt.com/reference/global-configs/warnings" target="_blank" rel="noopener noreferrer">warnings configuration</a>.</p>
        </section>

        <section id="adapters">
          <h2>Packages, adapters and the dbt-snowflake 1.10.6 fix</h2>
          <ForTheBusiness>One incompatible package or old adapter version can block the whole upgrade, so check them early.</ForTheBusiness>
          <ul>
            <li><strong>Adapters</strong>: dbt v2 supports Snowflake, BigQuery, Databricks and Redshift, with other adapters in beta. Check the current list before planning.</li>
            <li><strong>Packages</strong>: check each package in <code>packages.yml</code> for a version that supports dbt v2. Unmaintained packages may need replacing with your own macros.</li>
            <li><strong>dbt-snowflake</strong>: dbt documents that versions below 1.10.6 may fail to build certain incremental models after Snowflake increases its default column size for string and binary types. It affects models with collated string columns and <code>on_schema_change</code> set to <code>sync_all_columns</code>. Upgrade to 1.10.6 or later.</li>
          </ul>
        </section>

        <section id="rollout">
          <h2>How to roll out dbt v2 safely</h2>
          <ForTheBusiness>An environment-by-environment rollout means a problem is found in development, not in the board pack.</ForTheBusiness>
          <p>dbt&rsquo;s upgrade guide recommends moving development first, then staging, then production. Compare outputs between the old and new engines in staging for a full run, using the checks in <a href="/insights/warehouse-migration-parity">how to prove a migration didn&rsquo;t change the numbers</a>, and keep the option to roll back to v1 until production has run cleanly for an agreed period.</p>
          <Pull>Clear the warnings on the version you have. Then the engine upgrade is a rollout, not a rescue.</Pull>
        </section>

        <section id="example">
          <h2>Worked example: a CI pipeline that turned red</h2>
          <Example setting="Scale-up · dbt, Snowflake, GitHub Actions" title="320 deprecation warnings after upgrading to 1.10">
            <p>After upgrading to dbt 1.10, every pull request fails CI, because the project runs with <code>--warn-error</code> and parsing raises 320 deprecation warnings.</p>
            <ol>
              <li>CI swaps <code>--warn-error</code> for <code>warn_error_options</code> with Deprecations set to warn, and goes green.</li>
              <li>dbt-autofix fixes most warnings on a branch; the rest are custom keys in model YAML that move under <code>meta</code> by hand.</li>
              <li>One package has no compatible release and is replaced with two project macros.</li>
              <li>dbt-snowflake is upgraded to 1.10.6, staging runs on v2 for a week with outputs compared, then production moves.</li>
            </ol>
            <p>Counts are illustrative.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common dbt upgrade mistakes</h2>
          <ul>
            <li>Turning off <code>--warn-error</code> entirely to get CI green, and never turning it back on.</li>
            <li>Applying autofix behaviour-changing fixes without review.</li>
            <li>Upgrading production first.</li>
            <li>Discovering an incompatible package on the day of the upgrade.</li>
            <li>Skipping output comparison because &ldquo;it&rsquo;s only an engine change&rdquo;.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When a dbt upgrade needs outside help</h2>
          <SystemBoundary
            conditions={[
              "The project has hundreds of models and deprecation warnings in the hundreds.",
              "Several packages are unmaintained or heavily customised.",
              "Custom macros override core dbt behaviour.",
              "The team has no time to upgrade alongside feature work.",
              "Outputs must be shown to be unchanged for finance or audit.",
            ]}
          />
          <p>Once upgraded, <a href="/insights/speed-up-dbt-runs">how to speed up slow dbt runs</a> covers run times, and <a href="/insights/is-our-data-reliable">which dbt tests to add first</a> uses the 1.10 test syntax. Choose incremental strategies with the <a href="/resources/dbt-incremental-strategy-picker">dbt incremental strategy picker</a>, and check run times after the upgrade with the <a href="/resources/dbt-run-results-analyser">dbt run_results.json analyser</a>. To have the upgrade done without pausing feature work, see <a href="/services/data-projects">our upgrade projects</a> or <a href="/services/embedded-data-team">an embedded data team</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
