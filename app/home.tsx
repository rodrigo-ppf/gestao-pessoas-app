import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
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
    if (user?.empresaId) {
      const usuarios = MockDataService.getUsuariosByEmpresa(user.empresaId);
      const funcionarios = usuarios.filter(u => u.perfil === 'funcionario');
      const lideres = usuarios.filter(u => u.perfil === 'lider');
      
      setHasFuncionarios(funcionarios.length > 0);
      setHasLideres(lideres.length > 0);
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


        {/* Seção especial para dono da empresa sem funcionários */}
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
