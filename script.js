// --- Global State and Initialization ---
const STORAGE_KEY = 'web3bridgeFinanceTracker';

// Default categories - users can add custom ones
const CATEGORIES = {
    Income: ['Salary', 'Freelance', 'Investment'],
    Expense: ['Food & Drinks', 'Rent', 'Utilities', 'Transport']
};

let transactions = [];

// DOM Elements
const balanceDisplay = document.getElementById('balance-display');
const incomeDisplay = document.getElementById('income-display');
const expenseDisplay = document.getElementById('expense-display');
const list = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const categorySelect = document.getElementById('category');
const typeSelect = document.getElementById('type');
const filterCategorySelect = document.getElementById('filter-category');
const sortOrderSelect = document.getElementById('sort-order');
const exportCsvBtn = document.getElementById('export-csv-btn');

let balanceChart = null; // Will hold the Chart.js instance

// --- Helper Function: Currency Formatting for Naira ---
/** Formats a number as a Naira currency string. */
function formatCurrency(amount) {
    // Use Intl.NumberFormat for robust currency formatting (recommended)
    // 'en-NG' ensures the use of the ₦ symbol and standard formatting
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN' // Nigerian Naira currency code
    }).format(amount);
    
    // Fallback if Intl is not supported: return '₦' + amount.toFixed(2);
}

// --- Local Storage Functions ---

/** Loads transactions from LocalStorage */
function loadTransactions() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    transactions = storedData ? JSON.parse(storedData) : [];
}

/** Saves current transactions array to LocalStorage */
function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// --- Category Management ---

/** Populates the category dropdown based on the selected type (Income/Expense) */
function populateCategories() {
    const selectedType = typeSelect.value;
    categorySelect.innerHTML = ''; // Clear existing options

    // Add a custom option to create a new category 
    const customOption = document.createElement('option');
    customOption.value = 'Custom';
    customOption.textContent = 'Add New Category...';
    categorySelect.appendChild(customOption);

    // Add pre-defined categories
    CATEGORIES[selectedType].forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

/** Handles the logic for creating a new category */
function handleCategorySelection() {
    if (categorySelect.value === 'Custom') {
        const newCategory = prompt('Enter the name for the new category:');
        if (newCategory) {
            const type = typeSelect.value;
            // Simple logic to add it to our in-memory categories
            if (!CATEGORIES[type].includes(newCategory)) {
                CATEGORIES[type].push(newCategory);
            }
            // Re-populate and select the new category
            populateCategories();
            categorySelect.value = newCategory;
        } else {
            // Revert selection if user cancels
            categorySelect.value = CATEGORIES[typeSelect.value][0] || 'Custom';
        }
    }
}


// --- Core Transaction Logic ---

/** Calculates and updates Income, Expense, and Balance displays */
function updateValues() {
    const income = transactions
        .filter(t => t.type === 'Income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'Expense')
        .reduce((acc, t) => acc + t.amount, 0);
    
    const balance = income - Math.abs(expense); // Expense amounts are stored negative

    // Update DOM using the new formatCurrency helper
    balanceDisplay.textContent = formatCurrency(balance);
    incomeDisplay.textContent = formatCurrency(income);
    // Use Math.abs for the Expense display since we want a positive number here
    expenseDisplay.textContent = formatCurrency(Math.abs(expense)); 
    
    // Simple styling based on balance
    balanceDisplay.className = `amount ${balance >= 0 ? 'positive' : 'negative'}`;

    // Update the chart if it exists
    updateChart(income, Math.abs(expense));
}

/** Adds a transaction to the state and refreshes the UI */
function addTransaction(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    let category = document.getElementById('category').value;
    const type = document.getElementById('type').value;

    // A simple check if the Custom option was somehow selected but not handled
    if (category === 'Custom') {
        alert('Please enter a new category name or select an existing one.');
        return;
    }

    const transaction = {
        id: Date.now(), // Unique ID using timestamp
        type,
        category,
        amount: type === 'Expense' ? -amount : amount, // Store expenses as negative numbers for easy calculation
        date: document.getElementById('date').value,
        note: document.getElementById('note').value
    };

    transactions.push(transaction);
    saveTransactions();
    
    // Re-render
    init();

    // Clear form fields
    form.reset();
    populateCategories(); // Reset category dropdown
}

/** Deletes a transaction by ID */
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    init(); // Re-render the UI
}

// --- UI Rendering ---

/** Creates the HTML for a single transaction item */
function createTransactionElement(transaction) {
    const sign = transaction.amount < 0 ? 'expense' : 'income';
    const amountAbs = Math.abs(transaction.amount);

    const li = document.createElement('li');
    li.classList.add('transaction-item', sign);

    li.innerHTML = `
        <span class="type-icon">${transaction.type === 'Income' ? '➕' : '➖'}</span>
        <div class="transaction-details">
            <span class="category-name">${transaction.category}</span>
            <span class="transaction-note">${transaction.note || ''}</span>
            <span class="transaction-date">${transaction.date}</span>
        </div>
        <span class="amount-value">${formatCurrency(amountAbs)}</span>
        <button onclick="deleteTransaction(${transaction.id})" class="delete-btn">x</button>
    `;

    return li;
}

/** Renders the transaction list based on current filters/sorts */
function renderTransactionList() {
    list.innerHTML = ''; // Clear current list

    // 1. Filtering
    const filterCategory = filterCategorySelect.value;
    const filteredTransactions = transactions.filter(t => 
        filterCategory === 'all' || t.category === filterCategory
    );

    // 2. Sorting
    const sortOrder = sortOrderSelect.value;
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortOrder === 'oldest') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortOrder === 'amount-high') {
            // Sort by absolute value for a balanced view
            return Math.abs(b.amount) - Math.abs(a.amount);
        }
        return 0; // Should not happen
    });

    // 3. Rendering
    if (sortedTransactions.length === 0) {
        list.innerHTML = '<li class="no-transactions">No transactions recorded. Add one above!</li>';
    } else {
        sortedTransactions.forEach(t => list.appendChild(createTransactionElement(t)));
    }
}

/** Populates the filter dropdown with unique categories */
function populateFilterCategories() {
    const allCategories = [
        ...CATEGORIES.Income, 
        ...CATEGORIES.Expense, 
        ...transactions.map(t => t.category) // Include categories from existing transactions
    ];
    // Use a Set to get only unique categories
    const uniqueCategories = [...new Set(allCategories)].sort();

    filterCategorySelect.innerHTML = '<option value="all">Filter by Category (All)</option>';
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategorySelect.appendChild(option);
    });
}

// --- Chart.js (Optional Feature) ---

function updateChart(income, expense) {
    const ctx = document.getElementById('balance-chart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (balanceChart) {
        balanceChart.destroy();
    }

    balanceChart = new Chart(ctx, {
        type: 'bar', // Using bar chart for simple Income vs. Expense
        data: {
            labels: ['Total Income', 'Total Expense'],
            datasets: [{
                label: 'Amount (₦)', // Label changed to Naira
                data: [income, expense],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)', // Teal for Income
                    'rgba(255, 99, 132, 0.7)'  // Red for Expense
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// --- CSV Export (Optional Feature) ---

function exportToCsv() {
    if (transactions.length === 0) {
        alert("No data to export!");
        return;
    }

    const header = ['ID', 'Date', 'Type', 'Category', 'Amount (NGN)', 'Note']; // Header updated
    
    // Map transaction data to CSV rows
    const csvRows = transactions.map(t => [
        t.id,
        t.date,
        t.type,
        t.category,
        // Ensure the amount is just the number for CSV, not the symbol
        (t.type === 'Income' ? t.amount : t.amount).toFixed(2), 
        t.note.replace(/,/g, '') // Remove commas from notes to prevent CSV parsing issues
    ].join(','));

    // Combine header and rows
    const csvContent = [
        header.join(','),
        ...csvRows
    ].join('\n');

    // Create a Blob and link to download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Set file name and URL
    link.href = URL.createObjectURL(blob);
    link.download = `finance_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`; 
    
    // Trigger download and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- Initialization & Event Listeners ---

function init() {
    loadTransactions();
    populateCategories();
    populateFilterCategories();
    renderTransactionList();
    updateValues();
}

// Event Listeners
form.addEventListener('submit', addTransaction);
typeSelect.addEventListener('change', populateCategories);
categorySelect.addEventListener('change', handleCategorySelection);
filterCategorySelect.addEventListener('change', renderTransactionList);
sortOrderSelect.addEventListener('change', renderTransactionList);
exportCsvBtn.addEventListener('click', exportToCsv);

// Start the app!
init();
