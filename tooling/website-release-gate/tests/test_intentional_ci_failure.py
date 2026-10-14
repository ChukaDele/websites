"""Temporary negative E2E gate proof. Only in the test PR branch."""
import unittest

class VerifyQualityGateBlocks(unittest.TestCase):
    def test_intentional_failure_must_block_merge(self):
        self.fail('INTENTIONAL NEGATIVE TEST: website QA must prevent this PR merging')
