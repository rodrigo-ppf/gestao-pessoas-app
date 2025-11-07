// Utilitário para inicialização específica do ambiente web
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

// Função para garantir que o localStorage esteja disponível
export const ensureLocalStorage = () => {
  if (isWeb && typeof window !== 'undefined') {
    // Verificar se localStorage está disponível
    if (!window.localStorage) {
      console.warn('localStorage não está disponível no ambiente web');
      return false;
    }
    return true;
  }
  return false;
};

// Função para inicializar dados padrão no web
export const initializeWebData = () => {
  if (!isWeb) return;
  
  console.log('Inicializando dados para ambiente web...');
  
  // Verificar se já existem dados
  const hasEmpresas = localStorage.getItem('empresas');
  const hasUsuarios = localStorage.getItem('usuarios');
  
  if (!hasEmpresas || !hasUsuarios) {
    console.log('Dados não encontrados, inicializando dados padrão...');
    
    // Dados padrão para web
    const defaultEmpresa = {
      id: 'empresa-1',
      nome: 'Empresa Demo',
      codigo: 'DEMO001',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua Demo, 123',
      telefone: '(11) 99999-9999',
      email: 'contato@empresademo.com',
      dataCadastro: new Date().toISOString(),
      ativa: true,
      emailVerificado: true
    };
    
    const defaultUsuario = {
      id: 'usuario-1',
      nome: 'Admin Sistema',
      email: 'admin@sistema.com',
      senha: 'admin123',
      perfil: 'admin_sistema' as const,
      empresaId: 'empresa-1',
      departamento: 'TI',
      cargo: 'Administrador',
      dataCadastro: new Date().toISOString(),
      ativo: true
    };
    
    localStorage.setItem('empresas', JSON.stringify([defaultEmpresa]));
    localStorage.setItem('usuarios', JSON.stringify([defaultUsuario]));
    localStorage.setItem('tarefas', JSON.stringify([]));
    localStorage.setItem('historicoTarefas', JSON.stringify([]));
    localStorage.setItem('pontos', JSON.stringify([]));
    localStorage.setItem('ferias', JSON.stringify([]));
    
    console.log('Dados padrão inicializados para web');
  }
};

// Função para verificar se o usuário está logado no web
export const getWebUser = () => {
  if (!isWeb) return null;
  
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error);
      return null;
    }
  }
  return null;
};

// Função para definir usuário logado no web
export const setWebUser = (user: any) => {
  if (!isWeb) return;
  
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Função para remover usuário logado no web
export const clearWebUser = () => {
  if (!isWeb) return;
  
  localStorage.removeItem('currentUser');
};
