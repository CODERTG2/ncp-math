// MAT Portal JavaScript - Main Controller
document.addEventListener('DOMContentLoaded', () => {
    console.log('MAT Portal loaded successfully!');
    
    // Global state variables
    window.isLoggedIn = false;
    window.currentUser = null;
    window.authToken = localStorage.getItem('authToken');
    
    // Wait for components to load before initializing
    document.addEventListener('componentsLoaded', () => {
        console.log('Components loaded, initializing main controller...');
        init();
    });
    
    function init() {
        // DOM Elements (available after components load)
        const navbar = document.getElementById('navbar');
        const authSection = document.getElementById('authSection');
        const memberDashboard = document.getElementById('memberDashboard');
        const teacherDashboard = document.getElementById('teacherDashboard');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (!navbar || !authSection || !memberDashboard || !teacherDashboard || !logoutBtn) {
            console.error('Required DOM elements not found. Components may not have loaded properly.');
            return;
        }
        
        setupApplication(navbar, authSection, memberDashboard, teacherDashboard, logoutBtn);
    }
    
    function setupApplication(navbar, authSection, memberDashboard, teacherDashboard, logoutBtn) {
        setupNavbarScrollEffect();
        setupLogoutHandler(logoutBtn);
        setupKeyboardShortcuts();
        
        // Store references for global access
        window.domElements = {
            navbar,
            authSection,
            memberDashboard,
            teacherDashboard,
            logoutBtn
        };
        
        // Check if user is already logged in
        if (window.authToken) {
            window.validateTokenAndSetupAuth();
        }
        
        // Auto-focus username field if not logged in
        setTimeout(() => {
            if (!window.isLoggedIn) {
                const usernameField = document.getElementById('loginName');
                if (usernameField) usernameField.focus();
            }
        }, 500);
    }
     
    function init() {
        setupNavbarScrollEffect();
        setupLogoutHandler();
        setupKeyboardShortcuts();
        
        // Check if user is already logged in
        if (window.authToken) {
            window.validateTokenAndSetupAuth();
        }
        
        // Auto-focus username field if not logged in
        setTimeout(() => {
            if (!window.isLoggedIn) {
                const usernameField = document.getElementById('loginName');
                if (usernameField) usernameField.focus();
            }
        }, 500);
    }
    
    // Navbar scroll effect
    function setupNavbarScrollEffect() {
        window.addEventListener('scroll', () => {
            const navbar = window.domElements?.navbar || document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }
    
    // Setup logout handler
    function setupLogoutHandler(logoutBtn) {
        const logoutButton = logoutBtn || window.domElements?.logoutBtn || document.getElementById('logoutBtn');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    if (window.authToken) {
                        await fetch('/api/auth/logout', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${window.authToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                    }
                } catch (error) {
                    console.error('Logout API error:', error);
                } finally {
                    logout();
                }
            });
        }
    }

    // Show appropriate dashboard (main controller)
    window.showDashboard = function(userType, username) {
        const { authSection, memberDashboard, teacherDashboard, logoutBtn } = window.domElements || {};
        
        // Fallback to document queries if domElements not available
        const authSectionEl = authSection || document.getElementById('authSection');
        const memberDashboardEl = memberDashboard || document.getElementById('memberDashboard');
        const teacherDashboardEl = teacherDashboard || document.getElementById('teacherDashboard');
        const logoutBtnEl = logoutBtn || document.getElementById('logoutBtn');
        
        // Hide auth section
        if (authSectionEl) authSectionEl.style.display = 'none';
        
        // Show logout button
        if (logoutBtnEl) logoutBtnEl.style.display = 'flex';
        
        // Update global state
        window.isLoggedIn = true;
        
        if (userType === 'member') {
            if (memberDashboardEl) memberDashboardEl.style.display = 'block';
            if (teacherDashboardEl) teacherDashboardEl.style.display = 'none';
            
            const memberNameEl = document.getElementById('memberName');
            if (memberNameEl) memberNameEl.textContent = username;
            
            // Initialize member dashboard
            if (window.initializeMemberDashboard) {
                window.initializeMemberDashboard();
            }
        } else if (userType === 'teacher') {
            if (teacherDashboardEl) teacherDashboardEl.style.display = 'block';
            if (memberDashboardEl) memberDashboardEl.style.display = 'none';
            
            const teacherNameEl = document.getElementById('teacherName');
            if (teacherNameEl) teacherNameEl.textContent = username;
            
            // Initialize teacher dashboard
            if (window.initializeTeacherDashboard) {
                window.initializeTeacherDashboard();
            }
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Add entrance animations
        setTimeout(() => {
            const cards = document.querySelectorAll('.dashboard-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
        
        // Animate numbers
        setTimeout(() => {
            animateNumbers();
        }, 800);
    };
    
    // Logout function
    function logout() {
        window.isLoggedIn = false;
        window.currentUser = null;
        
        // Clear stored token
        localStorage.removeItem('authToken');
        window.authToken = null;
        
        const { memberDashboard, teacherDashboard, authSection, logoutBtn } = window.domElements || {};
        
        // Hide dashboards
        const memberDashboardEl = memberDashboard || document.getElementById('memberDashboard');
        const teacherDashboardEl = teacherDashboard || document.getElementById('teacherDashboard');
        const authSectionEl = authSection || document.getElementById('authSection');
        const logoutBtnEl = logoutBtn || document.getElementById('logoutBtn');
        
        if (memberDashboardEl) memberDashboardEl.style.display = 'none';
        if (teacherDashboardEl) teacherDashboardEl.style.display = 'none';
        
        // Show auth section
        if (authSectionEl) authSectionEl.style.display = 'block';
        
        // Hide logout button
        if (logoutBtnEl) logoutBtnEl.style.display = 'none';
        
        // Clear forms
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        // Reset to login mode
        const authModeBtns = document.querySelectorAll('.auth-mode-btn');
        authModeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-mode') === 'login') {
                btn.classList.add('active');
            }
        });
        
        const loginFormEl = document.getElementById('loginForm');
        const registerFormEl = document.getElementById('registerForm');
        if (loginFormEl) loginFormEl.style.display = 'block';
        if (registerFormEl) registerFormEl.style.display = 'none';
        
        const authFooterText = document.getElementById('authFooterText');
        if (authFooterText) {
            authFooterText.innerHTML = 'Forgot your password? <a href="#" id="forgotPassword">Reset here</a>';
        }
        
        // Reset user type to member
        const userTypeBtns = document.querySelectorAll('.user-type-btn');
        userTypeBtns.forEach(btn => btn.classList.remove('active'));
        const memberBtn = document.querySelector('.user-type-btn[data-type="member"]');
        if (memberBtn) memberBtn.classList.add('active');
        
        // Re-attach footer listeners
        if (window.attachAuthFooterListeners) {
            window.attachAuthFooterListeners();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (window.showNotification) {
            window.showNotification('Successfully logged out', 'info');
        }
    }

    // Notification system
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        const styles = {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            zIndex: '10000',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            fontSize: '0.9rem',
            fontWeight: '500',
            maxWidth: '300px',
            wordWrap: 'break-word'
        };
        
        // Type-specific colors
        const colors = {
            success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        };
        
        Object.assign(notification.style, styles);
        notification.style.background = colors[type] || colors.info;
        notification.style.color = 'white';
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    };
    
    // Animate numbers in stats
    function animateNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const targetValue = parseInt(stat.textContent);
            if (!isNaN(targetValue)) {
                let currentValue = 0;
                const increment = Math.ceil(targetValue / 20);
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= targetValue) {
                        currentValue = targetValue;
                        clearInterval(timer);
                    }
                    stat.textContent = currentValue + (stat.textContent.includes('%') ? '%' : '');
                }, 50);
            }
        });
    }
    
    // Setup keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + L to focus login
            if ((e.ctrlKey || e.metaKey) && e.key === 'l' && !window.isLoggedIn) {
                e.preventDefault();
                const loginField = document.getElementById('loginName');
                if (loginField) loginField.focus();
            }
            
            // Escape to logout (if logged in)
            if (e.key === 'Escape' && window.isLoggedIn) {
                logout();
            }
        });
        
        // Easter egg: Konami code
        let konamiCode = [];
        const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
        
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konami.length) {
                konamiCode.shift();
            }
            
            if (konamiCode.join(',') === konami.join(',')) {
                window.showNotification('🎉 Konami code activated! Math powers increased!', 'success');
                konamiCode = [];
                
                // Add some fun effects
                document.body.style.transition = 'all 0.3s ease';
                document.body.style.transform = 'rotate(1deg)';
                setTimeout(() => {
                    document.body.style.transform = 'rotate(-1deg)';
                    setTimeout(() => {
                        document.body.style.transform = 'rotate(0deg)';
                    }, 150);
                }, 150);
            }
        });
    }
});

// Export functions for potential external use
window.MATPortal = {
    logout: () => {
        const event = new CustomEvent('logout');
        document.dispatchEvent(event);
    },
    showNotification: (message, type) => {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`Notification: ${message} (${type})`);
        }
    }
};
