const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolve the worklets/plugin reference that Reanimated 4 emits
config.resolver.extraNodeModules = {
  'react-native-worklets': require.resolve('react-native-reanimated'),
};

config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './src/global.css' });
