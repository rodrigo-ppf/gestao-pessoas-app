import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    DataTable,
    IconButton,
    Menu,
    Paragraph,
    Searchbar,
    Title
} from 'react-native-paper';

// Dados mockados para demonstração
const mockJustificativasParaAprovacao = [
  {
    id: 1,
    colaborador: 'João Silva',
    codigoUsuario: 'USR001',
    tipoJustificativa: 'atraso',
    dataOcorrencia: '2024-01-15',
    descricao: 'Atraso devido a problemas de trânsito',
    status: 'pendente',
    dataSolicitacao: '2024-01-15'
  },
  {
    id: 2,
    colaborador: 'Maria Santos',
    codigoUsuario: 'USR002',
    tipoJustificativa: 'falta',
    dataOcorrencia: '2024-01-14',
    descricao: 'Falta por motivo médico',
    status: 'pendente',
    dataSolicitacao: '2024-01-14'
  },
  {
    id: 3,
    colaborador: 'Pedro Costa',
    codigoUsuario: 'USR003',
    tipoJustificativa: 'horas_extras',
    dataOcorrencia: '2024-01-13',
    descricao: 'Horas extras trabalhadas',
    status: 'pendente',
    dataSolicitacao: '2024-01-13'
  }
];

export default function AprovarDocumentoScreen({ navigation }) {
  const [justificativas, setJustificativas] = useState(mockJustificativasParaAprovacao);
  const [filteredJustificativas, setFilteredJustificativas] = useState(mockJustificativasParaAprovacao);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    filterJustificativas();
  }, [searchQuery, justificativas]);

  const filterJustificativas = () => {
    let filtered = justificativas;

    if (searchQuery) {
      filtered = filtered.filter(justificativa =>
        justificativa.colaborador.toLowerCase().includes(searchQuery.toLowerCase()) ||
        justificativa.codigoUsuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        justificativa.tipoJustificativa.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJustificativas(filtered);
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

  const handleApprove = (justificativa) => {
    Alert.alert(
      'Aprovar Justificativa',
      `Deseja aprovar a justificativa de ${justificativa.colaborador}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          onPress: () => {
            setJustificativas(prev => 
              prev.map(j => 
                j.id === justificativa.id ? { ...j, status: 'aprovado' } : j
              )
            );
            Alert.alert('Sucesso', 'Justificativa aprovada com sucesso!');
          }
        }
      ]
    );
  };

  const handleReject = (justificativa) => {
    Alert.alert(
      'Rejeitar Justificativa',
      `Deseja rejeitar a justificativa de ${justificativa.colaborador}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            setJustificativas(prev => 
              prev.map(j => 
                j.id === justificativa.id ? { ...j, status: 'rejeitado' } : j
              )
            );
            Alert.alert('Sucesso', 'Justificativa rejeitada!');
          }
        }
      ]
    );
  };

  const handleViewDetails = (justificativa) => {
    Alert.alert(
      'Detalhes da Justificativa',
      `Colaborador: ${justificativa.colaborador}\n` +
      `Tipo: ${getTipoLabel(justificativa.tipoJustificativa)}\n` +
      `Data: ${formatDate(justificativa.dataOcorrencia)}\n` +
      `Descrição: ${justificativa.descricao}`
    );
  };

  const toggleMenu = (id) => {
    setMenuVisible(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getPendingCount = () => {
    return justificativas.filter(j => j.status === 'pendente').length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Aprovar Justificativas</Title>
        <Paragraph>Gerencie as aprovações de justificativas dos colaboradores</Paragraph>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>{getPendingCount()}</Title>
            <Paragraph style={styles.statLabel}>Pendentes</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>{filteredJustificativas.length}</Title>
            <Paragraph style={styles.statLabel}>Total</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar colaboradores..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredJustificativas.length > 0 ? (
          <DataTable style={styles.dataTable}>
            <DataTable.Header>
              <DataTable.Title>Colaborador</DataTable.Title>
              <DataTable.Title>Tipo</DataTable.Title>
              <DataTable.Title>Data</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Ações</DataTable.Title>
            </DataTable.Header>

            {filteredJustificativas.map((justificativa) => (
              <DataTable.Row key={justificativa.id}>
                <DataTable.Cell>
                  <View>
                    <Paragraph style={styles.colaboradorName}>{justificativa.colaborador}</Paragraph>
                    <Paragraph style={styles.colaboradorCode}>{justificativa.codigoUsuario}</Paragraph>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell>{getTipoLabel(justificativa.tipoJustificativa)}</DataTable.Cell>
                <DataTable.Cell>{formatDate(justificativa.dataOcorrencia)}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(justificativa.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(justificativa.status)}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Menu
                    visible={menuVisible[justificativa.id]}
                    onDismiss={() => toggleMenu(justificativa.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => toggleMenu(justificativa.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        toggleMenu(justificativa.id);
                        handleViewDetails(justificativa);
                      }}
                      title="Ver Detalhes"
                      leadingIcon="eye"
                    />
                    {justificativa.status === 'pendente' && (
                      <>
                        <Menu.Item
                          onPress={() => {
                            toggleMenu(justificativa.id);
                            handleApprove(justificativa);
                          }}
                          title="Aprovar"
                          leadingIcon="check"
                        />
                        <Menu.Item
                          onPress={() => {
                            toggleMenu(justificativa.id);
                            handleReject(justificativa);
                          }}
                          title="Rejeitar"
                          leadingIcon="close"
                          titleStyle={{ color: '#f44336' }}
                        />
                      </>
                    )}
                  </Menu>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>Nenhuma justificativa encontrada</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há justificativas para aprovação no momento'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('HistoricoJustificativas')}
          style={styles.actionButton}
          icon="history"
        >
          Ver Histórico
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
  filtersContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    marginBottom: 0,
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
  colaboradorName: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  colaboradorCode: {
    fontSize: 10,
    color: '#666',
  },
  statusChip: {
    marginVertical: 2,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 10,
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
