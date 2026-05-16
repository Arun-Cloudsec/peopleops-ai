// ═══ SAMPLE DOCUMENT PAIRS — Vendor vs Organization Standard ═══
// Each pair has a vendor/customer document and the org's standard/playbook

export const COMPARE_PAIRS = [
  {
    id: "nda",
    skill: "NDA Triager",
    area: "Commercial Legal",
    icon: "📜",
    title: "Non-Disclosure Agreement",
    vendor: {
      name: "Vendor-NDA-TechCorp-2026.txt",
      label: "TechCorp's NDA (Vendor Version)",
      content: `CONFIDENTIALITY AGREEMENT

This Confidentiality Agreement ("Agreement") is made between TechCorp Solutions Inc. ("Disclosing Party") and [Your Company] ("Receiving Party").

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by Disclosing Party, whether oral or written.

2. OBLIGATIONS
Receiving Party agrees to: (a) maintain confidentiality using reasonable efforts; (b) not disclose to third parties.

3. EXCLUSIONS
This Agreement does not apply to information that: (a) is publicly available; (b) was known to Receiving Party prior to disclosure.

4. TERM
This Agreement shall remain in effect for five (5) years from the date of disclosure. Obligations survive indefinitely.

5. RETURN OF MATERIALS
Upon termination, Receiving Party shall return all materials. Disclosing Party has no obligation to return Receiving Party's information.

6. REMEDIES
Receiving Party acknowledges that any breach shall entitle Disclosing Party to injunctive relief without posting bond, and Receiving Party waives all defenses to such relief.

7. NON-SOLICITATION
During the term and for two (2) years thereafter, Receiving Party shall not solicit or hire any employee of Disclosing Party.

8. RESIDUALS
Nothing in this Agreement restricts Disclosing Party's use of any information retained in the unaided memory of its personnel.

9. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware. Any disputes shall be resolved exclusively in Delaware courts.

10. MISCELLANEOUS
(a) This Agreement may only be amended in writing.
(b) Disclosing Party may assign this Agreement without consent.
(c) If any provision is invalid, the remaining provisions shall be enforced to the maximum extent permitted.`
    },
    org: {
      name: "Org-Standard-NDA-Template.txt",
      label: "Our Standard Mutual NDA",
      content: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into by and between [Party A] and [Party B] (each a "Party" and collectively the "Parties").

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by either Party, whether orally, in writing, or by inspection, including but not limited to: trade secrets, business plans, financial data, customer lists, technical specifications, source code, algorithms, and proprietary methodologies. Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was in the Receiving Party's possession prior to disclosure, as evidenced by written records; (c) is independently developed without use of Confidential Information, as evidenced by written records; (d) is rightfully received from a third party without restriction.

2. MUTUAL OBLIGATIONS
Each Party shall: (a) hold the other's Confidential Information in strict confidence using no less than the same degree of care it uses for its own confidential information, but no less than reasonable care; (b) not disclose to any third party without prior written consent; (c) use Confidential Information solely for evaluating or pursuing the business relationship between the Parties ("Purpose"); (d) limit access to employees and advisors with a need to know who are bound by written confidentiality obligations no less restrictive than this Agreement.

3. TERM AND SURVIVAL
This Agreement shall remain in effect for two (2) years from the Effective Date. The obligations of confidentiality shall survive for three (3) years following the expiration or termination.

4. RETURN OF MATERIALS
Upon written request or termination, each Party shall promptly return or destroy all Confidential Information of the other Party and certify such destruction in writing within thirty (30) days.

5. REMEDIES
The Parties acknowledge that breach may cause irreparable harm. Either Party shall be entitled to seek equitable relief in addition to other remedies available at law. Nothing in this section limits either Party's right to contest the appropriateness of equitable relief.

6. NO NON-SOLICITATION
This Agreement contains no non-solicitation, non-competition, or non-hire provisions.

7. NO RESIDUALS CLAUSE
No residuals clause is included. All confidentiality obligations apply regardless of how information is retained.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of [Home State], without regard to conflict of laws principles. Each Party consents to jurisdiction in [Home State] courts but neither Party waives the right to contest venue.

9. MISCELLANEOUS
(a) Entire Agreement. This constitutes the entire agreement regarding confidentiality.
(b) Amendment. Modifications must be in writing signed by both Parties.
(c) No Assignment. Neither Party may assign without written consent, not to be unreasonably withheld.
(d) Severability. If any provision is unenforceable, it shall be modified to the minimum extent necessary.
(e) Mutual obligations apply equally to both Parties.`
    }
  },
  {
    id: "msa",
    skill: "SaaS MSA Review",
    area: "Commercial Legal",
    icon: "💼",
    title: "SaaS Master Service Agreement",
    vendor: {
      name: "Vendor-MSA-CloudPlatform.txt",
      label: "CloudPlatform's SaaS MSA",
      content: `MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is between CloudPlatform Inc. ("Provider") and Customer.

1. SERVICES
Provider will provide the cloud platform services described in the applicable Order Form.

2. FEES AND PAYMENT
Customer shall pay all fees within 15 days of invoice. Late payments incur interest at 1.5% per month. Provider may suspend services after 10 days of non-payment without notice.

3. TERM AND RENEWAL
Initial term of 3 years. Agreement auto-renews for successive 1-year periods unless terminated with 120 days written notice.

4. DATA
4.1 Customer Data. Customer grants Provider a worldwide, perpetual, irrevocable license to use Customer Data for service improvement, analytics, benchmarking, and development of new products.
4.2 Data Location. Provider may process and store data in any jurisdiction where Provider or its subprocessors operate.
4.3 Data Retention. Upon termination, Provider will retain Customer Data for 90 days, after which it may be deleted without notice.

5. SECURITY
Provider maintains commercially reasonable security measures. Provider's total liability for any security breach is limited to fees paid in the 3 months preceding the breach.

6. INTELLECTUAL PROPERTY
6.1 All modifications, improvements, or derivative works created using Customer Data become Provider's exclusive property.
6.2 Customer feedback and suggestions become Provider's property without compensation.

7. WARRANTIES AND DISCLAIMERS
SERVICES ARE PROVIDED "AS IS." PROVIDER DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

8. LIMITATION OF LIABILITY
PROVIDER'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID BY CUSTOMER IN THE 6 MONTHS PRECEDING THE CLAIM. IN NO EVENT SHALL PROVIDER BE LIABLE FOR INDIRECT, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES.

9. INDEMNIFICATION
Customer shall indemnify and hold harmless Provider from all claims arising from Customer's use of the services. Provider has no indemnification obligations to Customer.

10. TERMINATION
Provider may terminate for convenience with 30 days notice. Customer may only terminate for material breach with 60 days written cure period. Upon termination by Provider, no refund of prepaid fees.

11. GOVERNING LAW
State of California. Mandatory binding arbitration. Class action waiver.`
    },
    org: {
      name: "Org-Standard-SaaS-MSA-Playbook.txt",
      label: "Our SaaS MSA Playbook Positions",
      content: `ORGANIZATION STANDARD — SaaS MSA APPROVED POSITIONS

1. SERVICES: Clear SLA with 99.9% uptime guarantee and service credits for downtime.

2. FEES: Net-30 payment terms minimum. No suspension without 30 days written notice of non-payment. Interest rate capped at lesser of 1% per month or maximum legal rate. Annual price increases capped at 3% or CPI.

3. TERM: Maximum 1-year auto-renewal. Cancel notice period no more than 60 days. No auto-renewal beyond initial term without affirmative opt-in.

4. DATA:
- Customer Data remains Customer's exclusive property at all times.
- No license granted to vendor for analytics, benchmarking, or product development using Customer Data.
- Data must be stored in US and EU only (no other jurisdictions without written consent).
- Upon termination: 60-day data export window with data returned in standard format (CSV/JSON), followed by certified deletion.

5. SECURITY:
- SOC 2 Type II certification required.
- Encryption at rest (AES-256) and in transit (TLS 1.3).
- Annual penetration testing with results shared.
- Breach notification within 48 hours.
- No liability cap on data breaches or confidentiality violations.

6. INTELLECTUAL PROPERTY:
- Customer retains all rights to its data, configurations, and customizations.
- Vendor retains its pre-existing IP.
- Customer feedback is provided voluntarily; vendor may use for improvement but must not attribute to Customer.

7. WARRANTIES: Vendor warrants services will materially conform to documentation. Warranty period: 12 months. Warranty remedy: repair, replace, or refund.

8. LIABILITY:
- Cap: Greater of 2x annual fees or $5M.
- Carve-outs from cap: IP infringement, confidentiality breach, data breach, willful misconduct.
- Mutual consequential damages waiver with carve-outs above.

9. INDEMNIFICATION: Mutual indemnification. Vendor indemnifies for IP infringement and data breaches. Customer indemnifies for content and misuse.

10. TERMINATION:
- Mutual termination for convenience with 60 days notice.
- Mutual termination for material breach with 30-day cure.
- Pro-rata refund of prepaid fees upon termination.
- Transition assistance for 90 days post-termination.

11. GOVERNING LAW: Home state law. Litigation in home state courts. No mandatory arbitration. No class action waiver.`
    }
  },
  {
    id: "dpa",
    skill: "DPA Reviewer",
    area: "Privacy Legal",
    icon: "🔒",
    title: "Data Processing Agreement",
    vendor: {
      name: "Vendor-DPA-DataSync.txt",
      label: "DataSync's DPA (Vendor Version)",
      content: `DATA PROCESSING AGREEMENT

This Data Processing Agreement ("DPA") is entered into by DataSync Analytics ("Processor") and Customer ("Controller").

1. SCOPE
Processor processes personal data as described in Annex 1 to provide analytics services.

2. INSTRUCTIONS
Processor shall process personal data in accordance with Controller's documented instructions. Processor may also process data as required by applicable law.

3. SUBPROCESSORS
Processor may engage subprocessors without prior notification to Controller. A current list is available on Processor's website. Controller's continued use of services after notification constitutes consent.

4. SECURITY
Processor implements appropriate technical measures. Specific measures are described in Processor's security whitepaper, which may be updated from time to time.

5. DATA BREACH NOTIFICATION
Processor shall notify Controller of a data breach without undue delay, and in any event within 72 hours of becoming aware.

6. DATA TRANSFERS
Processor may transfer personal data outside the EEA. Processor relies on its own assessment of adequate protections.

7. DATA SUBJECT RIGHTS
Processor shall assist Controller with data subject requests to the extent commercially reasonable. Processor may charge for such assistance.

8. AUDIT
Controller may audit Processor once per year with 60 days notice. Audit scope is limited to Processor's most recent SOC 2 report. On-site audits are not permitted.

9. DELETION
Upon termination, Processor shall delete personal data within 180 days unless retention is required by law.

10. LIABILITY
Processor's liability under this DPA is subject to the limitations in the main Agreement.`
    },
    org: {
      name: "Org-Standard-DPA-Requirements.txt",
      label: "Our DPA Standard Requirements",
      content: `ORGANIZATION STANDARD — DPA REQUIREMENTS (GDPR/CCPA COMPLIANT)

1. SCOPE: Clear description of processing activities, categories of data subjects, types of personal data, and purpose of processing in binding annex.

2. INSTRUCTIONS: Processor acts only on Controller's documented instructions. No processing beyond instructions without prior written consent. No "required by law" exception without notifying Controller first (unless prohibited by law).

3. SUBPROCESSORS: Prior written consent required for new subprocessors. Minimum 30-day notice before engagement. Controller has right to object. Processor remains fully liable for subprocessor acts.

4. SECURITY: Specific technical and organizational measures documented in annex (not a whitepaper that can change unilaterally). Minimum: encryption at rest and in transit, access controls, regular testing, pseudonymization where feasible.

5. BREACH NOTIFICATION: Notify Controller within 24 hours (not 72). Include: nature of breach, categories and number of data subjects affected, likely consequences, measures taken. Cooperate with Controller's investigation.

6. DATA TRANSFERS: No transfers outside EEA without Controller's prior written consent and appropriate safeguards (SCCs, adequacy decisions, or binding corporate rules). Transfer impact assessment required.

7. DATA SUBJECT RIGHTS: Processor assists Controller promptly and at no additional charge. Maximum response time: 5 business days.

8. AUDIT: Controller may audit with 30 days notice (not 60). On-site audits permitted. SOC 2 report supplements but does not replace audit rights. Processor bears cost of audit if material non-compliance found.

9. DELETION: Delete or return all personal data within 30 days of termination (not 180). Certified deletion with written confirmation. No retention beyond what is strictly required by law.

10. LIABILITY: No limitation of Processor's liability for data protection breaches. Processor indemnifies Controller for fines resulting from Processor's non-compliance.`
    }
  },
  {
    id: "employment",
    skill: "Hire Reviewer",
    area: "Employment Legal",
    icon: "👥",
    title: "Employment Offer Letter",
    vendor: {
      name: "Candidate-Offer-Letter-Draft.txt",
      label: "Draft Offer Letter (To Review)",
      content: `EMPLOYMENT OFFER LETTER

Dear [Candidate],

We are pleased to offer you the position of Senior Software Engineer at GlobalTech Industries, reporting to the VP of Engineering.

START DATE: June 15, 2026
LOCATION: Remote (US-based)
CLASSIFICATION: Full-time, Exempt

COMPENSATION:
- Base Salary: $195,000 annually
- Annual Bonus: Up to 20% of base salary, at company's sole discretion
- Equity: 10,000 RSUs vesting over 4 years with 1-year cliff

BENEFITS: Standard company benefits package including health, dental, vision, 401(k) with 4% match.

RESTRICTIVE COVENANTS:
- Non-Competition: You agree not to work for any competitor for 24 months following termination for any reason, worldwide.
- Non-Solicitation: You agree not to solicit any employee, customer, or vendor for 24 months following termination.
- Invention Assignment: All inventions, whether or not related to company business, created during employment and for 12 months after, are company property.

AT-WILL EMPLOYMENT: Your employment is at-will and may be terminated by either party at any time for any reason, with or without notice.

ARBITRATION: Any employment dispute shall be resolved through binding arbitration in Delaware under AAA rules. You waive all rights to jury trial and class/collective action.

This offer expires in 3 days.

Please sign below to accept.`
    },
    org: {
      name: "Org-Standard-Offer-Letter-Policy.txt",
      label: "Our Offer Letter Standards",
      content: `ORGANIZATION STANDARD — OFFER LETTER REQUIREMENTS

COMPENSATION: All compensation terms must be clearly stated. Bonus criteria should reference measurable targets, not "sole discretion." Equity vesting should follow standard 4-year/1-year cliff.

RESTRICTIVE COVENANTS:
- Non-Competition: Maximum 12 months. Must be limited to specific business area, not "any competitor." Must be geographically reasonable (state-level, not worldwide). Must comply with state-specific laws (California: unenforceable; Colorado, Illinois, Oregon: significant restrictions). Must include garden leave pay if enforced.
- Non-Solicitation: Maximum 12 months. Limited to contacts the employee actually worked with.
- Invention Assignment: Must exclude inventions on personal time unrelated to company business per state law (CA Labor Code 2870, IL 765 ILCS 1060, WA RCW 49.44.140). Must not extend post-employment.

AT-WILL: At-will statement is standard. Must not create implied contract through language like "permanent position" or "guaranteed."

DISPUTE RESOLUTION: No mandatory arbitration for employment disputes (company policy). Mutual agreement to mediate first. If arbitration is used, company pays all costs. No class/collective action waiver for FLSA claims (unenforceable per NLRA for concerted activity).

OFFER EXPIRATION: Minimum 7 business days for candidate to review. Recommend 14 days. 3-day deadlines create undue pressure and may be challenged.

COMPLIANCE: All offer letters reviewed by Employment Legal before sending. State-specific addenda required for CA, CO, IL, NY, WA employees.`
    }
  },
  {
    id: "ip-license",
    skill: "IP Clause Reviewer",
    area: "IP Legal",
    icon: "💡",
    title: "Software License Agreement",
    vendor: {
      name: "Vendor-License-Agreement-AITools.txt",
      label: "AI Tools Inc. License Agreement",
      content: `SOFTWARE LICENSE AGREEMENT

This Software License Agreement ("Agreement") is between AI Tools Inc. ("Licensor") and Customer ("Licensee").

1. LICENSE GRANT
Licensor grants Licensee a non-exclusive, non-transferable, revocable license to use the Software for internal business purposes.

2. RESTRICTIONS
Licensee shall not: (a) reverse engineer the Software; (b) use the Software to develop competing products; (c) share benchmark results without Licensor's consent; (d) exceed licensed user counts.

3. OWNERSHIP
Licensor retains all rights to the Software, including any modifications, customizations, or configurations created by Licensee. All training data, prompts, outputs, and fine-tuned models created using the Software are Licensor's exclusive property.

4. DATA USAGE
Licensor may use Licensee's input data and outputs to train, improve, and develop Licensor's products and services, including for third-party use.

5. WARRANTY
THE SOFTWARE IS PROVIDED "AS IS." LICENSOR MAKES NO WARRANTIES OF ANY KIND.

6. SUPPORT
Support is provided on a best-efforts basis. No SLA guaranteed.

7. TERM
Perpetual license until terminated. Licensor may terminate at any time with 30 days notice. No refund upon termination.

8. LIABILITY
LICENSOR'S TOTAL LIABILITY SHALL NOT EXCEED THE LICENSE FEES PAID IN THE PRIOR 3 MONTHS. LICENSOR SHALL NOT BE LIABLE FOR ANY LOSS OF DATA.

9. INDEMNIFICATION
Licensor does not indemnify Licensee for any IP infringement claims. Licensee indemnifies Licensor for all claims arising from Licensee's use.

10. EXPORT COMPLIANCE
Licensee is solely responsible for export compliance.`
    },
    org: {
      name: "Org-Standard-Software-License-Policy.txt",
      label: "Our Software License Standards",
      content: `ORGANIZATION STANDARD — SOFTWARE LICENSE REQUIREMENTS

1. LICENSE: Non-exclusive, non-transferable, irrevocable during term. Must be sufficient for our intended use case including disaster recovery and testing environments.

2. RESTRICTIONS: Anti-reverse-engineering is standard. Anti-benchmarking clauses are not acceptable — we must be able to evaluate performance. No restriction on competitive product development using general skills.

3. OWNERSHIP:
- Our configurations, customizations, and workflows remain our property.
- Our data, prompts, inputs, and outputs remain our exclusive property.
- AI-generated outputs using our data belong to us.
- Vendor retains its pre-existing IP only.

4. DATA USAGE: Vendor shall NOT use our data to train models, improve products, or share with third parties. Opt-out of all training data usage must be available and enabled by default.

5. WARRANTY: Vendor warrants Software materially conforms to documentation for minimum 12 months. Remedy: fix, replace, or refund.

6. SUPPORT: Defined SLA required. Minimum: P1 issues 4-hour response, P2 8-hour, P3 24-hour. Named support contact.

7. TERM: Defined term (not perpetual). Mutual termination rights. Pro-rata refund on early termination. 90-day data export window.

8. LIABILITY: Cap at greater of 12 months fees or $2M. Carve-outs: IP infringement, data breach, confidentiality violation, willful misconduct. No exclusion for data loss — this is critical.

9. INDEMNIFICATION: Mutual. Vendor must indemnify for IP infringement (critical for AI tools — copyright, patent, trade secret claims). Must cover defense costs and damages.

10. EXPORT: Shared responsibility. Vendor must provide export classification (ECCN). Vendor warrants compliance with its own export obligations.`
    }
  }
];
