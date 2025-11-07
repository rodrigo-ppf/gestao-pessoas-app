import MainLayout from '@/components/MainLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Paragraph, Switch, Text, Title } from 'react-native-paper';

interface RegistroPonto {
  id: string;
  tipo: 'entrada' | 'saida';
  horario: string;
  data: string;
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco?: string;
  };
  timestamp: number;
}

export default function RegistrarPontoScreen() {
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [geolocalizacaoAtiva, setGeolocalizacaoAtiva] = useState(false);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<Location.LocationObject | null>(null);
  const [enderecoAtual, setEnderecoAtual] = useState<string>('');
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [permissaoLocalizacao, setPermissaoLocalizacao] = useState<Location.LocationPermissionResponse | null>(null);

  // Verificar permissões de localização e carregar registros ao carregar o componente
  useEffect(() => {
    verificarPermissoesLocalizacao();
    carregarRegistros();
  }, []);

  // Salvar registros sempre que houver mudanças
  useEffect(() => {
    if (registros.length > 0) {
      salvarRegistros();
    }
  }, [registros]);

  const verificarPermissoesLocalizacao = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissaoLocalizacao({ status } as Location.LocationPermissionResponse);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão de Localização',
          'Para registrar ponto com geolocalização, é necessário permitir o acesso à localização.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurar', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  };

  const salvarRegistros = async () => {
    try {
      const registrosJson = JSON.stringify(registros);
      await AsyncStorage.setItem('registros_ponto', registrosJson);
      console.log('Registros salvos no AsyncStorage:', registros.length, 'registros');
    } catch (error) {
      console.error('Erro ao salvar registros:', error);
    }
  };

  const carregarRegistros = async () => {
    try {
      const registrosJson = await AsyncStorage.getItem('registros_ponto');
      if (registrosJson) {
        const registrosCarregados = JSON.parse(registrosJson) as RegistroPonto[];
        setRegistros(registrosCarregados);
        
        // Verificar se o último registro foi entrada ou saída
        if (registrosCarregados.length > 0) {
          const ultimoRegistro = registrosCarregados[registrosCarregados.length - 1];
          setIsWorking(ultimoRegistro.tipo === 'entrada');
        }
        
        console.log('Registros carregados do AsyncStorage:', registrosCarregados.length, 'registros');
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const obterLocalizacaoAtual = async () => {
    if (!geolocalizacaoAtiva) return null;

    try {
      setCarregandoLocalizacao(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });

      setLocalizacaoAtual(location);

      // Obter endereço a partir das coordenadas
      const endereco = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (endereco.length > 0) {
        const enderecoFormatado = `${endereco[0].street || ''} ${endereco[0].streetNumber || ''}, ${endereco[0].district || ''}, ${endereco[0].city || ''}`.trim();
        setEnderecoAtual(enderecoFormatado);
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          endereco: enderecoFormatado,
        };
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização atual.');
      return null;
    } finally {
      setCarregandoLocalizacao(false);
    }
  };

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

  const handleRegistrarPonto = async () => {
    try {
      const time = getCurrentTime();
      const date = getCurrentDate();
      const timestamp = Date.now();
      const tipo = registros.length % 2 === 0 ? 'entrada' : 'saida';
      
      // Obter localização se estiver ativa
      const localizacao = await obterLocalizacaoAtual();
      
      const novoRegistro: RegistroPonto = {
        id: `registro_${timestamp}`,
        tipo,
        horario: time,
        data: date,
        localizacao: localizacao || undefined,
        timestamp,
      };

      const newRegistros = [...registros, novoRegistro];
      setRegistros(newRegistros);
      
      if (tipo === 'entrada') {
        setIsWorking(true);
        const mensagem = localizacao 
          ? `Entrada registrada às ${time}\n📍 Local: ${localizacao.endereco || 'Coordenadas obtidas'}`
          : `Entrada registrada às ${time}`;
        Alert.alert('Ponto Registrado', mensagem);
      } else {
        setIsWorking(false);
        const mensagem = localizacao 
          ? `Saída registrada às ${time}\n📍 Local: ${localizacao.endereco || 'Coordenadas obtidas'}`
          : `Saída registrada às ${time}`;
        Alert.alert('Ponto Registrado', mensagem);
      }
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      Alert.alert('Erro', 'Não foi possível registrar o ponto. Tente novamente.');
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

  const toggleGeolocalizacao = async () => {
    if (!geolocalizacaoAtiva) {
      // Ativando geolocalização
      if (permissaoLocalizacao?.status !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão Necessária',
            'Para usar geolocalização, é necessário permitir o acesso à localização nas configurações do dispositivo.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
    }
    setGeolocalizacaoAtiva(!geolocalizacaoAtiva);
  };

  const limparRegistros = () => {
    Alert.alert(
      'Limpar Registros',
      'Deseja realmente limpar todos os registros de ponto? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('registros_ponto');
              setRegistros([]);
              setIsWorking(false);
              Alert.alert('Sucesso', 'Todos os registros foram limpos.');
            } catch (error) {
              console.error('Erro ao limpar registros:', error);
              Alert.alert('Erro', 'Não foi possível limpar os registros.');
            }
          }
        }
      ]
    );
  };

  return (
    <MainLayout title="Registrar Ponto" showBackButton={true}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
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

        {/* Configurações de Geolocalização */}
        <Card style={styles.configCard}>
          <Card.Content>
            <View style={styles.configHeader}>
              <Title style={styles.configTitle}>Configurações</Title>
              <Chip 
                icon={geolocalizacaoAtiva ? "map-marker" : "map-marker-off"}
                style={[styles.geoStatusChip, { backgroundColor: geolocalizacaoAtiva ? '#e8f5e8' : '#f5f5f5' }]}
                textStyle={{ color: geolocalizacaoAtiva ? '#2e7d32' : '#666' }}
              >
                {geolocalizacaoAtiva ? 'GPS Ativo' : 'GPS Inativo'}
              </Chip>
            </View>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text variant="bodyLarge">Registrar com Geolocalização</Text>
                <Paragraph style={styles.switchDescription}>
                  {geolocalizacaoAtiva 
                    ? 'O local será registrado junto com o ponto' 
                    : 'Apenas horário será registrado'
                  }
                </Paragraph>
              </View>
              <Switch
                value={geolocalizacaoAtiva}
                onValueChange={toggleGeolocalizacao}
                color="#1976d2"
              />
            </View>

            {geolocalizacaoAtiva && enderecoAtual && (
              <View style={styles.locationInfo}>
                <Text variant="bodyMedium" style={styles.locationLabel}>
                  📍 Localização atual:
                </Text>
                <Text variant="bodySmall" style={styles.locationText}>
                  {enderecoAtual}
                </Text>
              </View>
            )}

            {carregandoLocalizacao && (
              <View style={styles.loadingLocation}>
                <Text variant="bodySmall" style={styles.loadingText}>
                  🔄 Obtendo localização...
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.registrosCard}>
          <Card.Content>
            <View style={styles.registrosHeader}>
              <Title>Registros de Hoje</Title>
              <View style={styles.registrosInfo}>
                <Chip 
                  icon="database" 
                  style={styles.storageChip}
                  textStyle={styles.storageChipText}
                >
                  {registros.length} registros
                </Chip>
                {registros.length > 0 && (
                  <Button
                    mode="outlined"
                    onPress={limparRegistros}
                    style={styles.clearButton}
                    compact
                    textColor="#f44336"
                  >
                    Limpar
                  </Button>
                )}
              </View>
            </View>
            
            <Paragraph style={styles.storageInfo}>
              💾 Dados salvos automaticamente no dispositivo
            </Paragraph>
            
            {registros.length === 0 ? (
              <Paragraph style={styles.noRegistros}>
                Nenhum registro encontrado
              </Paragraph>
            ) : (
              registros.map((registro) => (
                <View key={registro.id} style={styles.registroItem}>
                  <View style={styles.registroHeader}>
                    <Text variant="bodyLarge" style={styles.registroTipo}>
                      {registro.tipo === 'entrada' ? '🟢 Entrada' : '🔴 Saída'}: {registro.horario}
                    </Text>
                    {registro.localizacao && (
                      <Chip 
                        icon="map-marker" 
                        style={styles.locationChip}
                        textStyle={styles.locationChipText}
                      >
                        GPS
                      </Chip>
                    )}
                  </View>
                  {registro.localizacao?.endereco && (
                    <Text variant="bodySmall" style={styles.registroLocalizacao}>
                      📍 {registro.localizacao.endereco}
                    </Text>
                  )}
                  <Text variant="bodySmall" style={styles.registroTimestamp}>
                    ID: {registro.id} | {new Date(registro.timestamp).toLocaleString('pt-BR')}
                  </Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
        </ScrollView>

        <Button
          mode="contained"
          onPress={handleRegistrarPonto}
          style={styles.registrarButton}
          contentStyle={styles.buttonContent}
          loading={carregandoLocalizacao}
          disabled={carregandoLocalizacao}
          icon={geolocalizacaoAtiva ? "map-marker" : "clock"}
        >
          {carregandoLocalizacao 
            ? 'Obtendo Localização...' 
            : geolocalizacaoAtiva 
              ? 'Registrar Ponto com GPS' 
              : 'Registrar Ponto'
          }
        </Button>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollableContent: {
    flex: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
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
    marginTop: 16,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  // Novos estilos para geolocalização
  configCard: {
    marginBottom: 16,
    elevation: 2,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  configTitle: {
    fontSize: 18,
  },
  geoStatusChip: {
    height: 32,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  locationInfo: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    marginTop: 8,
  },
  locationLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationText: {
    color: '#666',
  },
  loadingLocation: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  loadingText: {
    color: '#f57c00',
    textAlign: 'center',
  },
  registroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  registroTipo: {
    flex: 1,
  },
  locationChip: {
    backgroundColor: '#e3f2fd',
    height: 24,
  },
  locationChipText: {
    color: '#1976d2',
    fontSize: 10,
  },
  registroLocalizacao: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  registroTimestamp: {
    color: '#999',
    fontSize: 10,
    marginTop: 2,
  },
  registrosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  registrosInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageChip: {
    backgroundColor: '#e8f5e8',
    height: 28,
  },
  storageChipText: {
    color: '#2e7d32',
    fontSize: 12,
  },
  clearButton: {
    borderColor: '#f44336',
    height: 28,
  },
  storageInfo: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
});
