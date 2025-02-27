
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

type User = {
  id: number;
  username: string;
  fullName: string;
  subject?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName: string, subject?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}

// Composant Provider qui fournit le contexte
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/user");
        setUser(response.data);
      } catch (error) {
        // Utilisateur non authentifié, c'est normal
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/login", { username, password });
      setUser(response.data);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${response.data.fullName}!`,
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Identifiants incorrects ou compte inexistant",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (username: string, password: string, fullName: string, subject?: string) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/register", { 
        username, 
        password, 
        fullName,
        subject 
      });
      setUser(response.data);
      toast({
        title: "Inscription réussie",
        description: `Bienvenue, ${response.data.fullName}!`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: "Impossible de créer le compte. Vérifiez que le nom d'utilisateur n'est pas déjà utilisé.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post("/api/logout");
      setUser(null);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt!",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
