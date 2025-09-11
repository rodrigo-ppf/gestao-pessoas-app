export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: 'admin_sistema' | 'admin_empresa' | 'colaborador';
  empresa: {
    id: string;
    nome: string;
    codigo: string;
  };
  departamento?: string;
  cargo?: string;
  avatar?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  codigo: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
}

// Dados mockados das empresas
export const empresas: Empresa[] = [
  {
    id: '1',
    nome: 'TechCorp Solutions',
    codigo: 'TECH001',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Tecnologias, 123',
    telefone: '(11) 99999-9999',
    email: 'contato@techcorp.com'
  },
  {
    id: '2',
    nome: 'Inovação Digital Ltda',
    codigo: 'INOV002',
    cnpj: '98.765.432/0001-10',
    endereco: 'Av. da Inovação, 456',
    telefone: '(11) 88888-8888',
    email: 'contato@inovacao.com'
  },
  {
    id: '3',
    nome: 'Sistemas Avançados S.A.',
    codigo: 'SIST003',
    cnpj: '11.222.333/0001-44',
    endereco: 'Rua dos Sistemas, 789',
    telefone: '(11) 77777-7777',
    email: 'contato@sistemas.com'
  }
];

// Dados mockados dos usuários
export const usuarios: User[] = [
  // Admin do Sistema
  {
    id: '1',
    nome: 'Carlos Admin',
    email: 'admin@sistema.com',
    senha: 'admin123',
    perfil: 'admin_sistema',
    empresa: empresas[0],
    departamento: 'Administração',
    cargo: 'Administrador do Sistema',
    avatar: '👨‍💼'
  },
  
  // Admins de Empresa
  {
    id: '2',
    nome: 'Maria Silva',
    email: 'maria@techcorp.com',
    senha: 'admin123',
    perfil: 'admin_empresa',
    empresa: empresas[0],
    departamento: 'Recursos Humanos',
    cargo: 'Gerente de RH',
    avatar: '👩‍💼'
  },
  {
    id: '3',
    nome: 'João Santos',
    email: 'joao@inovacao.com',
    senha: 'admin123',
    perfil: 'admin_empresa',
    empresa: empresas[1],
    departamento: 'Diretoria',
    cargo: 'Diretor',
    avatar: '👨‍💼'
  },
  
  // Colaboradores
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'ana@techcorp.com',
    senha: 'colab123',
    perfil: 'colaborador',
    empresa: empresas[0],
    departamento: 'Desenvolvimento',
    cargo: 'Desenvolvedora',
    avatar: '👩‍💻'
  },
  {
    id: '5',
    nome: 'Pedro Oliveira',
    email: 'pedro@techcorp.com',
    senha: 'colab123',
    perfil: 'colaborador',
    empresa: empresas[0],
    departamento: 'Marketing',
    cargo: 'Analista de Marketing',
    avatar: '👨‍💻'
  },
  {
    id: '6',
    nome: 'Lucia Ferreira',
    email: 'lucia@inovacao.com',
    senha: 'colab123',
    perfil: 'colaborador',
    empresa: empresas[1],
    departamento: 'Vendas',
    cargo: 'Vendedora',
    avatar: '👩‍💼'
  },
  {
    id: '7',
    nome: 'Roberto Lima',
    email: 'roberto@sistemas.com',
    senha: 'colab123',
    perfil: 'colaborador',
    empresa: empresas[2],
    departamento: 'Suporte',
    cargo: 'Técnico de Suporte',
    avatar: '👨‍🔧'
  }
];

// Função para autenticar usuário
export const authenticateUser = (email: string, senha: string): User | null => {
  console.log('authenticateUser: Procurando usuário com email:', email);
  console.log('authenticateUser: Total de usuários disponíveis:', usuarios.length);
  
  const usuario = usuarios.find(
    u => u.email === email && u.senha === senha
  );
  
  console.log('authenticateUser: Usuário encontrado:', usuario ? usuario.nome : 'Nenhum');
  return usuario || null;
};

// Função para obter usuário por ID
export const getUserById = (id: string): User | null => {
  return usuarios.find(u => u.id === id) || null;
};

// Função para obter usuários por empresa
export const getUsersByEmpresa = (empresaId: string): User[] => {
  return usuarios.filter(u => u.empresa.id === empresaId);
};

// Função para obter usuários por perfil
export const getUsersByPerfil = (perfil: User['perfil']): User[] => {
  return usuarios.filter(u => u.perfil === perfil);
};
