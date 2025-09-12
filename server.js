const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Verificar se a pasta dist existe
const distPath = path.join(__dirname, 'dist');
console.log(`📁 Verificando pasta dist: ${distPath}`);
console.log(`📁 Pasta dist existe: ${fs.existsSync(distPath)}`);

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`📄 Arquivos na pasta dist: ${files.join(', ')}`);
} else {
  console.log('❌ Pasta dist não existe!');
}

// Servir arquivos estáticos da pasta dist
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true
}));

// Rota de health check
app.get('/health', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  const indexExists = fs.existsSync(indexPath);
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    distPath: distPath,
    indexExists: indexExists,
    distFiles: fs.existsSync(distPath) ? fs.readdirSync(distPath) : []
  });
});

// Rota para todas as páginas (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`Servindo index.html para: ${req.url}`);
  console.log(`Caminho do index.html: ${indexPath}`);
  console.log(`index.html existe: ${fs.existsSync(indexPath)}`);
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html não encontrado!');
    
    // Se não existe index.html, criar uma página temporária
    const tempHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestão de Pessoas - Debug</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .info { color: #1976d2; background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .success { color: #388e3c; background: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Gestão de Pessoas - Debug</h1>
          
          <div class="error">
            <h2>❌ Problema Identificado</h2>
            <p>O arquivo <code>index.html</code> não foi gerado durante o build.</p>
          </div>
          
          <div class="info">
            <h3>📊 Informações do Sistema</h3>
            <p><strong>Caminho esperado:</strong> ${indexPath}</p>
            <p><strong>Pasta dist existe:</strong> ${fs.existsSync(distPath)}</p>
            <p><strong>Arquivos na pasta dist:</strong></p>
            <pre>${fs.existsSync(distPath) ? fs.readdirSync(distPath).join('\n') : 'N/A'}</pre>
          </div>
          
          <div class="success">
            <h3>✅ Servidor Funcionando</h3>
            <p>O servidor Express está rodando corretamente. O problema está no build do Expo.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Uptime:</strong> ${process.uptime()} segundos</p>
          </div>
          
          <h3>🔧 Próximos Passos</h3>
          <ol>
            <li>Verificar logs do GitHub Actions</li>
            <li>Verificar se o build do Expo está funcionando</li>
            <li>Verificar se o arquivo modalStyles.js foi modificado corretamente</li>
          </ol>
        </div>
      </body>
      </html>
    `;
    
    res.send(tempHtml);
    return;
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Erro ao servir index.html:', err);
      res.status(500).send('Erro interno do servidor');
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Servindo arquivos estáticos de: ${distPath}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});
