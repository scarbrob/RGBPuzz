#!/usr/bin/env python3
"""Summarize an `az deployment group what-if` JSON result.

Renders a Markdown table for PR comments and job summaries, and can fail the
build when a change would delete or replace a resource.

Usage:
    summarize_whatif.py whatif.json
    summarize_whatif.py whatif.json --fail-on-destructive
"""

from __future__ import annotations

import argparse
import json
import sys

# Change types that actually destroy a resource. Only `Delete` qualifies:
# ARM's `Deploy` means "will be deployed, effect undeterminable" -- it shows up
# routinely for resources what-if cannot fully evaluate (existing refs, Key
# Vault, list*() expressions), so failing on it would red-flag every PR.
DESTRUCTIVE = {"Delete"}

# Worth calling out in the summary but not worth blocking on.
NEEDS_REVIEW = {"Deploy"}

ICONS = {
    "Create": "🟢",
    "Modify": "🟡",
    "Deploy": "🟠",
    "Delete": "🔴",
    "Ignore": "⚪",
    "NoChange": "⚪",
    "Unsupported": "⚪",
}


def short_id(resource_id: str) -> str:
    """Trim a full ARM id down to provider/type/name."""
    return resource_id.split("/providers/")[-1] if resource_id else resource_id


def collect(doc: dict) -> list[dict]:
    changes: list[dict] = []
    for key in ("changes", "potentialChanges"):
        for change in doc.get(key) or []:
            changes.append({**change, "_bucket": key})
    return changes


def render(changes: list[dict]) -> str:
    interesting = [c for c in changes if c.get("changeType") not in ("Ignore", "NoChange")]

    lines = ["## Infrastructure what-if", ""]

    if not interesting:
        lines.append("No changes. Infrastructure matches the template.")
        return "\n".join(lines) + "\n"

    counts: dict[str, int] = {}
    for c in interesting:
        counts[c["changeType"]] = counts.get(c["changeType"], 0) + 1
    summary = ", ".join(f"{n} {t.lower()}" for t, n in sorted(counts.items()))
    lines.append(f"**{len(interesting)} change(s):** {summary}")
    lines.append("")

    if any(c["changeType"] in NEEDS_REVIEW for c in interesting):
        lines.append(
            "> ⚠️ Some resources report `Deploy` -- what-if could not determine "
            "the effect. Review those manually before applying."
        )
        lines.append("")

    for c in interesting:
        icon = ICONS.get(c["changeType"], "❔")
        note = " _(conditional)_" if c["_bucket"] == "potentialChanges" else ""
        lines.append(f"- {icon} **{c['changeType']}** `{short_id(c.get('resourceId', ''))}`{note}")
        for delta in c.get("delta") or []:
            lines.append(f"  - `{delta.get('propertyChangeType')}` {delta.get('path')}")

    ignored = len(changes) - len(interesting)
    if ignored:
        lines.append("")
        lines.append(f"_{ignored} unchanged or ignored resource(s) omitted._")

    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("--fail-on-destructive", action="store_true")
    args = parser.parse_args()

    with open(args.path, encoding="utf-8") as handle:
        doc = json.load(handle)

    changes = collect(doc)

    if args.fail_on_destructive:
        bad = [
            c
            for c in changes
            if c.get("changeType") in DESTRUCTIVE and c.get("_bucket") == "changes"
        ]
        if bad:
            print("Destructive infrastructure changes detected:", file=sys.stderr)
            for c in bad:
                print(
                    f"  {c['changeType']}: {short_id(c.get('resourceId', ''))}",
                    file=sys.stderr,
                )
            print(
                "\nRefusing to proceed automatically. Review the plan and run the "
                "Infrastructure workflow manually with apply=true if this is intended.",
                file=sys.stderr,
            )
            return 1
        return 0

    print(render(changes), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
