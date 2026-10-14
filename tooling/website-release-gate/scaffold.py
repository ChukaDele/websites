#!/usr/bin/env python3
"""Write NOT_TESTED evidence template. Never silently overwrite or auto-pass."""
import argparse
import json
import re
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('--catalog', required=True)
p.add_argument('--sha', required=True)
p.add_argument('--output', required=True)
args = p.parse_args()
if not re.fullmatch(r'[0-9a-f]{40}', args.sha):
    p.error('SHA must have 40 lowercase hex characters')
target = Path(args.output)
catalog = json.loads(Path(args.catalog).read_text())
controls = {row['id']: {'status':'NOT_TESTED', 'reviewed_by':'', 'evidence_url':'', 'release_sha':args.sha, 'observed_at':'', 'tested_by':''} for row in catalog['controls']}
result = {'release_sha':args.sha, 'controls':controls, 'approvals':{}}
target.parent.mkdir(parents=True, exist_ok=True)
try:
    with target.open('x', encoding='utf-8') as handle:
        handle.write(json.dumps(result, indent=2) + '\n')
except FileExistsError:
    p.error('Evidence already exists: ' + str(target))
print(f'{len(controls)} NOT_TESTED controls written. This evidence is deliberately blocking.')