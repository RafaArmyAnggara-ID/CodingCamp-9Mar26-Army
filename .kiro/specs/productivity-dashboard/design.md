# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a client-side web application that provides essential productivity tools in a single, unified interface. The application consists of four main components: a time-based greeting display, a 25-minute focus timer, a task management system, and a quick links manager. All data is persisted locally using the browser's localStorage API, eliminating the need for backend infrastructure.

The design emphasizes simplicity, performance, and maintainability through vanilla JavaScript implementation without external dependencies. The architecture follows a component-based approach where each feature is encapsulated in its own module with clear responsibilities and interfaces.

### Key Design Goals

- **Zero Dependencies**: Pure HTML5, CSS3, and ES6+ JavaScript without frameworks or libraries
- **Instant Responsiveness**: All UI updates complete within 100ms of user interaction
- **Data Persistence**: Automatic saving to localStorage on every state change
- **Browser Compatibility**: Support for Chrome, Firefox, Edge, and Safari latest versions
- **Clean Architecture**: Separation of concerns with modular component design

## Architecture

### System Architecture

The application follows a modular, component-based architecture with clear separation between presentation, business logic, and data persistence layers.

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                            │
│                    (Application Shell)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────────────────────┐
                              │                                 │
                    ┌─────────▼─────────┐          ┌──────────▼──────────┐
                    │   styles.css      │          │      app.js         │
                    │  (Presentation)   │          │  (Application Core) │
                    └───────────────────┘          └──────────────────────┘
                                                              │
                    ┌─────────────────────────────────────────┼─────────────────────────────┐
                    │                                         │                             │
         ┌──────────▼──────────┐              ┌──────────────▼─────────┐      ┌───────────▼──────────┐
         │  GreetingDisplay    │              │    FocusTimer          │      │   TaskList           │
         │   Component         │              │    Component           │      │   Component          │
         └─────────────────────┘              └────────────────────────┘      └──────────────────────┘
                                                                                          │
                                                              ┌───────────────────────────┼──────────┐
                                                              │                           │          │
                                                   ┌──────────▼──────────┐    ┌──────────▼─────────┐│
                                                   │   QuickLinks        │    │  StorageManager    ││
                                                   │   Component         │    │   (Data Layer)     ││
                                                   └─────────────────────┘    └────────────────────┘│
                                                              │                           │          │
                                                              └───────────────────────────┼──────────┘
                                                                                          │
                                                                              ┌───────────▼──────────┐
                                                                              │  localStorage API    │
                                                                              │  (Browser Storage)   │
                                                                              └──────────────────────┘
```

### Component Responsibilities

**Application Core (app.js)**
- Initialize all components on page load
- Coordinate component lifecycle
- Handle global event delegation
- Manage application state initialization

**GreetingDisplay Component**
- Display current date and time
- Update time display every second
- Calculate and display time-based greeting (Morning/Afternoon/Evening/Night)
- Format date and time for display

**FocusTimer Component**
- Manage 25-minute countdown timer
- Handle start, stop, and reset operations
- Track timer state (idle, running, stopped)
- Update display every second during countdown
- Notify user when timer completes

**TaskList Component**
- Create, read, update, and delete tasks
- Toggle task completion status
- Persist tasks to localStorage
- Load tasks from localStorage on initialization
- Maintain task order (creation order)

**QuickLinks Component**
- Create and delete quick links
- Validate URL format (http:// or https://)
- Persist links to localStorage
- Load links from localStorage on initialization
- Open links in new browser tabs

**StorageManager Module**
- Abstract localStorage operations
- Provide save and load methods for tasks and links
- Handle JSON serialization/deserialization
- Manage storage keys ("tasks", "quickLinks")

### Data Flow

1. **Initialization Flow**
   - Page loads → app.js initializes
   - StorageManager loads data from localStorage
   - Components initialize with loaded data
   - UI renders initial state

2. **User Interaction Flow**
   - User interacts with component
   - Component updates internal state
   - Component triggers StorageManager to persist data
   - Component updates DOM to reflect new state

3. **Timer Update Flow**
   - setInterval triggers every second
   - GreetingDisplay updates time and greeting
   - FocusTimer updates countdown (if running)
   - DOM updates reflect new values

## Components and Interfaces

### GreetingDisplay Component

**Purpose**: Display current date, time, and contextual greeting message

**Public Interface**:
```javascript
class GreetingDisplay {
  constructor(containerElement)
  init()
  destroy()
}
```

**Internal Methods**:
- `updateDisplay()`: Updates time, date, and greeting every second
- `getGreeting(hour)`: Returns appropriate greeting based on hour (0-23)
- `formatTime(date)`: Formats time as HH:MM:SS
- `formatDate(date)`: Formats date as "Day, Month Date, Year"

**DOM Structure**:
```html
<div id="greeting-container">
  <div class="date-display"></div>
  <div class="time-display"></div>
  <div class="greeting-message"></div>
</div>
```

**Greeting Logic**:
- 05:00 - 11:59: "Good Morning"
- 12:00 - 16:59: "Good Afternoon"
- 17:00 - 20:59: "Good Evening"
- 21:00 - 04:59: "Good Night"

### FocusTimer Component

**Purpose**: Provide 25-minute countdown timer with start/stop/reset controls

**Public Interface**:
```javascript
class FocusTimer {
  constructor(containerElement)
  init()
  start()
  stop()
  reset()
  destroy()
}
```

**Internal State**:
```javascript
{
  duration: 1500,        // 25 minutes in seconds
  remaining: 1500,       // Current remaining time
  state: 'idle',         // 'idle' | 'running' | 'stopped'
  intervalId: null       // setInterval reference
}
```

**Internal Methods**:
- `tick()`: Decrements remaining time by 1 second
- `updateDisplay()`: Updates MM:SS display
- `formatTime(seconds)`: Converts seconds to MM:SS format
- `handleComplete()`: Handles timer completion (notification + reset)

**DOM Structure**:
```html
<div id="timer-container">
  <div class="timer-display">25:00</div>
  <div class="timer-controls">
    <button class="btn-start">Start</button>
    <button class="btn-stop">Stop</button>
    <button class="btn-reset">Reset</button>
  </div>
</div>
```

**State Transitions**:
- idle → running: Start button clicked
- running → stopped: Stop button clicked
- stopped → running: Start button clicked (resume)
- any state → idle: Reset button clicked or timer completes

### TaskList Component

**Purpose**: Manage user tasks with CRUD operations and persistence

**Public Interface**:
```javascript
class TaskList {
  constructor(containerElement, storageManager)
  init()
  addTask(text)
  editTask(id, newText)
  toggleTask(id)
  deleteTask(id)
  destroy()
}
```

**Internal State**:
```javascript
{
  tasks: [
    {
      id: 'uuid-string',
      text: 'Task description',
      completed: false,
      createdAt: timestamp
    }
  ]
}
```

**Internal Methods**:
- `generateId()`: Creates unique task identifier
- `renderTasks()`: Renders all tasks to DOM
- `renderTask(task)`: Renders single task element
- `saveTasks()`: Persists tasks via StorageManager
- `loadTasks()`: Loads tasks from StorageManager

**DOM Structure**:
```html
<div id="task-list-container">
  <form class="task-input-form">
    <input type="text" class="task-input" placeholder="Add a new task...">
    <button type="submit" class="btn-add-task">Add</button>
  </form>
  <ul class="task-list">
    <li class="task-item" data-id="uuid">
      <input type="checkbox" class="task-checkbox">
      <span class="task-text">Task description</span>
      <button class="btn-edit-task">Edit</button>
      <button class="btn-delete-task">Delete</button>
    </li>
  </ul>
</div>
```

### QuickLinks Component

**Purpose**: Manage quick access links to favorite websites

**Public Interface**:
```javascript
class QuickLinks {
  constructor(containerElement, storageManager)
  init()
  addLink(name, url)
  deleteLink(id)
  destroy()
}
```

**Internal State**:
```javascript
{
  links: [
    {
      id: 'uuid-string',
      name: 'Link Name',
      url: 'https://example.com',
      createdAt: timestamp
    }
  ]
}
```

**Internal Methods**:
- `generateId()`: Creates unique link identifier
- `validateUrl(url)`: Validates URL starts with http:// or https://
- `renderLinks()`: Renders all links to DOM
- `renderLink(link)`: Renders single link button
- `saveLinks()`: Persists links via StorageManager
- `loadLinks()`: Loads links from StorageManager
- `openLink(url)`: Opens URL in new tab

**DOM Structure**:
```html
<div id="quick-links-container">
  <form class="link-input-form">
    <input type="text" class="link-name-input" placeholder="Link name">
    <input type="url" class="link-url-input" placeholder="https://example.com">
    <button type="submit" class="btn-add-link">Add Link</button>
  </form>
  <div class="links-grid">
    <div class="link-item" data-id="uuid">
      <button class="link-button">Link Name</button>
      <button class="btn-delete-link">×</button>
    </div>
  </div>
</div>
```

### StorageManager Module

**Purpose**: Abstract localStorage operations and handle data persistence

**Public Interface**:
```javascript
const StorageManager = {
  saveTasks(tasks)
  loadTasks()
  saveLinks(links)
  loadLinks()
}
```

**Implementation**:
```javascript
const StorageManager = {
  TASKS_KEY: 'tasks',
  LINKS_KEY: 'quickLinks',
  
  saveTasks(tasks) {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  },
  
  loadTasks() {
    const data = localStorage.getItem(this.TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveLinks(links) {
    localStorage.setItem(this.LINKS_KEY, JSON.stringify(links));
  },
  
  loadLinks() {
    const data = localStorage.getItem(this.LINKS_KEY);
    return data ? JSON.parse(data) : [];
  }
};
```

## Data Models

### Task Model

```javascript
{
  id: String,           // Unique identifier (UUID or timestamp-based)
  text: String,         // Task description (non-empty)
  completed: Boolean,   // Completion status
  createdAt: Number     // Unix timestamp for ordering
}
```

**Constraints**:
- `id`: Must be unique across all tasks
- `text`: Must be non-empty string
- `completed`: Defaults to false
- `createdAt`: Set on creation, immutable

**Example**:
```javascript
{
  id: '1704067200000-abc123',
  text: 'Complete project documentation',
  completed: false,
  createdAt: 1704067200000
}
```

### Link Model

```javascript
{
  id: String,           // Unique identifier (UUID or timestamp-based)
  name: String,         // Display name for the link
  url: String,          // Valid URL starting with http:// or https://
  createdAt: Number     // Unix timestamp for ordering
}
```

**Constraints**:
- `id`: Must be unique across all links
- `name`: Must be non-empty string
- `url`: Must start with "http://" or "https://"
- `createdAt`: Set on creation, immutable

**Example**:
```javascript
{
  id: '1704067200000-def456',
  name: 'GitHub',
  url: 'https://github.com',
  createdAt: 1704067200000
}
```

### Timer State Model

```javascript
{
  duration: Number,     // Total timer duration in seconds (1500)
  remaining: Number,    // Remaining time in seconds
  state: String,        // 'idle' | 'running' | 'stopped'
  intervalId: Number    // setInterval ID (null when not running)
}
```

**State Definitions**:
- `idle`: Timer at full duration, not started or just completed
- `running`: Timer actively counting down
- `stopped`: Timer paused with remaining time preserved

**Constraints**:
- `duration`: Always 1500 (25 minutes)
- `remaining`: 0 ≤ remaining ≤ duration
- `state`: Must be one of three valid states
- `intervalId`: null when state is not 'running'


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hour-to-greeting mapping is correct for all hours

*For any* hour value (0-23), the greeting function should return the correct greeting: "Good Morning" for hours 5-11, "Good Afternoon" for hours 12-16, "Good Evening" for hours 17-20, and "Good Night" for hours 21-4.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 2: Timer format produces valid MM:SS for all second values

*For any* non-negative integer representing seconds, the timer format function should produce a string in MM:SS format where MM is zero-padded minutes and SS is zero-padded seconds.

**Validates: Requirements 2.7**

### Property 3: Starting idle timer transitions to running state

*For any* timer in idle state with 1500 seconds remaining, calling start should transition the timer to running state and maintain the remaining time at 1500 seconds.

**Validates: Requirements 2.2**

### Property 4: Starting stopped timer resumes from remaining time

*For any* timer in stopped state with any remaining time value, calling start should transition the timer to running state and preserve the exact remaining time value.

**Validates: Requirements 2.3**

### Property 5: Stopping running timer preserves remaining time

*For any* timer in running state with any remaining time value, calling stop should transition the timer to stopped state and preserve the exact remaining time value.

**Validates: Requirements 2.4**

### Property 6: Reset returns timer to initial state from any state

*For any* timer in any state (idle, running, or stopped) with any remaining time, calling reset should set the state to idle and the remaining time to 1500 seconds.

**Validates: Requirements 2.5**

### Property 7: Creating task adds it to task list

*For any* non-empty task text, creating a task should result in the task list containing a task with that exact text and completed status set to false.

**Validates: Requirements 3.1**

### Property 8: Editing task updates its text

*For any* existing task and any new non-empty text, editing the task should result in the task having the new text while preserving its id and completed status.

**Validates: Requirements 3.3**

### Property 9: Toggling task changes completion status

*For any* existing task with any completion status, toggling the task should result in the completion status being flipped (true → false or false → true) while preserving the task text and id.

**Validates: Requirements 3.5**

### Property 10: Deleting task removes it from list

*For any* existing task in the task list, deleting that task should result in the task list no longer containing a task with that id.

**Validates: Requirements 3.7**

### Property 11: Task operations round-trip through localStorage

*For any* sequence of task operations (add, edit, toggle, delete), after performing the operations and saving to localStorage, loading from localStorage should produce a task list that matches the current state exactly.

**Validates: Requirements 3.2, 3.4, 3.6, 3.8, 3.9, 5.1, 5.3**

### Property 12: Tasks maintain creation order

*For any* sequence of task creation operations, the task list should display tasks in the same order they were created, as determined by their createdAt timestamps.

**Validates: Requirements 3.10**

### Property 13: Creating link adds it to link list

*For any* non-empty link name and valid URL (starting with http:// or https://), creating a link should result in the link list containing a link with that exact name and URL.

**Validates: Requirements 4.1**

### Property 14: Deleting link removes it from list

*For any* existing link in the link list, deleting that link should result in the link list no longer containing a link with that id.

**Validates: Requirements 4.4**

### Property 15: Link operations round-trip through localStorage

*For any* sequence of link operations (add, delete), after performing the operations and saving to localStorage, loading from localStorage should produce a link list that matches the current state exactly.

**Validates: Requirements 4.2, 4.5, 4.6, 5.2, 5.3**

### Property 16: Invalid URLs are rejected

*For any* URL string that does not start with "http://" or "https://", attempting to create a link with that URL should be rejected and the link should not be added to the link list.

**Validates: Requirements 4.7**

### Property 17: Link rendering includes link name

*For any* link with a given name, the rendered HTML output should contain the link name as visible text.

**Validates: Requirements 4.8**

## Error Handling

### Input Validation

**Task Input Validation**
- Empty or whitespace-only task text should be rejected
- Task input form should prevent submission with invalid input
- User should receive visual feedback for invalid input (e.g., disabled submit button or error message)

**Link Input Validation**
- Empty link names should be rejected
- URLs not starting with "http://" or "https://" should be rejected
- Link input form should prevent submission with invalid input
- User should receive clear error messages for invalid URLs

**Timer Input Validation**
- Timer buttons should be disabled when actions are not valid for current state
- Start button: enabled only when state is idle or stopped
- Stop button: enabled only when state is running
- Reset button: always enabled

### Storage Error Handling

**localStorage Availability**
- Check if localStorage is available before attempting to use it
- If localStorage is not available (e.g., private browsing mode), display warning message to user
- Application should continue to function without persistence if localStorage is unavailable
- Gracefully handle localStorage quota exceeded errors

**Data Corruption Handling**
- Wrap JSON.parse operations in try-catch blocks
- If stored data is corrupted or invalid, initialize with empty arrays
- Log errors to console for debugging purposes
- Do not crash the application due to corrupted storage data

### Runtime Error Handling

**Timer Errors**
- Clear interval on component destruction to prevent memory leaks
- Handle edge case where timer reaches exactly 0 seconds
- Ensure notification API is available before attempting to show notifications
- Fallback to alert() if Notification API is not available

**DOM Manipulation Errors**
- Verify DOM elements exist before attempting to manipulate them
- Use optional chaining or null checks when accessing DOM elements
- Handle cases where expected elements are missing from the DOM

**Event Handler Errors**
- Wrap event handlers in try-catch to prevent one component's error from breaking others
- Log errors to console for debugging
- Provide user feedback when operations fail

### Edge Cases

**Timer Edge Cases**
- Timer at 0 seconds should trigger completion and reset to idle
- Rapid clicking of start/stop buttons should not cause race conditions
- Timer should handle page visibility changes (pause when tab is hidden)

**Task List Edge Cases**
- Empty task list should display appropriate empty state message
- Very long task text should be handled with text truncation or wrapping
- Editing a task should handle cancellation (ESC key or cancel button)
- Maximum number of tasks should be reasonable (e.g., 1000 tasks)

**Quick Links Edge Cases**
- Empty link list should display appropriate empty state message
- Very long link names should be truncated with ellipsis
- Maximum number of links should be reasonable (e.g., 50 links)
- Links with special characters in URLs should be properly encoded

**Storage Edge Cases**
- localStorage quota exceeded should be handled gracefully
- Corrupted JSON data should not crash the application
- Missing storage keys should initialize with empty arrays
- Concurrent tab modifications should not cause data loss (last write wins)

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific examples and edge cases with property-based tests for universal correctness guarantees. This ensures both concrete behavior verification and comprehensive input coverage.

### Unit Testing

Unit tests will focus on:

**Specific Examples**
- Timer initializes with 25 minutes and idle state (Requirement 2.1)
- Empty localStorage initializes with empty task and link lists (Requirement 5.4)
- Tasks stored under "tasks" key in localStorage (Requirement 5.5)
- Links stored under "quickLinks" key in localStorage (Requirement 5.6)
- Date displays in human-readable format (Requirement 1.1)
- CSS file located in css/ directory (Requirement 7.5)
- JavaScript file located in js/ directory (Requirement 7.6)
- No external dependencies in package.json (Requirement 8.6)

**Edge Cases**
- Timer completion at 0 seconds triggers notification and resets (Requirement 2.6)
- Empty localStorage on first load (Requirement 5.4)
- Corrupted JSON data in localStorage
- localStorage quota exceeded
- Very long task text (>1000 characters)
- Very long link names (>100 characters)
- Special characters in URLs
- Rapid button clicking (debouncing)

**Integration Points**
- Component initialization on page load
- Event delegation for dynamic elements
- localStorage read/write operations
- Timer interval management and cleanup
- Form submission handling

**Error Conditions**
- localStorage unavailable (private browsing)
- Invalid JSON in localStorage
- Missing DOM elements
- Notification API unavailable

### Property-Based Testing

Property-based tests will use **fast-check** library for JavaScript to generate random inputs and verify universal properties. Each test will run a minimum of 100 iterations.

**Configuration Example**:
```javascript
import fc from 'fast-check';

// Feature: productivity-dashboard, Property 1: Hour-to-greeting mapping
fc.assert(
  fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
    const greeting = getGreeting(hour);
    if (hour >= 5 && hour <= 11) return greeting === 'Good Morning';
    if (hour >= 12 && hour <= 16) return greeting === 'Good Afternoon';
    if (hour >= 17 && hour <= 20) return greeting === 'Good Evening';
    return greeting === 'Good Night';
  }),
  { numRuns: 100 }
);
```

**Property Test Coverage**:

Each correctness property from the design document will be implemented as a property-based test:

1. **Property 1**: Hour-to-greeting mapping - Test with random hours (0-23)
2. **Property 2**: Timer format - Test with random second values (0-10000)
3. **Property 3**: Start idle timer - Test with timer in idle state
4. **Property 4**: Resume stopped timer - Test with random remaining times
5. **Property 5**: Stop preserves time - Test with random remaining times
6. **Property 6**: Reset from any state - Test with random states and times
7. **Property 7**: Create task - Test with random non-empty text
8. **Property 8**: Edit task - Test with random task and new text
9. **Property 9**: Toggle task - Test with random tasks and completion states
10. **Property 10**: Delete task - Test with random tasks
11. **Property 11**: Task localStorage round-trip - Test with random task operations
12. **Property 12**: Task ordering - Test with random task creation sequences
13. **Property 13**: Create link - Test with random names and valid URLs
14. **Property 14**: Delete link - Test with random links
15. **Property 15**: Link localStorage round-trip - Test with random link operations
16. **Property 16**: URL validation - Test with random invalid URLs
17. **Property 17**: Link rendering - Test with random link names

**Custom Generators**:

Property tests will use custom generators for domain objects:

```javascript
// Task generator
const taskArbitrary = fc.record({
  id: fc.uuid(),
  text: fc.string({ minLength: 1, maxLength: 500 }),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 })
});

// Link generator
const linkArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  url: fc.webUrl({ validSchemes: ['http', 'https'] }),
  createdAt: fc.integer({ min: 0 })
});

// Timer state generator
const timerStateArbitrary = fc.constantFrom('idle', 'running', 'stopped');

// Invalid URL generator (for testing rejection)
const invalidUrlArbitrary = fc.string().filter(s => 
  !s.startsWith('http://') && !s.startsWith('https://')
);
```

### Test Organization

```
tests/
├── unit/
│   ├── greeting-display.test.js
│   ├── focus-timer.test.js
│   ├── task-list.test.js
│   ├── quick-links.test.js
│   └── storage-manager.test.js
├── property/
│   ├── greeting-properties.test.js
│   ├── timer-properties.test.js
│   ├── task-properties.test.js
│   └── link-properties.test.js
└── integration/
    └── app-integration.test.js
```

### Testing Tools

- **Test Runner**: Jest or Vitest (for fast execution)
- **Property Testing**: fast-check library
- **DOM Testing**: jsdom for simulating browser environment
- **Coverage**: Aim for >90% code coverage
- **Assertions**: Built-in test framework assertions

### Manual Testing

Manual testing will verify requirements that cannot be automated:

**Browser Compatibility** (Requirements 8.1-8.4)
- Test in Chrome, Firefox, Edge, and Safari latest versions
- Verify all features work identically across browsers
- Check for console errors in each browser

**Visual Design** (Requirements 7.1-7.4)
- Verify consistent color scheme
- Check typography readability
- Validate visual hierarchy and spacing
- Confirm interactive element affordances

**Performance** (Requirements 6.1-6.5)
- Verify UI updates within 100ms of interaction
- Check page load time under 500ms
- Monitor for lag in timer and clock updates
- Test with large numbers of tasks and links

**User Experience**
- Test keyboard navigation and accessibility
- Verify focus management
- Check for intuitive interaction patterns
- Validate error messages are clear and helpful
