document.addEventListener('DOMContentLoaded', () => {
    // Check token validity on page load
    const localStorageToken = localStorage.getItem('authToken');
    if (localStorageToken) {
        // Test token validity with a quick API call
        fetch('/api/auth/validate-token', {
            headers: {
                'Authorization': `Bearer ${localStorageToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                console.error('Token validation failed on page load:', response.status);
                // Clear invalid token
                localStorage.removeItem('authToken');
                window.authToken = null;
                // Redirect to login if on a protected page
                if (window.location.pathname !== '/mat.html') {
                    window.location.href = '/mat.html';
                }
            } else {
                console.log('Token validated successfully on page load');
            }
        })
        .catch(error => {
            console.error('Error validating token on page load:', error);
        });
    }

    // Wait for components to load before initializing
    document.addEventListener('componentsLoaded', () => {
        console.log('Components loaded, initializing teacher dashboard module...');
        setupTeacherDashboard();
    });

    async function setupTeacherDashboard() {
        const teacherDashboard = document.getElementById('teacherDashboard');
        let events = []; // Will store the events data
        let requests = []; // Will store the video requests data
        
        // DOM elements for event management
        let eventModal;
        let eventForm;
        let addEventBtn;
        let closeEventModal;
        let cancelEventBtn;
        let eventList;
        let eventModalTitle;
        let eventIdInput;
        
        // DOM elements for video request management
        let requestModal;
        let requestForm;
        let addRequestBtn;
        let closeRequestModal;
        let cancelRequestBtn;
        let requestList;
        let requestModalTitle;
        let requestIdInput;

        function initTeacherDashboard() {
            if (!teacherDashboard) return;

            // Initialize event management elements
            eventModal = document.getElementById('eventModal');
            eventForm = document.getElementById('eventForm');
            addEventBtn = document.getElementById('addEventBtn');
            closeEventModal = document.getElementById('closeEventModal');
            cancelEventBtn = document.getElementById('cancelEventBtn');
            eventList = document.getElementById('eventList');
            eventModalTitle = document.getElementById('eventModalTitle');
            eventIdInput = document.getElementById('eventId');
            
            // Initialize video request management elements
            requestModal = document.getElementById('requestModal');
            requestForm = document.getElementById('requestForm');
            addRequestBtn = document.getElementById('addRequestBtn');
            closeRequestModal = document.getElementById('closeRequestModal');
            cancelRequestBtn = document.getElementById('cancelRequestBtn');
            requestList = document.getElementById('requestList');
            requestModalTitle = document.getElementById('requestModalTitle');
            requestIdInput = document.getElementById('requestId');
            
            // Set up event handlers
            setupEventManagement();
            setupRequestManagement();
            
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
        
        // Set up video request management functionality
        function setupRequestManagement() {
            // Add Request button click handler
            addRequestBtn.addEventListener('click', () => {
                // Reset form for new request
                requestForm.reset();
                requestIdInput.value = '';
                requestModalTitle.textContent = 'Add New Video Request';
                
                // Show modal
                requestModal.classList.add('active');
            });
            
            // Close modal handlers
            closeRequestModal.addEventListener('click', () => {
                requestModal.classList.remove('active');
            });
            
            cancelRequestBtn.addEventListener('click', () => {
                requestModal.classList.remove('active');
            });
            
            // Form submission handler
            requestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const requestId = requestIdInput.value;
                const requestTitle = document.getElementById('requestTitle').value;
                const requestDescription = document.getElementById('requestDescription').value;
                
                // Get the current user's name (teacher name)
                const teacherName = document.getElementById('teacherName').textContent;
                
                // Prepare new request object
                const requestData = {
                    id: requestId || Date.now().toString(), // Use existing ID or generate new one
                    title: requestTitle,
                    description: requestDescription,
                    requester: teacherName,
                    status: requestId ? findRequestById(requestId).status : 'not-started', // Keep existing status or set to 'not-started'
                    date: requestId ? findRequestById(requestId).date : new Date().toISOString()
                };
                
                if (requestId) {
                    // Update existing request
                    updateRequest(requestData);
                } else {
                    // Add new request
                    addRequest(requestData);
                }
                
                // Close modal
                requestModal.classList.remove('active');
            });
            
            // Click outside modal to close
            requestModal.addEventListener('click', (e) => {
                if (e.target === requestModal) {
                    requestModal.classList.remove('active');
                }
            });
        }
        
        // Find request by ID
        function findRequestById(id) {
            return requests.find(req => req.id === id);
        }
        
        // Add new video request
        function addRequest(requestData) {
            // In a real app, this would call an API to save the request
            // For now, we'll just add it to our local array
            requests.push(requestData);
            
            // Sort requests by date (newest first)
            sortRequests();
            
            // Render updated requests
            renderRequests();
            
            // Show success notification
            if (window.showNotification) {
                window.showNotification('Video request submitted successfully!', 'success');
            }
        }
        
        // Update existing request
        function updateRequest(requestData) {
            // In a real app, this would call an API to update the request
            // For now, we'll just update our local array
            const index = requests.findIndex(req => req.id === requestData.id);
            if (index !== -1) {
                requests[index] = requestData;
                
                // Sort requests by date
                sortRequests();
                
                // Render updated requests
                renderRequests();
                
                // Show success notification
                if (window.showNotification) {
                    window.showNotification('Video request updated successfully!', 'success');
                }
            }
        }
        
        // Delete request
        function deleteRequest(requestId) {
            // In a real app, this would call an API to delete the request
            // For now, we'll just remove it from our local array
            requests = requests.filter(req => req.id !== requestId);
            
            // Render updated requests
            renderRequests();
            
            // Show success notification
            if (window.showNotification) {
                window.showNotification('Video request deleted successfully!', 'success');
            }
        }
        
        // Sort requests by date (newest first)
        function sortRequests() {
            requests.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
        }
        
        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short', 
                day: 'numeric',
                year: '2-digit'
            });
        }
        
        // Render requests to the DOM
        function renderRequests() {
            // Clear current request list
            requestList.innerHTML = '';
            
            if (requests.length === 0) {
                // Show empty state
                requestList.innerHTML = `
                    <div class="empty-state">
                        <p>No requests. Add the first one!</p>
                    </div>
                `;
                return;
            }
            
            // Add each request to the list
            requests.forEach(request => {
                // Create request item element
                const requestItem = document.createElement('div');
                requestItem.className = 'request-item';
                
                requestItem.innerHTML = `
                    <div class="request-status">
                        <span class="status-indicator ${request.status}" title="${request.status.replace('-', ' ')}"></span>
                    </div>
                    <div class="request-content">
                        <div class="request-title">${request.title}</div>
                        <div class="request-requester">
                            <i class="fas fa-user"></i> ${request.requester}
                        </div>
                    </div>
                    <div class="request-actions">
                        <button class="request-action-btn edit" title="Edit Request" data-id="${request.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="request-action-btn delete" title="Delete Request" data-id="${request.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                
                // Add request item to list
                requestList.appendChild(requestItem);
                
                // Add event listeners to action buttons
                const editBtn = requestItem.querySelector('.edit');
                const deleteBtn = requestItem.querySelector('.delete');
                
                editBtn.addEventListener('click', () => {
                    openEditRequestModal(request.id);
                });
                
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this video request?')) {
                        deleteRequest(request.id);
                    }
                });
            });
            
            // Add scroll if needed - set a max-height only if there are many requests
            const cardContent = requestList.closest('.card-content');
            const cardHeight = cardContent.offsetHeight;
            const otherElementsHeight = cardContent.querySelector('.card-header-actions').offsetHeight + 
                                       cardContent.querySelector('.status-legend').offsetHeight + 20; // 20px for margins
                                       
            // Only set a max-height if the request list would otherwise overflow
            if (requestList.scrollHeight > (cardHeight - otherElementsHeight)) {
                requestList.style.maxHeight = `${cardHeight - otherElementsHeight}px`;
                requestList.style.overflowY = 'auto';
            } else {
                requestList.style.maxHeight = 'none';
                requestList.style.overflowY = 'visible';
            }
        }
        
        // Open edit request modal
        function openEditRequestModal(requestId) {
            const request = findRequestById(requestId);
            if (!request) return;
            
            // Set form values
            requestIdInput.value = request.id;
            document.getElementById('requestTitle').value = request.title;
            document.getElementById('requestDescription').value = request.description || '';
            
            // Update modal title
            requestModalTitle.textContent = 'Edit Video Request';
            
            // Show modal
            requestModal.classList.add('active');
        }
        
        // Set up event management functionality
        function setupEventManagement() {
            // Add Event button click handler
            addEventBtn.addEventListener('click', () => {
                // Reset form for new event
                eventForm.reset();
                eventIdInput.value = '';
                eventModalTitle.textContent = 'Add New Event';
                
                // Set default date to today
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('eventDate').value = today;
                
                // Prevent form fields from stealing focus on modal open
                setTimeout(() => {
                    // Show modal
                    eventModal.classList.add('active');
                }, 10);
            });
            
            // Close modal handlers
            closeEventModal.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default to avoid any layout shifts
                eventModal.classList.remove('active');
            });
            
            cancelEventBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default to avoid any layout shifts
                eventModal.classList.remove('active');
            });
            
            // Form submission handler
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form data
                const eventId = eventIdInput.value;
                const eventName = document.getElementById('eventName').value;
                const eventDate = document.getElementById('eventDate').value;
                const eventTime = document.getElementById('eventTime').value;
                const eventDescription = document.getElementById('eventDescription').value;
                
                // Validate data
                if (!eventName || !eventDate) {
                    if (window.showNotification) {
                        window.showNotification('Please fill in all required fields', 'error');
                    }
                    return;
                }
                
                // Prepare new event object
                const eventData = {
                    id: eventId || Date.now().toString(), // Use existing ID or generate new one
                    name: eventName,
                    date: eventDate,
                    time: eventTime,
                    description: eventDescription
                };
                
                // Close modal first to prevent UI issues during API call
                eventModal.classList.remove('active');
                
                // Then process the data
                setTimeout(() => {
                    if (eventId) {
                        // Update existing event
                        updateEvent(eventData);
                    } else {
                        // Add new event
                        addEvent(eventData);
                    }
                }, 50);
            });
            
            // Click outside modal to close
            eventModal.addEventListener('click', (e) => {
                if (e.target === eventModal) {
                    eventModal.classList.remove('active');
                }
            });
            
            // Prevent form fields from causing modal movement
            const formFields = eventForm.querySelectorAll('input, textarea');
            formFields.forEach(field => {
                // Prevent focus events from causing modal movement
                field.addEventListener('focus', (e) => {
                    e.target.style.transform = 'none'; // Force no transform on focus
                });
                
                // Prevent mouse events from causing modal movement
                field.addEventListener('mouseover', (e) => {
                    e.target.style.transform = 'none'; // Force no transform on hover
                });
                
                // Prevent touch events from causing modal movement on mobile
                field.addEventListener('touchstart', (e) => {
                    e.target.style.transform = 'none';
                });
            });
            
            // Prevent modal content from moving
            const modalContent = document.querySelector('.event-modal-content');
            if (modalContent) {
                ['mouseover', 'mouseout', 'mousemove'].forEach(eventType => {
                    modalContent.addEventListener(eventType, (e) => {
                        // Stop any event that might trigger hover effects
                        modalContent.style.transform = 'none';
                    });
                });
            }
            
            // Fix modal position when opened
            const fixModalPosition = () => {
                if (eventModal.classList.contains('active')) {
                    const modalContent = eventModal.querySelector('.event-modal-content');
                    if (modalContent) {
                        modalContent.style.transform = 'none';
                        modalContent.style.position = 'relative';
                    }
                }
            };
            
            // Call fixModalPosition when modal becomes active
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.target.classList.contains('active')) {
                        fixModalPosition();
                    }
                });
            });
            
            observer.observe(eventModal, { attributes: true, attributeFilter: ['class'] });
        }
        
        // Add new event
        async function addEvent(eventData) {
            try {
                // Get token from both possible locations
                const token = localStorage.getItem('authToken') || window.authToken;
                
                if (!token) {
                    console.error('Authentication token not found');
                    handleAuthError();
                    return;
                }
                
                // Call the API to save the event
                const response = await fetch('/api/calendar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        eventName: eventData.name,
                        eventDate: eventData.date,
                        eventTime: eventData.time,
                        eventLocation: eventData.location || '',
                        description: eventData.description || ''
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to save event');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    // Add the new event to our local array with the ID from the server
                    const newEvent = {
                        ...eventData,
                        id: data.data._id // Use the ID from the server
                    };
                    events.push(newEvent);
                    
                    // Sort events by date
                    sortEvents();
                    
                    // Render updated events
                    renderEvents();
                    
                    // Show success notification
                    if (window.showNotification) {
                        window.showNotification('Event added successfully!', 'success');
                    }
                } else {
                    throw new Error(data.message || 'Failed to save event');
                }
            } catch (error) {
                console.error('Error adding event:', error);
                if (window.showNotification) {
                    window.showNotification(`Error: ${error.message}`, 'error');
                }
            }
        }
        
        // Update existing event
        async function updateEvent(eventData) {
            try {
                // Get token from both possible locations
                const token = localStorage.getItem('authToken') || window.authToken;
                
                if (!token) {
                    console.error('Authentication token not found');
                    handleAuthError();
                    return;
                }
                
                // Call the API to update the event
                const response = await fetch(`/api/calendar/${eventData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        eventName: eventData.name,
                        eventDate: eventData.date,
                        eventTime: eventData.time,
                        eventLocation: eventData.location || '',
                        description: eventData.description || ''
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update event');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    // Update the event in our local array
                    const index = events.findIndex(event => event.id === eventData.id);
                    if (index !== -1) {
                        events[index] = eventData;
                        
                        // Sort events by date
                        sortEvents();
                        
                        // Render updated events
                        renderEvents();
                        
                        // Show success notification
                        if (window.showNotification) {
                            window.showNotification('Event updated successfully!', 'success');
                        }
                    }
                } else {
                    throw new Error(data.message || 'Failed to update event');
                }
            } catch (error) {
                console.error('Error updating event:', error);
                if (window.showNotification) {
                    window.showNotification(`Error: ${error.message}`, 'error');
                }
            }
        }
        
        // Delete event
        async function deleteEvent(eventId) {
            try {
                // Show confirmation dialog
                if (!confirm('Are you sure you want to delete this event?')) {
                    return;
                }
                
                // Check if this is a valid MongoDB ObjectID format
                // MongoDB ObjectIDs are 24-character hexadecimal strings
                const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);
                
                if (!isValidObjectId) {
                    // If it's not a valid ObjectID, just remove it from the UI
                    console.warn(`Non-MongoDB ObjectID format detected: ${eventId}. Removing from UI only.`);
                    
                    // Remove the event from our local array
                    events = events.filter(event => event.id !== eventId);
                    
                    // Render updated events
                    renderEvents();
                    
                    // Show success notification
                    if (window.showNotification) {
                        window.showNotification('Event removed from view successfully!', 'success');
                    }
                    return;
                }
                
                // Get token from both possible locations
                const token = localStorage.getItem('authToken') || window.authToken;
                
                if (!token) {
                    console.error('Authentication token not found');
                    handleAuthError();
                    return;
                }
                
                // Call the API to delete the event
                const response = await fetch(`/api/calendar/${eventId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete event');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    // Remove the event from our local array
                    events = events.filter(event => event.id !== eventId);
                    
                    // Render updated events
                    renderEvents();
                    
                    // Show success notification
                    if (window.showNotification) {
                        window.showNotification('Event deleted successfully!', 'success');
                    }
                } else {
                    throw new Error(data.message || 'Failed to delete event');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                if (window.showNotification) {
                    window.showNotification(`Error: ${error.message}`, 'error');
                }
            }
        }
        
        // Sort events by date and time
        function sortEvents() {
            events.sort((a, b) => {
                // Compare dates first
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            });
        }
        
        // Render events to the DOM
        function renderEvents() {
            // Clear current event list
            eventList.innerHTML = '';
            
            if (events.length === 0) {
                // Show empty state
                eventList.innerHTML = `
                    <div class="empty-state">
                        <p>No upcoming events. Click the + button to add one.</p>
                    </div>
                `;
                return;
            }
            
            // Get current date for highlighting upcoming events
            const now = new Date();
            
            // Add each event to the list
            events.forEach(event => {
                const eventDate = new Date(`${event.date}T${event.time}`);
                
                // Format the date and time for display
                const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: '2-digit'
                });
                
                const formattedTime = event.time ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '';
                
                // Create event item element
                const eventItem = document.createElement('div');
                eventItem.className = 'event-item';
                if (eventDate < now) {
                    eventItem.classList.add('past-event');
                }
                
                eventItem.innerHTML = `
                    <div class="event-item-header">
                        <div class="event-name">${event.name}</div>
                        <div class="event-actions">
                            <button class="event-action-btn edit" title="Edit Event" data-id="${event.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="event-action-btn delete" title="Delete Event" data-id="${event.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="event-datetime">
                        <i class="fas fa-calendar-day"></i> ${formattedDate}
                        ${formattedTime ? `<i class="fas fa-clock"></i> ${formattedTime}` : ''}
                    </div>
                    ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                `;
                
                // Add event item to list
                eventList.appendChild(eventItem);
                
                // Add event listeners to action buttons
                const editBtn = eventItem.querySelector('.edit');
                const deleteBtn = eventItem.querySelector('.delete');
                
                editBtn.addEventListener('click', () => {
                    openEditEventModal(event.id);
                });
                
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this event?')) {
                        deleteEvent(event.id);
                    }
                });
            });
        }
        
        // Open edit event modal
        function openEditEventModal(eventId) {
            const event = events.find(e => e.id === eventId);
            if (!event) return;
            
            // Set form values
            eventIdInput.value = event.id;
            document.getElementById('eventName').value = event.name;
            document.getElementById('eventDate').value = event.date;
            document.getElementById('eventTime').value = event.time || '';
            document.getElementById('eventDescription').value = event.description || '';
            
            // Update modal title
            eventModalTitle.textContent = 'Edit Event';
            
            // Show modal
            eventModal.classList.add('active');
        }

        // Load teacher dashboard data from API
        async function loadTeacherDashboardData() {
            try {
                // Check if server is responding using the test endpoint
                console.log('Testing calendar API connection...');
                try {
                    const testResponse = await fetch('/api/calendar/test');
                    if (!testResponse.ok) {
                        console.error('Calendar test endpoint failed:', testResponse.status);
                    } else {
                        console.log('Calendar test endpoint succeeded');
                    }
                } catch (testError) {
                    console.error('Could not connect to test endpoint:', testError);
                }
                
                // Fetch events from the calendar API
                console.log('Fetching calendar events...');
                // Use the getAuthToken helper if available, otherwise fall back to previous approach
                const token = window.getAuthToken ? window.getAuthToken() : 
                              (localStorage.getItem('authToken') || window.authToken);
                console.log('Auth token available:', !!token);
                
                if (!token) {
                    console.error('Authentication token not found');
                    handleAuthError();
                    return; // Stop execution as we're redirecting
                }
                
                const response = await fetch('/api/calendar/upcoming', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Calendar API Response Status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Calendar API Error:', response.status, errorText);
                    
                    // Check if it's an auth problem
                    if (response.status === 401) {
                        console.error('Authentication failed. Token may be expired or invalid');
                        handleAuthError();
                        return; // Stop execution as we're redirecting
                    }
                    
                    // Try the test endpoint as fallback
                    console.log('Trying test endpoint as fallback...');
                    const testResponse = await fetch('/api/calendar/test');
                    
                    if (testResponse.ok) {
                        console.log('Using test data as fallback');
                        const testData = await testResponse.json();
                        return testData; // Return the test data instead of throwing error
                    }
                    
                    throw new Error(`Failed to fetch events: ${response.status} ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Calendar API Response Data:', data);
                
                if (data.success) {
                    if (Array.isArray(data.data) && data.data.length > 0) {
                        try {
                            // Transform the event data to match our frontend format
                            events = data.data.map(event => {
                                try {
                                    const eventDate = new Date(event.eventTime);
                                    return {
                                        id: event._id,
                                        name: event.eventName,
                                        date: eventDate.toISOString().split('T')[0],
                                        time: eventDate.toTimeString().slice(0, 5),
                                        location: event.eventLocation || 'TBD',
                                        description: event.description || '',
                                        organizer: event.organizerId?.name || 'Unknown'
                                    };
                                } catch (itemError) {
                                    console.error('Error processing event item:', itemError, event);
                                    // Return a fallback event object if there's an error with this item
                                    return {
                                        id: event._id || 'error-id',
                                        name: event.eventName || 'Error: Event Name Missing',
                                        date: new Date().toISOString().split('T')[0],
                                        time: '00:00',
                                        description: 'Error processing event data'
                                    };
                                }
                            });
                        } catch (mapError) {
                            console.error('Error mapping events:', mapError);
                            events = []; // Use empty array if mapping fails
                        }
                    } else {
                        console.log('No events returned from API or data is not an array:', data);
                        events = []; // Empty array if no events or invalid data
                    }
                } else {
                    console.error('Error fetching events:', data.message);
                    events = []; // Empty array if there's an error
                }
                
                // No sample events - empty state will be shown if no events are found
                if (events.length === 0) {
                    console.log('No events found');
                    // Empty array will trigger empty state UI
                }
                
                // Fetch video requests and users from API
                let allVideoRequests = [];
                let allUsers = [];
                let userIdToNameMap = {};
                
                try {
                    // Get token from both possible locations
                    const token = localStorage.getItem('authToken') || window.authToken;
                    
                    if (!token) {
                        console.error('Authentication token not found for fetching video requests');
                        throw new Error('Authentication token not found');
                    }
                    
                    const [videoRequestsResponse, usersResponse] = await Promise.all([
                        fetch('/api/video-requests', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }),
                        fetch('/api/users', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                    ]);
                    
                    if (!videoRequestsResponse.ok || !usersResponse.ok) {
                        throw new Error('Failed to fetch data');
                    }
                    
                    const videoRequestsData = await videoRequestsResponse.json();
                    const usersData = await usersResponse.json();
                    
                    allVideoRequests = videoRequestsData.success ? videoRequestsData.data : [];
                    allUsers = usersData.success ? usersData.data : [];
                    
                    // Map user IDs to names for easy lookup
                    userIdToNameMap = {};
                    allUsers.forEach(user => {
                        userIdToNameMap[user._id] = user.name;
                    });
                } catch (error) {
                    console.error('Error fetching data:', error);
                    // Handle error, maybe show a message to the user
                }
                
                // Convert video requests into the required format
                requests = allVideoRequests.map(request => {
                    return {
                        id: request._id,
                        title: request.videoTitle,
                        description: request.videoDescription,
                        requester: userIdToNameMap[request.requesterId] || 'Unknown User',
                        status: request.status.replace(' ', '-'),
                        date: new Date(request.createdAt).toISOString()
                    };
                });
                
                // Sort events and requests
                sortEvents();
                sortRequests();
                
                // Render events and requests to the DOM
                renderEvents();
                renderRequests();
                
                // In a real app, you would fetch from API like this:
                /*
                const response = await fetch('/api/mat/dashboard/teacher', {
                    headers: {
                        'Authorization': `Bearer ${window.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Teacher dashboard data loaded:', data);
                    events = data.events || [];
                    requests = data.requests || [];
                    sortEvents();
                    sortRequests();
                    renderEvents();
                    renderRequests();
                } else {
                    console.error('Failed to load teacher dashboard data');
                }
                */
            } catch (error) {
                console.error('Teacher dashboard data error:', error);
                
                // More detailed error message for debugging
                const errorMessage = error.message || 'Unknown error';
                
                eventList.innerHTML = `
                    <div class="error-state">
                        <p>Failed to load data: ${errorMessage}</p>
                        <p>Check the browser console for more details.</p>
                    </div>
                `;
                
                if (requestList) {
                    requestList.innerHTML = `
                        <div class="error-state">
                            <p>Failed to load data: ${errorMessage}</p>
                            <p>Check the browser console for more details.</p>
                        </div>
                    `;
                }
                
                // No fallback data - show error state instead
                events = [];
                
                // Log detailed error for debugging
                console.error('API error occurred, showing empty state with error message');
                
                // At least attempt to render the fallback events
                try {
                    sortEvents();
                    renderEvents();
                } catch (renderError) {
                    console.error('Failed to render fallback events:', renderError);
                }
            }
        }

        // Helper function to handle auth errors
        function handleAuthError() {
            console.log('Authentication error detected, redirecting to login...');
            
            // Clear all authentication tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            window.authToken = null;
            window.currentUser = null;
            window.isLoggedIn = false;
            
            // Show message to user only if we aren't already on the login page
            if (window.location.pathname !== '/mat.html') {
                if (window.showNotification) {
                    window.showNotification('Your session has expired. Please log in again.', 'error');
                } else {
                    alert('Your session has expired. Please log in again.');
                }
                
                // Redirect to login page after a short delay to ensure the alert is seen
                setTimeout(() => {
                    window.location.href = '/mat.html';
                }, 1000);
            }
        }

        // Expose function to be called when teacher dashboard is shown
        window.initializeTeacherDashboard = () => {
            // Ensure token synchronization between localStorage and window.authToken
            const localStorageToken = localStorage.getItem('authToken');
            if (localStorageToken && !window.authToken) {
                window.authToken = localStorageToken;
                console.log("Synchronized token from localStorage to window.authToken");
            } else if (window.authToken && !localStorageToken) {
                localStorage.setItem('authToken', window.authToken);
                console.log("Synchronized token from window.authToken to localStorage");
            }
            
            initTeacherDashboard();
            console.log("Teacher dashboard is now visible and initialized.");
        };
    }
});
