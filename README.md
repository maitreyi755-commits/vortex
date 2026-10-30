# vortex💸 Split&Settle
Fair, fast, and friendly expense sharing.
Built for the Hack Day Haldia x GRID community 6-hour build challenge.

🚀 Live Demo
[Insert your GitHub Pages Live Link Here]

📖 Overview
Friends share trips, flats, and events, but keeping track of who paid what can get messy. Split&Settle is a smart expense tracker that records expenses and uses a Debt Simplification Algorithm to tell everyone exactly who owes whom with the absolute minimum number of transactions.

Initially scoped for Flask/SQLite, this project was refactored into a 100% Client-Side Application (HTML/CSS/JS) to ensure seamless deployment via GitHub Pages and instant, zero-latency calculations directly in the browser.

✨ Key Features
Animated Splash Screen: A vibrant, engaging landing page.

Group & Budget Tracker: Set a trip budget and track spending with a live, color-coded progress bar.

Member Management: Add up to 20 members along with their UPI IDs.

Expense & History Dashboard: Log expenses, view a chronological history of who paid for what, and delete past entries (which instantly recalculates balances).

Smart Debt Simplification: Automatically calculates the minimum number of transactions required to settle all debts.

Smart UPI Payments (Bonus Task Achieved):

Select exactly who to pay and how much (supporting partial payments).

Auto-generates a scannable UPI QR Code.

One-click "Pay in UPI App" integration.

🛠️ Tech Stack
Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)

Fonts: Google Fonts (Poppins)

APIs: QR Server API (for real-time UPI QR code generation)

Deployment: GitHub Pages

💻 How to Run Locally
Since this app runs entirely in the browser, no backend server or database installation is required!

Clone the repository:

Bash
git clone https://github.com/Voyage-Hackathon/team-vortex.git
Navigate to the project folder:

Bash
cd team-vortex
Open index.html in any modern web browser (Chrome, Firefox, Safari, Edge).(Optional: Use VS Code's "Live Server" extension for a better development experience).

🎯 Hackathon Checklist Status
[x] Groups with members & expense tracking

[x] Equal split validation and calculation

[x] Net balance per member

[x] Minimum set of settle-up payments (Greedy Algorithm)

[x] Edit/delete expenses with dynamic balance updates

[x] Bonus: UPI payment link and QR generation for each settlement

[x] Bonus: Budget/Category spending visualizer (Progress Bar)

[x] Deployed and live link generated
