/**
 * StateManager - Coordinates application state updates and notifies listeners
 */

import { AppState, Server, Tool, Profile } from './models.js';

export class StateManager {
    constructor() {
        this.state = new AppState();
        this.listeners = [];
    }

    /**
     * Load data from files into state
     * @param {object} mcpConfig - MCP configuration object
     * @param {object} metadata - Metadata object
     */
    loadFromFiles(mcpConfig, metadata) {
        // Clear existing state
        this.state.clear();

        // Load application settings
        if (metadata.application) {
            this.state.theme = metadata.application.theme || 'light';
            this.state.contextUtilization = metadata.application.contextUtilization || 0;
            this.state.activeProfile = metadata.application.activeProfile || null;
        }

        // Load servers
        if (mcpConfig.mcpServers) {
            for (const [name, config] of Object.entries(mcpConfig.mcpServers)) {
                const serverMetadata = metadata.servers?.[name] || {};
                const server = new Server(name, config, serverMetadata);

                // Load tools for this server
                const toolsMetadata = metadata.tools?.[name] || {};
                for (const [toolName, toolMeta] of Object.entries(toolsMetadata)) {
                    const tool = new Tool(toolName, toolMeta.description, name);
                    server.tools.push(tool);
                }

                // Sort tools alphabetically
                server.tools.sort((a, b) => a.name.localeCompare(b.name));

                this.state.setServer(server);
            }
        }

        // Load profiles
        if (metadata.profiles) {
            for (const [name, profileData] of Object.entries(metadata.profiles)) {
                const profile = Profile.fromMetadata(name, profileData);
                this.state.setProfile(profile);
            }
        }

        // Store metadata reference
        this.state.metadata = metadata;

        // Notify listeners
        this.notifyListeners('load');
    }

    /**
     * Toggle server enabled/disabled state
     * @param {string} serverName
     * @returns {Server|null}
     */
    toggleServer(serverName) {
        const server = this.state.getServer(serverName);
        if (!server) {
            console.error(`Server not found: ${serverName}`);
            return null;
        }

        server.toggle();
        this.notifyListeners('server-toggle', { serverName, enabled: server.isEnabled() });
        return server;
    }

    /**
     * Toggle server expanded state
     * @param {string} serverName
     * @returns {boolean} - New expanded state
     */
    toggleServerExpanded(serverName) {
        const server = this.state.getServer(serverName);
        if (!server) {
            console.error(`Server not found: ${serverName}`);
            return false;
        }

        server.expanded = !server.expanded;
        this.notifyListeners('server-expand', { serverName, expanded: server.expanded });
        return server.expanded;
    }

    /**
     * Toggle tools expanded state for a server
     * @param {string} serverName
     * @returns {boolean} - New expanded state
     */
    toggleToolsExpanded(serverName) {
        const server = this.state.getServer(serverName);
        if (!server) {
            console.error(`Server not found: ${serverName}`);
            return false;
        }

        server.toolsExpanded = !server.toolsExpanded;
        this.notifyListeners('tools-expand', { serverName, expanded: server.toolsExpanded });
        return server.toolsExpanded;
    }

    /**
     * Update metadata
     * @param {object} metadata
     */
    updateMetadata(metadata) {
        this.state.metadata = metadata;
        this.notifyListeners('metadata-update');
    }

    /**
     * Update theme
     * @param {string} theme - 'light' or 'dark'
     */
    updateTheme(theme) {
        this.state.theme = theme;
        if (this.state.metadata?.application) {
            this.state.metadata.application.theme = theme;
        }
        this.notifyListeners('theme-change', { theme });
    }

    /**
     * Update context utilization
     * @param {number} percentage
     */
    updateContextUtilization(percentage) {
        this.state.contextUtilization = percentage;
        if (this.state.metadata?.application) {
            this.state.metadata.application.contextUtilization = percentage;
        }
        this.notifyListeners('context-update', { percentage });
    }

    /**
     * Apply a profile
     * @param {string} profileName
     * @returns {boolean} - Success
     */
    applyProfile(profileName) {
        const profile = this.state.getProfile(profileName);
        if (!profile) {
            console.error(`Profile not found: ${profileName}`);
            return false;
        }

        this.state.applyProfile(profile);
        this.notifyListeners('profile-apply', { profileName });
        return true;
    }

    /**
     * Save a new profile
     * @param {string} name
     * @param {string} description
     * @returns {Profile}
     */
    saveProfile(name, description) {
        const config = this.state.getCurrentConfiguration();
        const profile = new Profile(name, description, config.enabled, config.disabled);
        this.state.setProfile(profile);
        this.notifyListeners('profile-save', { profileName: name });
        return profile;
    }

    /**
     * Delete a profile
     * @param {string} profileName
     * @returns {boolean} - Success
     */
    deleteProfile(profileName) {
        const profile = this.state.getProfile(profileName);
        if (!profile) {
            console.error(`Profile not found: ${profileName}`);
            return false;
        }

        this.state.deleteProfile(profileName);
        this.notifyListeners('profile-delete', { profileName });
        return true;
    }

    /**
     * Update server description
     * @param {string} serverName
     * @param {string} description
     */
    updateServerDescription(serverName, description) {
        const server = this.state.getServer(serverName);
        if (server) {
            server.description = description;
            this.notifyListeners('server-description-update', { serverName });
        }
    }

    /**
     * Update tool descriptions for a server
     * @param {string} serverName
     * @param {Array<{name: string, description: string}>} tools
     */
    updateServerTools(serverName, tools) {
        const server = this.state.getServer(serverName);
        if (!server) {
            console.error(`Server not found: ${serverName}`);
            return;
        }

        // Clear existing tools
        server.tools = [];

        // Add new tools
        tools.forEach(toolData => {
            const tool = new Tool(toolData.name, toolData.description, serverName);
            server.tools.push(tool);
        });

        // Sort tools alphabetically
        server.tools.sort((a, b) => a.name.localeCompare(b.name));

        this.notifyListeners('tools-update', { serverName });
    }

    /**
     * Get servers sorted alphabetically
     * @returns {Array<Server>}
     */
    getServersAlphabetically() {
        return this.state.getServersAlphabetically();
    }

    /**
     * Get profiles sorted alphabetically
     * @returns {Array<Profile>}
     */
    getProfilesAlphabetically() {
        return this.state.getProfilesAlphabetically();
    }

    /**
     * Get current statistics
     * @returns {object}
     */
    getStatistics() {
        return this.state.getStatistics();
    }

    /**
     * Get current state
     * @returns {AppState}
     */
    getState() {
        return this.state;
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function(eventType, data)
     * @returns {Function} - Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify all listeners of state change
     * @param {string} eventType
     * @param {object} data
     */
    notifyListeners(eventType, data = {}) {
        this.listeners.forEach(listener => {
            try {
                listener(eventType, data);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }

    /**
     * Export current state to mcp.json format
     * @returns {object}
     */
    exportToMcpConfig() {
        const mcpServers = {};
        
        this.state.servers.forEach((server, name) => {
            mcpServers[name] = server.toMcpConfig();
        });

        return { mcpServers };
    }

    /**
     * Export current state to metadata format
     * @returns {object}
     */
    exportToMetadata() {
        const metadata = {
            application: {
                theme: this.state.theme,
                lastRefresh: new Date().toISOString(),
                contextUtilization: this.state.contextUtilization,
                activeProfile: this.state.activeProfile
            },
            servers: {},
            tools: {},
            profiles: {}
        };

        // Export servers
        this.state.servers.forEach((server, name) => {
            metadata.servers[name] = server.toMetadata();
            
            // Export tools for this server
            if (server.tools.length > 0) {
                metadata.tools[name] = {};
                server.tools.forEach(tool => {
                    metadata.tools[name][tool.name] = tool.toMetadata();
                });
            }
        });

        // Export profiles
        this.state.profiles.forEach((profile, name) => {
            metadata.profiles[name] = profile.toMetadata();
        });

        return metadata;
    }
}
