import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    HelperText,
    Paragraph,
    TextInput,
    Title
} from 'react-native-paper';

export default function ExecutarTarefaScreen({ navigation, route }) {
  const { tarefa } = route.params;

  const [formData, setFormData] = useState({
    observacoes: '',
    tempoGasto: '',
    status: 'em_andamento'
  });

  const [errors, setErrors] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Iniciar cronômetro quando a tela carrega
    setStartTime(new Date());
    
    const interval = setInterval(() => {
      if (startTime) {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        setElapsedTime(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#f39c12';
      case 'baixa': return '#4caf50';
      default: return '#666';
    }
  };

  const handleStart = () => {
    if (!startTime) {
      setStartTime(new Date());
      setFormData(prev => ({ ...prev, status: 'em_andamento' }));
    }
  };

  const handlePause = () => {
    // TODO: Implementar pausa
    Alert.alert('Pausa', 'Tarefa pausada');
  };

  const handleComplete = () => {
    if (!formData.observacoes.trim()) {
      setErrors({ observacoes: 'Observações são obrigatórias para concluir a tarefa' });
      return;
    }

    Alert.alert(
      'Concluir Tarefa',
      'Deseja marcar esta tarefa como concluída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluir',
          onPress: () => {
            // TODO: Implementar conclusão no banco
            Alert.alert('Sucesso', 'Tarefa concluída com sucesso!', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }
      ]
    );
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Executar Tarefa</Title>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tarefaHeader}>
            <Title style={styles.codigo}>{tarefa.codigoTarefa}</Title>
            <Chip
              style={[styles.prioridadeChip, { backgroundColor: getPrioridadeColor(tarefa.prioridade) }]}
              textStyle={styles.prioridadeChipText}
            >
              {tarefa.prioridade.toUpperCase()}
            </Chip>
          </View>

          <Paragraph style={styles.descricao}>{tarefa.descricao}</Paragraph>
          
          <View style={styles.infoRow}>
            <Paragraph style={styles.infoLabel}>Data:</Paragraph>
            <Paragraph style={styles.infoValue}>{tarefa.dataTarefa}</Paragraph>
          </View>

          <View style={styles.infoRow}>
            <Paragraph style={styles.infoLabel}>Horário Previsto:</Paragraph>
            <Paragraph style={styles.infoValue}>{tarefa.horaInicio} - {tarefa.horaFim}</Paragraph>
          </View>

          <View style={styles.infoRow}>
            <Paragraph style={styles.infoLabel}>Responsável:</Paragraph>
            <Paragraph style={styles.infoValue}>{tarefa.colaborador}</Paragraph>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.timerContainer}>
            <Title style={styles.timerTitle}>Tempo Decorrido</Title>
            <Title style={styles.timer}>{formatTime(elapsedTime)}</Title>
            
            <View style={styles.timerButtons}>
              {!startTime ? (
                <Button
                  mode="contained"
                  onPress={handleStart}
                  style={styles.timerButton}
                  icon="play"
                >
                  Iniciar
                </Button>
              ) : (
                <View style={styles.timerButtonsRow}>
                  <Button
                    mode="outlined"
                    onPress={handlePause}
                    style={styles.timerButton}
                    icon="pause"
                  >
                    Pausar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleComplete}
                    style={styles.timerButton}
                    icon="check"
                  >
                    Concluir
                  </Button>
                </View>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <TextInput
            label="Observações"
            value={formData.observacoes}
            onChangeText={(value) => updateFormData('observacoes', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
            error={!!errors.observacoes}
            placeholder="Descreva o progresso da tarefa, dificuldades encontradas, etc."
          />
          <HelperText type="error" visible={!!errors.observacoes}>
            {errors.observacoes}
          </HelperText>

          <TextInput
            label="Tempo Gasto (Opcional)"
            value={formData.tempoGasto}
            onChangeText={(value) => updateFormData('tempoGasto', value)}
            style={styles.input}
            mode="outlined"
            placeholder="Ex: 2h 30min"
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Voltar
            </Button>
            <Button
              mode="contained"
              onPress={handleComplete}
              style={styles.button}
              disabled={!startTime}
            >
              Concluir Tarefa
            </Button>
          </View>
        </Card.Content>
      </Card>
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
  tarefaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codigo: {
    fontSize: 20,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  prioridadeChip: {
    marginLeft: 8,
  },
  prioridadeChipText: {
    color: '#fff',
    fontSize: 12,
  },
  descricao: {
    fontSize: 16,
    marginBottom: 16,
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
  },
  infoValue: {
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  timerContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  timerTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 16,
  },
  timerButtons: {
    width: '100%',
  },
  timerButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
