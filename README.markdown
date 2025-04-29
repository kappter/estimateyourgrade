# Utah Quarter Credit Model GPA Calculator

Welcome to the **Utah Quarter Credit Model GPA Calculator**, a powerful web-based tool designed to help students, educators, and parents plan and predict academic outcomes based on Utah’s high school graduation requirements. Hosted at [kappter.github.io/estimateyourgrade](https://kappter.github.io/estimateyourgrade), this interactive application allows users to input grades, visualize credit progress, and calculate GPAs with precision, making it an essential resource for academic planning.

## Features

- **Dual Grid Layouts**:
  - **Stacked Grid**: Enter up to four 0.25-credit grades per subject per grade level (9th–12th, Other), ideal for tracking multiple courses in a single category (e.g., four English classes in 9th grade).
  - **Row-Based Grid**: Assign one grade per row (four rows per grade level, e.g., “9th-1” to “9th-4”), perfect for detailed, semester-by-semester planning.
  - Switch seamlessly between layouts to suit your planning style.

- **Flexible Credit Options**:
  - Supports two graduation pathways: **24-credit** and **27-credit**.
  - Tracks credits needed for:
    - Language Arts (LA): 4.0
    - Math (MA): 4.0
    - Science (SC): 3.0
    - Social Studies (SS): 3.0
    - Government (GOV): 2.0
    - Art: 1.0
    - Physical Education (PE): 1.0
    - Career and Technical Education (CTE): 1.0
    - Health Education (HE): 1.0
    - Financial Literacy (FL): 0.5
    - Electives (EL): 4.0 (for 24-credit path) or 7.0 (for 27-credit path)
  - **Note**: All credit requirements and per-grade contributions are in quarter credit increments (multiples of 0.25). Financial Literacy requires 0.5 credits, earned through two grades of 0.25 credits each. This model may differ from official Utah high school graduation requirements (e.g., Math: 4 vs. 3 credits) or specific school district policies. Users should verify with their school for exact graduation criteria.

- **Pass Grades (“P” and “P+”)**:
  - Includes “P” (Pass) and “P+” grades that grant 0.25 credits without affecting GPA, ideal for pass/fail courses.
  - Clear footer note: “Note: ‘P’ (Pass) and ‘P+’ grant credit but do not affect GPA.”

- **Real-Time GPA and Credit Calculations**:
  - Instantly calculates GPA (excluding “P” and “P+” grades), total credits earned, and credits needed to graduate.
  - Updates dynamically as grades are entered, providing immediate feedback.

- **Clear Cell Functionality**:
  - Reset individual cells using the “Clear” option in the grade selector, allowing easy corrections in both grid layouts.

- **Print Support**:
  - Generate a landscape-oriented, printer-friendly version of the grid (stacked or row-based) with grade-level colors, credits, and GPA.
  - Includes a timestamped footer for record-keeping (e.g., “Printed on: 04/29/2025, 07:21:00 AM”).

- **Earth-Themed Design with Dark Mode**:
  - Features an intuitive, Earth-inspired UI with light and dark mode toggle (🌙/☀️) for comfortable viewing.
  - Color-coded grade levels (e.g., 9th: light red, 10th: light green) enhance readability.

- **Responsive and Accessible**:
  - Built with React, Tailwind CSS, and custom CSS for a responsive layout that works on desktops, tablets, and mobile devices.
  - Hover-based grade selectors and clear navigation ensure ease of use.

## Benefits

- **Predict Future Outcomes**: Students can experiment with grade scenarios to see how current and future performance impacts GPA and graduation progress, fostering proactive planning.
- **Visualize Progress**: The dual grid layouts and real-time stats provide a clear visual representation of credits earned versus needed, helping users stay on track.
- **Support for Diverse Pathways**: The 24/27 credit options and pass grades accommodate varied academic plans, including pass/fail courses and elective-heavy schedules.
- **Empower Educators and Parents**: Teachers can use the tool to advise students, while parents can monitor progress and set realistic goals with their children.
- **Time-Saving and Accurate**: Automates complex GPA and credit calculations, reducing errors and freeing up time for strategic academic decisions.
- **Portable Records**: The print feature creates professional, shareable summaries for counseling sessions, college applications, or personal records.
- **Engaging and User-Friendly**: The Earth-themed design, dark mode, and intuitive controls make academic planning enjoyable and accessible to all users.

## Who It Helps

- **High School Students**: Plan courses, predict GPA, and ensure they meet Utah’s 24 or 27 credit requirements for graduation. Experiment with “what-if” scenarios to optimize academic performance.
- **Parents**: Gain insight into their child’s progress, set achievable goals, and collaborate with counselors to support graduation readiness.
- **Educators and Counselors**: Assist students in course selection, monitor credit accumulation, and provide data-driven advice using printed reports.
- **Homeschool Families**: Track credits and GPA for customized curricula, ensuring compliance with Utah’s graduation standards.
- **College-Bound Students**: Use accurate GPA calculations and credit summaries to strengthen applications and scholarship opportunities.

## Getting Started

1. **Access the App**:
   - Visit [kappter.github.io/estimateyourgrade](https://kappter.github.io/estimateyourgrade) to start using the calculator instantly.

2. **Clone the Repository** (for developers):
   ```bash
   git clone https://github.com/kappter/estimateyourgrade.git
   cd estimateyourgrade
   ```

3. **Run Locally**:
   - Open `index.html` in a browser (no server required for basic use).
   - For development, use a local server (e.g., `npx serve`) to avoid CORS issues with print functionality.

4. **Customize or Contribute**:
   - Edit `app.js` to modify grades, credit requirements, or logic.
   - Update `styles.css` for custom theming.
   - Submit pull requests or issues on [GitHub](https://github.com/kappter/estimateyourgrade).

## Project Structure

```
estimateyourgrade/
├── index.html        # Main HTML file
├── styles.css        # Custom CSS for styling
├── app.js            # React-based JavaScript logic
└── README.md         # This file
```

## Dependencies

- **React 18.2.0**: For dynamic UI components.
- **Tailwind CSS (CDN)**: For responsive styling.
- **Babel Standalone**: For in-browser JSX transformation.

*Note*: For production, consider installing Tailwind via npm and precompiling JSX with a build tool like Vite.

## Data Source

Credit requirements are based on the [Utah State Board of Education Graduation Requirements](https://www.schools.utah.gov/curr/graduationrequirements).

## Contributing

We welcome contributions! To get started:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

Please report bugs or suggest features via [GitHub Issues](https://github.com/kappter/estimateyourgrade/issues).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ by [kappter](https://github.com/kappter).
- Inspired by the need for accessible, predictive tools to empower Utah students.

---

Plan your academic future with confidence using the Utah Quarter Credit Model GPA Calculator!
