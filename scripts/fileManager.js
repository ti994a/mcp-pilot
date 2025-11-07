/**
 * FileManager - Handles all file I/O operations
 * Note: This implementation uses the File System Access API for web browsers.
 * For Electron or Node.js environments, this would need to be adapted.
 */

export class FileManager {
    constructor() {
        // Default file paths (can be overridden)
        this.mcpConfigPath = '~/.aws/amazonq/mcp.json';
        this.metadataPath = '~/.aws/amazonq/mcp-metadata.json';
        this.exportDir = '~/.aws/amazonq/exports';
        
        // File handles for File System Access API
        this.mcpConfigHandle = null;
        this.metadataHandle = null;
    }

    /**
     * Read MCP configuration file
     * @returns {Promise<object>}
     */
    async readMcpConfig() {
        try {
            // For demo/development, try localStorage first
            const stored = localStorage.getItem('mcp-config');
            if (stored) {
                const config = JSON.parse(stored);
                this.validateMcpConfig(config);
                return config;
            }

            // If no stored config, return empty structure
            return { mcpServers: {} };
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

            // Format JSON with proper indentation
            const jsonString = JSON.stringify(config, null, 2);

            // For demo/development, use localStorage
            localStorage.setItem('mcp-config', jsonString);

            console.log('MCP config saved successfully');
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
            // For demo/development, try localStorage first
            const stored = localStorage.getItem('mcp-metadata');
            if (stored) {
                return JSON.parse(stored);
            }

            // Return default metadata structure
            return this.createDefaultMetadata();
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
            // Format JSON with proper indentation
            const jsonString = JSON.stringify(metadata, null, 2);

            // For demo/development, use localStorage
            localStorage.setItem('mcp-metadata', jsonString);

            console.log('Metadata saved successfully');
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
            const config = await this.readMcpConfig();
            
            // Generate timestamp filename
            const now = new Date();
            const timestamp = now.toISOString()
                .replace(/:/g, '-')
                .replace(/\..+/, '')
                .replace('T', '-');
            const filename = `mcp-${timestamp}.json`;

            // Format JSON
            const jsonString = JSON.stringify(config, null, 2);

            // For demo/development, trigger download
            this.downloadFile(jsonString, filename, 'application/json');

            console.log(`MCP config exported as ${filename}`);
            return filename;
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
     * Trigger file download in browser
     * @param {string} content
     * @param {string} filename
     * @param {string} mimeType
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Load sample data for development/demo
     * @returns {Promise<void>}
     */
    async loadSampleData() {
        const sampleConfig = {
            mcpServers: {
                filesystem: {
                    command: 'npx',
                    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
                    env: {},
                    disabled: false
                },
                git: {
                    command: 'uvx',
                    args: ['mcp-server-git', '--repository', '/path/to/repo'],
                    disabled: true
                },
                database: {
                    command: 'npx',
                    args: ['database-mcp-server'],
                    disabled: false
                }
            }
        };

        const sampleMetadata = {
            application: {
                theme: 'light',
                lastRefresh: new Date().toISOString(),
                contextUtilization: 45,
                activeProfile: null
            },
            servers: {
                filesystem: {
                    description: 'File system access server for reading and writing files',
                    expanded: false,
                    toolsExpanded: false,
                    lastQueried: new Date().toISOString()
                },
                git: {
                    description: 'Git repository operations including log, diff, and status',
                    expanded: false,
                    toolsExpanded: false,
                    lastQueried: new Date().toISOString()
                },
                database: {
                    description: 'Database query server for SQL operations',
                    expanded: false,
                    toolsExpanded: false,
                    lastQueried: new Date().toISOString()
                }
            },
            tools: {
                filesystem: {
                    read_file: { description: 'Read file contents from the filesystem' },
                    write_file: { description: 'Write content to a file' },
                    list_directory: { description: 'List contents of a directory' }
                },
                git: {
                    git_log: { description: 'View commit history' },
                    git_diff: { description: 'Show file differences' },
                    git_status: { description: 'Show working tree status' }
                },
                database: {
                    query: { description: 'Execute SQL query' },
                    schema: { description: 'Get table schema information' },
                    list_tables: { description: 'List all database tables' }
                }
            },
            profiles: {
                development: {
                    description: 'Development environment with all tools',
                    enabledServers: ['filesystem', 'git', 'database'],
                    disabledServers: [],
                    createdAt: new Date().toISOString(),
                    lastUsed: null
                },
                minimal: {
                    description: 'Minimal configuration for performance',
                    enabledServers: ['filesystem'],
                    disabledServers: ['git', 'database'],
                    createdAt: new Date().toISOString(),
                    lastUsed: null
                }
            }
        };

        await this.writeMcpConfig(sampleConfig);
        await this.writeMetadata(sampleMetadata);
        
        console.log('Sample data loaded successfully');
    }

    /**
     * Check if sample data exists
     * @returns {boolean}
     */
    hasSampleData() {
        return localStorage.getItem('mcp-config') !== null;
    }

    /**
     * Clear all stored data
     */
    clearAllData() {
        localStorage.removeItem('mcp-config');
        localStorage.removeItem('mcp-metadata');
        console.log('All data cleared');
    }
}
