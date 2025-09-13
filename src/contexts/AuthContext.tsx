import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import MockDataService, { Usuario } from '../services/MockDataService';
import StorageService from '../services/StorageService';
import { isWeb, initializeWebData, getWebUser, setWebUser, clearWebUser } from '../utils/webInit';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (updatedUser: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('AuthContext: Inicializando app...');
      
      // Inicializar dados específicos para web
      if (isWeb) {
        initializeWebData();
      }
      
      await MockDataService.initializeDefaultData();
      console.log('AuthContext: Dados padrão inicializados');
      await checkAuthState();
      console.log('AuthContext: Estado de autenticação verificado');
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
    } finally {
      console.log('AuthContext: Finalizando inicialização, setLoading(false)');
      setLoading(false);
    }
  };

  const checkAuthState = async () => {
    try {
      console.log('AuthContext: Verificando estado de autenticação...');
      let userId;
      if (isWeb) {
        // No web, usar localStorage diretamente
        userId = localStorage.getItem('userId');
      } else {
        // No mobile, usar StorageService
        userId = await StorageService.getItem('userId');
      }
      console.log('AuthContext: userId do Storage:', userId);
      
      if (userId) {
        const userData = MockDataService.getUsuarioById(userId);
        console.log('AuthContext: userData encontrado:', userData);
        if (userData) {
          setUser(userData);
          console.log('AuthContext: Usuário definido no estado:', userData);
        } else {
          console.log('AuthContext: Usuário não encontrado no MockDataService');
        }
      } else {
        console.log('AuthContext: Nenhum userId encontrado no Storage');
      }
    } catch (error) {
      console.error('Erro ao verificar estado de autenticação:', error);
    }
  };

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Tentando autenticar usuário:', email);
      const authenticatedUser = MockDataService.authenticateUser(email, senha);
      console.log('AuthContext: Usuário autenticado:', authenticatedUser);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        
        if (isWeb) {
          // No web, usar localStorage diretamente
          localStorage.setItem('userId', authenticatedUser.id);
          localStorage.setItem('userEmail', authenticatedUser.email);
          localStorage.setItem('userPerfil', authenticatedUser.perfil);
          localStorage.setItem('empresaId', authenticatedUser.empresaId);
          setWebUser(authenticatedUser);
        } else {
          // No mobile, usar StorageService
          await StorageService.setItem('userId', authenticatedUser.id);
          await StorageService.setItem('userEmail', authenticatedUser.email);
          await StorageService.setItem('userPerfil', authenticatedUser.perfil);
          await StorageService.setItem('empresaId', authenticatedUser.empresaId);
        }
        
        console.log('AuthContext: Login bem-sucedido, usuário salvo');
        return true;
      }
      console.log('AuthContext: Falha na autenticação');
      return false;
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      
      if (isWeb) {
        // No web, usar localStorage diretamente
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPerfil');
        localStorage.removeItem('empresaId');
        clearWebUser();
      } else {
        // No mobile, usar StorageService
        await StorageService.removeItem('userId');
        await StorageService.removeItem('userEmail');
        await StorageService.removeItem('userPerfil');
        await StorageService.removeItem('empresaId');
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateUser = (updatedUser: Usuario) => {
    console.log('AuthContext: Atualizando usuário:', updatedUser);
    setUser(updatedUser);
    
    if (isWeb) {
      setWebUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
