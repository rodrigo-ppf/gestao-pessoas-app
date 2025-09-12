// Configuração específica para web
const { getDefaultConfig } = require('expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await getDefaultConfig(env, argv);
  
  // Configurações específicas para web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };
  
  // Configurações para resolver arquivos CSS
  config.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  });
  
  // Configurações para melhor compatibilidade com web
  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-transform-runtime',
        ],
      },
    },
  });
  
  // Configurações para ignorar arquivos CSS problemáticos
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
  };
  
  return config;
};
