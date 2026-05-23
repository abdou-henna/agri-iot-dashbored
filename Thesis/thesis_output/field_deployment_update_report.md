# Field Deployment Update Report
**Date:** 2026-05-15  
**Engine:** XeLaTeX (MiKTeX 25.12)  
**Final result:** PDF generated — 111 pages, 0 fatal errors

---

## 1. Files Modified

| File | Change |
|---|---|
| `frontmatter/title_page.tex` | Faculty, Department, Field, Specialty placeholders replaced |
| `Academic-Thesis/references.bib` | 9 entries fixed: visible [TODO:...] text removed from field values |
| `chapters/chapter2_related_works.tex` | 5 table cells: `[TODO]` visible text removed |
| `chapters/chapter3_implementation.tex` | Field deployment: 3 figures + IP65/CAT6 text added; Validation: rain/node_missing observation added; Limitations: environmental row added |
| `frontmatter/general_conclusion.tex` | One sentence added to Limitations section on environmental validation gap |
| `Academic-Thesis/figure-captions.md` | Field deployment figure section added with IP65/CAT6/rain rules |
| `Academic-Thesis/limitations.md` | Section 10 "Environmental Effects on Field Hardware" added; sections 11–12 renumbered |
| `Academic-Thesis/source-map.md` | Field deployment row added to Chapter 3 source map; field figure asset block added |

---

## 2. Title Page Fields Fixed

| Field | Was | Now |
|---|---|---|
| Faculty | `Faculty Name` (generic placeholder) | `Faculty of Exact Sciences` |
| Department | `Department Name` (generic placeholder) | `Department of Computer Science` |
| Specialty line | `Specialty: Master Specialty` | `Field: Computer Science \| Specialty: Internet of Things and Network Security` |
| Degree | `Master's Degree` | unchanged (correct) |
| University | Echahid Hamma Lakhdar University of El Oued | unchanged (correct) |
| Authors | Henna Abderrahmane, Aouissi Nacer Eddine | unchanged (correct) |
| Supervisor | Dr. Khebbache Mohib Eddine | unchanged (correct) |
| Academic Year | 2025–2026 | unchanged (correct) |

---

## 3. Figures Added

| Figure file | Label | Section | Caption summary |
|---|---|---|---|
| `figures/field-main-node-deployment.png` | `fig:field-main-node-deployment` | 3.13 Field Deployment | MAIN gateway at Pivot 1; IP65 enclosure; battery-powered; electrical infrastructure = field context only |
| `figures/field-node2-soil-enclosure.png` | `fig:field-node2-soil-enclosure` | 3.13 Field Deployment | Node2 at Pivot 2; CAT6 RJ45 outdoor cable for RS485 signal and power (not Ethernet) |
| `figures/field-node3-weather-enclosure.png` | `fig:field-node3-weather-enclosure` | 3.13 Field Deployment | Node3 weather enclosure; IP65; outdoor atmospheric monitoring |

**IP65 language used:** "resistance to dust ingress and water contact from all directions" / "does not imply submersion tolerance; the nodes are not waterproof to immersion."  
**CAT6 language used:** "outdoor-rated insulation, resistance to humidity and soil contact, reliable copper conductors, and multi-conductor configuration" / "carries RS485 serial communication from the sensor to the node, not Ethernet data."  
**Power source:** Captions explicitly state "The node operates on battery power. Electrical infrastructure visible in the surrounding area belongs to the existing field site; it does not serve as the node power source."

---

## 4. Where IP65 / CAT6 / Rain Content Was Added

| Content | Location |
|---|---|
| IP65 enclosure rationale | Chapter 3, Section 3.13 Field Deployment (new paragraph before figures) |
| IP65 caption language | Figure captions for all three field deployment figures |
| CAT6 RJ45 rationale | Chapter 3, Section 3.13 (Node2 paragraph); fig:field-node2-soil-enclosure caption |
| Rain/node_missing observation | Chapter 3, Section 3.15 Validation and Testing (new paragraph after upload validation result) |
| Environmental limitation | Chapter 3, Section 3.16 System Limitations (new table row) |
| General conclusion environmental note | `frontmatter/general_conclusion.tex`, Limitations section (one new sentence) |

**Rainy-condition language used:** "coincided with periods when rainy field conditions were observed" / "may have contributed to the communication gaps" / "the relationship...was not experimentally isolated during this deployment; a causal attribution cannot be established" / "Further controlled environmental validation would be required."  
Never used: "rain caused failure."

---

## 5. TODO / Bibliography Cleanup

### 5.1 BibTeX entries fixed (visible TODO text in field values → % comments)

| Entry key | Fields fixed | Method |
|---|---|---|
| `hadeid_saharan_agriculture_algerian_oasis` | title, journal (had TODO text) | Replaced with `{---}`; original TODO text moved to % comment lines |
| `desert_agriculture_food_security_algeria` | author, journal, year (all TODO) | Replaced with `{---}` / `{n.d.}`; originals to % comments |
| `smart_agriculture_desert_wadi_souf` | author, journal, year (all TODO) | Same |
| `rajak2023iot_smart_sensors_agriculture` | author, journal, year (all TODO) | Same |
| `iot_protocols_precision_agriculture_outdoor` | author, journal, year (all TODO) | Same |
| `cheap_practical_iot_agri_monitoring` | author, journal, year (all TODO) | Same |
| `iot_enhancements_algerian_desert_agriculture` | author, journal, year (all TODO) | Same |
| `lloret2021soil_moisture_wsn` | author, title (both TODO) | Replaced with `{---}`; originals to % comments |
| `villa2020iot_arable_farming` | note (had "Verify volume, pages..." visible text) | Removed note field; moved to % comment outside field |

**Metadata not invented:** all unknown authors, journal names, and years replaced with `{---}` or `{n.d.}` — no fabricated names, titles, or DOIs were added.

### 5.2 Chapter 2 table cells fixed (visible [TODO] in LaTeX source)

| Location | Was | Now |
|---|---|---|
| ch2 table, Rajak row | `Rajak et al.~\cite{...} [TODO] &` | `Rajak et al.~\cite{...} &` |
| ch2 table, Villa-Henriksen row | `Villa-Henriksen et al.~\cite{...} [TODO] &` | `Villa-Henriksen et al.~\cite{...} &` |
| ch2 table, Abbaari row | `Abbaari et al.~\cite{...} [TODO] &` | `Abbaari et al.~\cite{...} &` |
| ch2 table, Cheap practical IoT row | `Cheap practical IoT~\cite{...} [TODO] &` | `Cheap practical IoT~\cite{...} &` |
| ch2 table, Lloret row | `Lloret et al.~\cite{...} [TODO] &` | `Lloret et al.~\cite{...} &` |

---

## 6. Compile Result

| Pass | Result |
|---|---|
| xelatex pass 1 | 106 pages, 0 fatal errors, undefined refs as expected |
| bibtex | Done. (9 "empty field" warnings for placeholder entries — non-fatal) |
| xelatex pass 2 | 111 pages, 0 fatal errors |
| xelatex pass 3 | 111 pages, 0 fatal errors, cross-references stable |

PDF: `D:\DataColl2\main.pdf` — 34,006,175 bytes, 111 pages, 2026-05-15

---

## 7. Remaining Warnings (Non-Fatal)

| Warning | Source | Action required |
|---|---|---|
| `Overfull \vbox (744.95pt too high)` | Three field deployment figures in one section with `[H]` float placement | Visual check; consider splitting figures across pages or using `[htbp]` |
| `Underfull \hbox (badness 10000)` ×4 | Environmental limitations table row — long cell text in narrow column | Cosmetic; acceptable in thesis |
| `Underfull \hbox` (bibliography) | Placeholder `---` entries in bib (short entries produce bad line-breaking) | Will resolve when metadata is verified before submission |
| `bibtex: empty field warnings` ×9 | 9 bib entries where author/journal/year are placeholder `{---}` or `{n.d.}` | Verify metadata from professor-provided PDFs before submission |
| MiKTeX update nag | MiKTeX update check not run | Run `miktex-update` or ignore |

---

## 8. Still Required Before Submission

1. **Verify 9 bib entries** against professor-provided PDF sources. Specifically:
   - `hadeid_saharan_agriculture_algerian_oasis` — verify title and journal (Springer 2021)
   - `desert_agriculture_food_security_algeria` — verify all metadata
   - `smart_agriculture_desert_wadi_souf` — verify all metadata
   - `rajak2023iot_smart_sensors_agriculture` — verify authors, journal, year
   - `iot_protocols_precision_agriculture_outdoor` — verify authors, journal, year
   - `cheap_practical_iot_agri_monitoring` — verify authors, journal, year
   - `iot_enhancements_algerian_desert_agriculture` — verify authors, journal, year
   - `lloret2021soil_moisture_wsn` — verify authors and title (sensors-21-07243-v2.pdf)
   - `villa2020iot_arable_farming` — verify volume, pages, DOI
2. **Title page**: confirm exact faculty and department wording with faculty secretariat
3. **Dedication / Acknowledgements**: personal text to be added
4. **Visual check page ~81**: `Overfull \vbox` may push field figures onto a crowded page — adjust float placement if needed
5. **Pivot 1 register map**: confirm Modbus registers for MAIN node local soil path
