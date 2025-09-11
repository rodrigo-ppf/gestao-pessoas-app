import FloatingMenu from '@/components/FloatingMenu';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, Text, Title } from 'react-native-paper';

export default function RegistrarPontoScreen() {
  const [registros, setRegistros] = useState<string[]>([]);
  const [isWorking, setIsWorking] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR');
  };

  const handleRegistrarPonto = () => {
    const time = getCurrentTime();
    const newRegistros = [...registros, time];
    setRegistros(newRegistros);
    
    if (newRegistros.length % 2 === 1) {
      setIsWorking(true);
      Alert.alert('Ponto Registrado', `Entrada registrada às ${time}`);
    } else {
      setIsWorking(false);
      Alert.alert('Ponto Registrado', `Saída registrada às ${time}`);
    }
  };

  const getStatusText = () => {
    if (registros.length === 0) return 'Não registrado';
    if (isWorking) return 'Trabalhando';
    return 'Fora do trabalho';
  };

  const getStatusColor = () => {
    if (registros.length === 0) return '#9e9e9e';
    if (isWorking) return '#4caf50';
    return '#f44336';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Title>Registrar Ponto</Title>
          <Paragraph>Registre sua entrada e saída</Paragraph>
        </View>

        <Card style={styles.statusCard}>
          <Card.Content style={styles.statusContent}>
            <Text variant="headlineSmall" style={styles.date}>
              {getCurrentDate()}
            </Text>
            <Text variant="headlineMedium" style={styles.time}>
              {getCurrentTime()}
            </Text>
            <Text 
              variant="titleMedium" 
              style={[styles.status, { color: getStatusColor() }]}
            >
              {getStatusText()}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.registrosCard}>
          <Card.Content>
            <Title>Registros de Hoje</Title>
            {registros.length === 0 ? (
              <Paragraph style={styles.noRegistros}>
                Nenhum registro encontrado
              </Paragraph>
            ) : (
              registros.map((registro, index) => (
                <View key={index} style={styles.registroItem}>
                  <Text variant="bodyLarge">
                    {index % 2 === 0 ? 'Entrada' : 'Saída'}: {registro}
                  </Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleRegistrarPonto}
          style={styles.registrarButton}
          contentStyle={styles.buttonContent}
        >
          Registrar Ponto
        </Button>
      </View>

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
    padding: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
    margin: -16,
    marginBottom: 16,
  },
  statusCard: {
    marginBottom: 16,
    elevation: 4,
  },
  statusContent: {
    alignItems: 'center',
    padding: 24,
  },
  date: {
    marginBottom: 8,
    color: '#666',
  },
  time: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  status: {
    fontWeight: 'bold',
  },
  registrosCard: {
    marginBottom: 24,
    elevation: 2,
  },
  noRegistros: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  registroItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  registrarButton: {
    marginTop: 'auto',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
