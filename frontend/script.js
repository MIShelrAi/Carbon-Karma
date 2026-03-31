/**
 * CARBON KARMA - FUTURISTIC JAVASCRIPT
 * All functions connected and working
 */

'use strict';

// ===== STATE MANAGEMENT =====
const APP_STATE = {
  user: {
    points: 2450,
    carbonSaved: 4.2,
    streak: 7,
    todayPoints: 42,
    weekGoal: 50,
    weekSaved: 34
  },
  leaderboard: {
    currentCategory: 'all',
    data: [
      { rank: 1, name: 'Deepak Maharjan', avatar: 'DM', carbon: 48.5, points: 485, category: 'workers' },
      { rank: 2, name: 'Mishel Rai', avatar: 'MR', carbon: 42.3, points: 423, category: 'free' },
      { rank: 3, name: 'Rina Shakya', avatar: 'RS', carbon: 38.7, points: 387, category: 'students' },
      { rank: 4, name: 'Sanjay Thapa', avatar: 'ST', carbon: 35.2, points: 352, category: 'workers' },
      { rank: 5, name: 'Priya Gurung', avatar: 'PG', carbon: 32.8, points: 328, category: 'students' },
      { rank: 6, name: 'Rajesh Shrestha', avatar: 'RSh', carbon: 30.4, points: 304, category: 'free' },
      { rank: 7, name: 'Maya Tamang', avatar: 'MT', carbon: 28.9, points: 289, category: 'workers' },
      { rank: 8, name: 'Bikash Magar', avatar: 'BM', carbon: 26.5, points: 265, category: 'students' },
      { rank: 9, name: 'Sunita Rai', avatar: 'SR', carbon: 24.3, points: 243, category: 'free' },
      { rank: 10, name: 'Kiran Adhikari', avatar: 'KA', carbon: 22.7, points: 227, category: 'workers' }
    ]
  },
  rewards: [
    { id: 1, name: 'Free Bus Ride', provider: 'Sajha Yatayat', cost: 500, icon: '🚌' },
    { id: 2, name: '10% Coffee', provider: 'Himalayan Java', cost: 250, icon: '☕' },
    { id: 3, name: '15% Meal', provider: 'Bhojan Griha', cost: 350, icon: '🍽️' },
    { id: 4, name: 'Free Bike', provider: 'EcoBike', cost: 600, icon: '🚴' },
    { id: 5, name: '20% Groceries', provider: 'Bhat Bhateni', cost: 800, icon: '🛒' },
    { id: 6, name: 'Plant Tree', provider: 'Carbon Karma', cost: 1000, icon: '🌳' }
  ],
  calculator: {
    formulas: {
      car: (d) => d * 0.21,
      bike: (d) => d * 0.08,
      flight: (d) => d * 0.25,
      meat: (m) => m * 2.5
    }
  }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  lerp: (start, end, t) => {
    return start + (end - start) * t;
  },
  
  easeOutCubic: (t) => {
    return 1 - Math.pow(1 - t, 3);
  },
  
  animateNumber: (element, target, duration = 2000, decimals = 0) => {
    const start = parseFloat(element.textContent) || 0;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = Utils.easeOutCubic(progress);
      const current = Utils.lerp(start, target, eased);
      
      element.textContent = decimals > 0 
        ? current.toFixed(decimals)
        : Math.round(current).toString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  },
  
  showToast: (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideInToast 0.4s reverse';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },
  
  getCurrentDate: () => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }
};

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 80;
    this.resize();
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }
  
  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 255, 159, ${p.opacity})`;
      this.ctx.fill();
    });
    
    // Draw connections
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 255, 159, ${0.2 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// ===== NAVIGATION =====
const Navigation = {
  init() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenu && navLinks) {
      mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });
      
      // Close menu when link clicked
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          mobileMenu.classList.remove('active');
        });
      });
    }
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
    
    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 14, 39, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.7)';
      } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.8)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
      }
      
      lastScroll = currentScroll;
    });
  }
};

// ===== ACTIVITY LOGGER =====
const ActivityLogger = {
  init() {
    document.querySelectorAll('.activity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const carbon = parseFloat(btn.dataset.carbon);
        const activity = btn.dataset.activity;
        const icon = btn.dataset.icon;
        
        this.logActivity(activity, carbon, icon);
      });
    });
  },
  
  logActivity(activity, carbon, icon) {
    APP_STATE.user.carbonSaved += carbon;
    APP_STATE.user.todayPoints += carbon * 10;
    APP_STATE.user.points += carbon * 10;
    APP_STATE.user.weekSaved += carbon;
    
    // Update UI
    this.updateDashboard();
    
    // Show success toast
    Utils.showToast(`${icon} Logged! Saved ${carbon}kg CO₂ (+${carbon * 10} points)`, 'success');
    
    // Animate button
    const allBtns = document.querySelectorAll('.activity-btn');
    allBtns.forEach(b => {
      if (b.dataset.activity === activity) {
        b.style.transform = 'scale(0.95)';
        setTimeout(() => {
          b.style.transform = '';
        }, 200);
      }
    });
  },
  
  updateDashboard() {
    // Update today's stats
    const carbonEl = document.getElementById('today-carbon');
    const pointsEl = document.getElementById('today-points');
    const userPointsEl = document.getElementById('user-points');
    
    if (carbonEl) Utils.animateNumber(carbonEl, APP_STATE.user.carbonSaved, 1000, 1);
    if (pointsEl) Utils.animateNumber(pointsEl, APP_STATE.user.todayPoints, 1000, 0);
    if (userPointsEl) Utils.animateNumber(userPointsEl, APP_STATE.user.points, 1000, 0);
    
    // Update week progress
    const percent = Math.round((APP_STATE.user.weekSaved / APP_STATE.user.weekGoal) * 100);
    const percentEl = document.getElementById('week-percent');
    if (percentEl) percentEl.textContent = `${percent}%`;
  }
};

// ===== CALCULATOR =====
const Calculator = {
  init() {
    const form = document.getElementById('calc-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculate();
      });
    }
  },
  
  calculate() {
    const activity = document.getElementById('calc-activity').value;
    const distance = parseFloat(document.getElementById('calc-distance').value) || 0;
    const resultEl = document.getElementById('calc-result');
    
    if (distance <= 0) {
      resultEl.innerHTML = `
        <div class="result-icon">⚠️</div>
        <div class="result-text">PLEASE ENTER VALID NUMBER</div>
      `;
      return;
    }
    
    const saved = APP_STATE.calculator.formulas[activity](distance);
    const trees = (saved / 21).toFixed(1);
    const points = Math.round(saved * 10);
    
    resultEl.innerHTML = `
      <div class="result-icon">✅</div>
      <div style="font-size: 2.5rem; font-weight: 900; color: var(--neon-cyan); text-shadow: var(--glow-md); margin: 1rem 0;">
        ${saved.toFixed(2)} KG CO₂
      </div>
      <div class="result-text">= ${trees} TREES = ${points} POINTS</div>
    `;
    
    resultEl.style.animation = 'none';
    setTimeout(() => {
      resultEl.style.animation = 'slideUp 0.6s ease-out';
    }, 10);
  }
};

// ===== LEADERBOARD =====
const Leaderboard = {
  init() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        this.render(category);
      });
    });
    
    this.render('all');
    this.displayUserRank();
  },
  
  displayUserRank() {
    const user = this.getCurrentUser();
    const yourRankCard = document.getElementById('your-rank-card');
    
    if (!user) {
      // User not logged in, hide the card
      if (yourRankCard) yourRankCard.style.display = 'none';
      return;
    }
    
    // Calculate user's rank based on points
    const userRank = this.calculateUserRank(user);
    
    if (yourRankCard && userRank) {
      yourRankCard.style.display = 'block';
      
      // Update rank display
      document.getElementById('your-rank-number').textContent = `#${userRank.rank}`;
      document.getElementById('your-rank-stats').textContent = `${user.points} PTS • ${user.carbonSaved} KG SAVED`;
      
      // Update medal emoji
      const medal = document.getElementById('your-rank-medal');
      if (userRank.rank === 1) medal.textContent = '🥇';
      else if (userRank.rank === 2) medal.textContent = '🥈';
      else if (userRank.rank === 3) medal.textContent = '🥉';
      else if (userRank.rank <= 10) medal.textContent = '⭐';
      else medal.textContent = '🎯';
      
      // Update progress text
      const progressText = document.getElementById('progress-text');
      const nextRankPoints = userRank.nextRankPoints;
      const pointsNeeded = Math.max(0, nextRankPoints - user.points);
      
      if (userRank.rank === 1) {
        progressText.textContent = '👑 YOU ARE THE LEADER!';
      } else {
        progressText.textContent = `${pointsNeeded} points to rank #${userRank.rank - 1}`;
      }
      
      // Update progress icon
      const progressIcon = document.getElementById('progress-icon');
      if (userRank.rank <= 3) progressIcon.textContent = '🚀';
      else if (userRank.rank <= 10) progressIcon.textContent = '📈';
      else progressIcon.textContent = '💪';
    }
  },
  
  calculateUserRank(user) {
    // Get all leaderboard data sorted by points (descending)
    const sorted = [...APP_STATE.leaderboard.data].sort((a, b) => b.points - a.points);
    
    // Find user's rank
    let rank = 1;
    let nextRankPoints = 0;
    
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].points < user.points) {
        rank = i + 1;
        nextRankPoints = sorted[i - 1] ? sorted[i - 1].points : user.points;
        break;
      }
    }
    
    // If user didn't find a position, they're at the end
    if (rank === 1 && sorted[0].points < user.points) {
      rank = 1;
      nextRankPoints = user.points;
    } else if (rank === 1) {
      nextRankPoints = sorted.length > 1 ? sorted[1].points : user.points;
    }
    
    return { rank, nextRankPoints };
  },
  
  getCurrentUser() {
    const data = localStorage.getItem('carbonKarmaUser');
    return data ? JSON.parse(data) : null;
  },
  
  render(category) {
    APP_STATE.leaderboard.currentCategory = category;
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    
    const currentUser = this.getCurrentUser();
    
    const filtered = category === 'all'
      ? APP_STATE.leaderboard.data
      : APP_STATE.leaderboard.data.filter(u => u.category === category);
    
    container.innerHTML = filtered.map((user, idx) => {
      const isCurrentUser = currentUser && currentUser.email === user.email;
      const highlightClass = isCurrentUser ? 'current-user' : '';
      
      return `
      <div class="leader-entry ${highlightClass}" style="animation: slideUp 0.4s ${idx * 0.05}s both">
        <div class="leader-rank">
          <span class="rank-num ${user.rank <= 3 ? 'top' : ''}">#${user.rank}</span>
          ${user.rank === 1 ? '<span class="rank-medal">🥇</span>' : ''}
          ${user.rank === 2 ? '<span class="rank-medal">🥈</span>' : ''}
          ${user.rank === 3 ? '<span class="rank-medal">🥉</span>' : ''}
        </div>
        <div class="leader-avatar">${user.avatar}</div>
        <div class="leader-info">
          <div class="leader-name">${user.name}${isCurrentUser ? ' <span class="you-badge">YOU</span>' : ''}</div>
          <div class="leader-stats">
            <span>🌱 ${user.carbon}kg</span>
            <span>⭐ ${user.points} pts</span>
          </div>
        </div>
      </div>
    `;
    }).join('');
    
    this.applyStyles();
  },
  
  applyStyles() {
    if (document.getElementById('leader-entry-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'leader-entry-styles';
    style.textContent = `
      .leader-entry {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding: 2rem;
        background: rgba(19, 24, 51, 0.8);
        border: 1px solid var(--cyber-border);
        border-radius: 8px;
        margin-bottom: 1.5rem;
        transition: all 0.3s var(--ease-cyber);
      }
      .leader-entry:hover {
        border-color: var(--neon-cyan);
        transform: translateX(10px);
        box-shadow: var(--glow-md);
      }
      .leader-rank {
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 100px;
      }
      .rank-num {
        font-family: var(--font-display);
        font-size: 2rem;
        font-weight: 900;
        color: var(--text-muted);
      }
      .rank-num.top {
        color: var(--neon-cyan);
        text-shadow: var(--glow-sm);
      }
      .rank-medal {
        font-size: 2rem;
        filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.5));
      }
      .leader-avatar {
        width: 70px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
        color: var(--cyber-darker);
        border-radius: 50%;
        font-family: var(--font-display);
        font-size: 1.5rem;
        font-weight: 900;
        box-shadow: var(--glow-md);
      }
      .leader-info {
        flex: 1;
      }
      .leader-name {
        font-size: 1.375rem;
        font-weight: 700;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
      }
      .leader-stats {
        display: flex;
        gap: 1.5rem;
        font-size: 0.9375rem;
        color: var(--text-secondary);
      }
      .leader-entry.current-user {
        background: rgba(0, 255, 159, 0.1);
        border: 2px solid var(--neon-cyan);
        box-shadow: 0 0 20px rgba(0, 255, 159, 0.3);
      }
      .leader-entry.current-user:hover {
        box-shadow: 0 0 30px rgba(0, 255, 159, 0.5);
      }
      .you-badge {
        display: inline-block;
        background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
        color: var(--cyber-darker);
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        margin-left: 0.5rem;
        box-shadow: 0 0 10px rgba(0, 255, 159, 0.5);
      }
    `;
    document.head.appendChild(style);
  }
};

// ===== REWARDS =====
const Rewards = {
  init() {
    this.renderRewards();
  },
  
  renderRewards() {
    const grid = document.getElementById('rewards-grid');
    if (!grid) return;
    
    grid.innerHTML = APP_STATE.rewards.map(reward => `
      <div class="reward-card" data-id="${reward.id}">
        <div class="reward-icon">${reward.icon}</div>
        <h4 class="reward-name">${reward.name}</h4>
        <p class="reward-provider">${reward.provider}</p>
        <div class="reward-cost-badge">${reward.cost} PTS</div>
        <button class="reward-redeem-btn" onclick="Rewards.redeem(${reward.id}, ${reward.cost})">
          REDEEM NOW
        </button>
      </div>
    `).join('');
    
    this.applyStyles();
  },
  
  redeem(id, cost) {
    if (APP_STATE.user.points < cost) {
      Utils.showToast('❌ NOT ENOUGH POINTS!', 'error');
      return;
    }
    
    APP_STATE.user.points -= cost;
    
    const reward = APP_STATE.rewards.find(r => r.id === id);
    Utils.showToast(`✅ ${reward.icon} ${reward.name} REDEEMED!`, 'success');
    
    // Update points display
    const userPointsEl = document.getElementById('user-points');
    if (userPointsEl) Utils.animateNumber(userPointsEl, APP_STATE.user.points, 1000, 0);
  },
  
  applyStyles() {
    if (document.getElementById('reward-card-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'reward-card-styles';
    style.textContent = `
      .reward-card {
        padding: 2.5rem 2rem;
        background: rgba(19, 24, 51, 0.8);
        border: 1px solid var(--cyber-border);
        border-radius: 8px;
        text-align: center;
        transition: all 0.3s var(--ease-cyber);
      }
      .reward-card:hover {
        border-color: var(--neon-cyan);
        transform: translateY(-10px);
        box-shadow: var(--glow-lg);
      }
      .reward-icon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
        filter: drop-shadow(0 0 20px rgba(0, 255, 159, 0.3));
      }
      .reward-name {
        font-size: 1.375rem;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
        letter-spacing: 1px;
      }
      .reward-provider {
        font-size: 0.9375rem;
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
      }
      .reward-cost-badge {
        display: inline-block;
        padding: 0.625rem 1.25rem;
        background: rgba(0, 255, 159, 0.2);
        border: 1px solid var(--neon-cyan);
        border-radius: 20px;
        font-family: var(--font-display);
        font-weight: 700;
        color: var(--neon-cyan);
        margin-bottom: 1.5rem;
        box-shadow: var(--glow-sm);
      }
      .reward-redeem-btn {
        width: 100%;
        padding: 1rem;
        background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
        color: var(--cyber-darker);
        border-radius: 4px;
        font-family: var(--font-display);
        font-weight: 700;
        letter-spacing: 2px;
        box-shadow: var(--glow-md);
        transition: all 0.3s var(--ease-cyber);
      }
      .reward-redeem-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 0 40px rgba(0, 255, 159, 0.6);
      }
    `;
    document.head.appendChild(style);
  }
};

// ===== DONATIONS =====
const Donations = {
  init() {
    document.querySelectorAll('.donate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('custom')) {
          this.customDonate();
        } else {
          const points = parseInt(btn.dataset.points);
          const trees = parseInt(btn.dataset.trees);
          this.donate(points, trees);
        }
      });
    });
  },
  
  donate(points, trees) {
    if (APP_STATE.user.points < points) {
      Utils.showToast('❌ NOT ENOUGH POINTS!', 'error');
      return;
    }
    
    APP_STATE.user.points -= points;
    Utils.showToast(`🌳 ${trees} TREES PLANTED! THANK YOU!`, 'success');
    
    // Update points
    const userPointsEl = document.getElementById('user-points');
    if (userPointsEl) Utils.animateNumber(userPointsEl, APP_STATE.user.points, 1000, 0);
  },
  
  customDonate() {
    const amount = prompt('HOW MANY POINTS TO DONATE? (20 PTS = 1 TREE)');
    if (!amount) return;
    
    const points = parseInt(amount);
    if (isNaN(points) || points < 20) {
      Utils.showToast('❌ MINIMUM 20 POINTS', 'error');
      return;
    }
    
    if (APP_STATE.user.points < points) {
      Utils.showToast('❌ NOT ENOUGH POINTS!', 'error');
      return;
    }
    
    const trees = Math.floor(points / 20);
    APP_STATE.user.points -= points;
    Utils.showToast(`🌳 ${trees} TREES PLANTED! AMAZING!`, 'success');
    
    const userPointsEl = document.getElementById('user-points');
    if (userPointsEl) Utils.animateNumber(userPointsEl, APP_STATE.user.points, 1000, 0);
  }
};

// ===== PROGRESS CHART =====
const ProgressChart = {
  init() {
    const canvas = document.getElementById('progress-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    
    const data = [3.2, 4.5, 3.8, 5.2, 4.8, 6.1, 4.2];
    const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    const max = Math.max(...data);
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.length;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 159, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Draw bars
    data.forEach((value, idx) => {
      const barHeight = (value / max) * chartHeight;
      const x = padding + idx * barWidth + barWidth * 0.2;
      const y = height - padding - barHeight;
      const w = barWidth * 0.6;
      
      // Gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
      gradient.addColorStop(0, '#00ff9f');
      gradient.addColorStop(1, '#00d4ff');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, w, barHeight);
      
      // Glow
      ctx.shadowColor = 'rgba(0, 255, 159, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, w, barHeight);
      ctx.shadowBlur = 0;
      
      // Labels
      ctx.fillStyle = '#a8b2d1';
      ctx.font = '12px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText(labels[idx], x + w / 2, height - padding + 20);
      
      // Values
      ctx.fillStyle = '#00ff9f';
      ctx.font = 'bold 12px Orbitron';
      ctx.fillText(value.toFixed(1), x + w / 2, y - 10);
    });
  }
};

// ===== INTERSECTION OBSERVER =====
const Observer = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.cyber-card, .problem-card, .feature-card, .nepal-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
      observer.observe(el);
    });
  }
};

// ===== PROFILE MANAGEMENT =====
const ProfileManager = {
  init() {
    this.checkAuthStatus();
    this.setupProfileMenu();
  },
  
  checkAuthStatus() {
    const user = this.getUserData();
    const profileItem = document.getElementById('profile-item');
    const getStartedLink = document.getElementById('get-started-link');
    
    if (user && user.isAuthenticated) {
      // User is authenticated - show profile, hide get started
      if (profileItem) profileItem.classList.remove('hidden');
      if (getStartedLink) getStartedLink.classList.add('hidden');
      this.updateProfileUI(user);
    } else {
      // User is not authenticated - hide profile, show get started
      if (profileItem) profileItem.classList.add('hidden');
      if (getStartedLink) getStartedLink.classList.remove('hidden');
    }
  },
  
  updateProfileUI(user) {
    // Generate initials from name
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Update small avatar
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) {
      profileAvatar.textContent = initials;
      profileAvatar.style.background = this.getColorForUser(initials);
    }
    
    // Update large avatar
    const profileAvatarLg = document.getElementById('profile-avatar-lg');
    if (profileAvatarLg) {
      profileAvatarLg.textContent = initials;
    }
    
    // Update name and email
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    if (profileName) profileName.textContent = user.name.toUpperCase();
    if (profileEmail) profileEmail.textContent = user.email;
    
    // Update stats
    const profilePoints = document.getElementById('profile-points');
    const profileCarbon = document.getElementById('profile-carbon');
    if (profilePoints) profilePoints.textContent = (user.points || 0).toString();
    if (profileCarbon) profileCarbon.textContent = (user.carbonSaved || 0).toFixed(1);
  },
  
  setupProfileMenu() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-menu')) {
          profileDropdown.classList.remove('active');
        }
      });
    }
  },
  
  getUserData() {
    const data = localStorage.getItem('carbonKarmaUser');
    return data ? JSON.parse(data) : null;
  },
  
  getColorForUser(initials) {
    const colors = [
      'linear-gradient(135deg, #00ff9f, #00d4ff)',
      'linear-gradient(135deg, #b857ff, #ff006e)',
      'linear-gradient(135deg, #ffea00, #ff6b00)',
      'linear-gradient(135deg, #00ff9f, #b857ff)',
      'linear-gradient(135deg, #00d4ff, #ff006e)'
    ];
    
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
};

// ===== LOGOUT FUNCTION =====
function logoutUser() {
  const confirmed = confirm('Are you sure you want to logout?');
  if (confirmed) {
    localStorage.removeItem('carbonKarmaUser');
    window.location.href = 'index.html#home';
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 CARBON KARMA SYSTEM INITIALIZED');
  
  // Initialize profile manager first
  ProfileManager.init();
  
  // Initialize all systems
  new ParticleSystem('particles-hero');
  Navigation.init();
  ActivityLogger.init();
  Calculator.init();
  Leaderboard.init();
  Rewards.init();
  Donations.init();
  ProgressChart.init();
  Observer.init();
  
  // Animate hero stats
  const statCarbon = document.getElementById('stat-carbon');
  const statUsers = document.getElementById('stat-users');
  const statImpact = document.getElementById('stat-impact');
  
  if (statCarbon) Utils.animateNumber(statCarbon, 2.3, 2000, 1);
  if (statUsers) Utils.animateNumber(statUsers, 1247, 2000, 0);
  if (statImpact) Utils.animateNumber(statImpact, 3247, 2000, 0);
  
  // Set current date
  const dateEl = document.getElementById('today-date');
  if (dateEl) dateEl.textContent = Utils.getCurrentDate();
  
  // Update community total
  const communityTotal = document.getElementById('community-total');
  if (communityTotal) {
    const total = APP_STATE.leaderboard.data.reduce((sum, u) => sum + u.carbon, 0);
    communityTotal.textContent = `${total.toFixed(0)} KG`;
  }
});

// Export for onclick handlers
window.Rewards = Rewards;
window.Donations = Donations;
window.logoutUser = logoutUser; 
async function sendMessage(message, language) {
    const response = await fetch('http://localhost:5000/ai-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, language })
    });

    const data = await response.json();
    addMessage('assistant', data.reply);
}
