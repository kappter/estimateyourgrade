# Utah Quarter Credit Model GPA Calculator

## Purpose

The Utah Quarter Credit Model GPA Calculator is a web application designed to help high school students plan and track their academic progress toward graduation and college admission goals. Built with React, Tailwind CSS, and a custom Earth-style theme, the app allows users to assign letter grades to each quarter of their subjects across grades 9th to 12th, plus additional electives. It calculates total credits earned, credits needed to graduate, and the student’s GPA in real-time.

A key goal of this app is to answer critical questions about academic recovery, such as: **"If I get really bad grades in 9th grade, is it even possible to get a 3.5 GPA required by some colleges?"** By simulating different grade scenarios, students can explore whether they can recover from a poor start and still meet college GPA requirements.

The app supports two credit models:
- **24 Credits**: Standard Utah graduation requirement (e.g., 4 LA, 4 MA, 3 SC, etc.).
- **27 Credits**: Adds 3 more elective credits, totaling 5 electives.

## Features

- **Quarter Credit System**: Each subject per grade level is divided into 4 quarters (Q1–Q4), each worth 0.25 credits.
- **Interactive Grade Selection**: Hover over a cell to display a 4x4 grid of letter grades (A, A-, B+, etc.) and click to assign a grade.
- **Credit Toggle**: Switch between 24 and 27 credit requirements using a dropdown in the navigation bar.
- **Real-Time Calculations**: Displays total credits earned, credits needed to graduate, and GPA.
- **Themed Interface**: Earth-style theme with light and dark modes, inspired by natural colors (greens, browns, blues).
- **Grade-Level Coloring**: Visual distinction for each grade level (e.g., 9th grade in light red, 10th in light green).

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/utah-quarter-credit-gpa-calculator.git
   cd utah-quarter-credit-gpa-calculator
   ```

2. **Serve the Application**:
   Since this is a static web app, you can serve it using a simple HTTP server. For example, using Python:
   ```bash
   python -m http.server 8000
   ```
   Alternatively, you can open `index.html` directly in a browser, but some features may require a server due to CORS restrictions.

3. **Access the App**:
   Open your browser and navigate to `http://localhost:8000`.

## Usage Guide

1. **Select Credit Model**:
   - Use the dropdown in the navigation bar to choose between "24 Credits" or "27 Credits".
   - The 27-credit option adds 3 more elective credits (visible in the "Other" row).

2. **Assign Grades**:
   - The grid is organized by grade level (9th, 10th, 11th, 12th, Other) and subjects (LA, MA, SC, etc.).
   - Each subject has 4 columns (Q1–Q4), representing the quarters of the school year.
   - Hover over a cell to display a 4x4 grid of letter grades (A, A-, B+, etc.).
   - Click a grade to assign it to that quarter.

3. **Monitor Progress**:
   - The footer updates in real-time to show:
     - **Credits Needed to Graduate**: How many more credits you need to meet the selected credit requirement.
     - **Total Credits**: Sum of credits earned (0.25 per quarter with a grade).
     - **GPA**: Calculated based on a 4.0 scale (e.g., A = 4.0, A- = 3.7, B+ = 3.3, etc.).

4. **Clear the Grid**:
   - Click "Clear Grid" in the navigation bar to reset all grades.

5. **Toggle Theme**:
   - Click the "Dark Mode" or "Light Mode" button to switch between themes.

## Example: Can I Recover from Bad Grades in 9th Grade to Reach a 3.5 GPA?

Let’s explore the question: **"If I get really bad grades in 9th grade, is it even possible to get a 3.5 GPA required by some colleges?"**

### Scenario Setup
- **Credit Model**: 24 credits (standard Utah requirement).
- **9th Grade Performance**: Assume "really bad grades" means mostly D’s (1.0 GPA) across all subjects.
- **Subjects**: 12 subjects (LA, MA, SC, SS, GOV, Art, PE, CTE, HE, CT, FL, EL), each with 4 quarters.
- **Total Quarters in 9th Grade**: 12 subjects × 4 quarters = 48 quarters.
- **Remaining Years**: 10th, 11th, 12th, and "Other" (electives), each with 12 subjects × 4 quarters = 48 quarters, totaling 48 × 4 = 192 quarters.

### Step 1: 9th Grade Grades
- Assign D (1.0) to all 48 quarters in 9th grade.
- Total grade points from 9th grade: 48 quarters × 1.0 = 48 points.
- Credits earned: 48 quarters × 0.25 credits = 12 credits.

### Step 2: Calculate Required GPA for Remaining Years
- **Total Quarters Across All Years**: 48 (9th) + 192 (10th–Other) = 240 quarters.
- **Target GPA**: 3.5.
- **Total Grade Points Needed**: 3.5 × 240 quarters = 840 points.
- **Points Already Earned**: 48 points (from 9th grade).
- **Points Needed from Remaining Years**: 840 – 48 = 792 points.
- **Average GPA Needed for Remaining Quarters**: 792 points ÷ 192 quarters ≈ 4.125.

### Analysis
- An average GPA of 4.125 across 10th, 11th, 12th, and electives is not possible since the maximum GPA per quarter is 4.0 (an A).
- Let’s adjust the target to see what’s feasible. To achieve a 3.5 GPA overall, you’d need to maximize your grades in the remaining years.

### Step 3: Maximize Grades in Remaining Years
- Assign A (4.0) to all 192 quarters in 10th, 11th, 12th, and Other.
- Total grade points from remaining years: 192 quarters × 4.0 = 768 points.
- Total grade points overall: 48 (9th) + 768 (remaining) = 816 points.
- **Final GPA**: 816 points ÷ 240 quarters = 3.4.

### Conclusion
If you get D’s in all quarters of 9th grade, even getting straight A’s in all remaining quarters (10th through 12th and electives) results in a GPA of 3.4, which is just below the 3.5 target. This shows that recovering to a 3.5 GPA is extremely challenging but not impossible if you aim for a slightly lower target or if the college accepts a rounded GPA. For example:
- A mix of mostly A’s (4.0) and a few A-’s (3.7) might get you closer to 3.5.
- Using the 27-credit model (adding 3 more elective credits, or 12 quarters) gives more opportunities to earn high grades and slightly boosts your GPA.

### Try It Yourself
Use the app to experiment with different grade scenarios:
1. Set the credit model to "24 Credits".
2. Assign D’s to all quarters in 9th grade.
3. Try different grades (e.g., all A’s, or a mix of A’s and A-’s) for 10th, 11th, and 12th grades.
4. Check the GPA in the footer to see if you can reach 3.5.

## File Structure

- `index.html`: Entry point of the app, includes necessary scripts and links to styles.
- `styles.css`: Custom CSS with Earth-style theme, grid styling, and grade selector cluster effect.
- `app.js`: React application logic, including the grid, grade selection, credit toggle, and calculations.

## Contributing

Feel free to fork this repository and submit pull requests for improvements or bug fixes. For major changes, please open an issue first to discuss your ideas.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- Inspired by the [Utah 24 Credit Model](https://kappter.github.io/MrK/Test/mind/web_gpa_24/GPA_Web_02.pde).
- Built with React, Tailwind CSS, and a custom Earth-style theme.