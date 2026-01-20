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

// Logout functionality
document.querySelector('.logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = 'login.html';
}

// Make functions global for onclick handlers
window.joinChallenge = joinChallenge;
window.redeemReward = redeemReward;
window.toggleNotifications = toggleNotifications;
window.markAllNotificationsRead = markAllNotificationsRead;

// API helper function
function apiRequest(url, options = {}) {
    const token = localStorage.getItem('access_token');
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    
    return fetch(`http://localhost:8000/api${url}`, { ...defaultOptions, ...options });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    // Load user data
    loadUserProfile();
    loadDashboardStats();
    loadChallenges();
    loadLeaderboard();
    loadRewards();
    loadActivityHistory();
    loadNotifications();
});

// Carbon Calculator
const carbonForm = document.getElementById('carbonCalculatorForm');
const resultsContainer = document.getElementById('calculationResults');

carbonForm.addEventListener('submit', async (e) => {
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
    
    // Save activities to backend
    await saveActivitiesToBackend(formData, emissions);
    
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

// Save activities to backend
async function saveActivitiesToBackend(formData, emissions) {
    const activities = [];

    // Transportation activities
    if (formData.carKm > 0) {
        activities.push({
            activity_type: 'transport',
            transport_mode: 'car',
            distance_km: formData.carKm,
            description: `Car travel: ${formData.carKm} km`,
            co2_impact: formData.carKm * 0.12
        });
    }

    if (formData.bikeKm > 0) {
        activities.push({
            activity_type: 'transport',
            transport_mode: 'bicycle',
            distance_km: formData.bikeKm,
            description: `Bicycle travel: ${formData.bikeKm} km`,
            co2_impact: formData.bikeKm * 0.06
        });
    }

    if (formData.publicTransport > 0) {
        activities.push({
            activity_type: 'transport',
            transport_mode: 'public_transport',
            distance_km: formData.publicTransport,
            description: `Public transport: ${formData.publicTransport} km`,
            co2_impact: formData.publicTransport * 0.03
        });
    }

    if (formData.flights > 0) {
        activities.push({
            activity_type: 'transport',
            transport_mode: 'flight',
            distance_km: formData.flights * 800, // Approximate km per flight hour
            description: `Flights: ${formData.flights} hours`,
            co2_impact: formData.flights * 90
        });
    }

    // Energy activities
    if (formData.electricity > 0) {
        const factor = formData.renewableEnergy ? 0.1 : 0.5;
        activities.push({
            activity_type: 'energy',
            energy_type: 'electricity',
            energy_saved_kwh: formData.electricity,
            description: `Electricity usage: ${formData.electricity} kWh`,
            co2_impact: formData.electricity * factor
        });
    }

    if (formData.naturalGas > 0) {
        activities.push({
            activity_type: 'energy',
            energy_type: 'natural_gas',
            energy_saved_kwh: formData.naturalGas,
            description: `Natural gas: ${formData.naturalGas} m³`,
            co2_impact: formData.naturalGas * 2.0
        });
    }

    if (formData.heating > 0) {
        activities.push({
            activity_type: 'energy',
            energy_type: 'heating',
            energy_saved_kwh: formData.heating,
            description: `Heating: ${formData.heating} liters`,
            co2_impact: formData.heating * 2.6
        });
    }

    // Lifestyle activities
    activities.push({
        activity_type: 'food',
        meal_type: formData.diet,
        servings: 30, // Monthly servings
        description: `Diet: ${formData.diet}`,
        co2_impact: getDietEmissions(formData.diet)
    });

    if (formData.shopping > 0) {
        activities.push({
            activity_type: 'shopping',
            description: `Shopping: $${formData.shopping}`,
            co2_impact: formData.shopping * 0.5
        });
    }

    if (formData.waste > 0) {
        activities.push({
            activity_type: 'waste',
            weight_kg: formData.waste,
            description: `Waste: ${formData.waste} kg`,
            co2_impact: formData.waste * 0.5 * 4
        });
    }

    // Save each activity
    for (const activity of activities) {
        try {
            await apiRequest('/tracking/activities/', {
                method: 'POST',
                body: JSON.stringify(activity)
            });
        } catch (error) {
            console.error('Failed to save activity:', activity, error);
        }
    }

    // Reload dashboard stats after saving
    loadDashboardStats();
    loadActivityHistory();
}

function getDietEmissions(diet) {
    const dietEmissions = {
        'meat-heavy': 150,
        'average': 100,
        'low-meat': 70,
        'vegetarian': 50,
        'vegan': 30
    };
    return dietEmissions[diet] || 100;
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

// Load user profile
async function loadUserProfile() {
    try {
        const response = await apiRequest('/users/profile/');
        if (response.ok) {
            const data = await response.json();
            // Update user name in the UI if there's a welcome message
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement && data.name) {
                userNameElement.textContent = `Welcome, ${data.name}!`;
            }
            
            // Update dashboard stats
            updateDashboardStats(data);
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
}

// Update dashboard stats cards
function updateDashboardStats(userData) {
    // Update total emissions (this would come from activity aggregation)
    const totalEmissionsElement = document.getElementById('totalEmissions');
    if (totalEmissionsElement) {
        // This would need to be calculated from user's activities
        totalEmissionsElement.textContent = 'Loading...';
    }
    
    // Update eco points
    const ecoPointsElement = document.getElementById('ecoPoints');
    if (ecoPointsElement && userData.total_points) {
        ecoPointsElement.textContent = userData.total_points.toLocaleString();
    }
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const response = await apiRequest('/users/dashboard-stats/');
        if (response.ok) {
            const data = await response.json();
            // Update dashboard with real data
            updateDashboardWithStats(data);
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

// Update dashboard with API data
function updateDashboardWithStats(data) {
    // Update weekly stats if elements exist
    const weeklyActivities = document.querySelector('.weekly-activities');
    const weeklyCO2 = document.querySelector('.weekly-co2');
    const activeChallenges = document.querySelector('.active-challenges');
    
    if (weeklyActivities && data.weekly_stats) {
        weeklyActivities.textContent = data.weekly_stats.activities_count;
    }
    if (weeklyCO2 && data.weekly_stats) {
        weeklyCO2.textContent = `${data.weekly_stats.co2_saved} kg`;
    }
    if (activeChallenges) {
        activeChallenges.textContent = data.active_challenges_count;
    }
}

// Load challenges
async function loadChallenges() {
    try {
        const response = await apiRequest('/challenges/');
        if (response.ok) {
            const challenges = await response.json();
            displayChallenges(challenges.results || challenges);
        }
    } catch (error) {
        console.error('Failed to load challenges:', error);
    }
}

// Display challenges
function displayChallenges(challenges) {
    const container = document.getElementById('challengesList');
    if (!container) return;

    container.innerHTML = challenges.map(challenge => `
        <div class="challenge-item">
            <span class="challenge-icon">${getChallengeIcon(challenge.category)}</span>
            <div class="challenge-info">
                <h4>${challenge.title}</h4>
                <p>${challenge.description}</p>
            </div>
            <div class="challenge-meta">
                <span class="difficulty ${getDifficultyClass(challenge.difficulty_level)}">${challenge.difficulty_level}</span>
                <span class="reward">${challenge.points_reward} pts</span>
            </div>
            <button class="start-challenge-btn" onclick="joinChallenge(${challenge.id})">Join</button>
        </div>
    `).join('');
}

function getChallengeIcon(category) {
    const icons = {
        'transport': '🚗',
        'energy': '⚡',
        'food': '🍽️',
        'waste': '♻️',
        'lifestyle': '🏠'
    };
    return icons[category] || '🎯';
}

function getDifficultyClass(difficulty) {
    const classes = {
        'easy': 'easy',
        'medium': 'medium',
        'hard': 'hard'
    };
    return classes[difficulty.toLowerCase()] || 'medium';
}

// Join challenge
async function joinChallenge(challengeId) {
    try {
        const response = await apiRequest(`/challenges/${challengeId}/join/`, {
            method: 'POST'
        });
        if (response.ok) {
            alert('Successfully joined challenge!');
            loadChallenges();
            loadDashboardStats();
        } else {
            const error = await response.json();
            alert(error.detail || 'Failed to join challenge');
        }
    } catch (error) {
        console.error('Failed to join challenge:', error);
        alert('Failed to join challenge');
    }
}

// Load leaderboard
async function loadLeaderboard() {
    try {
        const response = await apiRequest('/leaderboard/global/');
        if (response.ok) {
            const leaderboard = await response.json();
            displayLeaderboard(leaderboard);
        }
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
    }
}

// Display leaderboard
function displayLeaderboard(data) {
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    const rankings = data.results || data;
    container.innerHTML = rankings.slice(0, 10).map((user, index) => {
        const rank = index + 1;
        const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank.toString();
        const isCurrentUser = user.is_current_user;
        
        return `
            <tr class="${isCurrentUser ? 'your-rank' : ''}">
                <td class="rank">${rankIcon} ${rank}</td>
                <td>${user.name || user.username}</td>
                <td>Level ${Math.floor(user.total_points / 100) + 1}</td>
                <td>${user.total_points || 0}</td>
                <td>${user.total_co2_saved || 0} kg</td>
            </tr>
        `;
    }).join('');
}

// Load rewards
async function loadRewards() {
    try {
        const response = await apiRequest('/rewards/');
        if (response.ok) {
            const rewards = await response.json();
            displayRewards(rewards.results || rewards);
        }
    } catch (error) {
        console.error('Failed to load rewards:', error);
    }
}

// Display rewards
function displayRewards(rewards) {
    const container = document.getElementById('rewardsList');
    if (!container) return;

    container.innerHTML = rewards.map(reward => `
        <div class="reward-card">
            <div class="reward-icon">${getRewardIcon(reward.category)}</div>
            <h4>${reward.name}</h4>
            <p>${reward.description}</p>
            <div class="reward-cost">${reward.points_cost} points</div>
            <button class="btn btn-primary" onclick="redeemReward(${reward.id})">Redeem</button>
        </div>
    `).join('');
}

function getRewardIcon(category) {
    const icons = {
        'discount': '💰',
        'product': '📦',
        'service': '🛍️',
        'donation': '🌳'
    };
    return icons[category] || '🎁';
}

// Redeem reward
async function redeemReward(rewardId) {
    try {
        const response = await apiRequest('/rewards/redeem/', {
            method: 'POST',
            body: JSON.stringify({ reward_id: rewardId })
        });
        if (response.ok) {
            alert('Reward redeemed successfully!');
            loadRewards();
            loadUserProfile();
        } else {
            const error = await response.json();
            alert(error.detail || 'Failed to redeem reward');
        }
    } catch (error) {
        console.error('Failed to redeem reward:', error);
        alert('Failed to redeem reward');
    }
}

// Load activity history
async function loadActivityHistory() {
    try {
        const response = await apiRequest('/tracking/activities/');
        if (response.ok) {
            const activities = await response.json();
            displayActivityHistory(activities.results || activities);
        }
    } catch (error) {
        console.error('Failed to load activity history:', error);
    }
}

// Display activity history
function displayActivityHistory(activities) {
    const container = document.getElementById('historyTableBody');
    if (!container) return;

    if (activities.length === 0) {
        container.innerHTML = '<tr class="empty-state"><td colspan="6">No activities yet. Start by calculating your carbon footprint!</td></tr>';
        return;
    }

    container.innerHTML = activities.map(activity => `
        <tr>
            <td>${new Date(activity.timestamp).toLocaleDateString()}</td>
            <td>${activity.co2_impact} kg CO₂</td>
            <td>${activity.activity_type === 'transport' ? activity.co2_impact : '-'}</td>
            <td>${activity.activity_type === 'energy' ? activity.co2_impact : '-'}</td>
            <td>${activity.activity_type === 'food' || activity.activity_type === 'waste' ? activity.co2_impact : '-'}</td>
            <td><button class="btn btn-sm" onclick="viewActivity(${activity.id})">View</button></td>
        </tr>
    `).join('');
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await apiRequest('/gamification/notifications/');
        if (response.ok) {
            const notifications = await response.json();
            displayNotifications(notifications.results || notifications);
        }
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

// Display notifications
function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    container.innerHTML = notifications.slice(0, 10).map(notification => `
        <div class="notification-item ${!notification.is_read ? 'unread' : ''}" onclick="markNotificationRead(${notification.id})">
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${new Date(notification.created_at).toLocaleDateString()}</div>
            </div>
            ${!notification.is_read ? '<div class="unread-indicator"></div>' : ''}
        </div>
    `).join('');
}

// Toggle notifications dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        loadNotifications(); // Refresh notifications when opening
    } else {
        dropdown.style.display = 'none';
    }
}

// Mark notification as read
async function markNotificationRead(notificationId) {
    try {
        await apiRequest(`/gamification/notifications/${notificationId}/read/`, {
            method: 'POST'
        });
        loadNotifications(); // Refresh the list
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

// Mark all notifications as read
async function markAllNotificationsRead() {
    try {
        await apiRequest('/gamification/notifications/read-all/', {
            method: 'POST'
        });
        loadNotifications(); // Refresh the list
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
    }
}

// Popup message functionality
function showPopupMessage(message) {
    // Remove existing popup if any
    const existingPopup = document.querySelector('.popup-message');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'popup-message';
    popup.textContent = message;

    // Add to body
    document.body.appendChild(popup);

    // Show popup
    setTimeout(() => popup.classList.add('show'), 10);

    // Hide popup after 3 seconds
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// Add event listeners for offset and subscribe buttons
document.addEventListener('DOMContentLoaded', () => {
    // Offset buttons
    document.querySelectorAll('.offset-btn').forEach(button => {
        button.addEventListener('click', () => {
            showPopupMessage('Added to cart! 🌳');
        });
    });

    // Subscribe buttons
    document.querySelectorAll('.subscribe-btn').forEach(button => {
        button.addEventListener('click', () => {
            showPopupMessage('Added to cart! 📦');
        });
    });
});

console.log('Dashboard loaded successfully! 🌍');
