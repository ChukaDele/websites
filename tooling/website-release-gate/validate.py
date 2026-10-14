#!/usr/bin/env python3
"""Fail-closed website release evidence validator. Python 3.11+, standard library only.

This checks completeness and consistency of a release evidence contract.
It does NOT perform the underlying browser/security/legal tests, verify linked
artifacts, configure branch protections, or authorise production deployment.
Those must run separately in CI and be attested by independent reviewers.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

PHASES = ("intake", "build", "prelaunch", "live", "closeout")
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
STATES = {"PASS", "FAIL", "BLOCKED", "NOT_TESTED", "NOT_APPLICABLE", "WAIVED", "DEFERRED"}
PRIORITIES = {"P0", "P1", "P2"}


def parse_time(value: object) -> dt.datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            return None
        return parsed.astimezone(dt.timezone.utc)
    except ValueError:
        return None


def parse_due_date(value: object) -> dt.date | None:
    if not isinstance(value, str) or not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value):
        return None
    try:
        return dt.date.fromisoformat(value)
    except ValueError:
        return None


def nonempty(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def usable_url(value: object) -> bool:
    if not nonempty(value):
        return False
    url = urlparse(value)
    return url.scheme == "https" and bool(url.netloc)


def load_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError(f"{path} must contain an object")
    return data


def audit(catalog: dict, profile: dict, evidence: dict, phase: str,
          expected_sha: str = "", now: dt.datetime | None = None) -> dict:
    if phase not in PHASES:
        raise ValueError(f"Unknown phase: {phase}")
    now = now or dt.datetime.now(dt.timezone.utc)
    blockers: list[str] = []
    warnings: list[str] = []

    if profile.get("schema_version") != 1:
        blockers.append("PROFILE: schema_version must be 1")
    for key in ("project", "repository", "site_type"):
        if not nonempty(profile.get(key)):
            blockers.append(f"PROFILE: {key} is required")
    for key in ("staging_url", "production_url"):
        if not usable_url(profile.get(key)):
            blockers.append(f"PROFILE: {key} must be an absolute HTTPS URL")
    markets = profile.get("markets")
    if not isinstance(markets, list) or not markets or not all(nonempty(x) for x in markets):
        blockers.append("PROFILE: markets must be a nonempty string array")
    journeys = profile.get("critical_journeys")
    if not isinstance(journeys, list) or not journeys or not all(nonempty(x) for x in journeys):
        blockers.append("PROFILE: critical_journeys must be a nonempty string array")
    owners = profile.get("owners")
    if not isinstance(owners, dict):
        owners = {}
    for role in ("builder", "reviewer", "approver"):
        if not nonempty(owners.get(role)):
            blockers.append(f"PROFILE: owners.{role} is required")
    if len({owners.get(x) for x in ("builder", "reviewer", "approver") if nonempty(owners.get(x))}) < 3:
        blockers.append("PROFILE: builder, reviewer and approver must be distinct identities")

    controls = catalog.get("controls")
    if catalog.get("schema_version") != 1 or not isinstance(controls, list) or not controls:
        blockers.append("CATALOG: invalid or empty schema_version/controls")
        controls = []
    seen: set[str] = set()
    for row in controls:
        if not isinstance(row, dict):
            blockers.append("CATALOG: every control must be an object")
            continue
        cid = row.get("id")
        if not nonempty(cid) or cid in seen:
            blockers.append(f"CATALOG: empty/duplicate control id {cid}")
        seen.add(cid)
        if row.get("phase") not in PHASES:
            blockers.append(f"CATALOG {cid}: invalid phase")
        if row.get("priority") not in PRIORITIES:
            blockers.append(f"CATALOG {cid}: invalid priority")

    release_sha = evidence.get("release_sha", "")
    if phase != "intake":
        if not isinstance(release_sha, str) or not SHA_RE.fullmatch(release_sha):
            blockers.append("EVIDENCE: release_sha must be a full 40-character Git SHA")
        if not isinstance(expected_sha, str) or not SHA_RE.fullmatch(expected_sha):
            blockers.append("EVIDENCE: verified --sha or GITHUB_SHA is required after intake")
        elif expected_sha != release_sha:
            blockers.append(f"EVIDENCE: release_sha {release_sha} does not match expected checkout {expected_sha}")
        entries = evidence.get("controls")
        if not isinstance(entries, dict):
            blockers.append("EVIDENCE: controls object is required")
            entries = {}
    else:
        entries = {}

    checked = 0
    for row in controls:
        if not isinstance(row, dict) or row.get("phase") not in PHASES:
            continue
        if PHASES.index(row["phase"]) > PHASES.index(phase) or phase == "intake":
            continue
        checked += 1
        cid = row["id"]
        item = entries.get(cid)
        if not isinstance(item, dict):
            blockers.append(f"{cid} [{row['priority']}]: missing evidence entry")
            continue
        status = item.get("status")
        if status not in STATES:
            blockers.append(f"{cid}: invalid status {status}")
            continue
        if status in ("FAIL", "BLOCKED", "NOT_TESTED"):
            blockers.append(f"{cid} [{row['priority']}]: {status}, release is blocked")
            continue
        reviewer = item.get("reviewed_by")
        if not nonempty(reviewer):
            blockers.append(f"{cid}: missing reviewed_by")
        if row["priority"] in ("P0", "P1") and reviewer == owners.get("builder"):
            blockers.append(f"{cid}: reviewer cannot be the builder")
        if status in ("NOT_APPLICABLE", "DEFERRED", "WAIVED"):
            # These are accepted exceptions, not a way around the release binding.
            if item.get("release_sha") != release_sha:
                blockers.append(f"{cid}: exception must bind to release SHA")
            observed = parse_time(item.get("observed_at"))
            if (observed is None or observed > now + dt.timedelta(minutes=5)
                    or now - observed > dt.timedelta(days=7)):
                blockers.append(f"{cid}: exception needs a recent verified timestamp")
            if not usable_url(item.get("evidence_url")):
                blockers.append(f"{cid}: exception needs an HTTPS evidence URL")
            if not nonempty(item.get("tested_by")):
                blockers.append(f"{cid}: exception needs tested_by")
            elif item.get("tested_by") == reviewer:
                blockers.append(f"{cid}: exception reviewer must differ from tester")
        if status == "NOT_APPLICABLE":
            if not row.get("conditional", False):
                blockers.append(f"{cid}: mandatory control cannot be NA")
            if len(str(item.get("reason", "")).strip()) < 15:
                blockers.append(f"{cid}: NA requires substantive applicability reason (15+ characters)")
            continue
        if status == "DEFERRED":
            if row["priority"] != "P2":
                blockers.append(f"{cid}: only P2 may be deferred")
            if not all(nonempty(item.get(k)) for k in ("owner", "issue", "due_date")):
                blockers.append(f"{cid}: deferred issue needs owner, issue, due_date")
            due = parse_due_date(item.get("due_date"))
            if due is None:
                blockers.append(f"{cid}: deferred issue needs valid ISO YYYY-MM-DD due_date")
            elif not now.date() <= due <= (now + dt.timedelta(days=90)).date():
                blockers.append(f"{cid}: deferred due_date must be today or within 90 days")
            continue
        if status == "WAIVED":
            waiver = item.get("waiver")
            if row["priority"] != "P1" or row.get("non_waivable", False):
                blockers.append(f"{cid}: cannot waive P0/P2 or non-waivable control")
                continue
            if not isinstance(waiver, dict):
                blockers.append(f"{cid}: no waiver evidence")
                continue
            if waiver.get("approved_by") != owners.get("approver"):
                blockers.append(f"{cid}: waiver must name the project approver")
            if not all(nonempty(waiver.get(k)) for k in ("reason", "mitigation", "issue", "expires_at")):
                blockers.append(f"{cid}: waiver missing reason/mitigation/issue/expiry")
            end = parse_time(waiver.get("expires_at"))
            if end is None or end <= now or end > now + dt.timedelta(days=30):
                blockers.append(f"{cid}: waiver must expire within 30 days")
            if not usable_url(waiver.get("evidence_url")):
                blockers.append(f"{cid}: waiver requires an HTTPS owner-approval evidence URL")
            warnings.append(f"{cid}: P1 owner-approved waiver requires separate human verification")
            continue

        # PASS: check the evidence contract. A link is an audit trail, not proof
        # that the attached artefact actually establishes the claimed result.
        if status == "PASS":
            if not usable_url(item.get("evidence_url")):
                blockers.append(f"{cid}: PASS needs HTTPS evidence_url")
            if item.get("release_sha") != release_sha:
                blockers.append(f"{cid}: PASS evidence commit differs from release_sha")
            observed = parse_time(item.get("observed_at"))
            age_limit_days = 7 if row["phase"] in ("live", "closeout") else 21
            if observed is None or observed > now + dt.timedelta(minutes=5) or now - observed > dt.timedelta(days=age_limit_days):
                blockers.append(f"{cid}: PASS evidence missing, future dated or stale (limit {age_limit_days}d)")
            if not nonempty(item.get("tested_by")):
                blockers.append(f"{cid}: PASS needs tested_by")
            if item.get("tested_by") == reviewer:
                blockers.append(f"{cid}: independent reviewer must differ from tester")

    if isinstance(entries, dict):
        for cid in entries:
            if cid not in seen:
                warnings.append(f"Unknown evidence control ID: {cid}")

    if phase in ("prelaunch", "live", "closeout"):
        approvals = evidence.get("approvals", {})
        if not isinstance(approvals, dict):
            approvals = {}
        for required_phase in PHASES[2:PHASES.index(phase)+1]:
            approval = approvals.get(required_phase)
            if not isinstance(approval, dict):
                blockers.append(f"APPROVAL: missing {required_phase} approval")
                continue
            if approval.get("approved_by") != owners.get("approver"):
                blockers.append(f"APPROVAL: {required_phase} approved_by must match project approver")
            if approval.get("release_sha") != release_sha:
                blockers.append(f"APPROVAL: {required_phase} must bind to release SHA")
            observed = parse_time(approval.get("observed_at"))
            if not usable_url(approval.get("evidence_url")) or observed is None:
                blockers.append(f"APPROVAL: {required_phase} needs evidence URL and timestamp")
            elif observed > now + dt.timedelta(minutes=5) or now - observed > dt.timedelta(days=7):
                blockers.append(f"APPROVAL: {required_phase} is stale or future dated")

    label = "EVIDENCE_PASS" if not blockers else "RELEASE_BLOCKED"
    if phase == "closeout":
        label = "CLOSEOUT_EVIDENCE_PASS" if not blockers else "CLOSEOUT_BLOCKED"
    return {"status": label, "phase": phase, "project": profile.get("project"),
            "release_sha": release_sha, "checked_controls": checked,
            "blockers": blockers, "warnings": warnings,
            "disclaimer": "Evidence contract validation only. CI browser, security and integration tests; real rule enforcement; and independent owner review remain separate."}


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate release/closeout evidence, fail closed")
    ap.add_argument("--catalog", required=True)
    ap.add_argument("--profile", required=True)
    ap.add_argument("--evidence")
    ap.add_argument("--phase", choices=PHASES, required=True)
    ap.add_argument("--sha", default=os.environ.get("GITHUB_SHA", ""))
    ap.add_argument("--report", default="")
    args = ap.parse_args()
    try:
        if args.phase != "intake" and not args.evidence:
            raise ValueError("--evidence is required after intake")
        if args.phase != "intake" and not SHA_RE.fullmatch(args.sha or ""):
            raise ValueError("--sha or GITHUB_SHA must be a verified 40-character commit SHA after intake")
        result = audit(load_json(args.catalog), load_json(args.profile),
                       load_json(args.evidence) if args.evidence else {},
                       args.phase, expected_sha=args.sha)
    except (OSError, ValueError, json.JSONDecodeError) as ex:
        result = {"status": "RELEASE_BLOCKED", "phase": args.phase, "blockers": [str(ex)],
                  "warnings": [], "checked_controls": 0}
    print(json.dumps(result, indent=2))
    if args.report:
        Path(args.report).parent.mkdir(parents=True, exist_ok=True)
        Path(args.report).write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(f"## Website release gate: {result['status']}\n\n")
            f.write(f"Phase: {args.phase}; controls evaluated: {result.get('checked_controls', 0)}\n\n")
            for blocker in result["blockers"]:
                f.write(f"- BLOCKER: {blocker}\n")
            for warning in result.get("warnings", []):
                f.write(f"- WARNING: {warning}\n")
    return 1 if result["blockers"] else 0


if __name__ == "__main__":
    sys.exit(main())