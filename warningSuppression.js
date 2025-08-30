/**
 * Unified Warning Suppression System (CommonJS version for Metro)
 *
 * This file consolidates all warning suppression logic into a single location.
 * It handles Metro bundler warnings at the development server level.
 */

// Define all warning patterns to suppress in one place
const SUPPRESSED_WARNING_PATTERNS = [
  // Shadow deprecation warnings
  '"shadow*" style props are deprecated. Use "boxShadow"',
  // '"shadow*" style props are deprecated',
  // '"shadow*" style props are deprecated',
  // "shadow* style props are deprecated",
  // "shadowColor",
  // "shadowOffset",
  // "shadowOpacity",
  // "shadowRadius",
  // 'Use "boxShadow"',

  // Expo notifications warnings
  '[expo-notifications] Listening to push token changes is not yet fully supported on web. Adding a listener will have no effect.',
];

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

// Helper function to check if a message should be suppressed
function shouldSuppressMessage(message) {
  if (!message) return false;

  const messageStr = message.toString().toLowerCase();

  return SUPPRESSED_WARNING_PATTERNS.some((pattern) =>
    messageStr.includes(pattern.toLowerCase())
  );
}

// Global console.warn override
console.warn = function (...args) {
  if (shouldSuppressMessage(args[0])) {
    return; // Silently suppress
  }

  // Pass through other warnings
  originalWarn.apply(this, args);
};

// Global console.error override (for warnings that come through as errors)
console.error = function (...args) {
  if (shouldSuppressMessage(args[0])) {
    return; // Silently suppress
  }

  originalError.apply(this, args);
};

// Set global flag for other libraries to check
if (typeof global !== "undefined") {
  global.__SUPPRESS_SHADOW_WARNINGS__ = true;
  global.__WARNING_SUPPRESSION_ACTIVE__ = true;
}

// Get current timestamp for logging
const currentTime = new Date().toLocaleString();

// Function to log memory usage
function logMemoryUsage() {
  // Skip memory logging on web platform as process.memoryUsage() is not available
  if (typeof process === 'undefined' || typeof process.memoryUsage !== 'function') {
    // console.log(`💾 Memory Usage is not available.`);
    return;
  }
  
  const used = process.memoryUsage();
  console.log(`⏰ ${currentTime}`);
  console.log(`💾 Memory Usage:`);
  for (let key in used) {
    console.log(`   ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}

// Log current memory usage
logMemoryUsage();

// Log that suppression is active
console.log(`🔇 Metro Warning suppression system initialized`);
console.log(
  `📝 Suppressing ${SUPPRESSED_WARNING_PATTERNS.length} warning patterns`
);

module.exports = {
  suppressWarnings: function (patterns) {
    SUPPRESSED_WARNING_PATTERNS.push(...patterns);
  },
  isWarningSuppressed: shouldSuppressMessage,
  getSuppressions: function () {
    return [...SUPPRESSED_WARNING_PATTERNS];
  },
};
