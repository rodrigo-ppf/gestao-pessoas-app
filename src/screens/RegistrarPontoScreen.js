import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    Paragraph,
    Text,
    Title
} from 'react-native-paper';

export default function RegistrarPontoScreen({ navigation }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastPunch, setLastPunch] = useState(null);
  const [todayPunches, setTodayPunches] = useState([]);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadTodayPunches();
    checkWorkingStatus();

    return () => clearInterval(timer);
  }, []);

  const loadTodayPunches = () => {
    // TODO: Carregar batidas do dia do banco de dados
    const mockPunches = [
      { id: 1, tipo: 'entrada', horario: '08:00:00', data: new Date().toISOString().split('T')[0] },
      { id: 2, tipo: 'saida_almoco', horario: '12:00:00', data: new Date().toISOString().split('T')[0] },
      { id: 3, tipo: 'entrada_almoco', horario: '13:00:00', data: new Date().toISOString().split('T')[0] }
    ];
    setTodayPunches(mockPunches);
  };

  const checkWorkingStatus = () => {
    if (todayPunches.length === 0) {
      setIsWorking(false);
      return;
    }

    const lastPunchType = todayPunches[todayPunches.length - 1].tipo;
    setIsWorking(lastPunchType === 'entrada' || lastPunchType === 'entrada_almoco');
  };

  const getPunchTypeLabel = (tipo) => {
    switch (tipo) {
      case 'entrada': return 'Entrada';
      case 'saida_almoco': return 'Saída Almoço';
      case 'entrada_almoco': return 'Entrada Almoço';
      case 'saida': return 'Saída';
      default: return tipo;
    }
  };

  const getPunchTypeColor = (tipo) => {
    switch (tipo) {
      case 'entrada': return '#4caf50';
      case 'saida_almoco': return '#ff9800';
      case 'entrada_almoco': return '#2196f3';
      case 'saida': return '#f44336';
      default: return '#666';
    }
  };

  const getNextPunchType = () => {
    if (todayPunches.length === 0) return 'entrada';
    
    const lastPunchType = todayPunches[todayPunches.length - 1].tipo;
    switch (lastPunchType) {
      case 'entrada': return 'saida_almoco';
      case 'saida_almoco': return 'entrada_almoco';
      case 'entrada_almoco': return 'saida';
      case 'saida': return 'entrada';
      default: return 'entrada';
    }
  };

  const getNextPunchLabel = () => {
    const nextType = getNextPunchType();
    return getPunchTypeLabel(nextType);
  };

  const getNextPunchColor = () => {
    const nextType = getNextPunchType();
    return getPunchTypeColor(nextType);
  };

  const handlePunch = () => {
    const punchType = getNextPunchType();
    const now = new Date();
    
    const newPunch = {
      id: todayPunches.length + 1,
      tipo: punchType,
      horario: now.toTimeString().split(' ')[0],
      data: now.toISOString().split('T')[0]
    };

    setTodayPunches(prev => [...prev, newPunch]);
    setLastPunch(newPunch);
    setIsWorking(punchType === 'entrada' || punchType === 'entrada_almoco');

    // TODO: Salvar no banco de dados
    Alert.alert(
      'Ponto Registrado',
      `${getPunchTypeLabel(punchType)} registrada às ${newPunch.horario}`,
      [{ text: 'OK' }]
    );
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateWorkedTime = () => {
    if (todayPunches.length === 0) return '00:00:00';
    
    let totalSeconds = 0;
    let startTime = null;
    
    todayPunches.forEach(punch => {
      const [hours, minutes, seconds] = punch.horario.split(':').map(Number);
      const punchTime = hours * 3600 + minutes * 60 + seconds;
      
      if (punch.tipo === 'entrada' || punch.tipo === 'entrada_almoco') {
        startTime = punchTime;
      } else if (startTime !== null) {
        totalSeconds += punchTime - startTime;
        startTime = null;
      }
    });
    
    // Se ainda está trabalhando, adicionar tempo até agora
    if (startTime !== null && isWorking) {
      const now = new Date();
      const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      totalSeconds += currentSeconds - startTime;
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Registrar Ponto</Title>
        <Paragraph style={styles.headerSubtitle}>
          {formatDate(currentTime)}
        </Paragraph>
      </View>

      <Card style={styles.timeCard}>
        <Card.Content style={styles.timeContent}>
          <Title style={styles.currentTime}>{formatTime(currentTime)}</Title>
          <Paragraph style={styles.currentDate}>{formatDate(currentTime)}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Title style={styles.statusTitle}>Status Atual</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: isWorking ? '#4caf50' : '#f44336' }]}
              textStyle={styles.statusChipText}
            >
              {isWorking ? 'Trabalhando' : 'Fora do Trabalho'}
            </Chip>
          </View>

          <View style={styles.workedTimeContainer}>
            <Text style={styles.workedTimeLabel}>Tempo Trabalhado Hoje:</Text>
            <Text style={styles.workedTime}>{calculateWorkedTime()}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.punchCard}>
        <Card.Content>
          <Title style={styles.punchTitle}>Próxima Batida</Title>
          <Paragraph style={styles.punchDescription}>
            Clique no botão abaixo para registrar sua {getNextPunchLabel().toLowerCase()}
          </Paragraph>
          
          <Button
            mode="contained"
            onPress={handlePunch}
            style={[styles.punchButton, { backgroundColor: getNextPunchColor() }]}
            contentStyle={styles.punchButtonContent}
            labelStyle={styles.punchButtonLabel}
          >
            {getNextPunchLabel()}
          </Button>
        </Card.Content>
      </Card>

      {lastPunch && (
        <Card style={styles.lastPunchCard}>
          <Card.Content>
            <Title style={styles.lastPunchTitle}>Última Batida</Title>
            <View style={styles.lastPunchInfo}>
              <Chip
                style={[styles.lastPunchChip, { backgroundColor: getPunchTypeColor(lastPunch.tipo) }]}
                textStyle={styles.lastPunchChipText}
              >
                {getPunchTypeLabel(lastPunch.tipo)}
              </Chip>
              <Text style={styles.lastPunchTime}>{lastPunch.horario}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.historyCard}>
        <Card.Content>
          <Title style={styles.historyTitle}>Batidas de Hoje</Title>
          
          {todayPunches.length > 0 ? (
            todayPunches.map((punch, index) => (
              <View key={punch.id} style={styles.punchItem}>
                <View style={styles.punchItemInfo}>
                  <Chip
                    style={[styles.punchItemChip, { backgroundColor: getPunchTypeColor(punch.tipo) }]}
                    textStyle={styles.punchItemChipText}
                  >
                    {getPunchTypeLabel(punch.tipo)}
                  </Chip>
                  <Text style={styles.punchItemTime}>{punch.horario}</Text>
                </View>
                {index < todayPunches.length - 1 && <Divider style={styles.punchDivider} />}
              </View>
            ))
          ) : (
            <Paragraph style={styles.noPunchesText}>
              Nenhuma batida registrada hoje
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('HistoricoPonto')}
          style={styles.actionButton}
          icon="history"
        >
          Ver Histórico
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
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  timeCard: {
    margin: 16,
    elevation: 4,
  },
  timeContent: {
    alignItems: 'center',
    padding: 24,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  currentDate: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusChipText: {
    color: '#fff',
  },
  workedTimeContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  workedTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workedTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  punchCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  punchTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  punchDescription: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  punchButton: {
    paddingVertical: 12,
  },
  punchButtonContent: {
    paddingVertical: 8,
  },
  punchButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastPunchCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  lastPunchTitle: {
    marginBottom: 12,
  },
  lastPunchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastPunchChip: {
    marginRight: 8,
  },
  lastPunchChipText: {
    color: '#fff',
  },
  lastPunchTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  historyTitle: {
    marginBottom: 16,
  },
  punchItem: {
    paddingVertical: 8,
  },
  punchItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  punchItemChip: {
    marginRight: 8,
  },
  punchItemChipText: {
    color: '#fff',
    fontSize: 12,
  },
  punchItemTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  punchDivider: {
    marginTop: 8,
  },
  noPunchesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    paddingVertical: 8,
  },
});
