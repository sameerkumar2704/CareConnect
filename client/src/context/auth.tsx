import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: any;
    admin: any;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    setAdmin: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

import { ReactNode } from "react";
import { verifyToken } from "../utils/auth";
import { SECRET_KEY } from "../utils/contants";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    interface UserType {
        ok: string;
        role: any;
        _id: any;
    }

    const [user, setUser] = useState<UserType | null>(null);
    const [admin, setAdmin] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const checkUser = async () => {
            try {
                const token = localStorage.getItem("eWauthToken");

                console.log("Token At Verification", token);

                if (!token) {
                    setUser(null);
                    setAdmin(null);
                    setLoading(false);
                    return;
                }

                const response = await verifyToken(token);

                if (response.ok) {
                    setUser(response);

                    if (response.role === SECRET_KEY) {
                        setAdmin(response);
                    } else {
                        setAdmin(null);
                    }
                } else {
                    setUser(null);
                    setAdmin(null);
                }
            } catch (err) {
                setUser(null);
                setAdmin(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, admin, loading, setUser, setAdmin }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

