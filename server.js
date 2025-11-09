/**
 * Simple Node.js server for MCPilot file operations
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Default file paths
const HOME_DIR = process.env.HOME || process.env.USERPROFILE;
const MCP_DIR = path.join(HOME_DIR, '.aws', 'amazonq');
const MCP_CONFIG_PATH = path.join(MCP_DIR, 'mcp.json');
const METADATA_PATH = path.join(MCP_DIR, 'mcp-metadata.json');
const EXPORT_DIR = path.join(MCP_DIR, 'exports');

// Ensure directories exist
async function ensureDirectories() {
    try {
        await fs.mkdir(MCP_DIR, { recursive: true });
        await fs.mkdir(EXPORT_DIR, { recursive: true });
        console.log('Directories ensured:', MCP_DIR);
    } catch (error) {
        console.error('Error creating directories:', error);
    }
}

// Read MCP config
app.get('/api/mcp-config', async (req, res) => {
    try {
        const data = await fs.readFile(MCP_CONFIG_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty structure
            res.json({ mcpServers: {} });
        } else {
            console.error('Error reading MCP config:', error);
            res.status(500).json({ error: error.message });
        }
    }
});

// Write MCP config
app.post('/api/mcp-config', async (req, res) => {
    try {
        const config = req.body;
        await fs.writeFile(MCP_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
        res.json({ success: true, message: 'MCP config saved' });
    } catch (error) {
        console.error('Error writing MCP config:', error);
        res.status(500).json({ error: error.message });
    }
});

// Read metadata
app.get('/api/metadata', async (req, res) => {
    try {
        const data = await fs.readFile(METADATA_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return default structure
            res.json({
                application: {
                    theme: 'light',
                    lastRefresh: new Date().toISOString(),
                    contextUtilization: 0,
                    activeProfile: null
                },
                servers: {},
                tools: {},
                profiles: {}
            });
        } else {
            console.error('Error reading metadata:', error);
            res.status(500).json({ error: error.message });
        }
    }
});

// Write metadata
app.post('/api/metadata', async (req, res) => {
    try {
        const metadata = req.body;
        await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');
        res.json({ success: true, message: 'Metadata saved' });
    } catch (error) {
        console.error('Error writing metadata:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export MCP config
app.post('/api/export', async (req, res) => {
    try {
        // Read current config
        const data = await fs.readFile(MCP_CONFIG_PATH, 'utf8');
        
        // Generate timestamp filename
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '')
            .replace('T', '-');
        const filename = `mcp-${timestamp}.json`;
        const exportPath = path.join(EXPORT_DIR, filename);
        
        // Write export file
        await fs.writeFile(exportPath, data, 'utf8');
        
        res.json({ 
            success: true, 
            filename,
            path: exportPath
        });
    } catch (error) {
        console.error('Error exporting config:', error);
        res.status(500).json({ error: error.message });
    }
});

// Load sample data
app.post('/api/load-sample', async (req, res) => {
    try {
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

        await fs.writeFile(MCP_CONFIG_PATH, JSON.stringify(sampleConfig, null, 2), 'utf8');
        await fs.writeFile(METADATA_PATH, JSON.stringify(sampleMetadata, null, 2), 'utf8');

        res.json({ success: true, message: 'Sample data loaded' });
    } catch (error) {
        console.error('Error loading sample data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check if files exist
app.get('/api/check-files', async (req, res) => {
    try {
        let mcpExists = false;
        let metadataExists = false;

        try {
            await fs.access(MCP_CONFIG_PATH);
            mcpExists = true;
        } catch {}

        try {
            await fs.access(METADATA_PATH);
            metadataExists = true;
        } catch {}

        res.json({
            mcpConfigExists: mcpExists,
            metadataExists: metadataExists,
            mcpConfigPath: MCP_CONFIG_PATH,
            metadataPath: METADATA_PATH
        });
    } catch (error) {
        console.error('Error checking files:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
async function start() {
    await ensureDirectories();
    
    app.listen(PORT, () => {
        console.log(`MCPilot server running on http://localhost:${PORT}`);
        console.log(`MCP config path: ${MCP_CONFIG_PATH}`);
        console.log(`Metadata path: ${METADATA_PATH}`);
        console.log(`Export directory: ${EXPORT_DIR}`);
    });
}

start();
