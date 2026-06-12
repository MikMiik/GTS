export interface User {
  userId: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  email?: string;
  name?: string;
}

export interface RegisterResponse {
  email: string;
  fullName: string;
  role: string;
  userId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
}
