// ═══ SAMPLE DOCUMENT PAIRS — Submitted vs Organization Standard ═══

export const COMPARE_PAIRS = [
  {
    id: "offer-comp",
    skill: "Offer Analyzer",
    area: "Talent Acquisition",
    icon: "💰",
    title: "Offer Letter vs Comp Band",
    vendor: {
      name: "Draft-Offer-SrEng-2026.txt",
      label: "Draft Offer Letter (To Review)",
      content: `OFFER OF EMPLOYMENT\n\nDear Alex Chen,\n\nWe are pleased to offer you the position of Senior Software Engineer, reporting to the VP of Engineering.\n\nSTART DATE: July 1, 2026\nLOCATION: Remote (US-based)\nCLASSIFICATION: Full-time, Exempt\n\nCOMPENSATION:\n- Base Salary: $215,000 annually\n- Annual Bonus: Up to 25% of base, at company's sole discretion\n- Equity: 15,000 RSUs vesting over 4 years with 1-year cliff\n- Sign-on Bonus: $30,000 (repayable if voluntary departure within 12 months)\n\nBENEFITS: Standard company benefits including health, dental, vision, 401(k) with 4% match.\n\nRESTRICTIVE COVENANTS:\n- Non-Competition: 24 months, worldwide\n- Non-Solicitation: 24 months\n- Invention Assignment: All inventions during employment and 12 months after\n\nAT-WILL: Terminable by either party at any time.\n\nThis offer expires in 3 business days.\n\nPlease sign below to accept.`
    },
    org: {
      name: "Org-Comp-Band-Policy.txt",
      label: "Our Compensation & Offer Policy",
      content: `ORGANIZATION STANDARD — COMPENSATION & OFFER POLICY\n\n1. SALARY BANDS (Engineering — US Remote)\n- Senior Engineer (L5): $175,000 - $205,000\n- Staff Engineer (L6): $200,000 - $240,000\nNew hires placed at 40th-60th percentile unless exceptional justification.\n\n2. BONUS\n- Target bonus must reference measurable criteria, not "sole discretion."\n- Senior Engineer target: 15%. Maximum 20%.\n\n3. EQUITY\n- Senior Engineer standard: 8,000 - 12,000 RSUs over 4 years.\n- Grants above maximum require VP HR + CFO approval.\n\n4. SIGN-ON BONUS\n- Maximum $25,000 for Senior Engineer level.\n- Repayment: Pro-rated over 12 months (not full clawback).\n\n5. RESTRICTIVE COVENANTS\n- Non-compete: Max 12 months. Geographic scope limited. Garden leave pay required.\n- Non-solicitation: Max 12 months. Limited to direct contacts.\n- Invention assignment: Must exclude personal unrelated projects per state law.\n\n6. OFFER EXPIRATION\n- Minimum 7 business days. 14 recommended.\n\n7. APPROVAL CHAIN\n- Within band: Hiring manager + recruiter.\n- Above band (up to 10%): VP HR.\n- Above band (>10%): CHRO required.`
    }
  },
  {
    id: "pip-review",
    skill: "PIP Drafter",
    area: "Performance Management",
    icon: "📊",
    title: "PIP Document vs Standards",
    vendor: {
      name: "Draft-PIP-MarketingMgr.txt",
      label: "Draft PIP (To Review)",
      content: `PERFORMANCE IMPROVEMENT PLAN\n\nEmployee: Jordan Williams\nTitle: Marketing Manager\nManager: Sarah Thompson, Director of Marketing\nDate: May 15, 2026\nReview Period: 30 days\n\nPERFORMANCE CONCERNS:\n- "Overall poor attitude and lack of initiative"\n- "Failure to meet expectations"\n- "Not a team player"\n- Q1 campaign results were below target\n\nIMPROVEMENT REQUIRED:\n- Improve attitude\n- Be more proactive\n- Deliver better results\n- Attend all team meetings\n\nMEASUREMENT:\n- Manager will assess based on general observations.\n\nCONSEQUENCES:\nIf performance does not improve within 30 days, employment will be terminated immediately.\n\nSUPPORT:\nNone specified.`
    },
    org: {
      name: "Org-PIP-Standards.txt",
      label: "Our PIP Documentation Standards",
      content: `ORGANIZATION STANDARD — PIP REQUIREMENTS\n\n1. DOCUMENTATION QUALITY\n- All concerns must cite SPECIFIC, OBSERVABLE behaviors with dates and examples.\n- "Poor attitude" is subjective. Use: "Missed 3 of 5 team meetings in March without notice."\n- Reference prior verbal/written warnings.\n\n2. MEASURABLE GOALS\n- Each area needs a SMART goal: "Deliver 2 campaign briefs per week by Friday COB."\n- Clear success criteria the employee can self-assess.\n\n3. PIP DURATION\n- Minimum 30 days. 60 days recommended for complex roles.\n- Weekly check-ins required.\n\n4. SUPPORT & RESOURCES\n- Must specify concrete support: training, mentorship, reduced workload.\n- Manager must document coaching sessions.\n\n5. CONSEQUENCES\n- Range of outcomes: successful completion, extension, role change, separation.\n- Never guarantee termination as sole outcome. Use "may result in further action up to and including separation."\n\n6. REVIEW & APPROVAL\n- All PIPs reviewed by HRBP before delivery.\n- Employee has 3 business days to review and respond.\n\n7. PRIOR DOCUMENTATION\n- PIP should not be first time employee hears concerns.\n- If no prior documentation, start with documented coaching, not a PIP.`
    }
  },
  {
    id: "handbook-law",
    skill: "Handbook Compliance Reviewer",
    area: "HR Compliance",
    icon: "📜",
    title: "PTO Policy vs State Law",
    vendor: {
      name: "Current-PTO-Policy.txt",
      label: "Current PTO Policy (Handbook)",
      content: `PTO POLICY (Effective Jan 1, 2024)\n\n1. ACCRUAL: 0-2 yrs: 10 days. 3-5 yrs: 15 days. 5+ yrs: 20 days.\nAccrual begins after 90-day probationary period.\n\n2. USAGE: 2 weeks advance notice. Manager approval required.\nNo more than 5 consecutive days without VP approval.\n\n3. CARRYOVER: Max 5 days. Unused PTO above 5 days forfeited Dec 31. No exceptions.\n\n4. SEPARATION: Voluntary resignation: PTO forfeited. Involuntary: paid at manager discretion.\n\n5. BLACKOUT: No PTO during Dec 15-31 (year-end) and 2 weeks post-launch.\n\n6. SICK LEAVE: PTO covers all time off including sick.\nDoctor's note required for 2+ consecutive days.`
    },
    org: {
      name: "State-Labor-Law-Requirements.txt",
      label: "State Labor Law Requirements (Multi-State)",
      content: `STATE LABOR LAW REQUIREMENTS — PTO & LEAVE (2026)\n\n1. PTO PAYOUT AT SEPARATION\nCA: PTO is earned wages. Must pay at separation. No forfeiture.\nCO: Earned vacation paid at separation. No forfeiture.\nIL: Earned vacation paid at separation.\nMA: Earned vacation is wages; must pay.\nNY: No state law, but if policy promises it, enforceable.\n\n2. ACCRUAL WAITING PERIODS\nCA: Accrual must begin at employment start. 90-day usage wait OK, accrual delay NOT OK.\n\n3. PAID SICK LEAVE (Separate from PTO)\nCA: Min 5 days/40 hrs. Cannot require doctor's note for <3 days.\nNY: Min 40-56 hrs. Cannot require doctor's note for <3 days.\nCO: Min 48 hrs. Accrual from day 1.\nChicago: 5 days paid leave + 5 days paid sick leave.\n\n4. USE-IT-OR-LOSE-IT\nCA: Prohibited for vacation/PTO. Reasonable accrual cap OK.\nCO: Permitted if clearly communicated. Not for earned vacation.\nMany states shifting toward prohibiting forfeiture.\n\n5. COMPLIANCE NOTES\n- FMLA leave cannot be denied regardless of blackout periods.\n- ADA accommodation may require PTO flexibility.\n- State sick leave laws supersede less protective PTO policies.\n- Multi-state employers must comply with EACH state's rules.`
    }
  },
  {
    id: "survey-benchmark",
    skill: "Engagement Survey Analyzer",
    area: "HR Analytics",
    icon: "📈",
    title: "Survey Results vs Benchmarks",
    vendor: {
      name: "Q1-2026-Engagement-Results.txt",
      label: "Q1 2026 Engagement Survey",
      content: `ENGAGEMENT SURVEY — Q1 2026\n\nResponse Rate: 72% (576/800)\neNPS: +12 (prior: +22)\nOverall Engagement: 3.4/5 (prior: 3.6)\n\nBY CATEGORY:\nMy Manager: 3.8 | Career Growth: 2.9 | Comp: 3.1\nWork-Life Balance: 3.5 | Company Direction: 3.2\nCollaboration: 4.0 | Recognition: 2.7 | Safety: 3.6\n\nBY DEPT:\nEngineering: 3.7 | Sales: 3.2 | Marketing: 2.8\nCustomer Success: 3.5 | Product: 3.6 | G&A: 3.0\n\nBY TENURE:\n<1yr: 3.8 | 1-2yr: 3.5 | 2-3yr: 3.0 | 3-5yr: 2.8 | 5+yr: 3.2\n\nTOP THEMES (246 comments):\n- "No clear path for growth" (58)\n- "Layoffs destroyed trust" (42)\n- "Comp hasn't kept up" (38)\n- "Work never recognized" (31)\n- "Love my team/manager" (45 positive)`
    },
    org: {
      name: "Industry-Engagement-Benchmarks.txt",
      label: "Industry Benchmarks (Tech, 500-2000 EEs)",
      content: `INDUSTRY BENCHMARKS — ENGAGEMENT (Tech, 500-2000 EEs, 2026)\n\n1. RESPONSE RATE: Median 78%. Top quartile 85%+. Below 70% = trust issue.\n\n2. OVERALL ENGAGEMENT: Median 3.7. Top quartile 4.0+. Below 3.5 = intervention needed.\n\n3. eNPS: Median +18. Top quartile +35+. Below +10 = critical.\n\n4. CATEGORY BENCHMARKS (median):\nManager: 3.9 | Career Growth: 3.5 | Comp: 3.4\nWork-Life: 3.6 | Direction: 3.6 | Collaboration: 3.8\nRecognition: 3.3 | Safety: 3.7\n\n5. THRESHOLDS:\nAny category <3.0: Red flag, 30-day action plan required.\nDrop >0.3 quarter-over-quarter: Root cause analysis required.\nDepartment variance >0.5 from company: Manager intervention needed.\n\n6. TENURE PATTERNS:\nHealthy: Slight dip at 2-3 yrs, recovery at 5+.\nUnhealthy: Continuous decline after yr 1 = systemic issue.\n"2-3 year valley" below 3.0 = high turnover risk.\n\n7. ACTION PLANNING:\nTeams <3.5: 90-day action plan required.\nResults shared with employees within 2 weeks.\nManager toolkits required for team debrief.`
    }
  },
  {
    id: "skills-gap",
    skill: "Skill Gap Analyzer",
    area: "Learning & Development",
    icon: "📚",
    title: "Skills Inventory vs Role Requirements",
    vendor: {
      name: "Engineering-Skills-Inventory.txt",
      label: "Engineering Team Skills Inventory",
      content: `SKILLS INVENTORY — ENGINEERING DEPARTMENT (Q2 2026)\nAssessment Method: Self + Manager rating (1-5 scale)\nTeam Size: 48 engineers\n\nCORE SKILLS (Avg rating):\nPython: 4.1 | JavaScript/TypeScript: 3.8 | Go: 2.2\nSQL: 3.5 | AWS: 3.2 | Kubernetes: 2.4\nCI/CD: 3.6 | System Design: 3.1 | API Design: 3.7\nTesting/QA: 3.0 | Security: 2.1 | Observability: 2.5\n\nEMERGING SKILLS:\nML/AI: 1.8 | LLM/GenAI: 1.4 | Rust: 0.8\nVector Databases: 0.9 | Edge Computing: 1.1\n\nLEADERSHIP SKILLS (Managers only, n=8):\nPeople Management: 3.4 | Technical Mentoring: 3.7\nProject Planning: 3.2 | Cross-functional: 2.9\nConflict Resolution: 2.6 | Hiring/Interviewing: 3.0\n\nCERTIFICATIONS:\nAWS Certified: 12/48 (25%)\nKubernetes (CKA): 4/48 (8%)\nSecurity+: 2/48 (4%)`
    },
    org: {
      name: "Eng-Role-Requirements-2026.txt",
      label: "Engineering Role Requirements (2026-2027)",
      content: `ENGINEERING COMPETENCY REQUIREMENTS — 2026-2027 ROADMAP\n\n1. CORE SKILLS (Minimum proficiency target: 3.5)\nPython: 4.0 | JavaScript/TypeScript: 4.0 | Go: 3.5\nSQL: 4.0 | AWS: 4.0 | Kubernetes: 3.5\nCI/CD: 4.0 | System Design: 3.5 | API Design: 4.0\nTesting/QA: 3.5 | Security: 3.5 | Observability: 3.5\n\n2. EMERGING SKILLS (Strategic priority — target by Q4 2027):\nML/AI: 3.0 (all) | LLM/GenAI: 3.5 (AI team), 2.5 (all)\nRust: 3.0 (infra team) | Vector Databases: 3.0 (data team)\n\n3. LEADERSHIP (All people managers must reach 3.5+):\nPeople Management: 4.0 | Technical Mentoring: 4.0\nProject Planning: 3.5 | Cross-functional: 3.5\nConflict Resolution: 3.5 | Hiring/Interviewing: 3.5\n\n4. CERTIFICATIONS (Required by role):\nAWS Certified: All cloud engineers (target 80%)\nKubernetes (CKA): All infra engineers (target 60%)\nSecurity+: All engineers touching PII (target 100%)\n\n5. SKILL GAP THRESHOLDS:\nCRITICAL: Team average >1.5 below target\nATTENTION: Team average 0.5-1.5 below target\nON TRACK: Team average within 0.5 of target\n\n6. REMEDIATION:\nCritical gaps: Mandatory training within 90 days.\nAttention gaps: Development plan within 30 days.\nBudget: $3,000/engineer/year for training + certifications.`
    }
  }
];
