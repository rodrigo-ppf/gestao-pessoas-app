# 🏢 Sistema de Gestão de Pessoas

Um sistema completo de gestão de pessoas desenvolvido com React Native e Expo, oferecendo funcionalidades robustas para administração de empresas, equipes e colaboradores.

## 🚀 Funcionalidades

### 🔐 Autenticação e Perfis
- **Sistema de login** com múltiplos perfis de usuário
- **Perfis disponíveis**:
  - 👨‍💼 **Admin Sistema**: Administrador geral do sistema
  - 👔 **Dono da Empresa**: Proprietário da empresa
  - 👨‍💼 **Líder**: Gerente de equipe
  - 👤 **Funcionário**: Colaborador da empresa

### 🏢 Gestão de Empresas
- **Cadastro de empresas** com validação completa
- **Verificação de email** para ativação da conta
- **Criação automática** do usuário dono da empresa
- **Login automático** após verificação

### 👥 Gestão de Equipe
- **Cadastro de líderes** com validação de senhas
- **Cadastro de funcionários** com associação a líderes
- **Seleção múltipla** de funcionários para associação em massa
- **Gerenciamento visual** de equipes e hierarquias
- **Edição e exclusão** de líderes com confirmação

### 🔒 Segurança e Validação
- **Validação de senhas** em tempo real
- **Mínimo de 6 caracteres** com feedback visual
- **Confirmação de senha** com verificação de igualdade
- **Toggle de visibilidade** para campos de senha
- **Mensagens de erro** claras e específicas

### 🌍 Internacionalização
- **Suporte multilíngue** (Português/Inglês)
- **Detecção automática** do idioma do dispositivo
- **Interface traduzida** completamente
- **Sistema i18n** robusto e extensível

### 💾 Persistência de Dados
- **Mock Data Service** para desenvolvimento
- **AsyncStorage** para persistência local
- **Dados hierárquicos** (empresa → líderes → funcionários)
- **Sistema de tarefas** e pontos integrado

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Native Paper** - Componentes de UI
- **Expo Router** - Navegação baseada em arquivos
- **i18next** - Internacionalização
- **AsyncStorage** - Armazenamento local
- **React Context API** - Gerenciamento de estado

## 📱 Telas e Funcionalidades

### 🔑 Autenticação
- **Login** com validação de credenciais
- **Cadastro de empresa** com formulário completo
- **Verificação de email** com código de confirmação

### 🏠 Dashboard Principal
- **Home** com informações do usuário logado
- **Menu flutuante** para navegação rápida
- **Cards informativos** sobre equipe e tarefas

### 👥 Gestão de Pessoas
- **Cadastro de líderes** com validação completa
- **Cadastro de funcionários** com seleção de líder
- **Gerenciar equipe** com visualização hierárquica
- **Edição de líderes** com formulário pré-preenchido

### ⚙️ Funcionalidades Avançadas
- **Seleção múltipla** de funcionários
- **Associação em massa** a líderes
- **Confirmações visuais** para ações críticas
- **Feedback em tempo real** para validações

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI
- Dispositivo móvel ou emulador

### Instalação
```bash
# Clone o repositório
git clone https://github.com/rodrigo-ppf/gestao-pessoas-app.git

# Entre na pasta do projeto
cd gestao-pessoas-app

# Instale as dependências
npm install

# Execute o projeto
npx expo start
```

### Executar no dispositivo
```bash
# Para Android
npx expo start --android

# Para iOS
npx expo start --ios

# Para web
npx expo start --web
```

## 📋 Fluxo de Uso

### 1. 🏢 Cadastro de Empresa
1. Acesse a tela de login
2. Clique em "Cadastrar Empresa"
3. Preencha os dados da empresa
4. Verifique o email com qualquer código (protótipo)
5. Sistema cria automaticamente o usuário dono

### 2. 👨‍💼 Cadastro de Líderes
1. Faça login como dono da empresa
2. Acesse "Cadastrar Líder"
3. Preencha os dados com senha de 6+ caracteres
4. Confirme a senha
5. Líder é criado e aparece na lista

### 3. 👤 Cadastro de Funcionários
1. Acesse "Cadastrar Funcionário"
2. Preencha os dados
3. Selecione um líder da lista
4. Funcionário é associado ao líder automaticamente

### 4. 👥 Gerenciar Equipe
1. Acesse "Gerenciar Equipe"
2. Veja líderes e seus funcionários
3. Use "Selecionar Múltiplos" para associar vários funcionários
4. Edite ou exclua líderes conforme necessário

## 🎨 Interface e UX

### Design System
- **Material Design** com React Native Paper
- **Cores consistentes** para cada perfil de usuário
- **Ícones intuitivos** para todas as ações
- **Feedback visual** para todas as interações

### Responsividade
- **Adaptável** a diferentes tamanhos de tela
- **Navegação fluida** entre telas
- **Componentes reutilizáveis** e consistentes

## 🔧 Estrutura do Projeto

```
gestao-pessoas-app/
├── app/                    # Telas da aplicação
│   ├── login.tsx          # Tela de login
│   ├── home.tsx           # Dashboard principal
│   ├── cadastro-*.tsx     # Telas de cadastro
│   └── gerenciar-*.tsx    # Telas de gerenciamento
├── components/            # Componentes reutilizáveis
│   ├── FloatingMenu.tsx   # Menu de navegação
│   └── AuthRedirect.tsx   # Redirecionamento de auth
├── src/
│   ├── contexts/          # Contextos React
│   │   └── AuthContext.tsx
│   ├── services/          # Serviços e APIs
│   │   ├── MockDataService.ts
│   │   └── StorageService.ts
│   ├── hooks/             # Hooks customizados
│   │   └── useTranslation.ts
│   └── i18n/              # Internacionalização
│       ├── index.ts
│       └── locales/
└── README.md
```

## 🧪 Dados de Teste

O sistema inclui dados mock para demonstração:

### Usuários Padrão
- **Admin Sistema**: admin@sistema.com / admin123
- **Dono Empresa**: dono@empresa.com / 123456

### Empresas
- **Sistema Demo**: Empresa de demonstração
- **Empresas cadastradas**: Lista dinâmica de empresas

## 🚧 Desenvolvimento

### Funcionalidades Implementadas
- ✅ Sistema de autenticação completo
- ✅ Cadastro e verificação de empresas
- ✅ Gestão de líderes e funcionários
- ✅ Validação de senhas com feedback
- ✅ Seleção múltipla de funcionários
- ✅ Interface multilíngue
- ✅ Persistência de dados local

### Próximas Funcionalidades
- 🔄 Integração com API real
- 🔄 Sistema de notificações
- 🔄 Relatórios e dashboards
- 🔄 Sistema de permissões avançado
- 🔄 Backup e sincronização

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Rodrigo Fernandes**
- GitHub: [@rodrigo-ppf](https://github.com/rodrigo-ppf)
- Email: rodrigo.ppfernandes@gmail.com

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique as [Issues](https://github.com/rodrigo-ppf/gestao-pessoas-app/issues) existentes
2. Crie uma nova issue se necessário
3. Entre em contato via email: rodrigo.ppfernandes@gmail.com

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela no GitHub!**