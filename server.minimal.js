const express = require('express');
const app = express();

// Rota básica de teste
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gestão de Pessoas</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .success { color: #2e7d32; background: #e8f5e8; padding: 15px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Gestão de Pessoas</h1>
        <div class="success">
          <strong>✅ Servidor Funcionando!</strong><br>
          Aplicação rodando no Google App Engine.
        </div>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Uptime:</strong> ${process.uptime()} segundos</p>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Todas as outras rotas
app.get('*', (req, res) => {
  res.redirect('/');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
