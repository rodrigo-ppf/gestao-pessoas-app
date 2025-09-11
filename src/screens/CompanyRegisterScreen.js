import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet
} from 'react-native';
import {
    Button,
    Card,
    HelperText,
    TextInput,
    Title,
} from 'react-native-paper';
import { db } from '../database/database';

export default function CompanyRegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    codigo_empresa: '',
    nome_fantasia: '',
    nome_registro: '',
    email_empresa: '',
    site_empresa: '',
    telefone_empresa: '',
    responsavel_empresa: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigo_empresa.trim()) {
      newErrors.codigo_empresa = 'Código da empresa é obrigatório';
    }

    if (!formData.nome_fantasia.trim()) {
      newErrors.nome_fantasia = 'Nome fantasia é obrigatório';
    }

    if (!formData.nome_registro.trim()) {
      newErrors.nome_registro = 'Nome de registro é obrigatório';
    }

    if (formData.email_empresa && !/\S+@\S+\.\S+/.test(formData.email_empresa)) {
      newErrors.email_empresa = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO empresas (
          codigo_empresa, nome_fantasia, nome_registro, 
          email_empresa, site_empresa, telefone_empresa, 
          responsavel_empresa
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          formData.codigo_empresa,
          formData.nome_fantasia,
          formData.nome_registro,
          formData.email_empresa,
          formData.site_empresa,
          formData.telefone_empresa,
          formData.responsavel_empresa,
        ],
        (_, result) => {
          Alert.alert(
            'Sucesso',
            'Empresa cadastrada com sucesso!',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        },
        (_, error) => {
          console.error('Erro ao salvar empresa:', error);
          Alert.alert('Erro', 'Falha ao cadastrar empresa');
        }
      );
    }, null, () => {
      setLoading(false);
    });
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Dados da Empresa</Title>
          
          <TextInput
            label="Código da Empresa *"
            value={formData.codigo_empresa}
            onChangeText={(value) => updateField('codigo_empresa', value)}
            style={styles.input}
            mode="outlined"
            error={!!errors.codigo_empresa}
          />
          <HelperText type="error" visible={!!errors.codigo_empresa}>
            {errors.codigo_empresa}
          </HelperText>

          <TextInput
            label="Nome Fantasia *"
            value={formData.nome_fantasia}
            onChangeText={(value) => updateField('nome_fantasia', value)}
            style={styles.input}
            mode="outlined"
            error={!!errors.nome_fantasia}
          />
          <HelperText type="error" visible={!!errors.nome_fantasia}>
            {errors.nome_fantasia}
          </HelperText>

          <TextInput
            label="Nome de Registro *"
            value={formData.nome_registro}
            onChangeText={(value) => updateField('nome_registro', value)}
            style={styles.input}
            mode="outlined"
            error={!!errors.nome_registro}
          />
          <HelperText type="error" visible={!!errors.nome_registro}>
            {errors.nome_registro}
          </HelperText>

          <TextInput
            label="Email da Empresa"
            value={formData.email_empresa}
            onChangeText={(value) => updateField('email_empresa', value)}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            error={!!errors.email_empresa}
          />
          <HelperText type="error" visible={!!errors.email_empresa}>
            {errors.email_empresa}
          </HelperText>

          <TextInput
            label="Site da Empresa"
            value={formData.site_empresa}
            onChangeText={(value) => updateField('site_empresa', value)}
            style={styles.input}
            mode="outlined"
            keyboardType="url"
          />

          <TextInput
            label="Telefone da Empresa"
            value={formData.telefone_empresa}
            onChangeText={(value) => updateField('telefone_empresa', value)}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />

          <TextInput
            label="Responsável pela Empresa"
            value={formData.responsavel_empresa}
            onChangeText={(value) => updateField('responsavel_empresa', value)}
            style={styles.input}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            style={styles.button}
          >
            Salvar Empresa
          </Button>
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
  input: {
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    paddingVertical: 5,
  },
});