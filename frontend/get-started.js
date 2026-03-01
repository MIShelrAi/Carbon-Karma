/**
 * CARBON KARMA - GET STARTED PAGE JAVASCRIPT
 * Authentication, form validation, and user onboarding
 */

'use strict';

// ===== UTILITY FUNCTIONS =====
const Utils = {
  showToast: (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.4s reverse';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },
  
  showLoading: (show) => {
    const loading = document.getElementById('loading');
    if (show) {
      loading.classList.remove('hidden');
    } else {
      loading.classList.add('hidden');
    }
  },
  
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  validatePassword: (password) => {
    return password.length >= 8;
  },
  
  saveUserData: (userData) => {
    localStorage.setItem('carbonKarmaUser', JSON.stringify(userData));
  },
  
  getUserData: () => {
    const data = localStorage.getItem('carbonKarmaUser');
    return data ? JSON.parse(data) : null;
  }
};

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 60;
    this.resize();
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.2
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
      this.ctx.fillStyle = `rgba(0, 255, 159, ${p.opacity})`;
      this.ctx.fill();
    });
    
    // Draw connections
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 255, 159, ${0.15 * (1 - dist / 100)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// ===== FORM TOGGLE =====
const FormToggle = {
  init() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const formType = btn.dataset.form;
        this.switchForm(formType);
      });
    });
  },
  
  switchForm(formType) {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    toggleBtns.forEach(btn => {
      if (btn.dataset.form === formType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    if (formType === 'signup') {
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    } else {
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    }
  }
};

// ===== FORM VALIDATION =====
const FormValidation = {
  validateSignup(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    if (!Utils.validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!Utils.validatePassword(formData.password)) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!formData.category) {
      errors.push('Please select a user category');
    }
    
    if (!formData.terms) {
      errors.push('You must agree to Terms of Service');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  validateLogin(formData) {
    const errors = [];
    
    if (!Utils.validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!formData.password || formData.password.length < 1) {
      errors.push('Please enter your password');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ===== SIGN UP HANDLER =====
function handleSignup(event) {
  event.preventDefault();
  
  const formData = {
    name: document.getElementById('signup-name').value.trim(),
    email: document.getElementById('signup-email').value.trim(),
    password: document.getElementById('signup-password').value,
    category: document.getElementById('signup-category').value,
    terms: document.getElementById('terms').checked
  };
  
  // Validate
  const validation = FormValidation.validateSignup(formData);
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      Utils.showToast(error, 'error');
    });
    return;
  }
  
  // Show loading
  Utils.showLoading(true);
  
  // Simulate API call
  setTimeout(() => {
    // Create user object
    const user = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      category: formData.category,
      points: 0,
      carbonSaved: 0,
      streak: 0,
      joinedDate: new Date().toISOString(),
      isAuthenticated: true
    };
    
    // Save to localStorage
    Utils.saveUserData(user);
    
    Utils.showLoading(false);
    Utils.showToast('🎉 ACCOUNT CREATED SUCCESSFULLY!', 'success');
    
    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
      window.location.href = 'index.html#dashboard';
    }, 1500);
  }, 2000);
}

// ===== LOGIN HANDLER =====
function handleLogin(event) {
  event.preventDefault();
  
  const formData = {
    email: document.getElementById('login-email').value.trim(),
    password: document.getElementById('login-password').value,
    remember: document.getElementById('remember').checked
  };
  
  // Validate
  const validation = FormValidation.validateLogin(formData);
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      Utils.showToast(error, 'error');
    });
    return;
  }
  
  // Show loading
  Utils.showLoading(true);
  
  // Simulate API call
  setTimeout(() => {
    // Check if user exists
    const existingUser = Utils.getUserData();
    
    if (existingUser && existingUser.email === formData.email) {
      // Update authentication status
      existingUser.isAuthenticated = true;
      Utils.saveUserData(existingUser);
      
      Utils.showLoading(false);
      Utils.showToast('✅ LOGIN SUCCESSFUL!', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'index.html#dashboard';
      }, 1500);
    } else {
      Utils.showLoading(false);
      Utils.showToast('❌ INVALID CREDENTIALS', 'error');
    }
  }, 2000);
}

// ===== SOCIAL AUTH =====
function socialAuth(provider) {
  Utils.showLoading(true);
  
  setTimeout(() => {
    // Simulate social auth
    const user = {
      id: Date.now(),
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: `user@${provider}.com`,
      category: 'free',
      points: 0,
      carbonSaved: 0,
      streak: 0,
      joinedDate: new Date().toISOString(),
      isAuthenticated: true,
      authProvider: provider
    };
    
    Utils.saveUserData(user);
    Utils.showLoading(false);
    Utils.showToast(`✅ LOGGED IN WITH ${provider.toUpperCase()}!`, 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html#dashboard';
    }, 1500);
  }, 2000);
}

// ===== FORGOT PASSWORD =====
function forgotPassword() {
  const email = prompt('Enter your email address:');
  
  if (!email) return;
  
  if (!Utils.validateEmail(email)) {
    Utils.showToast('❌ INVALID EMAIL ADDRESS', 'error');
    return;
  }
  
  Utils.showLoading(true);
  
  setTimeout(() => {
    Utils.showLoading(false);
    Utils.showToast('✅ PASSWORD RESET LINK SENT TO EMAIL', 'success');
  }, 1500);
}

// ===== PASSWORD TOGGLE =====
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

// ===== CHECK AUTH STATUS =====
function checkAuthStatus() {
  const user = Utils.getUserData();
  
  if (user && user.isAuthenticated) {
    // User is already logged in, redirect to dashboard
    if (confirm('You are already logged in. Go to dashboard?')) {
      window.location.href = 'index.html#dashboard';
    }
  }
}

// ===== ANIMATION ON SCROLL =====
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
    
    document.querySelectorAll('.feature-item, .stat-mini').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      observer.observe(el);
    });
  }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 GET STARTED PAGE INITIALIZED');
  
  // Initialize particle system
  new ParticleSystem('particles-bg');
  
  // Initialize form toggle
  FormToggle.init();
  
  // Initialize observer
  Observer.init();
  
  // Check if user is already logged in
  checkAuthStatus();
  
  // Add smooth animations to stats
  const stats = document.querySelectorAll('.stat-num');
  stats.forEach((stat, idx) => {
    setTimeout(() => {
      stat.style.animation = 'pulse 2s ease-in-out infinite';
    }, idx * 200);
  });
});

// ===== EXPORT FUNCTIONS FOR HTML =====
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.socialAuth = socialAuth;
window.forgotPassword = forgotPassword;
window.togglePassword = togglePassword;