import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    View,
} from 'react-native';
import {
    Button,
    Card,
    FAB,
    Paragraph,
    Searchbar,
    Title,
} from 'react-native-paper';
// import { db } from '../src/database/database';

export default function CompanyListScreen() {
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmpresas();
  }, []);

  useEffect(() => {
    filterEmpresas();
  }, [searchQuery, empresas]);

  const loadEmpresas = () => {
    // Dados de exemplo (sem banco de dados)
    const empresasExemplo = [
      {
        id: 1,
        codigo_empresa: 'EMP001',
        nome_fantasia: 'Empresa Exemplo 1',
        nome_registro: 'Empresa Exemplo LTDA',
        email_empresa: 'contato@empresa1.com',
        telefone_empresa: '(11) 99999-9999',
      },
      {
        id: 2,
        codigo_empresa: 'EMP002',
        nome_fantasia: 'Empresa Exemplo 2',
        nome_registro: 'Empresa Exemplo 2 LTDA',
        email_empresa: 'contato@empresa2.com',
        telefone_empresa: '(11) 88888-8888',
      }
    ];
    
    setEmpresas(empresasExemplo);
    setLoading(false);
  };

  const filterEmpresas = () => {
    if (!searchQuery.trim()) {
      setFilteredEmpresas(empresas);
    } else {
      const filtered = empresas.filter(empresa =>
        empresa.nome_fantasia.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empresa.codigo_empresa.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmpresas(filtered);
    }
  };

  const deleteEmpresa = (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta empresa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            // Simular exclusão (sem banco de dados)
            Alert.alert('Sucesso', 'Empresa excluída com sucesso!');
          },
        },
      ]
    );
  };

  const renderEmpresa = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.nome_fantasia}</Title>
        <Paragraph>Código: {item.codigo_empresa}</Paragraph>
        <Paragraph>Registro: {item.nome_registro}</Paragraph>
        {item.email_empresa && (
          <Paragraph>Email: {item.email_empresa}</Paragraph>
        )}
        {item.telefone_empresa && (
          <Paragraph>Telefone: {item.telefone_empresa}</Paragraph>
        )}
        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => deleteEmpresa(item.id)}
            style={styles.deleteButton}
          >
            Excluir
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar empresas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <FlatList
        data={filteredEmpresas}
        renderItem={renderEmpresa}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadEmpresas}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Title>Nenhuma empresa encontrada</Title>
            <Paragraph>Adicione uma nova empresa para começar</Paragraph>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push('/company-register')}
        label="Nova Empresa"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  deleteButton: {
    borderColor: '#dc3545',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});