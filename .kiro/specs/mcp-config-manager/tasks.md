# Implementation Plan

- [x] 1. Set up project structure and core HTML/CSS foundation
  - Create index.html with semantic HTML structure for dashboard layout
  - Create styles/main.css with CSS Grid layout for statistics, action bar, profile bar, and server list
  - Create styles/themes.css with CSS custom properties for light and dark themes
  - Create styles/animations.css with smooth transitions for toggles, expand/collapse, and theme switching
  - _Requirements: 1, 8_

- [x] 2. Implement data models and file management
  - [x] 2.1 Create Server and Tool data model classes
    - Write Server class with properties (name, command, args, env, cwd, disabled, description, tools)
    - Write Tool class with properties (name, description, serverName)
    - Add methods for isEnabled() and toggle() to Server class
    - _Requirements: 1, 2_

  - [x] 2.2 Create FileManager class for file I/O operations
    - Implement readMcpConfig() to read and parse ~/.aws/amazonq/mcp.json
    - Implement writeMcpConfig() to write mcp.json with proper formatting
    - Implement readMetadata() to read metadata file
    - Implement writeMetadata() to save metadata file
    - Implement exportMcpConfig() to create timestamped export file
    - Implement validateMcpConfig() to validate JSON structure
    - Add error handling for file not found, invalid JSON, and write failures
    - _Requirements: 5, 7_

- [x] 3. Implement application state management
  - [x] 3.1 Create AppState class to manage application data
    - Initialize state with servers Map, metadata, theme, contextUtilization, profiles Map, activeProfile
    - Implement getStatistics() to calculate enabled/disabled servers and total tools count
    - Implement getCurrentConfiguration() to capture current enabled/disabled state
    - Implement applyProfile() to apply profile configuration to servers
    - _Requirements: 1, 4, 9_

  - [x] 3.2 Create StateManager class to coordinate state updates
    - Implement loadFromFiles() to parse mcp.json and metadata into state
    - Implement toggleServer() to toggle server disabled state
    - Implement updateMetadata() to update metadata in state
    - Implement subscribe() for state change listeners
    - Implement getServersAlphabetically() to return sorted server list
    - _Requirements: 1, 2, 3_

- [x] 4. Implement statistics bar UI component
  - Create renderStatistics() function to display server counts and Q context utilization
  - Implement real-time statistics updates when servers are toggled
  - Add smooth animations for statistic value changes
  - Style statistics bar with appropriate spacing and visual hierarchy
  - _Requirements: 4_

- [x] 5. Implement action bar UI component
  - Create action bar HTML structure with Refresh, Refresh Descriptions, MCP Export, Apply Configuration, and Clear Q Context buttons
  - Implement handleRefresh() to reload files and update UI
  - Implement handleRefreshDescriptions() to query servers for tool descriptions
  - Implement handleExport() to export mcp.json with timestamp
  - Implement handleApplyConfiguration() to trigger Q reload
  - Implement handleClearContext() to clear Q context
  - Add loading indicators for async operations
  - Add success/error notifications for each action
  - _Requirements: 5, 6_

- [x] 6. Implement profile management UI and functionality
  - [x] 6.1 Create profile bar HTML structure
    - Add profile dropdown with "None" default option
    - Add Save and Delete buttons
    - Style profile bar to match design
    - _Requirements: 9_

  - [x] 6.2 Implement profile save functionality
    - Create showProfileSaveDialog() to prompt for profile name and description
    - Implement handleProfileSave() to capture current configuration and save to metadata
    - Update profile dropdown with new profile
    - Show success notification
    - _Requirements: 9_

  - [x] 6.3 Implement profile selection functionality
    - Implement handleProfileSelect() to apply selected profile configuration
    - Update mcp.json with new disabled states
    - Update UI to reflect changes
    - Set active profile in metadata
    - Show success notification
    - _Requirements: 9_

  - [x] 6.4 Implement profile deletion functionality
    - Create showProfileDeleteConfirmation() dialog
    - Implement handleProfileDelete() to remove profile from metadata
    - Update profile dropdown
    - Clear active profile if deleted profile was active
    - Show success notification
    - _Requirements: 9_

- [x] 7. Implement hierarchical server list with expand/collapse
  - [x] 7.1 Create server list container and rendering logic
    - Implement renderServerList() to render all servers alphabetically
    - Create renderServer() to render individual server with expand/collapse control
    - Add status indicator (green/red circle) based on enabled/disabled state
    - Add toggle button for enabling/disabling server
    - Display server name prominently
    - _Requirements: 1, 2_

  - [x] 7.2 Implement server expand/collapse functionality
    - Add expand/collapse icon (▶/▼) to each server
    - Implement toggleServerExpanded() to show/hide server details
    - When expanded, display command and args on one line
    - When expanded, display server description
    - When expanded, display Tools node
    - Persist expanded/collapsed state in metadata
    - Add smooth animations for expand/collapse transitions
    - Default state: collapsed
    - _Requirements: 1, 3_

  - [x] 7.3 Implement Tools node with expand/collapse
    - Create renderToolsNode() to display "Tools (count)" with expand/collapse control
    - Implement toggleToolsExpanded() to show/hide tool list
    - When expanded, render individual tools alphabetically
    - Persist Tools node expanded/collapsed state in metadata
    - Add smooth animations for expand/collapse transitions
    - Default state: collapsed
    - _Requirements: 1, 3_

  - [x] 7.4 Implement tool rendering
    - Create renderTool() to display tool name and description
    - Apply parent server styling (greyed out if server disabled)
    - Order tools alphabetically under parent server
    - _Requirements: 1_

- [x] 8. Implement server enable/disable functionality
  - Implement handleServerToggle() to toggle server disabled state
  - Update mcp.json file with new disabled value
  - Update UI with immediate visual feedback
  - Grey out server and tools when disabled
  - Restore colors when enabled
  - Update statistics in real-time
  - Show success notification
  - _Requirements: 2, 4_

- [x] 9. Implement theme switching functionality
  - Create theme toggle switch in header
  - Implement toggleTheme() to switch between light and dark modes
  - Update CSS custom properties for theme colors
  - Persist theme preference in metadata
  - Apply theme immediately to all UI elements
  - Add smooth transition animation for theme switch
  - _Requirements: 8_

- [x] 10. Implement keyboard shortcuts
  - [x] 10.1 Set up keyboard event listeners
    - Add global keydown event listener
    - Prevent shortcuts when user is in text input
    - _Requirements: 10_

  - [x] 10.2 Implement navigation shortcuts
    - Ctrl/Cmd + R: Refresh dashboard
    - Ctrl/Cmd + E: Export configuration
    - Ctrl/Cmd + T: Toggle theme
    - Ctrl/Cmd + A: Apply configuration
    - Ctrl/Cmd + L: Clear Q context
    - Ctrl/Cmd + S: Save profile
    - Ctrl/Cmd + D: Delete profile
    - ↑/↓: Navigate servers
    - →: Expand server/tools
    - ←: Collapse server/tools
    - Space: Toggle selected server
    - ?: Show keyboard shortcuts help
    - _Requirements: 10_

  - [x] 10.3 Create keyboard shortcuts help modal
    - Create modal dialog showing all keyboard shortcuts
    - Display shortcut key combinations and their actions
    - Add close button and ESC key to dismiss
    - _Requirements: 10_

- [x] 11. Implement Q integration module
  - Create QIntegration class
  - Implement applyConfiguration() to trigger Q reload
  - Implement clearContext() to clear Q context window
  - Implement getContextUtilization() to query Q for context usage percentage
  - Implement queryServerTools() to execute MCP server and retrieve tool list
  - Add error handling for Q connection failures and timeouts
  - _Requirements: 6_

- [x] 12. Implement error handling and notifications
  - Create ErrorHandler class to categorize and handle errors
  - Implement showNotification() for toast notifications (success, error, info)
  - Add auto-dismiss timeout for notifications
  - Implement showLoading() and hideLoading() for async operations
  - Handle file system errors (not found, permission denied, invalid JSON)
  - Handle validation errors (missing fields, invalid types)
  - Handle integration errors (Q connection failures, timeouts)
  - Display user-friendly error messages
  - _Requirements: 7, 8_

- [x] 13. Implement main application controller
  - Create MCPilotApp class to coordinate all components
  - Implement initialize() to load files, initialize state, and render UI
  - Wire up all event handlers for buttons and user interactions
  - Connect StateManager to UIManager for reactive updates
  - Add application lifecycle management (startup, shutdown)
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_

- [x] 14. Implement empty state and edge cases
  - Display empty state message when no servers are configured
  - Handle missing mcp.json file gracefully
  - Handle missing metadata file by creating default
  - Handle servers with no tools
  - Handle servers with missing descriptions
  - Handle invalid server configurations
  - _Requirements: 1, 7_

- [x] 15. Add visual polish and animations
  - Implement smooth transitions for all state changes
  - Add hover effects for interactive elements
  - Add focus styles for keyboard navigation
  - Ensure consistent spacing and alignment
  - Test animations in both light and dark themes
  - Optimize animation performance
  - _Requirements: 1, 2, 8_

- [x] 16. Testing and validation
  - Test loading dashboard with valid mcp.json
  - Test loading dashboard with missing mcp.json
  - Test loading dashboard with invalid JSON
  - Test toggling servers enabled/disabled
  - Test expand/collapse for servers and tools
  - Test profile save, select, and delete operations
  - Test refresh and export functionality
  - Test Q integration (apply configuration, clear context)
  - Test theme switching
  - Test all keyboard shortcuts
  - Test error handling for various failure scenarios
  - Test with empty server list
  - Test with many servers (performance)
  - Test statistics update in real-time
  - Verify mcp.json updates correctly
  - Verify metadata persistence
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_
