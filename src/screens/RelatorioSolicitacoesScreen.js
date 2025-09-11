import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    DataTable,
    Paragraph,
    Title
} from 'react-native-paper';

export default function RelatorioSolicitacoesScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  // Dados mockados para demonstração
  const mockRelatorioSolicitacoes = [
    {
      colaborador: 'João Silva',
      feriasSolicitadas: 2,
      feriasAprovadas: 2,
      justificativasSolicitadas: 3,
      justificativasAprovadas: 2
    },
    {
      colaborador: 'Maria Santos',
      feriasSolicitadas: 1,
      feriasAprovadas: 1,
      justificativasSolicitadas: 2,
      justificativasAprovadas: 2
    },
    {
      colaborador: 'Pedro Costa',
      feriasSolicitadas: 3,
      feriasAprovadas: 2,
      justificativasSolicitadas: 1,
      justificativasAprovadas: 1
    }
  ];

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'semana': return 'Última Semana';
      case 'mes': return 'Este Mês';
      case 'ano': return 'Este Ano';
      default: return period;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Relatório de Solicitações</Title>
        <Paragraph>Relatório de férias e justificativas</Paragraph>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <Chip
            selected={selectedPeriod === 'semana'}
            onPress={() => setSelectedPeriod('semana')}
            style={styles.chip}
          >
            Última Semana
          </Chip>
          <Chip
            selected={selectedPeriod === 'mes'}
            onPress={() => setSelectedPeriod('mes')}
            style={styles.chip}
          >
            Este Mês
          </Chip>
          <Chip
            selected={selectedPeriod === 'ano'}
            onPress={() => setSelectedPeriod('ano')}
            style={styles.chip}
          >
            Este Ano
          </Chip>
        </ScrollView>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Resumo do Período</Title>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Período:</Paragraph>
            <Paragraph style={styles.summaryValue}>{getPeriodLabel(selectedPeriod)}</Paragraph>
          </View>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Total de Férias:</Paragraph>
            <Paragraph style={styles.summaryValue}>6</Paragraph>
          </View>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Total de Justificativas:</Paragraph>
            <Paragraph style={styles.summaryValue}>6</Paragraph>
          </View>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Taxa de Aprovação:</Paragraph>
            <Paragraph style={styles.summaryValue}>83%</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <ScrollView style={styles.content}>
        <DataTable style={styles.dataTable}>
          <DataTable.Header>
            <DataTable.Title>Colaborador</DataTable.Title>
            <DataTable.Title>Férias Sol.</DataTable.Title>
            <DataTable.Title>Férias Aprov.</DataTable.Title>
            <DataTable.Title>Just. Sol.</DataTable.Title>
            <DataTable.Title>Just. Aprov.</DataTable.Title>
          </DataTable.Header>

          {mockRelatorioSolicitacoes.map((item, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{item.colaborador}</DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: '#2196f3' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.feriasSolicitadas}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: '#4caf50' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.feriasAprovadas}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: '#ff9800' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.justificativasSolicitadas}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: '#4caf50' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.justificativasAprovadas}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => Alert.alert('Exportar', 'Funcionalidade de exportação será implementada')}
          style={styles.actionButton}
          icon="download"
        >
          Exportar Relatório
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
  chipsContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  summaryTitle: {
    marginBottom: 12,
    color: '#1976d2',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  summaryValue: {
    color: '#333',
    fontWeight: 'bold',
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
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    paddingVertical: 8,
  },
});
