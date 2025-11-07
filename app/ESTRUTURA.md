# 📁 Estrutura Modular do Projeto

Este documento descreve a organização modular da aplicação seguindo boas práticas de desenvolvimento.

## 🎯 Princípio da Organização

O projeto foi reorganizado em **módulos funcionais** dentro da pasta `app/`, utilizando grupos de rotas do Expo Router (pastas com parênteses). Isso mantém as URLs inalteradas enquanto organiza o código de forma lógica e escalável.

## 📂 Estrutura de Módulos

```
app/
├── _layout.tsx                    # Layout raiz da aplicação
├── home.tsx                       # Tela principal (dashboard)
├── modal.tsx                      # Modal genérico
│
├── (auth)/                        # 🔐 Módulo de Autenticação
│   ├── login.tsx                  # Tela de login
│   └── verificar-email.tsx        # Verificação de email
│
├── (empresas)/                    # 🏢 Módulo de Empresas
│   ├── cadastro-empresa.tsx       # Cadastro de empresa
│   ├── company-list.tsx           # Lista de empresas
│   ├── company-register.tsx       # Registro de empresa
│   ├── home-empresa.tsx           # Home da empresa
│   └── selecionar-empresa.tsx     # Seleção de empresa
│
├── (colaboradores)/               # 👥 Módulo de Colaboradores
│   ├── cadastro-usuario.tsx       # Cadastro de usuário
│   ├── cadastro-funcionario.tsx   # Cadastro de funcionário
│   ├── cadastro-lider.tsx         # Cadastro de líder
│   ├── colaboradores.tsx          # Lista de colaboradores
│   ├── editar-funcionario.tsx     # Edição de funcionário
│   ├── editar-lider.tsx           # Edição de líder
│   ├── gerenciar-equipe.tsx       # Gerenciamento de equipe
│   └── gerenciar-equipe-new.tsx   # Nova versão do gerenciamento
│
├── (tarefas)/                     # ✅ Módulo de Tarefas
│   ├── tarefas.tsx                # Lista de tarefas
│   ├── criar-tarefa.tsx           # Criação de tarefa
│   ├── editar-tarefa.tsx          # Edição de tarefa
│   ├── detalhes-tarefa.tsx        # Detalhes da tarefa
│   └── atribuir-tarefas-lote.tsx  # Atribuição em lote
│
├── (ponto)/                       # ⏰ Módulo de Ponto
│   ├── registrar-ponto.tsx        # Registro de ponto
│   ├── historico-ponto.tsx        # Histórico de ponto
│   └── aprovar-pontos.tsx         # Aprovação de pontos
│
├── (ferias)/                      # 🏖️ Módulo de Férias
│   ├── solicitar-ferias.tsx       # Solicitação de férias
│   ├── historico-ferias.tsx       # Histórico de férias
│   └── aprovar-ferias.tsx         # Aprovação de férias
│
└── (tabs)/                        # 📑 Módulo de Tabs
    ├── _layout.tsx                # Layout das tabs
    ├── index.tsx                  # Tab principal
    └── explore.tsx                # Tab de exploração
```

## 🔑 Características dos Grupos de Rotas

### O que são grupos de rotas?

Grupos de rotas são pastas com parênteses `(nome)` que **não aparecem na URL**, mas ajudam a organizar o código. Por exemplo:

- `app/(auth)/login.tsx` → URL: `/login` (não `/auth/login`)
- `app/(empresas)/cadastro-empresa.tsx` → URL: `/cadastro-empresa` (não `/empresas/cadastro-empresa`)

### Vantagens

✅ **Organização lógica**: Código relacionado fica agrupado  
✅ **URLs limpas**: Mantém as URLs originais sem mudanças  
✅ **Escalabilidade**: Fácil adicionar novos módulos  
✅ **Manutenibilidade**: Mais fácil encontrar e modificar código  

## 📋 Mapeamento de Rotas

### Autenticação (`(auth)/`)
- `/login` → `app/(auth)/login.tsx`
- `/verificar-email` → `app/(auth)/verificar-email.tsx`

### Empresas (`(empresas)/`)
- `/cadastro-empresa` → `app/(empresas)/cadastro-empresa.tsx`
- `/company-list` → `app/(empresas)/company-list.tsx`
- `/company-register` → `app/(empresas)/company-register.tsx`
- `/home-empresa` → `app/(empresas)/home-empresa.tsx`
- `/selecionar-empresa` → `app/(empresas)/selecionar-empresa.tsx`

### Colaboradores (`(colaboradores)/`)
- `/colaboradores` → `app/(colaboradores)/colaboradores.tsx`
- `/cadastro-usuario` → `app/(colaboradores)/cadastro-usuario.tsx`
- `/cadastro-funcionario` → `app/(colaboradores)/cadastro-funcionario.tsx`
- `/cadastro-lider` → `app/(colaboradores)/cadastro-lider.tsx`
- `/editar-funcionario` → `app/(colaboradores)/editar-funcionario.tsx`
- `/editar-lider` → `app/(colaboradores)/editar-lider.tsx`
- `/gerenciar-equipe` → `app/(colaboradores)/gerenciar-equipe.tsx`

### Tarefas (`(tarefas)/`)
- `/tarefas` → `app/(tarefas)/tarefas.tsx`
- `/criar-tarefa` → `app/(tarefas)/criar-tarefa.tsx`
- `/editar-tarefa` → `app/(tarefas)/editar-tarefa.tsx`
- `/detalhes-tarefa` → `app/(tarefas)/detalhes-tarefa.tsx`
- `/atribuir-tarefas-lote` → `app/(tarefas)/atribuir-tarefas-lote.tsx`

### Ponto (`(ponto)/`)
- `/registrar-ponto` → `app/(ponto)/registrar-ponto.tsx`
- `/historico-ponto` → `app/(ponto)/historico-ponto.tsx`
- `/aprovar-pontos` → `app/(ponto)/aprovar-pontos.tsx`

### Férias (`(ferias)/`)
- `/solicitar-ferias` → `app/(ferias)/solicitar-ferias.tsx`
- `/historico-ferias` → `app/(ferias)/historico-ferias.tsx`
- `/aprovar-ferias` → `app/(ferias)/aprovar-ferias.tsx`

## 🚀 Como Adicionar Novos Módulos

1. **Criar a pasta do módulo**:
   ```bash
   mkdir app/(novo-modulo)
   ```

2. **Adicionar arquivos de rota**:
   ```bash
   touch app/(novo-modulo)/nova-tela.tsx
   ```

3. **Atualizar `_layout.tsx`** (opcional, para configurações de header):
   ```tsx
   <Stack.Screen 
     name="nova-tela" 
     options={{ 
       title: 'Nova Tela',
       headerStyle: { backgroundColor: '#1976d2' },
       headerTintColor: '#fff',
       headerTitleStyle: { fontWeight: 'bold' }
     }} 
   />
   ```

## 📝 Boas Práticas

1. **Nomenclatura**: Use nomes descritivos e em português para os módulos
2. **Agrupamento**: Agrupe funcionalidades relacionadas no mesmo módulo
3. **Consistência**: Mantenha padrões de nomenclatura dentro de cada módulo
4. **Documentação**: Documente módulos complexos com comentários
5. **Separação de responsabilidades**: Cada módulo deve ter uma responsabilidade clara

## 🔄 Migração de Código Antigo

Se você tem código antigo que referencia rotas, **não precisa mudar nada**! As rotas continuam funcionando exatamente como antes. A única diferença é a organização dos arquivos.

## 📚 Referências

- [Expo Router - Route Groups](https://docs.expo.dev/router/introduction/#route-groups)
- [Expo Router - File-based Routing](https://docs.expo.dev/router/introduction/#file-based-routing)


