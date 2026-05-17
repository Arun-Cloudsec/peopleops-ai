export const SAMPLE_DOCS = [
  {
    name: "Sample Job Description",
    type: "talent",
    filename: "Sample-Job-Description.txt",
    content: "JOB DESCRIPTION\n\nTitle: Senior Software Engineer\nDepartment: Engineering\nReports To: VP of Engineering\nLocation: Remote (US-based)\nFLSA Status: Exempt\n\nSummary:\nWe are seeking a Senior Software Engineer to design and build scalable backend services. You will lead technical design decisions and mentor junior engineers.\n\nEssential Functions:\n- Design and implement microservices using Go or Python\n- Lead code reviews and establish engineering best practices\n- Collaborate with product managers to define technical requirements\n- Mentor junior engineers through pairing and design reviews\n- Participate in on-call rotation (1 week per 6 weeks)\n\nRequirements:\n- 5+ years software engineering experience\n- Proficiency in Go, Python, or Java\n- Experience with distributed systems and cloud platforms\n- Strong communication skills\n\nPreferred:\n- Experience with Kubernetes and Docker\n- Contributions to open-source projects\n- Experience at a high-growth startup\n\nCompensation: $170,000 - $210,000 base + equity + benefits\n\nEEO Statement: We are an equal opportunity employer.",
  },  {
    name: "Sample Performance Review",
    type: "performance",
    filename: "Sample-Performance-Review.txt",
    content: "ANNUAL PERFORMANCE REVIEW\n\nEmployee: Sarah Johnson\nTitle: Product Manager\nReview Period: Jan 1 - Dec 31, 2025\nReviewer: Michael Chen, Director of Product\n\nOverall Rating: Exceeds Expectations (4/5)\n\nGoal Achievement:\n1. Launch v3.0 mobile app (Target: Q2) \u2014 Achieved Q2, 4.6 app store rating\n2. Increase user retention by 15% \u2014 Achieved 18% improvement\n3. Reduce support tickets by 20% \u2014 Achieved 12% (partially met)\n4. Mentor 2 associate PMs \u2014 Completed, both promoted\n\nStrengths:\n- Exceptional stakeholder management across engineering, design, and sales\n- Data-driven decision making with clear success metrics\n- Strong mentorship and team development\n\nDevelopment Areas:\n- Could improve estimation accuracy for complex projects\n- Opportunity to develop executive presentation skills\n\nRecommendation: Promote to Senior Product Manager in Q2 2026",
  },  {
    name: "Sample Employee Handbook Section",
    type: "compliance",
    filename: "Sample-Employee-Handbook-Section.txt",
    content: "EMPLOYEE HANDBOOK \u2014 SECTION 7: TIME OFF & LEAVE\n\nEffective: January 1, 2026\n\n7.1 PAID TIME OFF (PTO)\nFull-time employees accrue PTO as follows:\n- Years 0-2: 15 days per year (accrued at 1.25 days/month)\n- Years 3-5: 20 days per year\n- Years 6+: 25 days per year\nMaximum accrual: 1.5x annual allotment. PTO is paid out at termination in [CA, CO, IL, MT, NE].\n\n7.2 SICK LEAVE\nAll employees receive 5 paid sick days per year. Unused sick time does not carry over. [Note: State-specific requirements may provide additional sick leave.]\n\n7.3 FAMILY AND MEDICAL LEAVE\nEligible employees may take up to 12 weeks of unpaid, job-protected leave under FMLA. Eligibility: 12 months of service, 1,250 hours worked.\n\n7.4 PARENTAL LEAVE\nPrimary caregiver: 16 weeks paid. Secondary caregiver: 6 weeks paid. Must be taken within 12 months of birth/adoption.\n\n7.5 BEREAVEMENT\nImmediate family: 5 days paid. Extended family: 3 days paid.",
  }
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
