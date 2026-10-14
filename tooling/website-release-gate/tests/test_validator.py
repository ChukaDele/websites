"""Contract tests for the website closeout evidence gate.

Mock evidence tests schema/invariants; they are not website/browser verification.
"""
import datetime as dt
import importlib.util
import json
import unittest
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("site_gate", ROOT / "validate.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)
CATALOG = json.loads((ROOT / "catalog.json").read_text())
SHA = "a" * 40
NOW = dt.datetime.now(dt.timezone.utc)


def stamp():
    return NOW.isoformat()


def sample(phase="closeout"):
    profile = {
        "schema_version": 1, "project": "Example", "repository": "owner/site",
        "site_type": "leadgen", "production_url": "https://example.com",
        "staging_url": "https://staging.example.com", "markets": ["UK"],
        "critical_journeys": ["Contact enquiry submitted and received"],
        "owners": {"builder": "Engineer", "reviewer": "Reviewer", "approver": "Owner"},
    }
    evidence = {
        "release_sha": SHA, "controls": {}, "approvals": {
            stage: {"approved_by": "Owner", "release_sha": SHA,
                    "evidence_url": "https://example.com/approval", "observed_at": stamp()}
            for stage in ("prelaunch", "live", "closeout")
        },
    }
    for row in CATALOG["controls"]:
        evidence["controls"][row["id"]] = {
            "status": "PASS", "evidence_url": "https://example.com/audit",
            "release_sha": SHA, "observed_at": stamp(),
            "tested_by": "Engineer", "reviewed_by": "Reviewer",
        }
    return profile, evidence


def result(phase="closeout", change=None):
    profile, evidence = sample()
    if change:
        change(profile, evidence)
    return gate.audit(CATALOG, profile, evidence, phase, expected_sha=SHA, now=NOW)


class GateTests(unittest.TestCase):
    def test_valid_mock_closeout_contract(self):
        self.assertEqual(result()["status"], "CLOSEOUT_EVIDENCE_PASS")

    def test_missing_control_is_blocked(self):
        r = result(change=lambda p, e: e["controls"].pop("R01"))
        self.assertEqual(r["status"], "CLOSEOUT_BLOCKED")
        self.assertTrue(any("R01" in s for s in r["blockers"]))

    def test_mismatched_release_sha_is_blocked(self):
        r = result(change=lambda p, e: e.update(release_sha="b" * 40))
        self.assertTrue(any("does not match" in s for s in r["blockers"]))

    def test_pass_requires_independent_review(self):
        r = result(change=lambda p, e: e["controls"]["X02"].update(reviewed_by="Engineer"))
        self.assertTrue(any("independent reviewer" in s for s in r["blockers"]))

    def test_stale_evidence_is_blocked(self):
        old = (NOW - dt.timedelta(days=24)).isoformat()
        r = result(change=lambda p, e: e["controls"]["R01"].update(observed_at=old))
        self.assertTrue(any("stale" in s for s in r["blockers"]))

    def test_non_conditional_na_is_blocked(self):
        def mutate(p, e):
            e["controls"]["X11"] = {
                "status": "NOT_APPLICABLE", "reviewed_by": "Reviewer",
                "reason": "Because the website has no HTTPS",
            }
        r = result(change=mutate)
        self.assertTrue(any("X11" in s and "cannot be NA" in s for s in r["blockers"]))

    def test_conditional_na_with_evidence_is_allowed(self):
        def mutate(p, e):
            e["controls"]["R11"] = {
                "status": "NOT_APPLICABLE", "reviewed_by": "Reviewer",
                "reason": "This site does not use sticky mobile conversion CTAs",
                "release_sha": SHA, "observed_at": stamp(), "tested_by": "Engineer",
                "evidence_url": "https://example.com/qa/no-sticky-cta",
            }
        self.assertEqual(result(change=mutate)["status"], "CLOSEOUT_EVIDENCE_PASS")

    def test_p0_waiver_is_forbidden(self):
        def mutate(p, e):
            e["controls"]["X11"] = {
                "status": "WAIVED", "reviewed_by": "Reviewer",
                "waiver": {"approved_by": "Owner", "reason": "Risks accepted",
                           "mitigation": "Temporary block", "issue": "TCK-1",
                           "expires_at": (NOW + dt.timedelta(days=2)).isoformat()},
            }
        r = result(change=mutate)
        self.assertTrue(any("X11" in s and "cannot waive" in s for s in r["blockers"]))

    def test_unauthorised_waiver_fails(self):
        def mutate(p, e):
            e["controls"]["R01"] = {
                "status": "WAIVED", "reviewed_by": "Reviewer",
                "waiver": {"approved_by": "Engineer", "reason": "Temporary accepted gap",
                           "mitigation": "Link to homepage", "issue": "TCK-1",
                           "expires_at": (NOW + dt.timedelta(days=2)).isoformat()},
            }
        self.assertTrue(any("must name the project approver" in s for s in result(change=mutate)["blockers"]))

    def test_missing_closeout_owner_approval_blocks(self):
        r = result(change=lambda p, e: e["approvals"].pop("closeout"))
        self.assertTrue(any("missing closeout approval" in s for s in r["blockers"]))

    def test_p2_deferral_with_owner_and_date_is_allowed(self):
        def mutate(p, e):
            e["controls"]["R04"] = {
                "status": "DEFERRED", "reviewed_by": "Reviewer", "owner": "Engineer",
                "issue": "TCK-2", "due_date": (NOW.date() + dt.timedelta(days=20)).isoformat(),
                "release_sha": SHA, "observed_at": stamp(), "tested_by": "Engineer",
                "evidence_url": "https://example.com/issues/TCK-2",
            }
        self.assertEqual(result(change=mutate)["status"], "CLOSEOUT_EVIDENCE_PASS")

    def test_intake_requires_profile(self):
        p, e = sample()
        p["critical_journeys"] = []
        r = gate.audit(CATALOG, p, {}, "intake")
        self.assertTrue(any("critical_journeys" in s for s in r["blockers"]))

    def test_conditional_na_without_release_evidence_is_blocked(self):
        def mutate(p, e):
            e["controls"]["R17"] = {
                "status": "NOT_APPLICABLE", "reviewed_by": "Reviewer",
                "reason": "The site only uses strictly necessary first-party storage",
            }
        r = result(change=mutate)
        self.assertEqual(r["status"], "CLOSEOUT_BLOCKED")
        self.assertTrue(any("R17" in issue and "evidence" in issue for issue in r["blockers"]))

    def test_deferred_invalid_due_date_is_blocked(self):
        def mutate(p, e):
            e["controls"]["R04"] = {
                "status": "DEFERRED", "reviewed_by": "Reviewer", "tested_by": "Engineer",
                "owner": "Engineer", "issue": "TCK-2", "due_date": "yesterday",
                "release_sha": SHA, "observed_at": stamp(),
                "evidence_url": "https://example.com/issues/TCK-2",
            }
        self.assertTrue(any("valid ISO" in b for b in result(change=mutate)["blockers"]))

    def test_deferred_past_due_date_is_blocked(self):
        def mutate(p, e):
            e["controls"]["R04"] = {
                "status": "DEFERRED", "reviewed_by": "Reviewer", "tested_by": "Engineer",
                "owner": "Engineer", "issue": "TCK-2",
                "due_date": (NOW.date() - dt.timedelta(days=1)).isoformat(),
                "release_sha": SHA, "observed_at": stamp(),
                "evidence_url": "https://example.com/issues/TCK-2",
            }
        self.assertTrue(any("within 90 days" in b for b in result(change=mutate)["blockers"]))

    def test_stale_closeout_approval_is_blocked(self):
        def mutate(p, e):
            e["approvals"]["closeout"]["observed_at"] = (NOW - dt.timedelta(days=30)).isoformat()
        self.assertTrue(any("closeout is stale" in b for b in result(change=mutate)["blockers"]))

    def test_future_closeout_approval_is_blocked(self):
        def mutate(p, e):
            e["approvals"]["closeout"]["observed_at"] = (NOW + dt.timedelta(days=3)).isoformat()
        self.assertTrue(any("closeout is stale" in b for b in result(change=mutate)["blockers"]))

    def test_missing_expected_commit_is_blocked(self):
        p, e = sample()
        r = gate.audit(CATALOG, p, e, "closeout", expected_sha="", now=NOW)
        self.assertTrue(any("verified --sha" in b for b in r["blockers"]))

    def test_waiver_without_owner_approval_link_is_blocked(self):
        def mutate(p, e):
            e["controls"]["R01"] = {
                "status": "WAIVED", "reviewed_by": "Reviewer", "tested_by": "Engineer",
                "release_sha": SHA, "observed_at": stamp(),
                "evidence_url": "https://example.com/issue/1",
                "waiver": {
                    "approved_by": "Owner", "reason": "Temporary landing 404 fallback",
                    "mitigation": "Server-level fallback installed", "issue": "TCK-1",
                    "expires_at": (NOW + dt.timedelta(days=2)).isoformat()
                }
            }
        self.assertTrue(any("owner-approval evidence URL" in b for b in result(change=mutate)["blockers"]))

    def test_valid_time_limited_waiver_contract(self):
        def mutate(p, e):
            e["controls"]["R01"] = {
                "status": "WAIVED", "reviewed_by": "Reviewer", "tested_by": "Engineer",
                "release_sha": SHA, "observed_at": stamp(),
                "evidence_url": "https://example.com/issues/TCK-1",
                "waiver": {
                    "approved_by": "Owner", "reason": "Temporary custom-404 fallback",
                    "mitigation": "Infrastructure-managed 404 for release", "issue": "TCK-1",
                    "evidence_url": "https://example.com/approvals/TCK-1",
                    "expires_at": (NOW + dt.timedelta(days=2)).isoformat()
                }
            }
        self.assertEqual(result(change=mutate)["status"], "CLOSEOUT_EVIDENCE_PASS")


if __name__ == "__main__":
    unittest.main()