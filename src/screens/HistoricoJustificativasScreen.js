import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    DataTable,
    Paragraph,
    Searchbar,
    Title
} from 'react-native-paper';

// Dados mockados para demonstração
const mockHistoricoJustificativas = [
  {
    id: 1,
    tipoJustificativa: 'atraso',
    dataOcorrencia: '2024-01-10',
    descricao: 'Atraso devido a problemas de trânsito',
    status: 'aprovado',
    dataSolicitacao: '2024-01-10',
    aprovador: 'Maria Silva'
  },
  {
    id: 2,
    tipoJustificativa: 'falta',
    dataOcorrencia: '2024-01-08',
    descricao: 'Falta por motivo médico',
    status: 'aprovado',
    dataSolicitacao: '2024-01-08',
    aprovador: 'João Santos'
  },
  {
    id: 3,
    tipoJustificativa: 'horas_extras',
    dataOcorrencia: '2024-01-05',
    descricao: 'Horas extras trabalhadas',
    status: 'rejeitado',
    dataSolicitacao: '2024-01-05',
    aprovador: 'Pedro Costa',
    motivoRejeicao: 'Não autorizado'
  }
];

export default function HistoricoJustificativasScreen({ navigation }) {
  const [historico, setHistorico] = useState(mockHistoricoJustificativas);
  const [filteredHistorico, setFilteredHistorico] = useState(mockHistoricoJustificativas);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    filterHistorico();
  }, [searchQuery, filterStatus, historico]);

  const filterHistorico = () => {
    let filtered = historico;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.tipoJustificativa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aprovador.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'todos') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    setFilteredHistorico(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado': return '#4caf50';
      case 'pendente': return '#ff9800';
      case 'rejeitado': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'pendente': return 'Pendente';
      case 'rejeitado': return 'Rejeitado';
      default: return status;
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'atraso': return 'Atraso';
      case 'falta': return 'Falta';
      case 'saida_antecipada': return 'Saída Antecipada';
      case 'horas_extras': return 'Horas Extras';
      case 'outros': return 'Outros';
      default: return tipo;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getApprovedCount = () => {
    return filteredHistorico.filter(item => item.status === 'aprovado').length;
  };

  const getRejectedCount = () => {
    return filteredHistorico.filter(item => item.status === 'rejeitado').length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Histórico de Justificativas</Title>
        <Paragraph>Visualize seu histórico de justificativas</Paragraph>
      </View>

      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar justificativas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <Chip
            selected={filterStatus === 'todos'}
            onPress={() => setFilterStatus('todos')}
            style={styles.chip}
          >
            Todos
          </Chip>
          <Chip
            selected={filterStatus === 'aprovado'}
            onPress={() => setFilterStatus('aprovado')}
            style={styles.chip}
          >
            Aprovados
          </Chip>
          <Chip
            selected={filterStatus === 'rejeitado'}
            onPress={() => setFilterStatus('rejeitado')}
            style={styles.chip}
          >
            Rejeitados
          </Chip>
        </ScrollView>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>{getApprovedCount()}</Title>
            <Paragraph style={styles.statLabel}>Aprovados</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>{getRejectedCount()}</Title>
            <Paragraph style={styles.statLabel}>Rejeitados</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <ScrollView style={styles.content}>
        {filteredHistorico.length > 0 ? (
          <DataTable style={styles.dataTable}>
            <DataTable.Header>
              <DataTable.Title>Tipo</DataTable.Title>
              <DataTable.Title>Data</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Aprovador</DataTable.Title>
            </DataTable.Header>

            {filteredHistorico.map((item) => (
              <DataTable.Row key={item.id}>
                <DataTable.Cell>{getTipoLabel(item.tipoJustificativa)}</DataTable.Cell>
                <DataTable.Cell>{formatDate(item.dataOcorrencia)}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(item.status)}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Paragraph style={styles.aprovador}>{item.aprovador}</Paragraph>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>Nenhum registro encontrado</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery || filterStatus !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Nenhuma justificativa encontrada'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('UploadDocumento')}
          style={styles.actionButton}
          icon="upload"
        >
          Nova Justificativa
        </Button>
      </View>
    </View>
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
  title: {
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dataTable: {
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 8,
  },
  statusChip: {
    marginVertical: 2,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 10,
  },
  aprovador: {
    fontSize: 10,
    color: '#666',
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    paddingVertical: 8,
  },
});
