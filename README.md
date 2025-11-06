# ₦ Personal Finance Tracker

A responsive, client-side application developed in Vanilla JavaScript for tracking personal income and expenses, leveraging browser local storage for data persistence. The application is localized to use the **Nigerian Naira (₦)** currency.

## Features

This application allows users to manage their personal finances through a simple and intuitive interface.

### Core Features

  * **Transaction Input:** Users can record new transactions (Income or Expense) with fields for **Amount (₦)**, **Date**, **Category**, and **Notes**.
  * **Data Persistence:** All income and expense records are stored securely in the user's browser using **`localStorage`**, ensuring data is retained across sessions.
  * **Detailed Categorization:** Transactions are categorized, and the application supports **custom category creation** by the user.
  * **Financial Summary:** A real-time display of the **Current Balance**, Total Income, and Total Expense.
  * **Responsive Design:** The layout is fully responsive, ensuring optimal usability on desktop, tablet, and mobile devices.

### Optional (Plus) Features

  * **Visual Data Display:** Integrated **Chart.js** to visually compare total income against total expenses in a simple bar chart.
  * **Transaction Management:** Transactions can be **filtered** by category and **sorted** by date (Newest/Oldest) and amount (Highest).
  * **CSV Export:** Users can export all recorded financial data into a standard **CSV file** for external analysis.

-----

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Vanilla JavaScript (ES6+)** | Core application logic and DOM manipulation. |
| **HTML5 & CSS3** | Structure and responsive styling (Flexbox/Grid). |
| **`localStorage`** | Data Persistence (local browser storage). |
| **Chart.js** | Visual data display (Bar Chart). |

-----

## Setup and Installation

Since this is a client-side application with no backend dependencies, setup is straightforward.

### Local Development

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/9jawap/personal-finance-tracker.git
    cd personal-finance-tracker
    ```
2.  **Open in Browser:** Simply open the `index.html` file in your web browser.
    ```bash
    # Open index.html directly
    ```

### CPanel / Hosting Deployment

The entire application consists of just three files (`index.html`, `style.css`, `script.js`).

1.  **Compress:** Create a ZIP file containing the three core files.
2.  **Upload:** Use the **File Manager** in your cPanel dashboard to upload the ZIP file into the target directory (e.g., `public_html`).
3.  **Extract:** Right-click the ZIP file in cPanel and select **Extract** to deploy the files.

-----

## How to Use the App

1.  **Adding a Transaction:**
      * Use the **"Add New Transaction"** form.
      * Select the **Type** (Income or Expense).
      * Select or create a **Category**. If you choose "Add New Category...", a prompt will appear.
      * Enter the **Amount** and **Date**.
      * Click **"Add Transaction"**.
2.  **Viewing Data:**
      * The **Current Balance** section updates instantly.
      * The **Chart** section provides a visual overview of Income vs. Expense.
3.  **Managing History:**
      * Use the **"Filter by Category"** and **"Sort by Date/Amount"** dropdowns above the transaction list to manage the view.
      * Click the **'x'** button next to any transaction to permanently delete it.
4.  **Exporting Data:**
      * Click the **"Export to CSV"** button to download all transaction data for external record-keeping.
