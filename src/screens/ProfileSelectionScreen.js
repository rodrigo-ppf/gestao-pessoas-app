import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Divider,
    Paragraph,
    RadioButton,
    Text,
    Title
} from 'react-native-paper';

const profiles = [
  {
    id: 'admin_sistema',
    title: 'Admin Sistema',
    description: 'Acesso total ao sistema, gerencia empresas e usuários',
    permissions: ['Gerenciar empresas', 'Gerenciar usuários', 'Relatórios gerais', 'Configurações do sistema']
  },
  {
    id: 'admin_empresa',
    title: 'Admin Empresa',
    description: 'Administra uma empresa específica',
    permissions: ['Gerenciar colaboradores', 'Aprovar solicitações', 'Relatórios da empresa', 'Configurações da empresa']
  },
  {
    id: 'responsavel',
    title: 'Responsável',
    description: 'Gerencia equipe e aprova solicitações',
    permissions: ['Gerenciar equipe', 'Aprovar ponto', 'Aprovar férias', 'Relatórios da equipe']
  },
  {
    id: 'colaborador',
    title: 'Colaborador',
    description: 'Acesso básico para registro de atividades',
    permissions: ['Registrar ponto', 'Solicitar férias', 'Visualizar tarefas', 'Upload de documentos']
  }
];

export default function ProfileSelectionScreen({ navigation }) {
  const [selectedProfile, setSelectedProfile] = useState('');

  const handleContinue = () => {
    if (!selectedProfile) {
      Alert.alert('Erro', 'Selecione um perfil para continuar');
      return;
    }

    // Salvar perfil selecionado e navegar para home
    navigation.replace('Home', { userProfile: selectedProfile });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Selecione seu Perfil</Title>
          <Paragraph style={styles.subtitle}>
            Escolha o perfil que melhor descreve sua função no sistema
          </Paragraph>
        </View>

        <View style={styles.profilesContainer}>
          {profiles.map((profile) => (
            <Card key={profile.id} style={styles.profileCard}>
              <Card.Content>
                <View style={styles.profileHeader}>
                  <RadioButton
                    value={profile.id}
                    status={selectedProfile === profile.id ? 'checked' : 'unchecked'}
                    onPress={() => setSelectedProfile(profile.id)}
                  />
                  <View style={styles.profileInfo}>
                    <Title style={styles.profileTitle}>{profile.title}</Title>
                    <Paragraph style={styles.profileDescription}>
                      {profile.description}
                    </Paragraph>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.permissionsContainer}>
                  <Text style={styles.permissionsTitle}>Permissões:</Text>
                  {profile.permissions.map((permission, index) => (
                    <Text key={index} style={styles.permission}>
                      • {permission}
                    </Text>
                  ))}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          disabled={!selectedProfile}
        >
          Continuar
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
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  profilesContainer: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 8,
  },
  profileTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  profileDescription: {
    color: '#666',
    fontSize: 14,
  },
  divider: {
    marginVertical: 12,
  },
  permissionsContainer: {
    marginTop: 8,
  },
  permissionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  permission: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 8,
  },
  continueButton: {
    paddingVertical: 8,
  },
});
