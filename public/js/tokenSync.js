/**
 * Token Synchronization Helper
 * 
 * This script ensures that the authentication token is properly synchronized
 * between localStorage and the window.authToken global variable.
 * 
 * It should be included in the main layout before any other scripts that
 * might use the authentication token.
 */

(function() {
    // Execute immediately when the script loads
    console.log('Running token synchronization...');
    
    // Check if we have a token in localStorage
    const localStorageToken = localStorage.getItem('authToken');
    
    if (localStorageToken) {
        // Set window.authToken if it doesn't exist or is different
        if (!window.authToken || window.authToken !== localStorageToken) {
            window.authToken = localStorageToken;
            console.log('Token synchronized from localStorage to window.authToken');
        }
    } else if (window.authToken) {
        // If window.authToken exists but localStorage doesn't have it, sync to localStorage
        localStorage.setItem('authToken', window.authToken);
        console.log('Token synchronized from window.authToken to localStorage');
    }
    
    // Create a helper function for use throughout the application
    window.getAuthToken = function() {
        // Always return the localStorage value as the single source of truth
        return localStorage.getItem('authToken');
    };
    
    // Listen for storage events (in case another tab changes the token)
    window.addEventListener('storage', function(e) {
        if (e.key === 'authToken') {
            window.authToken = e.newValue;
            console.log('Token updated from another tab');
        }
    });
})();
