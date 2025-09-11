import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Divider, List, Paragraph, TextInput, Title } from 'react-native-paper';

export default function CadastroLiderScreen() {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [cargo, setCargo] = useState('');
  const [loading, setLoading] = useState(false);
  const [lideres, setLideres] = useState<any[]>([]);
  const { t } = useTranslation();
  
  // Estados para feedback visual
  const [senhaError, setSenhaError] = useState('');
  const [confirmarSenhaError, setConfirmarSenhaError] = useState('');
  
  // Estados para visibilidade das senhas
  const [senhaVisible, setSenhaVisible] = useState(false);
  const [confirmarSenhaVisible, setConfirmarSenhaVisible] = useState(false);

  useEffect(() => {
    carregarLideres();
  }, []);

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

  const carregarLideres = () => {
    console.log('CadastroLider: Carregando líderes...');
    if (user?.empresaId) {
      const usuarios = MockDataService.getUsuariosByEmpresa(user.empresaId);
      console.log('CadastroLider: Usuários da empresa:', usuarios);
      const lideresEmpresa = usuarios.filter(u => u.perfil === 'lider');
      console.log('CadastroLider: Líderes encontrados:', lideresEmpresa);
      setLideres(lideresEmpresa);
    }
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

    setLoading(true);

    try {
      console.log('CadastroLider: Criando novo líder...');
      console.log('Dados do líder:', { nome, email, departamento, cargo, empresaId: user?.empresaId });
      
      const novoLider = await MockDataService.createUsuario({
        nome,
        email,
        senha,
        perfil: 'lider',
        empresaId: user?.empresaId || '',
        departamento,
        cargo,
        avatar: '👨‍💼',
        ativo: true,
        equipe: []
      });

      console.log('CadastroLider: Líder criado:', novoLider);

      // Limpar formulário
      limparFormulario();

      // Atualizar lista de líderes
      carregarLideres();

      Alert.alert(
        '✅ Sucesso!',
        `Líder ${novoLider.nome} cadastrado com sucesso!\n\nDeseja cadastrar outro líder?`,
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
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Cadastrar Líder</Title>
          <Paragraph>Cadastre um novo líder para gerenciar uma equipe</Paragraph>
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
              👥 Líderes Cadastrados ({lideres.length})
            </Title>
            
            {lideres.length === 0 ? (
              <View style={styles.emptyState}>
                <Paragraph style={styles.emptyText}>
                  Nenhum líder cadastrado ainda.{'\n'}
                  Cadastre o primeiro líder para começar!
                </Paragraph>
              </View>
            ) : (
              <View style={styles.leadersList}>
                {lideres.map((lider, index) => (
                  <View key={lider.id}>
                    <List.Item
                      title={lider.nome}
                      description={`${lider.cargo} • ${lider.departamento}`}
                      left={() => (
                        <Avatar.Text 
                          size={40} 
                          label={lider.nome.charAt(0).toUpperCase()}
                          style={styles.avatar}
                        />
                      )}
                      right={() => (
                        <View style={styles.leaderInfo}>
                          <Chip 
                            mode="outlined" 
                            compact
                            style={styles.chip}
                          >
                            {lider.equipe?.length || 0} funcionários
                          </Chip>
                        </View>
                      )}
                      style={styles.listItem}
                    />
                    {index < lideres.length - 1 && <Divider />}
                  </View>
                ))}
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
  leadersList: {
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  avatar: {
    backgroundColor: '#1976d2',
  },
  leaderInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#e3f2fd',
  },
});
