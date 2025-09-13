import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Função para detectar se estamos no ambiente web
const isWeb = Platform.OS === 'web';

// Função para armazenar dados (compatível com web e mobile)
const setStorageItem = async (key: string, value: string) => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

// Função para recuperar dados (compatível com web e mobile)
const getStorageItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
};

export interface Empresa {
  id: string;
  nome: string;
  codigo: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  dataCadastro: string;
  ativa: boolean;
  emailVerificado: boolean;
  codigoVerificacao?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: 'admin_sistema' | 'dono_empresa' | 'lider' | 'funcionario';
  empresaId: string;
  departamento?: string;
  cargo?: string;
  avatar?: string;
  dataCadastro: string;
  ativo: boolean;
  liderId?: string; // ID do líder (para funcionários)
  equipe?: string[]; // IDs dos funcionários (para líderes)
  preferencias?: {
    mostrarDashboard?: boolean;
  };
}

export interface HistoricoTarefa {
  id: string;
  tarefaId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: 'criada' | 'atualizada' | 'status_alterado' | 'responsavel_alterado' | 'prioridade_alterada' | 'prazo_alterado' | 'concluida' | 'cancelada';
  campo?: string;
  valorAnterior?: string;
  valorNovo?: string;
  dataAlteracao: string;
  observacoes?: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'Baixa' | 'Média' | 'Alta';
  status: 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  empresaId: string;
  responsavelId?: string;
  criadorId: string;
  dataCriacao: string;
  dataPrazo?: string;
  dataConclusao?: string;
  historico?: HistoricoTarefa[];
}

export interface PontoRegistro {
  id: string;
  usuarioId: string;
  empresaId: string;
  data: string;
  entrada?: string;
  saida?: string;
  observacoes?: string;
}

export interface FeriasSolicitacao {
  id: string;
  usuarioId: string;
  empresaId: string;
  dataInicio: string;
  dataFim: string;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada';
  observacoes?: string;
  dataSolicitacao: string;
  aprovadorId?: string;
}

class MockDataService {
  private static instance: MockDataService;
  private empresas: Empresa[] = [];
  private usuarios: Usuario[] = [];
  private tarefas: Tarefa[] = [];
  private historicoTarefas: HistoricoTarefa[] = [];
  private pontos: PontoRegistro[] = [];
  private ferias: FeriasSolicitacao[] = [];

  private constructor() {}

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  // Inicializar dados padrão
  public async initializeDefaultData(): Promise<void> {
    try {
      console.log('MockDataService: Inicializando dados padrão...');
      const hasData = await AsyncStorage.getItem('mockDataInitialized');
      console.log('MockDataService: hasData:', hasData);
      
      if (!hasData) {
        console.log('MockDataService: Criando dados padrão...');
        await this.createDefaultData();
        await AsyncStorage.setItem('mockDataInitialized', 'true');
        console.log('MockDataService: Dados padrão criados');
      } else {
        console.log('MockDataService: Dados já existem, carregando...');
        await this.loadData();
        
        // Verificar se o usuário dono_empresa existe
        const donoEmpresa = this.usuarios.find(u => u.perfil === 'dono_empresa');
        if (!donoEmpresa) {
          console.log('MockDataService: Usuário dono_empresa não encontrado, adicionando...');
          const novoDonoEmpresa: Usuario = {
            id: '2',
            nome: 'João Silva',
            email: 'dono@empresa.com',
            senha: '123456',
            perfil: 'dono_empresa',
            empresaId: '1',
            departamento: 'Diretoria',
            cargo: 'Dono da Empresa',
            avatar: '👔',
            dataCadastro: new Date().toISOString(),
            ativo: true
          };
          this.usuarios.push(novoDonoEmpresa);
          await this.saveData();
          console.log('MockDataService: Usuário dono_empresa adicionado');
        }
      }
      
      await this.loadData();
      console.log('MockDataService: Dados carregados. Usuários:', this.usuarios.length);
      console.log('MockDataService: Usuários:', this.usuarios.map(u => ({ id: u.id, nome: u.nome, perfil: u.perfil })));
    } catch (error) {
      console.error('Erro ao inicializar dados padrão:', error);
    }
  }

  private async createDefaultData(): Promise<void> {
    console.log('MockDataService: Criando dados padrão...');
    
    // Criar empresa padrão
    const empresaPadrao: Empresa = {
      id: '1',
      nome: 'Sistema Demo',
      codigo: 'DEMO001',
      cnpj: '00.000.000/0001-00',
      endereco: 'Rua Demo, 123',
      telefone: '(11) 99999-9999',
      email: 'contato@demo.com',
      dataCadastro: new Date().toISOString(),
      ativa: true,
      emailVerificado: true
    };
    console.log('MockDataService: Empresa padrão criada:', empresaPadrao);

    // Criar admin do sistema
    const adminSistema: Usuario = {
      id: '1',
      nome: 'Admin Sistema',
      email: 'admin@sistema.com',
      senha: 'admin123',
      perfil: 'admin_sistema',
      empresaId: '1',
      departamento: 'Administração',
      cargo: 'Administrador do Sistema',
      avatar: '👨‍💼',
      dataCadastro: new Date().toISOString(),
      ativo: true
    };
    console.log('MockDataService: Admin sistema criado:', adminSistema);

    // Criar dono da empresa para teste
    const donoEmpresa: Usuario = {
      id: '2',
      nome: 'João Silva',
      email: 'dono@empresa.com',
      senha: '123456',
      perfil: 'dono_empresa',
      empresaId: '1',
      departamento: 'Diretoria',
      cargo: 'Dono da Empresa',
      avatar: '👔',
      dataCadastro: new Date().toISOString(),
      ativo: true
    };
    console.log('MockDataService: Dono empresa criado:', donoEmpresa);

    this.empresas = [empresaPadrao];
    this.usuarios = [adminSistema, donoEmpresa];
    
    console.log('MockDataService: Arrays definidos. Empresas:', this.empresas.length, 'Usuários:', this.usuarios.length);

    await this.saveData();
    console.log('MockDataService: Dados salvos com sucesso');
  }

  private async loadData(): Promise<void> {
    try {
      console.log('MockDataService: Carregando dados do AsyncStorage...');
      const empresasData = await getStorageItem('empresas');
      const usuariosData = await getStorageItem('usuarios');
      const tarefasData = await getStorageItem('tarefas');
      const pontosData = await getStorageItem('pontos');
      const feriasData = await getStorageItem('ferias');

      console.log('MockDataService: Dados brutos do AsyncStorage:');
      console.log('empresasData:', empresasData);
      console.log('usuariosData:', usuariosData);

      if (empresasData) {
        this.empresas = JSON.parse(empresasData);
        console.log('MockDataService: Empresas carregadas:', this.empresas.length);
      }
      if (usuariosData) {
        this.usuarios = JSON.parse(usuariosData);
        console.log('MockDataService: Usuários carregados:', this.usuarios.length);
        console.log('MockDataService: Usuários carregados:', this.usuarios.map(u => ({ id: u.id, nome: u.nome, perfil: u.perfil })));
      }
      if (tarefasData) this.tarefas = JSON.parse(tarefasData);
      
      const historicoData = await AsyncStorage.getItem('historicoTarefas');
      if (historicoData) this.historicoTarefas = JSON.parse(historicoData);
      if (pontosData) this.pontos = JSON.parse(pontosData);
      if (feriasData) this.ferias = JSON.parse(feriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      console.log('MockDataService: Salvando dados no AsyncStorage...');
      console.log('MockDataService: Empresas para salvar:', this.empresas.length);
      console.log('MockDataService: Usuários para salvar:', this.usuarios.length);
      
      await setStorageItem('empresas', JSON.stringify(this.empresas));
      await setStorageItem('usuarios', JSON.stringify(this.usuarios));
      await setStorageItem('tarefas', JSON.stringify(this.tarefas));
      await setStorageItem('historicoTarefas', JSON.stringify(this.historicoTarefas));
      await setStorageItem('pontos', JSON.stringify(this.pontos));
      await setStorageItem('ferias', JSON.stringify(this.ferias));
      
      console.log('MockDataService: Dados salvos com sucesso no AsyncStorage');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }

  // Métodos para Empresas
  public async createEmpresa(empresa: Omit<Empresa, 'id' | 'dataCadastro' | 'emailVerificado' | 'codigoVerificacao'>): Promise<Empresa> {
    const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
    
    const novaEmpresa: Empresa = {
      ...empresa,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      emailVerificado: false,
      codigoVerificacao
    };
    
    this.empresas.push(novaEmpresa);
    await this.saveData();
    
    // Simular envio de email (em produção seria enviado via backend)
    console.log(`📧 Email enviado para ${empresa.email} com código: ${codigoVerificacao}`);
    
    return novaEmpresa;
  }

  public async verificarEmailEmpresa(empresaId: string, codigo: string): Promise<boolean> {
    const empresa = this.empresas.find(e => e.id === empresaId);
    if (empresa && empresa.codigoVerificacao === codigo) {
      empresa.emailVerificado = true;
      empresa.ativa = true;
      delete empresa.codigoVerificacao; // Remove o código após verificação
      await this.saveData();
      return true;
    }
    return false;
  }

  public getEmpresas(): Empresa[] {
    return this.empresas; // Retorna todas as empresas (ativas e não verificadas)
  }

  public getEmpresasAtivas(): Empresa[] {
    return this.empresas.filter(e => e.ativa && e.emailVerificado);
  }

  public getEmpresaById(id: string): Empresa | undefined {
    console.log('MockDataService - Buscando empresa por ID:', id);
    console.log('Empresas disponíveis:', this.empresas.map(e => ({ id: e.id, nome: e.nome, ativa: e.ativa })));
    const empresa = this.empresas.find(e => e.id === id);
    console.log('Empresa encontrada:', empresa);
    return empresa;
  }

  // Métodos para Usuários
  public async createUsuario(usuario: Omit<Usuario, 'id' | 'dataCadastro'>): Promise<Usuario> {
    console.log('=== MOCKDATA: CRIANDO USUÁRIO ===');
    console.log('Dados recebidos:', usuario);
    
    const novoUsuario: Usuario = {
      ...usuario,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString()
    };
    
    console.log('Usuário criado:', novoUsuario);
    console.log('Total de usuários antes:', this.usuarios.length);
    
    this.usuarios.push(novoUsuario);
    
    console.log('Total de usuários depois:', this.usuarios.length);
    console.log('Salvando dados...');
    
    await this.saveData();
    
    console.log('Usuário salvo com sucesso');
    return novoUsuario;
  }

  public getUsuarios(): Usuario[] {
    return this.usuarios.filter(u => u.ativo);
  }

  public getUsuariosByEmpresa(empresaId: string): Usuario[] {
    console.log('MockDataService - getUsuariosByEmpresa chamado com empresaId:', empresaId);
    console.log('Todos os usuários:', this.usuarios);
    const usuariosFiltrados = this.usuarios.filter(u => u.empresaId === empresaId && u.ativo);
    console.log('Usuários filtrados:', usuariosFiltrados);
    return usuariosFiltrados;
  }

  public getLideres(): Usuario[] {
    return this.usuarios.filter(u => u.perfil === 'lider' && u.ativo);
  }

  public getColaboradores(): Usuario[] {
    return this.usuarios.filter(u => u.perfil === 'funcionario' && u.ativo);
  }

  public getLideresByEmpresa(empresaId: string): Usuario[] {
    return this.usuarios.filter(u => u.perfil === 'lider' && u.empresaId === empresaId && u.ativo);
  }

  public getColaboradoresByEmpresa(empresaId: string): Usuario[] {
    return this.usuarios.filter(u => u.perfil === 'funcionario' && u.empresaId === empresaId && u.ativo);
  }

  public getAllUsuariosByEmpresa(empresaId: string): Usuario[] {
    // Método que retorna TODOS os usuários da empresa (incluindo inativos)
    return this.usuarios.filter(u => u.empresaId === empresaId);
  }

  public getUsuarioById(id: string): Usuario | undefined {
    return this.usuarios.find(u => u.id === id && u.ativo);
  }

  public authenticateUser(email: string, senha: string): Usuario | null {
    return this.usuarios.find(u => u.email === email && u.senha === senha && u.ativo) || null;
  }

  public async updateUsuario(usuarioId: string, dadosAtualizados: Partial<Usuario>): Promise<Usuario | null> {
    const usuarioIndex = this.usuarios.findIndex(u => u.id === usuarioId);
    if (usuarioIndex !== -1) {
      this.usuarios[usuarioIndex] = { ...this.usuarios[usuarioIndex], ...dadosAtualizados };
      await this.saveData();
      return this.usuarios[usuarioIndex];
    }
    return null;
  }

  public async updateUsuarioPreferencias(usuarioId: string, preferencias: Partial<Usuario['preferencias']>): Promise<Usuario | null> {
    const usuarioIndex = this.usuarios.findIndex(u => u.id === usuarioId);
    if (usuarioIndex !== -1) {
      this.usuarios[usuarioIndex].preferencias = {
        ...this.usuarios[usuarioIndex].preferencias,
        ...preferencias
      };
      await this.saveData();
      return this.usuarios[usuarioIndex];
    }
    return null;
  }

  public async deleteUsuario(usuarioId: string): Promise<boolean> {
    const usuarioIndex = this.usuarios.findIndex(u => u.id === usuarioId);
    if (usuarioIndex !== -1) {
      // Marcar como inativo em vez de excluir fisicamente
      this.usuarios[usuarioIndex].ativo = false;
      await this.saveData();
      return true;
    }
    return false;
  }

  // Métodos para Tarefas
  public async createTarefa(tarefa: Omit<Tarefa, 'id' | 'dataCriacao'>): Promise<Tarefa> {
    const novaTarefa: Tarefa = {
      ...tarefa,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString()
    };
    
    this.tarefas.push(novaTarefa);
    
    // Registrar criação no histórico
    await this.adicionarHistorico(
      novaTarefa.id,
      tarefa.criadorId,
      'criada',
      undefined,
      undefined,
      undefined,
      `Tarefa "${novaTarefa.titulo}" criada`
    );
    
    await this.saveData();
    return novaTarefa;
  }

  public getTarefas(): Tarefa[] {
    return this.tarefas;
  }

  public getTarefasByEmpresa(empresaId: string): Tarefa[] {
    return this.tarefas.filter(t => t.empresaId === empresaId);
  }

  public getTarefasByUsuario(usuarioId: string): Tarefa[] {
    return this.tarefas.filter(t => t.responsavelId === usuarioId);
  }

  public async updateTarefaStatus(tarefaId: string, status: Tarefa['status'], usuarioId?: string): Promise<Tarefa | null> {
    const tarefa = this.tarefas.find(t => t.id === tarefaId);
    if (tarefa) {
      const statusAnterior = tarefa.status;
      const responsavelAnterior = tarefa.responsavelId;
      
      tarefa.status = status;
      if (status === 'Concluída') {
        tarefa.dataConclusao = new Date().toISOString();
      }
      if (usuarioId) {
        tarefa.responsavelId = usuarioId;
      }

      // Registrar alterações no histórico
      if (statusAnterior !== status) {
        await this.adicionarHistorico(
          tarefaId,
          usuarioId || tarefa.criadorId,
          'status_alterado',
          'status',
          statusAnterior,
          status
        );
      }

      if (usuarioId && responsavelAnterior !== usuarioId) {
        const responsavelAnteriorNome = responsavelAnterior ? this.getUsuarioById(responsavelAnterior)?.nome : 'Não atribuído';
        const responsavelNovoNome = this.getUsuarioById(usuarioId)?.nome || 'Usuário não encontrado';
        
        await this.adicionarHistorico(
          tarefaId,
          usuarioId,
          'responsavel_alterado',
          'responsavel',
          responsavelAnteriorNome,
          responsavelNovoNome
        );
      }

      await this.saveData();
      return tarefa;
    }
    return null;
  }

  public getTarefaById(tarefaId: string): Tarefa | null {
    return this.tarefas.find(t => t.id === tarefaId) || null;
  }

  public async updateTarefa(tarefaId: string, dadosAtualizados: Partial<Omit<Tarefa, 'id' | 'dataCriacao'>>, usuarioId?: string): Promise<Tarefa | null> {
    const tarefa = this.tarefas.find(t => t.id === tarefaId);
    if (tarefa) {
      const dadosAnteriores = { ...tarefa };
      
      // Registrar alterações específicas no histórico
      if (dadosAtualizados.titulo && dadosAtualizados.titulo !== tarefa.titulo) {
        await this.adicionarHistorico(
          tarefaId,
          usuarioId || tarefa.criadorId,
          'atualizada',
          'titulo',
          tarefa.titulo,
          dadosAtualizados.titulo
        );
      }

      if (dadosAtualizados.descricao && dadosAtualizados.descricao !== tarefa.descricao) {
        await this.adicionarHistorico(
          tarefaId,
          usuarioId || tarefa.criadorId,
          'atualizada',
          'descricao',
          tarefa.descricao,
          dadosAtualizados.descricao
        );
      }

      if (dadosAtualizados.prioridade && dadosAtualizados.prioridade !== tarefa.prioridade) {
        await this.adicionarHistorico(
          tarefaId,
          usuarioId || tarefa.criadorId,
          'prioridade_alterada',
          'prioridade',
          tarefa.prioridade,
          dadosAtualizados.prioridade
        );
      }

      if (dadosAtualizados.status && dadosAtualizados.status !== tarefa.status) {
        await this.adicionarHistorico(
          tarefaId,
          usuarioId || tarefa.criadorId,
          'status_alterado',
          'status',
          tarefa.status,
          dadosAtualizados.status
        );
      }

      if (dadosAtualizados.dataPrazo !== undefined && dadosAtualizados.dataPrazo !== tarefa.dataPrazo) {
        await this.adicionarHistorico(
          tarefaId,
          usuarioId || tarefa.criadorId,
          'prazo_alterado',
          'dataPrazo',
          tarefa.dataPrazo || 'Não definido',
          dadosAtualizados.dataPrazo || 'Não definido'
        );
      }

      if (dadosAtualizados.responsavelId !== undefined && dadosAtualizados.responsavelId !== tarefa.responsavelId) {
        const responsavelAnteriorNome = tarefa.responsavelId ? this.getUsuarioById(tarefa.responsavelId)?.nome : 'Não atribuído';
        const responsavelNovoNome = dadosAtualizados.responsavelId ? this.getUsuarioById(dadosAtualizados.responsavelId)?.nome : 'Não atribuído';
        
        await this.adicionarHistorico(
          tarefaId,
          usuarioId || tarefa.criadorId,
          'responsavel_alterado',
          'responsavel',
          responsavelAnteriorNome,
          responsavelNovoNome
        );
      }

      Object.assign(tarefa, dadosAtualizados);
      await this.saveData();
      return tarefa;
    }
    return null;
  }

  public async deleteTarefa(tarefaId: string): Promise<boolean> {
    const index = this.tarefas.findIndex(t => t.id === tarefaId);
    if (index !== -1) {
      this.tarefas.splice(index, 1);
      // Remover histórico da tarefa
      this.historicoTarefas = this.historicoTarefas.filter(h => h.tarefaId !== tarefaId);
      await this.saveData();
      return true;
    }
    return false;
  }

  // Métodos para Histórico de Tarefas
  private async adicionarHistorico(
    tarefaId: string,
    usuarioId: string,
    acao: HistoricoTarefa['acao'],
    campo?: string,
    valorAnterior?: string,
    valorNovo?: string,
    observacoes?: string
  ): Promise<void> {
    const usuario = this.getUsuarioById(usuarioId);
    if (!usuario) return;

    const historico: HistoricoTarefa = {
      id: Date.now().toString(),
      tarefaId,
      usuarioId,
      usuarioNome: usuario.nome,
      acao,
      campo,
      valorAnterior,
      valorNovo,
      dataAlteracao: new Date().toISOString(),
      observacoes
    };

    this.historicoTarefas.push(historico);
    await this.saveData();
  }

  public getHistoricoTarefa(tarefaId: string): HistoricoTarefa[] {
    return this.historicoTarefas
      .filter(h => h.tarefaId === tarefaId)
      .sort((a, b) => new Date(b.dataAlteracao).getTime() - new Date(a.dataAlteracao).getTime());
  }

  // Métodos para Ponto
  public async registrarPonto(usuarioId: string, empresaId: string, tipo: 'entrada' | 'saida'): Promise<PontoRegistro> {
    const hoje = new Date().toISOString().split('T')[0];
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    let registro = this.pontos.find(p => p.usuarioId === usuarioId && p.empresaId === empresaId && p.data === hoje);
    
    if (!registro) {
      registro = {
        id: Date.now().toString(),
        usuarioId,
        empresaId,
        data: hoje,
        entrada: tipo === 'entrada' ? hora : undefined,
        saida: tipo === 'saida' ? hora : undefined
      };
      this.pontos.push(registro);
    } else {
      if (tipo === 'entrada') {
        registro.entrada = hora;
      } else {
        registro.saida = hora;
      }
    }
    
    await this.saveData();
    return registro;
  }

  public getPontosByUsuario(usuarioId: string): PontoRegistro[] {
    return this.pontos.filter(p => p.usuarioId === usuarioId);
  }

  // Métodos para Férias
  public async solicitarFerias(ferias: Omit<FeriasSolicitacao, 'id' | 'dataSolicitacao'>): Promise<FeriasSolicitacao> {
    const novaSolicitacao: FeriasSolicitacao = {
      ...ferias,
      id: Date.now().toString(),
      dataSolicitacao: new Date().toISOString()
    };
    
    this.ferias.push(novaSolicitacao);
    await this.saveData();
    return novaSolicitacao;
  }

  public getFeriasByUsuario(usuarioId: string): FeriasSolicitacao[] {
    return this.ferias.filter(f => f.usuarioId === usuarioId);
  }

  public getFeriasByEmpresa(empresaId: string): FeriasSolicitacao[] {
    return this.ferias.filter(f => f.empresaId === empresaId);
  }

  // Método para resetar dados (para testes)
  public async resetData(): Promise<void> {
    await AsyncStorage.clear();
    this.empresas = [];
    this.usuarios = [];
    this.tarefas = [];
    this.pontos = [];
    this.ferias = [];
    await this.initializeDefaultData();
  }
}

export default MockDataService.getInstance();
