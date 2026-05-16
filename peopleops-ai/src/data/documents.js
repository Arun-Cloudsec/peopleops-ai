export const SAMPLE_DOCS = [
  {
    name: "Mutual Non-Disclosure Agreement",
    type: "contract",
    filename: "Sample-Mutual-NDA.txt",
    content: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of [DATE] by and between:

Party A: [COMPANY NAME], a [STATE] corporation ("Disclosing Party")
Party B: [COUNTERPARTY NAME], a [STATE] corporation ("Receiving Party")

WHEREAS, the parties wish to explore a potential business relationship ("Purpose") and in connection therewith may disclose Confidential Information to each other.

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by either party, whether orally, in writing, or by inspection, including but not limited to: trade secrets, business plans, financial data, customer lists, technical specifications, source code, algorithms, and proprietary methodologies.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party shall: (a) hold Confidential Information in strict confidence; (b) not disclose to any third party without prior written consent; (c) use Confidential Information solely for the Purpose; (d) limit access to employees and advisors with a need to know who are bound by confidentiality obligations no less restrictive than this Agreement.

3. EXCLUSIONS
Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was in the Receiving Party's possession prior to disclosure; (c) is independently developed without use of Confidential Information; (d) is rightfully received from a third party without restriction.

4. TERM AND SURVIVAL
This Agreement shall remain in effect for two (2) years from the Effective Date. The obligations of confidentiality shall survive for three (3) years following the expiration or termination of this Agreement.

5. RETURN OF MATERIALS
Upon written request or termination, the Receiving Party shall promptly return or destroy all Confidential Information and certify such destruction in writing.

6. REMEDIES
The parties acknowledge that breach may cause irreparable harm for which monetary damages would be inadequate. The Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to other remedies.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of [STATE], without regard to conflict of laws principles.

8. MISCELLANEOUS
(a) Entire Agreement. This constitutes the entire agreement regarding confidentiality and supersedes all prior understandings.
(b) Amendment. Modifications must be in writing signed by both parties.
(c) Severability. If any provision is unenforceable, the remainder shall continue in full force.
(d) No Waiver. Failure to enforce any right shall not constitute a waiver.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

PARTY A: _________________________    PARTY B: _________________________
Name:                                  Name:
Title:                                 Title:
Date:                                  Date:`,
  },
  {
    name: "DSAR Response Template",
    type: "privacy",
    filename: "Sample-DSAR-Response.txt",
    content: `DATA SUBJECT ACCESS REQUEST (DSAR) RESPONSE TEMPLATE

Reference: DSAR-2026-[NUMBER]
Date Received: [DATE]
Response Due: [DATE + 30 DAYS / 45 DAYS WITH EXTENSION]
Data Subject: [NAME]
Status: [ ] Acknowledged  [ ] Identity Verified  [ ] Processing  [ ] Complete

SECTION 1: IDENTITY VERIFICATION
[ ] Government-issued ID reviewed
[ ] Identity confirmed against records
[ ] Verification notes: _______________

SECTION 2: SCOPE OF REQUEST
The data subject has requested:
[ ] Access to personal data (Art. 15 GDPR / CCPA 1798.100)
[ ] Rectification (Art. 16 GDPR)
[ ] Erasure / Deletion (Art. 17 GDPR / CCPA 1798.105)
[ ] Restriction of processing (Art. 18 GDPR)
[ ] Data portability (Art. 20 GDPR)
[ ] Objection to processing (Art. 21 GDPR)
[ ] Opt-out of sale/sharing (CCPA 1798.120)

SECTION 3: DATA INVENTORY
Systems searched:
[ ] CRM (Salesforce)      - Records found: Y/N
[ ] HRIS (Workday)        - Records found: Y/N
[ ] Marketing (HubSpot)   - Records found: Y/N
[ ] Support (Zendesk)     - Records found: Y/N
[ ] Analytics (Mixpanel)  - Records found: Y/N
[ ] Email archives        - Records found: Y/N
[ ] Backup systems        - Records found: Y/N

SECTION 4: EXEMPTIONS APPLIED
[ ] Legal privilege (attorney-client communications excluded)
[ ] Third-party personal data redacted
[ ] Trade secrets / IP redacted
[ ] Ongoing investigation exception
[ ] None - full disclosure

SECTION 5: RESPONSE LETTER
[Draft response to data subject with findings, any exemptions applied, and information about the right to lodge a complaint with the supervisory authority.]

SECTION 6: INTERNAL NOTES (PRIVILEGED)
[Notes for legal team only - not disclosed to data subject]`,
  },
  {
    name: "Legal Hold Notice",
    type: "litigation",
    filename: "Sample-Legal-Hold-Notice.txt",
    content: `LEGAL HOLD NOTICE - PRIVILEGED & CONFIDENTIAL

TO: [CUSTODIAN NAME(S)]
FROM: [LEGAL DEPARTMENT / OUTSIDE COUNSEL]
DATE: [DATE]
RE: Preservation Obligation - [MATTER NAME / NUMBER]

PLEASE READ THIS ENTIRE NOTICE CAREFULLY.
YOUR IMMEDIATE ACTION IS REQUIRED.

PURPOSE
[Company] reasonably anticipates litigation, a regulatory investigation, or an audit related to [brief, non-privileged description]. You have been identified as a person likely to possess documents or information relevant to this matter.

EFFECTIVE IMMEDIATELY, you must preserve all documents, communications, and electronically stored information ("ESI") that may be relevant.

WHAT TO PRESERVE
You must preserve ALL documents and ESI related to:
- [Topic 1 - e.g., "Project Atlas and all communications regarding its development"]
- [Topic 2 - e.g., "Communications with [counterparty] from January 2024 to present"]
- [Topic 3 - e.g., "Financial records and projections related to [product/service]"]

This includes but is not limited to:
- Emails (including drafts, deleted items, and attachments)
- Text messages, Slack messages, Teams chats
- Documents (Word, Excel, PowerPoint, PDFs)
- Calendar entries and meeting notes
- Voicemails
- Personal devices used for company business
- Cloud storage (Google Drive, Dropbox, OneDrive)
- Social media posts and direct messages

WHAT YOU MUST DO
1. STOP all routine deletion of potentially relevant materials
2. DISABLE auto-delete on email and messaging platforms
3. PRESERVE all relevant documents in their current location
4. DO NOT alter, modify, or reformat any documents
5. CONTACT Legal immediately if you have questions

WHAT YOU MUST NOT DO
- Do not delete any potentially relevant documents
- Do not move files to different locations without Legal approval
- Do not discuss this hold with persons outside the company
- Do not modify metadata or file properties

DURATION
This hold remains in effect until you receive written notice of release from the Legal Department.

ACKNOWLEDGMENT REQUIRED
Please confirm receipt by responding to [legal@company.com] within 48 hours:
[ ] I have read and understand this Legal Hold Notice
[ ] I will preserve all relevant documents and ESI
[ ] I have identified relevant material sources: [list]

Failure to comply may result in severe legal consequences including adverse inference instructions, monetary sanctions, and spoliation findings.

This notice is protected by attorney-client privilege and the work product doctrine.`,
  },
];

export const VULN_REPORT = [
  { severity: "info", title: "Prompt Injection Defenses Present", desc: "orchestrate.py implements closed-schema intents, target-agent allowlists, data-frame wrapping, and instruction-like-string stripping. Primary controls (schema + allowlist) are sound.", status: "pass" },
  { severity: "info", title: "Input Validation on Shell Scripts", desc: "deploy-managed-agent.sh validates SKILL_TITLE_PREFIX against [A-Za-z0-9._/:@ -] allowlist before interpolation into curl commands.", status: "pass" },
  { severity: "info", title: "YAML Substitution Hardened", desc: "yaml2json transformer enforces SAFE regex on all env-var substitutions, rejecting values with unsafe characters.", status: "pass" },
  { severity: "low", title: "Denylist-Based Stripping is Bypassable", desc: "orchestrate.py acknowledges this in its own security notes. Rely on closed-schema intents as the primary control, not string filtering.", status: "warn" },
  { severity: "low", title: "Audit Log Append-Only Not OS-Enforced", desc: "handoff-audit.jsonl uses regular file append. Consider append-only filesystem flags or a dedicated logging service.", status: "warn" },
  { severity: "info", title: "Matter Isolation Enforced", desc: "Skills check active matter workspace and never read another matter's files unless cross-matter context is explicitly enabled.", status: "pass" },
  { severity: "info", title: "Privilege Destination Check", desc: "Every skill runs a destination check before output — public channels and external recipients trigger privilege-waiver warnings.", status: "pass" },
  { severity: "medium", title: "MCP URLs Without Certificate Pinning", desc: ".mcp.json files contain HTTPS endpoints without certificate pinning at the client level. Consider adding TLS verification policies.", status: "warn" },
  { severity: "info", title: "Schema Validation on Subagent Outputs", desc: "validate.py uses jsonschema to validate managed-agent worker output against defined schemas. Proper error handling.", status: "pass" },
  { severity: "info", title: "Safe YAML Parsing", desc: "All YAML parsing uses yaml.safe_load — no unsafe deserialization detected. No pickle or eval usage.", status: "pass" },
  { severity: "info", title: "License Compliance Clean", desc: "No copyleft or restrictive license dependencies detected in the codebase.", status: "pass" },
  { severity: "info", title: "No Hardcoded Secrets", desc: "API keys read from environment variables. No credentials or secrets hardcoded in any source file.", status: "pass" },
];
