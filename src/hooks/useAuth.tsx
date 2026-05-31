import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  userId: string;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userId: '',
  signIn: () => {},
  signOut: () => {},
});

const LOCAL_KEY = 'cvcraft_user_id';

function getOrCreateLocalUser(): string {
  let id = localStorage.getItem(LOCAL_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(LOCAL_KEY, id);
  }
  return id;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>(getOrCreateLocalUser);

  const signIn = useCallback(() => {
    setUserId(getOrCreateLocalUser());
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(LOCAL_KEY);
    setUserId(getOrCreateLocalUser());
  }, []);

  return (
    <AuthContext.Provider value={{ userId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
