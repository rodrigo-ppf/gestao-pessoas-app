import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Divider, List, Paragraph, TextInput, Title } from 'react-native-paper';

export default function CadastroFuncionarioScreen() {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [cargo, setCargo] = useState('');
  const [liderSelecionado, setLiderSelecionado] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  
  // Estados para feedback visual
  const [senhaError, setSenhaError] = useState('');
  const [confirmarSenhaError, setConfirmarSenhaError] = useState('');
  
  // Estados para visibilidade das senhas
  const [senhaVisible, setSenhaVisible] = useState(false);
  const [confirmarSenhaVisible, setConfirmarSenhaVisible] = useState(false);

  const [lideres, setLideres] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, [user]);

  // Função para validar senha em tempo real
  const validarSenha = (novaSenha: string) => {
    console.log('=== VALIDAR SENHA ===');
    console.log('Nova senha:', novaSenha);
    console.log('Confirmar senha atual:', confirmarSenha);
    console.log('Estado atual senhaError:', senhaError);
    console.log('Estado atual confirmarSenhaError:', confirmarSenhaError);
    
    setSenha(novaSenha);
    
    // Validar senha
    if (novaSenha.length > 0 && novaSenha.length < 6) {
      console.log('Definindo erro de senha curta');
      setSenhaError('A senha deve ter pelo menos 6 caracteres');
    } else {
      console.log('Limpando erro de senha');
      setSenhaError('');
    }
    
    // Revalidar confirmação se já estiver preenchida
    if (confirmarSenha) {
      console.log('Revalidando confirmação...');
      if (novaSenha !== confirmarSenha) {
        console.log('Definindo erro de confirmação');
        setConfirmarSenhaError('As senhas não coincidem');
      } else {
        console.log('Limpando erro de confirmação');
        setConfirmarSenhaError('');
      }
    }
  };

  // Função para validar confirmação de senha em tempo real
  const validarConfirmacaoSenha = (novaConfirmacao: string) => {
    console.log('=== VALIDAR CONFIRMAÇÃO ===');
    console.log('Nova confirmação:', novaConfirmacao);
    console.log('Senha atual:', senha);
    console.log('Estado atual senhaError:', senhaError);
    console.log('Estado atual confirmarSenhaError:', confirmarSenhaError);
    
    setConfirmarSenha(novaConfirmacao);
    
    // Validar confirmação
    if (novaConfirmacao && senha) {
      console.log('Comparando senhas...');
      if (novaConfirmacao !== senha) {
        console.log('Definindo erro de confirmação');
        setConfirmarSenhaError('As senhas não coincidem');
      } else {
        console.log('Limpando erro de confirmação');
        setConfirmarSenhaError('');
      }
    } else {
      console.log('Limpando erro de confirmação (campos vazios)');
      setConfirmarSenhaError('');
    }
  };

  // Função para limpar todos os campos e erros
  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setDepartamento('');
    setCargo('');
    setLiderSelecionado('');
    setSenhaError('');
    setConfirmarSenhaError('');
    setSenhaVisible(false);
    setConfirmarSenhaVisible(false);
  };

  const carregarDados = () => {
    if (user?.empresaId) {
      const usuarios = MockDataService.getUsuariosByEmpresa(user.empresaId);
      const lideresList = usuarios.filter(u => u.perfil === 'lider' && u.ativo);
      const funcionariosList = usuarios.filter(u => u.perfil === 'funcionario' && u.ativo);
      
      console.log('=== CARREGANDO DADOS ===');
      console.log('Usuários da empresa:', usuarios.length);
      console.log('Líderes encontrados:', lideresList.length);
      console.log('Funcionários encontrados:', funcionariosList.length);
      console.log('Líderes:', lideresList.map(l => ({ id: l.id, nome: l.nome })));
      
      setLideres(lideresList);
      setFuncionarios(funcionariosList);
    }
  };

  const handleCadastro = async () => {
    console.log('=== INICIANDO CADASTRO DE FUNCIONÁRIO ===');
    console.log('Dados do formulário:', { nome, email, departamento, cargo, liderSelecionado });
    
    if (!nome || !email || !senha || !confirmarSenha || !departamento || !cargo) {
      console.log('Erro: Campos obrigatórios não preenchidos');
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se há erros de validação
    console.log('=== VERIFICANDO ERROS DE VALIDAÇÃO ===');
    console.log('senhaError:', senhaError);
    console.log('confirmarSenhaError:', confirmarSenhaError);
    console.log('senha:', senha);
    console.log('confirmarSenha:', confirmarSenha);
    
    if (senhaError || confirmarSenhaError) {
      console.log('Erro: Validação de senha falhou');
      if (senhaError) {
        Alert.alert('Erro', senhaError);
      } else if (confirmarSenhaError) {
        Alert.alert('Erro', confirmarSenhaError);
      }
      return;
    }
    
    // Verificar se as senhas coincidem (fallback)
    if (senha !== confirmarSenha) {
      console.log('Erro: Senhas não coincidem');
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (!liderSelecionado) {
      console.log('Erro: Nenhum líder selecionado');
      console.log('Líderes disponíveis:', lideres.map(l => ({ id: l.id, nome: l.nome })));
      Alert.alert('Erro', 'Selecione um líder para o funcionário');
      return;
    }
    
    // Verificar se o líder selecionado existe
    const liderExiste = lideres.find(l => l.id === liderSelecionado);
    if (!liderExiste) {
      console.log('Erro: Líder selecionado não existe');
      console.log('Líder selecionado:', liderSelecionado);
      console.log('Líderes disponíveis:', lideres.map(l => ({ id: l.id, nome: l.nome })));
      Alert.alert('Erro', 'Líder selecionado não é válido');
      return;
    }

    setLoading(true);
    console.log('Iniciando criação do funcionário...');

    try {
      const dadosFuncionario = {
        nome,
        email,
        senha,
        perfil: 'funcionario',
        empresaId: user?.empresaId || '',
        departamento,
        cargo,
        avatar: '👤',
        ativo: true,
        liderId: liderSelecionado
      };
      
      console.log('Dados para criação:', dadosFuncionario);
      
      const novoFuncionario = await MockDataService.createUsuario(dadosFuncionario);
      console.log('Funcionário criado com sucesso:', novoFuncionario);

      // Atualizar a equipe do líder
      const lider = lideres.find(l => l.id === liderSelecionado);
      if (lider) {
        const equipeAtualizada = [...(lider.equipe || []), novoFuncionario.id];
        console.log('Equipe do líder atualizada:', equipeAtualizada);
      }

      // Limpar formulário
      limparFormulario();

      // Atualizar lista de funcionários
      carregarDados();

      console.log('Mostrando alert de sucesso...');
      Alert.alert(
        '✅ Sucesso!',
        `Colaborador ${novoFuncionario.nome} cadastrado com sucesso!\n\nDeseja cadastrar outro colaborador?`,
        [
          {
            text: 'Voltar ao Menu',
            onPress: () => router.push('/gerenciar-equipe')
          },
          {
            text: 'Cadastrar Outro',
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      Alert.alert('Erro', 'Erro ao cadastrar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // Verificar se há dados preenchidos
    const temDados = nome || email || senha || confirmarSenha || departamento || cargo || liderSelecionado;
    
    if (temDados) {
      Alert.alert(
        '⚠️ Descartar Alterações',
        'Você tem dados preenchidos no formulário.\n\nDeseja realmente descartar e voltar?',
        [
          {
            text: 'Continuar Editando',
            style: 'cancel'
          },
          {
            text: 'Descartar e Voltar',
            style: 'destructive',
            onPress: () => {
              limparFormulario();
              router.push('/gerenciar-equipe');
            }
          }
        ]
      );
    } else {
      // Se não há dados, voltar diretamente
      router.push('/gerenciar-equipe');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Cadastrar Colaborador</Title>
          <Paragraph>Cadastre um novo colaborador e atribua a um líder</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            <TextInput
              label="Nome Completo *"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Email *"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Senha *"
              value={senha}
              onChangeText={validarSenha}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!senhaVisible}
              error={!!senhaError}
              helperText={senhaError || "Mínimo de 6 caracteres"}
              right={
                <TextInput.Icon
                  icon={senhaVisible ? "eye-off" : "eye"}
                  onPress={() => setSenhaVisible(!senhaVisible)}
                />
              }
            />

            <TextInput
              label="Confirmar Senha *"
              value={confirmarSenha}
              onChangeText={validarConfirmacaoSenha}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!confirmarSenhaVisible}
              error={!!confirmarSenhaError}
              helperText={confirmarSenhaError || "Digite a mesma senha"}
              right={
                <TextInput.Icon
                  icon={confirmarSenhaVisible ? "eye-off" : "eye"}
                  onPress={() => setConfirmarSenhaVisible(!confirmarSenhaVisible)}
                />
              }
            />

            <TextInput
              label="Departamento *"
              value={departamento}
              onChangeText={setDepartamento}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: Vendas, Marketing, TI"
            />

            <TextInput
              label="Cargo *"
              value={cargo}
              onChangeText={setCargo}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: Vendedor, Analista, Desenvolvedor"
            />

            <View style={styles.liderSection}>
              <Title style={styles.sectionTitle}>Selecionar Líder *</Title>
              {lideres.length > 0 ? (
                lideres.map((lider) => (
                  <Button
                    key={lider.id}
                    mode={liderSelecionado === lider.id ? 'contained' : 'outlined'}
                    onPress={() => setLiderSelecionado(lider.id)}
                    style={styles.liderButton}
                  >
                    {lider.nome} - {lider.cargo}
                  </Button>
                ))
              ) : (
                <Card style={styles.warningCard}>
                  <Card.Content>
                    <Paragraph style={styles.warningText}>
                      ⚠️ Nenhum líder cadastrado. Cadastre um líder primeiro.
                    </Paragraph>
                    <Button
                      mode="contained"
                      onPress={() => router.push('/cadastro-lider')}
                      style={styles.warningButton}
                    >
                      Cadastrar Líder
                    </Button>
                  </Card.Content>
                </Card>
              )}
            </View>

            <View style={styles.infoCard}>
              <Title style={styles.infoTitle}>ℹ️ Informações</Title>
              <Paragraph style={styles.infoText}>
                • O funcionário será atribuído ao líder selecionado{'\n'}
                • Ele receberá tarefas do seu líder{'\n'}
                • Poderá registrar ponto e solicitar férias
              </Paragraph>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancelar}
                style={styles.cancelButton}
                icon="arrow-left"
              >
                Cancelar
              </Button>

              <Button
                mode="contained"
                onPress={handleCadastro}
                loading={loading}
                style={styles.saveButton}
                icon="check"
                disabled={lideres.length === 0}
              >
                Cadastrar Colaborador
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Lista de Funcionários Cadastrados */}
        <Card style={styles.listCard}>
          <Card.Content>
            <Title style={styles.listTitle}>
              👷 Colaboradores Cadastrados ({funcionarios.length})
            </Title>
            
            {funcionarios.length === 0 ? (
              <View style={styles.emptyState}>
                <Paragraph style={styles.emptyText}>
                  Nenhum funcionário cadastrado ainda.{'\n'}
                  Cadastre o primeiro funcionário para começar!
                </Paragraph>
              </View>
            ) : (
              <View style={styles.employeesList}>
                {funcionarios.map((funcionario, index) => {
                  const lider = lideres.find(l => l.id === funcionario.liderId);
                  return (
                    <View key={funcionario.id}>
                      <List.Item
                        title={funcionario.nome}
                        description={`${funcionario.cargo} • ${funcionario.departamento}`}
                        left={() => (
                          <Avatar.Text 
                            size={40} 
                            label={funcionario.nome.charAt(0).toUpperCase()}
                            style={styles.avatar}
                          />
                        )}
                        right={() => (
                          <View style={styles.employeeInfo}>
                            <Chip 
                              mode="outlined" 
                              compact
                              style={styles.chip}
                            >
                              {lider?.nome || 'Sem líder'}
                            </Chip>
                          </View>
                        )}
                        style={styles.listItem}
                      />
                      {index < funcionarios.length - 1 && <Divider />}
                    </View>
                  );
                })}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FloatingMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
  },
  formCard: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  liderSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  liderButton: {
    marginBottom: 8,
  },
  warningCard: {
    backgroundColor: '#fff3e0',
    marginBottom: 16,
  },
  warningText: {
    color: '#f57c00',
    marginBottom: 12,
  },
  warningButton: {
    backgroundColor: '#f57c00',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 5,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 5,
  },
  listCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  listTitle: {
    fontSize: 18,
    color: '#1976d2',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  employeesList: {
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  avatar: {
    backgroundColor: '#4caf50',
  },
  employeeInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#e8f5e8',
  },
});
