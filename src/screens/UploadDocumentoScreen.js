import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Divider,
    HelperText,
    RadioButton,
    Text,
    TextInput,
    Title
} from 'react-native-paper';

export default function UploadDocumentoScreen({ navigation }) {
  const [formData, setFormData] = useState({
    tipoJustificativa: '',
    dataOcorrencia: '',
    descricao: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});

  const tiposJustificativa = [
    { id: 'atraso', label: 'Atraso' },
    { id: 'falta', label: 'Falta' },
    { id: 'saida_antecipada', label: 'Saída Antecipada' },
    { id: 'horas_extras', label: 'Horas Extras' },
    { id: 'outros', label: 'Outros' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tipoJustificativa) {
      newErrors.tipoJustificativa = 'Tipo de justificativa é obrigatório';
    }
    if (!formData.dataOcorrencia.trim()) {
      newErrors.dataOcorrencia = 'Data da ocorrência é obrigatória';
    }
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      Alert.alert(
        'Justificativa Enviada',
        'Sua justificativa foi enviada para aprovação!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Upload de Documento/Justificativa</Title>

          <Text style={styles.sectionTitle}>Tipo de Justificativa</Text>
          {tiposJustificativa.map((tipo) => (
            <View key={tipo.id} style={styles.radioOption}>
              <RadioButton
                value={tipo.id}
                status={formData.tipoJustificativa === tipo.id ? 'checked' : 'unchecked'}
                onPress={() => updateFormData('tipoJustificativa', tipo.id)}
              />
              <Text>{tipo.label}</Text>
            </View>
          ))}
          <HelperText type="error" visible={!!errors.tipoJustificativa}>
            {errors.tipoJustificativa}
          </HelperText>

          <Divider style={styles.divider} />

          <TextInput
            label="Data da Ocorrência"
            value={formData.dataOcorrencia}
            onChangeText={(value) => updateFormData('dataOcorrencia', value)}
            style={styles.input}
            mode="outlined"
            placeholder="DD/MM/AAAA"
            error={!!errors.dataOcorrencia}
          />
          <HelperText type="error" visible={!!errors.dataOcorrencia}>
            {errors.dataOcorrencia}
          </HelperText>

          <TextInput
            label="Descrição"
            value={formData.descricao}
            onChangeText={(value) => updateFormData('descricao', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            error={!!errors.descricao}
          />
          <HelperText type="error" visible={!!errors.descricao}>
            {errors.descricao}
          </HelperText>

          <TextInput
            label="Observações (Opcional)"
            value={formData.observacoes}
            onChangeText={(value) => updateFormData('observacoes', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={2}
          />

          <Button
            mode="contained"
            onPress={() => Alert.alert('Upload', 'Funcionalidade de upload será implementada')}
            style={styles.uploadButton}
            icon="upload"
          >
            Selecionar Documento
          </Button>

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
              Enviar Justificativa
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 8,
  },
  uploadButton: {
    marginVertical: 16,
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
