# Requirements Document

## Introduction

MCPilot is a modern, responsive web-based dashboard for managing Amazon Q MCP (Model Context Protocol) servers and their tools via a single-page browser application. The dashboard runs in mainstream browsers that support JavaScript and displays MCP servers and corresponding tools in an expandable/collapsible hierarchical list ordered alphabetically. Users can view and enable/disable servers (but cannot add or delete servers), save configuration profiles for quick switching between server sets, with servers configured in ~/.aws/amazonq/mcp.json and all metadata stored in a separate JSON file. The interface features a clean, intuitive design with real-time statistics (servers enabled/disabled, total tools), status indicators, quick actions, and keyboard shortcuts. Changes are automatically saved to the configuration file.

## Requirements

### Requirement 1: Hierarchical Dashboard with Server and Tool Display

**User Story:** As a user, I want to view all configured MCP servers and their tools in an expandable/collapsible hierarchical list, so that I can quickly understand the complete structure and status of my MCP configuration.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display a dashboard with all configured MCP servers from ~/.aws/amazonq/mcp.json
2. WHEN displaying servers THEN the system SHALL order them alphabetically by name
3. WHEN displaying each server THEN the system SHALL show the server name, status indicator, and toggle button
4. WHEN displaying each server THEN the system SHALL provide an expand/collapse control to show/hide server details
5. WHEN a server is expanded THEN the system SHALL show the command and args on one line, description, and a Tools node
6. WHEN displaying the Tools node THEN the system SHALL show the tool count and provide an expand/collapse control
7. WHEN the Tools node is expanded THEN the system SHALL show all corresponding tools in a hierarchical list under the parent server
8. WHEN displaying tools THEN the system SHALL order them alphabetically by name under their parent server
9. WHEN displaying each tool THEN the system SHALL show the tool name and description
10. WHEN a server is disabled THEN the system SHALL grey out the server and all corresponding tools
11. WHEN a server is enabled THEN the system SHALL restore the server and all corresponding tools to their original colors (not greyed-out)
12. WHEN the application loads THEN the system SHALL display all servers and Tools nodes in collapsed state by default
13. WHEN the user expands or collapses a server or Tools node THEN the system SHALL persist the state in the metadata file
14. IF the mcp.json file does not exist THEN the system SHALL display an empty state with a message indicating no servers are configured
15. WHEN the dashboard is displayed THEN the system SHALL use a clean, modern UI with smooth animations

### Requirement 2: Server Enable/Disable Actions

**User Story:** As a user, I want to quickly enable or disable MCP servers with visual feedback, so that I can efficiently manage which servers are active.

#### Acceptance Criteria

1. WHEN the user clicks a server's toggle button THEN the system SHALL toggle the server's enabled/disabled state
2. WHEN a server is toggled THEN the system SHALL update only the "disabled" field in the mcp.json file
3. WHEN a server is disabled THEN the system SHALL grey out the server and all corresponding tools
4. WHEN a server is enabled THEN the system SHALL restore the server and all corresponding tools to their original colors (not greyed-out)
5. WHEN the user performs a toggle action THEN the system SHALL provide immediate visual feedback with smooth animations
6. WHEN the "disabled" field is not present in mcp.json THEN the system SHALL treat the server as enabled by default
7. WHEN a server is disabled THEN all corresponding tools SHALL be visually indicated as disabled (greyed out)
8. WHEN a server is enabled THEN all corresponding tools SHALL be visually indicated as enabled (not greyed out)

### Requirement 3: Application, Server, and Tool Metadata Management

**User Story:** As a user, I want the system to store and display all application, server, and tool metadata in a separate file, so that I can understand what each server and tool does and maintain application state.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL read all application, server, and tool metadata from a separate JSON metadata file
2. WHEN displaying servers and tools THEN the system SHALL show their descriptions from the metadata file
3. IF a server or tool does not have a description THEN the system SHALL display a default message or leave the description empty
4. WHEN the system stores metadata THEN the system SHALL include application-level settings, server metadata, and tool metadata in the same JSON file

### Requirement 4: Dashboard Summary Statistics

**User Story:** As a user, I want to see summary statistics at the top of the dashboard, so that I can quickly understand the overall state of my MCP configuration.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display summary information across the top of the screen
2. WHEN displaying summary statistics THEN the system SHALL show the number of servers enabled
3. WHEN displaying summary statistics THEN the system SHALL show the number of servers disabled
4. WHEN displaying summary statistics THEN the system SHALL show the total number of tools across all servers
5. WHEN any server is toggled THEN the system SHALL update the summary statistics in real-time

### Requirement 5: Dashboard Refresh and Export

**User Story:** As a user, I want to refresh the dashboard from the JSON files and export my MCP configuration, so that I can ensure I'm viewing current data and create backups.

#### Acceptance Criteria

1. WHEN the user clicks the "Refresh" button THEN the system SHALL reload all data from the mcp.json and metadata files
2. WHEN the dashboard is refreshed THEN the system SHALL update the display with the current state from the files
3. WHEN the user clicks the "MCP Export" button THEN the system SHALL save the current mcp.json file with a timestamped filename
4. WHEN exporting the MCP configuration THEN the system SHALL use the format mcp-YYYY-MM-DD-HH-MM-SS.json where YYYY-MM-DD-HH-MM-SS is the current date and time
5. WHEN the export is complete THEN the system SHALL provide visual feedback indicating success
6. WHEN the refresh is complete THEN the system SHALL provide visual feedback indicating the dashboard has been updated



### Requirement 6: File Persistence and Error Handling

**User Story:** As a user, I want the application to safely read and write the mcp.json and metadata files, so that my configurations are preserved and I'm notified of any errors.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL attempt to read the mcp.json file from ~/.aws/amazonq/mcp.json
2. WHEN the application starts THEN the system SHALL attempt to read the metadata file containing application, server, and tool metadata
3. IF the mcp.json file contains invalid JSON THEN the system SHALL display an error message and prevent modifications
4. WHEN the system writes to the mcp.json file THEN the system SHALL preserve proper JSON formatting with indentation
5. IF a file write operation fails THEN the system SHALL display an error message to the user
6. WHEN the system writes to the mcp.json file THEN the system SHALL maintain the structure with "mcpServers" as the root object
7. WHEN the system modifies server enabled/disabled state THEN the system SHALL only update the "disabled" field without adding or removing servers from mcp.json

### Requirement 7: User Interface Responsiveness and Theme Support

**User Story:** As a user, I want the interface to be simple, responsive, and support both light and dark modes, so that I can efficiently manage my MCP server configurations in my preferred visual theme.

#### Acceptance Criteria

1. WHEN the user performs any action THEN the system SHALL provide immediate visual feedback
2. WHEN validation errors occur THEN the system SHALL display clear, actionable error messages
3. WHEN the page loads THEN the system SHALL fit on a single page without requiring scrolling for the main navigation
4. WHEN the user toggles between light and dark mode THEN the system SHALL immediately apply the selected theme to all UI elements
5. WHEN the application loads THEN the system SHALL display a toggle switch for switching between light mode and dark mode
6. WHEN the user selects a theme THEN the system SHALL persist the theme preference for future sessions
7. WHEN the dashboard is displayed in dark mode THEN the system SHALL use appropriate colors for readability and visual comfort
8. WHEN the dashboard is displayed in light mode THEN the system SHALL use appropriate colors for readability and visual comfort

### Requirement 8: Configuration Profiles

**User Story:** As a user, I want to save and quickly switch between different server configuration profiles, so that I can efficiently manage different sets of enabled/disabled servers for different use cases.

#### Acceptance Criteria

1. WHEN the user clicks the "Save" button in the Profile Bar THEN the system SHALL prompt for a profile name and description
2. WHEN the user saves a profile THEN the system SHALL capture the current enabled/disabled state of all servers
3. WHEN the user saves a profile THEN the system SHALL store the profile in the metadata file
4. WHEN the user selects a profile from the dropdown THEN the system SHALL apply the profile's server configuration
5. WHEN a profile is applied THEN the system SHALL update the mcp.json file with the new disabled states
6. WHEN a profile is applied THEN the system SHALL update the UI to reflect the changes
7. WHEN a profile is applied THEN the system SHALL set it as the active profile in the metadata
8. WHEN the user clicks the "Delete" button THEN the system SHALL prompt for confirmation before deleting the active profile
9. WHEN a profile is deleted THEN the system SHALL remove it from the metadata file and update the dropdown
10. WHEN the application loads THEN the system SHALL display the active profile in the dropdown if one exists
11. WHEN no profile is active THEN the system SHALL display "None" in the profile dropdown

### Requirement 9: Keyboard Shortcuts

**User Story:** As a user, I want to use keyboard shortcuts for common actions, so that I can manage servers more efficiently without relying solely on mouse interactions.

#### Acceptance Criteria

1. WHEN the user presses a designated keyboard shortcut THEN the system SHALL execute the corresponding action
2. WHEN the application loads THEN the system SHALL provide a way to view available keyboard shortcuts
3. WHEN keyboard shortcuts are displayed THEN the system SHALL show clear mappings between keys and actions
4. WHEN the user is editing a form THEN the system SHALL not trigger shortcuts that conflict with text input
5. WHEN the user presses arrow keys THEN the system SHALL navigate between servers and expand/collapse controls
