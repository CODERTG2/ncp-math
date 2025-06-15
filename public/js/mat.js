// MAT Portal JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('MAT Portal loaded successfully!');
    
    // DOM Elements
    const navbar = document.getElementById('navbar');
    const authSection = document.getElementById('authSection');
    const memberDashboard = document.getElementById('memberDashboard');
    const teacherDashboard = document.getElementById('teacherDashboard');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authModeBtns = document.querySelectorAll('.auth-mode-btn');
    const userTypeBtns = document.querySelectorAll('.user-type-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const authFooterText = document.getElementById('authFooterText');
    
    let currentUserType = 'member';
    let currentAuthMode = 'login';
    let isLoggedIn = false;
    let currentUser = null;
    let authToken = localStorage.getItem('authToken');
    
    // Check if user is already logged in
    if (authToken) {
        validateToken();
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Auth mode toggle (Login/Register)
    authModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            authModeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAuthMode = btn.getAttribute('data-mode');
            
            if (currentAuthMode === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                authFooterText.innerHTML = 'Forgot your password? <a href="#" id="forgotPassword">Reset here</a>';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                authFooterText.innerHTML = 'Already have an account? <a href="#" id="switchToLogin">Sign in here</a>';
            }
            
            // Re-attach event listeners
            attachFooterListeners();
            
            // Add visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // User type selection
    userTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            userTypeBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update current user type
            currentUserType = btn.getAttribute('data-type');
            
            // Add visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('loginName').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        if (!name || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Show loading state
        const loginBtn = loginForm.querySelector('.auth-btn');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        loginBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                currentUser = data.user;
                authToken = data.token;
                
                // Success - show appropriate dashboard
                isLoggedIn = true;
                showDashboard(data.user.userType, data.user.name);
                showNotification(`Welcome back, ${data.user.name}!`, 'success');
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            // Reset button state
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    });

    // Registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('registerName').value.trim(),
            password: document.getElementById('registerPassword').value,
            userType: currentUserType
        };
        
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Client-side validation
        if (!formData.name || !formData.password) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (formData.password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (formData.password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        // Show loading state
        const registerBtn = registerForm.querySelector('.auth-btn');
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        registerBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                currentUser = data.user;
                authToken = data.token;
                
                // Success - show appropriate dashboard
                isLoggedIn = true;
                showDashboard(data.user.userType, data.user.name);
                showNotification(`Welcome to MAT Portal, ${data.user.name}!`, 'success');
            } else {
                if (data.errors && data.errors.length > 0) {
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    showNotification(errorMessages, 'error');
                } else {
                    showNotification(data.message || 'Registration failed', 'error');
                }
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            // Reset button state
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', async () => {
        try {
            if (authToken) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
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

    // Attach footer link event listeners
    function attachFooterListeners() {
        const forgotPasswordLink = document.getElementById('forgotPassword');
        const switchToLoginLink = document.getElementById('switchToLogin');
        
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('Password reset functionality coming soon!', 'info');
            });
        }
        
        if (switchToLoginLink) {
            switchToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Switch to login mode
                authModeBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-mode') === 'login') {
                        btn.classList.add('active');
                    }
                });
                currentAuthMode = 'login';
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                authFooterText.innerHTML = 'Forgot your password? <a href="#" id="forgotPassword">Reset here</a>';
                attachFooterListeners();
            });
        }
    }
    
    // Initial attachment of footer listeners
    attachFooterListeners();

    // Validate stored token
    async function validateToken() {
        try {
            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    currentUser = data.user;
                    isLoggedIn = true;
                    showDashboard(data.user.userType, data.user.name);
                    return;
                }
            }
        } catch (error) {
            console.error('Token validation error:', error);
        }
        
        // If validation fails, clear stored data
        localStorage.removeItem('authToken');
        authToken = null;
        currentUser = null;
    }
    
    // Simulate login API call
    async function simulateLogin(username, password, userType) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simple validation (in real app, this would be server-side)
                if (userType === 'teacher' && username.toLowerCase().includes('teacher')) {
                    resolve({ success: true, userType: 'teacher', name: username });
                } else if (userType === 'member' && username.toLowerCase().includes('student')) {
                    resolve({ success: true, userType: 'member', name: username });
                } else if (username === 'demo' && password === 'demo') {
                    resolve({ success: true, userType: userType, name: 'Demo User' });
                } else {
                    reject(new Error('Invalid credentials. Try: demo/demo'));
                }
            }, 1500); // Simulate network delay
        });
    }
    
    // Load dashboard data from API
    async function loadDashboardData(userType) {
        try {
            const response = await fetch(`/api/mat/dashboard/${userType}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Dashboard data is already being handled by the server
                // This function can be expanded to update UI elements if needed
                console.log('Dashboard data loaded:', data);
            } else {
                console.error('Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Dashboard data error:', error);
        }
    }

    // Show appropriate dashboard (updated version)
    function showDashboard(userType, username) {
        // Hide auth section
        authSection.style.display = 'none';
        
        // Show logout button
        logoutBtn.style.display = 'flex';
        
        if (userType === 'member') {
            memberDashboard.style.display = 'block';
            teacherDashboard.style.display = 'none';
            document.getElementById('memberName').textContent = username;
            
            // Load member dashboard data
            loadDashboardData('member');
        } else if (userType === 'teacher') {
            teacherDashboard.style.display = 'block';
            memberDashboard.style.display = 'none';
            document.getElementById('teacherName').textContent = username;
            
            // Load teacher dashboard data
            loadDashboardData('teacher');
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
    }
    
    // Logout function (updated)
    function logout() {
        isLoggedIn = false;
        currentUser = null;
        
        // Clear stored token
        localStorage.removeItem('authToken');
        authToken = null;
        
        // Hide dashboards
        memberDashboard.style.display = 'none';
        teacherDashboard.style.display = 'none';
        
        // Show auth section
        authSection.style.display = 'block';
        
        // Hide logout button
        logoutBtn.style.display = 'none';
        
        // Clear forms
        loginForm.reset();
        registerForm.reset();
        
        // Reset to login mode
        authModeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-mode') === 'login') {
                btn.classList.add('active');
            }
        });
        currentAuthMode = 'login';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        authFooterText.innerHTML = 'Forgot your password? <a href="#" id="forgotPassword">Reset here</a>';
        
        // Reset user type to member
        userTypeBtns.forEach(btn => btn.classList.remove('active'));
        userTypeBtns[0].classList.add('active');
        currentUserType = 'member';
        
        // Re-attach footer listeners
        attachFooterListeners();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showNotification('Successfully logged out', 'info');
    }

    // Notification system
    function showNotification(message, type = 'info') {
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
    }
    
    // Dashboard interactivity
    
    // Member dashboard interactions
    if (memberDashboard) {
        // Material items click handlers
        document.querySelectorAll('.material-item').forEach(item => {
            item.addEventListener('click', () => {
                const materialName = item.querySelector('span').textContent;
                showNotification(`Opening ${materialName}...`, 'info');
                
                // Add click animation
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }
    
    // Teacher dashboard interactions
    if (teacherDashboard) {
        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.textContent.trim();
                showNotification(`${action} feature coming soon!`, 'info');
                
                // Add click animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 150);
            });
        });
        
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.querySelector('span').textContent;
                showNotification(`${action} feature coming soon!`, 'info');
                
                // Add click animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 150);
            });
        });
        
        // Analytics charts click
        document.querySelectorAll('.analytics-chart').forEach(chart => {
            chart.addEventListener('click', () => {
                showNotification('Detailed analytics coming soon!', 'info');
                
                // Add click animation
                chart.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    chart.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + L to focus login
        if ((e.ctrlKey || e.metaKey) && e.key === 'l' && !isLoggedIn) {
            e.preventDefault();
            document.getElementById('username').focus();
        }
        
        // Escape to logout (if logged in)
        if (e.key === 'Escape' && isLoggedIn) {
            logout();
        }
    });
    
    // Auto-focus username field on page load
    setTimeout(() => {
        if (!isLoggedIn) {
            document.getElementById('username').focus();
        }
    }, 500);
    
    // Add some demo data animations
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
    
    // Start number animations when dashboard is shown
    const originalShowDashboard = showDashboard;
    showDashboard = function(userType, username) {
        originalShowDashboard(userType, username);
        setTimeout(animateNumbers, 800);
    };
    
    // Easter egg: Konami code
    let konamiCode = [];
    const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konami.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konami.join(',')) {
            showNotification('🎉 Konami code activated! Math powers increased!', 'success');
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
});

// Export functions for potential external use
window.MATPortal = {
    logout: () => {
        const event = new CustomEvent('logout');
        document.dispatchEvent(event);
    },
    showNotification: (message, type) => {
        // This would be accessible globally if needed
        console.log(`Notification: ${message} (${type})`);
    }
};
