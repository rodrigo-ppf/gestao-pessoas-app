#!/bin/bash

echo "🔧 Preparando build para web..."

# Criar arquivo CSS necessário para o expo-router
echo "📁 Criando arquivo CSS necessário..."
mkdir -p node_modules/expo-router/assets
echo "/* Arquivo CSS vazio para resolver problema do expo-router */" > node_modules/expo-router/assets/modal.module.css

# Verificar se o arquivo foi criado
if [ -f "node_modules/expo-router/assets/modal.module.css" ]; then
    echo "✅ Arquivo CSS criado com sucesso"
    echo "📄 Conteúdo do arquivo CSS:"
    cat node_modules/expo-router/assets/modal.module.css
else
    echo "❌ Erro ao criar arquivo CSS"
    exit 1
fi

# Criar também o arquivo no caminho alternativo
echo "📁 Criando arquivo CSS no caminho alternativo..."
mkdir -p node_modules/expo-router/build/modal/web
echo "/* Arquivo CSS vazio para resolver problema do expo-router */" > node_modules/expo-router/build/modal/web/modal.module.css

# Verificar se ambos os arquivos foram criados
if [ -f "node_modules/expo-router/build/modal/web/modal.module.css" ]; then
    echo "✅ Arquivo CSS alternativo criado com sucesso"
else
    echo "❌ Erro ao criar arquivo CSS alternativo"
    exit 1
fi

# Modificar diretamente o arquivo modalStyles.js para resolver o problema
echo "🔧 Modificando arquivo modalStyles.js..."
MODAL_STYLES_FILE="node_modules/expo-router/build/modal/web/modalStyles.js"
if [ -f "$MODAL_STYLES_FILE" ]; then
    echo "📄 Arquivo modalStyles.js encontrado, modificando..."
    # Backup do arquivo original
    cp "$MODAL_STYLES_FILE" "$MODAL_STYLES_FILE.backup"
    
    # Substituir a linha problemática
    sed -i 's/const modal_module_css_1 = __importDefault(require("..\/..\/..\/assets\/modal.module.css"));/const modal_module_css_1 = { default: {} };/' "$MODAL_STYLES_FILE"
    
    echo "✅ Arquivo modalStyles.js modificado com sucesso"
    echo "📄 Conteúdo modificado:"
    head -10 "$MODAL_STYLES_FILE"
else
    echo "⚠️ Arquivo modalStyles.js não encontrado, será criado durante o build"
fi

# Build para web
echo "🚀 Iniciando build para web..."
npx expo export --platform web --clear --output-dir dist

# Verificar se o arquivo modalStyles.js foi criado durante o build e modificá-lo
echo "🔧 Verificando arquivo modalStyles.js pós-build..."
MODAL_STYLES_FILE="node_modules/expo-router/build/modal/web/modalStyles.js"
if [ -f "$MODAL_STYLES_FILE" ]; then
    echo "📄 Arquivo modalStyles.js encontrado pós-build, modificando..."
    # Backup do arquivo original
    cp "$MODAL_STYLES_FILE" "$MODAL_STYLES_FILE.backup"
    
    # Substituir a linha problemática
    sed -i 's/const modal_module_css_1 = __importDefault(require("..\/..\/..\/assets\/modal.module.css"));/const modal_module_css_1 = { default: {} };/' "$MODAL_STYLES_FILE"
    
    echo "✅ Arquivo modalStyles.js modificado pós-build"
    echo "📄 Conteúdo modificado:"
    head -10 "$MODAL_STYLES_FILE"
    
    # Tentar o build novamente
    echo "🔄 Tentando build novamente após modificação..."
    npx expo export --platform web --clear
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

# Copiar pasta public como fallback
if [ -d "public" ]; then
    echo "📁 Copiando pasta public como fallback..."
    cp -r public dist/
    echo "✅ Pasta public copiada com sucesso"
else
    echo "⚠️ Pasta public não encontrada"
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
