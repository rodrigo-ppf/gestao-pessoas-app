const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações específicas para web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configurações para melhor compatibilidade com web
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Configurações específicas para resolver módulos web
config.resolver.alias = {
  'react-native$': 'react-native-web',
};

// Configurações para resolver extensões
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'];

// Configurações para ignorar arquivos CSS problemáticos
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configurações para resolver arquivos CSS
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
