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

module.exports = config;
