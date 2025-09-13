const express = require('express');
const path = require('path');
const app = express();

// Servir arquivos estáticos do build do React
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes (se necessário no futuro)
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA routing - servir index.html para todas as rotas da aplicação
app.get('*', (req, res) => {
  // Se for uma rota da API ou health check, retornar 404
  if (req.url.startsWith('/api/') || req.url.startsWith('/health')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Para todas as outras rotas, servir o index.html do React
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Servindo arquivos estáticos de: ${path.join(__dirname, 'dist')}`);
  console.log(`🌐 Aplicação disponível em: http://localhost:${PORT}`);
});
