# MCPilot Design Document

## Overview

MCPilot is a single-page web application built with vanilla JavaScript, HTML, and CSS that provides a modern dashboard interface for managing Amazon Q MCP server configurations. The application follows a client-side architecture with direct file system access for reading and writing configuration files.

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **File I/O**: Node.js fs module (for Electron) or File System Access API (for web browsers)
- **Data Format**: JSON for both mcp.json and metadata storage
- **UI Framework**: Custom CSS with CSS Grid and Flexbox for layout
- **Theme System**: CSS custom properties (variables) for light/dark mode

### Key Design Principles

1. **Simplicity**: Single-page application with no external dependencies
2. **Responsiveness**: Immediate visual feedback for all user actions
3. **Safety**: Read-only approach to server list (no add/delete operations)
4. **Separation of Concerns**: Configuration (mcp.json) separate from metadata
5. **Progressive Enhancement**: Works in modern browsers with graceful degradation

## Architecture

### Application Structure

```
mcpilot/
├── index.html           # Main HTML structure
├── styles/
│   ├── main.css        # Core styles and layout
│   ├── themes.css      # Light/dark theme definitions
│   └── animations.css  # Smooth transitions and animations
├── scripts/
│   ├── app.js          # Main application controller
│   ├── fileManager.js  # File I/O operations
│   ├── uiManager.js    # UI rendering and updates
│   ├── stateManager.js # Application state management
│   └── qIntegration.js # Amazon Q integration
└── assets/
    └── icons/          # SVG icons for UI elements
```

### Component Architecture

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│  (app.js - Main Controller)             │
└─────────────────────────────────────────┘
           │         │         │
           ▼         ▼         ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ State        │ │ UI       │ │ File         │
│ Manager      │ │ Manager  │ │ Manager      │
└──────────────┘ └──────────┘ └──────────────┘
           │         │         │
           └─────────┴─────────┘
                     │
                     ▼
           ┌──────────────────┐
           │  Data Models     │
           │  - Server        │
           │  - Tool          │
           │  - Metadata      │
           └──────────────────┘
```

## Data Models

### MCP Configuration File (mcp.json)

Located at: `~/.aws/amazonq/mcp.json`

```json
{
  "mcpServers": {
    "server-name": {
      "command": "string",
      "args": ["string"],
      "env": {
        "KEY": "value"
      },
      "cwd": "string",
      "disabled": boolean
    }
  }
}
```

### Metadata File (mcp-metadata.json)

Located at: `~/.aws/amazonq/mcp-metadata.json`

```json
{
  "application": {
    "theme": "light|dark",
    "lastRefresh": "ISO8601 timestamp",
    "contextUtilization": number,
    "activeProfile": "string|null"
  },
  "servers": {
    "server-name": {
      "description": "string",
      "lastQueried": "ISO8601 timestamp",
      "expanded": boolean,
      "toolsExpanded": boolean
    }
  },
  "tools": {
    "server-name": {
      "tool-name": {
        "description": "string"
      }
    }
  },
  "templates": {
    "template-name": {
      "description": "string",
      "enabledServers": ["server-name"],
      "disabledServers": ["server-name"],
      "createdAt": "ISO8601 timestamp",
      "lastUsed": "ISO8601 timestamp"
    }
  }
}
```

### Internal Data Structures

```javascript
// Server Model
class Server {
  constructor(name, config, metadata) {
    this.name = name;
    this.command = config.command;
    this.args = config.args;
    this.env = config.env || {};
    this.cwd = config.cwd || null;
    this.disabled = config.disabled || false;
    this.description = metadata?.description || '';
    this.tools = [];
  }
  
  isEnabled() {
    return !this.disabled;
  }
  
  toggle() {
    this.disabled = !this.disabled;
  }
}

// Tool Model
class Tool {
  constructor(name, description, serverName) {
    this.name = name;
    this.description = description;
    this.serverName = serverName;
  }
  
  isEnabled() {
    // Tool is enabled if parent server is enabled
    return !this.getParentServer().disabled;
  }
}

// Application State
class AppState {
  constructor() {
    this.servers = new Map();
    this.metadata = null;
    this.theme = 'light';
    this.contextUtilization = 0;
    this.templates = new Map();
    this.activeProfile = null;
  }
  
  getStatistics() {
    const total = this.servers.size;
    const enabled = Array.from(this.servers.values())
      .filter(s => s.isEnabled()).length;
    const disabled = total - enabled;
    const totalTools = Array.from(this.servers.values())
      .reduce((sum, s) => sum + s.tools.length, 0);
    
    return { total, enabled, disabled, totalTools };
  }
  
  getCurrentConfiguration() {
    // Return current enabled/disabled state of all servers
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
  
  applyProfile(template) {
    // Apply template configuration to servers
    template.enabledServers.forEach(name => {
      const server = this.servers.get(name);
      if (server) server.disabled = false;
    });
    template.disabledServers.forEach(name => {
      const server = this.servers.get(name);
      if (server) server.disabled = true;
    });
    this.activeProfile = template.name;
  }
}
```

## Components and Interfaces

### 1. File Manager

Handles all file system operations with error handling and validation.

```javascript
class FileManager {
  constructor() {
    this.mcpConfigPath = '~/.aws/amazonq/mcp.json';
    this.metadataPath = '~/.aws/amazonq/mcp-metadata.json';
  }
  
  async readMcpConfig() {
    // Read and parse mcp.json
    // Validate JSON structure
    // Return parsed object or throw error
  }
  
  async writeMcpConfig(config) {
    // Validate config structure
    // Format JSON with indentation
    // Write to file
    // Handle errors
  }
  
  async readMetadata() {
    // Read metadata file
    // Return parsed object or create default
  }
  
  async writeMetadata(metadata) {
    // Write metadata to file
  }
  
  async exportMcpConfig() {
    // Generate timestamp filename
    // Copy current mcp.json to timestamped file
    // Return success/failure
  }
  
  validateMcpConfig(config) {
    // Validate required fields
    // Check structure
    // Return validation result
  }
}
```

### 2. State Manager

Manages application state and provides state update notifications.

```javascript
class StateManager {
  constructor() {
    this.state = new AppState();
    this.listeners = [];
  }
  
  loadFromFiles(mcpConfig, metadata) {
    // Parse mcp.json into Server objects
    // Load metadata
    // Populate state.servers Map
    // Notify listeners
  }
  
  toggleServer(serverName) {
    // Toggle server disabled state
    // Notify listeners
    // Return updated server
  }
  
  updateMetadata(metadata) {
    // Update metadata in state
    // Notify listeners
  }
  
  subscribe(listener) {
    // Add state change listener
  }
  
  getServersAlphabetically() {
    // Return sorted array of servers
  }
}
```

### 3. UI Manager

Handles all DOM manipulation and rendering.

```javascript
class UIManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.elements = {
      serverList: null,
      statsBar: null,
      themeToggle: null,
      templateDropdown: null,
      // ... other DOM elements
    };
  }
  
  initialize() {
    // Cache DOM elements
    // Attach event listeners
    // Set up keyboard shortcuts
  }
  
  renderDashboard() {
    // Render statistics bar
    // Render server list
    // Apply current theme
  }
  
  renderStatistics(stats) {
    // Update stats display
    // Animate changes
  }
  
  renderServerList(servers) {
    // Clear existing list
    // Render each server hierarchically
    // Render tools under each server
    // Apply enabled/disabled styling
  }
  
  renderServer(server) {
    // Create server DOM element with expand/collapse control
    // Add toggle button
    // Add status indicator
    // Display command and args on one line (when expanded)
    // Display description (when expanded)
    // Render Tools node with expand/collapse control
    // Default state: collapsed
  }
  
  renderToolsNode(server) {
    // Create Tools node with expand/collapse control
    // Show tool count
    // Render individual tools when expanded
    // Default state: collapsed
  }
  
  renderTool(tool) {
    // Create tool DOM element
    // Apply parent server state styling
  }
  
  toggleServerExpanded(serverName) {
    // Toggle server expanded/collapsed state
    // Animate transition
    // Save state to metadata
  }
  
  toggleToolsExpanded(serverName) {
    // Toggle tools node expanded/collapsed state
    // Animate transition
    // Save state to metadata
  }
  
  showNotification(message, type) {
    // Display toast notification
    // Auto-dismiss after timeout
  }
  
  showLoading(message) {
    // Display loading indicator
  }
  
  hideLoading() {
    // Hide loading indicator
  }
  
  toggleTheme() {
    // Switch between light/dark theme
    // Update CSS custom properties
    // Save preference to metadata
  }
  
  renderProfileDropdown(templates, activeProfile) {
    // Populate dropdown with templates
    // Highlight active template
    // Add "None" option
  }
  
  showProfileSaveDialog() {
    // Show modal dialog for template name and description
    // Validate input
    // Return template details or null if cancelled
  }
  
  showProfileDeleteConfirmation(templateName) {
    // Show confirmation dialog
    // Return true if confirmed, false otherwise
  }
}
```

### 4. Q Integration Module

Handles communication with Amazon Q.

```javascript
class QIntegration {
  async applyConfiguration() {
    // Trigger Q to reload MCP servers
    // This may use Q CLI or API
    // Return success/failure
  }
  
  async clearContext() {
    // Clear Q context window
    // Return success/failure
  }
  
  async getContextUtilization() {
    // Query Q for context window usage
    // Return percentage
  }
  
  async queryServerTools(serverName, command, args) {
    // Execute MCP server to get tool list
    // Parse tool descriptions
    // Return tools array
  }
}
```

### 5. Main Application Controller

Coordinates all components and handles user actions.

```javascript
class MCPilotApp {
  constructor() {
    this.fileManager = new FileManager();
    this.stateManager = new StateManager();
    this.uiManager = new UIManager(this.stateManager);
    this.qIntegration = new QIntegration();
  }
  
  async initialize() {
    // Load configuration files
    // Initialize state
    // Render UI
    // Set up event handlers
  }
  
  async handleServerToggle(serverName) {
    // Toggle server in state
    // Update mcp.json file
    // Update UI
    // Show notification
  }
  
  async handleRefresh() {
    // Reload files
    // Update state
    // Re-render UI
  }
  
  async handleRefreshDescriptions() {
    // Query each server for tools
    // Update metadata
    // Save metadata file
    // Update UI
  }
  
  async handleExport() {
    // Export mcp.json with timestamp
    // Show success notification
  }
  
  async handleApplyConfiguration() {
    // Call Q integration
    // Show loading
    // Show result notification
  }
  
  async handleClearContext() {
    // Call Q integration
    // Update context utilization
    // Show notification
  }
  
  async handleProfileSelect(templateName) {
    // Load template configuration
    // Apply enabled/disabled states to servers
    // Update mcp.json
    // Update UI
    // Set active template in metadata
  }
  
  async handleProfileSave(templateName, description) {
    // Capture current server enabled/disabled states
    // Save as new template in metadata
    // Update template dropdown
    // Show success notification
  }
  
  async handleProfileDelete(templateName) {
    // Confirm deletion
    // Remove template from metadata
    // Update template dropdown
    // Show success notification
  }
}
```

## User Interface Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ MCPilot                    [Theme] [Shortcuts]  │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Statistics Bar                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Servers: 5 enabled, 2 disabled                  │   │
│  │ Tools: 23 total                                 │   │
│  │ Q Context: 45% utilized                         │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Action Bar                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Refresh] [Refresh Descriptions] [MCP Export]   │   │
│  │ [Apply Configuration] [Clear Q Context]         │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Profile Bar                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Profile: [Dropdown ▼] [Save] [Delete]          │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Server List (Scrollable)                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ▶ ● filesystem [Toggle]                         │   │
│  │                                                  │   │
│  │ ▼ ○ git [Toggle]                                │   │
│  │   uvx mcp-server-git --repository /path/to/repo │   │
│  │   Description: Git repository operations        │   │
│  │   ▶ Tools (2)                                   │   │
│  │                                                  │   │
│  │ ▼ ● database [Toggle]                           │   │
│  │   npx database-mcp-server                       │   │
│  │   Description: Database query server            │   │
│  │   ▼ Tools (3)                                   │   │
│  │     ├─ query - Execute SQL query                │   │
│  │     ├─ schema - Get table schema                │   │
│  │     └─ list_tables - List all tables            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Visual Design Elements

#### Status Indicators
- **Enabled**: Green circle (●)
- **Disabled**: Red circle (○) with greyed-out text

#### Color Scheme

**Light Mode:**
- Background: #ffffff
- Text: #1a1a1a
- Accent: #0066cc
- Success: #28a745
- Error: #dc3545
- Border: #e0e0e0

**Dark Mode:**
- Background: #1a1a1a
- Text: #e0e0e0
- Accent: #4da6ff
- Success: #3ddc84
- Error: #ff6b6b
- Border: #333333

#### Typography
- **Headers**: System font stack, 24px, bold
- **Body**: System font stack, 14px, regular
- **Monospace**: 'Monaco', 'Courier New', monospace for server names

#### Animations
- Toggle transitions: 200ms ease-in-out
- Theme switch: 300ms ease
- List item hover: 150ms ease
- Notification slide-in: 250ms ease-out

## Error Handling

### Error Categories

1. **File System Errors**
   - File not found
   - Permission denied
   - Invalid JSON
   - Write failures

2. **Validation Errors**
   - Missing required fields
   - Invalid data types
   - Malformed structure

3. **Integration Errors**
   - Q connection failures
   - Server query timeouts
   - Command execution errors

### Error Handling Strategy

```javascript
class ErrorHandler {
  static handle(error, context) {
    // Log error
    console.error(`Error in ${context}:`, error);
    
    // Determine error type
    const errorType = this.categorizeError(error);
    
    // Show user-friendly message
    const message = this.getUserMessage(errorType, error);
    uiManager.showNotification(message, 'error');
    
    // Prevent further operations if critical
    if (this.isCritical(errorType)) {
      this.disableOperations();
    }
  }
  
  static categorizeError(error) {
    // Categorize error based on type/message
  }
  
  static getUserMessage(errorType, error) {
    // Return user-friendly error message
  }
  
  static isCritical(errorType) {
    // Determine if error prevents further operations
  }
}
```

## Testing Strategy

### Unit Testing
- Test each class in isolation
- Mock file system operations
- Test state management logic
- Validate data transformations

### Integration Testing
- Test file read/write operations
- Test UI rendering with real data
- Test state updates trigger UI changes
- Test error handling flows

### Manual Testing Checklist
- [ ] Load dashboard with valid mcp.json
- [ ] Load dashboard with missing mcp.json
- [ ] Load dashboard with invalid JSON
- [ ] Toggle server enabled/disabled
- [ ] Verify mcp.json updates correctly
- [ ] Refresh dashboard
- [ ] Refresh descriptions from servers
- [ ] Export mcp.json with timestamp
- [ ] Apply configuration to Q
- [ ] Clear Q context
- [ ] Switch between light/dark themes
- [ ] Test keyboard shortcuts
- [ ] Verify statistics update in real-time
- [ ] Test with empty server list
- [ ] Test with many servers (performance)

## Performance Considerations

### Optimization Strategies

1. **Lazy Rendering**
   - Only render visible servers initially
   - Use virtual scrolling for large lists

2. **Debouncing**
   - Debounce file write operations
   - Debounce search/filter inputs

3. **Caching**
   - Cache parsed JSON in memory
   - Cache DOM element references

4. **Efficient Updates**
   - Update only changed DOM elements
   - Use document fragments for batch updates

### Performance Targets
- Initial load: < 500ms
- Toggle action: < 100ms
- Theme switch: < 200ms
- File operations: < 1s

## Security Considerations

1. **File Access**
   - Validate file paths to prevent directory traversal
   - Sanitize user input before file operations
   - Use read-only access where possible

2. **JSON Parsing**
   - Validate JSON structure before parsing
   - Sanitize data before rendering to DOM
   - Prevent XSS through proper escaping

3. **Command Execution**
   - Validate server commands before execution
   - Use safe execution methods
   - Limit execution timeouts

## Deployment

### Build Process
1. Concatenate and minify JavaScript files
2. Minify CSS files
3. Optimize SVG icons
4. Generate source maps for debugging

### Distribution Options

**Option 1: Electron App**
- Package as standalone desktop application
- Full file system access
- Cross-platform (Windows, macOS, Linux)

**Option 2: Web Application**
- Serve via local web server
- Use File System Access API
- Requires modern browser

**Option 3: Browser Extension**
- Package as browser extension
- Limited file access via extension APIs
- Works in Chrome, Firefox, Edge

## Configuration Profiles

### Profile Structure

Profiles allow users to save and quickly switch between different server configurations. Each template stores:

- **Name**: Unique identifier for the template
- **Description**: Optional description of the template's purpose
- **Enabled Servers**: List of server names that should be enabled
- **Disabled Servers**: List of server names that should be disabled
- **Timestamps**: Creation and last used dates

### Profile Operations

**Save Profile:**
1. User clicks "Save" button
2. Dialog prompts for template name and description
3. System captures current enabled/disabled state of all servers
4. Profile saved to metadata file
5. Profile appears in dropdown

**Load Profile:**
1. User selects template from dropdown
2. System applies template configuration to servers
3. mcp.json updated with new disabled states
4. UI updates to reflect changes
5. Active template highlighted in dropdown

**Delete Profile:**
1. User clicks "Delete" button (only enabled when template is selected)
2. Confirmation dialog appears
3. Profile removed from metadata
4. Dropdown updated
5. Active template cleared if deleted template was active

### Profile Use Cases

- **Development**: Enable only development-related servers
- **Production**: Enable production-safe servers only
- **Testing**: Enable test-specific servers
- **Minimal**: Enable only essential servers for performance
- **Full**: Enable all available servers

## Future Enhancements

1. **Search and Filter**
   - Search servers by name
   - Filter by enabled/disabled status
   - Filter by tool availability

2. **Profile Sharing**
   - Export templates to file
   - Import templates from file
   - Share templates with team

3. **Configuration Validation**
   - Validate server commands exist
   - Check for common misconfigurations
   - Suggest fixes

4. **Analytics**
   - Track server usage
   - Monitor context utilization over time
   - Generate usage reports
   - Track template usage patterns

5. **Advanced Profiles**
   - Profile inheritance
   - Conditional templates based on context
   - Scheduled template switching

## Appendix

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + R` | Refresh dashboard |
| `Ctrl/Cmd + E` | Export configuration |
| `Ctrl/Cmd + T` | Toggle theme |
| `Ctrl/Cmd + K` | Show keyboard shortcuts |
| `Ctrl/Cmd + A` | Apply configuration |
| `Ctrl/Cmd + L` | Clear Q context |
| `Ctrl/Cmd + S` | Save current configuration as template |
| `Ctrl/Cmd + D` | Delete active template |
| `↑/↓` | Navigate servers |
| `Space` | Toggle selected server |
| `→` | Expand server/tools |
| `←` | Collapse server/tools |
| `?` | Show help |

### File Paths

- **MCP Config**: `~/.aws/amazonq/mcp.json`
- **Metadata**: `~/.aws/amazonq/mcp-metadata.json`
- **Exports**: `~/.aws/amazonq/exports/mcp-YYYY-MM-DD-HH-MM-SS.json`
- **Backups**: `~/.aws/amazonq/backups/mcp.json.backup`

### API Endpoints (Q Integration)

These are placeholder endpoints that will need to be implemented based on Amazon Q's actual API:

- `POST /q/reload-mcp` - Reload MCP configuration
- `POST /q/clear-context` - Clear context window
- `GET /q/context-utilization` - Get context usage percentage
- `POST /q/query-server` - Query MCP server for tools
