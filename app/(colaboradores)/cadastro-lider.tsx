import MainLayout from '@/components/MainLayout';
import UniversalIcon from '@/components/UniversalIcon';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Divider, HelperText, IconButton, List, Paragraph, TextInput, Title } from 'react-native-paper';

export default function CadastroGestorScreen() {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [cargo, setCargo] = useState('');
  const [loading, setLoading] = useState(false);
  const [gestores, setGestores] = useState<any[]>([]);
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const listCardRef = useRef<View>(null);
  
  // Estados para feedback visual
  const [senhaError, setSenhaError] = useState('');
  const [confirmarSenhaError, setConfirmarSenhaError] = useState('');
  
  // Estados para visibilidade das senhas
  const [senhaVisible, setSenhaVisible] = useState(false);
  const [confirmarSenhaVisible, setConfirmarSenhaVisible] = useState(false);

  const carregarGestores = useCallback(() => {
    console.log('=== CadastroGestor: Carregando gestores ===');
    console.log('CadastroGestor: user?.empresaId:', user?.empresaId);
    
    if (user?.empresaId) {
      // Primeiro, vamos verificar todos os usuários no MockDataService (incluindo inativos)
      const todosUsuarios = MockDataService.getAllUsuarios();
      console.log('CadastroGestor: Total de usuários no MockDataService (incluindo inativos):', todosUsuarios.length);
      console.log('CadastroGestor: Todos os usuários:', todosUsuarios.map(u => ({ 
        id: u.id, 
        nome: u.nome, 
        perfil: u.perfil, 
        empresaId: u.empresaId, 
        ativo: u.ativo 
      })));
      
      // Filtrar gestores da empresa (incluindo inativos para debug)
      const todosGestoresEmpresa = todosUsuarios.filter(
        u => u.perfil === 'gestor' && u.empresaId === user.empresaId
      );
      console.log('CadastroGestor: Todos os gestores da empresa (ativos + inativos):', todosGestoresEmpresa.length);
      console.log('CadastroGestor: Detalhes dos gestores:', todosGestoresEmpresa.map(g => ({ 
        id: g.id, 
        nome: g.nome, 
        email: g.email, 
        ativo: g.ativo,
        empresaId: g.empresaId 
      })));
      
      // Buscar todos os gestores da empresa (ativos e inativos) para exibir na tela
      // A tela de cadastro deve mostrar todos os gestores para gerenciamento completo
      const gestoresEmpresa = todosGestoresEmpresa;
      console.log('CadastroGestor: Gestores encontrados (ativos + inativos):', gestoresEmpresa.length);
      console.log('CadastroGestor: Gestores:', gestoresEmpresa.map(g => ({ 
        id: g.id, 
        nome: g.nome, 
        email: g.email,
        ativo: g.ativo 
      })));
      
      setGestores(gestoresEmpresa);
    } else {
      console.warn('CadastroGestor: user?.empresaId não está definido!');
    }
  }, [user?.empresaId]);

  // Função para corrigir gestores que foram cadastrados sem empresaId
  const corrigirGestoresSemEmpresa = useCallback(async () => {
    if (!user?.empresaId) return;
    
    try {
      const todosUsuarios = MockDataService.getUsuarios();
      const gestoresSemEmpresa = todosUsuarios.filter(
        u => u.perfil === 'gestor' && (!u.empresaId || u.empresaId === '')
      );
      
      if (gestoresSemEmpresa.length > 0) {
        console.log('CadastroGestor: Encontrados gestores sem empresaId:', gestoresSemEmpresa.length);
        
        // Atualizar cada gestor sem empresaId
        for (const gestor of gestoresSemEmpresa) {
          console.log('CadastroGestor: Corrigindo gestor:', gestor.nome, 'com empresaId:', user.empresaId);
          await MockDataService.updateUsuario(gestor.id, { empresaId: user.empresaId });
        }
        
        // Recarregar lista após correção
        carregarGestores();
      }
    } catch (error) {
      console.error('Erro ao corrigir gestores sem empresa:', error);
    }
  }, [user?.empresaId, carregarGestores]);

  useEffect(() => {
    carregarGestores();
    corrigirGestoresSemEmpresa();
  }, [carregarGestores, corrigirGestoresSemEmpresa]);

  // Recarregar gestores sempre que a tela receber foco (útil quando voltar da edição)
  useFocusEffect(
    useCallback(() => {
      carregarGestores();
    }, [carregarGestores])
  );

  // Função para validar senha em tempo real
  const validarSenha = (novaSenha: string) => {
    console.log('=== VALIDAR SENHA (LÍDER) ===');
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
    console.log('=== VALIDAR CONFIRMAÇÃO (LÍDER) ===');
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
    setSenhaError('');
    setConfirmarSenhaError('');
    setSenhaVisible(false);
    setConfirmarSenhaVisible(false);
  };


  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !departamento || !cargo) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se há erros de validação
    console.log('=== VERIFICANDO ERROS DE VALIDAÇÃO (LÍDER) ===');
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

    // Validar se o usuário tem empresaId
    if (!user?.empresaId) {
      Alert.alert(
        'Erro',
        'Não foi possível identificar a empresa. Por favor, faça login novamente ou selecione uma empresa.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/home')
          }
        ]
      );
      return;
    }

    setLoading(true);

    try {
      console.log('CadastroGestor: Criando novo gestor...');
      console.log('Dados do gestor:', { nome, email, departamento, cargo, empresaId: user.empresaId });
      console.log('CadastroGestor: Usuário logado:', { id: user.id, nome: user.nome, empresaId: user.empresaId });
      
      const novoGestor = await MockDataService.createUsuario({
        nome,
        email,
        senha,
        perfil: 'gestor',
        empresaId: user.empresaId, // Garantir que sempre tenha empresaId
        departamento,
        cargo,
        avatar: '👨‍💼',
        ativo: true,
        equipe: []
      });

      console.log('CadastroGestor: Gestor criado:', novoGestor);

      // Limpar formulário
      limparFormulario();

      // Aguardar um pouco para garantir que os dados foram salvos no storage
      await new Promise(resolve => setTimeout(resolve, 100));

      // Atualizar lista de gestores
      carregarGestores();

      // Scroll para a lista de gestores após um pequeno delay para garantir que a lista foi atualizada
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);

      Alert.alert(
        '✅ Sucesso!',
        `Gestor ${novoGestor.nome} cadastrado com sucesso!\n\nO gestor já aparece na lista abaixo. Você pode editá-lo clicando no ícone de editar.`,
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
      Alert.alert('Erro', 'Erro ao cadastrar líder');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // Verificar se há dados preenchidos
    const temDados = nome || email || senha || confirmarSenha || departamento || cargo;
    
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
    <MainLayout title="Cadastrar Gestor" showBackButton={true}>
      <ScrollView style={styles.content} ref={scrollViewRef}>
        <View style={styles.header}>
          <Paragraph>Cadastre um novo gestor para gerenciar uma equipe</Paragraph>
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

            <View style={styles.inputContainer}>
              <TextInput
                label="Senha *"
                value={senha}
                onChangeText={validarSenha}
                style={styles.input}
                mode="outlined"
                secureTextEntry={!senhaVisible}
                error={!!senhaError}
                right={
                  <TextInput.Icon
                    icon={senhaVisible ? "eye-off" : "eye"}
                    onPress={() => setSenhaVisible(!senhaVisible)}
                  />
                }
              />
              <HelperText type={senhaError ? "error" : "info"} visible={true}>
                {senhaError || "Mínimo de 6 caracteres"}
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Confirmar Senha *"
                value={confirmarSenha}
                onChangeText={validarConfirmacaoSenha}
                style={styles.input}
                mode="outlined"
                secureTextEntry={!confirmarSenhaVisible}
                error={!!confirmarSenhaError}
                right={
                  <TextInput.Icon
                    icon={confirmarSenhaVisible ? "eye-off" : "eye"}
                    onPress={() => setConfirmarSenhaVisible(!confirmarSenhaVisible)}
                  />
                }
              />
              <HelperText type={confirmarSenhaError ? "error" : "info"} visible={true}>
                {confirmarSenhaError || "Digite a mesma senha"}
              </HelperText>
            </View>

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
              placeholder="Ex: Líder de Vendas, Gerente de Marketing"
            />

            <View style={styles.infoCard}>
              <Title style={styles.infoTitle}>ℹ️ Informações</Title>
              <Paragraph style={styles.infoText}>
                • O líder poderá gerenciar funcionários atribuídos a ele{'\n'}
                • Ele receberá permissões para criar e atribuir tarefas{'\n'}
                • Poderá visualizar relatórios da sua equipe
              </Paragraph>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancelar}
                style={styles.cancelButton}
                icon={() => <UniversalIcon name="arrow-left" size={20} color="#1976d2" />}
              >
                Voltar
              </Button>

              <Button
                mode="contained"
                onPress={handleCadastro}
                loading={loading}
                style={styles.saveButton}
                icon="check"
              >
                Cadastrar Líder
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Lista de Líderes Cadastrados */}
        <Card style={styles.listCard}>
          <Card.Content>
            <Title style={styles.listTitle}>
              👥 Gestores Cadastrados ({gestores.length})
            </Title>
            
            {gestores.length === 0 ? (
              <View style={styles.emptyState}>
                <Paragraph style={styles.emptyText}>
                  Nenhum gestor cadastrado ainda.{'\n'}
                  Cadastre o primeiro gestor para começar!
                </Paragraph>
              </View>
            ) : (
              <View style={styles.gestoresList} ref={listCardRef}>
                {gestores.map((gestor, index) => (
                  <View key={gestor.id}>
                    <List.Item
                      title={gestor.nome}
                      description={`${gestor.cargo} • ${gestor.departamento} • ${gestor.email}${!gestor.ativo ? ' (Inativo)' : ''}`}
                      left={() => (
                        <Avatar.Text 
                          size={40} 
                          label={gestor.nome.charAt(0).toUpperCase()}
                          style={[styles.avatar, !gestor.ativo && styles.avatarInativo]}
                        />
                      )}
                      right={() => (
                        <View style={styles.gestorActions}>
                          {!gestor.ativo && (
                            <Chip 
                              mode="outlined" 
                              compact
                              style={styles.chipInativo}
                              textStyle={styles.chipInativoText}
                            >
                              Inativo
                            </Chip>
                          )}
                          <Chip 
                            mode="outlined" 
                            compact
                            style={styles.chip}
                          >
                            {gestor.equipe?.length || 0} funcionários
                          </Chip>
                          <IconButton
                            icon="pencil"
                            size={20}
                            iconColor="#1976d2"
                            onPress={() => router.push(`/(colaboradores)/editar-lider?gestorId=${gestor.id}`)}
                            style={styles.editButton}
                          />
                        </View>
                      )}
                      style={[styles.listItem, !gestor.ativo && styles.listItemInativo]}
                    />
                    {index < gestores.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </MainLayout>
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
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
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
  gestoresList: {
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  avatar: {
    backgroundColor: '#1976d2',
  },
  avatarInativo: {
    backgroundColor: '#9e9e9e',
    opacity: 0.6,
  },
  gestorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: '#e3f2fd',
  },
  chipInativo: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  chipInativoText: {
    color: '#f44336',
    fontSize: 11,
  },
  listItemInativo: {
    opacity: 0.7,
  },
  editButton: {
    margin: 0,
  },
});
