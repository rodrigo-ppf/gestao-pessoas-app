module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin para resolver imports de CSS problemáticos
      [
        'module-resolver',
        {
          alias: {
            // Mock para arquivos CSS que não existem
            'modal.module.css': './src/utils/empty-css.js',
          },
        },
      ],
    ],
  };
};
