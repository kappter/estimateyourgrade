// ─────────────────────────────────────────────────────────────────────────────
// Utah GPA Planner — Quarter Credit Model
// Conforms to Utah Admin Code R277-700-6 (amended through June 2024)
// Each standard course = 0.25 quarter credits
// ─────────────────────────────────────────────────────────────────────────────

// ── Grade definitions ─────────────────────────────────────────────────────────
const GRADE_LIST = ["A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F","P","P+","CR","Clear"];
// CR = Credit Recovery / Alternative Credit (earns credit, counts in GPA like a normal grade)
// When a student earns CR after an F, BOTH the F and the CR entry appear and count.

const GPA_MAP = {
  "A":4.0,"A-":3.7,"B+":3.3,"B":3.0,"B-":2.7,
  "C+":2.3,"C":2.0,"C-":1.7,"D+":1.3,"D":1.0,"D-":0.7,"F":0.0
};

// CR grade defaults to C (2.0) — the typical minimum for credit recovery completion
// Students/counselors can override by entering the actual earned grade instead
const CR_GPA_DEFAULT = 2.0;

const GRADE_COLOR = {
  "A":"gc-a","A-":"gc-am","B+":"gc-bp","B":"gc-b","B-":"gc-bm",
  "C+":"gc-cp","C":"gc-c","C-":"gc-cm","D+":"gc-dp","D":"gc-d","D-":"gc-dm",
  "F":"gc-f","P":"gc-p","P+":"gc-pp","CR":"gc-cr"
};

// ── Subject definitions ───────────────────────────────────────────────────────
// Aligned to R277-700-6 subject categories
const SUBJECTS = [
  { key:"LA",  label:"Language Arts",  abbr:"LA",  note:"4.0 cr — 9th–12th level (R277-700-6 §5)" },
  { key:"MA",  label:"Math",           abbr:"MA",  note:"3.0 cr — SM I, II, III or equivalent (§6)" },
  { key:"SC",  label:"Science",        abbr:"SC",  note:"3.0 cr — 2 foundation + 1 applied (§11)" },
  { key:"SS",  label:"Social Studies", abbr:"SS",  note:"3.0 cr — incl. US Gov 0.5 + US Hist 1.0 (§12)" },
  { key:"Art", label:"Arts",           abbr:"Art", note:"1.5 cr — Visual, Music, Dance, Theatre, Media (§13)" },
  { key:"PE",  label:"Phys Ed",        abbr:"PE",  note:"1.5 cr — Participation, Fitness, Lifetime (§15)" },
  { key:"CTE", label:"CTE",            abbr:"CTE", note:"1.0 cr — Career & Technical Education (§16)" },
  { key:"HE",  label:"Health Ed",      abbr:"HE",  note:"0.5 cr — Health Education (§14)" },
  { key:"FL",  label:"Fin Lit",        abbr:"FL",  note:"0.5 cr — General Financial Literacy (§19)" },
  { key:"DS",  label:"Dig Studies",    abbr:"DS",  note:"0.5 cr — Digital Studies (§17)" },
  { key:"EL",  label:"Electives",      abbr:"EL",  note:"5.5 cr (24-cr) / 8.5 cr (27-cr) — flexible (§20)" },
];

const SUBJECT_KEYS = SUBJECTS.map(s => s.key);

// ── Credit requirements per R277-700-6 ───────────────────────────────────────
const REQ_24 = {
  LA:4.0, MA:3.0, SC:3.0, SS:3.0,
  Art:1.5, PE:1.5, CTE:1.0, HE:0.5, FL:0.5, DS:0.5, EL:5.5
}; // Total: 24.0 ✓

const REQ_27 = {
  LA:4.0, MA:3.0, SC:3.0, SS:3.0,
  Art:1.5, PE:1.5, CTE:1.0, HE:0.5, FL:0.5, DS:0.5, EL:8.5
}; // Total: 27.0 ✓

const CREDIT_PER_COURSE = 0.25;

// Grade levels — "Recovery" is a dedicated row for credit recovery / alt credit
const GRADE_LEVELS = ["9th","10th","11th","12th","Other","Recovery"];

const LEVEL_LABELS = {
  "9th":      "9th Grade",
  "10th":     "10th Grade",
  "11th":     "11th Grade",
  "12th":     "12th Grade",
  "Other":    "Other / Transfer",
  "Recovery": "Credit Recovery / Alt Credit"
};

// ── Slots per subject per grade level ─────────────────────────────────────────
// Standard rows: 4 slots (1.0 cr max per year — typical semester or quarter load)
// EL column:     12 slots per year (electives are the most flexible category;
//                supports 8.0 cr/year distribution which needs up to 10 EL slots)
// Recovery row:  8 slots per subject (students may recover multiple courses)
// EL + Recovery: 16 slots (maximum flexibility for recovered elective credits)
const SLOTS_PER_CELL = (subjKey, level) => {
  const isRecovery = level === "Recovery";
  const isEL = subjKey === "EL";
  if (isRecovery && isEL) return 16;
  if (isRecovery) return 8;
  if (isEL) return 12;
  return 4;
};

// ── Helper: build empty stacked grid ─────────────────────────────────────────
function emptyStackedGrid() {
  const g = {};
  GRADE_LEVELS.forEach(lv => {
    g[lv] = SUBJECT_KEYS.map(sk => {
      const n = SLOTS_PER_CELL(sk, lv);
      return { grades: Array(n).fill("") };
    });
  });
  return g;
}

// ── GPA calculation ───────────────────────────────────────────────────────────
// Rules (standard weighted GPA):
//  • F    → 0.0 quality points, NO earned credit, DOES count in GPA denominator
//  • P/P+ → earns credit, excluded from GPA entirely (pass/fail)
//  • CR   → earns credit, counts as C (2.0) in GPA unless a specific letter is
//            recorded — represents credit recovery / alternative credit completion
//  • All other letter grades → earn credit, count in GPA denominator
//
// When a student fails then recovers:
//  - The F entry stays (0.0 QP, in denominator, no credit)
//  - The CR/recovery grade entry also counts (QP + denominator + credit earned)
//  - This correctly models the GPA impact of both the failure AND the recovery
function calcStats(grid, reqCredits) {
  const earned = {};
  let totalEarned = 0;
  let qualityPoints = 0;
  let gpaDenominator = 0;

  GRADE_LEVELS.forEach(lv => {
    SUBJECT_KEYS.forEach((subj, col) => {
      const cell = grid[lv][col];
      cell.grades.forEach(grade => {
        if (!grade) return;
        const cv = CREDIT_PER_COURSE;

        if (grade === "P" || grade === "P+") {
          earned[subj] = (earned[subj] || 0) + cv;
          totalEarned += cv;
        } else if (grade === "F") {
          qualityPoints += 0.0;
          gpaDenominator += cv;
          // No credit earned for F
        } else if (grade === "CR") {
          // Credit Recovery: earns credit, counts as C (2.0) in GPA
          earned[subj] = (earned[subj] || 0) + cv;
          totalEarned += cv;
          qualityPoints += CR_GPA_DEFAULT * cv;
          gpaDenominator += cv;
        } else {
          // Standard letter grade
          earned[subj] = (earned[subj] || 0) + cv;
          totalEarned += cv;
          qualityPoints += GPA_MAP[grade] * cv;
          gpaDenominator += cv;
        }
      });
    });
  });

  const gpa = gpaDenominator > 0 ? +(qualityPoints / gpaDenominator).toFixed(3) : null;

  let creditsNeeded = 0;
  SUBJECT_KEYS.forEach(subj => {
    const req = reqCredits[subj] || 0;
    const have = earned[subj] || 0;
    if (have < req) creditsNeeded += req - have;
  });
  creditsNeeded = +creditsNeeded.toFixed(2);

  return { earned, totalEarned: +totalEarned.toFixed(2), gpa, creditsNeeded, qualityPoints, gpaDenominator };
}

// ── Per-grade-level stats ─────────────────────────────────────────────────────
function calcLevelStats(grid, level) {
  let credits = 0, qp = 0, denom = 0, fCount = 0, crCount = 0;
  SUBJECT_KEYS.forEach((subj, col) => {
    const cell = grid[level][col];
    cell.grades.forEach(grade => {
      if (!grade) return;
      const cv = CREDIT_PER_COURSE;
      if (grade === "P" || grade === "P+") {
        credits += cv;
      } else if (grade === "F") {
        qp += 0; denom += cv; fCount++;
      } else if (grade === "CR") {
        credits += cv; qp += CR_GPA_DEFAULT * cv; denom += cv; crCount++;
      } else {
        credits += cv; qp += GPA_MAP[grade] * cv; denom += cv;
      }
    });
  });
  return {
    credits: +credits.toFixed(2),
    gpa: denom > 0 ? +(qp / denom).toFixed(3) : null,
    fCount, crCount
  };
}

// ── Projection math ───────────────────────────────────────────────────────────
function calcNeededGPA(currentQP, currentDenom, remainingCredits, targetGPA) {
  if (remainingCredits <= 0) return null;
  const neededQP = targetGPA * (currentDenom + remainingCredits) - currentQP;
  return +(neededQP / remainingCredits).toFixed(3);
}

function gpaToLetter(gpa) {
  if (gpa === null || gpa === undefined) return "—";
  if (gpa >= 4.0) return "A";
  if (gpa >= 3.7) return "A-";
  if (gpa >= 3.3) return "B+";
  if (gpa >= 3.0) return "B";
  if (gpa >= 2.7) return "B-";
  if (gpa >= 2.3) return "C+";
  if (gpa >= 2.0) return "C";
  if (gpa >= 1.7) return "C-";
  if (gpa >= 1.3) return "D+";
  if (gpa >= 1.0) return "D";
  if (gpa >= 0.7) return "D-";
  return "F";
}

// ─────────────────────────────────────────────────────────────────────────────
// React App
// ─────────────────────────────────────────────────────────────────────────────
const { useState, useEffect, useMemo, useCallback } = React;
const e = React.createElement;

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [creditPath, setCreditPath] = useState(localStorage.getItem("creditPath") || "24");
  const [grid, setGrid] = useState(emptyStackedGrid);
  const [activeCell, setActiveCell] = useState(null); // {level, col}
  const [tab, setTab] = useState("grid");
  const [studentName, setStudentName] = useState(localStorage.getItem("studentName") || "");
  const [targetGPA, setTargetGPA] = useState(parseFloat(localStorage.getItem("targetGPA")) || 3.0);
  const [showSubjectInfo, setShowSubjectInfo] = useState(null);
  const [showRecovery, setShowRecovery] = useState(true);

  const reqCredits = creditPath === "24" ? REQ_24 : REQ_27;

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem("studentName", studentName); }, [studentName]);
  useEffect(() => { localStorage.setItem("targetGPA", targetGPA); }, [targetGPA]);
  useEffect(() => { localStorage.setItem("creditPath", creditPath); }, [creditPath]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => calcStats(grid, reqCredits), [grid, reqCredits]);

  const levelStats = useMemo(() => {
    const out = {};
    GRADE_LEVELS.forEach(lv => { out[lv] = calcLevelStats(grid, lv); });
    return out;
  }, [grid]);

  const projectionData = useMemo(() => {
    const { qualityPoints: qp, gpaDenominator: denom, creditsNeeded: remaining } = stats;
    const targets = [4.0, 3.7, 3.5, 3.3, 3.0, 2.7, 2.5, 2.0];
    const scenarios = targets.map(t => {
      const needed = calcNeededGPA(qp, denom, remaining, t);
      return {
        target: t,
        needed,
        letter: gpaToLetter(needed),
        feasible: needed !== null && needed <= 4.0 && needed >= 0
      };
    });
    const customNeeded = calcNeededGPA(qp, denom, remaining, targetGPA);
    return { qp, denom, remaining, scenarios, customNeeded };
  }, [stats, targetGPA]);

  // ── Grid mutations ─────────────────────────────────────────────────────────
  const setGrade = useCallback((level, col, slotIndex, grade) => {
    setGrid(prev => {
      const next = { ...prev };
      next[level] = [...prev[level]];
      const cell = { ...prev[level][col] };
      const newGrades = [...cell.grades];
      newGrades[slotIndex] = grade;
      cell.grades = newGrades;
      next[level][col] = cell;
      return next;
    });
  }, []);

  const handleCellClick = useCallback((level, col) => {
    setActiveCell(prev =>
      prev && prev.level === level && prev.col === col ? null : { level, col }
    );
  }, []);

  const handleSelectGrade = useCallback((grade) => {
    if (!activeCell) return;
    const { level, col } = activeCell;
    const cell = grid[level][col];
    const subj = SUBJECT_KEYS[col];
    const nSlots = SLOTS_PER_CELL(subj, level);

    if (grade === "Clear") {
      setGrid(prev => {
        const next = { ...prev };
        next[level] = [...prev[level]];
        next[level][col] = { grades: Array(nSlots).fill("") };
        return next;
      });
    } else {
      const emptyIdx = cell.grades.findIndex(g => !g);
      if (emptyIdx !== -1) {
        setGrade(level, col, emptyIdx, grade);
      } else {
        // All slots full — replace last slot
        setGrade(level, col, cell.grades.length - 1, grade);
      }
    }
    setActiveCell(null);
  }, [activeCell, grid, setGrade]);

  const handleRemoveGrade = useCallback((level, col, slotIndex, ev) => {
    ev.stopPropagation();
    setGrade(level, col, slotIndex, "");
  }, [setGrade]);

  // ── Fill helpers ───────────────────────────────────────────────────────────
  // Standard Utah public school load: 8.0 credits per year (32 quarter-credit slots).
  // Distribution below mirrors a typical 8-period day across 11 subject categories.
  // Each entry = number of 0.25-credit slots assigned to that subject for one year.
  // Subjects: LA, MA, SC, SS, Art, PE, CTE, HE, FL, DS, EL
  // Total per year = 32 slots = 8.0 credits ✓
  const YEAR_DISTRIBUTION = {
    "9th":  [4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 4],  // 32 slots — 9th: LA+MA+SC+SS heavy, intro electives
    "10th": [4, 4, 4, 4, 2, 2, 2, 0, 0, 0, 10], // 32 slots — 10th: core + more electives (HE/FL/DS done)
    "11th": [4, 4, 4, 4, 2, 2, 2, 0, 0, 0, 10], // 32 slots — 11th: same pattern, elective-heavy
    "12th": [4, 4, 4, 4, 2, 2, 2, 0, 0, 0, 10], // 32 slots — 12th: finishing requirements + electives
    "Other":[4, 4, 4, 4, 2, 2, 2, 0, 0, 0, 10], // 32 slots — transfer/other year
  };
  // Note: HE (0.5 cr), FL (0.5 cr), DS (0.5 cr) are typically completed in 9th grade
  // and appear as 2 slots each that year. Remaining years leave those at 0.

  // Fill a single grade level row with a given grade, respecting the 8.0-credit distribution
  const fillLevel = useCallback((level, fillGrade, targetGrid) => {
    const dist = YEAR_DISTRIBUTION[level];
    if (!dist) return targetGrid;
    SUBJECT_KEYS.forEach((subj, col) => {
      const slots = dist[col];
      const maxSlots = SLOTS_PER_CELL(subj, level);
      for (let si = 0; si < Math.min(slots, maxSlots); si++) {
        if (!targetGrid[level][col].grades[si]) {
          targetGrid[level][col].grades[si] = fillGrade;
        }
      }
    });
    return targetGrid;
  }, []);

  // Fill a single grade level row with random grades
  const fillLevelRandom = useCallback((level, targetGrid) => {
    const weightedGrades = [
      "A","A","A-","A-","B+","B","B","B-","B-","C+","C","C","C-","D+","D","D-"
    ];
    const dist = YEAR_DISTRIBUTION[level];
    if (!dist) return targetGrid;
    SUBJECT_KEYS.forEach((subj, col) => {
      const slots = dist[col];
      const maxSlots = SLOTS_PER_CELL(subj, level);
      for (let si = 0; si < Math.min(slots, maxSlots); si++) {
        if (!targetGrid[level][col].grades[si]) {
          targetGrid[level][col].grades[si] = weightedGrades[Math.floor(Math.random() * weightedGrades.length)];
        }
      }
    });
    return targetGrid;
  }, []);

  // Fill all standard years with a given grade (for the global quick-fill buttons)
  const fillAll = useCallback((fillGrade) => {
    setGrid(() => {
      const next = emptyStackedGrid();
      ["9th","10th","11th","12th"].forEach(lv => fillLevel(lv, fillGrade, next));
      return next;
    });
  }, [fillLevel]);

  const fillRandom = useCallback(() => {
    setGrid(() => {
      const next = emptyStackedGrid();
      ["9th","10th","11th","12th"].forEach(lv => fillLevelRandom(lv, next));
      return next;
    });
  }, [fillLevelRandom]);

  // Fill a single year with a specific grade (per-year quick-fill)
  const fillYearGrade = useCallback((level, fillGrade) => {
    setGrid(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      // Clear the target level first, then fill
      SUBJECT_KEYS.forEach((subj, col) => {
        const maxSlots = SLOTS_PER_CELL(subj, level);
        next[level][col].grades = Array(maxSlots).fill("");
      });
      fillLevel(level, fillGrade, next);
      return next;
    });
  }, [fillLevel]);

  // Fill a single year with random grades
  const fillYearRandom = useCallback((level) => {
    setGrid(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      SUBJECT_KEYS.forEach((subj, col) => {
        const maxSlots = SLOTS_PER_CELL(subj, level);
        next[level][col].grades = Array(maxSlots).fill("");
      });
      fillLevelRandom(level, next);
      return next;
    });
  }, [fillLevelRandom]);

  // "Bad year" scenario — simulate a rough year then recovery
  // Fills the year with the 8.0-credit distribution, fails core subjects,
  // then adds CR recovery entries for each failed course.
  const fillBadYear = useCallback((badYear) => {
    setGrid(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const dist = YEAR_DISTRIBUTION[badYear];
      if (!dist) return next;

      // First fill the whole year with B grades (baseline passing year)
      SUBJECT_KEYS.forEach((subj, col) => {
        const slots = dist[col];
        const maxSlots = SLOTS_PER_CELL(subj, badYear);
        next[badYear][col].grades = Array(maxSlots).fill("");
        for (let si = 0; si < Math.min(slots, maxSlots); si++) {
          next[badYear][col].grades[si] = "B";
        }
      });

      // Then fail the core academic subjects (LA, MA, SC — 2 slots each = 0.5 cr each)
      const coreFails = ["LA", "MA", "SC"];
      coreFails.forEach(subj => {
        const col = SUBJECT_KEYS.indexOf(subj);
        if (col < 0) return;
        const slotsToFail = Math.min(2, dist[col]); // fail 2 slots (0.5 cr) per subject
        for (let si = 0; si < slotsToFail; si++) {
          next[badYear][col].grades[si] = "F";
        }
      });

      // Add CR recovery entries in the Recovery row for each failed subject
      coreFails.forEach(subj => {
        const col = SUBJECT_KEYS.indexOf(subj);
        if (col < 0) return;
        const maxRecovery = SLOTS_PER_CELL(subj, "Recovery");
        // Find next empty slots in recovery row
        let placed = 0;
        for (let si = 0; si < maxRecovery && placed < 2; si++) {
          if (!next["Recovery"][col].grades[si]) {
            next["Recovery"][col].grades[si] = "CR";
            placed++;
          }
        }
      });

      return next;
    });
  }, []);

  const clearYear = useCallback((level) => {
    setGrid(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      SUBJECT_KEYS.forEach((subj, col) => {
        const maxSlots = SLOTS_PER_CELL(subj, level);
        next[level][col].grades = Array(maxSlots).fill("");
      });
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setGrid(emptyStackedGrid());
    setActiveCell(null);
  }, []);

  // ── Scenario panel state ───────────────────────────────────────────────────
  const [scenarioYear, setScenarioYear] = useState("9th");

  // ── Cell renderer ──────────────────────────────────────────────────────────
  const renderGradeSelector = (level, col) => {
    const isRecovery = level === "Recovery";
    return e("div", {
      className: `grade-selector ${isRecovery ? "grade-selector-recovery" : ""}`,
      onClick: ev => ev.stopPropagation()
    },
      isRecovery && e("div", { className: "grade-selector-hint" },
        "CR = Credit Recovery (earns credit, counts as C in GPA)"
      ),
      GRADE_LIST.map(g =>
        e("button", {
          key: g,
          className: `grade-option ${GRADE_COLOR[g] ? GRADE_COLOR[g] : ""} ${g === "Clear" ? "grade-option-clear" : ""} ${g === "CR" ? "grade-option-cr-highlight" : ""}`,
          onClick: () => handleSelectGrade(g),
          title: g === "CR" ? "Credit Recovery / Alternative Credit — earns 0.25 cr, counts as C (2.0) in GPA" :
                 g === "F"  ? "Fail — 0.0 GPA points, no credit earned" :
                 g === "P"  ? "Pass — earns credit, excluded from GPA" :
                 g === "P+" ? "Pass+ — earns credit, excluded from GPA" :
                 g === "Clear" ? "Remove all grades from this cell" : g
        }, g)
      )
    );
  };

  const renderCell = (level, col) => {
    const cell = grid[level][col];
    const isActive = activeCell && activeCell.level === level && activeCell.col === col;
    const isRecovery = level === "Recovery";
    const subj = SUBJECTS[col];
    const req = reqCredits[subj.key] || 0;
    const have = stats.earned[subj.key] || 0;

    const filledGrades = cell.grades.filter(g => !!g);
    const hasFail = filledGrades.includes("F");
    const hasCR   = filledGrades.includes("CR");

    return e("div", {
      key: `${level}-${col}`,
      className: [
        "grid-cell",
        isActive ? "grid-cell-active" : "",
        isRecovery ? "grid-cell-recovery" : `grade-level-${level.replace("th","").replace("Other","other")}`,
        hasFail && !hasCR ? "grid-cell-has-fail" : "",
        hasCR ? "grid-cell-has-cr" : ""
      ].filter(Boolean).join(" "),
      onClick: () => handleCellClick(level, col),
      title: `${subj.label} — ${LEVEL_LABELS[level]} (click to assign grade)`
    },
      isActive
        ? renderGradeSelector(level, col)
        : e("div", { className: "grade-stack" },
            filledGrades.length === 0
              ? e("span", { className: "grade-empty-hint" }, "+")
              : filledGrades.map((g, i) => {
                  const realIdx = cell.grades.indexOf(g, i === 0 ? 0 : cell.grades.indexOf(filledGrades[i-1]) + 1);
                  return e("span", {
                    key: i,
                    className: `grade-chip ${GRADE_COLOR[g] || ""} ${g === "CR" ? "grade-chip-cr" : ""}`,
                    title: g === "CR" ? "Credit Recovery — click to remove" :
                           g === "F"  ? "Fail — click to remove" : `${g} — click to remove`,
                    onClick: ev => handleRemoveGrade(level, col, cell.grades.findIndex((x, xi) => x === g && xi >= (i === 0 ? 0 : 0)), ev)
                  }, g === "CR" ? "CR★" : g);
                })
          )
    );
  };

  // ── Req row ────────────────────────────────────────────────────────────────
  const renderReqRow = () => [
    e("div", { key: "req-label", className: "cell-req-label" }, "Req."),
    ...SUBJECTS.map((s, i) => {
      const req = reqCredits[s.key] || 0;
      const have = stats.earned[s.key] || 0;
      const met = have >= req;
      return e("div", {
        key: i,
        className: `cell-req ${met ? "cell-req-met" : "cell-req-unmet"}`,
        title: `${s.label}: ${have.toFixed(2)} earned / ${req.toFixed(2)} required`
      }, `${have.toFixed(2)}/${req.toFixed(2)}`);
    }),
    e("div", { key: "req-cr", className: "cell-req cell-req-total" }, stats.totalEarned.toFixed(2)),
    e("div", { key: "req-gpa", className: "cell-req cell-req-gpa" }, stats.gpa !== null ? stats.gpa : "—")
  ];

  // ── Standard grade level row ───────────────────────────────────────────────
  const renderLevelRow = (level) => {
    const ls = levelStats[level];
    return [
      e("div", {
        key: `${level}-label`,
        className: `cell-level grade-level-${level.replace("th","").replace("Other","other")}`
      }, level),
      ...SUBJECT_KEYS.map((_, col) => renderCell(level, col)),
      e("div", {
        key: `${level}-cr`,
        className: `cell-level-stat grade-level-${level.replace("th","").replace("Other","other")}`
      }, ls.credits > 0 ? ls.credits.toFixed(2) : "—"),
      e("div", {
        key: `${level}-gpa`,
        className: `cell-level-stat grade-level-${level.replace("th","").replace("Other","other")}`
      }, ls.gpa !== null ? ls.gpa : "—")
    ];
  };

  // ── Recovery row ───────────────────────────────────────────────────────────
  const renderRecoveryRow = () => {
    const ls = levelStats["Recovery"];
    const hasAny = SUBJECT_KEYS.some((_, col) => grid["Recovery"][col].grades.some(g => !!g));
    return [
      e("div", {
        key: "recovery-label",
        className: "cell-level cell-level-recovery",
        title: "Credit Recovery, Summer School, Concurrent Enrollment, or Alternative Credit"
      },
        e("span", { className: "recovery-label-text" }, "Recovery"),
        e("span", { className: "recovery-label-icon" }, "★")
      ),
      ...SUBJECT_KEYS.map((_, col) => renderCell("Recovery", col)),
      e("div", { key: "recovery-cr", className: "cell-level-stat cell-level-recovery" },
        ls.credits > 0 ? ls.credits.toFixed(2) : "—"
      ),
      e("div", { key: "recovery-gpa", className: "cell-level-stat cell-level-recovery" },
        ls.gpa !== null ? ls.gpa : "—"
      )
    ];
  };

  // ── Grid tab ───────────────────────────────────────────────────────────────
  const renderGridTab = () => {
    const standardLevels = GRADE_LEVELS.filter(lv => lv !== "Recovery");
    return e("div", { className: "grid-tab" },
      e("div", { className: "subject-grid" },
        // Header row
        e("div", { className: "cell-header cell-corner" }, "Year"),
        ...SUBJECTS.map((s, i) =>
          e("div", {
            key: i,
            className: "cell-header cell-subject",
            title: s.note,
            onMouseEnter: () => setShowSubjectInfo(i),
            onMouseLeave: () => setShowSubjectInfo(null)
          },
            e("span", null, s.abbr),
            showSubjectInfo === i && e("div", { className: "subject-tooltip" }, s.note)
          )
        ),
        e("div", { className: "cell-header cell-credits" }, "Cr"),
        e("div", { className: "cell-header cell-gpa-h" }, "GPA"),

        // Req row
        ...renderReqRow(),

        // Standard grade level rows
        ...standardLevels.flatMap(lv => renderLevelRow(lv)),

        // Recovery row separator
        e("div", { key: "sep", className: "recovery-separator", style: { gridColumn: `1 / -1` } },
          e("span", null, "★ Credit Recovery / Alternative Credit — Enter CR for recovered courses, or the actual earned grade")
        ),

        // Recovery row
        ...renderRecoveryRow()
      ),

      // Recovery explainer
      e("div", { className: "recovery-explainer" },
        e("div", { className: "recovery-explainer-title" }, "★ How Credit Recovery Works in This Planner"),
        e("div", { className: "recovery-explainer-body" },
          e("p", null,
            e("strong", null, "F grade: "),
            "Enter F in the year the course was failed. This adds 0.0 quality points to your GPA and counts in the denominator — it permanently affects your GPA."
          ),
          e("p", null,
            e("strong", null, "CR (Credit Recovery): "),
            "Enter CR in the Recovery row for the same subject. This earns 0.25 credits and counts as a C (2.0) in your GPA — representing the typical credit recovery completion standard."
          ),
          e("p", null,
            e("strong", null, "Actual grade earned: "),
            "If your school assigns a real letter grade for the recovery course (e.g., B-), enter that grade instead of CR in the Recovery row."
          ),
          e("p", null,
            e("strong", null, "Summer school / concurrent enrollment: "),
            "Use the Recovery row for any course taken outside the normal 4-year sequence, including summer school, online courses, or college concurrent enrollment."
          )
        )
      ),

      // Quick-fill panel
      e("div", { className: "quick-fill-panel" },

        // ── Row 1: Global fill (all years) ─────────────────────────────────
        e("div", { className: "quick-fill-row" },
          e("span", { className: "quick-fill-label" }, "All Years:"),
          ["A","B","C","D","F"].map(g =>
            e("button", {
              key: g,
              className: `quick-btn quick-btn-${g.toLowerCase()}`,
              onClick: () => fillAll(g),
              title: `Fill every year with ${g} (8.0 cr per year)`
            }, `All ${g}`)
          ),
          e("button", {
            className: "quick-btn quick-btn-random",
            onClick: fillRandom,
            title: "Fill all years with realistic weighted-random grades (8.0 cr/yr)"
          }, "Random"),
          e("div", { className: "quick-fill-sep" }),
          e("button", { className: "quick-btn quick-btn-clear", onClick: clearAll, title: "Clear all grades" }, "Clear All")
        ),

        // ── Row 2: Per-year fill ────────────────────────────────────────────
        e("div", { className: "quick-fill-row" },
          e("span", { className: "quick-fill-label" }, "One Year:"),

          // Year selector tabs
          e("div", { className: "year-selector" },
            ["9th","10th","11th","12th","Other"].map(yr =>
              e("button", {
                key: yr,
                className: `year-tab ${scenarioYear === yr ? "year-tab-active" : ""}`,
                onClick: () => setScenarioYear(yr)
              }, yr)
            )
          ),

          e("div", { className: "quick-fill-sep" }),

          // Grade buttons for selected year
          ["A","B","C","D","F"].map(g =>
            e("button", {
              key: g,
              className: `quick-btn quick-btn-${g.toLowerCase()}`,
              onClick: () => fillYearGrade(scenarioYear, g),
              title: `Fill ${scenarioYear} grade with ${g} (8.0 cr = 32 slots)`
            }, g)
          ),
          e("button", {
            className: "quick-btn quick-btn-random",
            onClick: () => fillYearRandom(scenarioYear),
            title: `Fill ${scenarioYear} grade with random grades (8.0 cr)`
          }, "Random"),
          e("button", {
            className: "quick-btn quick-btn-bad-year",
            onClick: () => fillBadYear(scenarioYear),
            title: `Simulate a bad ${scenarioYear} year: B in most courses, F in LA/MA/SC, CR recovery added`
          }, `Bad Year + Recovery`),
          e("div", { className: "quick-fill-sep" }),
          e("button", {
            className: "quick-btn quick-btn-clear",
            onClick: () => clearYear(scenarioYear),
            title: `Clear all grades for ${scenarioYear} only`
          }, `Clear ${scenarioYear}`)
        ),

        // ── Row 3: Credit note ──────────────────────────────────────────────
        e("div", { className: "quick-fill-note" },
          "Per-year fill uses the standard Utah public school load of ",
          e("strong", null, "8.0 credits per year"),
          " (32 quarter-credit slots). Core subjects fill first; remaining slots go to electives."
        )
      )
    );
  };

  // ── Projection tab ─────────────────────────────────────────────────────────
  const renderProjectionTab = () => {
    const { qp, denom, remaining, scenarios, customNeeded } = projectionData;
    const currentGPA = denom > 0 ? +(qp / denom).toFixed(3) : null;

    return e("div", { className: "projection-tab" },
      e("h2", { className: "section-title" }, "Graduation Planning & GPA Projection"),
      e("p", { className: "section-desc" },
        "Shows what average grade you need in remaining courses to reach a target GPA. ",
        "All grades already entered (including F and CR) are included in the current GPA. ",
        "Remaining credits are the gap between what you have earned and your graduation path requirement."
      ),

      // Snapshot cards
      e("div", { className: "projection-snapshot" },
        e("div", { className: "snapshot-card" },
          e("div", { className: "snapshot-value" }, currentGPA !== null ? currentGPA : "—"),
          e("div", { className: "snapshot-label" }, "Current GPA"),
          currentGPA !== null && e("div", { className: "snapshot-sub" }, gpaToLetter(currentGPA))
        ),
        e("div", { className: "snapshot-card" },
          e("div", { className: "snapshot-value" }, stats.totalEarned.toFixed(2)),
          e("div", { className: "snapshot-label" }, "Credits Earned"),
          e("div", { className: "snapshot-sub" }, `of ${creditPath} required`)
        ),
        e("div", { className: "snapshot-card" },
          e("div", { className: "snapshot-value" }, remaining.toFixed(2)),
          e("div", { className: "snapshot-label" }, "Credits Remaining"),
          e("div", { className: "snapshot-sub" }, remaining > 0 ? "to graduate" : "✓ Complete")
        ),
        e("div", { className: "snapshot-card" },
          e("div", { className: "snapshot-value" }, stats.gpaDenominator.toFixed(2)),
          e("div", { className: "snapshot-label" }, "GPA Denominator"),
          e("div", { className: "snapshot-sub" }, "incl. all F grades")
        )
      ),

      // Custom target slider
      e("div", { className: "custom-target-row" },
        e("label", { className: "custom-target-label" }, "My Target GPA:"),
        e("input", {
          type: "range", min: 1.0, max: 4.0, step: 0.05,
          value: targetGPA,
          onChange: ev => setTargetGPA(parseFloat(ev.target.value)),
          className: "target-slider"
        }),
        e("span", { className: "target-value" }, targetGPA.toFixed(2)),
        e("span", { className: "target-letter" }, `(${gpaToLetter(targetGPA)})`),
        customNeeded !== null && e("div", {
          className: `needed-result ${customNeeded > 4.0 ? "needed-impossible" : customNeeded < 0 ? "needed-done" : customNeeded > 3.3 ? "needed-hard" : "needed-ok"}`
        },
          customNeeded > 4.0
            ? `⚠ Not achievable — would need ${customNeeded.toFixed(2)} avg (max is 4.0). Consider the ${creditPath === "24" ? "27" : "24"}-credit path or speak with your counselor.`
            : customNeeded < 0
            ? `✓ Already achieved — your current GPA of ${currentGPA} already exceeds ${targetGPA.toFixed(2)}`
            : `To reach ${targetGPA.toFixed(2)} GPA, you need an average of ${customNeeded.toFixed(2)} (${gpaToLetter(customNeeded)}) across your remaining ${remaining.toFixed(2)} credits`
        )
      ),

      // Scenario table
      e("div", { className: "scenario-section" },
        e("h3", { className: "scenario-title" }, "All GPA Target Scenarios"),
        e("table", { className: "scenario-table" },
          e("thead", null,
            e("tr", null,
              e("th", null, "Target GPA"),
              e("th", null, "Avg Grade Needed"),
              e("th", null, "Letter"),
              e("th", null, "Assessment")
            )
          ),
          e("tbody", null,
            scenarios.map((s, i) =>
              e("tr", { key: i, className: s.feasible ? "" : "scenario-infeasible" },
                e("td", null, s.target.toFixed(2)),
                e("td", { className: "tc" }, s.needed !== null ? s.needed.toFixed(3) : "—"),
                e("td", { className: "tc" }, s.letter),
                e("td", null,
                  s.needed === null ? "No remaining credits"
                  : s.needed < 0 ? "✓ Already exceeded"
                  : s.feasible ? "✓ Achievable"
                  : `✗ Requires ${s.needed.toFixed(2)} — exceeds 4.0 maximum`
                )
              )
            )
          )
        )
      ),

      // Per-year breakdown
      e("div", { className: "year-breakdown" },
        e("h3", { className: "scenario-title" }, "GPA & Credits by Year"),
        e("div", { className: "year-breakdown-grid" },
          GRADE_LEVELS.map(lv => {
            const ls = levelStats[lv];
            const pct = ls.gpa !== null ? Math.min(100, (ls.gpa / 4.0) * 100) : 0;
            const barColor = ls.gpa !== null ? (ls.gpa >= 3.0 ? "#22c55e" : ls.gpa >= 2.0 ? "#f59e0b" : "#ef4444") : "#e2e8f0";
            return e("div", {
              key: lv,
              className: `year-card ${lv === "Recovery" ? "year-card-recovery" : ""}`
            },
              e("div", {
                className: `year-card-label ${lv === "Recovery" ? "year-card-label-recovery" : `grade-level-${lv.replace("th","").replace("Other","other")}`}`
              }, lv === "Recovery" ? "Recovery ★" : lv),
              e("div", { className: "year-card-gpa" }, ls.gpa !== null ? ls.gpa.toFixed(3) : "—"),
              e("div", { className: "year-card-credits" }, `${ls.credits.toFixed(2)} cr`),
              ls.fCount > 0 && e("div", { className: "year-card-badge year-card-badge-f" }, `${ls.fCount}×F`),
              ls.crCount > 0 && e("div", { className: "year-card-badge year-card-badge-cr" }, `${ls.crCount}×CR`),
              ls.gpa !== null && e("div", { className: "gpa-bar-wrap" },
                e("div", { className: "gpa-bar-track" },
                  e("div", { className: "gpa-bar-fill", style: { width: `${pct}%`, backgroundColor: barColor } })
                )
              )
            );
          })
        )
      )
    );
  };

  // ── Report tab ─────────────────────────────────────────────────────────────
  const renderReportTab = () => {
    const { qp, denom, remaining, customNeeded } = projectionData;
    const currentGPA = denom > 0 ? +(qp / denom).toFixed(3) : null;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
    const totalFails = GRADE_LEVELS.reduce((sum, lv) => sum + levelStats[lv].fCount, 0);
    const totalCR    = GRADE_LEVELS.reduce((sum, lv) => sum + levelStats[lv].crCount, 0);

    return e("div", { className: "report-tab" },
      e("div", { className: "report-header" },
        e("div", null,
          e("h1", { className: "report-title" }, "Utah GPA Planner — Graduation Progress Report"),
          e("div", { className: "report-meta" },
            studentName && e("span", null, `Student: ${studentName}  ·  `),
            e("span", null, `Generated: ${dateStr}  ·  `),
            e("span", null, `Graduation Path: ${creditPath}-Credit Diploma`)
          )
        ),
        e("button", { className: "print-btn no-print", onClick: () => window.print() }, "🖨 Print / Save PDF")
      ),

      // Summary
      e("div", { className: "report-summary" },
        e("div", { className: "report-stat-card" },
          e("div", { className: "report-stat-value" }, currentGPA !== null ? currentGPA : "—"),
          e("div", { className: "report-stat-label" }, "Cumulative GPA"),
          currentGPA !== null && e("div", { className: "report-stat-sub" }, gpaToLetter(currentGPA))
        ),
        e("div", { className: "report-stat-card" },
          e("div", { className: "report-stat-value" }, stats.totalEarned.toFixed(2)),
          e("div", { className: "report-stat-label" }, "Credits Earned"),
          e("div", { className: "report-stat-sub" }, `of ${creditPath} required`)
        ),
        e("div", { className: "report-stat-card" },
          e("div", { className: "report-stat-value" }, remaining.toFixed(2)),
          e("div", { className: "report-stat-label" }, "Credits Remaining"),
          e("div", { className: "report-stat-sub" }, remaining > 0 ? "to graduate" : "✓ Requirements met")
        ),
        totalFails > 0 && e("div", { className: "report-stat-card report-stat-card-warn" },
          e("div", { className: "report-stat-value" }, totalFails),
          e("div", { className: "report-stat-label" }, "F Grades"),
          e("div", { className: "report-stat-sub" }, totalCR > 0 ? `${totalCR} recovered via CR` : "No recovery recorded")
        ),
        customNeeded !== null && e("div", { className: "report-stat-card" },
          e("div", { className: "report-stat-value" },
            customNeeded <= 4.0 && customNeeded >= 0 ? customNeeded.toFixed(2) : "—"
          ),
          e("div", { className: "report-stat-label" }, `Needed for ${targetGPA.toFixed(2)} GPA`),
          e("div", { className: "report-stat-sub" },
            customNeeded > 4.0 ? "Not achievable" : customNeeded < 0 ? "Already met" : gpaToLetter(customNeeded)
          )
        )
      ),

      // Credit progress by subject
      e("div", { className: "report-section" },
        e("h2", { className: "report-section-title" }, "Credit Progress by Subject"),
        e("table", { className: "report-table" },
          e("thead", null,
            e("tr", null,
              e("th", null, "Subject"),
              e("th", { className: "tc" }, "Required"),
              e("th", { className: "tc" }, "Earned"),
              e("th", { className: "tc" }, "Remaining"),
              e("th", null, "Status"),
              e("th", null, "Progress")
            )
          ),
          e("tbody", null,
            SUBJECTS.map((s, i) => {
              const req = reqCredits[s.key] || 0;
              const have = stats.earned[s.key] || 0;
              const rem = Math.max(0, req - have);
              const pct = req > 0 ? Math.min(100, (have / req) * 100) : 100;
              const met = have >= req;
              return e("tr", { key: i, className: met ? "" : "row-unmet" },
                e("td", null,
                  e("strong", null, s.abbr), " ",
                  e("small", { className: "text-muted" }, s.label)
                ),
                e("td", { className: "tc" }, req.toFixed(2)),
                e("td", { className: "tc" }, have.toFixed(2)),
                e("td", { className: "tc" }, rem > 0 ? rem.toFixed(2) : "—"),
                e("td", { className: met ? "status-met" : "status-unmet" }, met ? "✓ Met" : `${rem.toFixed(2)} cr needed`),
                e("td", null,
                  e("div", { className: "progress-track" },
                    e("div", {
                      className: `progress-fill ${met ? "progress-met" : "progress-partial"}`,
                      style: { width: `${pct}%` }
                    })
                  )
                )
              );
            })
          )
        )
      ),

      // Per-year GPA
      e("div", { className: "report-section" },
        e("h2", { className: "report-section-title" }, "GPA by Grade Level"),
        e("table", { className: "report-table" },
          e("thead", null,
            e("tr", null,
              e("th", null, "Level"),
              e("th", { className: "tc" }, "Credits"),
              e("th", { className: "tc" }, "GPA"),
              e("th", { className: "tc" }, "Letter"),
              e("th", { className: "tc" }, "F Grades"),
              e("th", { className: "tc" }, "CR Recovered"),
              e("th", null, "Visual")
            )
          ),
          e("tbody", null,
            GRADE_LEVELS.map(lv => {
              const ls = levelStats[lv];
              const pct = ls.gpa !== null ? Math.min(100, (ls.gpa / 4.0) * 100) : 0;
              const barColor = ls.gpa !== null ? (ls.gpa >= 3.0 ? "#22c55e" : ls.gpa >= 2.0 ? "#f59e0b" : "#ef4444") : "#e2e8f0";
              return e("tr", { key: lv, className: lv === "Recovery" ? "row-recovery" : "" },
                e("td", null, lv === "Recovery" ? "★ Recovery" : lv),
                e("td", { className: "tc" }, ls.credits > 0 ? ls.credits.toFixed(2) : "—"),
                e("td", { className: "tc" }, ls.gpa !== null ? ls.gpa.toFixed(3) : "—"),
                e("td", { className: "tc" }, ls.gpa !== null ? gpaToLetter(ls.gpa) : "—"),
                e("td", { className: `tc ${ls.fCount > 0 ? "status-unmet" : ""}` }, ls.fCount > 0 ? ls.fCount : "—"),
                e("td", { className: `tc ${ls.crCount > 0 ? "status-cr" : ""}` }, ls.crCount > 0 ? ls.crCount : "—"),
                e("td", null,
                  ls.gpa !== null && e("div", { className: "progress-track" },
                    e("div", { className: "progress-fill", style: { width: `${pct}%`, backgroundColor: barColor } })
                  )
                )
              );
            })
          )
        )
      ),

      // Projection scenarios
      e("div", { className: "report-section" },
        e("h2", { className: "report-section-title" }, "GPA Projection Scenarios"),
        e("p", { className: "report-note" },
          `${remaining.toFixed(2)} credits remaining. `,
          `Current quality points: ${qp.toFixed(3)}, GPA denominator: ${denom.toFixed(2)}. `,
          totalFails > 0 && `Note: ${totalFails} F grade(s) are permanently included in the denominator.`
        ),
        e("table", { className: "report-table" },
          e("thead", null,
            e("tr", null,
              e("th", null, "Target GPA"),
              e("th", { className: "tc" }, "Avg Grade Needed"),
              e("th", { className: "tc" }, "Letter"),
              e("th", null, "Assessment")
            )
          ),
          e("tbody", null,
            projectionData.scenarios.map((s, i) =>
              e("tr", { key: i, className: s.feasible ? "" : "scenario-infeasible" },
                e("td", null, s.target.toFixed(2)),
                e("td", { className: "tc" }, s.needed !== null ? s.needed.toFixed(3) : "—"),
                e("td", { className: "tc" }, s.letter),
                e("td", null,
                  s.needed === null ? "No remaining credits"
                  : s.needed < 0 ? "✓ Already exceeded"
                  : s.feasible ? "✓ Achievable"
                  : `✗ Requires ${s.needed.toFixed(2)} — exceeds 4.0 maximum`
                )
              )
            )
          )
        )
      ),

      // Legal / counselor note
      e("div", { className: "report-footer" },
        e("p", null,
          "Credit requirements per Utah Admin. Code R277-700-6 (amended June 2024). ",
          "Individual LEA boards may require credits exceeding state minimums. ",
          "Verify all requirements with your school counselor before making academic decisions."
        ),
        e("p", null,
          "GPA note: F grades permanently affect GPA (0.0 quality points, counted in denominator). ",
          "CR (Credit Recovery) entries count as C (2.0) in GPA and earn 0.25 credits. ",
          "P/P+ grades earn credit but are excluded from GPA calculation."
        ),
        e("p", null, `© ${now.getFullYear()} Utah GPA Planner`)
      )
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return e("div", { className: "app-wrapper" },
    e("nav", { className: "navbar no-print" },
      e("div", { className: "navbar-inner" },
        e("div", { className: "navbar-brand" }, "Utah GPA Planner"),
        e("div", { className: "navbar-controls" },
          e("label", { className: "nav-label" }, "Student:"),
          e("input", {
            type: "text", placeholder: "Name (optional)",
            value: studentName,
            onChange: ev => setStudentName(ev.target.value),
            className: "nav-input"
          }),
          e("label", { className: "nav-label" }, "Path:"),
          e("select", {
            value: creditPath,
            onChange: ev => setCreditPath(ev.target.value),
            className: "nav-select"
          },
            e("option", { value: "24" }, "24-Credit Diploma"),
            e("option", { value: "27" }, "27-Credit Advanced")
          ),
          e("button", {
            className: "theme-btn",
            onClick: () => setTheme(t => t === "light" ? "dark" : "light")
          }, theme === "light" ? "🌙 Dark" : "☀️ Light")
        )
      ),
      e("div", { className: "tab-bar" },
        [
          { id: "grid",       label: "📊 Grade Grid" },
          { id: "projection", label: "🎯 GPA Projection" },
          { id: "report",     label: "📄 Report" }
        ].map(t =>
          e("button", {
            key: t.id,
            className: `tab-btn ${tab === t.id ? "tab-btn-active" : ""}`,
            onClick: () => setTab(t.id)
          }, t.label)
        )
      )
    ),

    e("main", { className: "main-content" },
      e("div", { className: "content-wrapper" },
        tab === "grid"       ? renderGridTab()
        : tab === "projection" ? renderProjectionTab()
        : renderReportTab()
      )
    ),

    e("footer", { className: "app-footer no-print" },
      e("div", { className: "footer-stats" },
        e("span", { className: "footer-stat" }, `GPA: ${stats.gpa !== null ? stats.gpa : "—"}`),
        e("span", { className: "footer-sep" }, "|"),
        e("span", { className: "footer-stat" }, `Credits: ${stats.totalEarned.toFixed(2)} / ${creditPath}`),
        e("span", { className: "footer-sep" }, "|"),
        e("span", {
          className: `footer-stat ${stats.creditsNeeded > 0 ? "footer-stat-warn" : "footer-stat-ok"}`
        }, stats.creditsNeeded > 0 ? `${stats.creditsNeeded.toFixed(2)} cr still needed` : "✓ Graduation requirements met")
      ),
      e("div", { className: "footer-note" },
        "Requirements per ",
        e("a", { href: "https://www.schools.utah.gov/curr/graduationrequirements", target: "_blank", rel: "noopener noreferrer" },
          "Utah Admin. Code R277-700-6"
        ),
        ". P/P+ = credit only, no GPA impact. F = GPA impact, no credit. CR = credit recovery (earns credit, counts as C in GPA)."
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(e(App));
