# Flowtech AI App -- Session Handover Document
**Date:** 2026-06-10
**App URL:** https://n6dmzsxtbuuaa.kimi.page
**Project Dir:** `/mnt/agents/output/app/`

---

## 1. PROJECT OVERVIEW

Full-stack React application for Flowtech Measuring Instruments Pvt. Ltd. containing:
- **Flow Sizing Calculator** (Liquids, Gas, Steam) with factory Qmin/Qmax data
- **Level Device Selector** (8 types)
- **Pressure Transmitter Selector** (3 types)
- **Anomaly Detector** (velocity-based warnings, not blocking)
- **Master Library** (130+ model datasheets across 11 families + model explainer guides)
- **SO Datasheet Generator** (NEW -- section-based architecture)
- **Document Packages** (QAP + GAD generation)

---

## 2. SO DATASHEET GENERATOR -- CURRENT STATE (Fully Rebuilt)

### 2.1 Architecture (Section-Based)

The generator now uses a **3-layer pipeline**:

```
PDF Text Extraction  -->  Smart Parser  -->  Dynamic Template
    (pdfjs-dist)          (sections)        (HTML/CSS)
```

**Key Principle:** Every value in the output datasheet comes FROM the uploaded quotation text -- no hardcoded defaults.

### 2.2 Source Files

| File | Purpose | Lines |
|---|---|---|
| `src/datasheet/pdfExtractor.ts` | PDF text extraction via pdfjs-dist | 45 |
| `src/datasheet/smartParser.ts` | Section detection + key-value extraction | 275 |
| `src/datasheet/dataMapper.ts` | Data model + demo data (S35750) | 260 |
| `src/datasheet/datasheetTemplate.ts` | Dynamic HTML template (landscape A4) | 230 |
| `src/datasheet/api.ts` | Unified API (parse, generate, print, download) | 45 |
| `src/datasheet/productSpecs.ts` | Product type detection + legacy defaults | 160 |
| `src/components/DatasheetGeneratorPanel.tsx` | UI (upload, edit sections, preview) | 250 |

### 2.3 How the Smart Parser Works

1. **Split by instruments:** Uses "Page N" markers or tag number patterns to chunk the text per instrument
2. **Detect sections:** Pattern-matches headers like `GENERAL INFORMATION`, `PROCESS DATA`, `MATERIAL SPECIFICATIONS`, `ELECTRICAL SPECIFICATIONS`, `DESIGN DATA`, `DOCUMENTS`
3. **Extract key-value pairs:** Three strategies:
   - Pipe-delimited tables: `| Type | Electromagnetic Flowmeter | Make | Flowtech |`
   - Key: Value patterns
   - Two-column layout detection
4. **Output:** Each instrument gets `sections: [{title, rows: [[label, value], ...]}]`

### 2.4 Dynamic Template

- **Landscape A4** (297mm x 210mm) for wider GA Drawing area
- Each instrument page renders its **own sections** dynamically:
  - EMF: GENERAL -> PROCESS -> MATERIAL -> ELECTRICAL -> DOCUMENTS
  - Rotameter: GENERAL -> PROCESS -> MATERIAL -> DESIGN DATA -> DOCUMENTS
- **GA Drawing placeholder** with product-specific instruction note
- Pages: Cover + Index + Per-Instrument + Standards & Notes

### 2.5 Demo Data

Based on S35750 (mixed-product SO with 19 line items):
- **EMF-1101** (2 Nos, 200NB, Clear Waste Water, FlowMag S630)
- **EMF-1501** (1 No, 150NB, Clear Waste Water, FlowMag S630)
- **FI-2404A** (1 No, 80NB, Air, FMIPL-BPGTRM) -- Rotameter
- **FI-2404B** (1 No, 65NB, Air, FMIPL-BPGTRM) -- Rotameter

### 2.6 Product Type Detection (for parser)

Uses keyword matching on each instrument's context:
- `EMF-*` tag -> Electromagnetic Flowmeter
- `FI-*` + "rotameter" -> By-Pass Glass Tube Rotameter
- `FT-*` + "turbine" -> Turbine Flowmeter
- `VG-*` -> Vortex Flowmeter
- Plus keyword fallback for non-standard tags

---

## 3. MASTER LIBRARY (130+ Models Across 11 Families)

### Families:
1. Electromagnetic Flowmeter (30 models)
2. Turbine Flowmeter (6 models)
3. Vortex Flowmeter (12 models)
4. Ultrasonic Flowmeter (2 models)
5. Oval Gear Flowmeter (3 models)
6. By-Pass Glass Tube Rotameter (12 models)
7. By-Pass Metal Tube Rotameter (12 models)
8. Displacer Level Switch (10 models)
9. Level Transmitter (5 models)
10. Glass Tube Rotameter (12 models)
11. Metal Tube Rotameter (12 models)

### Model Explainer Guides
Each family has a naming convention explainer (e.g., `FMIPL-EFM-TS1-F-C-F1-CH1-EL2...` decoded field-by-field).

---

## 4. ANOMALY DETECTOR

- Velocity anomalies are **WARNING** severity (not CRITICAL) -- output is NOT blocked
- Meter sizing is based on **flow rate**, not pipe size
- Informational banner: "Meter sizing is flow-rate-based, not pipe-size-based"

---

## 5. VORTEX FLOWMETER VALUES

Verified against Flowtech Vortex Manual (pages 6-9):
- All 14 liquid Qmax values updated from manual
- All 14 gas Qmax values updated from manual
- Steam table verified accurate (no changes)

---

## 6. KEY TECHNICAL DECISIONS

| Decision | Rationale |
|---|---|
| PDF.js for text extraction | `readAsText()` fails on PDFs (reads binary garbage) |
| Table-based layout (not flex) | CSS flexbox breaks in Paged.js PDF conversion |
| HTML entities for Unicode | `&plusmn;`, `&deg;`, `&sup3;` prevent box rendering |
| No commercial content | User requirement: "only for technical review" |
| Landscape A4 | More horizontal space for GA Drawing + two-column layout |
| Per-line-item product detection | Mixed-product SOs (EMF + Rotameter in same order) |
| Section-based data model | Each instrument carries its own parsed sections |
| Dynamic template rendering | Whatever sections exist in the SO are rendered |

---

## 7. PENDING / KNOWN ISSUES

1. **PDF parsing for complex layouts:** Some quotation PDFs have complex table layouts that may not parse perfectly. The parser works best when the PDF text extraction produces clean pipe-delimited output.
2. **Image-based (scanned) PDFs:** PDF.js cannot extract text from scanned/image-based PDFs. User must copy-paste text in these cases.
3. **Bundle size:** PDF.js worker adds ~1.2MB. May need code splitting for production.
4. **SrNo display bug:** Instrument pages show "ITEM 12 OF 4" instead of "ITEM 3 OF 4" -- the srNo comes from the original SO (12) but total is the parsed count (4). May want to renumber sequentially.

---

## 8. FILE STRUCTURE

```
/mnt/agents/output/app/
  src/
    components/
      DatasheetGeneratorPanel.tsx   -- SO Datasheet UI
      MasterLibraryPanel.tsx        -- Model datasheets + explainers
      AnomalyDetector.tsx           -- Velocity warnings
      PasswordGate.tsx              -- Auth (Flowtech2026)
    datasheet/
      pdfExtractor.ts               -- PDF text extraction
      smartParser.ts                -- Section-based parser (NEW)
      dataMapper.ts                 -- Data model + demo data
      datasheetTemplate.ts          -- HTML template (landscape A4)
      api.ts                        -- Unified API
      productSpecs.ts               -- Product detection + defaults
    data/
      flowtechLogoBase64.ts         -- Logo for cover page
      fluidsDatabase.ts             -- 220+ liquids
      gasesDatabase.ts              -- 80+ gases
      steamTable.ts                 -- IAPWS-IF97
      flowmeterDatabase.ts          -- Factory Qmin/Qmax
      modelIndex.ts                 -- 130+ model datasheets
      modelExplainerGuides.ts       -- Naming convention docs
    App.tsx                         -- Main app with routing
  dist/                             -- Build output (deployed)
```

---

## 9. BUILD & DEPLOY

```bash
cd /mnt/agents/output/app
npm run build           # TypeScript + Vite build
# Deploy via: mshtools-deploy_website with local_dir=/mnt/agents/output/app/dist
```

---

## 10. SESSION HISTORY SUMMARY

**Session 1:** Flow sizing calculator (liquids, gas, steam), model datasheets (EMF, TFM, VFM)
**Session 2:** Added Ultrasonic, Oval Gear, Rotameter model datasheets
**Session 3:** Displacer Level Switch + Level Transmitter datasheets, Model Explainer Guides
**Session 4:** Anomaly Detector fix (velocity warnings), Vortex Manual verification
**Session 5:** Glass Tube + Metal Tube Rotameter datasheets
**Session 6:** SO Datasheet Generator v1 (basic, product-default based)
**Session 7:** Unicode fix, landscape mode, per-line-item product detection
**Session 8:** PDF text extraction support
**Session 9:** Complete rebuild -- section-based architecture (THIS SESSION)

---

*End of handover document. Next session should continue from the section-based architecture.*
