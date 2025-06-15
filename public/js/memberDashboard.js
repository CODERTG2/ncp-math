document.addEventListener('DOMContentLoaded', () => {
    // Wait for components to load before initializing
    document.addEventListener('componentsLoaded', () => {
        console.log('Components loaded, initializing member dashboard module...');
        setupMemberDashboard();
    });

    function setupMemberDashboard() {
        const memberDashboard = document.getElementById('memberDashboard');

        function initMemberDashboard() {
            if (!memberDashboard) return;

            // Material items click handlers
            memberDashboard.querySelectorAll('.material-item').forEach(item => {
                item.addEventListener('click', () => {
                    const materialName = item.querySelector('span').textContent;
                    if (window.showNotification) {
                        window.showNotification(`Opening ${materialName}...`, 'info');
                    } else {
                        console.log(`Opening ${materialName}...`);
                    }
                    
                    // Add click animation
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.style.transform = 'scale(1)';
                    }, 150);
                });
            });

            // Load member dashboard data
            loadMemberDashboardData();
        }

        // Load member dashboard data from API
        async function loadMemberDashboardData() {
            try {
                const response = await fetch('/api/mat/dashboard/member', {
                    headers: {
                        'Authorization': `Bearer ${window.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Member dashboard data loaded:', data);
                    // Update UI elements with data if needed
                } else {
                    console.error('Failed to load member dashboard data');
                }
            } catch (error) {
                console.error('Member dashboard data error:', error);
            }
        }

        // Expose a function to be called when the member dashboard is shown
        window.initializeMemberDashboard = () => {
            initMemberDashboard();
            console.log("Member dashboard is now visible and initialized.");
        };
    }
});
