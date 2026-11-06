"""Prints a Markdown summary of a package.xml or destructiveChanges.xml.

Usage: python3 summarise_manifest.py <manifest> <heading>
"""
import sys
import xml.etree.ElementTree as ET

NS = {"md": "http://soap.sforce.com/2006/04/metadata"}


def main() -> int:
    path, heading = sys.argv[1], sys.argv[2]
    try:
        root = ET.parse(path).getroot()
    except (OSError, ET.ParseError):
        return 0
    rows = []
    for t in root.findall("md:types", NS):
        name = t.findtext("md:name", default="", namespaces=NS)
        members = [m.text for m in t.findall("md:members", NS) if m.text]
        if members:
            rows.append((name, members))
    if not rows:
        return 0
    total = sum(len(m) for _, m in rows)
    print(f"### {heading} ({total})\n")
    print("| Type | Count | Components |")
    print("|---|---|---|")
    for name, members in rows:
        shown = ", ".join(f"`{m}`" for m in members[:20])
        if len(members) > 20:
            shown += f" and {len(members) - 20} more"
        print(f"| {name} | {len(members)} | {shown} |")
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
