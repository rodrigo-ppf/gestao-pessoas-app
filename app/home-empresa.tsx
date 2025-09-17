import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Paragraph, Title } from 'react-native-paper';

export default function HomeEmpresaScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [empresa, setEmpresa] = useState<any>(null);

  useEffect(() => {
    if (user?.empresaId) {
      const empresaData = MockDataService.getEmpresaById(user.empresaId);
      setEmpresa(empresaData);
    }
  }, [user]);

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return '#f44336';
      case 'admin_empresa':
        return '#f39c12';
      case 'colaborador':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return t('profiles.systemAdmin');
      case 'admin_empresa':
        return t('profiles.companyAdmin');
      case 'colaborador':
        return t('profiles.collaborator');
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
      title: 'Cadastrar Administrador',
      description: 'Criar conta para administrador da empresa',
      icon: 'account-plus',
      onPress: () => router.push('/cadastro-usuario'),
      show: user?.perfil === 'admin_empresa' || user?.perfil === 'admin_sistema'
    },
    {
      title: 'Gerenciar Colaboradores',
      description: 'Visualizar e gerenciar colaboradores',
      icon: 'account-group',
      onPress: () => router.push('/colaboradores'),
      show: user?.perfil === 'admin_empresa' || user?.perfil === 'admin_sistema'
    },
    {
      title: 'Criar Tarefa',
      description: 'Criar nova tarefa para colaboradores',
      icon: 'plus',
      onPress: () => router.push('/criar-tarefa'),
      show: user?.perfil === 'admin_empresa' || user?.perfil === 'admin_sistema'
    },
    {
      title: 'Visualizar Tarefas',
      description: 'Ver todas as tarefas da empresa',
      icon: 'clipboard-list',
      onPress: () => router.push('/tarefas'),
      show: user?.perfil === 'admin_empresa' || user?.perfil === 'admin_sistema'
    }
  ].filter(item => item.show);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Bem-vindo à sua Empresa</Title>
          <Paragraph>Gerencie sua empresa e colaboradores</Paragraph>
          
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

          {empresa && (
            <Card style={styles.empresaCard}>
              <Card.Content>
                <Title style={styles.empresaTitle}>🏢 {empresa.nome}</Title>
                <Paragraph style={styles.empresaInfo}>
                  <Paragraph style={styles.label}>Código:</Paragraph> {empresa.codigo}
                </Paragraph>
                <Paragraph style={styles.empresaInfo}>
                  <Paragraph style={styles.label}>CNPJ:</Paragraph> {empresa.cnpj}
                </Paragraph>
                <Paragraph style={styles.empresaInfo}>
                  <Paragraph style={styles.label}>Email:</Paragraph> {empresa.email}
                </Paragraph>
                <Paragraph style={styles.empresaInfo}>
                  <Paragraph style={styles.label}>Status:</Paragraph> 
                  <Chip 
                    style={[styles.statusChip, { backgroundColor: '#4caf50' }]}
                    textStyle={styles.chipText}
                  >
                    Ativa
                  </Chip>
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>

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

        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>🎉 Parabéns!</Title>
            <Paragraph style={styles.welcomeText}>
              Sua empresa foi cadastrada e verificada com sucesso! 
              Agora você pode começar a gerenciar seus colaboradores e tarefas.
            </Paragraph>
            <Paragraph style={styles.nextStepsTitle}>Próximos passos:</Paragraph>
            <Paragraph style={styles.nextSteps}>
              1. Cadastre um administrador da empresa{'\n'}
              2. Crie colaboradores{'\n'}
              3. Defina tarefas e projetos{'\n'}
              4. Gerencie o dia a dia da empresa
            </Paragraph>
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
  userCard: {
    marginTop: 16,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
    marginBottom: 2,
  },
  userCompany: {
    color: '#666',
    fontSize: 14,
  },
  perfilChip: {
    marginLeft: 12,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  logoutButton: {
    marginTop: 8,
  },
  empresaCard: {
    marginTop: 16,
    elevation: 2,
    backgroundColor: '#e8f5e8',
  },
  empresaTitle: {
    fontSize: 20,
    color: '#2e7d32',
    marginBottom: 12,
  },
  empresaInfo: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusChip: {
    marginLeft: 8,
  },
  menuGrid: {
    padding: 16,
  },
  menuCard: {
    marginBottom: 16,
    elevation: 2,
  },
  menuContent: {
    padding: 16,
  },
  menuTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  menuDescription: {
    color: '#666',
    fontSize: 14,
  },
  welcomeCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#e8f4fd',
  },
  welcomeTitle: {
    fontSize: 20,
    color: '#2c3e50',
    marginBottom: 12,
  },
  welcomeText: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  nextStepsTitle: {
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 8,
  },
  nextSteps: {
    color: '#666',
    lineHeight: 18,
  },
});
