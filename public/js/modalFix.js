/**
 * Modal Fix Script - Prevents modal UI issues
 * 
 * This script fixes issues with modals hopping, jumping, or moving when hovering
 * or interacting with form fields inside them.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find all modals on the page
    const modals = document.querySelectorAll('.event-modal, .request-modal');
    
    modals.forEach(modal => {
        const modalContent = modal.querySelector('.event-modal-content, .request-modal-content');
        
        if (!modalContent) return;
        
        // Fix the modal content position when modal is active
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (modal.classList.contains('active')) {
                    // Apply fixes when modal becomes active
                    applyModalFixes(modal, modalContent);
                }
            });
        });
        
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        
        // Apply fixes to forms inside the modal
        const form = modal.querySelector('form');
        if (form) {
            applyFormFixes(form);
        }
    });
});

/**
 * Apply fixes to a modal to prevent UI issues
 */
function applyModalFixes(modal, modalContent) {
    // Fix modal content position
    modalContent.style.transform = 'none';
    modalContent.style.position = 'relative';
    modalContent.style.transition = 'none';
    
    // Prevent hover effects
    modalContent.addEventListener('mouseenter', stopMotion);
    modalContent.addEventListener('mouseleave', stopMotion);
    modalContent.addEventListener('mousemove', stopMotion);
    modalContent.addEventListener('touchstart', stopMotion);
    modalContent.addEventListener('touchmove', stopMotion);
    
    // Prevent hover on the entire modal
    modal.addEventListener('mouseenter', stopMotion);
    modal.addEventListener('mouseleave', stopMotion);
    modal.addEventListener('mousemove', stopMotion);
    
    // Kill all animations
    const allElements = modal.querySelectorAll('*');
    allElements.forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
    });
}

/**
 * Apply fixes to form elements to prevent UI issues
 */
function applyFormFixes(form) {
    const formElements = form.querySelectorAll('input, textarea, select, button');
    
    formElements.forEach(el => {
        // Prevent transform and transitions on form elements
        el.style.transform = 'none';
        el.style.transition = 'none';
        
        // Prevent events that might cause UI issues
        el.addEventListener('focus', stopMotion);
        el.addEventListener('blur', stopMotion);
        el.addEventListener('mouseover', stopMotion);
        el.addEventListener('mouseout', stopMotion);
        el.addEventListener('input', stopMotion);
    });
}

/**
 * Stop any motion/animation effects that might be causing UI issues
 */
function stopMotion(event) {
    // Force element to stay in place
    event.target.style.transform = 'none';
    event.target.style.transition = 'none';
    
    // Find the modal content
    let parent = event.target;
    while (parent && !parent.classList.contains('event-modal-content') && !parent.classList.contains('request-modal-content')) {
        parent = parent.parentElement;
    }
    
    // If we found modal content, fix its position too
    if (parent) {
        parent.style.transform = 'none';
        parent.style.transition = 'none';
    }
}
