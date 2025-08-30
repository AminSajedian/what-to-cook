// Comment out the line below to disable warning suppression
require("./warningSuppression");

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// // Memory optimization settings
// config.resolver.platforms = ['ios', 'android', 'native', 'web'];
// config.resolver.enableGlobalPackages = false;
// config.transformer.minifierConfig = {
//   keep_fnames: true,
//   mangle: {
//     keep_fnames: true,
//   },
// };

// // Reduce memory usage by limiting concurrent transformations
// config.maxWorkers = Math.max(1, Math.floor(require('os').cpus().length / 2));

module.exports = config;
