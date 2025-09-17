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
const mockHistoricoFerias = [
  {
    id: 1,
    dataInicio: '2023-12-01',
    dataFim: '2023-12-15',
    quantidadeDias: 15,
    tipoFerias: 'ferias',
    status: 'aprovado',
    dataSolicitacao: '2023-11-15',
    dataAprovacao: '2023-11-20',
    aprovador: 'Maria Silva'
  },
  {
    id: 2,
    dataInicio: '2023-08-01',
    dataFim: '2023-08-30',
    quantidadeDias: 30,
    tipoFerias: 'ferias',
    status: 'aprovado',
    dataSolicitacao: '2023-07-15',
    dataAprovacao: '2023-07-20',
    aprovador: 'João Santos'
  },
  {
    id: 3,
    dataInicio: '2023-06-01',
    dataFim: '2023-06-10',
    quantidadeDias: 10,
    tipoFerias: 'ferias_antecipadas',
    status: 'rejeitado',
    dataSolicitacao: '2023-05-15',
    dataAprovacao: '2023-05-20',
    aprovador: 'Pedro Costa',
    motivoRejeicao: 'Período de alta demanda'
  },
  {
    id: 4,
    dataInicio: '2023-04-01',
    dataFim: '2023-04-05',
    quantidadeDias: 5,
    tipoFerias: 'abono_pecuniario',
    status: 'aprovado',
    dataSolicitacao: '2023-03-15',
    dataAprovacao: '2023-03-20',
    aprovador: 'Ana Oliveira'
  }
];

export default function HistoricoFeriasScreen({ navigation }) {
  const [historico, setHistorico] = useState(mockHistoricoFerias);
  const [filteredHistorico, setFilteredHistorico] = useState(mockHistoricoFerias);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedPeriod, setSelectedPeriod] = useState('ano');

  useEffect(() => {
    filterHistorico();
  }, [searchQuery, filterStatus, selectedPeriod, historico]);

  const filterHistorico = () => {
    let filtered = historico;

    // Filtro por texto (busca por data)
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.dataInicio.includes(searchQuery) ||
        item.dataFim.includes(searchQuery) ||
        item.aprovador.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por status
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Filtro por período
    const now = new Date();
    const currentYear = now.getFullYear();

    if (selectedPeriod === 'ano') {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dataSolicitacao);
        return itemDate.getFullYear() === currentYear;
      });
    } else if (selectedPeriod === 'mes') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.dataSolicitacao) >= monthAgo);
    }

    setFilteredHistorico(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado': return '#4caf50';
      case 'pendente': return '#f39c12';
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
      case 'ferias': return 'Férias Normais';
      case 'ferias_antecipadas': return 'Férias Antecipadas';
      case 'abono_pecuniario': return 'Abono Pecuniário';
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

  const calculateTotalDays = () => {
    return filteredHistorico
      .filter(item => item.status === 'aprovado')
      .reduce((total, item) => total + item.quantidadeDias, 0);
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
        <Title>Histórico de Férias</Title>
        <Paragraph>Visualize seu histórico de solicitações de férias</Paragraph>
      </View>

      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar por data ou aprovador..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <Chip
            selected={selectedPeriod === 'mes'}
            onPress={() => setSelectedPeriod('mes')}
            style={styles.chip}
          >
            Último Mês
          </Chip>
          <Chip
            selected={selectedPeriod === 'ano'}
            onPress={() => setSelectedPeriod('ano')}
            style={styles.chip}
          >
            Este Ano
          </Chip>
          <Chip
            selected={selectedPeriod === 'todos'}
            onPress={() => setSelectedPeriod('todos')}
            style={styles.chip}
          >
            Todos
          </Chip>
        </ScrollView>

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
            <Title style={styles.statNumber}>{calculateTotalDays()}</Title>
            <Paragraph style={styles.statLabel}>Dias Aprovados</Paragraph>
          </Card.Content>
        </Card>
        
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
              <DataTable.Title>Período</DataTable.Title>
              <DataTable.Title>Dias</DataTable.Title>
              <DataTable.Title>Tipo</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Aprovador</DataTable.Title>
            </DataTable.Header>

            {filteredHistorico.map((item) => (
              <DataTable.Row key={item.id}>
                <DataTable.Cell>
                  <Paragraph style={styles.periodo}>
                    {formatDate(item.dataInicio)} - {formatDate(item.dataFim)}
                  </Paragraph>
                </DataTable.Cell>
                <DataTable.Cell>{item.quantidadeDias}</DataTable.Cell>
                <DataTable.Cell>
                  <Paragraph style={styles.tipo}>{getTipoLabel(item.tipoFerias)}</Paragraph>
                </DataTable.Cell>
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
                {searchQuery || filterStatus !== 'todos' || selectedPeriod !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Nenhuma solicitação de férias encontrada no período selecionado'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('SolicitarFerias')}
          style={styles.actionButton}
          icon="calendar-plus"
        >
          Solicitar Férias
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
    gap: 8,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
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
  periodo: {
    fontSize: 11,
  },
  tipo: {
    fontSize: 10,
    color: '#1976d2',
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
