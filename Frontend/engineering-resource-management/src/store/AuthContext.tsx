import { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { User } from '../lib/types';

// --- State and Action Types (Unchanged) ---
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

type Action =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: { user: User } };

// --- Context Shape (Unchanged) ---
interface AuthContextType extends AuthState {
  dispatch: Dispatch<Action>;
}

// --- Context Creation (This is a key part) ---
// We provide a default value that matches the context's type.
// This prevents errors in components that might render before the provider.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- The Reducer (Unchanged, it's correct) ---
const authReducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      // Also clear localStorage on logout for safety
      localStorage.removeItem('authState');
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

// --- The Initializer Function (Best Practice) ---
// This function runs only ONCE, preventing re-calculation on every render.
const initializeState = (): AuthState => {
  try {
    const storedState = localStorage.getItem('authState');
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      // Ensure the parsed state has the necessary properties before returning
      if (parsedState.user && parsedState.token && parsedState.isAuthenticated) {
        return parsedState;
      }
    }
  } catch (error) {
    console.error("Failed to parse auth state from localStorage", error);
  }
  // Return a clean default state if anything goes wrong
  return { user: null, token: null, isAuthenticated: false };
};


// --- The Provider Component (Updated & Corrected) ---
const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use lazy initialization: pass the initializer function as the 3rd argument.
  // This is more performant and type-safe.
  const [state, dispatch] = useReducer(authReducer, undefined, initializeState);

  // Use an effect to persist state changes to localStorage
  useEffect(() => {
    // Only save state to localStorage if the user is authenticated
    if (state.isAuthenticated) {
      localStorage.setItem('authState', JSON.stringify(state));
    }
  }, [state]); // This effect runs whenever the state changes

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// Use a default export for the provider. This is a common convention.
export default AuthProvider;