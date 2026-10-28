import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import AuthLayout from "../../components/auth/AuthLayout";
import TextInput from "../../components/shared/TextInput";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => login(data.email, data.password),
    onSuccess: (res) => {
      setAuthLogin(res.data.access_token, res.data.refresh_token, res.data.expires_at, res.data.profile); 
      toast.success("Logged in successfully");
      
      const role = (res.data.user as any)?.role || "patient";
      if (role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Invalid email or password");
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Log in to your account to continue."
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        
        <TextInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          rightIcon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          {...register("password")}
        />
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <input 
              id="remember" 
              type="checkbox" 
              className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer w-4 h-4" 
            />
            <label className="text-sm text-slate-500 dark:text-slate-400" htmlFor="remember">
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm text-primary dark:text-accent-teal font-semibold hover:underline">
            Forgot password?
          </a>
        </div>
        
        <button 
          type="submit" 
          disabled={loginMutation.isPending}
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? "Logging in..." : "Log In"}
          {!loginMutation.isPending && <LogIn className="h-5 w-5" />}
        </button>
      </form>
      
      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          Don't have an account? 
          <Link to="/auth/signup" className="text-primary dark:text-accent-teal font-bold hover:underline ml-1">Sign up here</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
