# LaTeX Compile Report
**Date:** 2026-05-15
**Project root:** D:\DataColl2\
**Main file:** main.tex
**Target engine:** XeLaTeX

---

## 1. Compile Attempt Result

**Status: NOT EXECUTED — TeX distribution not found in system PATH**

`xelatex` was not found as a recognized command in either PowerShell or the system PATH.
No MiKTeX or TeX Live installation was detected in common locations:
- `C:\Program Files\MiKTeX*` — not found
- `C:\texlive\` — not found
- `C:\Users\GHE.INFO\AppData\Local\Programs\` — not found

**Action required:** Install MiKTeX (recommended for Windows) or TeX Live before compiling.
- MiKTeX: https://miktex.org/download
- TeX Live: https://www.tug.org/texlive/

---

## 2. Compile Command (to use once TeX is installed)

Run from `D:\DataColl2\` in a terminal:

```
xelatex -interaction=nonstopmode main.tex
bibtex main
xelatex -interaction=nonstopmode main.tex
xelatex -interaction=nonstopmode main.tex
```

The three-pass XeLaTeX sequence is required for:
- Pass 1: initial compile (generates .aux, .toc, .lof, .lot, .out)
- bibtex: resolves citations (.bbl file created)
- Pass 2: cross-references and bibliography resolved
- Pass 3: final cross-reference stabilisation

---

## 3. Static Analysis — Issues Fixed Before Compile Attempt

All issues below were identified through static analysis of the LaTeX source files.
No runtime compiler output was available.

### Errors fixed

| Issue | File | Fix applied |
|---|---|---|
| `\ref{chap:related}` — label not defined (Chapter 2 uses `chap:related-works`) | chapter3_implementation.tex | Replaced with `\ref{chap:related-works}` (all 5 occurrences, replace_all) |
| `\ref{sec:iot-communication}` — label not defined (Chapter 1 §1.5 uses `sec:communication`) | chapter3_implementation.tex | Replaced with `\ref{sec:communication}` |
| `\ref{sec:ch2-gap-analysis}` — label not defined (was fixed in Part B session) | chapter3_implementation.tex | Already corrected to `\ref{sec:proposed-improvements}` |
| `\textLR{\texttt{measured\_at}}` — `\textLR` undefined (not a polyglossia command) | frontmatter/abstract_ar.tex | Replaced with bare `measured\_at` (Arabic bidi handles LTR Latin inline) |
| `\usepackage[nottoc]{tocbibind}` — caused duplicate TOC entries alongside manual `\addcontentsline` | main.tex | Removed; all TOC entries use manual `\addcontentsline` |

### Warnings expected (non-fatal)

| Warning type | Source | Action |
|---|---|---|
| `Overfull \hbox` or `Underfull \hbox` | Wide p{} table columns in tab:analytics-pipeline, tab:system-limitations | Adjust column widths if needed after visual review |
| `Package microtype Warning: MT-command \textls undefined` | microtype with XeLaTeX (partial support) | Expected; no action needed |
| Citation undefined | Unverified bib entries (12 references with placeholder metadata) | Verify references before final submission |
| `LaTeX Warning: Reference ... undefined` | Would appear if any \ref{} targets are unresolved | All known mismatches fixed; re-run to confirm |
| `Font Amiri not found` | abstract_ar.tex requires Amiri font | Install Amiri font; see §5 below |

---

## 4. Known Compile Blockers (in execution order)

### Blocker 1: TeX distribution not installed
- **Severity:** Fatal — compilation impossible without TeX
- **Fix:** Install MiKTeX (https://miktex.org/download) or TeX Live
- **Note:** MiKTeX can install missing packages on-demand; recommended for Windows

### Blocker 2: Arabic font Amiri not available
- **Severity:** Fatal for abstract_ar.tex compile
- **Fix:** Install Amiri font from https://github.com/alif-type/amiri/releases
- **Alternative:** Change `\newfontfamily\arabicfont[...]{Amiri}` in main.tex to an available Arabic font (e.g., "Arial", "Traditional Arabic", "Tahoma")
- **Location:** main.tex, line ~43

### Blocker 3: Missing figure files (all 29)
- **Severity:** Fatal without draft mode; non-fatal in draft mode
- **Fix:** `[draft]` is currently set in `\usepackage[draft]{graphicx}` in main.tex — keeps compilation functional with placeholder boxes
- **Final fix:** Copy all 29 figure files to `figures/` directory, then remove `[draft]`
- **Full list:** See `thesis_output/final_integration_quality_audit.md` §9

### Blocker 4: Sequence Diagram 2 file unconfirmed
- **Severity:** Non-fatal in draft mode; fatal when draft removed if file doesn't exist
- **Fix:** Confirm whether `Academic-Thesis/Diagrams/Sequence Diagrams 2.png` exists. If not, remove the `fig:sequence-diagram-2` figure environment from chapter3_implementation.tex §3.6
- **Location:** chapter3_implementation.tex, approximately line 489

---

## 5. Arabic Abstract Compile Requirements

The Arabic abstract (`frontmatter/abstract_ar.tex`) requires:
1. **XeLaTeX engine** — pdfLaTeX cannot render the `\begin{Arabic}...\end{Arabic}` environment
2. **polyglossia package** — loaded automatically in the XeLaTeX path of main.tex
3. **Amiri font** — or any Arabic-capable OpenType font installed on the system

**Installation steps for Amiri:**
1. Download Amiri-1.000.zip from: https://github.com/alif-type/amiri/releases
2. Extract and install the .ttf/.otf files to Windows Fonts (`C:\Windows\Fonts\`)
3. Verify: `\newfontfamily\arabicfont[Script=Arabic,Scale=1.1]{Amiri}` in main.tex resolves

**Alternative fonts to try if Amiri unavailable:**
- `Scheherazade New` (SIL International, common in academic environments)
- `Noto Naskh Arabic` (Google Noto fonts)
- `Traditional Arabic` (pre-installed in Windows)

To use a different font, change line in main.tex:
```latex
\newfontfamily\arabicfont[Script=Arabic,Scale=1.1]{Amiri}
```
to:
```latex
\newfontfamily\arabicfont[Script=Arabic,Scale=1.1]{Traditional Arabic}
```

---

## 6. Expected Output (on successful compile)

| Item | Expected |
|---|---|
| PDF pages | ~120–160 pages (estimated; depends on figure placement and table expansion) |
| TOC | 3 chapters + General Introduction + General Conclusion + References |
| LOF | ~34 figures across Ch3; 3 figures in Ch1; none in Ch2 |
| LOT | ~13 tables in Ch3; 3 tables in Ch2 |
| Bibliography | IEEEtran numbered style; [1]–[N] citation format |
| Front matter | Roman-numbered pages (i–xiv approx.) |
| Main matter | Arabic-numbered pages starting at 1 |

---

## 7. Files Requiring Action Before Final Compile

```
1. Install TeX distribution (MiKTeX recommended)
2. Install Amiri Arabic font
3. Copy 29 figure files to figures/ (see audit §9 for full list)
4. Rename: Academic-Thesis/DashBoredImages/ProcessedData .png → ProcessedData.png
5. Remove [draft] from \usepackage[draft]{graphicx} in main.tex
6. Write dedication (frontmatter/dedication.tex)
7. Write acknowledgements (frontmatter/acknowledgements.tex)
8. Fill in title_page.tex TODO placeholders (faculty, department, specialty)
9. Verify 12 unverified references in Academic-Thesis/references.bib
10. Confirm Sequence Diagram 1 and 2 files, or remove fig:sequence-diagram-2
```

---

## 8. Recommended Compile Test Sequence

### Test 1: Structure compile (draft mode — figures not required)
```
xelatex -interaction=nonstopmode main.tex
```
Expected: Compiles successfully with placeholder image boxes. Warnings only. No errors.

### Test 2: Full compile with bibliography
```
xelatex -interaction=nonstopmode main.tex
bibtex main
xelatex -interaction=nonstopmode main.tex
xelatex -interaction=nonstopmode main.tex
```
Expected: All citations resolved. TOC, LOF, LOT correct. Cross-references stable.

### Test 3: Final compile without draft (requires all 29 figures)
1. Copy all figures to `figures/`
2. Remove `[draft]` from `\usepackage[draft]{graphicx}` in main.tex
3. Run 4-pass compile sequence as above
4. Check PDF visually for figure placement and table overflow

---

## 9. Package Availability Check

These packages must be installed in the TeX distribution. All are standard and available in MiKTeX/TeX Live:

| Package | Bundle | Notes |
|---|---|---|
| geometry | geometry | Standard |
| setspace | setspace | Standard |
| iftex | iftex (oberdiek) | Standard |
| fontspec | fontspec | XeLaTeX only; standard |
| polyglossia | polyglossia | XeLaTeX only; standard |
| graphicx | graphics | Standard |
| grffile | oberdiek | May need manual install in minimal TeX setups |
| booktabs | booktabs | Standard |
| tabularx | tools | Standard |
| longtable | tools | Standard |
| multirow | multirow | Standard |
| makecell | makecell | Standard |
| ragged2e | ms | Standard |
| pdflscape | pdflscape | Standard |
| adjustbox | adjustbox | Standard |
| caption | caption | Standard |
| subcaption | caption | Standard |
| xcolor | xcolor | Standard |
| enumitem | enumitem | Standard |
| amsmath | amsmath | Standard |
| microtype | microtype | Standard |
| hyperref | hyperref | Standard |
| IEEEtran.bst | IEEEtran | Bibliography style; may need separate install |

If MiKTeX is used, missing packages are installed automatically on-the-fly during compilation.
