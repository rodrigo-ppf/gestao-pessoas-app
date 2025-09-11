import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import {
    Button,
    Card,
    Paragraph,
    TextInput,
    Title
} from 'react-native-paper';

export default function LoginScreen({ navigation }) {
  const [empresa, setEmpresa] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!empresa || !usuario || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implementar validação real
      // Por enquanto, aceita qualquer login
      await SecureStore.setItemAsync('empresa', empresa);
      await SecureStore.setItemAsync('usuario', usuario);
      await SecureStore.setItemAsync('senha', senha);
      
      // Navegar para seleção de perfil
      navigation.replace('ProfileSelection');
    } catch (error) {
      Alert.alert('Erro', 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Gestão de Pessoas</Title>
            <Paragraph style={styles.subtitle}>
              Faça login para acessar o sistema
            </Paragraph>
            
            <TextInput
              label="Código da Empresa"
              value={empresa}
              onChangeText={setEmpresa}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Usuário"
              value={usuario}
              onChangeText={setUsuario}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              style={styles.input}
              mode="outlined"
            />
            
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            >
              Entrar
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#1976d2',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
});