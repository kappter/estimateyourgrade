const grades = [
  "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"
];

// GPA mapping
const gpaMap = {
  "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3,
  "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "D-": 0.7, "F": 0.0
};

// Subjects by grade level
const subjects = ["LA", "MA", "SC", "SS", "GOV", "Art", "PE", "CTE", "HE", "CT", "FL", "EL"];

// Quarters per subject
const quarters = ["Q1", "Q2", "Q3", "Q4"];

// Required credits for graduation (24 credits, in quarters: 1 credit = 4 quarters)
const requiredCredits24 = {
  "LA": 16, "MA": 16, "SC": 12, "SS": 12, "GOV": 8, "Art": 4, "PE": 4, "CTE": 4, "HE": 4, "CT": 4, "FL": 4, "EL": 8
};

// Required credits for graduation (27 credits, in quarters)
const requiredCredits27 = {
  "LA": 16, "MA": 16, "SC": 12, "SS": 12, "GOV": 8, "Art": 4, "PE": 4, "CTE": 4, "HE": 4, "CT": 4, "FL": 4, "EL": 20
};

const App = () => {
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');
  const [creditOption, setCreditOption] = React.useState("24");
  const [grid, setGrid] = React.useState({
    "9th": subjects.map(() => quarters.map(() => "")),
    "10th": subjects.map(() => quarters.map(() => "")),
    "11th": subjects.map(() => quarters.map(() => "")),
    "12th": subjects.map(() => quarters.map(() => "")),
    "Other": subjects.map(() => quarters.map(() => ""))
  });
  const [activeCell, setActiveCell] = React.useState(null);

  React.useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleCreditChange = (e) => {
    setCreditOption(e.target.value);
  };

  const handleCellHover = (gradeLevel, subjectIdx, quarterIdx) => {
    setActiveCell({ gradeLevel, subjectIdx, quarterIdx });
  };

  const handleCellLeave = () => {
    setActiveCell(null);
  };

  const handleSelectGrade = (gradeLevel, subjectIdx, quarterIdx, grade) => {
    const newGrid = { ...grid };
    newGrid[gradeLevel][subjectIdx][quarterIdx] = grade;
    setGrid(newGrid);
    setActiveCell(null);
  };

  // Calculate total credits, credits needed, and GPA
  const calculateStats = () => {
    const requiredCredits = creditOption === "24" ? requiredCredits24 : requiredCredits27;
    const earnedCredits = {};
    let totalCredits = 0;
    let totalGPA = 0;
    let totalQuarters = 0;

    Object.keys(grid).forEach((gradeLevel) => {
      grid[gradeLevel].forEach((subjectQuarters, subjectIdx) => {
        const subject = gradeLevel === "Other" && subjectIdx === subjects.length - 1 ? "EL" : subjects[subjectIdx];
        subjectQuarters.forEach((grade) => {
          if (grade) {
            earnedCredits[subject] = (earnedCredits[subject] || 0) + 0.25;
            totalCredits += 0.25;
            totalGPA += gpaMap[grade];
            totalQuarters += 1;
          }
        });
      });
    });

    let creditsNeeded = 0;
    Object.keys(requiredCredits).forEach((subject) => {
      const earned = earnedCredits[subject] || 0;
      const needed = (requiredCredits[subject] * 0.25) - earned;
      if (needed > 0) creditsNeeded += needed;
    });

    const gpa = totalQuarters > 0 ? (totalGPA / totalQuarters).toFixed(2) : 0;
    return { totalCredits, creditsNeeded, gpa };
  };

  const { totalCredits, creditsNeeded, gpa } = calculateStats();

  return (
    <div>
      <nav className="navbar flex justify-center">
        <div className="flex space-x-4">
          <a href="#" className="text-lg">Home</a>
          <select onChange={handleCreditChange} value={creditOption} className="text-lg">
            <option value="24">24 Credits</option>
            <option value="27">27 Credits</option>
          </select>
          <a href="#" onClick={() => setGrid({
            "9th": subjects.map(() => quarters.map(() => "")),
            "10th": subjects.map(() => quarters.map(() => "")),
            "11th": subjects.map(() => quarters.map(() => "")),
            "12th": subjects.map(() => quarters.map(() => "")),
            "Other": subjects.map(() => quarters.map(() => ""))
          })} className="text-lg">Clear Grid</a>
          <a href="#" onClick={toggleTheme} className="text-lg">
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </a>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
          Utah Quarter Credit Model GPA Calculator
        </h1>
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-[60px_repeat(48,40px)] gap-1 w-fit">
            <div className="bg-blue-500 text-white p-2 font-bold">Grade</div>
            {subjects.map((subject) => quarters.map((quarter, qIdx) => (
              <div key={`${subject}-${qIdx}`} className="bg-blue-500 text-white p-1 text-center font-bold text-xs">
                {subject} {quarter}
              </div>
            ))).flat()}

            {Object.keys(grid).map((gradeLevel) => (
              <React.Fragment key={gradeLevel}>
                <div className={`p-2 font-semibold flex items-center text-sm grade-${gradeLevel.toLowerCase().replace(/\dth/, '')}`}>
                  {gradeLevel}
                </div>
                {grid[gradeLevel].map((subjectQuarters, subjectIdx) =>
                  quarters.map((_, quarterIdx) => (
                    <div
                      key={`${subjectIdx}-${quarterIdx}`}
                      onMouseEnter={() => handleCellHover(gradeLevel, subjectIdx, quarterIdx)}
                      onMouseLeave={handleCellLeave}
                      className={`grid-cell p-1 border border-gray-300 cursor-pointer transition-colors relative grade-${gradeLevel.toLowerCase().replace(/\dth/, '')} flex items-center justify-center text-sm`}
                    >
                      {activeCell && activeCell.gradeLevel === gradeLevel && activeCell.subjectIdx === subjectIdx && activeCell.quarterIdx === quarterIdx ? (
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5 bg-[var(--cell-bg)] z-50 grade-selector">
                          {grades.map((g) => (
                            <div
                              key={g}
                              onClick={() => handleSelectGrade(gradeLevel, subjectIdx, quarterIdx, g)}
                              className="flex items-center justify-center text-[10px] hover:bg-[var(--cell-hover)] cursor-pointer"
                            >
                              {g}
                            </div>
                          ))}
                        </div>
                      ) : (
                        subjectQuarters[quarterIdx] || ""
                      )}
                    </div>
                  ))
                ).flat()}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>Credits Needed to Graduate: {creditsNeeded.toFixed(2)}</p>
        <p>Total Credits: {totalCredits.toFixed(2)}</p>
        <p>GPA: {gpa}</p>
        <p className="copyright">© 2025 All Rights Reserved</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
