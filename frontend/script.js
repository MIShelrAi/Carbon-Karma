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
    
    
    document.querySelectorAll('.primary-btn, .cta-btn').forEach(button => {
        button.addEventListener('click', function(e) {
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
