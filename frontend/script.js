/**
 * CARBON KARMA - PREMIUM JAVASCRIPT
 * Advanced interactions, canvas particles, smooth animations
 */

'use strict';

// ===== APP STATE =====
const STATE = {
  points: 2450,
  carbonSaved: 4.2,
  streak: 7,
  currentTab: 'all',
  userCategory: 'all'
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  formatNumber: (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  
  lerp: (start, end, t) => start + (end - start) * t,
  
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  
  showToast: (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
      z-index: 9999;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      font-weight: 600;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  animateNumber: (element, target, duration = 2000) => {
    const start = parseFloat(element.textContent) || 0;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = Utils.easeOutCubic(progress);
      const current = Utils.lerp(start, target, eased);
      
      element.textContent = target % 1 === 0 
        ? Math.round(current).toString()
        : current.toFixed(1);
      
      if (progress < 1) requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }
};

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 60;
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
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
      this.ctx.fill();
    });
    
    // Draw connections
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 150)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// ===== LEADERBOARD MANAGER =====
const Leaderboard = {
  data: {
    all: [
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
  
  init() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.render(tab.dataset.cat);
      });
    });
    this.render('all');
  },
  
  render(category) {
    STATE.currentTab = category;
    const container = document.getElementById('leaders');
    if (!container) return;
    
    const filtered = category === 'all'
      ? this.data.all
      : this.data.all.filter(u => u.category === category);
    
    container.innerHTML = filtered.map((user, idx) => `
      <div class="leader-item" style="animation: fadeUp 0.4s ${idx * 0.05}s both">
        <div class="leader-rank">
          <span class="rank-num ${user.rank <= 3 ? 'top' : ''}">#${user.rank}</span>
          ${user.rank === 1 ? '<span class="medal">🥇</span>' : ''}
          ${user.rank === 2 ? '<span class="medal">🥈</span>' : ''}
          ${user.rank === 3 ? '<span class="medal">🥉</span>' : ''}
        </div>
        <div class="leader-avatar">${user.avatar}</div>
        <div class="leader-info">
          <div class="leader-name">${user.name}</div>
          <div class="leader-stats">
            <span>🌱 ${user.carbon}kg</span>
            <span>⭐ ${user.points} pts</span>
          </div>
        </div>
      </div>
    `).join('');
    
    this.applyStyles();
  },
  
  applyStyles() {
    if (document.getElementById('leader-styles')) return;
    const style = document.createElement('style');
    style.id = 'leader-styles';
    style.textContent = `
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .leader-item {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.5rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        margin-bottom: 1rem;
        transition: all 0.2s;
      }
      .leader-item:hover {
        transform: translateX(8px);
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      }
      .leader-rank {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 80px;
      }
      .rank-num {
        font-size: 1.5rem;
        font-weight: 800;
        color: #6b7280;
      }
      .rank-num.top {
        color: #059669;
      }
      .medal {
        font-size: 1.5rem;
      }
      .leader-avatar {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border-radius: 50%;
        font-size: 1.25rem;
        font-weight: 700;
      }
      .leader-info {
        flex: 1;
      }
      .leader-name {
        font-size: 1.125rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      .leader-stats {
        display: flex;
        gap: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
      }
    `;
    document.head.appendChild(style);
  }
};

// ===== REWARDS MANAGER =====
const Rewards = {
  items: [
    { id: 1, title: 'Free Bus Ride', provider: 'Sajha Yatayat', cost: 500, discount: '100%', icon: '🚌' },
    { id: 2, title: '10% Coffee', provider: 'Himalayan Java', cost: 250, discount: '10%', icon: '☕' },
    { id: 3, title: '15% Meal', provider: 'Bhojan Griha', cost: 350, discount: '15%', icon: '🍽️' },
    { id: 4, title: 'Free Bike', provider: 'EcoBike Nepal', cost: 600, discount: '100%', icon: '🚴' },
    { id: 5, title: '20% Groceries', provider: 'Bhat Bhateni', cost: 800, discount: '20%', icon: '🛒' },
    { id: 6, title: 'Plant Tree', provider: 'Carbon Karma', cost: 1000, discount: 'Gift', icon: '🌳' }
  ],
  
  init() {
    this.render();
  },
  
  render() {
    const grid = document.getElementById('rewards-grid');
    if (!grid) return;
    
    grid.innerHTML = this.items.map(item => `
      <div class="reward-card" data-id="${item.id}">
        <div class="reward-icon">${item.icon}</div>
        <h4 class="reward-title">${item.title}</h4>
        <p class="reward-provider">${item.provider}</p>
        <div class="reward-discount">${item.discount} OFF</div>
        <button class="reward-btn" onclick="Rewards.redeem(${item.id}, ${item.cost})">
          Redeem ${item.cost} pts
        </button>
      </div>
    `).join('');
    
    this.applyStyles();
  },
  
  redeem(id, cost) {
    if (STATE.points < cost) {
      Utils.showToast('Not enough points!', 'error');
      return;
    }
    STATE.points -= cost;
    Utils.showToast('Coupon redeemed! 🎉', 'success');
    document.querySelector('.pts-val').textContent = Utils.formatNumber(STATE.points);
  },
  
  applyStyles() {
    if (document.getElementById('reward-styles')) return;
    const style = document.createElement('style');
    style.id = 'reward-styles';
    style.textContent = `
      .reward-card {
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        text-align: center;
        border: 2px solid #e5e7eb;
        transition: all 0.2s;
      }
      .reward-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        border-color: #10b981;
      }
      .reward-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      .reward-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      .reward-provider {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 1rem;
      }
      .reward-discount {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #fb923c, #f97316);
        color: white;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
      }
      .reward-btn {
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .reward-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      }
    `;
    document.head.appendChild(style);
  }
};

// ===== DONATION MANAGER =====
const Donations = {
  init() {
    document.querySelectorAll('.don-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('custom')) {
          this.customDonate();
        } else {
          const points = parseInt(btn.dataset.pts);
          const trees = parseInt(btn.dataset.trees);
          this.donate(points, trees);
        }
      });
    });
  },
  
  donate(points, trees) {
    if (STATE.points < points) {
      Utils.showToast('Not enough points!', 'error');
      return;
    }
    STATE.points -= points;
    Utils.showToast(`Planted ${trees} trees! 🌳`, 'success');
    document.querySelector('.pts-val').textContent = Utils.formatNumber(STATE.points);
  },
  
  customDonate() {
    const amount = prompt('How many points? (20 pts = 1 tree)');
    if (!amount) return;
    const points = parseInt(amount);
    if (isNaN(points) || points < 20) {
      Utils.showToast('Minimum 20 points', 'error');
      return;
    }
    if (STATE.points < points) {
      Utils.showToast('Not enough points!', 'error');
      return;
    }
    const trees = Math.floor(points / 20);
    STATE.points -= points;
    Utils.showToast(`Planted ${trees} trees! 🌳`, 'success');
    document.querySelector('.pts-val').textContent = Utils.formatNumber(STATE.points);
  }
};

// ===== CALCULATOR =====
const Calculator = {
  formulas: {
    car: (d) => d * 0.21,
    bike: (d) => d * 0.08,
    flight: (d) => d * 0.25,
    meat: (m) => m * 2.5
  },
  
  calculate() {
    const activity = document.getElementById('act').value;
    const distance = parseFloat(document.getElementById('dist').value) || 0;
    const result = document.getElementById('result');
    
    if (distance <= 0) {
      result.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/></svg>
        <p>Please enter valid number</p>
      `;
      return;
    }
    
    const saved = this.formulas[activity](distance);
    const trees = (saved / 21).toFixed(1);
    
    result.innerHTML = `
      <div style="font-size: 3rem; color: #10b981;">🌍</div>
      <div style="color: #059669; font-weight: 700; font-size: 1.75rem;">
        ${saved.toFixed(2)} kg CO₂ saved
      </div>
      <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">
        = ${trees} trees planted! 🌳
      </div>
    `;
    
    result.style.animation = 'none';
    setTimeout(() => { result.style.animation = 'fadeUp 0.5s'; }, 10);
  }
};

// ===== ACTIVITY LOGGER =====
const ActivityLogger = {
  init() {
    document.querySelectorAll('.act-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const carbon = parseFloat(btn.dataset.carbon);
        STATE.carbonSaved += carbon;
        Utils.showToast(`Saved ${carbon}kg CO₂! 🌱`, 'success');
        
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => { btn.style.transform = ''; }, 200);
      });
    });
  }
};

// ===== SMOOTH SCROLL =====
const SmoothScroll = {
  init() {
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
  }
};

// ===== MOBILE MENU =====
const MobileMenu = {
  init() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-links');
    
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
      });
    }
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
    
    document.querySelectorAll('.card, .prob-card, .feat, .nepal-item').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  }
};

// ===== INIT APP =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌱 Carbon Karma initialized');
  
  // Particle system
  const canvas = document.getElementById('particles');
  if (canvas) new ParticleSystem(canvas);
  
  // Animate hero stats
  document.querySelectorAll('.stat .num').forEach(el => {
    const target = parseFloat(el.dataset.count);
    Utils.animateNumber(el, target);
  });
  
  // Initialize all modules
  Leaderboard.init();
  Rewards.init();
  Donations.init();
  ActivityLogger.init();
  SmoothScroll.init();
  MobileMenu.init();
  Observer.init();
  
  // Add animation styles
  const animations = document.createElement('style');
  animations.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(animations);
});

// Export calculator function for onclick
window.calc = () => Calculator.calculate();
window.Rewards = Rewards;