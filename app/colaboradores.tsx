import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService, { Usuario } from '@/src/services/MockDataService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';

export default function ColaboradoresScreen() {
  const { user } = useAuth();
  const [colaboradores, setColaboradores] = useState<Usuario[]>([]);

  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = () => {
    if (user?.perfil === 'admin_sistema') {
      setColaboradores(MockDataService.getUsuarios());
    } else {
      setColaboradores(MockDataService.getUsuariosByEmpresa(user?.empresaId || ''));
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return 'Admin Sistema';
      case 'admin_empresa':
        return 'Admin Empresa';
      case 'colaborador':
        return 'Colaborador';
      default:
        return perfil;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Colaboradores</Title>
          <Paragraph>Gerencie os colaboradores da empresa</Paragraph>
        </View>

        <View style={styles.list}>
          {colaboradores.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>Nenhum colaborador encontrado</Title>
                <Paragraph style={styles.emptyText}>
                  Cadastre novos usuários para começar.
                </Paragraph>
              </Card.Content>
            </Card>
          ) : (
            colaboradores.map((colaborador) => (
              <Card key={colaborador.id} style={styles.card}>
                <Card.Content>
                  <Title style={styles.cardTitle}>
                    {colaborador.avatar} {colaborador.nome}
                  </Title>
                  <Paragraph style={styles.cardInfo}>
                    <Paragraph style={styles.label}>Cargo:</Paragraph> {colaborador.cargo}
                  </Paragraph>
                  <Paragraph style={styles.cardInfo}>
                    <Paragraph style={styles.label}>Departamento:</Paragraph> {colaborador.departamento}
                  </Paragraph>
                  <Paragraph style={styles.cardInfo}>
                    <Paragraph style={styles.label}>Perfil:</Paragraph> {getPerfilLabel(colaborador.perfil)}
                  </Paragraph>
                  <Paragraph style={styles.cardInfo}>
                    <Paragraph style={styles.label}>Email:</Paragraph> {colaborador.email}
                  </Paragraph>
                  <Paragraph style={styles.cardInfo}>
                    <Paragraph style={styles.label}>Status:</Paragraph> {colaborador.ativo ? 'Ativo' : 'Inativo'}
                  </Paragraph>
                </Card.Content>
                <Card.Actions>
                  <Button 
                    mode="outlined" 
                    compact
                    onPress={() => router.push(`/editar-funcionario?funcionarioId=${colaborador.id}`)}
                  >
                    Editar
                  </Button>
                  <Button mode="contained" compact>
                    Ver Perfil
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
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
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  emptyCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#f9f9f9',
  },
  emptyTitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  cardInfo: {
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
});
