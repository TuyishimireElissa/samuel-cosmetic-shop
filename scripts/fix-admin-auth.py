#!/usr/bin/env python3
"""
Fix ADMIN-001/API-001: Add checkAuth to all admin GET routes that are missing it.

Pattern: change `export async function GET() {` to:
  export async function GET(req: NextRequest) {
    const auth = checkAuth(req);
    if (!auth.ok) return auth.response;

Also ensures `NextRequest` is imported.
"""
import os
import re

ADMIN_DIR = "src/app/api/admin"

# Files where GET already takes req param — skip those
# Files to fix (GET without req param)
files_to_fix = []

for root, dirs, files in os.walk(ADMIN_DIR):
    for fname in files:
        if fname == "route.ts":
            fpath = os.path.join(root, fname)
            with open(fpath, "r") as f:
                content = f.read()
            # Check if GET exists and doesn't take req param
            m = re.search(r'export async function GET\(\)', content)
            if m:
                files_to_fix.append(fpath)

print(f"Found {len(files_to_fix)} files to fix:")
for f in files_to_fix:
    print(f"  {f}")

for fpath in files_to_fix:
    with open(fpath, "r") as f:
        content = f.read()

    # Ensure NextRequest is imported
    if "NextRequest" not in content:
        # Add NextRequest to the next/server import
        content = re.sub(
            r'import \{ NextResponse \} from "next/server";',
            'import { NextRequest, NextResponse } from "next/server";',
            content,
        )
        # Or if it's already `import { NextResponse, ... }`
        # Actually the regex above handles the common case

    # Ensure checkAuth is imported
    if "checkAuth" not in content:
        content = content.replace(
            'import { db } from "@/lib/db";',
            'import { db } from "@/lib/db";\nimport { checkAuth } from "@/lib/route-auth";',
        )

    # Replace GET() with GET(req: NextRequest) + auth check
    old = "export async function GET() {\n  try {"
    new = """export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try {"""

    if old in content:
        content = content.replace(old, new, 1)
    else:
        # Try variant without try on next line
        old2 = "export async function GET() {"
        new2 = """export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;"""
        content = content.replace(old2, new2, 1)

    with open(fpath, "w") as f:
        f.write(content)
    print(f"  Fixed: {fpath}")

print("\nDone!")
