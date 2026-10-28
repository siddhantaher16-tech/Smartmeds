import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Stethoscope, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signup } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import AuthLayout from "../../components/auth/AuthLayout";
import TextInput from "../../components/shared/TextInput";

const signupSchema = z.object({
  role: z.enum(["patient", "doctor"]),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "patient",
      fullName: "",
      email: "",
      password: "",
    },
  });

  const role = watch("role");

  const signupMutation = useMutation({
    mutationFn: (data: SignupFormValues) =>
      signup(data.fullName, data.email, data.password, data.role),
    onSuccess: (res) => {
      login(res.data.access_token, res.data.refresh_token, res.data.expires_at, res.data.profile); 
      toast.success("Account created successfully");
      navigate("/onboarding");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to create account");
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate(data);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of users simplifying their healthcare."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Role Selector */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Choose your role
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue("role", "patient")}
              className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                role === "patient"
                  ? "border-accent-teal bg-accent-teal/5"
                  : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/30"
              }`}
            >
              <User
                className={`h-8 w-8 mb-2 ${role === "patient" ? "text-accent-teal" : "text-slate-400"}`}
              />
              <span
                className={`text-sm font-bold ${role === "patient" ? "text-primary" : "text-slate-600 dark:text-slate-400"}`}
              >
                I am a Patient
              </span>
            </button>

            <button
              type="button"
              onClick={() => setValue("role", "doctor")}
              className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                role === "doctor"
                  ? "border-accent-teal bg-accent-teal/5"
                  : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/30"
              }`}
            >
              <Stethoscope
                className={`h-8 w-8 mb-2 ${role === "doctor" ? "text-accent-teal" : "text-slate-400"}`}
              />
              <span
                className={`text-sm font-bold ${role === "doctor" ? "text-primary" : "text-slate-600 dark:text-slate-400"}`}
              >
                I am a Doctor
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <TextInput
            id="full-name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
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
        </div>

        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {signupMutation.isPending ? "Creating Account..." : "Create Account"}
          {!signupMutation.isPending && <ArrowRight className="h-5 w-5" />}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          Already have an account?
          <Link
            to="/auth/login"
            className="text-primary dark:text-accent-teal font-bold hover:underline ml-1"
          >
            Login here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
