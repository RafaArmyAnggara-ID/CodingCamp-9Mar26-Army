// Productivity Dashboard Application

// StorageManager Module
// Abstracts localStorage operations for tasks and links
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

// GreetingDisplay Component
// Displays current date, time, and time-based greeting
class GreetingDisplay {
  constructor(containerElement) {
    this.container = containerElement;
    this.intervalId = null;
  }

  init() {
    // Create DOM structure
    this.container.innerHTML = `
      <div class="date-display"></div>
      <div class="time-display"></div>
      <div class="greeting-message"></div>
    `;

    // Get references to display elements
    this.dateDisplay = this.container.querySelector('.date-display');
    this.timeDisplay = this.container.querySelector('.time-display');
    this.greetingDisplay = this.container.querySelector('.greeting-message');

    // Initial update
    this.updateDisplay();

    // Update every second
    this.intervalId = setInterval(() => this.updateDisplay(), 1000);
  }

  updateDisplay() {
    const now = new Date();
    
    // Update time display
    this.timeDisplay.textContent = this.formatTime(now);
    
    // Update date display
    this.dateDisplay.textContent = this.formatDate(now);
    
    // Update greeting display
    const hour = now.getHours();
    this.greetingDisplay.textContent = this.getGreeting(hour);
  }

  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return 'Good Morning';
    } else if (hour >= 12 && hour <= 16) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour <= 20) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  }

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  formatDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNumber = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName}, ${monthName} ${dayNumber}, ${year}`;
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
