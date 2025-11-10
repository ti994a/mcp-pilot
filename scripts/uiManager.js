/**
 * UIManager - Handles all DOM manipulation and rendering
 */

export class UIManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.elements = {};
        this.selectedServerIndex = -1;
    }

    /**
     * Initialize UI and cache DOM elements
     */
    initialize() {
        // Cache DOM elements
        this.elements = {
            // Statistics
            serversEnabled: document.getElementById('servers-enabled'),
            serversDisabled: document.getElementById('servers-disabled'),
            toolsTotal: document.getElementById('tools-total'),
            
            // Actions
            refreshBtn: document.getElementById('refresh-btn'),
            exportBtn: document.getElementById('export-btn'),
            
            // Profile
            profileSelect: document.getElementById('profile-select'),
            saveProfileBtn: document.getElementById('save-profile-btn'),
            deleteProfileBtn: document.getElementById('delete-profile-btn'),
            
            // Server list
            serverList: document.getElementById('server-list'),
            emptyState: document.getElementById('empty-state'),
            
            // Theme
            themeToggle: document.getElementById('theme-toggle'),
            
            // Modals
            shortcutsBtn: document.getElementById('shortcuts-btn'),
            shortcutsModal: document.getElementById('shortcuts-modal'),
            shortcutsClose: document.getElementById('shortcuts-close'),
            profileSaveModal: document.getElementById('profile-save-modal'),
            profileSaveForm: document.getElementById('profile-save-form'),
            profileSaveClose: document.getElementById('profile-save-close'),
            profileSaveCancel: document.getElementById('profile-save-cancel'),
            
            // Loading
            loadingOverlay: document.getElementById('loading-overlay'),
            loadingMessage: document.getElementById('loading-message'),
            
            // Notifications
            notificationContainer: document.getElementById('notification-container')
        };

        // Subscribe to state changes
        this.stateManager.subscribe((eventType, data) => {
            this.handleStateChange(eventType, data);
        });
    }

    /**
     * Handle state changes
     */
    handleStateChange(eventType, data) {
        switch (eventType) {
            case 'load':
            case 'server-toggle':
            case 'profile-apply':
                this.renderDashboard();
                break;
            case 'server-expand':
            case 'tools-expand':
                this.renderServerList();
                break;
            case 'theme-change':
                this.applyTheme(data.theme);
                break;
            case 'profile-save':
            case 'profile-delete':
                this.renderProfileDropdown();
                break;
        }
    }

    /**
     * Render entire dashboard
     */
    renderDashboard() {
        this.renderStatistics();
        this.renderServerList();
        this.renderProfileDropdown();
    }

    /**
     * Render statistics bar
     */
    renderStatistics() {
        const stats = this.stateManager.getStatistics();
        
        this.elements.serversEnabled.textContent = stats.enabled;
        this.elements.serversDisabled.textContent = stats.disabled;
        this.elements.toolsTotal.textContent = stats.totalTools;
        
        // Add update animation
        [this.elements.serversEnabled, this.elements.serversDisabled, 
         this.elements.toolsTotal].forEach(el => {
            el.classList.add('updating');
            setTimeout(() => el.classList.remove('updating'), 500);
        });
    }

    /**
     * Render server list
     */
    renderServerList() {
        const servers = this.stateManager.getServersAlphabetically();
        
        if (servers.length === 0) {
            this.elements.serverList.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
            return;
        }
        
        this.elements.serverList.style.display = 'flex';
        this.elements.emptyState.style.display = 'none';
        
        this.elements.serverList.innerHTML = '';
        
        servers.forEach((server, index) => {
            const serverElement = this.createServerElement(server, index);
            this.elements.serverList.appendChild(serverElement);
        });
    }

    /**
     * Create server DOM element
     */
    createServerElement(server, index) {
        const serverDiv = document.createElement('div');
        serverDiv.className = `server-item ${server.disabled ? 'disabled' : ''}`;
        serverDiv.dataset.serverName = server.name;
        serverDiv.dataset.index = index;
        
        // Server header
        const header = document.createElement('div');
        header.className = 'server-header';
        
        // Expand icon
        const expandIcon = document.createElement('span');
        expandIcon.className = `expand-icon ${server.expanded ? 'expanded' : ''}`;
        expandIcon.textContent = '▶';
        expandIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleServerExpand(server.name);
        });
        
        // Status indicator
        const statusIndicator = document.createElement('span');
        statusIndicator.className = `status-indicator ${server.isEnabled() ? 'enabled' : 'disabled'}`;
        
        // Server name
        const serverName = document.createElement('span');
        serverName.className = 'server-name';
        serverName.textContent = server.name;
        
        // Toggle switch
        const toggleSwitch = document.createElement('button');
        toggleSwitch.className = `toggle-switch ${server.isEnabled() ? 'enabled' : ''}`;
        toggleSwitch.setAttribute('aria-label', `Toggle ${server.name}`);
        toggleSwitch.setAttribute('role', 'switch');
        toggleSwitch.setAttribute('aria-checked', server.isEnabled().toString());
        toggleSwitch.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleServerToggle(server.name);
        });
        
        header.appendChild(expandIcon);
        header.appendChild(statusIndicator);
        header.appendChild(serverName);
        header.appendChild(toggleSwitch);
        
        header.addEventListener('click', () => {
            this.handleServerExpand(server.name);
        });
        
        serverDiv.appendChild(header);
        
        // Server details (shown when expanded)
        if (server.expanded) {
            const details = document.createElement('div');
            details.className = 'server-details expanded';
            
            // Command
            const command = document.createElement('div');
            command.className = 'server-command';
            command.textContent = server.getCommandString();
            details.appendChild(command);
            
            // Description
            if (server.description) {
                const description = document.createElement('div');
                description.className = 'server-description';
                description.textContent = server.description;
                details.appendChild(description);
            }
            
            // Tools node
            const toolsNode = this.createToolsNode(server);
            details.appendChild(toolsNode);
            
            serverDiv.appendChild(details);
        }
        
        return serverDiv;
    }

    /**
     * Create tools node
     */
    createToolsNode(server) {
        const toolsDiv = document.createElement('div');
        toolsDiv.className = 'tools-node';
        
        // Tools header
        const toolsHeader = document.createElement('div');
        toolsHeader.className = 'tools-header';
        
        const expandIcon = document.createElement('span');
        expandIcon.className = `expand-icon ${server.toolsExpanded ? 'expanded' : ''}`;
        expandIcon.textContent = '▶';
        
        const toolsLabel = document.createElement('span');
        toolsLabel.className = 'tools-label';
        toolsLabel.textContent = `Tools (${server.tools.length})`;
        
        toolsHeader.appendChild(expandIcon);
        toolsHeader.appendChild(toolsLabel);
        
        toolsHeader.addEventListener('click', () => {
            this.handleToolsExpand(server.name);
        });
        
        toolsDiv.appendChild(toolsHeader);
        
        // Tools list (shown when expanded)
        if (server.toolsExpanded && server.tools.length > 0) {
            const toolsList = document.createElement('div');
            toolsList.className = 'tools-list expanded';
            
            server.tools.forEach(tool => {
                const toolItem = document.createElement('div');
                toolItem.className = 'tool-item';
                
                const toolName = document.createElement('div');
                toolName.className = 'tool-name';
                toolName.textContent = tool.name;
                
                const toolDescription = document.createElement('div');
                toolDescription.className = 'tool-description';
                toolDescription.textContent = tool.description || 'No description available';
                
                toolItem.appendChild(toolName);
                toolItem.appendChild(toolDescription);
                toolsList.appendChild(toolItem);
            });
            
            toolsDiv.appendChild(toolsList);
        }
        
        return toolsDiv;
    }

    /**
     * Render profile dropdown
     */
    renderProfileDropdown() {
        const profiles = this.stateManager.getProfilesAlphabetically();
        const activeProfile = this.stateManager.getState().activeProfile;
        
        // Clear existing options except "None"
        this.elements.profileSelect.innerHTML = '<option value="">None</option>';
        
        // Add profiles
        profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.name;
            option.textContent = profile.name;
            if (profile.name === activeProfile) {
                option.selected = true;
            }
            this.elements.profileSelect.appendChild(option);
        });
        
        // Enable/disable delete button
        this.elements.deleteProfileBtn.disabled = !activeProfile;
    }

    /**
     * Handle server toggle
     */
    handleServerToggle(serverName) {
        const server = this.stateManager.toggleServer(serverName);
        if (server) {
            this.showNotification(
                `Server "${serverName}" ${server.isEnabled() ? 'enabled' : 'disabled'}`,
                'success'
            );
        }
    }

    /**
     * Handle server expand/collapse
     */
    handleServerExpand(serverName) {
        this.stateManager.toggleServerExpanded(serverName);
    }

    /**
     * Handle tools expand/collapse
     */
    handleToolsExpand(serverName) {
        this.stateManager.toggleToolsExpanded(serverName);
    }

    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        this.elements.loadingMessage.textContent = message;
        this.elements.loadingOverlay.style.display = 'flex';
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.elements.loadingOverlay.style.display = 'none';
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.elements.notificationContainer.appendChild(notification);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            notification.classList.add('removing');
            setTimeout(() => {
                notification.remove();
            }, 250);
        }, 3000);
    }

    /**
     * Show keyboard shortcuts modal
     */
    showShortcutsModal() {
        this.elements.shortcutsModal.style.display = 'flex';
    }

    /**
     * Hide keyboard shortcuts modal
     */
    hideShortcutsModal() {
        this.elements.shortcutsModal.style.display = 'none';
    }

    /**
     * Show profile save modal
     */
    showProfileSaveModal() {
        this.elements.profileSaveModal.style.display = 'flex';
        document.getElementById('profile-name').value = '';
        document.getElementById('profile-description').value = '';
        document.getElementById('profile-name').focus();
    }

    /**
     * Hide profile save modal
     */
    hideProfileSaveModal() {
        this.elements.profileSaveModal.style.display = 'none';
    }

    /**
     * Show profile delete confirmation
     */
    async showProfileDeleteConfirmation(profileName) {
        return confirm(`Are you sure you want to delete the profile "${profileName}"?`);
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        document.body.dataset.theme = theme;
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = document.body.dataset.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.stateManager.updateTheme(newTheme);
    }

    /**
     * Navigate servers with keyboard
     */
    navigateServers(direction) {
        const servers = this.stateManager.getServersAlphabetically();
        if (servers.length === 0) return;
        
        if (direction === 'down') {
            this.selectedServerIndex = Math.min(this.selectedServerIndex + 1, servers.length - 1);
        } else if (direction === 'up') {
            this.selectedServerIndex = Math.max(this.selectedServerIndex - 1, 0);
        }
        
        // Highlight selected server
        const serverElements = this.elements.serverList.querySelectorAll('.server-item');
        serverElements.forEach((el, index) => {
            if (index === this.selectedServerIndex) {
                el.style.outline = '2px solid var(--accent-color)';
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                el.style.outline = 'none';
            }
        });
    }

    /**
     * Get selected server name
     */
    getSelectedServerName() {
        const servers = this.stateManager.getServersAlphabetically();
        if (this.selectedServerIndex >= 0 && this.selectedServerIndex < servers.length) {
            return servers[this.selectedServerIndex].name;
        }
        return null;
    }

    /**
     * Expand/collapse selected server
     */
    expandCollapseSelected(expand) {
        const serverName = this.getSelectedServerName();
        if (serverName) {
            const server = this.stateManager.getState().getServer(serverName);
            if (server) {
                if (expand && !server.expanded) {
                    this.handleServerExpand(serverName);
                } else if (!expand && server.expanded) {
                    this.handleServerExpand(serverName);
                }
            }
        }
    }
}
