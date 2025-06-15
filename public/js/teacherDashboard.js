document.addEventListener('DOMContentLoaded', () => {
    // Wait for components to load before initializing
    document.addEventListener('componentsLoaded', () => {
        console.log('Components loaded, initializing teacher dashboard module...');
        setupTeacherDashboard();
    });

    function setupTeacherDashboard() {
        const teacherDashboard = document.getElementById('teacherDashboard');

        function initTeacherDashboard() {
            if (!teacherDashboard) return;

            // Action buttons click handlers
            teacherDashboard.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.textContent.trim();
                    if (window.showNotification) {
                        window.showNotification(`${action} feature coming soon!`, 'info');
                    } else {
                        console.log(`${action} feature coming soon!`);
                    }
                    
                    // Add click animation
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        btn.style.transform = 'scale(1)';
                    }, 150);
                });
            });
            
            // Quick action buttons click handlers
            teacherDashboard.querySelectorAll('.quick-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.querySelector('span').textContent;
                    if (window.showNotification) {
                        window.showNotification(`${action} feature coming soon!`, 'info');
                    } else {
                        console.log(`${action} feature coming soon!`);
                    }
                    
                    // Add click animation
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        btn.style.transform = 'scale(1)';
                    }, 150);
                });
            });
            
            // Analytics charts click handlers
            teacherDashboard.querySelectorAll('.analytics-chart').forEach(chart => {
                chart.addEventListener('click', () => {
                    if (window.showNotification) {
                        window.showNotification('Detailed analytics coming soon!', 'info');
                    } else {
                        console.log('Detailed analytics coming soon!');
                    }
                    
                    // Add click animation
                    chart.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        chart.style.transform = 'scale(1)';
                    }, 150);
                });
            });

            // Load teacher dashboard data
            loadTeacherDashboardData();
        }

        // Load teacher dashboard data from API
        async function loadTeacherDashboardData() {
            try {
                const response = await fetch('/api/mat/dashboard/teacher', {
                    headers: {
                        'Authorization': `Bearer ${window.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Teacher dashboard data loaded:', data);
                    // Update UI elements with data if needed
                } else {
                    console.error('Failed to load teacher dashboard data');
                }
            } catch (error) {
                console.error('Teacher dashboard data error:', error);
            }
        }

        // Expose function to be called when teacher dashboard is shown
        window.initializeTeacherDashboard = () => {
            initTeacherDashboard();
            console.log("Teacher dashboard is now visible and initialized.");
        };
    }
});
