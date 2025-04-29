const grades = [
  "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "P+", "Clear"
];

// GPA mapping (P and P+ excluded as they don't affect GPA)
const gpaMap = {
  "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3,
  "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "D-": 0.7, "F": 0.0
};

// Subjects by grade level, splitting FL and CT into two 0.5-credit slots each
const subjects = ["LA", "MA", "SC", "SS", "GOV", "Art", "PE", "CTE", "HE", "CT1", "CT2", "FL1", "FL2", "EL"];

// Required credits for graduation (24 credits)
const requiredCredits24 = {
  "LA": 4, "MA": 4, "SC": 3, "SS": 3, "GOV": 2, "Art": 1, "PE": 1, "CTE": 1, "HE": 1, "CT": 0.5, "FL": 0.5, "EL": 3.5
};

// Required credits for graduation (27 credits)
const requiredCredits27 = {
  "LA": 4, "MA": 4, "SC": 3, "SS": 3, "GOV": 2, "Art": 1, "PE": 1, "CTE": 1, "HE": 1, "CT": 0.5, "FL": 0.5, "EL": 6.5
};

// Credit value per grade (0.25 per grade, 0.125 for FL/CT slots)
const creditValues = subjects.reduce((acc, subject) => {
  acc[subject] = subject.includes("FL") || subject.includes("CT") ? 0.125 : 0.25;
  return acc;
}, {});

const App = () => {
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');
  const [creditOption, setCreditOption] = React.useState("24");
  const [gridLayout, setGridLayout] = React.useState("stacked");
  const [grid, setGrid] = React.useState({
    stacked: {
      "9th": Array(subjects.length).fill().map(() => ["", "", "", ""]),
      "10th": Array(subjects.length).fill().map(() => ["", "", "", ""]),
      "11th": Array(subjects.length).fill().map(() => ["", "", "", ""]),
      "12th": Array(subjects.length).fill().map(() => ["", "", "", ""]),
      "Other": Array(subjects.length).fill().map(() => ["", "", "", ""])
    },
    rowBased: {
      "9th-1": Array(subjects.length).fill(""),
      "9th-2": Array(subjects.length).fill(""),
      "9th-3": Array(subjects.length).fill(""),
      "9th-4": Array(subjects.length).fill(""),
      "10th-1": Array(subjects.length).fill(""),
      "10th-2": Array(subjects.length).fill(""),
      "10th-3": Array(subjects.length).fill(""),
      "10th-4": Array(subjects.length).fill(""),
      "11th-1": Array(subjects.length).fill(""),
      "11th-2": Array(subjects.length).fill(""),
      "11th-3": Array(subjects.length).fill(""),
      "11th-4": Array(subjects.length).fill(""),
      "12th-1": Array(subjects.length).fill(""),
      "12th-2": Array(subjects.length).fill(""),
      "12th-3": Array(subjects.length).fill(""),
      "12th-4": Array(subjects.length).fill(""),
      "Other-1": Array(subjects.length).fill(""),
      "Other-2": Array(subjects.length).fill(""),
      "Other-3": Array(subjects.length).fill(""),
      "Other-4": Array(subjects.length).fill("")
    }
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

  const handleGridLayoutChange = (e) => {
    setGridLayout(e.target.value);
  };

  const handleCellHover = (key, col) => {
    setActiveCell({ key, col });
  };

  const handleCellLeave = () => {
    setActiveCell(null);
  };

  const handleSelectGrade = (key, col, grade) => {
    const newGrid = { ...grid };
    if (gridLayout === "stacked") {
      if (grade === "Clear") {
        newGrid.stacked[key][col] = ["", "", "", ""];
      } else {
        const currentGrades = newGrid.stacked[key][col];
        const firstEmptyIndex = currentGrades.findIndex(g => !g);
        if (firstEmptyIndex !== -1) {
          currentGrades[firstEmptyIndex] = grade;
          newGrid.stacked[key][col] = [...currentGrades];
        }
      }
    } else {
      newGrid.rowBased[key][col] = grade === "Clear" ? "" : grade;
    }
    setGrid(newGrid);
    setActiveCell(null);
  };

  // Calculate total credits, credits needed, and GPA
  const calculateStats = () => {
    const requiredCredits = creditOption === "24" ? requiredCredits24 : requiredCredits27;
    const earnedCredits = {};
    let totalCredits = 0;
    let totalGPA = 0;
    let totalCourses = 0;

    if (gridLayout === "stacked") {
      Object.keys(grid.stacked).forEach((gradeLevel) => {
        grid.stacked[gradeLevel].forEach((gradeArray, col) => {
          gradeArray.forEach((grade) => {
            if (grade) {
              const subject = subjects[col].includes("FL") ? "FL" : subjects[col].includes("CT") ? "CT" : subjects[col];
              const creditValue = creditValues[subjects[col]];
              earnedCredits[subject] = (earnedCredits[subject] || 0) + creditValue;
              totalCredits += creditValue;
              if (grade !== "P" && grade !== "P+") {
                totalGPA += gpaMap[grade] * creditValue;
                totalCourses += creditValue;
              }
            }
          });
        });
      });
    } else {
      Object.keys(grid.rowBased).forEach((rowKey) => {
        grid.rowBased[rowKey].forEach((grade, col) => {
          if (grade) {
            const subject = subjects[col].includes("FL") ? "FL" : subjects[col].includes("CT") ? "CT" : subjects[col];
            const creditValue = creditValues[subjects[col]];
            earnedCredits[subject] = (earnedCredits[subject] || 0) + creditValue;
            totalCredits += creditValue;
            if (grade !== "P" && grade !== "P+") {
              totalGPA += gpaMap[grade] * creditValue;
              totalCourses += creditValue;
            }
          }
        });
      });
    }

    let creditsNeeded = 0;
    Object.keys(requiredCredits).forEach((subject) => {
      const earned = earnedCredits[subject] || 0;
      const needed = requiredCredits[subject] - earned;
      if (needed > 0) creditsNeeded += needed;
    });

    const gpa = totalCourses > 0 ? (totalGPA / totalCourses).toFixed(2) : 0;
    return { totalCredits, creditsNeeded, gpa };
  };

  const { totalCredits, creditsNeeded, gpa } = calculateStats();

  const handlePrint = () => {
    const now = new Date();
    const dateTime = now.toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    document.getElementById('print-footer').innerText = 
      `Printed on: ${dateTime} | Utah Quarter Credit Model GPA Calculator - Generated by app.js`;

    const printWindow = window.open('', '_blank');
    let gridHtml = '';
    if (gridLayout === "stacked") {
      gridHtml = `
        <div class="grid">
          <div>Grade</div>
          ${subjects.map(subject => `<div>${subject}</div>`).join('')}
          ${Object.keys(grid.stacked).map(gradeLevel => `
            <div class="grade-${gradeLevel.toLowerCase().replace(/\dth/, '')}">${gradeLevel}</div>
            ${grid.stacked[gradeLevel].map(gradeArray => `
              <div class="grade-${gradeLevel.toLowerCase().replace(/\dth/, '')} grade-stack">
                ${gradeArray.map(grade => `<span>${grade || ""}</span>`).join('')}
              </div>
            `).join('')}
          `).join('')}
        </div>
      `;
    } else {
      gridHtml = `
        <div class="grid">
          <div>Grade</div>
          ${subjects.map(subject => `<div>${subject}</div>`).join('')}
          ${Object.keys(grid.rowBased).map(rowKey => `
            <div class="grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')}">${rowKey}</div>
            ${grid.rowBased[rowKey].map(grade => `
              <div class="grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')}">${grade || ""}</div>
            `).join('')}
          `).join('')}
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print - Utah Quarter Credit Model GPA Calculator</title>
          <link rel="stylesheet" href="./styles.css">
        </head>
        <body>
          <div class="print-title">Utah Quarter Credit Model GPA Calculator</div>
          <main>
            <div class="container mx-auto">
              ${gridHtml}
              <div class="print-stats">
                <p>Credits Needed to Graduate: ${creditsNeeded.toFixed(2)}</p>
                <p>Total Credits: ${totalCredits.toFixed(2)}</p>
                <p>GPA: ${gpa}</p>
              </div>
            </div>
          </main>
          <div id="print-footer">${document.getElementById('print-footer').innerText}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
  const rowBasedKeys = gradeLevels.flatMap(level => [
    `${level}-1`, `${level}-2`, `${level}-3`, `${level}-4`
  ]);

  return (
    <div>
      <nav className="navbar flex justify-center">
        <div className="flex space-x-4">
          <a href="#" className="text-lg">Home</a>
          <select onChange={handleCreditChange} value={creditOption} className="text-lg">
            <option value="24">24 Credits</option>
            <option value="27">27 Credits</option>
          </select>
          <select onChange={handleGridLayoutChange} value={gridLayout} className="text-lg">
            <option value="stacked">Stacked Grid</option>
            <option value="rowBased">Row-Based Grid</option>
          </select>
          <a href="#" onClick={() => {
            const newGrid = { ...grid };
            if (gridLayout === "stacked") {
              Object.keys(newGrid.stacked).forEach(level => {
                newGrid.stacked[level] = Array(subjects.length).fill().map(() => ["", "", "", ""]);
              });
            } else {
              Object.keys(newGrid.rowBased).forEach(row => {
                newGrid.rowBased[row] = Array(subjects.length).fill("");
              });
            }
            setGrid(newGrid);
          }} className="text-lg">Clear Grid</a>
          <a href="#" onClick={handlePrint} className="text-lg">Print</a>
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
          <div className={`grid grid-cols-[60px_repeat(14,60px)] gap-1 w-fit ${gridLayout === "rowBased" ? "grid-row-based" : ""}`}>
            <div className="bg-blue-500 text-white p-2 font-bold">Grade</div>
            {subjects.map((subject, i) => (
              <div key={i} className="bg-blue-500 text-white p-2 text-center font-bold text-xs">
                {subject}
              </div>
            ))}

            {gridLayout === "stacked" ? (
              Object.keys(grid.stacked).map((gradeLevel) => (
                <React.Fragment key={gradeLevel}>
                  <div className={`p-2 font-semibold flex items-center text-sm grade-${gradeLevel.toLowerCase().replace(/\dth/, '')}`}>
                    {gradeLevel}
                  </div>
                  {grid.stacked[gradeLevel].map((gradeArray, col) => (
                    <div
                      key={col}
                      onMouseEnter={() => handleCellHover(gradeLevel, col)}
                      onMouseLeave={handleCellLeave}
                      className={`grid-cell p-1 border border-gray-300 cursor-pointer transition-colors relative grade-${gradeLevel.toLowerCase().replace(/\dth/, '')} flex items-center justify-center text-sm`}
                    >
                      {activeCell && activeCell.key === gradeLevel && activeCell.col === col ? (
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5 bg-[var(--cell-bg)] z-50 grade-selector">
                          {grades.map((g) => (
                            <div
                              key={g}
                              onClick={() => handleSelectGrade(gradeLevel, col, g)}
                              className="flex items-center justify-center text-[10px] hover:bg-[var(--cell-hover)] cursor-pointer"
                            >
                              {g}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grade-stack">
                          {gradeArray.map((grade, i) => (
                            <span key={i}>{grade || ""}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))
            ) : (
              rowBasedKeys.map((rowKey) => (
                <React.Fragment key={rowKey}>
                  <div className={`p-2 font-semibold flex items-center text-sm grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')}`}>
                    {rowKey}
                  </div>
                  {grid.rowBased[rowKey].map((grade, col) => (
                    <div
                      key={col}
                      onMouseEnter={() => handleCellHover(rowKey, col)}
                      onMouseLeave={handleCellLeave}
                      className={`grid-cell p-1 border border-gray-300 cursor-pointer transition-colors relative grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')} flex items-center justify-center text-sm`}
                    >
                      {activeCell && activeCell.key === rowKey && activeCell.col === col ? (
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5 bg-[var(--cell-bg)] z-50 grade-selector">
                          {grades.map((g) => (
                            <div
                              key={g}
                              onClick={() => handleSelectGrade(rowKey, col, g)}
                              className="flex items-center justify-center text-[10px] hover:bg-[var(--cell-hover)] cursor-pointer"
                            >
                              {g}
                            </div>
                          ))}
                        </div>
                      ) : (
                        grade || ""
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>Credits Needed to Graduate: {creditsNeeded.toFixed(2)}</p>
        <p>Total Credits: {totalCredits.toFixed(2)}</p>
        <p>GPA: {gpa}</p>
        <p>Data Source: <a href="https://www.schools.utah.gov/curr/graduationrequirements" target="_blank" rel="noopener noreferrer">Utah State Board of Education Graduation Requirements</a></p>
        <p className="note">Note: 'P' (Pass) and 'P+' grant credit but do not affect GPA.</p>
        <p className="copyright">© 2025 All Rights Reserved</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);