# StorageManager Tests

## Running the Tests

Since Node.js is not installed on this system, the tests are provided as an HTML file that can be run directly in a browser.

### Browser-Based Tests

1. Open `tests/storage-manager-test.html` in a web browser
2. The tests will run automatically
3. Results will be displayed on the page and in the browser console

### Test Coverage

The tests verify:
- ✓ Tasks are saved to localStorage with the correct key "tasks" (Requirement 5.5)
- ✓ Tasks are loaded from localStorage correctly
- ✓ Empty arrays are returned when localStorage is empty (Requirement 5.4)
- ✓ Links are saved to localStorage with the correct key "quickLinks" (Requirement 5.6)
- ✓ Links are loaded from localStorage correctly
- ✓ JSON serialization handles special characters correctly
- ✓ Empty task and link arrays are handled properly

All tests validate Requirements 5.4, 5.5, and 5.6 from the requirements document.
