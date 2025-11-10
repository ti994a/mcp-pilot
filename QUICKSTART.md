# 🚀 MCPilot Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Start the Server
```bash
npm start
```

You should see:
```
MCPilot server running on http://localhost:3000
MCP config path: /home/username/.aws/amazonq/mcp.json
Metadata path: /home/username/.aws/amazonq/mcp-metadata.json
Export directory: /home/username/.aws/amazonq/exports
```

### 3️⃣ Open in Browser
```
http://localhost:3000
```

## 🎯 First Time Setup

On first launch, MCPilot will automatically load sample data with:
- 3 MCP servers (filesystem, git, database)
- 9 tools across all servers
- 2 pre-configured profiles

## 🎮 Quick Actions

### Toggle a Server
Click the "Toggle" button next to any server to enable/disable it.

### View Server Details
Click on a server name or the ▶ icon to expand and see:
- Command and arguments
- Description
- Available tools

### Save a Configuration Profile
1. Configure servers as desired
2. Click "Save" in the Profile Bar
3. Enter a name and description
4. Click "Save Profile"

### Switch Themes
Click the 🌙/☀️ icon in the header to toggle between light and dark mode.

### Export Configuration
Click "MCP Export" to save your current configuration with a timestamp.

## ⌨️ Keyboard Shortcuts

Press `?` to see all shortcuts, or use these common ones:

- `Ctrl/Cmd + R` - Refresh dashboard
- `Ctrl/Cmd + E` - Export configuration
- `Ctrl/Cmd + T` - Toggle theme
- `Ctrl/Cmd + S` - Save profile
- `↑/↓` - Navigate servers
- `Space` - Toggle selected server

## 📁 File Locations

MCPilot stores data in:
```
~/.aws/amazonq/
├── mcp.json              # MCP server configuration
├── mcp-metadata.json     # Application metadata
└── exports/              # Exported configurations
    └── mcp-YYYY-MM-DD-HH-MM-SS.json
```

## 🧪 Test the Installation

Run the test scripts:
```bash
./test-api.sh        # Test API endpoints
./test-workflow.sh   # Test complete workflow
```

## 🔧 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process
pkill -f "node server.js"

# Start again
npm start
```

### Can't access in browser
- Make sure server is running: `ps aux | grep "node server.js"`
- Check firewall settings
- Try: `curl http://localhost:3000`

### Files not saving
- Check directory permissions: `ls -la ~/.aws/amazonq/`
- Check server logs for errors
- Verify disk space: `df -h`

## 📚 Learn More

- **README.md** - Full documentation
- **TEST_RESULTS.md** - Detailed test results
- **TESTING_COMPLETE.md** - Complete testing summary

## 🎨 Features

- ✅ Real-time server management
- ✅ Hierarchical server/tool display
- ✅ Configuration profiles
- ✅ Light/dark themes
- ✅ Keyboard shortcuts
- ✅ Export/backup functionality
- ✅ Responsive design

## 💡 Tips

1. **Use profiles** for different environments (dev, prod, minimal)
2. **Export regularly** to backup your configuration
3. **Use keyboard shortcuts** for faster navigation
4. **Expand servers** to see available tools and descriptions

## 🆘 Need Help?

Check the full documentation in README.md or run:
```bash
./test-api.sh  # Verify everything is working
```

---

**Happy MCP Server Managing! 🎉**
