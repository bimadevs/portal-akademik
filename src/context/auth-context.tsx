import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { StorageService } from '@/services/storage';
import { UserSession } from '@/types/mahasiswa';

interface AuthContextType {
  userSession: UserSession | null;
  isLoading: boolean;
  login: (
    user: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login: cek status sesi persisten saat aplikasi dibuka
  useEffect(() => {
    let isMounted = true;

    async function checkPersistedSession() {
      try {
        const session = await StorageService.getSession();
        if (isMounted) {
          setUserSession(session);
        }
      } catch (e) {
        console.error('Error saat memeriksa sesi tersimpan:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkPersistedSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (
    user: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = user.trim();
    const cleanPass = pass.trim();

    // Validasi kredensial default admin/admin sesuai FR-01
    if (cleanUser === 'admin' && cleanPass === 'admin') {
      const newSession: UserSession = {
        username: cleanUser,
        isLoggedIn: true,
        loginTime: Date.now(),
      };
      await StorageService.saveSession(newSession);
      setUserSession(newSession);
      return { success: true };
    }

    return {
      success: false,
      error: 'User atau Password salah!',
    };
  };

  const logout = async () => {
    await StorageService.clearSession();
    setUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userSession,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
