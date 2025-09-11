import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('gestao_pessoas.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Tabela de empresas
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS empresas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_empresa TEXT UNIQUE NOT NULL,
          nome_fantasia TEXT NOT NULL,
          nome_registro TEXT NOT NULL,
          email_empresa TEXT,
          site_empresa TEXT,
          telefone_empresa TEXT,
          responsavel_empresa TEXT,
          status_empresa TEXT DEFAULT 'ativo',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Tabela de usuários
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_usuario TEXT UNIQUE NOT NULL,
          nome_usuario TEXT NOT NULL,
          data_nascimento DATE,
          endereco_usuario TEXT,
          telefone_usuario TEXT,
          email_usuario TEXT,
          sexo_usuario TEXT,
          codigo_empresa TEXT,
          data_entrada_empresa DATE,
          data_saida_empresa DATE,
          codigo_perfil_usuario_empresa TEXT,
          status_usuario_empresa TEXT DEFAULT 'ativo',
          cargo_usuario_empresa TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (codigo_empresa) REFERENCES empresas (codigo_empresa)
        );`
      );

      // Tabela de tarefas
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tarefas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_tarefa TEXT UNIQUE NOT NULL,
          codigo_empresa TEXT NOT NULL,
          codigo_usuario TEXT NOT NULL,
          data_tarefa DATE NOT NULL,
          data_inicio_tarefa DATETIME,
          data_fim_tarefa DATETIME,
          descricao_tarefa TEXT NOT NULL,
          status_tarefa TEXT DEFAULT 'pendente',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (codigo_empresa) REFERENCES empresas (codigo_empresa),
          FOREIGN KEY (codigo_usuario) REFERENCES usuarios (codigo_usuario)
        );`
      );

      // Tabela de ponto
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ponto (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_empresa TEXT NOT NULL,
          codigo_usuario TEXT NOT NULL,
          data_marcacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          tipo_marcacao TEXT DEFAULT 'entrada',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (codigo_empresa) REFERENCES empresas (codigo_empresa),
          FOREIGN KEY (codigo_usuario) REFERENCES usuarios (codigo_usuario)
        );`
      );

      // Tabela de férias
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ferias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_empresa TEXT NOT NULL,
          codigo_usuario TEXT NOT NULL,
          data_ferias DATE NOT NULL,
          status_ferias TEXT DEFAULT 'pendente',
          aprovador_ferias TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (codigo_empresa) REFERENCES empresas (codigo_empresa),
          FOREIGN KEY (codigo_usuario) REFERENCES usuarios (codigo_usuario)
        );`
      );

      // Tabela de justificativas
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS justificativas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_justificativa TEXT UNIQUE NOT NULL,
          codigo_empresa TEXT NOT NULL,
          codigo_usuario TEXT NOT NULL,
          tipo_justificativa TEXT NOT NULL,
          data_criacao_justificativa DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_alteracao_justificativa DATETIME,
          status_justificativa TEXT DEFAULT 'pendente',
          aprovador_justificativa TEXT,
          descricao TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (codigo_empresa) REFERENCES empresas (codigo_empresa),
          FOREIGN KEY (codigo_usuario) REFERENCES usuarios (codigo_usuario)
        );`
      );

    }, 
    (error) => {
      console.error('Erro ao criar tabelas:', error);
      reject(error);
    },
    () => {
      console.log('Banco de dados inicializado com sucesso!');
      resolve();
    });
  });
};

export { db };