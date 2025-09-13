const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

console.log('🚀 Iniciando servidor simples...');
console.log(`📁 Diretório atual: ${__dirname}`);

// Servir arquivos estáticos do diretório atual
app.use(express.static(__dirname));
console.log('✅ Servindo arquivos estáticos do diretório atual');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    currentPath: __dirname,
    files: fs.readdirSync(__dirname).slice(0, 10) // Primeiros 10 arquivos
  });
});

// Redirecionar raiz para login
app.get('/', (req, res) => {
  console.log('🔄 Redirecionando / para /login');
  res.redirect(302, '/login');
});

// Servir index.html para todas as outras rotas
app.use((req, res) => {
  console.log(`📄 Requisição para: ${req.url}`);
  
  const indexPath = path.join(__dirname, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ Servindo index.html');
    res.sendFile(indexPath);
  } else {
    console.log('❌ index.html não encontrado');
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro 404</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Erro 404</h1>
          <div class="error">
            <strong>Arquivo não encontrado:</strong> ${req.url}<br>
            <strong>index.html não existe em:</strong> ${indexPath}
          </div>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><a href="/health">Verificar Status</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Aplicação disponível!`);
});