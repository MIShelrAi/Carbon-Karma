// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = htmlElement.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add a subtle pulse animation to the toggle
    themeToggle.style.animation = 'none';
    setTimeout(() => {
        themeToggle.style.animation = '';
    }, 10);
});

// Form switching functionality
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');

function switchCard(hideCard, showCard) {
    hideCard.style.animation = 'slideOut 0.3s ease-in forwards';
    
    setTimeout(() => {
        hideCard.classList.add('hidden');
        showCard.classList.remove('hidden');
        showCard.style.animation = 'slideIn 0.5s ease-out';
    }, 300);
}

showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchCard(loginCard, signupCard);
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchCard(signupCard, loginCard);
});

// Add slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Input focus animations
const inputs = document.querySelectorAll('.input-group input');

inputs.forEach(input => {
    input.addEventListener('focus', (e) => {
        const inputGroup = e.target.parentElement;
        inputGroup.style.transform = 'translateY(-2px)';
        inputGroup.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', (e) => {
        const inputGroup = e.target.parentElement;
        inputGroup.style.transform = 'translateY(0)';
    });
});

// Ripple effect for primary buttons
const primaryButtons = document.querySelectorAll('.btn-primary');

primaryButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = this.querySelector('.btn-ripple');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'scale(0)';
        
        // Trigger reflow
        ripple.offsetHeight;
        
        ripple.style.transform = 'scale(4)';
        ripple.style.opacity = '0';
    });
});

// Form submission handlers
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Add loading state
    const submitBtn = loginForm.querySelector('.btn-primary');
    const originalText = submitBtn.querySelector('span').textContent;
    submitBtn.querySelector('span').textContent = 'Signing in...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';
    
    // Simulate API call
    setTimeout(() => {
        console.log('Login:', { email, password });
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
        
        // You would handle actual authentication here
        alert('Login functionality would be implemented here');
    }, 1500);
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Add loading state
    const submitBtn = signupForm.querySelector('.btn-primary');
    const originalText = submitBtn.querySelector('span').textContent;
    submitBtn.querySelector('span').textContent = 'Creating account...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';
    
    // Simulate API call
    setTimeout(() => {
        console.log('Signup:', { name, email, password });
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
        
        // You would handle actual registration here
        alert('Signup functionality would be implemented here');
    }, 1500);
});

// Google sign-in buttons
const googleButtons = document.querySelectorAll('.btn-google');

googleButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('Google sign-in clicked');
        // You would implement Google OAuth here
        alert('Google sign-in would be implemented here');
    });
});

// Add stagger animation to form elements on page load
window.addEventListener('load', () => {
    const formElements = document.querySelectorAll('.input-group, .btn, .divider, .switch-form');
    
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.4s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});