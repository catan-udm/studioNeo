#!/usr/bin/env python3
"""
PDF Generation Script for bikko.studio (studioNeo) HCI Documentation.
Converts markdown documentation files into professionally formatted PDF documents
using headless Google Chrome.
"""

import os
import subprocess
import markdown

WORKSPACE_DIR = "/home/sankobite/studioNeo_ehh"

MEMBERS = [
    {
        "id": "jaz",
        "name": "Jazmin Eunice C. Latoja",
        "role": "Role 1: CSS, JS, and HTML (Frontend UI, Vector Graphics & Accessibility Developer)",
        "md_file": os.path.join(WORKSPACE_DIR, "jaz_css_js_html.md"),
        "pdf_file": os.path.join(WORKSPACE_DIR, "jaz_css_js_html.pdf"),
        "color": "#8b5cf6"
    },
    {
        "id": "adrian",
        "name": "Carl Adrian A. Tan",
        "role": "Role 2: System Framework (Backend Architecture, WebAuthn, Security & PWA Developer)",
        "md_file": os.path.join(WORKSPACE_DIR, "adrian_system_framework.md"),
        "pdf_file": os.path.join(WORKSPACE_DIR, "adrian_system_framework.pdf"),
        "color": "#3b82f6"
    },
    {
        "id": "gwyneth",
        "name": "Gwyneth Vienne G. Villanueva",
        "role": "Role 3: Database and Queries (Cloud Database, Schema & Secure Storage Developer)",
        "md_file": os.path.join(WORKSPACE_DIR, "gwyneth_database_queries.md"),
        "pdf_file": os.path.join(WORKSPACE_DIR, "gwyneth_database_queries.pdf"),
        "color": "#10b981"
    },
    {
        "id": "paisley",
        "name": "Paisley Isha V. Doroja",
        "role": "Role 4: Inputting, Research, and Planning (UX Research, Content Seeding & QA Lead)",
        "md_file": os.path.join(WORKSPACE_DIR, "paisley_research_planning.md"),
        "pdf_file": os.path.join(WORKSPACE_DIR, "paisley_research_planning.pdf"),
        "color": "#ec4899"
    }
]

CSS_STYLES = """
@page {
  size: A4 portrait;
  margin: 18mm 16mm 18mm 16mm;
}
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 9.75pt;
  line-height: 1.55;
  color: #1f2937;
  background: #ffffff;
  margin: 0;
  padding: 0;
}
.header-bar {
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 8px;
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.header-bar .uni {
  font-size: 10pt;
  font-weight: 700;
  color: #1e1b4b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.header-bar .sub {
  font-size: 8.5pt;
  color: #4b5563;
  margin-top: 2px;
}
.header-bar .right-meta {
  text-align: right;
  font-size: 8.5pt;
  color: #4b5563;
}
.header-bar .right-meta strong {
  color: #4f46e5;
  font-size: 9.5pt;
}
h1 {
  font-size: 16pt;
  color: #111827;
  margin-top: 0;
  margin-bottom: 12px;
  border-bottom: 1.5px solid #e5e7eb;
  padding-bottom: 6px;
  page-break-after: avoid;
}
h2 {
  font-size: 12.5pt;
  color: #1f2937;
  margin-top: 18px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 4px;
  page-break-after: avoid;
}
h3 {
  font-size: 10.5pt;
  color: #374151;
  margin-top: 14px;
  margin-bottom: 6px;
  page-break-after: avoid;
}
h4 {
  font-size: 9.5pt;
  color: #4b5563;
  margin-top: 10px;
  margin-bottom: 4px;
  page-break-after: avoid;
}
p, ul, ol {
  margin-top: 4px;
  margin-bottom: 8px;
}
li {
  margin-bottom: 3px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 8.75pt;
  page-break-inside: avoid;
}
th, td {
  border: 1px solid #d1d5db;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}
th {
  background-color: #f3f4f6;
  color: #111827;
  font-weight: 600;
}
tr:nth-child(even) {
  background-color: #f9fafb;
}
pre {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 7.75pt;
  line-height: 1.4;
  overflow-x: auto;
  page-break-inside: avoid;
  white-space: pre-wrap;
  word-break: break-all;
}
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 8.5pt;
  background-color: #f1f5f9;
  padding: 2px 4px;
  border-radius: 3px;
  color: #0f172a;
}
pre code {
  background: transparent;
  padding: 0;
}
blockquote {
  border-left: 3.5px solid #4f46e5;
  padding-left: 12px;
  margin: 10px 0;
  color: #4b5563;
  background: #f5f3ff;
  padding-top: 6px;
  padding-bottom: 6px;
  border-radius: 0 4px 4px 0;
}
hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 14px 0;
}
.footer-note {
  margin-top: 24px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 8pt;
  color: #9ca3af;
  text-align: center;
}
"""

def generate_individual_pdf(member):
    md_path = member["md_file"]
    pdf_path = member["pdf_file"]
    html_temp = md_path.replace(".md", "_temp.html")

    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    body_html = markdown.markdown(md_text, extensions=["tables", "fenced_code"])

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{member["name"]} - {member["role"]}</title>
<style>
{CSS_STYLES}
.header-bar {{
  border-bottom-color: {member["color"]};
}}
</style>
</head>
<body>
<div class="header-bar">
  <div>
    <div class="uni">Universidad de Manila &bull; College of Computing Studies</div>
    <div class="sub">Human Computer Interaction (ITE 323) &bull; Prof. Mary Grace Nulud</div>
  </div>
  <div class="right-meta">
    <strong>bikko.studio</strong><br>
    Academic Year 2026
  </div>
</div>

{body_html}

<div class="footer-note">
  bikko.studio (studioNeo) &bull; UDM College of Computing Studies &bull; Human Computer Interaction (ITE 323) &bull; Final Documentation
</div>
</body>
</html>"""

    with open(html_temp, "w", encoding="utf-8") as f:
        f.write(full_html)

    subprocess.run([
        "google-chrome",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--print-to-pdf={pdf_path}",
        html_temp
    ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if os.path.exists(html_temp):
        os.remove(html_temp)

    print(f"Generated: {pdf_path}")


def generate_combined_pdf():
    combined_pdf_path = os.path.join(WORKSPACE_DIR, "bikko_studio_group_documentation.pdf")
    combined_html_path = os.path.join(WORKSPACE_DIR, "bikko_studio_group_temp.html")

    # Read all member markdown contents
    member_sections_html = []
    for member in MEMBERS:
        with open(member["md_file"], "r", encoding="utf-8") as f:
            md_text = f.read()
        part_html = markdown.markdown(md_text, extensions=["tables", "fenced_code"])
        member_sections_html.append(f"""
        <div class="member-divider" style="page-break-before: always; border-top: 3px solid {member["color"]}; padding-top: 16px; margin-top: 24px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid {member["color"]}; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
            <div style="font-size: 14pt; font-weight: 700; color: #111827;">{member["name"]}</div>
            <div style="font-size: 10.5pt; font-weight: 600; color: {member["color"]};">{member["role"]}</div>
          </div>
          {part_html}
        </div>
        """)

    all_parts_body = "\n".join(member_sections_html)

    cover_and_toc = """
    <div class="cover-page" style="page-break-after: always; text-align: center; padding-top: 50px;">
      <div style="font-size: 14pt; font-weight: 800; color: #1e1b4b; letter-spacing: 1px;">UNIVERSIDAD DE MANILA</div>
      <div style="font-size: 12pt; font-weight: 700; color: #4b5563; margin-top: 6px;">COLLEGE OF COMPUTING STUDIES</div>

      <div style="margin-top: 60px;">
        <div style="font-size: 22pt; font-weight: 800; color: #111827; letter-spacing: 0.5px;">FINAL DOCUMENTATION</div>
        <div style="font-size: 11pt; color: #6b7280; margin-top: 8px;">In partial fulfillment of the requirements for the subject</div>
        <div style="font-size: 13pt; font-weight: 700; color: #4f46e5; margin-top: 4px;">Human Computer Interaction - ITE 323</div>
      </div>

      <div style="margin-top: 70px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; max-width: 480px; margin-left: auto; margin-right: auto; text-align: left;">
        <div style="font-size: 9.5pt; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 12px;">Submitted by (Group Members):</div>
        <div style="font-size: 10.5pt; font-weight: 600; color: #1f2937; margin-bottom: 6px;">&bull; Doroja, Paisley Isha V. (Role 4: Planning & UX Lead)</div>
        <div style="font-size: 10.5pt; font-weight: 600; color: #1f2937; margin-bottom: 6px;">&bull; Latoja, Jazmin Eunice C. (Role 1: CSS, JS & HTML Developer)</div>
        <div style="font-size: 10.5pt; font-weight: 600; color: #1f2937; margin-bottom: 6px;">&bull; Tan, Carl Adrian A. (Role 2: System Framework Developer)</div>
        <div style="font-size: 10.5pt; font-weight: 600; color: #1f2937;">&bull; Villanueva, Gwyneth Vienne G. (Role 3: Database & Queries Developer)</div>

        <div style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
          <div style="font-size: 9.5pt; font-weight: 700; color: #6b7280; text-transform: uppercase;">Submitted to:</div>
          <div style="font-size: 11pt; font-weight: 700; color: #111827; margin-top: 4px;">Prof. Mary Grace Nulud</div>
        </div>

        <div style="margin-top: 14px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
          <div style="font-size: 9.5pt; font-weight: 700; color: #6b7280; text-transform: uppercase;">Academic Term / Date:</div>
          <div style="font-size: 10.5pt; color: #111827; margin-top: 4px;">October 9, 2026 / Academic Year 2026-2027</div>
        </div>
      </div>

      <div style="margin-top: 60px;">
        <div style="font-size: 12pt; font-weight: 700; color: #111827;">bikko.studio (studioNeo / sankobite-v3)</div>
        <div style="font-size: 9.5pt; color: #6b7280; margin-top: 4px;">An Interactive Studio Independent Website and Secure Digital Asset Sharing Platform</div>
      </div>
    </div>

    <div class="toc-page" style="page-break-after: always; padding-top: 20px;">
      <h1 style="text-align: center; margin-bottom: 24px;">Project Scope and Member Assignment Index</h1>
      
      <table style="margin-top: 20px;">
        <thead>
          <tr>
            <th>Group Member</th>
            <th>Role Assignment</th>
            <th>Core Subsystems</th>
            <th>Documentation Sections Owned</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Jazmin Eunice C. Latoja</strong> (Jaz)</td>
            <td>Role 1: CSS, JS & HTML Developer</td>
            <td>Semantic HTML5 landmarks, Liquid Glass Dynamic Island, 4-state morphing navigation, 60fps sub-2KB SVG vector engine, and canvas multi-format exporter</td>
            <td>Section 2.3.3 (WCAG 2.1 AA Compliance), Section 3.1 (Wireframes 3.1.1 - 3.1.5), Sections 3.3.1 - 3.3.4 (System Prototypes)</td>
          </tr>
          <tr>
            <td><strong>Carl Adrian A. Tan</strong> (Adrian)</td>
            <td>Role 2: System Framework Developer</td>
            <td>Next.js 16 App Router, React 19 Server Components, WebAuthn Level 3 biometric passkeys, sub-250ms sign-in, RFC 6238 TOTP, 10-minute email OTPs, secure cookies, and PWA Service Worker caching</td>
            <td>Section 2.3.1 (FR1, FR2, FR3, FR8), Section 2.3.2 (NFR1 - NFR6), Section 2.3.4 (Security Overview), Section 3.3.5 (PWA Offline Support)</td>
          </tr>
          <tr>
            <td><strong>Gwyneth Vienne G. Villanueva</strong> (Gwyneth)</td>
            <td>Role 3: Database & Queries Developer</td>
            <td>Azure Database for MySQL Flexible Server, 100% BCNF schema, connection pooling, WebAuthn credential tables, paginated feed/story queries, category filter indexing, and 15-minute temporary Azure Blob links</td>
            <td>Section 1.2.2 (Specific Objective 2), Section 2.2.3 (Asset Integrity), Section 2.3.1 (FR4, FR5, FR6, FR7), Section 3.2.3 (Storyboard Scenario 3)</td>
          </tr>
          <tr>
            <td><strong>Paisley Isha V. Doroja</strong> (Paisley)</td>
            <td>Role 4: Planning, Research & QA Lead</td>
            <td>Project Proposal & Objectives, 4 core bottlenecks, 5 target user groups, behavioral personas (Erika, Aria, Gabriel), comparison matrix, 4 interactive storyboards, artist seeding (@tamimoon, @rella, etc.), and NVDA accessibility testing</td>
            <td>Section 1 (Project Proposal), Section 2.1 & 2.2 (User Research & Needs), Section 3.2 (Storyboards 3.2.1, 3.2.2, 3.2.4), Section 4 (References)</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 30px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px 18px;">
        <div style="font-weight: 700; color: #166534; font-size: 10.5pt; margin-bottom: 6px;">Cross-Role Integration and Development Handoffs</div>
        <p style="font-size: 9pt; color: #15803d; margin: 0;">
          <strong>1. Passwordless Sign-in:</strong> Role 1 (Modal UI) &rarr; Role 2 (WebAuthn biometric challenge) &rarr; Role 3 (MySQL public key verification)<br>
          <strong>2. Curated Feed & Stories:</strong> Role 4 (Content seeding & sub-2KB SVGs) &rarr; Role 3 (Paginated SQL queries) &rarr; Role 1 (Glass cards & double-tap like burst)<br>
          <strong>3. Protected Asset Export:</strong> Role 1 (Browser canvas rasterization) &rarr; Role 3 (Entitlement check & 15-min Azure SAS link) &rarr; Role 2 (TLS transport check)<br>
          <strong>4. Accessibility & Offline:</strong> Role 1 (HTML5 landmarks & focus rings) &rarr; Role 2 (PWA app shell cache) &rarr; Role 4 (NVDA screen reader testing)
        </p>
      </div>
    </div>
    """

    combined_full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>bikko.studio - Final Documentation (ITE 323)</title>
<style>
{CSS_STYLES}
</style>
</head>
<body>
{cover_and_toc}
{all_parts_body}
</body>
</html>"""

    with open(combined_html_path, "w", encoding="utf-8") as f:
        f.write(combined_full_html)

    subprocess.run([
        "google-chrome",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--print-to-pdf={combined_pdf_path}",
        combined_html_path
    ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if os.path.exists(combined_html_path):
        os.remove(combined_html_path)

    print(f"Generated: {combined_pdf_path}")


if __name__ == "__main__":
    for m in MEMBERS:
        generate_individual_pdf(m)
    generate_combined_pdf()
