# MCPilot

A modern, responsive web-based dashboard for managing Amazon Q MCP (Model Context Protocol) servers and their tools.

## Features

- 📊 **Real-time Statistics** - View enabled/disabled servers, total tools, and Q context utilization
- 🔄 **Server Management** - Enable/disable MCP servers with visual feedback
- 📁 **Hierarchical Display** - Expandable/collapsible server and tool lists
- 💾 **Configuration Profiles** - Save and quickly switch between server configurations
- 🎨 **Light/Dark Theme** - Toggle between themes with persistent preference
- ⌨️ **Keyboard Shortcuts** - Efficient navigation and actions
- 💾 **Export Configuration** - Export mcp.json with timestamped backups
- 🔄 **Refresh Descriptions** - Query servers for updated tool descriptions
- 🚀 **Q Integration** - Apply configuration and clear Q context

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- No build tools required - runs directly in the browser

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser

### First Run

On first run, MCPilot will automatically load sample data to demonstrate functionality. The sample includes:
- 3 MCP servers (filesystem, git, database)
- Sample tools for each server
- 2 pre-configured profiles (development, minimal)

## Usage

### Managing Servers

- **Toggle Server**: Click the "Toggle" button next to any server to enable/disable it
- **Expand Server**: Click the server header or expand icon (▶) to view details
- **View Tools**: Expand a server, then click the "Tools" node to see available tools

### Configuration Profiles

1. **Save Profile**: 
   - Configure servers as desired
   - Click "Save" in the Profile Bar
   - Enter name and description
   - Click "Save Profile"

2. **Load Profile**:
   - Select profile from dropdown
   - Configuration applies automatically

3. **Delete Profile**:
   - Select profile from dropdown
   - Click "Delete" button
   - Confirm deletion

### Actions

- **Refresh**: Reload configuration from files
- **Refresh Descriptions**: Query servers for updated tool descriptions
- **MCP Export**: Export current configuration with timestamp
- **Apply Configuration**: Apply changes to Amazon Q
- **Clear Q Context**: Clear Amazon Q context window

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + R` | Refresh dashboard |
| `Ctrl/Cmd + E` | Export configuration |
| `Ctrl/Cmd + T` | Toggle theme |
| `Ctrl/Cmd + A` | Apply configuration |
| `Ctrl/Cmd + L` | Clear Q context |
| `Ctrl/Cmd + S` | Save profile |
| `Ctrl/Cmd + D` | Delete profile |
| `↑/↓` | Navigate servers |
| `→` | Expand server/tools |
| `←` | Collapse server/tools |
| `Space` | Toggle selected server |
| `?` | Show keyboard shortcuts |

## File Structure

```
mcpilot/
├── index.html              # Main HTML structure
├── styles/
│   ├── main.css           # Core styles and layout
│   ├── themes.css         # Light/dark theme definitions
│   └── animations.css     # Smooth transitions and animations
├── scripts/
│   ├── app.js             # Main application controller
│   ├── models.js          # Data models (Server, Tool, Profile, AppState)
│   ├── fileManager.js     # File I/O operations
│   ├── stateManager.js    # Application state management
│   └── uiManager.js       # UI rendering and updates
└── README.md              # This file
```

## Data Storage

MCPilot uses browser localStorage for demo/development purposes. In production, it would read/write:

- **MCP Config**: `~/.aws/amazonq/mcp.json`
- **Metadata**: `~/.aws/amazonq/mcp-metadata.json`

### MCP Config Format

```json
{
  "mcpServers": {
    "server-name": {
      "command": "string",
      "args": ["string"],
      "env": { "KEY": "value" },
      "cwd": "string",
      "disabled": boolean
    }
  }
}
```

### Metadata Format

```json
{
  "application": {
    "theme": "light|dark",
    "contextUtilization": number,
    "activeProfile": "string|null"
  },
  "servers": {
    "server-name": {
      "description": "string",
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
  "profiles": {
    "profile-name": {
      "description": "string",
      "enabledServers": ["string"],
      "disabledServers": ["string"]
    }
  }
}
```

## Development

### Architecture

MCPilot follows a clean separation of concerns:

- **Models** - Data structures (Server, Tool, Profile, AppState)
- **FileManager** - File I/O operations with validation
- **StateManager** - State management with event notifications
- **UIManager** - DOM manipulation and rendering
- **App** - Main controller coordinating all components

### Adding Features

1. Update data models in `models.js` if needed
2. Add state management logic in `stateManager.js`
3. Implement UI rendering in `uiManager.js`
4. Wire up event handlers in `app.js`

### Adapting for Production

To use with actual file system:

1. Replace localStorage calls in `fileManager.js` with:
   - Node.js `fs` module (for Electron)
   - File System Access API (for web)
   - Native file system calls (for desktop apps)

2. Implement actual Q integration in `app.js`:
   - Replace simulated delays with real API calls
   - Add error handling for Q connection failures
   - Implement actual server querying for tool descriptions

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

This project is part of the Amazon Q MCP ecosystem.

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style
- All features are tested
- Documentation is updated

## Support

For issues or questions, please refer to the Amazon Q MCP documentation.
