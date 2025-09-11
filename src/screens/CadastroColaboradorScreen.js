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

export default function CadastroColaboradorScreen({ navigation }) {
  const [formData, setFormData] = useState({
    codigoUsuario: '',
    nomeUsuario: '',
    dataNascimento: '',
    endereco: '',
    telefone: '',
    email: '',
    sexo: '',
    dataEntrada: '',
    cargo: '',
    perfil: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigoUsuario.trim()) {
      newErrors.codigoUsuario = 'Código do usuário é obrigatório';
    }
    if (!formData.nomeUsuario.trim()) {
      newErrors.nomeUsuario = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    if (!formData.dataEntrada.trim()) {
      newErrors.dataEntrada = 'Data de entrada é obrigatória';
    }
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }
    if (!formData.perfil) {
      newErrors.perfil = 'Perfil é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // TODO: Implementar salvamento no banco
      Alert.alert('Sucesso', 'Colaborador cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
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
          <Title style={styles.title}>Cadastro de Colaborador</Title>

          <TextInput
            label="Código do Usuário"
            value={formData.codigoUsuario}
            onChangeText={(value) => updateFormData('codigoUsuario', value)}
            style={styles.input}
            mode="outlined"
            error={!!errors.codigoUsuario}
          />
          <HelperText type="error" visible={!!errors.codigoUsuario}>
            {errors.codigoUsuario}
          </HelperText>

          <TextInput
            label="Nome Completo"
            value={formData.nomeUsuario}
            onChangeText={(value) => updateFormData('nomeUsuario', value)}
            style={styles.input}
            mode="outlined"
            error={!!errors.nomeUsuario}
          />
          <HelperText type="error" visible={!!errors.nomeUsuario}>
            {errors.nomeUsuario}
          </HelperText>

          <TextInput
            label="Data de Nascimento"
            value={formData.dataNascimento}
            onChangeText={(value) => updateFormData('dataNascimento', value)}
            style={styles.input}
            mode="outlined"
            placeholder="DD/MM/AAAA"
          />

          <TextInput
            label="Endereço"
            value={formData.endereco}
            onChangeText={(value) => updateFormData('endereco', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={2}
          />

          <TextInput
            label="Telefone"
            value={formData.telefone}
            onChangeText={(value) => updateFormData('telefone', value)}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.telefone}
          />
          <HelperText type="error" visible={!!errors.telefone}>
            {errors.telefone}
          </HelperText>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            error={!!errors.email}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <Text style={styles.sectionTitle}>Sexo</Text>
          <View style={styles.radioGroup}>
            <View style={styles.radioOption}>
              <RadioButton
                value="masculino"
                status={formData.sexo === 'masculino' ? 'checked' : 'unchecked'}
                onPress={() => updateFormData('sexo', 'masculino')}
              />
              <Text>Masculino</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton
                value="feminino"
                status={formData.sexo === 'feminino' ? 'checked' : 'unchecked'}
                onPress={() => updateFormData('sexo', 'feminino')}
              />
              <Text>Feminino</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <TextInput
            label="Data de Entrada na Empresa"
            value={formData.dataEntrada}
            onChangeText={(value) => updateFormData('dataEntrada', value)}
            style={styles.input}
            mode="outlined"
            placeholder="DD/MM/AAAA"
            error={!!errors.dataEntrada}
          />
          <HelperText type="error" visible={!!errors.dataEntrada}>
            {errors.dataEntrada}
          </HelperText>

          <TextInput
            label="Cargo"
            value={formData.cargo}
            onChangeText={(value) => updateFormData('cargo', value)}
            style={styles.input}
            mode="outlined"
            error={!!errors.cargo}
          />
          <HelperText type="error" visible={!!errors.cargo}>
            {errors.cargo}
          </HelperText>

          <Text style={styles.sectionTitle}>Perfil do Usuário</Text>
          <View style={styles.radioGroup}>
            <View style={styles.radioOption}>
              <RadioButton
                value="admin_empresa"
                status={formData.perfil === 'admin_empresa' ? 'checked' : 'unchecked'}
                onPress={() => updateFormData('perfil', 'admin_empresa')}
              />
              <Text>Admin Empresa</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton
                value="responsavel"
                status={formData.perfil === 'responsavel' ? 'checked' : 'unchecked'}
                onPress={() => updateFormData('perfil', 'responsavel')}
              />
              <Text>Responsável</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton
                value="colaborador"
                status={formData.perfil === 'colaborador' ? 'checked' : 'unchecked'}
                onPress={() => updateFormData('perfil', 'colaborador')}
              />
              <Text>Colaborador</Text>
            </View>
          </View>
          <HelperText type="error" visible={!!errors.perfil}>
            {errors.perfil}
          </HelperText>

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
              Salvar
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
  input: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
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
