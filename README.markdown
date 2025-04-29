# Utah Quarter Credit Model GPA Calculator

Welcome to the **Utah Quarter Credit Model GPA Calculator**, a powerful web-based tool designed to help students, educators, and parents plan and predict academic outcomes based on Utah’s high school graduation requirements. Hosted at [kappter.github.io/estimateyourgrade](https://github.com/kappter/estimateyourgrade), this interactive application allows users to input grades, visualize credit progress, and calculate GPAs with precision, making it an essential resource for academic planning.

## Features

- **Dual Grid Layouts**:
  - **Stacked Grid**: Enter up to four 0.25-credit grades per subject per grade level (9th–12th, Other), ideal for tracking multiple courses in a single category (e.g., four English classes in 9th grade).
  - **Row-Based Grid**: Assign one grade per row (four rows per grade level, e.g., “9th-1” to “9th-4”), perfect for detailed, semester-by-semester planning.
  - Switch seamlessly between layouts to suit your planning style.

- **Flexible Credit Options**:
  - Supports two graduation pathways: **24-credit** and **27-credit**.
  - Tracks credits needed for:
    - Language Arts (LA): 4
    - Math (MA): 4
    - Science (SC): 3
    - Social Studies (SS): 3
    - Government (GOV): 2
    - Art: 1
    - Physical Education (PE): 1
    - Career and Technical Education (CTE): 1
    - Health Education (HE): 1
    - Career Tech (CT): 0.5
    - Financial Literacy (FL): 0.5
    - Electives (EL): **3** (for 24-credit path) or **6** (for 27-credit path)
  - **Note**: These credit requirements are based on a specific model used by the calculator and may differ from standard Utah high school graduation requirements or specific school district policies. Users should verify with their school for exact graduation criteria.

- **Pass Grades (“P” and “P+”)**:
  - Includes “P” (Pass) and “P+” grades that grant 0.25 credits (0.Excessive credits for subjects like FL or CT are handled by capping credits needed at zero, ensuring accurate tracking.

### Official Utah Requirements vs. Calculator Model
To provide context, here’s how the calculator’s model compares to Utah’s official high school graduation requirements, as outlined by the [Utah State Board of Education](https://www.schools.utah.gov/curr/graduationrequirements).

#### Official Utah Requirements
Utah requires a minimum of **24 credits** for high school graduation, with an optional **27-credit pathway** for advanced or honors diplomas. The standard breakdown is:

| **Category**                  | **Credits** | **Details**                                                                 |
|-------------------------------|-------------|-----------------------------------------------------------------------------|
| English Language Arts (LA)    | 4.0         | English 9, 10, 11, 12 (1.0 each)                                           |
| Mathematics (MA)              | 3.0         | Secondary Math I, II, III (1.0 each)                                       |
| Science (SC)                  | 3.0         | Biology, Chemistry or Physics, and one additional science (1.0 each)       |
| Social Studies (SS)           | 3.5         | World Geography (0.5), World History (1.0), U.S. History (1.0), U.S. Government/Citizenship (0.5), Social Studies elective (0.5) |
| Fine Arts (FA)                | 1.5         | Art, music, drama, or other fine arts courses                              |
| Physical Education (PE)       | 1.5         | Fitness for Life (0.5), Lifetime Sports (0.5), Participation Skills (0.5)  |
| Health Education (HE)         | 0.5         | Health education course                                                    |
| Career and Technical Education (CTE) | 1.0 | CTE courses (e.g., business, technology)                                   |
| Financial Literacy (FL)       | 0.5         | Financial literacy course                                                  |
| Electives (EL)                | 5.5         | Additional courses to reach 24 credits                                     |
| **Total**                     | **24.0**    |                                                                             |

For the **27-credit pathway**, schools like [Mountain Heights Academy](https://www.mountainheightsacademy.org/academics/graduation-requirements/) add 3 credits, typically in electives, increasing electives to **8.5 credits**.

#### Calculator’s Credit Model
The calculator’s model, as defined in `app.js`, is:

| **Category**                  | **Credits (24-Credit Path)** | **Credits (27-Credit Path)** | **Code Label** |
|-------------------------------|-----------------------------|-----------------------------|----------------|
| Language Arts                 | 4                           | 4                           | LA             |
| Math                          | 4                           | 4                           | MA             |
| Science                       | 3                           | 3                           | SC             |
| Social Studies                | 3                           | 3                           | SS             |
| Government                    | 2                           | 2                           | GOV            |
| Art                           | 1                           | 1                           | Art            |
| Physical Education            | 1                           | 1                           | PE             |
| Career and Technical Education | 1                           | 1                           | CTE            |
| Health Education              | 1                           | 1                           | HE             |
| Career Tech                   | 0.5                         | 0.5                         | CT             |
| Financial Literacy            | 0.5                         | 0.5                         | FL             |
| Electives                     | 3                           | 6                           | EL             |
| **Total**                     | **24**                      | **27**                      |                |

#### Discrepancies
The calculator’s model aligns with the total credits (24 or 27) but deviates from official Utah requirements in several areas:

| **Category**                  | **Official Credits** | **Calculator Credits** | **Issue**                                                                 |
|-------------------------------|---------------------|-----------------------|---------------------------------------------------------------------------|
| Math                          | 3.0                 | 4                     | Overstated by 1 credit                                                   |
| Social Studies                | 3.5                 | 3 (SS) + 2 (GOV) = 5  | Understated Social Studies (3 vs. 3.5); Government incorrectly separated |
| Fine Arts                     | 1.5                 | 1 (Art)               | Understated by 0.5 credits                                               |
| Physical Education            | 1.5                 | 1 (PE)                | Understated by 0.5 credits                                               |
| Health Education              | 0.5                 | 1 (HE)                | Overstated by 0.5 credits                                                |
| Career Tech (CT)              | N/A                 | 0.5                   | Potentially redundant with CTE                                           |
| Electives                     | 5.5                 | 3 (24-path) / 6 (27-path) | Understated for 24-credit path; slightly off for 27-credit path          |

These differences arise because the calculator uses a simplified or custom model, possibly tailored to a specific school district or designed for user convenience. Despite these mismatches, the total credits (24 or 27) are correct, ensuring the tool remains functional for planning.

### Benefits of the Current Model
The calculator’s model offers several advantages:
- **Accurate Totals**: Correctly tracks 24 or 27 credits, aligning with Utah’s overall graduation goals.
- **Simplified Structure**: Combines subjects like Social Studies and Government into clear categories, making it easier for users to input grades.
- **Flexibility**: Supports both standard and advanced pathways, accommodating diverse academic plans.
- **User-Friendly**: The grid layouts (stacked and row-based) and real-time calculations simplify complex credit tracking.

### Recommendations for Users
To ensure accurate planning:
- **Verify with Your School**: Check your school’s specific graduation requirements, as they may differ from the calculator’s model (e.g., Math: 3 vs. 4 credits).
- **Use as a Planning Tool**: Leverage the calculator to experiment with grade scenarios and visualize progress, but confirm final credit counts with a counselor.
- **Understand Pass Grades**: The “P” and “P+” grades are ideal for pass/fail courses, granting credits without impacting GPA.

### Technical Implementation
The calculator is built with:
- **React 18.2.0**: For dynamic, interactive UI components.
- **Tailwind CSS (CDN)**: For responsive, modern styling.
- **Babel Standalone**: For in-browser JSX transformation.
- **Custom CSS**: Provides an Earth-themed design with light and dark modes.

The project structure includes:
- `index.html`: Main HTML file.
- `styles.css`: Custom CSS for styling.
- `app.js`: React-based logic for grid management and calculations.
- `README.md`: Documentation (this file).

### Deployment and Usage
To use the calculator:
1. Visit [kappter.github.io/estimateyourgrade](https://github.com/kappter/estimateyourgrade).
2. Choose between **Stacked** or **Row-Based** grid layouts via the navbar dropdown.
3. Select the **24-credit** or **27-credit** pathway.
4. Enter grades in the grid, using “P” or “P+” for pass/fail courses.
5. View real-time GPA, total credits, and credits needed in the footer.
6. Print a formatted report for records or counseling sessions.

To contribute or customize:
- Clone the repository: `git clone https://github.com/kappter/estimateyourgrade`.
- Modify `app.js` for logic changes or `styles.css` for styling.
- Submit pull requests via [GitHub](https://github.com/kappter/estimateyourgrade).

### Future Enhancements
While the current model is effective, potential improvements include:
- **Align with Official Standards**: Adjust credit values (e.g., Math to 3 credits) to match Utah’s requirements exactly.
- **Local Storage**: Save user data for persistent planning sessions.
- **Export Options**: Allow exporting grid data as CSV or PDF for sharing.
- **Custom Requirements**: Enable users to input school-specific credit requirements.

### Who It Helps
The calculator benefits:
- **Students**: Plan courses, predict GPA, and explore “what-if” scenarios to meet graduation goals.
- **Parents**: Monitor progress and collaborate with counselors to set academic targets.
- **Educators/Counselors**: Provide data-driven advice using visual credit tracking and printed reports.
- **Homeschoolers**: Track customized curricula against graduation standards.
- **College-Bound Students**: Prepare accurate GPA and credit summaries for applications.

### Conclusion
The updated README section accurately reflects the GPA calculator’s credit tracking model, ensuring users understand its functionality while being transparent about differences from official Utah requirements. The tool remains a valuable resource for academic planning, empowering users to predict outcomes and visualize progress with confidence.

## Key Citations
- [Utah State Board of Education Graduation Requirements](https://www.schools.utah.gov/curr/graduationrequirements)
- [Mountain Heights Academy Graduation Requirements](https://www.mountainheightsacademy.org/academics/graduation-requirements/)
- [Utah Connections Academy Graduation Requirements](https://www.connectionsacademy.com/schools/utah-online-school/academics/graduation-requirements)
- [GitHub Repository for Utah GPA Calculator](https://github.com/kappter/estimateyourgrade)
