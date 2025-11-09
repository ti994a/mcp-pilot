/**
 * MCPilot - Main Application Controller
 */

import { FileManager } from './fileManager.js';
import { StateManager } from './stateManager.js';
import { UIManager } from './uiManager.js';

class MCPilotApp {
    constructor() {
        this.fileManager = new FileManager();
        this.stateManager = new StateManager();
        this.uiManager = new UIManager(this.stateManager);
    }

    /**
     * Initialize application
     */
    async initialize() {
        try {
            // Initialize UI
            this.uiManager.initialize();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Load data
            await this.loadData();
            
            // Apply saved theme
            const theme = this.stateManager.getState().theme;
            this.uiManager.applyTheme(theme);
            
            console.log('MCPilot initialized successfully');
        } catch (error) {
            console.error('Failed to initialize MCPilot:', error);
            this.uiManager.showNotification('Failed to initialize application', 'error');
        }
    }

    /**
     * Load data from files
     */
    async loadData() {
        try {
            this.uiManager.showLoading('Loading configuration...');
            
            // Check if sample data exists, if not load it
            const hasSample = await this.fileManager.hasSampleData();
            if (!hasSample) {
                await this.fileManager.loadSampleData();
            }
            
            // Read files
            const mcpConfig = await this.fileManager.readMcpConfig();
            const metadata = await this.fileManager.readMetadata();
            
            // Load into state
            this.stateManager.loadFromFiles(mcpConfig, metadata);
            
            // Render UI
            this.uiManager.renderDashboard();
            
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error loading data:', error);
            this.uiManager.showNotification('Error loading configuration', 'error');
        }
    }

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Action buttons
        this.uiManager.elements.refreshBtn.addEventListener('click', () => this.handleRefresh());
        this.uiManager.elements.refreshDescriptionsBtn.addEventListener('click', () => this.handleRefreshDescriptions());
        this.uiManager.elements.exportBtn.addEventListener('click', () => this.handleExport());
        this.uiManager.elements.applyConfigBtn.addEventListener('click', () => this.handleApplyConfiguration());
        this.uiManager.elements.clearContextBtn.addEventListener('click', () => this.handleClearContext());
        
        // Profile controls
        this.uiManager.elements.profileSelect.addEventListener('change', (e) => this.handleProfileSelect(e.target.value));
        this.uiManager.elements.saveProfileBtn.addEventListener('click', () => this.handleProfileSaveClick());
        this.uiManager.elements.deleteProfileBtn.addEventListener('click', () => this.handleProfileDelete());
        
        // Theme toggle
        this.uiManager.elements.themeToggle.addEventListener('click', () => this.uiManager.toggleTheme());
        
        // Shortcuts modal
        this.uiManager.elements.shortcutsBtn.addEventListener('click', () => this.uiManager.showShortcutsModal());
        this.uiManager.elements.shortcutsClose.addEventListener('click', () => this.uiManager.hideShortcutsModal());
        this.uiManager.elements.shortcutsModal.addEventListener('click', (e) => {
            if (e.target === this.uiManager.elements.shortcutsModal) {
                this.uiManager.hideShortcutsModal();
            }
        });
        
        // Profile save modal
        this.uiManager.elements.profileSaveClose.addEventListener('click', () => this.uiManager.hideProfileSaveModal());
        this.uiManager.elements.profileSaveCancel.addEventListener('click', () => this.uiManager.hideProfileSaveModal());
        this.uiManager.elements.profileSaveModal.addEventListener('click', (e) => {
            if (e.target === this.uiManager.elements.profileSaveModal) {
                this.uiManager.hideProfileSaveModal();
            }
        });
        this.uiManager.elements.profileSaveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileSave();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcut(e));
    }

    /**
     * Handle refresh
     */
    async handleRefresh() {
        await this.loadData();
        this.uiManager.showNotification('Dashboard refreshed', 'success');
    }

    /**
     * Handle refresh descriptions
     */
    async handleRefreshDescriptions() {
        this.uiManager.showLoading('Refreshing descriptions...');
        
        // Simulate querying servers (in real implementation, this would query actual MCP servers)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.uiManager.hideLoading();
        this.uiManager.showNotification('Descriptions refreshed', 'success');
    }

    /**
     * Handle export
     */
    async handleExport() {
        try {
            const filename = await this.fileManager.exportMcpConfig();
            this.uiManager.showNotification(`Configuration exported as ${filename}`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.uiManager.showNotification('Failed to export configuration', 'error');
        }
    }

    /**
     * Handle apply configuration
     */
    async handleApplyConfiguration() {
        try {
            this.uiManager.showLoading('Applying configuration to Amazon Q...');
            
            // Save current state to files
            await this.saveState();
            
            // Simulate Q integration (in real implementation, this would call Q API)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.uiManager.hideLoading();
            this.uiManager.showNotification('Configuration applied successfully', 'success');
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Apply configuration error:', error);
            this.uiManager.showNotification('Failed to apply configuration', 'error');
        }
    }

    /**
     * Handle clear context
     */
    async handleClearContext() {
        try {
            this.uiManager.showLoading('Clearing Q context...');
            
            // Simulate Q integration
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update context utilization
            this.stateManager.updateContextUtilization(0);
            this.uiManager.renderStatistics();
            
            this.uiManager.hideLoading();
            this.uiManager.showNotification('Q context cleared', 'success');
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Clear context error:', error);
            this.uiManager.showNotification('Failed to clear context', 'error');
        }
    }

    /**
     * Handle profile select
     */
    async handleProfileSelect(profileName) {
        if (!profileName) {
            // "None" selected - clear active profile
            this.stateManager.getState().activeProfile = null;
            this.uiManager.elements.deleteProfileBtn.disabled = true;
            await this.saveState();
            return;
        }
        
        const success = this.stateManager.applyProfile(profileName);
        if (success) {
            await this.saveState();
            this.uiManager.showNotification(`Profile "${profileName}" applied`, 'success');
            this.uiManager.elements.deleteProfileBtn.disabled = false;
        } else {
            this.uiManager.showNotification('Failed to apply profile', 'error');
        }
    }

    /**
     * Handle profile save click
     */
    handleProfileSaveClick() {
        this.uiManager.showProfileSaveModal();
    }

    /**
     * Handle profile save
     */
    async handleProfileSave() {
        const name = document.getElementById('profile-name').value.trim();
        const description = document.getElementById('profile-description').value.trim();
        
        if (!name) {
            this.uiManager.showNotification('Profile name is required', 'error');
            return;
        }
        
        // Check if profile already exists
        if (this.stateManager.getState().getProfile(name)) {
            if (!confirm(`Profile "${name}" already exists. Overwrite?`)) {
                return;
            }
        }
        
        this.stateManager.saveProfile(name, description);
        await this.saveState();
        
        this.uiManager.hideProfileSaveModal();
        this.uiManager.showNotification(`Profile "${name}" saved`, 'success');
    }

    /**
     * Handle profile delete
     */
    async handleProfileDelete() {
        const activeProfile = this.stateManager.getState().activeProfile;
        if (!activeProfile) return;
        
        const confirmed = await this.uiManager.showProfileDeleteConfirmation(activeProfile);
        if (!confirmed) return;
        
        this.stateManager.deleteProfile(activeProfile);
        await this.saveState();
        
        this.uiManager.showNotification(`Profile "${activeProfile}" deleted`, 'success');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcut(e) {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;
        
        // Shortcuts with Ctrl/Cmd
        if (modifier) {
            switch (e.key.toLowerCase()) {
                case 'r':
                    e.preventDefault();
                    this.handleRefresh();
                    break;
                case 'e':
                    e.preventDefault();
                    this.handleExport();
                    break;
                case 't':
                    e.preventDefault();
                    this.uiManager.toggleTheme();
                    break;
                case 'a':
                    e.preventDefault();
                    this.handleApplyConfiguration();
                    break;
                case 'l':
                    e.preventDefault();
                    this.handleClearContext();
                    break;
                case 's':
                    e.preventDefault();
                    this.handleProfileSaveClick();
                    break;
                case 'd':
                    e.preventDefault();
                    this.handleProfileDelete();
                    break;
                case 'k':
                    e.preventDefault();
                    this.uiManager.showShortcutsModal();
                    break;
            }
        } else {
            // Shortcuts without modifier
            switch (e.key) {
                case '?':
                    e.preventDefault();
                    this.uiManager.showShortcutsModal();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.uiManager.navigateServers('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.uiManager.navigateServers('down');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.uiManager.expandCollapseSelected(true);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.uiManager.expandCollapseSelected(false);
                    break;
                case ' ':
                    e.preventDefault();
                    const serverName = this.uiManager.getSelectedServerName();
                    if (serverName) {
                        this.uiManager.handleServerToggle(serverName);
                    }
                    break;
                case 'Escape':
                    this.uiManager.hideShortcutsModal();
                    this.uiManager.hideProfileSaveModal();
                    break;
            }
        }
    }

    /**
     * Save current state to files
     */
    async saveState() {
        try {
            const mcpConfig = this.stateManager.exportToMcpConfig();
            const metadata = this.stateManager.exportToMetadata();
            
            await this.fileManager.writeMcpConfig(mcpConfig);
            await this.fileManager.writeMetadata(metadata);
        } catch (error) {
            console.error('Error saving state:', error);
            throw error;
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new MCPilotApp();
        app.initialize();
    });
} else {
    const app = new MCPilotApp();
    app.initialize();
}
