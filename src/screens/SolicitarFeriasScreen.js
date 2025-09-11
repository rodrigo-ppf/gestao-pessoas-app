import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Divider,
    HelperText,
    Paragraph,
    TextInput,
    Title
} from 'react-native-paper';

export default function SolicitarFeriasScreen({ navigation }) {
  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: '',
    quantidadeDias: '',
    observacoes: '',
    tipoFerias: 'ferias'
  });

  const [errors, setErrors] = useState({});

  const tiposFerias = [
    { id: 'ferias', label: 'Férias Normais' },
    { id: 'ferias_antecipadas', label: 'Férias Antecipadas' },
    { id: 'abono_pecuniario', label: 'Abono Pecuniário' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.dataInicio.trim()) {
      newErrors.dataInicio = 'Data de início é obrigatória';
    }
    if (!formData.dataFim.trim()) {
      newErrors.dataFim = 'Data de fim é obrigatória';
    }
    if (!formData.quantidadeDias.trim()) {
      newErrors.quantidadeDias = 'Quantidade de dias é obrigatória';
    } else if (isNaN(formData.quantidadeDias) || parseInt(formData.quantidadeDias) <= 0) {
      newErrors.quantidadeDias = 'Quantidade de dias deve ser um número positivo';
    }

    // Validar se data fim é posterior à data início
    if (formData.dataInicio && formData.dataFim) {
      const inicio = new Date(formData.dataInicio.split('/').reverse().join('-'));
      const fim = new Date(formData.dataFim.split('/').reverse().join('-'));
      if (fim <= inicio) {
        newErrors.dataFim = 'Data de fim deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // TODO: Implementar salvamento no banco
      Alert.alert(
        'Solicitação Enviada',
        'Sua solicitação de férias foi enviada para aprovação!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const calculateDays = () => {
    if (formData.dataInicio && formData.dataFim) {
      const inicio = new Date(formData.dataInicio.split('/').reverse().join('-'));
      const fim = new Date(formData.dataFim.split('/').reverse().join('-'));
      const diffTime = Math.abs(fim - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      updateFormData('quantidadeDias', diffDays.toString());
    }
  };

  const getSaldoFerias = () => {
    // TODO: Buscar saldo real do banco
    return {
      diasDisponiveis: 30,
      diasSolicitados: 0,
      diasRestantes: 30
    };
  };

  const saldoFerias = getSaldoFerias();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Solicitar Férias</Title>

          <Card style={styles.saldoCard}>
            <Card.Content>
              <Title style={styles.saldoTitle}>Saldo de Férias</Title>
              <View style={styles.saldoRow}>
                <Paragraph style={styles.saldoLabel}>Dias Disponíveis:</Paragraph>
                <Paragraph style={styles.saldoValue}>{saldoFerias.diasDisponiveis}</Paragraph>
              </View>
              <View style={styles.saldoRow}>
                <Paragraph style={styles.saldoLabel}>Dias Solicitados:</Paragraph>
                <Paragraph style={styles.saldoValue}>{saldoFerias.diasSolicitados}</Paragraph>
              </View>
              <View style={styles.saldoRow}>
                <Paragraph style={styles.saldoLabel}>Dias Restantes:</Paragraph>
                <Paragraph style={[styles.saldoValue, styles.saldoRestante]}>
                  {saldoFerias.diasRestantes}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          <TextInput
            label="Data de Início"
            value={formData.dataInicio}
            onChangeText={(value) => updateFormData('dataInicio', value)}
            style={styles.input}
            mode="outlined"
            placeholder="DD/MM/AAAA"
            error={!!errors.dataInicio}
          />
          <HelperText type="error" visible={!!errors.dataInicio}>
            {errors.dataInicio}
          </HelperText>

          <TextInput
            label="Data de Fim"
            value={formData.dataFim}
            onChangeText={(value) => updateFormData('dataFim', value)}
            style={styles.input}
            mode="outlined"
            placeholder="DD/MM/AAAA"
            error={!!errors.dataFim}
          />
          <HelperText type="error" visible={!!errors.dataFim}>
            {errors.dataFim}
          </HelperText>

          <Button
            mode="outlined"
            onPress={calculateDays}
            style={styles.calculateButton}
            icon="calculator"
          >
            Calcular Dias
          </Button>

          <TextInput
            label="Quantidade de Dias"
            value={formData.quantidadeDias}
            onChangeText={(value) => updateFormData('quantidadeDias', value)}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.quantidadeDias}
          />
          <HelperText type="error" visible={!!errors.quantidadeDias}>
            {errors.quantidadeDias}
          </HelperText>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Tipo de Férias</Title>
          {tiposFerias.map((tipo) => (
            <Button
              key={tipo.id}
              mode={formData.tipoFerias === tipo.id ? 'contained' : 'outlined'}
              onPress={() => updateFormData('tipoFerias', tipo.id)}
              style={styles.tipoButton}
            >
              {tipo.label}
            </Button>
          ))}

          <TextInput
            label="Observações (Opcional)"
            value={formData.observacoes}
            onChangeText={(value) => updateFormData('observacoes', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Informações adicionais sobre a solicitação..."
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
            >
              Solicitar Férias
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
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#1976d2',
  },
  saldoCard: {
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
  },
  saldoTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: '#1976d2',
  },
  saldoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  saldoLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  saldoValue: {
    color: '#333',
    fontWeight: 'bold',
  },
  saldoRestante: {
    color: '#4caf50',
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 8,
  },
  calculateButton: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  tipoButton: {
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
