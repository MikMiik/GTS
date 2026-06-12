import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginCredentials,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  User,
  VerifyEmailRequest,
} from "@/types/auth";
import { get, post } from "@/utils/httpRequest";

const authService = {
  me: async () => get<User>("api/auth/me"),
  register: async (data: RegisterRequest) =>
    post<RegisterResponse>("api/auth/register", data),
  login: async (data: LoginCredentials) => post<User>("api/auth/login", data),
  logout: async () => post<void>("api/auth/logout"),
  forgotPassword: async (data: ForgotPasswordRequest) =>
    post<void>("api/auth/forgot-password", data),
  resetPassword: async (data: ResetPasswordRequest) =>
    post<void>("api/auth/reset-password", data),
  changePassword: async (data: ChangePasswordRequest) =>
    post<void>("api/auth/change-password", data),
  verifyEmail: async (data: VerifyEmailRequest) =>
    post<void>("api/auth/verify-email", data),
  googleLogin: async (data: GoogleLoginRequest) =>
    post<User>("api/auth/google-login", data),
};

export default authService;
