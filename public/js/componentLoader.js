// Component loader utility
window.ComponentLoader = {
    async loadComponent(componentPath, targetSelector) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath}`);
            }
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                targetElement.innerHTML = html;
                return true;
            } else {
                console.error(`Target element not found: ${targetSelector}`);
                return false;
            }
        } catch (error) {
            console.error('Error loading component:', error);
            return false;
        }
    },

    async loadComponents(components) {
        const loadPromises = components.map(({ path, target }) => 
            this.loadComponent(path, target)
        );
        
        try {
            const results = await Promise.all(loadPromises);
            return results.every(result => result === true);
        } catch (error) {
            console.error('Error loading components:', error);
            return false;
        }
    }
};
