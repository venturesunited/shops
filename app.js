// Application data
let appData = {
  agencies: [
    {
      id: 1,
      name: "Lott Agency",
      adAccounts: [
        {"id": "AA-1001", "balance": 1250, "dailyBurn": 180, "lastTopup": "2025-06-01", "topupAmount": 5000},
        {"id": "AA-1002", "balance": 890, "dailyBurn": 145, "lastTopup": "2025-06-03", "topupAmount": 3000}
      ]
    },
    {
      id: 2,
      name: "Diamond Agency", 
      adAccounts: [
        {"id": "AA-2001", "balance": 3200, "dailyBurn": 420, "lastTopup": "2025-06-04", "topupAmount": 8000}
      ]
    },
    {
      id: 3,
      name: "Aurora Agency",
      adAccounts: [
        {"id": "AA-3001", "balance": 560, "dailyBurn": 210, "lastTopup": "2025-05-30", "topupAmount": 4000}
      ]
    },
    {
      id: 4,
      name: "Luna Agency",
      adAccounts: [
        {"id": "AA-4001", "balance": 2100, "dailyBurn": 380, "lastTopup": "2025-06-02", "topupAmount": 6000}
      ]
    }
  ],
  webshops: [
    {
      name: "Vanhouten SP",
      dailyData: [
        {"date": "2025-06-05", "adSpend": 1200, "revenue": 4800, "orders": 48, "cogs": 1440, "projectedProfit": 2160, "actualPayout": 0, "payoutDate": "2025-06-08", "bankAccount": "ING NL"},
        {"date": "2025-06-04", "adSpend": 1100, "revenue": 4400, "orders": 44, "cogs": 1320, "projectedProfit": 1980, "actualPayout": 1950, "payoutDate": "2025-06-07", "bankAccount": "ING NL"},
        {"date": "2025-06-03", "adSpend": 980, "revenue": 3920, "orders": 39, "cogs": 1176, "projectedProfit": 1764, "actualPayout": 1740, "payoutDate": "2025-06-06", "bankAccount": "Rabobank"}
      ]
    },
    {
      name: "Koophoek SP",
      dailyData: [
        {"date": "2025-06-05", "adSpend": 800, "revenue": 3200, "orders": 32, "cogs": 960, "projectedProfit": 1440, "actualPayout": 0, "payoutDate": "2025-06-09", "bankAccount": "ABN AMRO"},
        {"date": "2025-06-04", "adSpend": 750, "revenue": 3000, "orders": 30, "cogs": 900, "projectedProfit": 1350, "actualPayout": 1320, "payoutDate": "2025-06-08", "bankAccount": "ING NL"}
      ]
    },
    {
      name: "Vermeeren SP", 
      dailyData: [
        {"date": "2025-06-05", "adSpend": 600, "revenue": 2700, "orders": 27, "cogs": 810, "projectedProfit": 1290, "actualPayout": 0, "payoutDate": "2025-06-10", "bankAccount": "Rabobank"}
      ]
    },
    {
      name: "Winkeloutlet SP",
      dailyData: [
        {"date": "2025-06-05", "adSpend": 950, "revenue": 4275, "orders": 43, "cogs": 1282, "projectedProfit": 2043, "actualPayout": 0, "payoutDate": "2025-06-08", "bankAccount": "ABN AMRO"}
      ]
    }
  ],
  payouts: [
    {"date": "2025-06-06", "webshop": "Vanhouten SP", "amount": 1740, "bankAccount": "Rabobank", "cryptoConverted": true, "dividend": 348, "partner1Share": 139.2, "partner2Share": 208.8, "paid": true},
    {"date": "2025-06-07", "webshop": "Vanhouten SP", "amount": 1950, "bankAccount": "ING NL", "cryptoConverted": true, "dividend": 390, "partner1Share": 156, "partner2Share": 234, "paid": false}
  ],
  bankAccounts: ["ING NL", "Rabobank", "ABN AMRO"]
};

let currentWebshop = "Vanhouten SP";
let revenueChart = null;

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('nl-NL', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('nl-NL');
}

function calculateRoas(revenue, adSpend) {
  return adSpend > 0 ? (revenue / adSpend).toFixed(2) : '0.00';
}

function calculateDaysRemaining(balance, dailyBurn) {
  return dailyBurn > 0 ? Math.floor(balance / dailyBurn) : 999;
}

function getStatusClass(daysRemaining) {
  if (daysRemaining < 3) return 'danger';
  if (daysRemaining < 7) return 'warning';
  return 'success';
}

function calculateTotalMetrics() {
  let totalRevenue = 0;
  let totalAdSpend = 0;
  let totalProjectedProfit = 0;
  
  const today = '2025-06-05';
  
  appData.webshops.forEach(webshop => {
    const todayData = webshop.dailyData.find(data => data.date === today);
    if (todayData) {
      totalRevenue += todayData.revenue;
      totalAdSpend += todayData.adSpend;
      totalProjectedProfit += todayData.projectedProfit;
    }
  });
  
  const totalOutstandingDividends = appData.payouts
    .filter(payout => !payout.paid)
    .reduce((sum, payout) => sum + payout.partner2Share, 0);
  
  return {
    totalRevenue,
    totalAdSpend,
    totalProjectedProfit,
    totalOutstandingDividends
  };
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeTabs();
  updateHeaderMetrics();
  renderOverview();
  renderAgencyTable();
  renderWebshopData();
  renderReconciliationTable();
  renderDividendsData();
  setupModals();
});

// Tab functionality
function initializeTabs() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update nav tabs
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update tab content
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
  
  // Webshop tabs
  const webshopTabs = document.querySelectorAll('.webshop-tab');
  webshopTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentWebshop = tab.dataset.webshop;
      
      // Update webshop tabs
      webshopTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update webshop data
      renderWebshopData();
    });
  });
}

// Update header metrics
function updateHeaderMetrics() {
  const metrics = calculateTotalMetrics();
  
  document.getElementById('totalRevenue').textContent = formatCurrency(metrics.totalRevenue);
  document.getElementById('totalAdSpend').textContent = formatCurrency(metrics.totalAdSpend);
  document.getElementById('totalProfit').textContent = formatCurrency(metrics.totalProjectedProfit);
  document.getElementById('totalDividends').textContent = formatCurrency(metrics.totalOutstandingDividends);
}

// Overview page rendering
function renderOverview() {
  renderAgencyAlerts();
  renderWebshopGrid();
  renderRecentPayouts();
  renderRevenueChart();
}

function renderAgencyAlerts() {
  const container = document.getElementById('agencyAlerts');
  let html = '';
  
  appData.agencies.forEach(agency => {
    agency.adAccounts.forEach(account => {
      const daysRemaining = calculateDaysRemaining(account.balance, account.dailyBurn);
      const statusClass = getStatusClass(daysRemaining);
      
      if (daysRemaining < 7) {
        html += `
          <div class="alert-item ${statusClass}">
            <div class="status-indicator ${statusClass}"></div>
            <div>
              <strong>${agency.name}</strong> - ${account.id}<br>
              <small>${formatCurrency(account.balance)} remaining (${daysRemaining} days)</small>
            </div>
          </div>
        `;
      }
    });
  });
  
  if (!html) {
    html = '<div class="alert-item success"><div class="status-indicator success"></div><div>All agency accounts have sufficient balance</div></div>';
  }
  
  container.innerHTML = html;
}

function renderWebshopGrid() {
  const container = document.getElementById('webshopGrid');
  let html = '';
  
  const today = '2025-06-05';
  
  appData.webshops.forEach(webshop => {
    const todayData = webshop.dailyData.find(data => data.date === today);
    if (todayData) {
      const roas = calculateRoas(todayData.revenue, todayData.adSpend);
      
      html += `
        <div class="webshop-grid-item">
          <div class="webshop-name">${webshop.name}</div>
          <div class="webshop-metrics">
            <div class="webshop-metric">
              <span class="webshop-metric-label">Revenue</span>
              <span class="webshop-metric-value">${formatCurrency(todayData.revenue)}</span>
            </div>
            <div class="webshop-metric">
              <span class="webshop-metric-label">ROAS</span>
              <span class="webshop-metric-value">${roas}x</span>
            </div>
            <div class="webshop-metric">
              <span class="webshop-metric-label">Orders</span>
              <span class="webshop-metric-value">${todayData.orders}</span>
            </div>
          </div>
        </div>
      `;
    }
  });
  
  container.innerHTML = html;
}

function renderRecentPayouts() {
  const container = document.getElementById('recentPayouts');
  let html = '';
  
  appData.payouts.slice(-5).reverse().forEach(payout => {
    html += `
      <div class="payout-item">
        <div class="payout-details">
          <div class="payout-webshop">${payout.webshop}</div>
          <div class="payout-date">${formatDate(payout.date)}</div>
        </div>
        <div class="payout-amount">${formatCurrency(payout.amount)}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  
  if (revenueChart) {
    revenueChart.destroy();
  }
  
  // Get last 7 days of data
  const dates = [];
  const revenues = [];
  const adSpends = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date('2025-06-05');
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    dates.push(formatDate(dateString));
    
    let dayRevenue = 0;
    let dayAdSpend = 0;
    
    appData.webshops.forEach(webshop => {
      const dayData = webshop.dailyData.find(data => data.date === dateString);
      if (dayData) {
        dayRevenue += dayData.revenue;
        dayAdSpend += dayData.adSpend;
      }
    });
    
    revenues.push(dayRevenue);
    adSpends.push(dayAdSpend);
  }
  
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Revenue',
          data: revenues,
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          tension: 0.4
        },
        {
          label: 'Ad Spend',
          data: adSpends,
          borderColor: '#FFC185',
          backgroundColor: 'rgba(255, 193, 133, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });
}

// Agency management
function renderAgencyTable() {
  const tbody = document.getElementById('agencyTable');
  let html = '';
  
  appData.agencies.forEach(agency => {
    agency.adAccounts.forEach(account => {
      const daysRemaining = calculateDaysRemaining(account.balance, account.dailyBurn);
      const statusClass = getStatusClass(daysRemaining);
      
      html += `
        <tr>
          <td>${agency.name}</td>
          <td>${account.id}</td>
          <td>${formatCurrency(account.balance)}</td>
          <td>${formatCurrency(account.dailyBurn)}</td>
          <td>${daysRemaining}</td>
          <td>${formatDate(account.lastTopup)}</td>
          <td>${formatCurrency(account.topupAmount)}</td>
          <td>
            <span class="status-badge ${statusClass}">
              <div class="status-indicator ${statusClass}"></div>
              ${daysRemaining < 3 ? 'Critical' : daysRemaining < 7 ? 'Warning' : 'Good'}
            </span>
          </td>
        </tr>
      `;
    });
  });
  
  tbody.innerHTML = html;
}

// Webshop tracking
function renderWebshopData() {
  const tbody = document.getElementById('webshopTable');
  const webshop = appData.webshops.find(w => w.name === currentWebshop);
  let html = '';
  
  if (webshop) {
    webshop.dailyData.forEach(data => {
      const roas = calculateRoas(data.revenue, data.adSpend);
      const payoutStatus = data.actualPayout > 0 ? 'Paid' : 'Pending';
      
      html += `
        <tr>
          <td>${formatDate(data.date)}</td>
          <td>${formatCurrency(data.adSpend)}</td>
          <td>${formatCurrency(data.revenue)}</td>
          <td>${data.orders}</td>
          <td>${formatCurrency(data.cogs)}</td>
          <td>${roas}x</td>
          <td>${formatCurrency(data.projectedProfit)}</td>
          <td>${data.actualPayout > 0 ? formatCurrency(data.actualPayout) : 'Pending'}</td>
          <td>${formatDate(data.payoutDate)}</td>
          <td>${data.bankAccount}</td>
        </tr>
      `;
    });
  }
  
  tbody.innerHTML = html;
}

// Financial reconciliation
function renderReconciliationTable() {
  const tbody = document.getElementById('reconciliationTable');
  let html = '';
  
  appData.payouts.forEach(payout => {
    html += `
      <tr>
        <td>${formatDate(payout.date)}</td>
        <td>${payout.webshop}</td>
        <td>${formatCurrency(payout.amount)}</td>
        <td>${payout.bankAccount}</td>
        <td>${payout.cryptoConverted ? 'Yes' : 'No'}</td>
        <td>${formatCurrency(payout.dividend)}</td>
        <td>${formatCurrency(payout.partner1Share)}</td>
        <td>${formatCurrency(payout.partner2Share)}</td>
        <td>
          <span class="status-badge ${payout.paid ? 'success' : 'warning'}">
            ${payout.paid ? 'Paid' : 'Pending'}
          </span>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// Partner dividends
function renderDividendsData() {
  const partner1Total = appData.payouts.reduce((sum, payout) => sum + payout.partner1Share, 0);
  const partner2Total = appData.payouts.reduce((sum, payout) => sum + payout.partner2Share, 0);
  const partner1Outstanding = appData.payouts.filter(p => !p.paid).reduce((sum, payout) => sum + payout.partner1Share, 0);
  const partner2Outstanding = appData.payouts.filter(p => !p.paid).reduce((sum, payout) => sum + payout.partner2Share, 0);
  
  document.getElementById('partner1Total').textContent = formatCurrency(partner1Total);
  document.getElementById('partner2Total').textContent = formatCurrency(partner2Total);
  document.getElementById('partner1Outstanding').textContent = formatCurrency(partner1Outstanding);
  document.getElementById('partner2Outstanding').textContent = formatCurrency(partner2Outstanding);
  
  const tbody = document.getElementById('dividendsTable');
  let html = '';
  
  appData.payouts.forEach((payout, index) => {
    html += `
      <tr>
        <td>${formatDate(payout.date)}</td>
        <td>${payout.webshop}</td>
        <td>${formatCurrency(payout.partner1Share)}</td>
        <td>${formatCurrency(payout.partner2Share)}</td>
        <td>
          <span class="status-badge ${payout.paid ? 'success' : 'warning'}">
            ${payout.paid ? 'Paid' : 'Pending'}
          </span>
        </td>
        <td>
          ${!payout.paid ? `<button class="action-btn primary" onclick="markDividendPaid(${index})">Mark Paid</button>` : ''}
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// Modal functionality
function setupModals() {
  populateAgencyDropdown();
  setDefaultDates();
}

function populateAgencyDropdown() {
  const select = document.getElementById('topupAgency');
  appData.agencies.forEach(agency => {
    const option = document.createElement('option');
    option.value = agency.name;
    option.textContent = agency.name;
    select.appendChild(option);
  });
  
  select.addEventListener('change', updateAccountDropdown);
}

function updateAccountDropdown() {
  const agencyName = document.getElementById('topupAgency').value;
  const accountSelect = document.getElementById('topupAccount');
  accountSelect.innerHTML = '<option value="">Select Ad Account</option>';
  
  const agency = appData.agencies.find(a => a.name === agencyName);
  if (agency) {
    agency.adAccounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.id;
      accountSelect.appendChild(option);
    });
  }
}

function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('topupDate').value = today;
  document.getElementById('entryDate').value = today;
}

function openTopupModal() {
  document.getElementById('topupModal').classList.add('active');
}

function closeTopupModal() {
  document.getElementById('topupModal').classList.remove('active');
  document.getElementById('topupForm').reset();
}

function openEntryModal() {
  document.getElementById('entryModal').classList.add('active');
}

function closeEntryModal() {
  document.getElementById('entryModal').classList.remove('active');
  document.getElementById('entryForm').reset();
}

// Form submissions
document.getElementById('topupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const agencyName = document.getElementById('topupAgency').value;
  const accountId = document.getElementById('topupAccount').value;
  const amount = parseFloat(document.getElementById('topupAmount').value);
  const date = document.getElementById('topupDate').value;
  
  // Find and update the account
  const agency = appData.agencies.find(a => a.name === agencyName);
  if (agency) {
    const account = agency.adAccounts.find(a => a.id === accountId);
    if (account) {
      account.balance += amount;
      account.lastTopup = date;
      account.topupAmount = amount;
      
      // Refresh displays
      renderAgencyTable();
      renderOverview();
      updateHeaderMetrics();
      
      closeTopupModal();
    }
  }
});

document.getElementById('entryForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const date = document.getElementById('entryDate').value;
  const adSpend = parseFloat(document.getElementById('entryAdSpend').value);
  const revenue = parseFloat(document.getElementById('entryRevenue').value);
  const orders = parseInt(document.getElementById('entryOrders').value);
  const cogs = parseFloat(document.getElementById('entryCogs').value);
  const bankAccount = document.getElementById('entryBankAccount').value;
  
  const projectedProfit = revenue - adSpend - cogs;
  
  // Calculate payout date (3-7 days later)
  const payoutDate = new Date(date);
  payoutDate.setDate(payoutDate.getDate() + Math.floor(Math.random() * 5) + 3);
  
  const newEntry = {
    date,
    adSpend,
    revenue,
    orders,
    cogs,
    projectedProfit,
    actualPayout: 0,
    payoutDate: payoutDate.toISOString().split('T')[0],
    bankAccount
  };
  
  // Add to current webshop
  const webshop = appData.webshops.find(w => w.name === currentWebshop);
  if (webshop) {
    webshop.dailyData.unshift(newEntry);
    
    // Refresh displays
    renderWebshopData();
    renderOverview();
    updateHeaderMetrics();
    
    closeEntryModal();
  }
});

// Additional functions
function markDividendPaid(index) {
  appData.payouts[index].paid = true;
  renderDividendsData();
  updateHeaderMetrics();
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});