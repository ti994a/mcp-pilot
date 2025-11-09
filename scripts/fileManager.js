/**
 * FileManager - Handles all file I/O operations
 * Uses Node.js server API for file system access
 */

export class FileManager {
    constructor() {
        // API base URL
        this.apiBase = 'http://localhost:3000/api';
    }

    /**
     * Read MCP configuration file
     * @returns {Promise<object>}
     */
    async readMcpConfig() {
        try {
            const response = await fetch(`${this.apiBase}/mcp-config`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const config = await response.json();
            this.validateMcpConfig(config);
            return config;
        } catch (error) {
            console.error('Error reading MCP config:', error);
            throw new Error(`Failed to read MCP configuration: ${error.message}`);
        }
    }

    /**
     * Write MCP configuration file
     * @param {object} config
     * @returns {Promise<void>}
     */
    async writeMcpConfig(config) {
        try {
            // Validate before writing
            this.validateMcpConfig(config);

            const response = await fetch(`${this.apiBase}/mcp-config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('MCP config saved successfully:', result.message);
        } catch (error) {
            console.error('Error writing MCP config:', error);
            throw new Error(`Failed to write MCP configuration: ${error.message}`);
        }
    }

    /**
     * Read metadata file
     * @returns {Promise<object>}
     */
    async readMetadata() {
        try {
            const response = await fetch(`${this.apiBase}/metadata`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error reading metadata:', error);
            // Return default metadata on error
            return this.createDefaultMetadata();
        }
    }

    /**
     * Write metadata file
     * @param {object} metadata
     * @returns {Promise<void>}
     */
    async writeMetadata(metadata) {
        try {
            const response = await fetch(`${this.apiBase}/metadata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Metadata saved successfully:', result.message);
        } catch (error) {
            console.error('Error writing metadata:', error);
            throw new Error(`Failed to write metadata: ${error.message}`);
        }
    }

    /**
     * Export MCP configuration with timestamp
     * @returns {Promise<string>} - Filename of exported config
     */
    async exportMcpConfig() {
        try {
            const response = await fetch(`${this.apiBase}/export`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`MCP config exported as ${result.filename} to ${result.path}`);
            return result.filename;
        } catch (error) {
            console.error('Error exporting MCP config:', error);
            throw new Error(`Failed to export MCP configuration: ${error.message}`);
        }
    }

    /**
     * Validate MCP configuration structure
     * @param {object} config
     * @throws {Error} if validation fails
     */
    validateMcpConfig(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Configuration must be an object');
        }

        if (!config.mcpServers || typeof config.mcpServers !== 'object') {
            throw new Error('Configuration must have "mcpServers" object');
        }

        // Validate each server
        for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
            if (!serverConfig.command || typeof serverConfig.command !== 'string') {
                throw new Error(`Server "${name}" must have a "command" string`);
            }

            if (!Array.isArray(serverConfig.args)) {
                throw new Error(`Server "${name}" must have "args" array`);
            }

            if (serverConfig.env && typeof serverConfig.env !== 'object') {
                throw new Error(`Server "${name}" env must be an object`);
            }

            if (serverConfig.cwd && typeof serverConfig.cwd !== 'string') {
                throw new Error(`Server "${name}" cwd must be a string`);
            }

            if (serverConfig.disabled !== undefined && typeof serverConfig.disabled !== 'boolean') {
                throw new Error(`Server "${name}" disabled must be a boolean`);
            }
        }
    }

    /**
     * Create default metadata structure
     * @returns {object}
     */
    createDefaultMetadata() {
        return {
            application: {
                theme: 'light',
                lastRefresh: new Date().toISOString(),
                contextUtilization: 0,
                activeProfile: null
            },
            servers: {},
            tools: {},
            profiles: {}
        };
    }



    /**
     * Load sample data for development/demo
     * @returns {Promise<void>}
     */
    async loadSampleData() {
        try {
            const response = await fetch(`${this.apiBase}/load-sample`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Sample data loaded successfully:', result.message);
        } catch (error) {
            console.error('Error loading sample data:', error);
            throw new Error(`Failed to load sample data: ${error.message}`);
        }
    }

    /**
     * Check if sample data exists
     * @returns {Promise<boolean>}
     */
    async hasSampleData() {
        try {
            const response = await fetch(`${this.apiBase}/check-files`);
            if (!response.ok) {
                return false;
            }
            const result = await response.json();
            return result.mcpConfigExists;
        } catch (error) {
            console.error('Error checking for sample data:', error);
            return false;
        }
    }
}
