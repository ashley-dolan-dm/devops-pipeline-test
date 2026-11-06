"""Summarises Salesforce Code Analyzer JSON results.

Usage:
  python3 summarise_scan.py <results.json> <threshold>          prints a Markdown summary
  python3 summarise_scan.py <results.json> <threshold> --count  prints the number of issues
                                                                 at or above the threshold
Severity: 1 Critical, 2 High, 3 Moderate, 4 Low, 5 Info. Lower numbers are worse.
"""
import json
import sys

LABELS = {1: "Critical", 2: "High", 3: "Moderate", 4: "Low", 5: "Info"}


def load(path):
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, ValueError):
        return []
    return data.get("violations", []) if isinstance(data, dict) else []


def location(v):
    locs = v.get("locations") or []
    idx = v.get("primaryLocationIndex", 0) or 0
    loc = locs[idx] if 0 <= idx < len(locs) else (locs[0] if locs else {})
    return loc.get("file", ""), loc.get("startLine", "")


def main() -> int:
    path, threshold = sys.argv[1], int(sys.argv[2])
    violations = load(path)
    blocking = [v for v in violations if int(v.get("severity") or 5) <= threshold]
    if "--count" in sys.argv:
        print(len(blocking))
        return 0
    print("### Static analysis\n")
    if not violations:
        print("No issues found in the changed source.\n")
        return 0
    print(f"{len(violations)} issue(s) found, {len(blocking)} at severity {threshold} "
          f"({LABELS.get(threshold, threshold)}) or worse.\n")
    print("| Severity | Rule | File | Line | Message |")
    print("|---|---|---|---|---|")
    ordered = sorted(violations, key=lambda v: int(v.get("severity") or 5))
    for v in ordered[:100]:
        sev = int(v.get("severity") or 5)
        file, line = location(v)
        msg = str(v.get("message", "")).replace("|", "/").replace("\n", " ")[:200]
        print(f"| {LABELS.get(sev, sev)} | {v.get('engine', '')}:{v.get('rule', '')} | `{file}` | {line} | {msg} |")
    if len(violations) > 100:
        print(f"\nShowing 100 of {len(violations)}. The full results are in the job log.")
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
