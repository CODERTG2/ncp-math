document.addEventListener('DOMContentLoaded', () => {
    // Wait for components to load before initializing
    document.addEventListener('componentsLoaded', () => {
        console.log('Components loaded, initializing teacher dashboard module...');
        setupTeacherDashboard();
    });

    function setupTeacherDashboard() {
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
                        <p>No video requests yet. Click the + button to add one.</p>
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
                
                // Show modal
                eventModal.classList.add('active');
            });
            
            // Close modal handlers
            closeEventModal.addEventListener('click', () => {
                eventModal.classList.remove('active');
            });
            
            cancelEventBtn.addEventListener('click', () => {
                eventModal.classList.remove('active');
            });
            
            // Form submission handler
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const eventId = eventIdInput.value;
                const eventName = document.getElementById('eventName').value;
                const eventDate = document.getElementById('eventDate').value;
                const eventTime = document.getElementById('eventTime').value;
                const eventDescription = document.getElementById('eventDescription').value;
                
                // Prepare new event object
                const eventData = {
                    id: eventId || Date.now().toString(), // Use existing ID or generate new one
                    name: eventName,
                    date: eventDate,
                    time: eventTime,
                    description: eventDescription
                };
                
                if (eventId) {
                    // Update existing event
                    updateEvent(eventData);
                } else {
                    // Add new event
                    addEvent(eventData);
                }
                
                // Close modal
                eventModal.classList.remove('active');
            });
            
            // Click outside modal to close
            eventModal.addEventListener('click', (e) => {
                if (e.target === eventModal) {
                    eventModal.classList.remove('active');
                }
            });
        }
        
        // Add new event
        function addEvent(eventData) {
            // In a real app, this would call an API to save the event
            // For now, we'll just add it to our local array
            events.push(eventData);
            
            // Sort events by date
            sortEvents();
            
            // Render updated events
            renderEvents();
            
            // Show success notification
            if (window.showNotification) {
                window.showNotification('Event added successfully!', 'success');
            }
        }
        
        // Update existing event
        function updateEvent(eventData) {
            // In a real app, this would call an API to update the event
            // For now, we'll just update our local array
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
        }
        
        // Delete event
        function deleteEvent(eventId) {
            // In a real app, this would call an API to delete the event
            // For now, we'll just remove it from our local array
            events = events.filter(event => event.id !== eventId);
            
            // Render updated events
            renderEvents();
            
            // Show success notification
            if (window.showNotification) {
                window.showNotification('Event deleted successfully!', 'success');
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
                // Simulate API call with initial sample data
                // In a real application, this would be fetched from the server
                events = [
                    {
                        id: '1',
                        name: 'Grade Meeting',
                        date: '2025-06-18',
                        time: '14:00',
                        description: 'End of semester grade review with department heads.'
                    },
                    {
                        id: '2',
                        name: 'Parent Conference',
                        date: '2025-06-22',
                        time: '16:30',
                        description: 'Semester progress update with parents.'
                    },
                    {
                        id: '3',
                        name: 'Math Competition Prep',
                        date: '2025-06-19',
                        time: '15:30',
                        description: 'Preparing students for the regional math competition.'
                    }
                ];
                
                // Sample video requests
                requests = [
                    {
                        id: '1',
                        title: 'Calculus: Integration Techniques',
                        description: 'Need a comprehensive video covering various integration techniques including substitution, parts, and partial fractions.',
                        requester: 'Ms. Johnson',
                        status: 'completed',
                        date: '2025-05-20T10:30:00'
                    },
                    {
                        id: '2',
                        title: 'Algebra: Solving Quadratic Equations',
                        description: 'Video explaining different methods to solve quadratic equations with examples.',
                        requester: 'Mr. Smith',
                        status: 'in-progress',
                        date: '2025-06-10T14:45:00'
                    },
                    {
                        id: '3',
                        title: 'Geometry: Circle Theorems',
                        description: 'Need a video covering all major circle theorems with visual examples and proofs.',
                        requester: 'Ms. Garcia',
                        status: 'not-started',
                        date: '2025-06-15T09:15:00'
                    }
                ];
                
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
                eventList.innerHTML = `
                    <div class="error-state">
                        <p>Failed to load data. Please try again later.</p>
                    </div>
                `;
                requestList.innerHTML = `
                    <div class="error-state">
                        <p>Failed to load data. Please try again later.</p>
                    </div>
                `;
            }
        }

        // Expose function to be called when teacher dashboard is shown
        window.initializeTeacherDashboard = () => {
            initTeacherDashboard();
            console.log("Teacher dashboard is now visible and initialized.");
        };
    }
});
