// UserContext.js
// This file defines the UserContext and UserProvider components used to manage user authentication state throughout the application.
// The UserProvider component wraps the entire application or specific parts of it to provide user information via React Context API.
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      try {
        // verify the session with backend
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE}/api/auth/session/verify`, {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            ...currentUser,
            ...userData // include any additional user data from backend
          });
        } else {
          // backend session varification failed
          await firebaseSignOut(auth);
          setUser(null);
        }
      } catch (error) {
        console.error("Session verification error:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  });
  return () => unsubscribe();
}, []);

const signOut = async () => {
  try {
    // clear the backend session
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    await fetch('${API_BASE}/api/auth/session', {
      method: "DELETE",
      credentials: 'include'
    });

    // clear Firebase session
    await firebaseSignOut(auth);
    setUser(null);
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}