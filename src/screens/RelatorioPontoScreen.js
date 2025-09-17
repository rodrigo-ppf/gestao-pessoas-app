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

export default function RelatorioPontoScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  // Dados mockados para demonstração
  const mockRelatorioPonto = [
    {
      colaborador: 'João Silva',
      diasTrabalhados: 22,
      horasTrabalhadas: '176:00',
      atrasos: 2,
      faltas: 0,
      horasExtras: '8:00'
    },
    {
      colaborador: 'Maria Santos',
      diasTrabalhados: 21,
      horasTrabalhadas: '168:00',
      atrasos: 1,
      faltas: 1,
      horasExtras: '4:00'
    },
    {
      colaborador: 'Pedro Costa',
      diasTrabalhados: 23,
      horasTrabalhadas: '184:00',
      atrasos: 0,
      faltas: 0,
      horasExtras: '16:00'
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
        <Title>Relatório de Ponto</Title>
        <Paragraph>Relatório consolidado de batidas de ponto</Paragraph>
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
            <Paragraph style={styles.summaryLabel}>Total de Colaboradores:</Paragraph>
            <Paragraph style={styles.summaryValue}>{mockRelatorioPonto.length}</Paragraph>
          </View>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Total de Horas:</Paragraph>
            <Paragraph style={styles.summaryValue}>528:00</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <ScrollView style={styles.content}>
        <DataTable style={styles.dataTable}>
          <DataTable.Header>
            <DataTable.Title>Colaborador</DataTable.Title>
            <DataTable.Title>Dias</DataTable.Title>
            <DataTable.Title>Horas</DataTable.Title>
            <DataTable.Title>Atrasos</DataTable.Title>
            <DataTable.Title>Faltas</DataTable.Title>
            <DataTable.Title>Extras</DataTable.Title>
          </DataTable.Header>

          {mockRelatorioPonto.map((item, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{item.colaborador}</DataTable.Cell>
              <DataTable.Cell>{item.diasTrabalhados}</DataTable.Cell>
              <DataTable.Cell>{item.horasTrabalhadas}</DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: item.atrasos > 0 ? '#f39c12' : '#4caf50' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.atrasos}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: item.faltas > 0 ? '#f44336' : '#4caf50' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.faltas}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>{item.horasExtras}</DataTable.Cell>
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
