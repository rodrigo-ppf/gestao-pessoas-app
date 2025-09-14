#!/bin/bash

echo "🔧 Preparando build para web..."

# Criar arquivo CSS necessário para o expo-router
echo "📁 Criando arquivo CSS necessário..."

# Criar o arquivo no caminho correto (assets)
mkdir -p node_modules/expo-router/assets
echo "/* Arquivo CSS vazio para resolver problema do expo-router */" > node_modules/expo-router/assets/modal.module.css

# Criar também o arquivo no caminho alternativo (build/modal/web)
mkdir -p node_modules/expo-router/build/modal/web
echo "/* Arquivo CSS vazio para resolver problema do expo-router */" > node_modules/expo-router/build/modal/web/modal.module.css

# Criar também no caminho que o erro está procurando
mkdir -p node_modules/expo-router/build/assets
echo "/* Arquivo CSS vazio para resolver problema do expo-router */" > node_modules/expo-router/build/assets/modal.module.css

# Verificar se os arquivos foram criados
if [ -f "node_modules/expo-router/assets/modal.module.css" ]; then
    echo "✅ Arquivo CSS criado em assets/"
else
    echo "❌ Erro ao criar arquivo CSS em assets/"
    exit 1
fi

if [ -f "node_modules/expo-router/build/modal/web/modal.module.css" ]; then
    echo "✅ Arquivo CSS criado em build/modal/web/"
else
    echo "❌ Erro ao criar arquivo CSS em build/modal/web/"
    exit 1
fi

if [ -f "node_modules/expo-router/build/assets/modal.module.css" ]; then
    echo "✅ Arquivo CSS criado em build/assets/"
else
    echo "❌ Erro ao criar arquivo CSS em build/assets/"
    exit 1
fi

# Remover página de status para forçar geração da aplicação React
echo "🗑️ Removendo página de status para forçar geração da aplicação React..."
if [ -f "public/index.html" ]; then
    echo "📄 Removendo public/index.html (página de status)"
    rm public/index.html
    echo "✅ public/index.html removido"
else
    echo "ℹ️ public/index.html não existe"
fi

# Modificar diretamente o arquivo problemático do expo-router
echo "🔧 Modificando arquivo problemático do expo-router..."
MODAL_STYLES_FILE="node_modules/expo-router/build/modal/web/modalStyles.js"
if [ -f "$MODAL_STYLES_FILE" ]; then
    echo "📄 Modificando modalStyles.js para resolver problema do CSS..."
    # Backup do arquivo original
    cp "$MODAL_STYLES_FILE" "$MODAL_STYLES_FILE.backup"
    
    # Substituir a linha problemática por um objeto vazio
    sed -i 's/const modal_module_css_1 = __importDefault(require("..\/..\/..\/assets\/modal.module.css"));/const modal_module_css_1 = { default: {} };/' "$MODAL_STYLES_FILE"
    
    echo "✅ modalStyles.js modificado com sucesso"
else
    echo "⚠️ modalStyles.js não encontrado, será criado durante o build"
fi

# Build para web
echo "🚀 Iniciando build para web..."
npx expo export --platform web --clear

# Verificar se o arquivo foi criado durante o build e modificá-lo
echo "🔧 Verificando se modalStyles.js foi criado durante o build..."
if [ -f "$MODAL_STYLES_FILE" ]; then
    echo "📄 modalStyles.js encontrado pós-build, modificando..."
    # Backup do arquivo original
    cp "$MODAL_STYLES_FILE" "$MODAL_STYLES_FILE.backup"
    
    # Substituir a linha problemática
    sed -i 's/const modal_module_css_1 = __importDefault(require("..\/..\/..\/assets\/modal.module.css"));/const modal_module_css_1 = { default: {} };/' "$MODAL_STYLES_FILE"
    
    echo "✅ modalStyles.js modificado pós-build"
    
    # Tentar o build novamente
    echo "🔄 Tentando build novamente após modificação..."
    npx expo export --platform web --clear
fi

# Verificar se o build gerou a aplicação React corretamente
echo "🔍 Verificando se o build gerou a aplicação React..."
if [ -f "dist/index.html" ]; then
    # Verificar se o index.html contém conteúdo da aplicação React
    if grep -q "react" dist/index.html || grep -q "_expo" dist/index.html || grep -q "<script" dist/index.html; then
        echo "✅ Build da aplicação React gerado com sucesso"
    else
        echo "❌ ERRO: Build gerou página de status em vez da aplicação React!"
        echo "📄 Conteúdo do index.html:"
        head -20 dist/index.html
        echo "🔧 Tentando corrigir o build..."
        
        # Remover o index.html incorreto
        rm dist/index.html
        
        # Tentar build novamente com configurações diferentes
        echo "🔄 Tentando build alternativo..."
        npx expo export --platform web --clear --output-dir dist
        
        # Verificar novamente
        if [ -f "dist/index.html" ] && (grep -q "react" dist/index.html || grep -q "_expo" dist/index.html); then
            echo "✅ Build corrigido com sucesso"
        else
            echo "❌ ERRO: Ainda não conseguiu gerar a aplicação React"
            exit 1
        fi
    fi
else
    echo "❌ ERRO: index.html não foi gerado"
    exit 1
fi

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

# Verificar se os arquivos existem antes de copiar
if [ -f "server.minimal.js" ]; then
    cp server.minimal.js dist/server.js
    echo "✅ server.minimal.js copiado para dist/server.js"
else
    echo "❌ server.minimal.js não encontrado"
    exit 1
fi

if [ -f "package.prod.json" ]; then
    cp package.prod.json dist/package.json
    echo "✅ package.prod.json copiado para dist/package.json"
else
    echo "❌ package.prod.json não encontrado"
    exit 1
fi

if [ -f "app.yaml" ]; then
    cp app.yaml dist/
    echo "✅ app.yaml copiado para dist/"
else
    echo "❌ app.yaml não encontrado"
    exit 1
fi

# Verificar se os arquivos foram copiados
echo "🔍 Verificando arquivos copiados..."
if [ -f "dist/server.js" ]; then
    echo "✅ server.js copiado com sucesso"
else
    echo "❌ Erro ao copiar server.js"
    exit 1
fi

if [ -f "dist/package.json" ]; then
    echo "✅ package.json copiado com sucesso"
else
    echo "❌ Erro ao copiar package.json"
    exit 1
fi

if [ -f "dist/app.yaml" ]; then
    echo "✅ app.yaml copiado com sucesso"
else
    echo "❌ Erro ao copiar app.yaml"
    exit 1
fi

# Verificar tamanho da pasta dist
echo "📊 Verificando tamanho da pasta dist..."
if command -v du >/dev/null 2>&1; then
    DIST_SIZE=$(du -sh dist/ | cut -f1)
    echo "📦 Tamanho da pasta dist: $DIST_SIZE"
    
    if [ -d "dist/node_modules" ]; then
        echo "⚠️ AVISO: node_modules encontrado na pasta dist!"
        echo "📦 Tamanho do node_modules: $(du -sh dist/node_modules | cut -f1)"
    fi
else
    echo "📦 Pasta dist criada (du não disponível para verificar tamanho)"
fi

echo "🎉 Build concluído com sucesso!"