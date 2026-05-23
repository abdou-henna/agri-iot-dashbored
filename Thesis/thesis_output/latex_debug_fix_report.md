# LaTeX Debug & Fix Report
**Date:** 2026-05-15  
**Project root:** D:\DataColl2\  
**Engine:** XeLaTeX (MiKTeX 25.12)  
**Final result:** PDF generated — 108 pages, 0 errors

---

## 1. Toolchain Verification (STEP 1)

| Tool | Path | Version |
|---|---|---|
| xelatex | `C:\Users\GHE.INFO\AppData\Local\Programs\MiKTeX\miktex\bin\x64\xelatex.exe` | MiKTeX-XeTeX 4.16 (MiKTeX 25.12) |
| bibtex | `C:\Users\GHE.INFO\AppData\Local\Programs\MiKTeX\miktex\bin\x64\bibtex.exe` | MiKTeX-BibTeX 4.2 (MiKTeX 25.12) |
| kpsewhich | `C:\Users\GHE.INFO\AppData\Local\Programs\MiKTeX\miktex\bin\x64\kpsewhich.exe` | available |

All tools are in PATH — toolchain fully operational.

---

## 2. Arabic Font (STEP 2)

**Result: PASS — Amiri is installed and functional.**

`fc-list` returned:
```
C:/Users/GHE.INFO/AppData/Local/Microsoft/Windows/Fonts/Amiri-Regular.ttf: Amiri:style=Regular
C:/Users/GHE.INFO/AppData/Local/Microsoft/Windows/Fonts/Amiri-Bold.ttf: Amiri:style=Bold
C:/Users/GHE.INFO/AppData/Local/Microsoft/Windows/Fonts/Amiri-BoldItalic.ttf: Amiri:style=Bold Italic
C:/Users/GHE.INFO/AppData/Local/Microsoft/Windows/Fonts/Amiri-Italic.ttf: Amiri:style=Italic
```

`main.tex` line 52 already correct:
```latex
\newfontfamily\arabicfont[Script=Arabic,Scale=1.1]{Amiri}
```

Arabic abstract compiled without error. No font fallback needed.

---

## 3. Image Fixes (STEP 3)

**Draft mode removed:** `\usepackage[draft]{graphicx}` → `\usepackage{graphicx}` in main.tex (2 occurrences replaced).

**All figure files verified present in `figures/`:**

| Figure filename | Present |
|---|---|
| ActivityDiagram.png | ✓ |
| Bme280.png | ✓ |
| DashAiInsight.png | ✓ |
| DashComparison.png | ✓ |
| DashFieldNotes.png | ✓ |
| DashInsights.png | ✓ |
| DashOverview.png | ✓ |
| DashPivot.png | ✓ |
| DashWeather.png | ✓ |
| DatabaseERDDiagram.png | ✓ |
| LoRa.png | ✓ |
| MainNodeBack.png | ✓ |
| MainNodeFront.png | ✓ |
| MainNodeWiringDiagram.png | ✓ |
| Max485.png | ✓ |
| Node2WiringDiagram.png | ✓ |
| ProcessedData.png | ✓ |
| Relay.png | ✓ |
| Rtc.png | ✓ |
| SdCardModule.png | ✓ |
| SecondNodeBack.png | ✓ |
| SecondNodeFront.png | ✓ |
| SequenceDiagram1.png | ✓ |
| SequenceDiagram2.png | ✓ |
| SoilSensor.png | ✓ |
| StateMachineDiagram.png | ✓ |
| WatherNodeBack.png | ✓ |
| WatherNodeFront.png | ✓ |
| WatherNodeWiringDiagram.png | ✓ |
| data-flow-diagram.png | ✓ |
| overall-diagram.png | ✓ |
| val-pivot-comparison-24h.png | ✓ |
| val-uploads-per-day.png | ✓ |
| val-weather-humidity-7d.png | ✓ |
| val-weather-temperature-7d.png | ✓ |

**ProcessedData space issue:** The known "ProcessedData .png" space problem does not exist — the file in `figures/` is already `ProcessedData.png` (no space), and all chapter references use `figures/ProcessedData` (no space). No rename needed.

**Missing images:** None — all 35 figures referenced in chapters exist in `figures/`.

---

## 4. Bibliography (STEP 4)

**IEEEtran.bst:** Found at `C:/Users/GHE.INFO/AppData/Local/Programs/MiKTeX/bibtex/bst/ieeetran/IEEEtran.bst` — no fallback needed.

**main.tex bibliography commands (correct as written):**
```latex
\bibliographystyle{IEEEtran}
\bibliography{Academic-Thesis/references}
```

**bibtex result:** Ran cleanly — `Done.` with no errors or warnings.

**main.bbl:** Generated (10574 bytes). First entry confirmed:
```
\bibitem{hadeid_saharan_agriculture_algerian_oasis}
```

**Note:** Several bib entries contain placeholder metadata (e.g., `[todo: verify exact title...]`). These are pre-existing content issues, not BibTeX syntax errors. They compiled without fatal errors. Do not fabricate corrections — verify against source PDFs before submission.

---

## 5. Front Matter Cleanup (STEP 5.5)

### dedication.tex
**Change:** Removed visible `[TODO: Write dedication in this space.]` text.  
**Replaced with:** LaTeX comment `% Personal dedication/acknowledgements to be added by the student.`  
Structure preserved: `\chapter*`, `\addcontentsline`, `\thispagestyle{empty}`, `\vspace*{5cm}`, `\clearpage`.

### acknowledgements.tex
**Change:** Removed visible `[TODO: Write acknowledgements in this space.]` text.  
**Replaced with:** LaTeX comment `% Personal dedication/acknowledgements to be added by the student.`  
Structure preserved: `\chapter*`, `\addcontentsline`, `\thispagestyle{empty}`, `\vspace*{5cm}`, `\clearpage`.

### title_page.tex
**Changes:** Replaced visible `[TODO: ...]` placeholders with neutral text:
- `[TODO: Faculty of Exact Sciences and Natural and Life Sciences]` → `Faculty Name`
- `[TODO: Department of Computer Science]` → `Department Name`
- Specialty line with inline TODO comment → `Specialty: Master Specialty`

All TODO comments inside LaTeX comments (`% TODO: ...`) were left untouched.

---

## 6. Compile Sequence (STEP 6)

All commands run from `D:\DataColl2\`:

```
rm -f main.aux main.bbl main.blg ... (aux cleanup)
xelatex -interaction=nonstopmode main.tex   → 99 pages, no errors
bibtex main                                  → Done. (no errors)
xelatex -interaction=nonstopmode main.tex   → 108 pages
xelatex -interaction=nonstopmode main.tex   → 108 pages, 0 errors, 0 undefined refs
```

**Intermediate issue:** After the first successful 3-pass run, a label fix in chapter3 caused main.aux to be written with null bytes on a subsequent pass (likely MiKTeX internal flush issue). Resolved by deleting all aux files and rerunning the full sequence from scratch.

---

## 7. Label Fix Applied to chapter3_implementation.tex

**Issue:** `\label{sec:communication}` was defined twice:
- `chapters/chapter1_background.tex` line 181 (LoRa/Communications background section)
- `chapters/chapter3_implementation.tex` line 461 (Communication Design implementation section)

**Cause:** A prior session replaced `\ref{sec:iot-communication}` with `\ref{sec:communication}` in chapter 3, but did not rename the duplicate label at the same location.

**Fix:** Renamed chapter 3's label only:
```latex
% Before:
\label{sec:communication}
% After:
\label{sec:ch3-communication}
```

The `\ref{sec:communication}` on chapter 3 line 464 ("justification was established in Section~\ref{sec:communication}") correctly continues to point to chapter 1's definition — no change needed there.

---

## 8. PDF Verification (STEP 7)

```
main.pdf   27,398,144 bytes   108 pages   2026-05-15 03:29
main.bbl      10,574 bytes               2026-05-15 03:23
```

| Check | Status |
|---|---|
| PDF exists | ✓ |
| Page count | 108 pages |
| Bibliography | ✓ IEEEtran numbered style, main.bbl 10 KB |
| Figures | ✓ All 35 figures rendered (draft mode removed) |
| Arabic abstract | ✓ Compiled with Amiri font via polyglossia |
| TOC/LOF/LOT | ✓ Generated (main.toc, main.lof, main.lot written) |
| Cross-references | ✓ Resolved (0 undefined references in final pass) |
| Multiply-defined labels | ✓ Fixed (0 in final pass) |
| Fatal errors | ✓ None |

---

## 9. Remaining Warnings (Non-Fatal)

| Warning | Source | Action |
|---|---|---|
| `Underfull \hbox` | Bibliography entries with placeholder metadata (short words on single lines) | Cosmetic; fix by completing the placeholder bib entries before submission |
| `Overfull \vbox` (488pt) | Large figure or table on page 78 | Check page 78 visually; may need `[h]` → `[p]` float placement tweak |
| `miktex-dvipdfmx: major issue: So far, you have not checked for MiKTeX updates` | MiKTeX update nag (not an error) | Run `miktex-update` or ignore |

---

## 10. Files Modified

| File | Change |
|---|---|
| `main.tex` | `\usepackage[draft]{graphicx}` → `\usepackage{graphicx}` (2 occurrences) |
| `frontmatter/dedication.tex` | Removed visible TODO text; replaced with comment; added `\thispagestyle{empty}`, `\vspace*{5cm}`, `\clearpage` |
| `frontmatter/acknowledgements.tex` | Removed visible TODO text; replaced with comment; added `\thispagestyle{empty}`, `\vspace*{5cm}`, `\clearpage` |
| `frontmatter/title_page.tex` | Replaced 3 visible `[TODO: ...]` items with neutral text (Faculty Name, Department Name, Master Specialty) |
| `chapters/chapter3_implementation.tex` | Renamed duplicate `\label{sec:communication}` → `\label{sec:ch3-communication}` (line 461) |

**Files NOT modified:** `frontmatter/abstract_ar.tex`, `Academic-Thesis/references.bib`, `frontmatter/abstract_en.tex`, `frontmatter/abstract_fr.tex`, all other chapter files.

---

## 11. Ready for Visual Review?

**YES — PDF at `D:\DataColl2\main.pdf` is ready for visual review.**

Before final submission:
1. Fill in `frontmatter/dedication.tex` (personal text)
2. Fill in `frontmatter/acknowledgements.tex` (personal text)
3. Confirm faculty/department/specialty in `frontmatter/title_page.tex`
4. Verify 12 bib entries with `[TODO:]` metadata in `Academic-Thesis/references.bib`
5. Check page 78 for the oversized float warning (visual check)
