document.addEventListener('DOMContentLoaded', () => {
    // Wait for components to load before initializing auth
    document.addEventListener('componentsLoaded', () => {
        console.log('Components loaded, initializing auth module...');
        initAuthModule();
    });
    
    function initAuthModule() {
        // DOM Elements (available after components load)
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authModeBtns = document.querySelectorAll('.auth-mode-btn');
        const userTypeBtns = document.querySelectorAll('.user-type-btn');
        const authFooterText = document.getElementById('authFooterText');

        let currentAuthMode = 'login'; // Default auth mode
        let currentUserType = 'member'; // Default user type

        if (!loginForm || !registerForm || !authFooterText) {
            console.error('Auth forms not found. Components may not have loaded properly.');
            return;
        }

        setupAuthModeToggle();
        setupUserTypeSelection();
        setupLoginForm();
        setupRegistrationForm();
        setupInitialState();

        function setupAuthModeToggle() {
            if (authModeBtns.length > 0) {
                authModeBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        authModeBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        currentAuthMode = btn.getAttribute('data-mode');
                        
                        if (currentAuthMode === 'login') {
                            loginForm.style.display = 'block';
                            if (registerForm) registerForm.style.display = 'none';
                            authFooterText.innerHTML = 'Forgot your password? <a href="#" id="forgotPassword">Reset here</a>';
                        } else {
                            if (loginForm) loginForm.style.display = 'none';
                            registerForm.style.display = 'block';
                            authFooterText.innerHTML = 'Already have an account? <a href="#" id="switchToLogin">Sign in here</a>';
                        }
                        
                        // Re-attach event listeners for footer links
                        if (typeof window.attachAuthFooterListeners === 'function') {
                            window.attachAuthFooterListeners();
                        }
                        
                        // Add visual feedback
                        btn.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            btn.style.transform = 'scale(1)';
                        }, 150);
                    });
                });
            }
        }

        function setupUserTypeSelection() {
            if (userTypeBtns.length > 0) {
                userTypeBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        userTypeBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        currentUserType = btn.getAttribute('data-type');
                        
                        // Add visual feedback
                        btn.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            btn.style.transform = 'scale(1)';
                        }, 150);
                    });
                });
                // Set default active user type button
                const defaultUserTypeBtn = document.querySelector('.user-type-btn[data-type="member"]');
                if (defaultUserTypeBtn) {
                    defaultUserTypeBtn.classList.add('active');
                }
            }
        }

        function setupLoginForm() {
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const name = document.getElementById('loginName').value.trim();
                    const password = document.getElementById('loginPassword').value.trim();
                    
                    if (!name || !password) {
                        if (window.showNotification) {
                            window.showNotification('Please fill in all fields', 'error');
                        }
                        return;
                    }
                    
                    const loginBtn = loginForm.querySelector('.auth-btn');
                    const originalText = loginBtn.innerHTML;
                    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
                    loginBtn.disabled = true;
                    
                    try {
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, password })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            localStorage.setItem('authToken', data.token);
                            window.currentUser = data.user;
                            window.authToken = data.token;
                            window.isLoggedIn = true;
                            
                            if (window.showDashboard) {
                                window.showDashboard(data.user.userType, data.user.name);
                            }
                            if (window.showNotification) {
                                window.showNotification(`Welcome back, ${data.user.name}!`, 'success');
                            }
                        } else {
                            if (window.showNotification) {
                                window.showNotification(data.message || 'Login failed', 'error');
                            }
                        }
                    } catch (error) {
                        console.error('Login error:', error);
                        if (window.showNotification) {
                            window.showNotification('Network error. Please try again.', 'error');
                        }
                    } finally {
                        loginBtn.innerHTML = originalText;
                        loginBtn.disabled = false;
                    }
                });
            }
        }

        function setupRegistrationForm() {
            if (registerForm) {
                registerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = {
                        name: document.getElementById('registerName').value.trim(),
                        password: document.getElementById('registerPassword').value,
                        userType: currentUserType
                    };
                    
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    
                    if (!formData.name || !formData.password) {
                        if (window.showNotification) {
                            window.showNotification('Please fill in all required fields', 'error');
                        }
                        return;
                    }
                    if (formData.password !== confirmPassword) {
                        if (window.showNotification) {
                            window.showNotification('Passwords do not match', 'error');
                        }
                        return;
                    }
                    if (formData.password.length < 6) {
                        if (window.showNotification) {
                            window.showNotification('Password must be at least 6 characters long', 'error');
                        }
                        return;
                    }
                    
                    const registerBtn = registerForm.querySelector('.auth-btn');
                    const originalText = registerBtn.innerHTML;
                    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
                    registerBtn.disabled = true;
                    
                    try {
                        const response = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formData)
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            localStorage.setItem('authToken', data.token);
                            window.currentUser = data.user;
                            window.authToken = data.token;
                            window.isLoggedIn = true;
                            
                            if (window.showDashboard) {
                                window.showDashboard(data.user.userType, data.user.name);
                            }
                            if (window.showNotification) {
                                window.showNotification(`Welcome to MAT Portal, ${data.user.name}!`, 'success');
                            }
                        } else {
                            if (data.errors && data.errors.length > 0) {
                                const errorMessages = data.errors.map(err => err.msg).join(', ');
                                if (window.showNotification) {
                                    window.showNotification(errorMessages, 'error');
                                }
                            } else {
                                if (window.showNotification) {
                                    window.showNotification(data.message || 'Registration failed', 'error');
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Registration error:', error);
                        if (window.showNotification) {
                            window.showNotification('Network error. Please try again.', 'error');
                        }
                    } finally {
                        registerBtn.innerHTML = originalText;
                        registerBtn.disabled = false;
                    }
                });
            }
        }

        function setupInitialState() {
            // Set default auth mode view
            const defaultAuthModeBtn = document.querySelector('.auth-mode-btn[data-mode="login"]');
            if (defaultAuthModeBtn) {
                defaultAuthModeBtn.click(); // Simulate click to set initial state
            }
        }
    }

    // Attach footer link event listeners
    // Renamed to avoid conflict if mat.js still has attachFooterListeners
    window.attachAuthFooterListeners = function() {
        const forgotPasswordLink = document.getElementById('forgotPassword');
        const switchToLoginLink = document.getElementById('switchToLogin');
        
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.showNotification('Password reset functionality coming soon!', 'info');
            });
        }
        
        if (switchToLoginLink) {
            switchToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Switch to login mode by clicking the login button
                const loginModeBtn = document.querySelector('.auth-mode-btn[data-mode="login"]');
                if(loginModeBtn) loginModeBtn.click();
            });
        }
    }
    
    // Initial attachment of footer listeners
    if (typeof attachAuthFooterListeners === 'function') {
         attachAuthFooterListeners();
    }

    // Validate stored token - This should be called from main.js after defining authToken
    window.validateTokenAndSetupAuth = async () => {
        const localAuthToken = localStorage.getItem('authToken');
        if (localAuthToken) {
            try {
                const response = await fetch('/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${localAuthToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        window.currentUser = data.user;
                        window.isLoggedIn = true;
                        window.authToken = localAuthToken;
                        window.showDashboard(data.user.userType, data.user.name);
                        return; // Token is valid, dashboard shown
                    }
                }
            } catch (error) {
                console.error('Token validation error:', error);
            }
        }
        
        // If validation fails or no token, ensure auth section is visible
        localStorage.removeItem('authToken');
        window.authToken = null;
        window.currentUser = null;
        window.isLoggedIn = false;
        // Ensure auth section is visible if not logged in (handled by main.js logic)
    };
    
    // Set default auth mode view
    const defaultAuthModeBtn = document.querySelector('.auth-mode-btn[data-mode="login"]');
    if (defaultAuthModeBtn) {
        defaultAuthModeBtn.click(); // Simulate click to set initial state
    }
});
