// Tab Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        
        // Show selected tab content
        const tabId = item.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Carbon Calculator
const carbonForm = document.getElementById('carbonCalculatorForm');
const resultsContainer = document.getElementById('calculationResults');

carbonForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const formData = {
        carKm: parseFloat(document.getElementById('carKm').value) || 0,
        bikeKm: parseFloat(document.getElementById('bikeKm').value) || 0,
        publicTransport: parseFloat(document.getElementById('publicTransport').value) || 0,
        flights: parseFloat(document.getElementById('flights').value) || 0,
        electricity: parseFloat(document.getElementById('electricity').value) || 0,
        naturalGas: parseFloat(document.getElementById('naturalGas').value) || 0,
        heating: parseFloat(document.getElementById('heating').value) || 0,
        renewableEnergy: document.getElementById('renewableEnergy').checked,
        diet: document.getElementById('diet').value,
        shopping: parseFloat(document.getElementById('shopping').value) || 0,
        waste: parseFloat(document.getElementById('waste').value) || 0,
        recycling: document.getElementById('recycling').checked
    };
    
    // Calculate emissions (kg CO2e per month)
    const emissions = calculateEmissions(formData);
    
    // Display results
    displayResults(emissions);
    
    // Show results container
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
});

function calculateEmissions(data) {
    let transportEmissions = 0;
    let energyEmissions = 0;
    let lifestyleEmissions = 0;
    
    // Transportation emissions (g CO2/km converted to kg)
    transportEmissions += data.carKm * 0.12; // 120g per km
    transportEmissions += data.bikeKm * 0.06; // 60g per km
    transportEmissions += data.publicTransport * 0.03; // 30g per km
    transportEmissions += data.flights * 90; // 90kg per flight hour
    
    // Energy emissions
    const electricityFactor = data.renewableEnergy ? 0.1 : 0.5; // kg CO2/kWh
    energyEmissions += data.electricity * electricityFactor;
    energyEmissions += data.naturalGas * 2.0; // kg CO2/m3
    energyEmissions += data.heating * 2.6; // kg CO2/liter
    
    // Lifestyle emissions
    const dietEmissions = {
        'meat-heavy': 150,
        'average': 100,
        'low-meat': 70,
        'vegetarian': 50,
        'vegan': 30
    };
    lifestyleEmissions += dietEmissions[data.diet] || 100;
    lifestyleEmissions += data.shopping * 0.5; // 0.5kg per dollar spent
    lifestyleEmissions += data.waste * 0.5 * 4; // weekly to monthly, 0.5kg per kg waste
    
    if (data.recycling) {
        lifestyleEmissions *= 0.7; // 30% reduction
    }
    
    return {
        transport: Math.round(transportEmissions),
        energy: Math.round(energyEmissions),
        lifestyle: Math.round(lifestyleEmissions),
        total: Math.round(transportEmissions + energyEmissions + lifestyleEmissions)
    };
}

function displayResults(emissions) {
    // Update totals
    document.getElementById('monthlyTotal').textContent = `${emissions.total} kg CO₂e`;
    document.getElementById('annualTotal').textContent = `${(emissions.total * 12 / 1000).toFixed(2)} tons CO₂e`;
    
    // Update breakdown list
    const breakdownList = document.getElementById('breakdownList');
    breakdownList.innerHTML = `
        <div style="padding: 10px; border-left: 4px solid #3498db; margin-bottom: 10px; background: #ecf0f1;">
            <strong>Transportation:</strong> ${emissions.transport} kg CO₂e (${Math.round(emissions.transport / emissions.total * 100)}%)
        </div>
        <div style="padding: 10px; border-left: 4px solid #f39c12; margin-bottom: 10px; background: #ecf0f1;">
            <strong>Energy:</strong> ${emissions.energy} kg CO₂e (${Math.round(emissions.energy / emissions.total * 100)}%)
        </div>
        <div style="padding: 10px; border-left: 4px solid #e74c3c; margin-bottom: 10px; background: #ecf0f1;">
            <strong>Lifestyle:</strong> ${emissions.lifestyle} kg CO₂e (${Math.round(emissions.lifestyle / emissions.total * 100)}%)
        </div>
    `;
    
    // Create breakdown chart
    createBreakdownChart(emissions);
    
    // Update comparison
    updateComparison(emissions.total * 12 / 1000); // annual in tons
}

function createBreakdownChart(emissions) {
    const ctx = document.getElementById('breakdownChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.breakdownChart) {
        window.breakdownChart.destroy();
    }
    
    window.breakdownChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Transportation', 'Energy', 'Lifestyle'],
            datasets: [{
                data: [emissions.transport, emissions.energy, emissions.lifestyle],
                backgroundColor: ['#3498db', '#f39c12', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateComparison(annualTons) {
    const comparisonText = document.getElementById('comparisonText');
    const yourPosition = document.getElementById('yourPosition');
    
    // Position marker (4 tons = 0%, 16 tons = 100%)
    const position = Math.min(100, Math.max(0, ((annualTons - 4) / 12) * 100));
    yourPosition.style.left = `${position}%`;
    
    if (annualTons < 6) {
        comparisonText.textContent = '🌟 Excellent! Your footprint is well below average.';
        comparisonText.style.color = '#2ecc71';
    } else if (annualTons < 10) {
        comparisonText.textContent = '👍 Good! You\'re around the global average.';
        comparisonText.style.color = '#f39c12';
    } else {
        comparisonText.textContent = '⚠️ Your footprint is above average. Consider implementing reduction strategies.';
        comparisonText.style.color = '#e74c3c';
    }
}

// Save Calculation to History
document.getElementById('saveCalculation').addEventListener('click', () => {
    const monthlyTotal = document.getElementById('monthlyTotal').textContent;
    const breakdown = {
        date: new Date().toISOString(),
        total: monthlyTotal,
        transport: document.querySelector('.breakdown-list div:nth-child(1)').textContent,
        energy: document.querySelector('.breakdown-list div:nth-child(2)').textContent,
        lifestyle: document.querySelector('.breakdown-list div:nth-child(3)').textContent
    };
    
    // Get existing history
    let history = JSON.parse(localStorage.getItem('carbonHistory') || '[]');
    history.unshift(breakdown);
    
    // Keep only last 50 records
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('carbonHistory', JSON.stringify(history));
    
    alert('✅ Calculation saved to history!');
    loadHistory();
});

// History Tab Functions
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('carbonHistory') || '[]');
    const tbody = document.getElementById('historyTableBody');
    
    if (history.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No calculations yet. Start by calculating your carbon footprint!</td></tr>';
        return;
    }
    
    tbody.innerHTML = history.map((record, index) => {
        const date = new Date(record.date).toLocaleDateString();
        const total = record.total;
        const transport = record.transport.match(/\d+/)[0];
        const energy = record.energy.match(/\d+/)[0];
        const lifestyle = record.lifestyle.match(/\d+/)[0];
        
        return `
            <tr>
                <td>${date}</td>
                <td><strong>${total}</strong></td>
                <td>${transport} kg</td>
                <td>${energy} kg</td>
                <td>${lifestyle} kg</td>
                <td><button onclick="deleteRecord(${index})" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button></td>
            </tr>
        `;
    }).join('');
    
    // Update history stats
    updateHistoryStats(history);
    
    // Create history chart
    createHistoryChart(history);
}

function deleteRecord(index) {
    let history = JSON.parse(localStorage.getItem('carbonHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('carbonHistory', JSON.stringify(history));
    loadHistory();
}

function updateHistoryStats(history) {
    const totalRecords = history.length;
    const totals = history.map(r => parseInt(r.total.match(/\d+/)[0]));
    const avgMonthly = totals.reduce((a, b) => a + b, 0) / totalRecords || 0;
    const lowestRecord = Math.min(...totals) || 0;
    
    document.getElementById('totalCalculations').textContent = totalRecords;
    document.getElementById('avgMonthly').textContent = `${Math.round(avgMonthly)} kg`;
    document.getElementById('lowestRecord').textContent = `${lowestRecord} kg`;
    
    // Calculate trend
    if (history.length >= 2) {
        const recent = parseInt(history[0].total.match(/\d+/)[0]);
        const previous = parseInt(history[1].total.match(/\d+/)[0]);
        const trendIndicator = document.getElementById('trendIndicator');
        
        if (recent < previous) {
            trendIndicator.textContent = '↓ Decreasing';
            trendIndicator.style.color = '#2ecc71';
        } else if (recent > previous) {
            trendIndicator.textContent = '↑ Increasing';
            trendIndicator.style.color = '#e74c3c';
        } else {
            trendIndicator.textContent = '→ Stable';
            trendIndicator.style.color = '#f39c12';
        }
    }
}

function createHistoryChart(history) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    if (window.historyChart) {
        window.historyChart.destroy();
    }
    
    const labels = history.slice(0, 12).reverse().map(r => new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const data = history.slice(0, 12).reverse().map(r => parseInt(r.total.match(/\d+/)[0]));
    
    window.historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Carbon Footprint',
                data: data,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#2ecc71',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kg CO₂e',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Create category pie chart
    createCategoryPieChart(history);
    
    // Create category trend chart
    createCategoryTrendChart(history);
    
    // Create monthly bar chart
    createMonthlyBarChart(history);
}

function createCategoryPieChart(history) {
    const ctx = document.getElementById('categoryPieChart');
    if (!ctx) return;
    
    if (window.categoryPieChart) {
        window.categoryPieChart.destroy();
    }
    
    // Calculate average emissions by category
    let totalTransport = 0, totalEnergy = 0, totalLifestyle = 0;
    
    history.forEach(record => {
        totalTransport += parseInt(record.transport.match(/\d+/)[0]);
        totalEnergy += parseInt(record.energy.match(/\d+/)[0]);
        totalLifestyle += parseInt(record.lifestyle.match(/\d+/)[0]);
    });
    
    window.categoryPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Transportation', 'Energy', 'Lifestyle'],
            datasets: [{
                data: [totalTransport, totalEnergy, totalLifestyle],
                backgroundColor: [
                    '#3498db',
                    '#f39c12',
                    '#e74c3c'
                ],
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 13 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} kg (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createCategoryTrendChart(history) {
    const ctx = document.getElementById('categoryTrendChart');
    if (!ctx) return;
    
    if (window.categoryTrendChart) {
        window.categoryTrendChart.destroy();
    }
    
    const labels = history.slice(0, 8).reverse().map(r => new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const transportData = history.slice(0, 8).reverse().map(r => parseInt(r.transport.match(/\d+/)[0]));
    const energyData = history.slice(0, 8).reverse().map(r => parseInt(r.energy.match(/\d+/)[0]));
    const lifestyleData = history.slice(0, 8).reverse().map(r => parseInt(r.lifestyle.match(/\d+/)[0]));
    
    window.categoryTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Transportation',
                    data: transportData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Energy',
                    data: energyData,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Lifestyle',
                    data: lifestyleData,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kg CO₂e'
                    }
                }
            }
        }
    });
}

function createMonthlyBarChart(history) {
    const ctx = document.getElementById('monthlyBarChart');
    if (!ctx) return;
    
    if (window.monthlyBarChart) {
        window.monthlyBarChart.destroy();
    }
    
    const labels = history.slice(0, 6).reverse().map(r => new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const transportData = history.slice(0, 6).reverse().map(r => parseInt(r.transport.match(/\d+/)[0]));
    const energyData = history.slice(0, 6).reverse().map(r => parseInt(r.energy.match(/\d+/)[0]));
    const lifestyleData = history.slice(0, 6).reverse().map(r => parseInt(r.lifestyle.match(/\d+/)[0]));
    
    window.monthlyBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Transportation',
                    data: transportData,
                    backgroundColor: '#3498db'
                },
                {
                    label: 'Energy',
                    data: energyData,
                    backgroundColor: '#f39c12'
                },
                {
                    label: 'Lifestyle',
                    data: lifestyleData,
                    backgroundColor: '#e74c3c'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        footer: function(tooltipItems) {
                            let sum = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                sum += tooltipItem.parsed.y;
                            });
                            return 'Total: ' + sum + ' kg CO₂e';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kg CO₂e'
                    }
                }
            }
        }
    });
}

// Tips Tab Functions
const tipCategories = document.querySelectorAll('.category-btn');
const tipCards = document.querySelectorAll('.tip-card');

tipCategories.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        tipCategories.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.getAttribute('data-category');
        
        // Filter tip cards
        tipCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Implement tip tracking
document.querySelectorAll('.tip-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tipCard = this.closest('.tip-card');
        const tipTitle = tipCard.querySelector('h3').textContent;
        const tipSavings = tipCard.querySelector('.tip-savings').textContent;
        
        // Get implemented tips
        let implementedTips = JSON.parse(localStorage.getItem('implementedTips') || '[]');
        
        // Check if already implemented
        if (implementedTips.some(tip => tip.title === tipTitle)) {
            alert('You\'ve already implemented this tip!');
            return;
        }
        
        // Add to implemented
        implementedTips.push({
            title: tipTitle,
            savings: tipSavings,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('implementedTips', JSON.stringify(implementedTips));
        
        this.textContent = '✓ Implemented';
        this.style.background = '#2ecc71';
        this.disabled = true;
        
        loadImplementedTips();
    });
});

function loadImplementedTips() {
    const implementedTips = JSON.parse(localStorage.getItem('implementedTips') || '[]');
    const listContainer = document.getElementById('implementedTipsList');
    
    if (implementedTips.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">No tips implemented yet. Start making changes today!</p>';
        document.getElementById('totalImpact').textContent = '0 kg CO₂/year saved';
        return;
    }
    
    listContainer.innerHTML = implementedTips.map((tip, index) => `
        <div style="padding: 15px; background: white; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <div>
                <strong>${tip.title}</strong>
                <p style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">${tip.savings}</p>
            </div>
            <button onclick="removeImplementedTip(${index})" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
        </div>
    `).join('');
    
    // Calculate total impact
    const totalSavings = implementedTips.reduce((total, tip) => {
        const match = tip.savings.match(/(\d+)/);
        return total + (match ? parseInt(match[1]) : 0);
    }, 0);
    
    document.getElementById('totalImpact').textContent = `${totalSavings} kg CO₂/year saved`;
}

function removeImplementedTip(index) {
    let implementedTips = JSON.parse(localStorage.getItem('implementedTips') || '[]');
    implementedTips.splice(index, 1);
    localStorage.setItem('implementedTips', JSON.stringify(implementedTips));
    loadImplementedTips();
}

// Offset Calculator
document.getElementById('offsetAmount').addEventListener('input', function() {
    const amount = parseFloat(this.value) || 0;
    const costPerTon = 25; // $25 per ton
    const cost = (amount / 1000) * costPerTon;
    document.getElementById('offsetCost').textContent = `$${cost.toFixed(2)}`;
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    loadImplementedTips();
    
    // Load any saved data to update dashboard stats
    updateDashboardStats();
});

function updateDashboardStats() {
    const history = JSON.parse(localStorage.getItem('carbonHistory') || '[]');
    
    if (history.length > 0) {
        const latest = parseInt(history[0].total.match(/\d+/)[0]);
        document.getElementById('totalEmissions').textContent = `${latest} kg`;
        
        const totals = history.map(r => parseInt(r.total.match(/\d+/)[0]));
        const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
        const percentChange = history.length >= 2 ? ((latest - parseInt(history[1].total.match(/\d+/)[0])) / parseInt(history[1].total.match(/\d+/)[0]) * 100) : 0;
        
        const changeElement = document.querySelector('.stat-change.decrease');
        if (changeElement) {
            changeElement.textContent = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}% from last month`;
            changeElement.className = percentChange > 0 ? 'stat-change increase' : 'stat-change decrease';
        }
    }
    
    // Update eco points from implemented tips
    const implementedTips = JSON.parse(localStorage.getItem('implementedTips') || '[]');
    const ecoPoints = implementedTips.length * 50; // 50 points per tip
    document.getElementById('ecoPoints').textContent = ecoPoints;
}

// Time range filters for history
document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const range = this.getAttribute('data-range');
        // In a real app, this would filter the history data
        console.log('Filtering by:', range);
    });
});

// Export data functionality
document.querySelector('.export-btn')?.addEventListener('click', () => {
    const history = JSON.parse(localStorage.getItem('carbonHistory') || '[]');
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carbon-footprint-history.json';
    link.click();
});

console.log('Dashboard loaded successfully! 🌍');
