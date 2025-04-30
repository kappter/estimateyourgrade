const grades = [
  "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "P+", "Clear"
];

const gpaMap = {
  "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3,
  "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "D-": 0.7, "F": 0.0
};

const passingGrades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "P", "P+"];

const subjects = ["LA", "MA", "SC", "SS", "GOV", "Art", "PE", "CTE", "HE", "FL", "EL", "EL2", "DS"];

const subjectDescriptions = {
  "LA": "Language Arts",
  "MA": "Mathematics",
  "SC": "Science",
  "SS": "Social Studies",
  "GOV": "Government and Citizenship",
  "Art": "Fine Arts",
  "PE": "Physical Education",
  "CTE": "Career and Technical Education",
  "HE": "Health Education",
  "FL": "Financial Literacy",
  "EL": "Electives (1)",
  "EL2": "Electives (2)",
  "DS": "Digital Studies",
  "Earned/Req.": "Earned Credits / Required Credits",
  "Total Credits": "Total Credits Earned per Grade Level"
};

const requiredCredits24 = {
  "LA": 4.0, "MA": 3.0, "SC": 3.0, "SS": 2.5, "GOV": 0.5, "Art": 1.5, "PE": 1.5, "CTE": 1.0, "HE": 0.5, "FL": 0.5, "EL": 2.75, "EL2": 2.75, "DS": 0.5
};

const requiredCredits27 = {
  "LA": 4.0, "MA": 3.0, "SC": 3.0, "SS": 2.5, "GOV": 0.5, "Art": 1.5, "PE": 1.5, "CTE": 1.0, "HE": 0.5, "FL": 0.5, "EL": 4.25, "EL2": 4.25, "DS": 0.5
};

const creditValues = subjects.reduce((acc, subject) => {
  acc[subject] = 0.25;
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
    },
    transposed: subjects.reduce((acc, subject) => {
      acc[subject] = {
        "9th": ["", "", "", ""],
        "10th": ["", "", "", ""],
        "11th": ["", "", "", ""],
        "12th": ["", "", "", ""],
        "Other": ["", "", "", ""]
      };
      return acc;
    }, {})
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
    const newLayout = e.target.value;
    const newGrid = { ...grid };

    if (newLayout === "stacked" && gridLayout === "rowBased") {
      Object.keys(newGrid.stacked).forEach(level => {
        newGrid.stacked[level] = Array(subjects.length).fill().map(() => ["", "", "", ""]);
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      gradeLevels.forEach((level, levelIndex) => {
        const rows = [`${level}-1`, `${level}-2`, `${level}-3`, `${level}-4`];
        subjects.forEach((subject, col) => {
          let gradeIndex = 0;
          rows.forEach(row => {
            const grade = grid.rowBased[row][col];
            if (grade && gradeIndex < 4) {
              newGrid.stacked[level][col][gradeIndex] = grade;
              gradeIndex++;
            }
          });
        });
      });
    } else if (newLayout === "rowBased" && gridLayout === "stacked") {
      Object.keys(newGrid.rowBased).forEach(row => {
        newGrid.rowBased[row] = Array(subjects.length).fill("");
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      gradeLevels.forEach((level, levelIndex) => {
        const rows = [`${level}-1`, `${level}-2`, `${level}-3`, `${level}-4`];
        subjects.forEach((subject, col) => {
          const grades = grid.stacked[level][col];
          grades.forEach((grade, i) => {
            if (grade && i < 4) {
              newGrid.rowBased[rows[i]][col] = grade;
            }
          });
        });
      });
    } else if (newLayout === "transposed" && gridLayout === "stacked") {
      Object.keys(newGrid.transposed).forEach(subject => {
        newGrid.transposed[subject] = {
          "9th": ["", "", "", ""],
          "10th": ["", "", "", ""],
          "11th": ["", "", "", ""],
          "12th": ["", "", "", ""],
          "Other": ["", "", "", ""]
        };
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      subjects.forEach((subject, col) => {
        gradeLevels.forEach(level => {
          const grades = grid.stacked[level][col];
          newGrid.transposed[subject][level] = [...grades];
        });
      });
    } else if (newLayout === "transposed" && gridLayout === "rowBased") {
      Object.keys(newGrid.transposed).forEach(subject => {
        newGrid.transposed[subject] = {
          "9th": ["", "", "", ""],
          "10th": ["", "", "", ""],
          "11th": ["", "", "", ""],
          "12th": ["", "", "", ""],
          "Other": ["", "", "", ""]
        };
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      gradeLevels.forEach((level, levelIndex) => {
        const rows = [`${level}-1`, `${level}-2`, `${level}-3`, `${level}-4`];
        subjects.forEach((subject, col) => {
          let gradeIndex = 0;
          rows.forEach(row => {
            const grade = grid.rowBased[row][col];
            if (grade && gradeIndex < 4) {
              newGrid.transposed[subject][level][gradeIndex] = grade;
              gradeIndex++;
            }
          });
        });
      });
    } else if (newLayout === "stacked" && gridLayout === "transposed") {
      Object.keys(newGrid.stacked).forEach(level => {
        newGrid.stacked[level] = Array(subjects.length).fill().map(() => ["", "", "", ""]);
      });

      subjects.forEach((subject, col) => {
        const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
        gradeLevels.forEach(level => {
          newGrid.stacked[level][col] = [...grid.transposed[subject][level]];
        });
      });
    } else if (newLayout === "rowBased" && gridLayout === "transposed") {
      Object.keys(newGrid.rowBased).forEach(row => {
        newGrid.rowBased[row] = Array(subjects.length).fill("");
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      gradeLevels.forEach((level, levelIndex) => {
        const rows = [`${level}-1`, `${level}-2`, `${level}-3`, `${level}-4`];
        subjects.forEach((subject, col) => {
          const grades = grid.transposed[subject][level];
          grades.forEach((grade, i) => {
            if (grade && i < 4) {
              newGrid.rowBased[rows[i]][col] = grade;
            }
          });
        });
      });
    }

    setGrid(newGrid);
    setGridLayout(newLayout);
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
    } else if (gridLayout === "rowBased") {
      newGrid.rowBased[key][col] = grade === "Clear" ? "" : grade;
    } else if (gridLayout === "transposed") {
      if (grade === "Clear") {
        newGrid.transposed[key][col] = ["", "", "", ""];
      } else {
        const currentGrades = newGrid.transposed[key][col];
        const firstEmptyIndex = currentGrades.findIndex(g => !g);
        if (firstEmptyIndex !== -1) {
          currentGrades[firstEmptyIndex] = grade;
          newGrid.transposed[key][col] = [...currentGrades];
        }
      }
    }
    setGrid(newGrid);
    setActiveCell(null);
  };

  const handleFillGrid = (fillGrade) => {
    const newGrid = { ...grid };
    const requiredCredits = creditOption === "24" ? requiredCredits24 : requiredCredits27;
    const totalSlotsNeeded = creditOption === "24" ? 96 : 108;
    let slotsFilled = 0;

    if (gridLayout === "stacked") {
      Object.keys(newGrid.stacked).forEach(level => {
        newGrid.stacked[level] = Array(subjects.length).fill().map(() => ["", "", "", ""]);
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      subjects.forEach((subject, col) => {
        const slotsForSubject = (requiredCredits[subject] / 0.25);
        let slotsToFill = slotsForSubject;
        let currentLevelIndex = 0;

        while (slotsToFill > 0 && currentLevelIndex < gradeLevels.length) {
          const level = gradeLevels[currentLevelIndex];
          const currentGrades = newGrid.stacked[level][col];
          const emptySlots = currentGrades.filter(g => !g).length;
          const slotsToAdd = Math.min(emptySlots, slotsToFill);

          for (let i = 0; i < slotsToAdd; i++) {
            const firstEmptyIndex = currentGrades.findIndex(g => !g);
            if (firstEmptyIndex !== -1) {
              currentGrades[firstEmptyIndex] = fillGrade;
              slotsFilled++;
            }
          }

          newGrid.stacked[level][col] = [...currentGrades];
          slotsToFill -= slotsToAdd;
          currentLevelIndex++;
        }
      });
    } else if (gridLayout === "rowBased") {
      Object.keys(newGrid.rowBased).forEach(row => {
        newGrid.rowBased[row] = Array(subjects.length).fill("");
      });

      const rowKeys = Object.keys(newGrid.rowBased);
      let currentRowIndex = 0;
      let currentCol = 0;

      while (slotsFilled < totalSlotsNeeded && currentRowIndex < rowKeys.length) {
        const rowKey = rowKeys[currentRowIndex];
        const subject = subjects[currentCol];
        const slotsForSubject = (requiredCredits[subject] / 0.25);
        const earnedSlots = Object.values(newGrid.rowBased).reduce((sum, row) => sum + (row[currentCol] ? 1 : 0), 0);

        if (earnedSlots < slotsForSubject) {
          newGrid.rowBased[rowKey][currentCol] = fillGrade;
          slotsFilled++;
        }

        currentCol++;
        if (currentCol >= subjects.length) {
          currentCol = 0;
          currentRowIndex++;
        }
      }
    } else if (gridLayout === "transposed") {
      Object.keys(newGrid.transposed).forEach(subject => {
        newGrid.transposed[subject] = {
          "9th": ["", "", "", ""],
          "10th": ["", "", "", ""],
          "11th": ["", "", "", ""],
          "12th": ["", "", "", ""],
          "Other": ["", "", "", ""]
        };
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      subjects.forEach(subject => {
        const slotsForSubject = (requiredCredits[subject] / 0.25);
        let slotsToFill = slotsForSubject;
        let currentLevelIndex = 0;

        while (slotsToFill > 0 && currentLevelIndex < gradeLevels.length) {
          const level = gradeLevels[currentLevelIndex];
          const currentGrades = newGrid.transposed[subject][level];
          const emptySlots = currentGrades.filter(g => !g).length;
          const slotsToAdd = Math.min(emptySlots, slotsToFill);

          for (let i = 0; i < slotsToAdd; i++) {
            const firstEmptyIndex = currentGrades.findIndex(g => !g);
            if (firstEmptyIndex !== -1) {
              currentGrades[firstEmptyIndex] = fillGrade;
              slotsFilled++;
            }
          }

          newGrid.transposed[subject][level] = [...currentGrades];
          slotsToFill -= slotsToAdd;
          currentLevelIndex++;
        }
      });
    }

    setGrid(newGrid);
  };

  const handleFillRandom = () => {
    const newGrid = { ...grid };
    const requiredCredits = creditOption === "24" ? requiredCredits24 : requiredCredits27;
    const totalSlotsNeeded = creditOption === "24" ? 96 : 108;
    let slotsFilled = 0;

    if (gridLayout === "stacked") {
      Object.keys(newGrid.stacked).forEach(level => {
        newGrid.stacked[level] = Array(subjects.length).fill().map(() => ["", "", "", ""]);
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      subjects.forEach((subject, col) => {
        const slotsForSubject = (requiredCredits[subject] / 0.25);
        let slotsToFill = slotsForSubject;
        let currentLevelIndex = 0;

        while (slotsToFill > 0 && currentLevelIndex < gradeLevels.length) {
          const level = gradeLevels[currentLevelIndex];
          const currentGrades = newGrid.stacked[level][col];
          const emptySlots = currentGrades.filter(g => !g).length;
          const slotsToAdd = Math.min(emptySlots, slotsToFill);

          for (let i = 0; i < slotsToAdd; i++) {
            const firstEmptyIndex = currentGrades.findIndex(g => !g);
            if (firstEmptyIndex !== -1) {
              const randomGrade = passingGrades[Math.floor(Math.random() * passingGrades.length)];
              currentGrades[firstEmptyIndex] = randomGrade;
              slotsFilled++;
            }
          }

          newGrid.stacked[level][col] = [...currentGrades];
          slotsToFill -= slotsToAddCOMP;
          currentLevelIndex++;
        }
      });
    } else if (gridLayout === "rowBased") {
      Object.keys(newGrid.rowBased).forEach(row => {
        newGrid.rowBased[row] = Array(subjects.length).fill("");
      });

      const rowKeys = Object.keys(newGrid.rowBased);
      let currentRowIndex = 0;
      let currentCol = 0;

      while (slotsFilled < totalSlotsNeeded && currentRowIndex < rowKeys.length) {
        const rowKey = rowKeys[currentRowIndex];
        const subject = subjects[currentCol];
        const slotsForSubject = (requiredCredits[subject] / 0.25);
        const earnedSlots = Object.values(newGrid.rowBased).reduce((sum, row) => sum + (row[currentCol] ? 1 : 0), 0);

        if (earnedSlots < slotsForSubject) {
          const randomGrade = passingGrades[Math.floor(Math.random() * passingGrades.length)];
          newGrid.rowBased[rowKey][currentCol] = randomGrade;
          slotsFilled++;
        }

        currentCol++;
        if (currentCol >= subjects.length) {
          currentCol = 0;
          currentRowIndex++;
        }
      }
    } else if (gridLayout === "transposed") {
      Object.keys(newGrid.transposed).forEach(subject => {
        newGrid.transposed[subject] = {
          "9th": ["", "", "", ""],
          "10th": ["", "", "", ""],
          "11th": ["", "", "", ""],
          "12th": ["", "", "", ""],
          "Other": ["", "", "", ""]
        };
      });

      const gradeLevels = ["9th", "10th", "11th", "12th", "Other"];
      subjects.forEach(subject => {
        const slotsForSubject = (requiredCredits[subject] / 0.25);
        let slotsToFill = slotsForSubject;
        let currentLevelIndex = 0;

        while (slotsToFill > 0 && currentLevelIndex < gradeLevels.length) {
          const level = gradeLevels[currentLevelIndex];
          const currentGrades = newGrid.transposed[subject][level];
          const emptySlots = currentGrades.filter(g => !g).length;
          const slotsToAdd = Math.min(emptySlots, slotsToFill);

          for (let i = 0; i < slotsToAdd; i++) {
            const firstEmptyIndex = currentGrades.findIndex(g => !g);
            if (firstEmptyIndex !== -1) {
              const randomGrade = passingGrades[Math.floor(Math.random() * passingGrades.length)];
              currentGrades[firstEmptyIndex] = randomGrade;
              slotsFilled++;
            }
          }

          newGrid.transposed[subject][level] = [...currentGrades];
          slotsToFill -= slotsToAdd;
          currentLevelIndex++;
        }
      });
    }

    setGrid(newGrid);
  };

  const calculateStats = React.useCallback(() => {
    const requiredCredits = creditOption === "24" ? requiredCredits24 : requiredCredits27;
    const earnedCredits = {};
    let totalCredits = 0;
    let totalGPA = 0;
    let totalCourses = 0;

    if (gridLayout === "stacked") {
      for (const gradeLevel of Object.keys(grid.stacked)) {
        for (let col = 0; col < grid.stacked[gradeLevel].length; col++) {
          const gradeArray = grid.stacked[gradeLevel][col];
          for (const grade of gradeArray) {
            if (grade) {
              const subject = subjects[col];
              const creditValue = creditValues[subject];
              if (grade !== "F") {
                earnedCredits[subject] = (earnedCredits[subject] || 0) + creditValue;
                totalCredits += creditValue;
              }
              if (grade !== "P" && grade !== "P+") {
                totalGPA += gpaMap[grade] * creditValue;
                totalCourses += creditValue;
              }
            }
          }
        }
      }
    } else if (gridLayout === "rowBased") {
      for (const rowKey of Object.keys(grid.rowBased)) {
        for (let col = 0; col < grid.rowBased[rowKey].length; col++) {
          const grade = grid.rowBased[rowKey][col];
          if (grade) {
            const subject = subjects[col];
            const creditValue = creditValues[subject];
            if (grade !== "F") {
              earnedCredits[subject] = (earnedCredits[subject] || 0) + creditValue;
              totalCredits += creditValue;
            }
            if (grade !== "P" && grade !== "P+") {
              totalGPA += gpaMap[grade] * creditValue;
              totalCourses += creditValue;
            }
          }
        }
      }
    } else if (gridLayout === "transposed") {
      for (const subject of Object.keys(grid.transposed)) {
        for (const level of Object.keys(grid.transposed[subject])) {
          const gradeArray = grid.transposed[subject][level];
          for (const grade of gradeArray) {
            if (grade) {
              const creditValue = creditValues[subject];
              if (grade !== "F") {
                earnedCredits[subject] = (earnedCredits[subject] || 0) + creditValue;
                totalCredits += creditValue;
              }
              if (grade !== "P" && grade !== "P+") {
                totalGPA += gpaMap[grade] * creditValue;
                totalCourses += creditValue;
              }
            }
          }
        }
      }
    }

    let creditsNeeded = 0;
    Object.keys(requiredCredits).forEach((subject) => {
      const earned = earnedCredits[subject] || 0;
      const needed = requiredCredits[subject] - earned;
      if (needed > 0) creditsNeeded += needed;
    });

    const gpa = totalCourses > 0 ? Number((totalGPA / totalCourses).toFixed(3)) : 0;
    return { totalCredits, creditsNeeded, gpa, earnedCredits };
  }, [grid, creditOption, gridLayout]);

  const calculateTotalCreditsPerGradeLevel = (gradeLevel) => {
    let totalCredits = 0;
    if (gridLayout === "stacked") {
      const gradeArray = grid.stacked[gradeLevel];
      gradeArray.forEach(subjectGrades => {
        subjectGrades.forEach(grade => {
          if (grade && grade !== "F") {
            totalCredits += 0.25;
          }
        });
      });
    } else if (gridLayout === "rowBased") {
      const rows = [`${gradeLevel}-1`, `${gradeLevel}-2`, `${gradeLevel}-3`, `${gradeLevel}-4`];
      rows.forEach(rowKey => {
        const row = grid.rowBased[rowKey];
        row.forEach(grade => {
          if (grade && grade !== "F") {
            totalCredits += 0.25;
          }
        });
      });
    }
    return totalCredits.toFixed(2);
  };

  const { totalCredits, creditsNeeded, gpa, earnedCredits } = React.useMemo(() => calculateStats(), [calculateStats]);

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
          ${subjects.map(subject => `<div title="${subjectDescriptions[subject]}">${subject}</div>`).join('')}
          <div title="${subjectDescriptions["Earned/Req."]}">Earned/Req.</div>
          <div title="${subjectDescriptions["Total Credits"]}">Total Credits</div>
          ${subjects.map(subject => `
            <div class="${(earnedCredits[subject] || 0) >= (creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]) ? 'bg-green-200' : 'bg-gray-100'}">
              ${(earnedCredits[subject] || 0).toFixed(2)}/${(creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]).toFixed(2)}
            </div>
          `).join('')}
          <div class="bg-gray-200">-</div>
          ${Object.keys(grid.stacked).map(gradeLevel => `
            <div class="grade-${gradeLevel.toLowerCase().replace(/\dth/, '')}">${gradeLevel}</div>
            ${grid.stacked[gradeLevel].map(gradeArray => `
              <div class="grade-${gradeLevel.toLowerCase().replace(/\dth/, '')} grade-stack">
                ${gradeArray.map(grade => `<span>${grade || ""}</span>`).join('')}
              </div>
            `).join('')}
            <div class="grade-${gradeLevel.toLowerCase().replace(/\dth/, '')}">
              ${calculateTotalCreditsPerGradeLevel(gradeLevel)}
            </div>
          `).join('')}
        </div>
      `;
    } else if (gridLayout === "rowBased") {
      gridHtml = `
        <div class="grid">
          <div>Grade</div>
          ${subjects.map(subject => `<div title="${subjectDescriptions[subject]}">${subject}</div>`).join('')}
          <div title="${subjectDescriptions["Earned/Req."]}">Earned/Req.</div>
          <div title="${subjectDescriptions["Total Credits"]}">Total Credits</div>
          ${subjects.map(subject => `
            <div class="${(earnedCredits[subject] || 0) >= (creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]) ? 'bg-green-200' : 'bg-gray-100'}">
              ${(earnedCredits[subject] || 0).toFixed(2)}/${(creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]).toFixed(2)}
            </div>
          `).join('')}
          <div class="bg-gray-200">-</div>
          ${Object.keys(grid.rowBased).map(rowKey => `
            <div class="grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')}">${rowKey}</div>
            ${grid.rowBased[rowKey].map(grade => `
              <div class="grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')}">${grade || ""}</div>
            `).join('')}
            ${rowKey.endsWith('-1') ? `
              <div class="grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')}" style="grid-row: span 4;">
                ${calculateTotalCreditsPerGradeLevel(rowKey.split('-')[0])}
              </div>
            ` : ''}
          `).join('')}
        </div>
      `;
    } else if (gridLayout === "transposed") {
      gridHtml = `
        <div class="grid grid-transposed">
          <div>Subject</div>
          ${Object.keys(grid.transposed[subjects[0]]).map(level => `<div>${level}</div>`).join('')}
          <div title="${subjectDescriptions["Earned/Req."]}">Earned/Req.</div>
          ${Object.keys(grid.transposed[subjects[0]]).map((_, i) => `
            <div class="bg-gray-200">-</div>
          `).join('')}
          ${subjects.map(subject => `
            <div class="bg-blue-500 text-white p-2 text-center font-bold text-xs" title="${subjectDescriptions[subject]}">${subject}</div>
            ${Object.keys(grid.transposed[subject]).map(level => `
              <div class="grade-${level.toLowerCase().replace(/\dth/, '')} grade-stack">
                ${grid.transposed[subject][level].map(grade => `<span>${grade || ""}</span>`).join('')}
              </div>
            `).join('')}
            <div class="${(earnedCredits[subject] || 0) >= (creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]) ? 'bg-green-200' : 'bg-gray-100'}">
              ${(earnedCredits[subject] || 0).toFixed(2)}/${(creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]).toFixed(2)}
            </div>
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

  return React.createElement(
    'div',
    null,
    React.createElement(
      'nav',
      { className: 'navbar flex justify-center' },
      React.createElement(
        'div',
        { className: 'flex space-x-4' },
        React.createElement('a', { href: '#', className: 'text-lg' }, 'Home'),
        React.createElement(
          'select',
          { onChange: handleCreditChange, value: creditOption, className: 'text-lg' },
          React.createElement('option', { value: '24' }, '24 Credits'),
          React.createElement('option', { value: '27' }, '27 Credits')
        ),
        React.createElement(
          'select',
          { onChange: handleGridLayoutChange, value: gridLayout, className: 'text-lg' },
          React.createElement('option', { value: 'stacked' }, 'Stacked Grid'),
          React.createElement('option', { value: 'rowBased' }, 'Row-Based Grid'),
          React.createElement('option', { value: 'transposed' }, 'Transposed Grid')
        ),
        React.createElement(
          'a',
          {
            href: '#',
            onClick: () => {
              const newGrid = { ...grid };
              if (gridLayout === "stacked") {
                Object.keys(newGrid.stacked).forEach(level => {
                  newGrid.stacked[level] = Array(subjects.length).fill().map(() => ["", "", "", ""]);
                });
              } else if (gridLayout === "rowBased") {
                Object.keys(newGrid.rowBased).forEach(row => {
                  newGrid.rowBased[row] = Array(subjects.length).fill("");
                });
              } else if (gridLayout === "transposed") {
                Object.keys(newGrid.transposed).forEach(subject => {
                  newGrid.transposed[subject] = {
                    "9th": ["", "", "", ""],
                    "10th": ["", "", "", ""],
                    "11th": ["", "", "", ""],
                    "12th": ["", "", "", ""],
                    "Other": ["", "", "", ""]
                  };
                });
              }
              setGrid(newGrid);
            },
            className: 'text-lg'
          },
          'Clear Grid'
        ),
        React.createElement('a', { href: '#', onClick: handlePrint, className: 'text-lg' }, 'Print'),
        React.createElement(
          'a',
          { href: '#', onClick: toggleTheme, className: 'text-lg' },
          theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'
        )
      )
    ),
    React.createElement(
      'main',
      { className: 'container mx-auto p-4' },
      React.createElement(
        'h1',
        { className: 'text-3xl font-bold text-center text-blue-600 mb-4' },
        'Utah Quarter Credit Model GPA Calculator'
      ),
      React.createElement(
        'div',
        { className: 'flex justify-center mb-8' },
        React.createElement(
          'div',
          { className: `grid ${gridLayout === "rowBased" ? "grid-row-based" : gridLayout === "transposed" ? "grid-transposed" : ""} ${gridLayout === "transposed" ? "grid-cols-[60px_repeat(5,60px)]" : "grid-cols-[60px_repeat(" + (subjects.length) + ",60px)_100px_80px]"} gap-1 w-fit` },
          gridLayout === "transposed"
            ? [
                React.createElement('div', { className: 'bg-blue-500 text-white p-2 font-bold' }, 'Subject'),
                ...Object.keys(grid.transposed[subjects[0]]).map((level, i) =>
                  React.createElement(
                    'div',
                    { key: i, className: 'bg-blue-500 text-white p-2 text-center font-bold text-xs' },
                    level
                  )
                ),
                React.createElement('div', { className: 'bg-gray-200 p-2 font-bold text-xs earned-req-header', title: subjectDescriptions["Earned/Req."] }, 'Earned/Req.'),
                ...Object.keys(grid.transposed[subjects[0]]).map((_, i) =>
                  React.createElement(
                    'div',
                    { key: i, className: 'bg-gray-200 p-2 text-center text-xs' },
                    '-'
                  )
                ),
                ...subjects.flatMap(subject =>
                  [
                    React.createElement(
                      'div',
                      { className: 'bg-blue-500 text-white p-2 text-center font-bold text-xs', title: subjectDescriptions[subject] },
                      subject
                    ),
                    ...Object.keys(grid.transposed[subject]).map((level, col) =>
                      React.createElement(
                        'div',
                        {
                          key: col,
                          onMouseEnter: () => handleCellHover(subject, level),
                          onMouseLeave: handleCellLeave,
                          className: `grid-cell p-1 border border-gray-300 cursor-pointer transition-colors relative grade-${level.toLowerCase().replace(/\dth/, '')} flex items-center justify-center text-sm`
                        },
                        activeCell && activeCell.key === subject && activeCell.col === level
                          ? React.createElement(
                              'div',
                              { className: 'absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5 bg-[var(--cell-bg)] z-50 grade-selector' },
                              grades.map(g =>
                                React.createElement(
                                  'div',
                                  {
                                    key: g,
                                    onClick: () => handleSelectGrade(subject, level, g),
                                    className: 'flex items-center justify-center text-[10px] hover:bg-[var(--cell-hover)] cursor-pointer'
                                  },
                                  g
                                )
                              )
                            )
                          : React.createElement(
                              'div',
                              { className: 'grade-stack' },
                              grid.transposed[subject][level].map((grade, i) =>
                                React.createElement('span', { key: i }, grade || "")
                              )
                            )
                      )
                    ),
                    React.createElement(
                      'div',
                      {
                        className: `p-2 text-center text-xs ${(earnedCredits[subject] || 0) >= (creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]) ? 'bg-green-200' : 'bg-gray-100'}`
                      },
                      `${(earnedCredits[subject] || 0).toFixed(2)}/${(creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]).toFixed(2)}`
                    )
                  ]
                )
              ]
            : [
                React.createElement('div', { className: 'bg-blue-500 text-white p-2 font-bold' }, 'Grade'),
                ...subjects.map((subject, i) =>
                  React.createElement(
                    'div',
                    { key: i, className: 'bg-blue-500 text-white p-2 text-center font-bold text-xs', title: subjectDescriptions[subject] },
                    subject
                  )
                ),
                React.createElement('div', { className: 'bg-gray-200 p-2 font-bold text-xs earned-req-header', title: subjectDescriptions["Earned/Req."] }, 'Earned/Req.'),
                React.createElement('div', { className: 'bg-gray-200 p-2 font-bold text-xs total-credits-header', title: subjectDescriptions["Total Credits"] }, 'Total Credits'),
                ...subjects.map((subject, i) =>
                  React.createElement(
                    'div',
                    {
                      key: i,
                      className: `p-2 text-center text-xs ${(earnedCredits[subject] || 0) >= (creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]) ? 'bg-green-200' : 'bg-gray-100'}`
                    },
                    `${(earnedCredits[subject] || 0).toFixed(2)}/${(creditOption === "24" ? requiredCredits24[subject] : requiredCredits27[subject]).toFixed(2)}`
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'bg-gray-200 p-2 text-center text-xs' },
                  '-'
                ),
                ...(gridLayout === "stacked"
                  ? Object.keys(grid.stacked).map(gradeLevel => {
                      console.log(`Rendering stacked mode for ${gradeLevel}:`, grid.stacked[gradeLevel]);
                      return React.createElement(
                        React.Fragment,
                        { key: gradeLevel },
                        React.createElement(
                          'div',
                          { className: `p-2 font-semibold flex items-center text-sm grade-${gradeLevel.toLowerCase().replace(/\dth/, '')}` },
                          gradeLevel
                        ),
                        grid.stacked[gradeLevel].map((gradeArray, col) =>
                          React.createElement(
                            'div',
                            {
                              key: col,
                              onMouseEnter: () => handleCellHover(gradeLevel, col),
                              onMouseLeave: handleCellLeave,
                              className: `grid-cell p-1 border border-gray-300 cursor-pointer transition-colors relative grade-${gradeLevel.toLowerCase().replace(/\dth/, '')} flex items-center justify-center text-sm`
                            },
                            activeCell && activeCell.key === gradeLevel && activeCell.col === col
                              ? React.createElement(
                                  'div',
                                  { className: 'absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5 bg-[var(--cell-bg)] z-50 grade-selector' },
                                  grades.map(g =>
                                    React.createElement(
                                      'div',
                                      {
                                        key: g,
                                        onClick: () => handleSelectGrade(gradeLevel, col, g),
                                        className: 'flex items-center justify-center text-[10px] hover:bg-[var(--cell-hover)] cursor-pointer'
                                      },
                                      g
                                    )
                                  )
                                )
                              : React.createElement(
                                  'div',
                                  { className: 'grade-stack' },
                                  gradeArray.map((grade, i) =>
                                    React.createElement('span', { key: i }, grade || "")
                                  )
                                )
                          )
                        ),
                        React.createElement(
                          'div',
                          { className: `p-2 text-center text-sm grade-${gradeLevel.toLowerCase().replace(/\dth/, '')}` },
                          calculateTotalCreditsPerGradeLevel(gradeLevel)
                        )
                      );
                    })
                  : rowBasedKeys.map(rowKey => {
                      console.log(`Rendering row-based mode for ${rowKey}:`, grid.rowBased[rowKey]);
                      return React.createElement(
                        React.Fragment,
                        { key: rowKey },
                        React.createElement(
                          'div',
                          { className: `p-2 font-semibold flex items-center text-sm grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')}` },
                          rowKey
                        ),
                        grid.rowBased[rowKey].map((grade, col) =>
                          React.createElement(
                            'div',
                            {
                              key: col,
                              onMouseEnter: () => handleCellHover(rowKey, col),
                              onMouseLeave: handleCellLeave,
                              className: `grid-cell p-1 border border-gray-300 cursor-pointer transition-colors relative grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')} flex items-center justify-center text-sm`,
                              'data-grade': grade || ""
                            },
                            activeCell && activeCell.key === rowKey && activeCell.col === col
                              ? React.createElement(
                                  'div',
                                  { className: 'absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5 bg-[var(--cell-bg)] z-50 grade-selector' },
                                  grades.map(g =>
                                    React.createElement(
                                      'div',
                                      {
                                        key: g,
                                        onClick: () => handleSelectGrade(rowKey, col, g),
                                        className: 'flex items-center justify-center text-[10px] hover:bg-[var(--cell-hover)] cursor-pointer'
                                      },
                                      g
                                    )
                                  )
                                )
                              : null
                          )
                        ),
                        rowKey.endsWith('-1')
                          ? React.createElement(
                              'div',
                              {
                                className: `p-2 text-center text-sm grade-${rowKey.split('-')[0].toLowerCase().replace(/\dth/, '')}`,
                                style: { gridRow: 'span 4' }
                              },
                              calculateTotalCreditsPerGradeLevel(rowKey.split('-')[0])
                            )
                          : null
                      );
                    })
                )
              ]
        )
      ),
      React.createElement(
        'div',
        { className: 'flex justify-center mb-4' },
        React.createElement(
          'div',
          { className: 'flex space-x-2' },
          ['A', 'B', 'C', 'D', 'F'].map(grade =>
            React.createElement(
              'button',
              {
                key: grade,
                onClick: () => handleFillGrid(grade),
                className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'
              },
              `Fill with ${grade}`
            )
          ),
          React.createElement(
            'button',
            {
              onClick: handleFillRandom,
              className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'
            },
            'Fill with Random'
          )
        )
      )
    ),
    React.createElement(
      'footer',
      { className: 'footer' },
      React.createElement('p', null, `Credits Needed to Graduate: ${creditsNeeded.toFixed(2)}`),
      React.createElement('p', null, `Total Credits: ${totalCredits.toFixed(2)}`),
      React.createElement('p', null, `GPA: ${gpa}`),
      React.createElement(
        'p',
        null,
        'Data Source: ',
        React.createElement(
          'a',
          { href: 'https://www.schools.utah.gov/curr/graduationrequirements', target: '_blank', rel: 'noopener noreferrer' },
          'Utah State Board of Education Graduation Requirements'
        )
      ),
      React.createElement(
        'p',
        { className: 'note' },
        "Note: 'P' (Pass) and 'P+' grant credit but do not affect GPA. 'F' affects GPA but does not grant credit."
      ),
      React.createElement('p', { className: 'copyright' }, '© 2025 All Rights Reserved')
    )
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));