const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Workaround for Node.js v24+ and metro compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;



