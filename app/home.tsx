import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import StorageService from '@/src/services/StorageService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    Paragraph,
    Title
} from 'react-native-paper';

export default function HomeScreen() {
  const { user, logout, login } = useAuth();
  const { t } = useTranslation();
  const [hasFuncionarios, setHasFuncionarios] = useState(false);
  const [hasLideres, setHasLideres] = useState(false);

  useEffect(() => {
    console.log('HomeScreen - useEffect executado');
    console.log('User:', user);
    console.log('User perfil:', user?.perfil);
    console.log('User empresaId:', user?.empresaId);
    console.log('User é null?', user === null);
    console.log('User é undefined?', user === undefined);
    
    if (user?.empresaId) {
      const usuarios = MockDataService.getUsuariosByEmpresa(user.empresaId);
      console.log('Usuários da empresa:', usuarios);
      
      const funcionarios = usuarios.filter(u => u.perfil === 'funcionario');
      const lideres = usuarios.filter(u => u.perfil === 'lider');
      
      console.log('Funcionários encontrados:', funcionarios);
      console.log('Líderes encontrados:', lideres);
      
      setHasFuncionarios(funcionarios.length > 0);
      setHasLideres(lideres.length > 0);
      
      console.log('hasFuncionarios:', funcionarios.length > 0);
      console.log('hasLideres:', lideres.length > 0);
    } else {
      console.log('Usuário não tem empresaId ou é null/undefined');
    }
  }, [user]);

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return '#f44336';
      case 'dono_empresa':
        return '#9c27b0';
      case 'lider':
        return '#ff9800';
      case 'funcionario':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return t('profiles.systemAdmin');
      case 'dono_empresa':
        return 'Dono da Empresa';
      case 'lider':
        return 'Líder';
      case 'funcionario':
        return 'Funcionário';
      default:
        return perfil;
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const menuItems = [
    {
      title: 'Empresas',
      description: 'Gerenciar empresas cadastradas',
      icon: 'domain',
      onPress: () => router.push('/company-list'),
      show: user?.perfil === 'admin_sistema'
    },
    {
      title: 'Gerenciar Equipe',
      description: 'Gerenciar líderes e funcionários',
      icon: 'account-group',
      onPress: () => router.push('/gerenciar-equipe'),
      show: user?.perfil === 'dono_empresa'
    },
    {
      title: 'Colaboradores',
      description: 'Gerenciar colaboradores',
      icon: 'account-group',
      onPress: () => router.push('/colaboradores'),
      show: user?.perfil === 'admin_sistema'
    },
    {
      title: 'Tarefas',
      description: 'Gerenciar tarefas',
      icon: 'clipboard-list',
      onPress: () => router.push('/tarefas'),
      show: true
    },
    {
      title: 'Ponto',
      description: 'Registrar ponto',
      icon: 'clock',
      onPress: () => router.push('/registrar-ponto'),
      show: true
    },
  ].filter(item => item.show);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>{t('home.welcome')}</Title>
          <Paragraph>{t('home.subtitle')}</Paragraph>
          
          {user && (
            <Card style={styles.userCard}>
              <Card.Content>
                <View style={styles.userInfo}>
                  <View style={styles.userDetails}>
                    <Title style={styles.userName}>
                      {user.avatar} {user.nome}
                    </Title>
                    <Paragraph style={styles.userEmail}>
                      {user.email}
                    </Paragraph>
                    <Paragraph style={styles.userCompany}>
                      {user.cargo} - {user.departamento}
                    </Paragraph>
                  </View>
                  <Chip 
                    style={[styles.perfilChip, { backgroundColor: getPerfilColor(user.perfil) }]}
                    textStyle={styles.chipText}
                  >
                    {getPerfilLabel(user.perfil)}
                  </Chip>
                </View>
                       <Button
                         mode="outlined"
                         onPress={handleLogout}
                         style={styles.logoutButton}
                         compact
                       >
                         {t('auth.logout')}
                       </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Botão de teste para debug */}
        <View style={styles.debugSection}>
          <Button
            mode="outlined"
            onPress={() => {
              console.log('=== DEBUG INFO ===');
              console.log('User:', user);
              console.log('User perfil:', user?.perfil);
              console.log('hasFuncionarios:', hasFuncionarios);
              console.log('hasLideres:', hasLideres);
              console.log('Condição dono_empresa:', user?.perfil === 'dono_empresa');
              console.log('Condição !hasFuncionarios:', !hasFuncionarios);
              console.log('Condição completa:', user?.perfil === 'dono_empresa' && !hasFuncionarios);
            }}
            style={styles.debugButton}
          >
            Debug Info
          </Button>
          
          <Button
            mode="contained"
            onPress={async () => {
              console.log('=== TESTE LOGIN DONO_EMPRESA ===');
              try {
                const success = await login('dono@empresa.com', '123456');
                console.log('Login resultado:', success);
                if (success) {
                  console.log('Login bem-sucedido! Recarregando página...');
                  // Forçar recarregamento da página
                  window.location.reload();
                }
              } catch (error) {
                console.error('Erro no login de teste:', error);
              }
            }}
            style={[styles.debugButton, { backgroundColor: '#4caf50', marginTop: 8 }]}
          >
            Teste Login Dono Empresa
          </Button>
          
          <Button
            mode="contained"
            onPress={async () => {
              console.log('=== RESETANDO DADOS ===');
              try {
                await MockDataService.resetData();
                console.log('Dados resetados! Recarregando página...');
                window.location.reload();
              } catch (error) {
                console.error('Erro ao resetar dados:', error);
              }
            }}
            style={[styles.debugButton, { backgroundColor: '#ff9800', marginTop: 8 }]}
          >
            Resetar Dados
          </Button>
          
          <Button
            mode="contained"
            onPress={async () => {
              console.log('=== FORÇANDO INICIALIZAÇÃO ===');
              try {
                console.log('Forçando inicialização dos dados padrão...');
                await MockDataService.initializeDefaultData();
                console.log('Inicialização forçada concluída!');
                
                // Verificar se os usuários foram criados
                const usuarios = MockDataService.getUsuarios();
                console.log('Usuários após inicialização:', usuarios);
                
                const donoEmpresa = usuarios.find(u => u.perfil === 'dono_empresa');
                console.log('Dono empresa encontrado:', donoEmpresa);
              } catch (error) {
                console.error('Erro ao forçar inicialização:', error);
              }
            }}
            style={[styles.debugButton, { backgroundColor: '#795548', marginTop: 8 }]}
          >
            Forçar Inicialização
          </Button>
          
          <Button
            mode="contained"
            onPress={async () => {
              console.log('=== VERIFICANDO STORAGE ===');
              try {
                const userId = await StorageService.getItem('userId');
                const userEmail = await StorageService.getItem('userEmail');
                const userPerfil = await StorageService.getItem('userPerfil');
                const empresaId = await StorageService.getItem('empresaId');
                
                console.log('Storage userId:', userId);
                console.log('Storage userEmail:', userEmail);
                console.log('Storage userPerfil:', userPerfil);
                console.log('Storage empresaId:', empresaId);
                
                if (userId) {
                  const userData = MockDataService.getUsuarioById(userId);
                  console.log('Usuário encontrado no MockDataService:', userData);
                }
              } catch (error) {
                console.error('Erro ao verificar Storage:', error);
              }
            }}
            style={[styles.debugButton, { backgroundColor: '#9c27b0', marginTop: 8 }]}
          >
            Verificar Storage
          </Button>
          
          <Button
            mode="contained"
            onPress={async () => {
              console.log('=== VERIFICANDO USUÁRIOS ===');
              try {
                const todosUsuarios = MockDataService.getUsuarios();
                console.log('Todos os usuários:', todosUsuarios);
                
                const donoEmpresa = todosUsuarios.find(u => u.perfil === 'dono_empresa');
                console.log('Usuário dono_empresa encontrado:', donoEmpresa);
                
                const adminSistema = todosUsuarios.find(u => u.perfil === 'admin_sistema');
                console.log('Usuário admin_sistema encontrado:', adminSistema);
              } catch (error) {
                console.error('Erro ao verificar usuários:', error);
              }
            }}
            style={[styles.debugButton, { backgroundColor: '#607d8b', marginTop: 8 }]}
          >
            Verificar Usuários
          </Button>
          
          <Button
            mode="contained"
            onPress={async () => {
              console.log('=== FORÇANDO LOGIN E SALVANDO ===');
              try {
                // Buscar usuário dono_empresa
                const donoEmpresa = MockDataService.getUsuarios().find(u => u.perfil === 'dono_empresa');
                console.log('Usuário dono_empresa encontrado:', donoEmpresa);
                
                if (donoEmpresa) {
                  // Salvar no Storage
                  await StorageService.setItem('userId', donoEmpresa.id);
                  await StorageService.setItem('userEmail', donoEmpresa.email);
                  await StorageService.setItem('userPerfil', donoEmpresa.perfil);
                  await StorageService.setItem('empresaId', donoEmpresa.empresaId);
                  
                  console.log('Dados salvos no Storage');
                  
                  // Fazer login
                  const success = await login(donoEmpresa.email, donoEmpresa.senha);
                  console.log('Login forçado resultado:', success);
                  
                  if (success) {
                    console.log('Login bem-sucedido! Recarregando página...');
                    window.location.reload();
                  }
                } else {
                  console.log('Usuário dono_empresa não encontrado!');
                }
              } catch (error) {
                console.error('Erro ao forçar login:', error);
              }
            }}
            style={[styles.debugButton, { backgroundColor: '#e91e63', marginTop: 8 }]}
          >
            Forçar Login Dono
          </Button>
          
          <Button
            mode="contained"
            onPress={() => {
              console.log('=== TESTE FORÇAR SEÇÃO ESPECIAL ===');
              console.log('Forçando hasFuncionarios para false...');
              setHasFuncionarios(false);
              setHasLideres(false);
              console.log('hasFuncionarios definido como false');
              console.log('hasLideres definido como false');
            }}
            style={[styles.debugButton, { backgroundColor: '#3f51b5', marginTop: 8 }]}
          >
            Forçar Seção Especial
          </Button>
        </View>

        {/* Seção especial para dono da empresa sem funcionários */}
        {(() => {
          console.log('=== VERIFICANDO CONDIÇÃO DA SEÇÃO ESPECIAL ===');
          console.log('user:', user);
          console.log('user?.perfil:', user?.perfil);
          console.log('hasFuncionarios:', hasFuncionarios);
          console.log('hasLideres:', hasLideres);
          console.log('Condição user?.perfil === "dono_empresa":', user?.perfil === 'dono_empresa');
          console.log('Condição !hasFuncionarios:', !hasFuncionarios);
          console.log('Condição completa:', user?.perfil === 'dono_empresa' && !hasFuncionarios);
          console.log('Tipo de user?.perfil:', typeof user?.perfil);
          console.log('Comparação exata:', user?.perfil === 'dono_empresa');
          return null;
        })()}
        {user?.perfil === 'dono_empresa' && !hasFuncionarios && (
          <View style={styles.welcomeSection}>
            <Card style={styles.welcomeCard}>
              <Card.Content>
                <Title style={styles.welcomeTitle}>🎉 Bem-vindo à sua empresa!</Title>
                <Paragraph style={styles.welcomeText}>
                  Sua empresa foi cadastrada com sucesso! Agora é hora de montar sua equipe.
                </Paragraph>
                
                <View style={styles.actionButtons}>
                  {!hasLideres && (
                    <Button
                      mode="contained"
                      onPress={() => router.push('/cadastro-lider')}
                      style={styles.actionButton}
                      icon="account-plus"
                    >
                      Cadastrar Primeiro Líder
                    </Button>
                  )}
                  
                  <Button
                    mode="outlined"
                    onPress={() => router.push('/cadastro-funcionario')}
                    style={styles.actionButton}
                    icon="account-plus"
                    disabled={!hasLideres}
                  >
                    Cadastrar Funcionário
                  </Button>
                </View>
                
                {!hasLideres && (
                  <Paragraph style={styles.helpText}>
                    💡 Dica: Cadastre um líder primeiro para organizar sua equipe
                  </Paragraph>
                )}
              </Card.Content>
            </Card>
          </View>
        )}

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Card key={index} style={styles.menuCard} onPress={item.onPress}>
              <Card.Content style={styles.menuContent}>
                <Title style={styles.menuTitle}>{item.title}</Title>
                <Paragraph style={styles.menuDescription}>
                  {item.description}
                </Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>
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
  userCard: {
    marginTop: 16,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 12,
    color: '#999',
  },
  perfilChip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  logoutButton: {
    alignSelf: 'flex-end',
  },
  debugSection: {
    padding: 16,
  },
  debugButton: {
    backgroundColor: '#ff5722',
  },
  welcomeSection: {
    padding: 16,
  },
  welcomeCard: {
    elevation: 3,
    backgroundColor: '#f3e5f5',
  },
  welcomeTitle: {
    fontSize: 20,
    color: '#7b1fa2',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  helpText: {
    color: '#7b1fa2',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
  },
  menuGrid: {
    padding: 16,
  },
  menuCard: {
    marginBottom: 16,
    elevation: 2,
  },
  menuContent: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  menuDescription: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
