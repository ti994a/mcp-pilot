/**
 * Data models for MCPilot
 */

/**
 * Server Model
 * Represents an MCP server configuration
 */
export class Server {
    constructor(name, config, metadata = {}) {
        this.name = name;
        this.command = config.command;
        this.args = config.args || [];
        this.env = config.env || {};
        this.cwd = config.cwd || null;
        this.disabled = config.disabled || false;
        this.description = metadata.description || '';
        this.expanded = metadata.expanded || false;
        this.toolsExpanded = metadata.toolsExpanded || false;
        this.tools = [];
    }

    /**
     * Check if server is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return !this.disabled;
    }

    /**
     * Toggle server enabled/disabled state
     */
    toggle() {
        this.disabled = !this.disabled;
    }

    /**
     * Get command string for display
     * @returns {string}
     */
    getCommandString() {
        return `${this.command} ${this.args.join(' ')}`.trim();
    }

    /**
     * Convert to mcp.json format
     * @returns {object}
     */
    toMcpConfig() {
        const config = {
            command: this.command,
            args: this.args
        };

        if (Object.keys(this.env).length > 0) {
            config.env = this.env;
        }

        if (this.cwd) {
            config.cwd = this.cwd;
        }

        if (this.disabled) {
            config.disabled = true;
        }

        return config;
    }

    /**
     * Convert to metadata format
     * @returns {object}
     */
    toMetadata() {
        return {
            description: this.description,
            expanded: this.expanded,
            toolsExpanded: this.toolsExpanded,
            lastQueried: new Date().toISOString()
        };
    }
}

/**
 * Tool Model
 * Represents a tool provided by an MCP server
 */
export class Tool {
    constructor(name, description, serverName) {
        this.name = name;
        this.description = description || '';
        this.serverName = serverName;
    }

    /**
     * Check if tool is enabled (based on parent server)
     * @param {Server} server - Parent server
     * @returns {boolean}
     */
    isEnabled(server) {
        return server && server.isEnabled();
    }

    /**
     * Convert to metadata format
     * @returns {object}
     */
    toMetadata() {
        return {
            description: this.description
        };
    }
}

/**
 * Profile Model
 * Represents a configuration profile
 */
export class Profile {
    constructor(name, description, enabledServers, disabledServers) {
        this.name = name;
        this.description = description || '';
        this.enabledServers = enabledServers || [];
        this.disabledServers = disabledServers || [];
        this.createdAt = new Date().toISOString();
        this.lastUsed = null;
    }

    /**
     * Mark profile as used
     */
    markUsed() {
        this.lastUsed = new Date().toISOString();
    }

    /**
     * Convert to metadata format
     * @returns {object}
     */
    toMetadata() {
        return {
            description: this.description,
            enabledServers: this.enabledServers,
            disabledServers: this.disabledServers,
            createdAt: this.createdAt,
            lastUsed: this.lastUsed
        };
    }

    /**
     * Create from metadata
     * @param {string} name
     * @param {object} metadata
     * @returns {Profile}
     */
    static fromMetadata(name, metadata) {
        const profile = new Profile(
            name,
            metadata.description,
            metadata.enabledServers,
            metadata.disabledServers
        );
        profile.createdAt = metadata.createdAt;
        profile.lastUsed = metadata.lastUsed;
        return profile;
    }
}

/**
 * Application State Model
 * Manages the overall application state
 */
export class AppState {
    constructor() {
        this.servers = new Map();
        this.profiles = new Map();
        this.metadata = null;
        this.theme = 'light';
        this.contextUtilization = 0;
        this.activeProfile = null;
    }

    /**
     * Get statistics about servers and tools
     * @returns {object}
     */
    getStatistics() {
        const total = this.servers.size;
        const enabled = Array.from(this.servers.values())
            .filter(s => s.isEnabled()).length;
        const disabled = total - enabled;
        const totalTools = Array.from(this.servers.values())
            .reduce((sum, s) => sum + s.tools.length, 0);

        return {
            total,
            enabled,
            disabled,
            totalTools,
            contextUtilization: this.contextUtilization
        };
    }

    /**
     * Get current configuration (enabled/disabled servers)
     * @returns {object}
     */
    getCurrentConfiguration() {
        const enabled = [];
        const disabled = [];

        this.servers.forEach((server, name) => {
            if (server.isEnabled()) {
                enabled.push(name);
            } else {
                disabled.push(name);
            }
        });

        return { enabled, disabled };
    }

    /**
     * Apply a profile configuration
     * @param {Profile} profile
     */
    applyProfile(profile) {
        // Enable servers in profile
        profile.enabledServers.forEach(name => {
            const server = this.servers.get(name);
            if (server) {
                server.disabled = false;
            }
        });

        // Disable servers in profile
        profile.disabledServers.forEach(name => {
            const server = this.servers.get(name);
            if (server) {
                server.disabled = true;
            }
        });

        this.activeProfile = profile.name;
        profile.markUsed();
    }

    /**
     * Get servers sorted alphabetically
     * @returns {Array<Server>}
     */
    getServersAlphabetically() {
        return Array.from(this.servers.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get profiles sorted alphabetically
     * @returns {Array<Profile>}
     */
    getProfilesAlphabetically() {
        return Array.from(this.profiles.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Add or update a server
     * @param {Server} server
     */
    setServer(server) {
        this.servers.set(server.name, server);
    }

    /**
     * Get a server by name
     * @param {string} name
     * @returns {Server|undefined}
     */
    getServer(name) {
        return this.servers.get(name);
    }

    /**
     * Add or update a profile
     * @param {Profile} profile
     */
    setProfile(profile) {
        this.profiles.set(profile.name, profile);
    }

    /**
     * Get a profile by name
     * @param {string} name
     * @returns {Profile|undefined}
     */
    getProfile(name) {
        return this.profiles.get(name);
    }

    /**
     * Delete a profile
     * @param {string} name
     */
    deleteProfile(name) {
        this.profiles.delete(name);
        if (this.activeProfile === name) {
            this.activeProfile = null;
        }
    }

    /**
     * Clear all data
     */
    clear() {
        this.servers.clear();
        this.profiles.clear();
        this.metadata = null;
        this.activeProfile = null;
    }
}
