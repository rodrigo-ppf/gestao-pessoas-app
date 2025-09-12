import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Divider, List, Paragraph, TextInput, Title } from 'react-native-paper';

export default function EditarLiderScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { liderId } = useLocalSearchParams();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [cargo, setCargo] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lider, setLider] = useState<any>(null);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, [liderId]);

  useEffect(() => {
    checkForChanges();
  }, [nome, email, departamento, cargo, senha, confirmarSenha, lider]);

  const carregarDados = () => {
    if (liderId && user?.empresaId) {
      const liderEncontrado = MockDataService.getUsuarioById(liderId as string);
      if (liderEncontrado) {
        setLider(liderEncontrado);
        setNome(liderEncontrado.nome);
        setEmail(liderEncontrado.email);
        setDepartamento(liderEncontrado.departamento || '');
        setCargo(liderEncontrado.cargo || '');
        
        // Carregar funcionários do líder
        const usuarios = MockDataService.getUsuariosByEmpresa(user.empresaId);
        const funcionariosDoLider = usuarios.filter(u => u.perfil === 'funcionario' && u.liderId === liderId);
        setFuncionarios(funcionariosDoLider);
      }
    }
  };

  const handleSalvar = async () => {
    if (!nome || !email || !departamento || !cargo) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (senha && senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const dadosAtualizados: any = {
        nome,
        email,
        departamento,
        cargo
      };

      // Só atualizar senha se foi preenchida
      if (senha) {
        dadosAtualizados.senha = senha;
      }

      // Simular operação de salvamento (substituir pela implementação real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Implementar atualização no banco de dados real
      // const liderAtualizado = await MockDataService.updateUsuario(liderId as string, dadosAtualizados);
      
      setHasChanges(false);
      
      Alert.alert(
        '✅ Sucesso!',
        `Líder ${nome} atualizado com sucesso!`,
        [
          {
            text: 'Continuar Editando',
            style: 'cancel'
          },
          {
            text: 'Voltar à Lista',
            onPress: () => router.push('/gerenciar-equipe')
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar líder:', error);
      Alert.alert(
        '❌ Erro',
        'Não foi possível salvar as alterações. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkForChanges = () => {
    const temAlteracoes = 
      nome !== lider?.nome ||
      email !== lider?.email ||
      departamento !== lider?.departamento ||
      cargo !== lider?.cargo ||
      senha ||
      confirmarSenha;
    
    setHasChanges(temAlteracoes);
  };

  const handleCancelar = () => {
    if (hasChanges) {
      Alert.alert(
        '⚠️ Descartar Alterações',
        'Você tem alterações não salvas.\n\nDeseja realmente descartar e voltar?',
        [
          {
            text: 'Continuar Editando',
            style: 'cancel'
          },
          {
            text: 'Descartar e Voltar',
            style: 'destructive',
            onPress: () => router.push('/gerenciar-equipe')
          }
        ]
      );
    } else {
      router.push('/gerenciar-equipe');
    }
  };

  if (!lider) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Title>Carregando...</Title>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Editar Líder</Title>
          <Paragraph>Edite as informações do líder</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            {hasChanges && (
              <View style={styles.changesIndicator}>
                <Paragraph style={styles.changesText}>
                  ⚠️ Você tem alterações não salvas
                </Paragraph>
              </View>
            )}

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
              label="Nova Senha (deixe em branco para manter a atual)"
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />

            <TextInput
              label="Confirmar Nova Senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              style={styles.input}
              mode="outlined"
              secureTextEntry
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
                • Deixe a senha em branco para manter a senha atual{'\n'}
                • As alterações serão aplicadas imediatamente{'\n'}
                • O líder manterá sua equipe atual
              </Paragraph>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancelar}
                style={styles.cancelButton}
                icon="arrow-left"
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                mode="contained"
                onPress={handleSalvar}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
                icon="check"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Lista de Funcionários do Líder */}
        <Card style={styles.listCard}>
          <Card.Content>
            <Title style={styles.listTitle}>
              👷 Funcionários sob Liderança ({funcionarios.length})
            </Title>
            
            {funcionarios.length === 0 ? (
              <View style={styles.emptyState}>
                <Paragraph style={styles.emptyText}>
                  Este líder não possui funcionários atribuídos.
                </Paragraph>
              </View>
            ) : (
              <View style={styles.employeesList}>
                {funcionarios.map((funcionario, index) => (
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
                            Funcionário
                          </Chip>
                        </View>
                      )}
                      style={styles.listItem}
                    />
                    {index < funcionarios.length - 1 && <Divider />}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  changesIndicator: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  changesText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    margin: 0,
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
