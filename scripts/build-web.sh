#!/bin/bash

echo "🔧 Preparando build para web..."

# Criar arquivo CSS necessário para o expo-router
echo "📁 Criando arquivo CSS necessário..."
mkdir -p node_modules/expo-router/assets
echo "/* Arquivo CSS vazio para resolver problema do expo-router */" > node_modules/expo-router/assets/modal.module.css

# Verificar se o arquivo foi criado
if [ -f "node_modules/expo-router/assets/modal.module.css" ]; then
    echo "✅ Arquivo CSS criado com sucesso"
else
    echo "❌ Erro ao criar arquivo CSS"
    exit 1
fi

# Build para web
echo "🚀 Iniciando build para web..."
npx expo export --platform web --clear

# Verificar se o build foi criado
if [ -d "dist" ]; then
    echo "✅ Build criado com sucesso"
    echo "📊 Conteúdo da pasta dist:"
    ls -la dist/
    
    # Verificar se index.html existe
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html encontrado"
        echo "📄 Primeiras linhas do index.html:"
        head -10 dist/index.html
    else
        echo "❌ index.html não encontrado!"
        exit 1
    fi
    
    # Verificar se há arquivos JS
    if [ -d "dist/_expo/static/js" ]; then
        echo "✅ Arquivos JS encontrados"
        ls -la dist/_expo/static/js/ | head -5
    else
        echo "⚠️ Pasta de JS não encontrada"
    fi
    
else
    echo "❌ Erro ao criar build"
    exit 1
fi

# Copiar arquivos necessários para o App Engine
echo "📋 Copiando arquivos para App Engine..."
cp server.js dist/
cp package.json dist/
cp app.yaml dist/

echo "🎉 Build concluído com sucesso!"
