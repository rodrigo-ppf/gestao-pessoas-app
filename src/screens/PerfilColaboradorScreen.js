import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    Paragraph,
    Title
} from 'react-native-paper';

export default function PerfilColaboradorScreen({ navigation, route }) {
  const { colaborador } = route.params;

  const getPerfilColor = (perfil) => {
    switch (perfil) {
      case 'admin_empresa': return '#d32f2f';
      case 'responsavel': return '#f57c00';
      case 'colaborador': return '#388e3c';
      default: return '#666';
    }
  };

  const getPerfilLabel = (perfil) => {
    switch (perfil) {
      case 'admin_empresa': return 'Admin Empresa';
      case 'responsavel': return 'Responsável';
      case 'colaborador': return 'Colaborador';
      default: return perfil;
    }
  };

  const getStatusColor = (status) => {
    return status === 'ativo' ? '#4caf50' : '#f44336';
  };

  const handleEdit = () => {
    navigation.navigate('EditarColaborador', { colaborador });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o colaborador ${colaborador.nomeUsuario}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar exclusão
            Alert.alert('Sucesso', 'Colaborador excluído com sucesso!');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Perfil do Colaborador</Title>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Title style={styles.nome}>{colaborador.nomeUsuario}</Title>
              <Paragraph style={styles.codigo}>{colaborador.codigoUsuario}</Paragraph>
              <Paragraph style={styles.cargo}>{colaborador.cargo}</Paragraph>
            </View>
            
            <View style={styles.statusContainer}>
              <Chip
                style={[styles.perfilChip, { backgroundColor: getPerfilColor(colaborador.perfil) }]}
                textStyle={styles.perfilChipText}
              >
                {getPerfilLabel(colaborador.perfil)}
              </Chip>
              
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(colaborador.status) }]}
                textStyle={styles.statusChipText}
              >
                {colaborador.status}
              </Chip>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Informações Pessoais</Title>
            
            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>Email:</Paragraph>
              <Paragraph style={styles.infoValue}>{colaborador.email}</Paragraph>
            </View>

            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>Data de Entrada:</Paragraph>
              <Paragraph style={styles.infoValue}>{colaborador.dataEntrada}</Paragraph>
            </View>

            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>Status:</Paragraph>
              <Paragraph style={styles.infoValue}>{colaborador.status}</Paragraph>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Informações Adicionais</Title>
            
            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>Telefone:</Paragraph>
              <Paragraph style={styles.infoValue}>-</Paragraph>
            </View>

            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>Endereço:</Paragraph>
              <Paragraph style={styles.infoValue}>-</Paragraph>
            </View>

            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>Data de Nascimento:</Paragraph>
              <Paragraph style={styles.infoValue}>-</Paragraph>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Estatísticas</Title>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Paragraph style={styles.statNumber}>0</Paragraph>
                <Paragraph style={styles.statLabel}>Tarefas Concluídas</Paragraph>
              </View>
              
              <View style={styles.statItem}>
                <Paragraph style={styles.statNumber}>0</Paragraph>
                <Paragraph style={styles.statLabel}>Dias Trabalhados</Paragraph>
              </View>
              
              <View style={styles.statItem}>
                <Paragraph style={styles.statNumber}>0</Paragraph>
                <Paragraph style={styles.statLabel}>Solicitações</Paragraph>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={handleEdit}
          style={styles.actionButton}
          icon="pencil"
        >
          Editar
        </Button>
        
        <Button
          mode="contained"
          onPress={handleDelete}
          style={[styles.actionButton, styles.deleteButton]}
          icon="delete"
          buttonColor="#f44336"
        >
          Excluir
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
  },
  headerTitle: {
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nome: {
    fontSize: 24,
    marginBottom: 4,
    color: '#1976d2',
  },
  codigo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cargo: {
    fontSize: 16,
    color: '#333',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  perfilChip: {
    marginBottom: 8,
  },
  perfilChipText: {
    color: '#fff',
    fontSize: 12,
  },
  statusChip: {
    marginBottom: 0,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 12,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
  },
  infoValue: {
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    // Estilo específico para botão de exclusão
  },
});
