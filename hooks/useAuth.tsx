import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface AuthUser {
  _id: string;
  name: string;
  role: string;
  type: string;
  card_id?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("auth_user").then((value) => {
      if (value) setUser(JSON.parse(value));
      setIsLoading(false);
    });
  }, []);

  const handleSetUser = async (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      await AsyncStorage.setItem("auth_user", JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem("auth_user");
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser: handleSetUser, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
