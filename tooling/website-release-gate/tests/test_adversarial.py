"""Adversarial probes. A passing contract is not externally authenticated evidence."""
import datetime as dt
import unittest
from copy import deepcopy

from test_validator import CATALOG, NOW, SHA, gate, result, sample, stamp


class BypassTests(unittest.TestCase):
    def test_expected_sha_required(self):
        p, e = sample()
        out = gate.audit(CATALOG, p, e, "closeout", expected_sha="", now=NOW)
        self.assertTrue(any("expected --sha" in x for x in out["blockers"]))

    def test_case_insensitive_owner_separation(self):
        def alter(p, e):
            p["owners"] = {"builder": " Alex ", "reviewer": "ALEX", "approver": "alex"}
        self.assertTrue(any("distinct identities" in x for x in result(change=alter)["blockers"]))

    def test_reviewer_identity_matched_to_profile(self):
        def alter(p, e):
            e["controls"]["X11"]["reviewed_by"] = "Someone Else"
        self.assertTrue(any("designated reviewer" in x for x in result(change=alter)["blockers"]))

    def test_p0_na_requires_owner_and_evidence(self):
        def alter(p, e):
            e["controls"]["R17"] = {
                "status": "NOT_APPLICABLE", "release_sha": SHA,
                "reason": "Consent is out of scope on this static website",
                "reviewed_by": "Reviewer",
            }
        failures = result(change=alter)["blockers"]
        self.assertTrue(any("P0 NA needs project approver" in x for x in failures))
        self.assertTrue(any("P0 NA needs recent HTTPS" in x for x in failures))

    def test_valid_p0_na_contract(self):
        def alter(p, e):
            e["controls"]["R17"] = {
                "status": "NOT_APPLICABLE", "release_sha": SHA,
                "reason": "Independent cookie audit confirms no non-essential trackers",
                "reviewed_by": "Reviewer", "approved_by": "Owner",
                "evidence_url": "https://example.com/privacy-audit", "observed_at": stamp(),
            }
        self.assertEqual(result(change=alter)["status"], "CLOSEOUT_EVIDENCE_PASS")

    def test_exception_has_same_release_sha(self):
        def alter(p, e):
            e["controls"]["R11"] = {"status": "NOT_APPLICABLE",
                "reason": "No sticky CTA is in the approved design", "reviewed_by": "Reviewer",
                "release_sha": "b"*40}
        self.assertTrue(any("control evidence release_sha" in x
                            for x in result(change=alter)["blockers"]))

    def test_waiver_has_max_ninety_day_ttl(self):
        def alter(p, e):
            e["controls"]["R01"] = {"status": "WAIVED", "release_sha": SHA,
                "reviewed_by": "Reviewer", "waiver": {
                    "approved_by": "Owner", "reason": "Temporary documented gap",
                    "mitigation": "Fallback 404 redirect", "issue": "TKT-1",
                    "expires_at": (NOW + dt.timedelta(days=100)).isoformat()}}
        self.assertTrue(any("within 90 days" in x for x in result(change=alter)["blockers"]))

    def test_valid_p1_waiver_warns(self):
        def alter(p, e):
            e["controls"]["R01"] = {"status": "WAIVED", "release_sha": SHA,
                "reviewed_by": "Reviewer", "waiver": {
                    "approved_by": "Owner", "reason": "Temporary documented gap",
                    "mitigation": "Fallback 404 redirect", "issue": "TKT-1",
                    "expires_at": (NOW + dt.timedelta(days=2)).isoformat()}}
        out = result(change=alter)
        self.assertEqual(out["status"], "CLOSEOUT_EVIDENCE_PASS")
        self.assertTrue(any("separate, evidenced release-verifier decision" in x for x in out["warnings"]))

    def test_expired_deferral_fails(self):
        def alter(p, e):
            e["controls"]["R04"] = {"status": "DEFERRED", "release_sha": SHA,
                "reviewed_by": "Reviewer", "owner": "Engineer", "issue": "TKT-2",
                "due_date": "1999-01-01"}
        self.assertTrue(any("next 180 days" in x for x in result(change=alter)["blockers"]))

    def test_approval_old_and_unapproved(self):
        def alter(p, e):
            e["approvals"]["closeout"]["observed_at"] = "2001-01-01T00:00:00Z"
            e["approvals"]["live"]["decision"] = "PENDING"
        out = result(change=alter)
        self.assertTrue(any("closeout needs recent" in x for x in out["blockers"]))
        self.assertTrue(any("live requires explicit" in x for x in out["blockers"]))

    def test_catalog_missing_id_fails_cleanly(self):
        invalid = deepcopy(CATALOG)
        invalid["controls"][0].pop("id")
        p, e = sample()
        out = gate.audit(invalid, p, e, "closeout", expected_sha=SHA, now=NOW)
        self.assertTrue(out["blockers"])

    def test_catalog_unhashable_id_fails_cleanly(self):
        invalid = deepcopy(CATALOG)
        invalid["controls"][0]["id"] = ["unhashable"]
        p, e = sample()
        out = gate.audit(invalid, p, e, "closeout", expected_sha=SHA, now=NOW)
        self.assertTrue(out["blockers"])

    def test_boolean_is_not_schema_version_one(self):
        def alter(p, e):
            p["schema_version"] = True
        self.assertTrue(any("schema_version" in x for x in result(change=alter)["blockers"]))

    def test_phase_scoping(self):
        self.assertEqual(result("build")["status"], "BUILD_EVIDENCE_PASS")
        self.assertEqual(result("prelaunch")["status"], "PRELAUNCH_EVIDENCE_PASS")
        self.assertEqual(result("live")["status"], "LIVE_EVIDENCE_PASS")

    def test_live_control_does_not_block_staging(self):
        def alter(p, e):
            e["controls"].pop("X23")
        self.assertEqual(result("prelaunch", change=alter)["status"], "PRELAUNCH_EVIDENCE_PASS")

    def test_per_control_commit_binding(self):
        def alter(p, e):
            e["controls"]["X02"]["release_sha"] = "b"*40
        self.assertTrue(any("control evidence release_sha" in x for x in result(change=alter)["blockers"]))

    def test_reviewer_casing_is_normalized(self):
        def alter(p, e):
            e["controls"]["X02"]["reviewed_by"] = " reviewer "
        self.assertEqual(result(change=alter)["status"], "CLOSEOUT_EVIDENCE_PASS")

    def test_tester_casing_is_normalized(self):
        def alter(p, e):
            e["controls"]["X02"]["tested_by"] = "REVIEWER"
        self.assertTrue(any("independent reviewer must differ" in x for x in result(change=alter)["blockers"]))

    def test_future_evidence_is_blocked(self):
        def alter(p, e):
            e["controls"]["X23"]["observed_at"] = (NOW + dt.timedelta(days=1)).isoformat()
        self.assertTrue(any("future dated" in x for x in result(change=alter)["blockers"]))

    def test_insecure_evidence_url_fails(self):
        def alter(p, e):
            e["controls"]["X11"]["evidence_url"] = "http://example.com"
        self.assertTrue(any("HTTPS" in x for x in result(change=alter)["blockers"]))

    def test_missing_tester_fails(self):
        def alter(p, e):
            e["controls"]["X23"]["tested_by"] = ""
        self.assertTrue(any("needs tested_by" in x for x in result(change=alter)["blockers"]))

    def test_step_summary_escapes_html_and_linebreaks(self):
        self.assertEqual(gate.summary_text("<script>\nnew"), "&lt;script&gt; new")


if __name__ == "__main__":
    unittest.main()