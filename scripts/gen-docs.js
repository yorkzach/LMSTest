#!/usr/bin/env node
/* Generates mock NTEC land/contract PDFs, writes them to /documents,
   and injects window.DOC_BLOB (base64 data URIs) into index.html.
   Pure Node, no dependencies — hand-rolled minimal PDF writer. */

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

/* ---------------- minimal PDF writer ---------------- */
function sanitize(s) {
  return String(s)
    .replace(/[–—]/g, "-")   // en/em dash
    .replace(/[·•]/g, "|")   // middot separator -> pipe (survives ascii filter, aids parsing)
    .replace(/½/g, "1/2").replace(/¼/g, "1/4").replace(/¾/g, "3/4")
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/§/g, "Sec.").replace(/[^\x20-\x7E]/g, "");
}
function pdfEsc(s) { return sanitize(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }

// crude width estimate for wrapping / centering (Helvetica)
function textWidth(s, size, bold) {
  const per = bold ? 0.53 : 0.5;
  return sanitize(s).length * size * per;
}
function wrap(text, size, maxW, bold) {
  const words = sanitize(text).split(/\s+/);
  const lines = []; let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (textWidth(t, size, bold) > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function Doc() {
  const PW = 612, PH = 792, ML = 62, MR = 62, MT = 60, MB = 58;
  const CW = PW - ML - MR;
  const pages = [];
  let ops = [], y = 0, pageNo = 0;

  function header() {
    // top brand band
    ops.push(`0.90 0.55 0.18 rg ${ML} ${PH - 44} ${CW} 3 re f`);
    ops.push(`0.55 0.36 0.18 rg`);
    ops.push(`BT /F2 8 Tf ${ML} ${PH - 40} Td (NTEC  |  NAVAJO TRANSITIONAL ENERGY COMPANY) Tj ET`);
    ops.push(`0.45 0.45 0.45 rg BT /F1 8 Tf ${PW - MR - textWidth("Land & Contract Administration", 8)} ${PH - 40} Td (Land & Contract Administration) Tj ET`);
    ops.push(`0 g`);
  }
  function footer() {
    ops.push(`0.6 w 0.8 0.8 0.8 RG ${ML} ${MB - 8} m ${PW - MR} ${MB - 8} l S`);
    ops.push(`0.5 0.5 0.5 rg BT /F1 7.5 Tf ${ML} ${MB - 20} Td (MOCK DOCUMENT - generated for the NTEC LandDesk prototype. Not a legal instrument.) Tj ET`);
    ops.push(`BT /F1 7.5 Tf ${PW - MR - 40} ${MB - 20} Td (Page ${pageNo}) Tj ET`);
    ops.push(`0 g`);
  }
  function newPage() {
    if (ops.length) { footer(); pages.push(ops); }
    ops = []; pageNo++;
    header();
    y = PH - 78;
  }
  function need(h) { if (y - h < MB + 18) newPage(); }

  function text(str, x, size, bold, color) {
    if (color) ops.push(`${color} rg`);
    ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfEsc(str)}) Tj ET`);
    if (color) ops.push(`0 g`);
  }

  const api = {
    title(t) {
      need(30);
      const size = 15;
      const w = textWidth(t, size, true);
      text(t, ML + (CW - w) / 2, size, true);
      y -= 8;
      ops.push(`0.90 0.55 0.18 RG 1.2 w ${ML + (CW - w) / 2 - 6} ${y} m ${ML + (CW + w) / 2 + 6} ${y} l S`);
      y -= 20;
    },
    subtitle(t) { need(16); text(t, ML, 9, false, "0.4 0.4 0.4"); y -= 18; },
    heading(t) {
      need(26); y -= 6;
      text(t.toUpperCase(), ML, 10.5, true, "0.50 0.33 0.15");
      y -= 5;
      ops.push(`0.85 0.85 0.85 RG 0.6 w ${ML} ${y} m ${PW - MR} ${y} l S`);
      y -= 15;
    },
    para(t, size) {
      size = size || 10;
      const lines = wrap(t, size, CW, false);
      for (const ln of lines) { need(size + 4); text(ln, ML, size); y -= size + 4; }
      y -= 4;
    },
    kv(label, value) {
      need(15);
      text(label, ML, 9.5, true);
      const lx = ML + 150;
      const lines = wrap(value, 9.5, CW - 150, false);
      lines.forEach((ln, i) => {
        if (i > 0) { need(13); }
        ops.push(`BT /F1 9.5 Tf ${lx} ${y} Td (${pdfEsc(ln)}) Tj ET`);
        if (i < lines.length - 1) y -= 12;
      });
      y -= 15;
    },
    bullet(t) {
      const lines = wrap(t, 9.5, CW - 16, false);
      need(13);
      text("-", ML + 4, 9.5, true);
      lines.forEach((ln, i) => {
        if (i > 0) need(12);
        ops.push(`BT /F1 9.5 Tf ${ML + 16} ${y} Td (${pdfEsc(ln)}) Tj ET`);
        y -= 12;
      });
      y -= 3;
    },
    space(n) { y -= (n || 10); },
    signatures(a, b) {
      need(70); y -= 20;
      const colW = (CW - 30) / 2;
      const lineY = y;
      ops.push(`0.3 0.3 0.3 RG 0.8 w ${ML} ${lineY} m ${ML + colW} ${lineY} l S`);
      ops.push(`${ML + colW + 30} ${lineY} m ${PW - MR} ${lineY} l S`);
      y -= 12;
      text(a, ML, 8.5, false, "0.4 0.4 0.4");
      text(b, ML + colW + 30, 8.5, false, "0.4 0.4 0.4");
      y -= 26;
      text("Date: ______________________", ML, 9);
      text("Date: ______________________", ML + colW + 30, 9);
      y -= 18;
    },
    build() {
      if (ops.length) { footer(); pages.push(ops); }
      return assemble(pages, PW, PH);
    },
  };
  newPage();
  return api;
}

function assemble(pages, PW, PH) {
  const objs = [];
  const push = (s) => { objs.push(s); return objs.length; };
  // 1 catalog, 2 pages, 3 F1, 4 F2 reserved
  const catalog = "<< /Type /Catalog /Pages 2 0 R >>";
  const fontsRef = "<< /F1 3 0 R /F2 4 0 R >>";
  const contentRefs = [];
  const pageRefs = [];
  // reserve numbering: catalog=1, pages=2, F1=3, F2=4
  // then for each page: content obj, page obj
  let objNum = 4;
  const pageObjs = [];
  for (const ops of pages) {
    const stream = ops.join("\n");
    const len = Buffer.byteLength(stream, "latin1");
    const contentNum = ++objNum;
    contentRefs.push(`${contentNum} 0 obj\n<< /Length ${len} >>\nstream\n${stream}\nendstream\nendobj\n`);
    const pageNum = ++objNum;
    pageRefs.push(`${pageNum} 0 R`);
    pageObjs.push(`${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] ` +
      `/Resources << /Font ${fontsRef} >> /Contents ${contentNum} 0 R >>\nendobj\n`);
  }

  const parts = [];
  parts.push(`1 0 obj\n${catalog}\nendobj\n`);
  parts.push(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pageRefs.length} >>\nendobj\n`);
  parts.push(`3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);
  parts.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`);
  for (let i = 0; i < contentRefs.length; i++) { parts.push(contentRefs[i]); parts.push(pageObjs[i]); }

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [];
  let pos = Buffer.byteLength(pdf, "latin1");
  // order objects by their number for xref: 1,2,3,4, then content/page interleaved
  const ordered = [parts[0], parts[1], parts[2], parts[3]];
  for (let i = 0; i < contentRefs.length; i++) { ordered.push(contentRefs[i]); ordered.push(pageObjs[i]); }
  for (const obj of ordered) { offsets.push(pos); pdf += obj; pos += Buffer.byteLength(obj, "latin1"); }

  const xrefPos = pos;
  const count = ordered.length + 1;
  let xref = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += String(off).padStart(10, "0") + " 00000 n \n";
  pdf += xref;
  pdf += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

/* ---------------- document content templates ---------------- */
function fmtDate(d) {
  if (!d) return "TBD";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function money(n) { return n ? "$" + Number(n).toLocaleString() : "N/A"; }

function leaseDoc(r, kindTitle) {
  const d = Doc();
  d.title(kindTitle);
  d.subtitle(`Instrument No. ${r.ref}   ·   ${r.county} County, ${r.state}   ·   Prepared ${fmtDate(r.eff || "2026-08-03")}`);
  d.heading("Parties");
  d.kv("Lessor / Grantor:", r.lessor);
  d.kv("Lessee / Grantee:", r.lessee);
  d.heading("Recitals");
  d.para(`THIS ${kindTitle.toUpperCase()} ("Agreement") is entered into by and between the parties identified above. ` +
    `Lessor is the owner of, or holds authority to lease, the lands described herein, and desires to lease said lands to Lessee ` +
    `for the purposes set forth below, subject to all applicable federal, tribal, and state regulations, including where applicable ` +
    `the oversight of the Bureau of Indian Affairs (BIA), Bureau of Land Management (BLM), and the Office of Surface Mining ` +
    `Reclamation and Enforcement (OSMRE).`);
  d.heading("Premises & Legal Description");
  d.kv("Legal Description:", r.legal);
  d.kv("Gross Acreage:", (Number(r.acres) || 0).toLocaleString() + " acres, more or less");
  d.para(`The leased premises are located within the Public Land Survey System as described above, together with all rights of ` +
    `ingress and egress reasonably necessary for the operations contemplated hereunder.`);
  d.heading("Term");
  d.kv("Effective Date:", fmtDate(r.eff));
  d.kv("Primary Term Ends:", fmtDate(r.exp));
  d.para(`This Agreement shall remain in effect for the primary term stated above and so long thereafter as operations are ` +
    `conducted or the premises are Held By Production (HBP), unless sooner terminated in accordance with its terms.`);
  d.heading("Consideration");
  d.kv("Annual Rental:", money(r.rental));
  d.kv("Royalty Rate:", r.royalty ? r.royalty + "% of gross proceeds" : "N/A");
  d.para(`Lessee shall pay the rentals and royalties set forth above in accordance with the payment schedule maintained by the ` +
    `NTEC Land Department. Time is of the essence with respect to all payment obligations.`);
  d.heading("Obligations & Compliance");
  d.bullet("Lessee shall conduct all operations in a good and workmanlike manner consistent with prudent industry practice.");
  d.bullet("Lessee shall comply with all reclamation, environmental, and bonding requirements applicable to the premises.");
  d.bullet("Lessee shall carry insurance and furnish certificates as required, and shall indemnify Lessor as provided herein.");
  d.bullet("Reports, rentals, and royalty statements shall be tendered on or before their respective due dates.");
  if (r.notes) { d.heading("Special Provisions"); d.para(r.notes); }
  d.heading("Execution");
  d.para("IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date first written above.");
  d.signatures("LESSOR / GRANTOR — " + r.lessor, "LESSEE / GRANTEE — " + r.lessee);
  return d.build();
}

function rowDoc(r) {
  const d = Doc();
  d.title("GRANT OF RIGHT-OF-WAY");
  d.subtitle(`Instrument No. ${r.ref}   ·   ${r.county} County, ${r.state}`);
  d.heading("Grant");
  d.para(`${r.lessor} ("Grantor") hereby grants and conveys to ${r.lessee} ("Grantee") a right-of-way and easement over, ` +
    `upon, and across the lands described below, for the purpose of constructing, operating, maintaining, and removing ` +
    `the facilities contemplated by this instrument, together with the right of ingress and egress.`);
  d.heading("Description of Right-of-Way");
  d.kv("Legal Description:", r.legal);
  d.kv("Area:", (Number(r.acres) || 0).toLocaleString() + " acres");
  d.kv("Corridor:", "As depicted on the plat/exhibit maintained in the record file.");
  d.heading("Term & Consideration");
  d.kv("Effective Date:", fmtDate(r.eff));
  d.kv("Expiration:", fmtDate(r.exp));
  d.kv("Annual Compensation:", money(r.rental));
  d.para(`This right-of-way is subject to BIA/BLM approval where the underlying lands are held in trust or federal status, ` +
    `and to renewal upon the terms then applicable.`);
  d.heading("Conditions");
  d.bullet("Grantee shall restore the surface to as near its original condition as practicable following construction.");
  d.bullet("Grantee shall maintain the right-of-way and any facilities in a safe condition throughout the term.");
  d.bullet("This grant is appurtenant to the permitted use and shall not be assigned except as permitted herein.");
  if (r.notes) { d.heading("Notes"); d.para(r.notes); }
  d.signatures("GRANTOR — " + r.lessor, "GRANTEE — " + r.lessee);
  return d.build();
}

function easementDoc(r) {
  const d = Doc();
  d.title("EASEMENT AGREEMENT");
  d.subtitle(`Instrument No. ${r.ref}   ·   ${r.county} County, ${r.state}`);
  d.heading("Grant of Easement");
  d.para(`${r.lessor} grants to ${r.lessee} a non-exclusive easement across the servient estate described below for the ` +
    `installation, operation, and maintenance of the facilities described herein.`);
  d.kv("Legal Description:", r.legal);
  d.kv("Area:", (Number(r.acres) || 0).toLocaleString() + " acres");
  d.kv("Effective Date:", fmtDate(r.eff));
  d.kv("Expiration:", fmtDate(r.exp));
  d.kv("Consideration:", money(r.rental) + " annually");
  d.heading("Covenants");
  d.bullet("The easement runs with the land and binds the successors and assigns of the parties.");
  d.bullet("Grantee shall maintain insurance and furnish a current certificate of insurance annually.");
  d.bullet("Grantee shall repair any damage to the servient estate arising from its use of the easement.");
  if (r.notes) { d.heading("Notes"); d.para(r.notes); }
  d.signatures("GRANTOR — " + r.lessor, "GRANTEE — " + r.lessee);
  return d.build();
}

function grazingDoc(r) {
  const d = Doc();
  d.title("GRAZING PERMIT");
  d.subtitle(`Permit No. ${r.ref}   ·   ${r.county} County, ${r.state}`);
  d.heading("Authorization");
  d.para(`${r.lessor} authorizes ${r.lessee} to graze livestock upon the allotment described below, subject to the animal ` +
    `unit month (AUM) limitations and the range management terms established by the administering agency.`);
  d.kv("Allotment:", r.legal);
  d.kv("Permitted Acreage:", (Number(r.acres) || 0).toLocaleString() + " acres");
  d.kv("Effective Date:", fmtDate(r.eff));
  d.kv("Expiration:", fmtDate(r.exp));
  d.kv("Annual Grazing Fee:", money(r.rental));
  d.heading("Terms");
  d.bullet("Permittee shall not exceed authorized AUMs and shall observe all seasonal use restrictions.");
  d.bullet("Permittee shall maintain range improvements and report livestock counts as required.");
  d.bullet("Permit is subject to non-renewal or adjustment based on range condition assessments.");
  if (r.notes) { d.heading("Notes"); d.para(r.notes); }
  d.signatures("ADMINISTERING AGENCY — " + r.lessor, "PERMITTEE — " + r.lessee);
  return d.build();
}

function royaltyDoc(r) {
  const d = Doc();
  d.title("ROYALTY DISTRIBUTION AGREEMENT");
  d.subtitle(`Ref. ${r.ref}   ·   ${r.county} County, ${r.state}`);
  d.heading("Purpose");
  d.para(`This Agreement governs the calculation, reporting, and distribution of royalties payable with respect to production ` +
    `from the tracts identified on the schedule maintained by the NTEC Land Department, between ${r.lessor} and ${r.lessee}.`);
  d.kv("Royalty Rate:", (r.royalty || "12.5") + "%");
  d.kv("Reporting Cycle:", "Monthly reconciliation; quarterly distribution");
  d.kv("Effective Date:", fmtDate(r.eff));
  d.kv("Term Ends:", fmtDate(r.exp));
  d.heading("Reporting Obligations");
  d.bullet("Royalty statements shall be delivered on or before the due date each reporting period.");
  d.bullet("Volumes shall be measured and allocated in accordance with the governing lease terms.");
  d.bullet("Underpayments and overpayments shall be reconciled in the following distribution cycle.");
  if (r.notes) { d.heading("Notes"); d.para(r.notes); }
  d.signatures("PAYOR — " + r.lessee, "PAYEE / TRUSTEE — " + r.lessor);
  return d.build();
}

function accessDoc(r) {
  const d = Doc();
  d.title("LAND ACCESS & USE AGREEMENT");
  d.subtitle(`Ref. ${r.ref}   ·   ${r.county} County, ${r.state}`);
  d.heading("Grant of Access");
  d.para(`${r.lessor} grants ${r.lessee} the right to access and use the lands described below for the limited purposes ` +
    `described herein, including reclamation, monitoring, and related activities.`);
  d.kv("Legal Description:", r.legal);
  d.kv("Area:", (Number(r.acres) || 0).toLocaleString() + " acres");
  d.kv("Effective Date:", fmtDate(r.eff));
  d.kv("Expiration:", fmtDate(r.exp));
  d.heading("Terms");
  d.bullet("Use shall be limited to the stated purposes and shall not interfere with Grantor's other uses.");
  d.bullet("Grantee shall observe all environmental and cultural resource protection requirements.");
  if (r.notes) { d.heading("Notes"); d.para(r.notes); }
  d.signatures("GRANTOR — " + r.lessor, "GRANTEE — " + r.lessee);
  return d.build();
}

// Secondary supporting document (short)
function memoDoc(r, subject, body) {
  const d = Doc();
  d.title("LAND DEPARTMENT MEMORANDUM");
  d.subtitle(`Re: ${r.name}   ·   ${r.id}`);
  d.kv("Record:", r.name);
  d.kv("Instrument No.:", r.ref);
  d.kv("Subject:", subject);
  d.kv("Date:", fmtDate("2026-07-15"));
  d.heading("Summary");
  d.para(body);
  d.heading("Recommended Action");
  d.bullet("Route to Land Manager for review and calendar the associated obligation in the tickler system.");
  d.bullet("Confirm agency approvals and file supporting correspondence in the record.");
  d.signatures("PREPARED BY — NTEC Land Analyst", "REVIEWED BY — Land Manager");
  return d.build();
}

/* ---------------- record definitions (mirror seed) ---------------- */
const R = [
  { id: "REC-1000", name: "Navajo Mine - Area IV North Coal Lease", type: "Coal Lease", lessor: "Navajo Nation", lessee: "NTEC Operations LLC", county: "San Juan", state: "NM", legal: "T29N R16W Sec 4-9, 16-21", acres: 12480, ref: "BIA-14-20-0300-1234", eff: "2013-12-30", exp: "2032-12-31", rental: 0, royalty: 12.5, notes: "Coal supply for Four Corners Power Plant. Held by production; royalty reporting monthly to OSMRE." },
  { id: "REC-1001", name: "Four Corners Rail Spur - Right of Way", type: "Right-of-Way (ROW)", lessor: "Allottee Group 22-A", lessee: "NTEC Operations LLC", county: "San Juan", state: "NM", legal: "T30N R16W Sec 12, N1/2", acres: 88.4, ref: "BK 512 PG 044", eff: "2019-05-01", exp: "2026-09-15", rental: 42000, royalty: 0, notes: "20-ft rail access ROW across allotted trust land. BIA renewal packet in progress." },
  { id: "REC-1002", name: "Bisti Solar Option - Surface Lease", type: "Surface Lease", lessor: "Private - R. Yazzie Family Trust", lessee: "NTEC Clean Energy", county: "San Juan", state: "NM", legal: "T24N R11W Sec 30, SW1/4", acres: 640, ref: "PENDING", eff: "", exp: "", rental: 96000, royalty: 0, notes: "Option to lease 640 ac for utility-scale solar. Option exercise deadline requires escalation." },
  { id: "REC-1003", name: "Bull Canyon Grazing Permit", type: "Grazing Permit", lessor: "Bureau of Land Management", lessee: "NTEC Operations LLC", county: "Big Horn", state: "MT", legal: "T2S R38E Sec 22-27", acres: 3200, ref: "BLM-MTM-118842", eff: "2021-03-01", exp: "2031-02-28", rental: 5760, royalty: 0, notes: "AUM grazing on federal land adjacent to Spring Creek Mine buffer." },
  { id: "REC-1004", name: "Spring Creek Mine - Federal Coal Lease MTM-94378", type: "Coal Lease", lessor: "Bureau of Land Management", lessee: "Spring Creek Coal (NTEC)", county: "Big Horn", state: "MT", legal: "T9S R40E Sec 1-4, 9-12", acres: 8960, ref: "MTM-94378", eff: "2012-06-01", exp: "2032-05-31", rental: 89600, royalty: 12.5, notes: "Advance royalty / rental due annually to BLM. Diligent development compliance required." },
  { id: "REC-1005", name: "Antelope Water Pipeline Easement", type: "Easement", lessor: "Rosebud County", lessee: "Spring Creek Coal (NTEC)", county: "Rosebud", state: "MT", legal: "T4S R41E Sec 18", acres: 14.2, ref: "BK 88 PG 302", eff: "2018-08-15", exp: "2038-08-14", rental: 3000, royalty: 0, notes: "20-yr easement for water conveyance. COI renewal required annually." },
  { id: "REC-1006", name: "Section 16 Oil & Gas Lease - Yazzie", type: "Oil & Gas Lease", lessor: "Allottee - Ella Yazzie", lessee: "NTEC Operations LLC", county: "San Juan", state: "NM", legal: "T27N R13W Sec 16, all", acres: 640, ref: "BIA-OG-55120", eff: "2022-11-01", exp: "2027-10-31", rental: 12800, royalty: 18.75, notes: "5-yr primary term, 18.75% royalty. HBP if production established." },
  { id: "REC-1007", name: "Mesa Verde Transmission Corridor ROW", type: "Right-of-Way (ROW)", lessor: "Ute Mountain Ute Tribe", lessee: "NTEC Clean Energy", county: "Montezuma", state: "CO", legal: "T34N R18W Sec 6, 7", acres: 210, ref: "PENDING", eff: "", exp: "", rental: 63000, royalty: 0, notes: "230kV transmission ROW for solar interconnect. Awaiting tribal council + BIA approval." },
  { id: "REC-1008", name: "Reclamation Bond Parcel - Area III", type: "Access / Land Use", lessor: "Navajo Nation", lessee: "NTEC Operations LLC", county: "San Juan", state: "NM", legal: "T29N R16W Sec 28", acres: 320, ref: "REC-BOND-0091", eff: "2015-01-01", exp: "2029-12-31", rental: 0, royalty: 0, notes: "Post-mining reclamation obligation. Phase 2 revegetation milestone tracked." },
  { id: "REC-1009", name: "Hopi Boundary Access Agreement", type: "Access / Land Use", lessor: "Hopi Tribe", lessee: "NTEC Operations LLC", county: "Navajo", state: "AZ", legal: "T28N R17E Sec 3", acres: 45, ref: "BK 201 PG 77", eff: "2020-07-01", exp: "2025-06-30", rental: 8000, royalty: 0, notes: "Access agreement in holdover. Renewal negotiation needed." },
  { id: "REC-1010", name: "Powder River Federal Coal Tract", type: "Coal Lease", lessor: "Bureau of Land Management", lessee: "NTEC Operations LLC", county: "Campbell", state: "WY", legal: "T48N R71W Sec 14, 15, 22, 23", acres: 5120, ref: "WYW-190022", eff: "", exp: "", rental: 51200, royalty: 12.5, notes: "Competitive lease sale tract under evaluation. LBA process." },
  { id: "REC-1011", name: "San Juan Royalty Distribution Agreement", type: "Royalty Agreement", lessor: "Navajo Nation Minerals Dept.", lessee: "NTEC Operations LLC", county: "San Juan", state: "NM", legal: "Multiple - see schedule A", acres: 0, ref: "ROY-2013-07", eff: "2013-12-30", exp: "2032-12-31", rental: 0, royalty: 12.5, notes: "Governs royalty allocation across coal tracts. Quarterly reconciliation." },
];

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48); }

function primaryFor(r) {
  switch (r.type) {
    case "Coal Lease": return { buf: leaseDoc(r, "Coal Mining Lease Agreement"), kind: "Lease Agreement" };
    case "Oil & Gas Lease": return { buf: leaseDoc(r, "Oil & Gas Lease Agreement"), kind: "Lease Agreement" };
    case "Mineral Lease": return { buf: leaseDoc(r, "Mineral Lease Agreement"), kind: "Lease Agreement" };
    case "Surface Lease": return { buf: leaseDoc(r, "Surface Lease Agreement"), kind: "Lease Agreement" };
    case "Right-of-Way (ROW)": return { buf: rowDoc(r), kind: "ROW Grant" };
    case "Easement": return { buf: easementDoc(r), kind: "Easement" };
    case "Grazing Permit": return { buf: grazingDoc(r), kind: "Permit" };
    case "Royalty Agreement": return { buf: royaltyDoc(r), kind: "Agreement" };
    default: return { buf: accessDoc(r), kind: "Agreement" };
  }
}

// which records get a second supporting doc
const SECONDARY = {
  "REC-1001": ["Right-of-Way Renewal Memo", "BIA renewal packet is in progress for the rail access ROW. The current term expires September 15, 2026; a renewal application and updated plat have been submitted for agency review."],
  "REC-1004": ["Advance Rental Notice", "Annual advance rental to BLM for federal coal lease MTM-94378 is coming due. Confirm wire instructions and diligent development status prior to payment."],
  "REC-1002": ["Option Exercise Notice", "The option to lease the Bisti solar parcel is time-sensitive. This memo escalates the pending option deadline to the Land Manager for decision on exercise."],
  "REC-1008": ["Reclamation Milestone Report", "Phase 2 revegetation milestone status for the Area III reclamation bond parcel. Coordinate field verification with the Environmental group and update the bond release schedule."],
};

/* ---------------- generate ---------------- */
const docsDir = path.join(ROOT, "documents");
fs.mkdirSync(docsDir, { recursive: true });
// clear old generated pdfs
fs.readdirSync(docsDir).filter(f => f.endsWith(".pdf")).forEach(f => fs.unlinkSync(path.join(docsDir, f)));

const BLOB = {};
let total = 0;
for (const r of R) {
  const list = [];
  const prim = primaryFor(r);
  const fname = `${r.id}-${slug(r.name)}.pdf`;
  fs.writeFileSync(path.join(docsDir, fname), prim.buf);
  list.push({ name: fname, kind: prim.kind, data: "data:application/pdf;base64," + prim.buf.toString("base64") });
  total++;
  if (SECONDARY[r.id]) {
    const [subj, body] = SECONDARY[r.id];
    const buf = memoDoc(r, subj, body);
    const mname = `${r.id}-${slug(subj)}.pdf`;
    fs.writeFileSync(path.join(docsDir, mname), buf);
    list.push({ name: mname, kind: "Memo", data: "data:application/pdf;base64," + buf.toString("base64") });
    total++;
  }
  BLOB[r.id] = list;
}

// inject into index.html
const idxPath = path.join(ROOT, "index.html");
let html = fs.readFileSync(idxPath, "utf8");
const json = JSON.stringify(BLOB);
const injected = `<script id="docblob">window.DOC_BLOB=${json};</script>`;
if (/<script id="docblob">[\s\S]*?<\/script>/.test(html)) {
  html = html.replace(/<script id="docblob">[\s\S]*?<\/script>/, injected);
} else {
  html = html.replace(/<script>\n\/\* =+/, injected + "\n<script>\n/* " + "=".repeat(60));
}
fs.writeFileSync(idxPath, html);

const totalKB = (Buffer.byteLength(json, "utf8") / 1024).toFixed(0);
console.log(`Generated ${total} PDFs across ${R.length} records.`);
console.log(`DOC_BLOB injected into index.html (~${totalKB} KB base64).`);
console.log(`PDF files written to /documents.`);
