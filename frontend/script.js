// ===================================
// CARBON KARMA - SCRIPT.JS
// Interactive functionality & animations
// ===================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ===================================
    // SCROLL ANIMATIONS
    // ===================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all animate-on-scroll elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    
    // ===================================
    // NAVBAR SCROLL EFFECT
    // ===================================
    
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        }
        
        lastScroll = currentScroll;
    });
    
    
    // ===================================
    // SMOOTH SCROLL FOR NAV LINKS
    // ===================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    
    // ===================================
    // ANIMATED PROGRESS CIRCLES
    // ===================================
    
    function animateProgressCircle() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            // 76% progress = 180 offset (565 total circumference)
            const targetOffset = 565 - (565 * 0.76);
            
            setTimeout(() => {
                progressFill.style.strokeDashoffset = targetOffset;
            }, 500);
        }
    }
    
    // Trigger when dashboard section is visible
    const dashboardSection = document.querySelector('.dashboard-section');
    if (dashboardSection) {
        const dashboardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgressCircle();
                    dashboardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        dashboardObserver.observe(dashboardSection);
    }
    
    
    // ===================================
    // ANIMATED CHART BARS
    // ===================================
    
    function animateChartBars() {
        const bars = document.querySelectorAll('.chart-bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.opacity = '1';
                bar.style.transform = 'scaleY(1)';
            }, index * 100);
        });
    }
    
    // Set initial state for chart bars
    document.querySelectorAll('.chart-bar').forEach(bar => {
        bar.style.opacity = '0';
        bar.style.transform = 'scaleY(0)';
        bar.style.transformOrigin = 'bottom';
        bar.style.transition = 'all 0.5s ease';
    });
    
    // Animate when visible
    const chartContainer = document.querySelector('.mini-chart');
    if (chartContainer) {
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateChartBars();
                    chartObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        chartObserver.observe(chartContainer);
    }
    
    
    // ===================================
    // ANIMATED PROGRESS BARS
    // ===================================
    
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.challenge-fill, .xp-fill');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            
            setTimeout(() => {
                bar.style.width = width;
            }, 300);
        });
    }
    
    const challengesSection = document.querySelector('.challenges-section');
    if (challengesSection) {
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgressBars();
                    progressObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        progressObserver.observe(challengesSection);
    }
    
    
    // ===================================
    // LEADERBOARD TAB SWITCHING
    // ===================================
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Animate leaderboard items
            const items = document.querySelectorAll('.leaderboard-item');
            items.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.4s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 100);
            });
        });
    });
    
    
    // ===================================
    // COUNTER ANIMATIONS
    // ===================================
    
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = formatNumber(target);
                clearInterval(timer);
            } else {
                element.textContent = formatNumber(Math.floor(start));
            }
        }, 16);
    }
    
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    // Animate hero stats
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = document.querySelectorAll('.stat-number');
                    animateCounter(statNumbers[0], 2400);
                    animateCounter(statNumbers[1], 18500);
                    animateCounter(statNumbers[2], 450);
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(heroSection);
    }
    
    // Animate community stats
    const communityStats = document.querySelector('.community-stats');
    if (communityStats) {
        const communityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const communityNumbers = document.querySelectorAll('.community-number');
                    if (communityNumbers[0]) {
                        const timer = setInterval(() => {
                            let current = parseInt(communityNumbers[0].textContent.replace(/,/g, ''));
                            if (current < 12450) {
                                communityNumbers[0].textContent = (current + 150).toLocaleString();
                            } else {
                                communityNumbers[0].textContent = '12,450';
                                clearInterval(timer);
                            }
                        }, 30);
                    }
                    communityObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        communityObserver.observe(communityStats);
    }
    
    
    // ===================================
    // BUTTON INTERACTIONS
    // ===================================
    
    // Get Started / Start Your Journey buttons
    document.querySelectorAll('.primary-btn, .cta-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
            
            // Alert for demo
            alert('🌱 Welcome to Carbon Karma! This is a demo interface. Connect to your backend API to unlock full functionality.');
        });
    });
    
    // Redeem buttons
    document.querySelectorAll('.redeem-btn').forEach(button => {
        button.addEventListener('click', function() {
            const rewardCard = this.closest('.reward-card');
            const rewardName = rewardCard.querySelector('h4').textContent;
            const cost = this.previousElementSibling.textContent;
            
            // Simple confirmation
            if (confirm(`Redeem ${rewardName} for ${cost}?`)) {
                this.textContent = 'Redeemed! ✓';
                this.style.background = '#4CAF50';
                this.disabled = true;
                
                // Animate the card
                rewardCard.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    rewardCard.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
    
    
    // ===================================
    // GLOBE ROTATION INTERACTIVITY
    // ===================================
    
    const globeCore = document.querySelector('.globe-core');
    if (globeCore) {
        let rotation = 0;
        setInterval(() => {
            rotation += 2;
            globeCore.style.transform = `rotate(${rotation}deg)`;
        }, 100);
    }
    
    
    // ===================================
    // DYNAMIC ENERGY BOLT ANIMATION
    // ===================================
    
    const energyBolt = document.querySelector('.energy-bolt');
    if (energyBolt) {
        setInterval(() => {
            energyBolt.style.transform = 'scale(1.2)';
            setTimeout(() => {
                energyBolt.style.transform = 'scale(1)';
            }, 200);
        }, 2000);
    }
    
    
    // ===================================
    // BADGE HOVER EFFECTS
    // ===================================
    
    document.querySelectorAll('.badge-card').forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            if (!this.classList.contains('locked')) {
                const icon = this.querySelector('.badge-icon');
                icon.style.transform = 'scale(1.2) rotate(10deg)';
            }
        });
        
        badge.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.badge-icon');
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    
    // ===================================
    // MAP MARKER ANIMATIONS
    // ===================================
    
    const mapMarkers = document.querySelectorAll('.map-marker');
    mapMarkers.forEach((marker, index) => {
        setTimeout(() => {
            marker.style.opacity = '0';
            marker.style.transform = 'scale(0)';
            marker.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                marker.style.opacity = '1';
                marker.style.transform = 'scale(1)';
            }, 100);
        }, index * 300);
    });
    
    
    // ===================================
    // STREAK CALENDAR ANIMATION
    // ===================================
    
    const streakDays = document.querySelectorAll('.day');
    streakDays.forEach((day, index) => {
        day.addEventListener('click', function() {
            if (this.classList.contains('active')) {
                this.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
    
    
    // ===================================
    // CHALLENGE CARD INTERACTIONS
    // ===================================
    
    document.querySelectorAll('.challenge-card').forEach(card => {
        card.addEventListener('click', function() {
            const challengeName = this.querySelector('h3').textContent;
            const progress = this.querySelector('.progress-header span:last-child').textContent;
            
            console.log(`Challenge clicked: ${challengeName} - Progress: ${progress}`);
            // You can add modal or detail view here
        });
    });
    
    
    // ===================================
    // LEADERBOARD ITEM CLICK
    // ===================================
    
    document.querySelectorAll('.leaderboard-item').forEach(item => {
        item.addEventListener('click', function() {
            const username = this.querySelector('.username').textContent;
            const score = this.querySelector('.user-score').textContent;
            
            console.log(`User: ${username}, Score: ${score}`);
            // You can add profile view here
        });
    });
    
    
    // ===================================
    // ACTIVITY TRACKING (Demo)
    // ===================================
    
    // Simulate real-time updates
    function simulateActivityUpdate() {
        const co2Number = document.querySelector('.co2-number');
        if (co2Number) {
            setInterval(() => {
                let current = parseFloat(co2Number.textContent);
                let change = (Math.random() - 0.5) * 0.1;
                let newValue = Math.max(0, current + change).toFixed(1);
                
                co2Number.textContent = newValue;
                
                // Update progress circle
                const progressFill = document.querySelector('.progress-fill');
                if (progressFill) {
                    let progress = Math.min(1, newValue / 3.2);
                    let offset = 565 - (565 * progress);
                    progressFill.style.strokeDashoffset = offset;
                }
            }, 5000);
        }
    }
    
    // Start simulation after page load
    setTimeout(simulateActivityUpdate, 3000);
    
    
    // ===================================
    // PARALLAX EFFECT ON SCROLL
    // ===================================
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-visual');
        
        parallaxElements.forEach(el => {
            const speed = 0.3;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    
    // ===================================
    // RIPPLE EFFECT STYLES
    // ===================================
    
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        button {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
    
    
    // ===================================
    // CONSOLE WELCOME MESSAGE
    // ===================================
    
    console.log('%c🌱 Carbon Karma ', 'color: #2EB62C; font-size: 24px; font-weight: bold;');
    console.log('%cMake saving the planet addictive!', 'color: #57C84D; font-size: 16px;');
    console.log('%cConnect this frontend to your Django backend API to unlock full functionality.', 'color: #666; font-size: 12px;');
    
});


// ===================================
// API INTEGRATION HELPERS (Ready for backend)
// ===================================

// Uncomment and configure when connecting to Django backend

/*
const API_BASE_URL = 'http://localhost:8000/api';

async function fetchUserData() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function trackActivity(activityType, amount) {
    try {
        const response = await fetch(`${API_BASE_URL}/tracking/activities/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                activity_type: activityType,
                amount: amount,
                timestamp: new Date().toISOString()
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error tracking activity:', error);
    }
}

async function fetchLeaderboard(scope = 'global') {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard/?scope=${scope}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

async function redeemReward(rewardId) {
    try {
        const response = await fetch(`${API_BASE_URL}/rewards/${rewardId}/redeem/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error redeeming reward:', error);
    }
}
*/
// Generate floating particles
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.width = Math.random() * 6 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = Math.random() * 10 + 10 + 's';
    particlesContainer.appendChild(particle);
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .feature-item, .nepal-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// LEADERBOARD DATA
const leaderboardData = {
    workers: [
        {
            id: 1, name: "Rajesh Thapa", org: "Himalayan Tech", avatar: "RT",
            carbonSaved: 245.8, rank: 1, level: 15, streak: 42,
            activities: { walk: 45, publicTransport: 32, cycling: 18, meatless: 28 }
        },
        {
            id: 2, name: "Sita Gurung", org: "Nepal Telecom", avatar: "SG",
            carbonSaved: 223.4, rank: 2, level: 14, streak: 35,
            activities: { walk: 38, publicTransport: 40, cycling: 15, meatless: 30 }
        },
        {
            id: 3, name: "Anil Shrestha", org: "Ncell Pvt Ltd", avatar: "AS",
            carbonSaved: 198.2, rank: 3, level: 13, streak: 28,
            activities: { walk: 42, publicTransport: 28, cycling: 12, meatless: 25 }
        },
        {
            id: 4, name: "Binita Rai", org: "Cloud Factory", avatar: "BR",
            carbonSaved: 187.5, rank: 4, level: 12, streak: 31,
            activities: { walk: 35, publicTransport: 35, cycling: 10, meatless: 27 }
        },
        {
            id: 5, name: "Prakash Lama", org: "Leapfrog Tech", avatar: "PL",
            carbonSaved: 175.9, rank: 5, level: 12, streak: 24,
            activities: { walk: 40, publicTransport: 25, cycling: 8, meatless: 22 }
        }
    ],
    students: [
        {
            id: 6, name: "Mishel Rai", org: "Kathmandu University", avatar: "MR",
            carbonSaved: 267.3, rank: 1, level: 16, streak: 48,
            activities: { walk: 52, publicTransport: 45, cycling: 25, meatless: 35 }
        },
        {
            id: 7, name: "Prabesh Karki", org: "Tribhuvan University", avatar: "PK",
            carbonSaved: 234.6, rank: 2, level: 15, streak: 40,
            activities: { walk: 48, publicTransport: 38, cycling: 20, meatless: 32 }
        },
        {
            id: 8, name: "Sujata Tamang", org: "Pulchowk Campus", avatar: "ST",
            carbonSaved: 212.8, rank: 3, level: 14, streak: 36,
            activities: { walk: 45, publicTransport: 35, cycling: 18, meatless: 28 }
        },
        {
            id: 9, name: "Rohan Basnet", org: "St. Xavier's College", avatar: "RB",
            carbonSaved: 195.4, rank: 4, level: 13, streak: 29,
            activities: { walk: 40, publicTransport: 32, cycling: 15, meatless: 26 }
        },
        {
            id: 10, name: "Anisha Adhikari", org: "ACHS College", avatar: "AA",
            carbonSaved: 183.7, rank: 5, level: 12, streak: 27,
            activities: { walk: 38, publicTransport: 30, cycling: 12, meatless: 24 }
        }
    ],
    free: [
        {
            id: 11, name: "Deepak Maharjan", org: "Patan, Lalitpur", avatar: "DM",
            carbonSaved: 289.5, rank: 1, level: 17, streak: 55,
            activities: { walk: 60, publicTransport: 42, cycling: 30, meatless: 40 }
        },
        {
            id: 12, name: "Rina Shakya", org: "Bhaktapur", avatar: "RS",
            carbonSaved: 256.2, rank: 2, level: 16, streak: 45,
            activities: { walk: 55, publicTransport: 38, cycling: 28, meatless: 36 }
        },
        {
            id: 13, name: "Suresh Dangol", org: "Thamel, Kathmandu", avatar: "SD",
            carbonSaved: 241.8, rank: 3, level: 15, streak: 42,
            activities: { walk: 50, publicTransport: 40, cycling: 22, meatless: 34 }
        },
        {
            id: 14, name: "Kopila Magar", org: "Pokhara", avatar: "KM",
            carbonSaved: 218.3, rank: 4, level: 14, streak: 38,
            activities: { walk: 46, publicTransport: 35, cycling: 20, meatless: 30 }
        },
        {
            id: 15, name: "Bishal Thakuri", org: "Boudha, Kathmandu", avatar: "BT",
            carbonSaved: 203.6, rank: 5, level: 13, streak: 33,
            activities: { walk: 42, publicTransport: 33, cycling: 16, meatless: 28 }
        }
    ]
};

// Combine all for "all" category
const allUsers = [...leaderboardData.workers, ...leaderboardData.students, ...leaderboardData.free]
    .sort((a, b) => b.carbonSaved - a.carbonSaved)
    .map((user, index) => ({ ...user, rank: index + 1 }))
    .slice(0, 10);

// Get rank class
function getRankClass(rank) {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
}

// Get rank display
function getRankDisplay(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
}

// Render leaderboard
function renderLeaderboard(category) {
    let data;
    switch(category) {
        case 'workers':
            data = leaderboardData.workers;
            break;
        case 'students':
            data = leaderboardData.students;
            break;
        case 'free':
            data = leaderboardData.free;
            break;
        default:
            data = allUsers;
    }

    const container = document.getElementById('leaderboardContainer');
    container.innerHTML = data.map(user => `
        <div class="leaderboard-item">
            <div class="rank-badge ${getRankClass(user.rank)}">
                ${getRankDisplay(user.rank)}
            </div>
            
            <div class="user-avatar">${user.avatar}</div>
            
            <div class="user-info">
                <div class="user-name">
                    ${user.name}
                    <span class="level-badge">
                        ⚡ Lvl ${user.level}
                    </span>
                </div>
                <div class="user-org">${user.org}</div>
                
                <div class="activity-grid">
                    <div class="activity-item">
                        <span class="activity-label">Walking</span>
                        <span class="activity-value">${user.activities.walk} days</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Transit</span>
                        <span class="activity-value">${user.activities.publicTransport} rides</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Cycling</span>
                        <span class="activity-value">${user.activities.cycling} trips</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Meatless</span>
                        <span class="activity-value">${user.activities.meatless} meals</span>
                    </div>
                </div>
                
                <span class="streak-badge">
                    🔥 ${user.streak} day streak
                </span>
            </div>
            
            <div class="carbon-saved">
                <div class="carbon-amount">
                    🌱 ${user.carbonSaved}
                </div>
                <div class="carbon-label">kg CO₂ saved</div>
                <div class="trees-equivalent">≈ ${(user.carbonSaved / 21).toFixed(1)} trees planted</div>
            </div>
        </div>
    `).join('');
}

// Category tab switching
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-category');
        renderLeaderboard(category);
    });
});

// Initial render
renderLeaderboard('all');

// COUPON SYSTEM DATA
const couponsData = [
    {
        id: 1,
        brand: "Sajha Yatayat",
        logo: "🚌",
        title: "Free Bus Ride",
        description: "Valid on all Sajha Yatayat routes within Kathmandu Valley",
        points: 150,
        validity: "Valid for 30 days",
        available: true
    },
    {
        id: 2,
        brand: "Himalayan Java",
        logo: "☕",
        title: "20% Off Any Beverage",
        description: "Discount on any coffee, tea, or specialty drink",
        points: 200,
        validity: "Valid for 45 days",
        available: true
    },
    {
        id: 3,
        brand: "Bhat Bhateni",
        logo: "🛒",
        title: "Rs. 500 Off on Groceries",
        description: "Minimum purchase of Rs. 2000 required",
        points: 400,
        validity: "Valid for 60 days",
        available: true
    },
    {
        id: 4,
        brand: "Fresh Basket",
        logo: "🥗",
        title: "Free Organic Vegetables",
        description: "Get 1kg of seasonal organic vegetables",
        points: 300,
        validity: "Valid for 15 days",
        available: true
    },
    {
        id: 5,
        brand: "Daraz",
        logo: "📦",
        title: "Rs. 1000 Voucher",
        description: "Use on any Daraz purchase",
        points: 800,
        validity: "Valid for 90 days",
        available: true
    },
    {
        id: 6,
        brand: "Pathao",
        logo: "🛵",
        title: "3 Free Rides",
        description: "Worth Rs. 100 each ride",
        points: 250,
        validity: "Valid for 30 days",
        available: true
    },
    {
        id: 7,
        brand: "Moksh",
        logo: "🍔",
        title: "Free Vegan Meal",
        description: "Any vegan burger or bowl",
        points: 350,
        validity: "Valid for 30 days",
        available: false
    },
    {
        id: 8,
        brand: "Thamel Eco Resort",
        logo: "🏨",
        title: "30% Off Stay",
        description: "Discount on weekend bookings",
        points: 600,
        validity: "Valid for 60 days",
        available: true
    }
];

// Render coupons
function renderCoupons() {
    const container = document.getElementById('couponsGrid');
    container.innerHTML = couponsData.map(coupon => `
        <div class="coupon-card">
            <div class="coupon-header">
                <div class="coupon-brand">
                    <div class="brand-logo">${coupon.logo}</div>
                    <div class="brand-name">${coupon.brand}</div>
                </div>
                <div class="coupon-points">${coupon.points} pts</div>
            </div>
            <h4 class="coupon-title">${coupon.title}</h4>
            <p class="coupon-description">${coupon.description}</p>
            <div class="coupon-footer">
                <span class="coupon-validity">${coupon.validity}</span>
                <button class="redeem-btn" ${!coupon.available ? 'disabled' : ''} onclick="redeemCoupon(${coupon.id}, ${coupon.points})">
                    ${coupon.available ? 'Redeem' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `).join('');
}

// User points (this would come from a database in real app)
let userPoints = 2450;

// Redeem coupon
function redeemCoupon(couponId, points) {
    if (userPoints >= points) {
        userPoints -= points;
        updatePointsDisplay();
        alert(`Coupon redeemed successfully! You now have ${userPoints} points remaining.`);
        // In a real app, this would save to database and add to user's coupon list
    } else {
        alert(`Insufficient points! You need ${points - userPoints} more points to redeem this coupon.`);
    }
}

// Update points display
function updatePointsDisplay() {
    const pointsElement = document.querySelector('.points-amount');
    if (pointsElement) {
        pointsElement.textContent = `${userPoints.toLocaleString()} pts`;
    }
}

// Donation buttons
const donateButtons = document.querySelectorAll('.donate-btn:not(.custom-donate)');
donateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const points = parseInt(btn.getAttribute('data-points'));
        const trees = parseInt(btn.getAttribute('data-trees'));
        
        if (userPoints >= points) {
            const confirmed = confirm(`Donate ${points} points to plant ${trees} trees?`);
            if (confirmed) {
                userPoints -= points;
                updatePointsDisplay();
                alert(`Thank you! You've donated ${points} points to plant ${trees} trees for Nepal! 🌳`);
                // In real app, would update campaign progress
            }
        } else {
            alert(`You need ${points - userPoints} more points to make this donation.`);
        }
    });
});

// Custom donation
const customDonateBtn = document.querySelector('.custom-donate');
if (customDonateBtn) {
    customDonateBtn.addEventListener('click', () => {
        const customPoints = prompt('How many points would you like to donate? (20 points = 1 tree)');
        if (customPoints && !isNaN(customPoints) && customPoints > 0) {
            const points = parseInt(customPoints);
            if (userPoints >= points) {
                const trees = Math.floor(points / 20);
                const confirmed = confirm(`Donate ${points} points to plant ${trees} trees?`);
                if (confirmed) {
                    userPoints -= points;
                    updatePointsDisplay();
                    alert(`Amazing! You've donated ${points} points to plant ${trees} trees! 🌳✨`);
                }
            } else {
                alert(`You need ${points - userPoints} more points to make this donation.`);
            }
        }
    });
}

// Initialize coupons
renderCoupons();

// DASHBOARD FEATURES

// Activity Logger
const activityButtons = document.querySelectorAll('.activity-btn');
let todayCarbon = 4.2;
let todayPoints = 42;

activityButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const activity = this.getAttribute('data-activity');
        const carbonSaved = parseFloat(this.getAttribute('data-carbon'));
        
        // Add animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
        
        // Update stats
        todayCarbon += carbonSaved;
        todayPoints += Math.round(carbonSaved * 10);
        
        // Update display
        updateDashboardStats();
        
        // Show notification
        showNotification(`Great! You've logged ${activity} and saved ${carbonSaved}kg CO₂!`);
    });
});

function updateDashboardStats() {
    const carbonElement = document.querySelector('.summary-stats .stat-value');
    const pointsElements = document.querySelectorAll('.summary-stats .stat-value');
    
    if (carbonElement) {
        carbonElement.textContent = todayCarbon.toFixed(1) + ' kg';
    }
    if (pointsElements[1]) {
        pointsElements[1].textContent = todayPoints + ' pts';
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Carbon Calculator
function calculateCarbon() {
    const activity = document.getElementById('calcActivity').value;
    const distance = parseFloat(document.getElementById('calcDistance').value) || 0;
    
    if (distance <= 0) {
        alert('Please enter a valid distance/quantity');
        return;
    }
    
    let carbonSaved = 0;
    let activityName = '';
    
    switch(activity) {
        case 'car':
            carbonSaved = distance * 0.21; // kg CO2 per km
            activityName = 'walking instead of driving';
            break;
        case 'bike':
            carbonSaved = distance * 0.08;
            activityName = 'taking bus instead of motorcycle';
            break;
        case 'flight':
            carbonSaved = distance * 0.15;
            activityName = 'taking train instead of flying';
            break;
        case 'meat':
            carbonSaved = distance * 2.5; // per meal
            activityName = 'eating vegan instead of beef';
            break;
    }
    
    const resultDiv = document.getElementById('calcResult');
    resultDiv.innerHTML = `
        <div class="result-icon">🌱</div>
        <div class="result-text">${carbonSaved.toFixed(2)} kg CO₂ saved!</div>
        <div class="result-subtext">By ${activityName} ${distance} ${activity === 'meat' ? 'meals' : 'km'}</div>
    `;
    resultDiv.style.animation = 'pulse 0.5s ease';
}

// Simple chart visualization (using canvas)
const chartCanvas = document.getElementById('weeklyChart');
if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    const width = chartCanvas.parentElement.clientWidth;
    const height = 200;
    chartCanvas.width = width;
    chartCanvas.height = height;
    
    // Weekly data (Mon-Sun)
    const weekData = [3.2, 5.1, 4.8, 6.2, 5.5, 4.9, 4.5];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Draw bars
    const barWidth = width / 7 - 20;
    const maxValue = Math.max(...weekData);
    
    weekData.forEach((value, i) => {
        const barHeight = (value / maxValue) * (height - 40);
        const x = i * (width / 7) + 10;
        const y = height - barHeight - 20;
        
        // Draw bar
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value on top
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(value + 'kg', x + barWidth/2, y - 5);
        
        // Draw day label
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px sans-serif';
        ctx.fillText(days[i], x + barWidth/2, height - 5);
    });
}