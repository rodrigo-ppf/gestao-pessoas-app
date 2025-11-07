import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';

export default function SelecionarEmpresaScreen() {
  const { user, selectEmpresa } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    if (!user?.email) return;

    try {
      const empresasData = MockDataService.getEmpresasByResponsavel(user.email);
      setEmpresas(empresasData);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleSelecionarEmpresa = async (empresaId: string) => {
    setLoading(true);
    
    try {
      // Salvar a empresa selecionada no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('empresaSelecionada', empresaId);
      }
      
      Alert.alert(
        'Sucesso!',
        'Empresa selecionada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/home')
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao selecionar empresa:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a empresa.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    router.replace('/login');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Erro</Title>
            <Paragraph>Usuário não encontrado. Redirecionando para login...</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Selecionar Empresa</Title>
          <Paragraph>
            Olá! O email {user.email} é responsável por múltiplas empresas. 
            Selecione qual empresa deseja administrar:
          </Paragraph>
        </View>

        <View style={styles.empresasContainer}>
          {empresas.map((empresa) => (
            <Card key={empresa.id} style={styles.empresaCard}>
              <Card.Content>
                <Title style={styles.empresaNome}>{empresa.nome}</Title>
                <Paragraph style={styles.empresaInfo}>
                  <Paragraph style={styles.label}>Código:</Paragraph> {empresa.codigo}
                </Paragraph>
                <Paragraph style={styles.empresaInfo}>
                  <Paragraph style={styles.label}>CNPJ:</Paragraph> {empresa.cnpj}
                </Paragraph>
                <Paragraph style={styles.empresaInfo}>
                  <Paragraph style={styles.label}>Responsável:</Paragraph> {empresa.responsavel}
                </Paragraph>
                
                <Button
                  mode="contained"
                  onPress={() => handleSelecionarEmpresa(empresa.id)}
                  loading={loading}
                  style={styles.selecionarButton}
                  icon="check"
                >
                  Selecionar
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleVoltar}
            style={styles.voltarButton}
            icon="arrow-left"
          >
            Voltar ao Login
          </Button>
        </View>
      </ScrollView>
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
  empresasContainer: {
    padding: 16,
  },
  empresaCard: {
    marginBottom: 16,
    elevation: 2,
  },
  empresaNome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  empresaInfo: {
    marginBottom: 4,
    fontSize: 14,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  selecionarButton: {
    marginTop: 12,
  },
  buttonContainer: {
    padding: 16,
  },
  voltarButton: {
    paddingVertical: 5,
  },
});
