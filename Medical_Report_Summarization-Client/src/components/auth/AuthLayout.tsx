import { type ReactNode } from "react";
import { Activity } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display antialiased">
      {/* Left Side: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-teal/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <Activity className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SmartMeds AI</h1>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Your health,
            <br />
            <span className="text-accent-teal">clearly explained.</span>
          </h2>
          <p className="text-slate-200 text-lg max-w-md leading-relaxed">
            Harness the power of artificial intelligence to understand your
            medical reports and imaging with unprecedented clarity.
          </p>

          <div className="mt-12 w-full max-w-md aspect-square bg-primary/40 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
            <img
              alt="Digital medical imaging scan on high-tech display"
              className="w-full h-full object-cover mix-blend-overlay opacity-60"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOgUm429V7wN-9O_z8rbFxjYPRKgfmUYW_yLeuGqxA-0ehn48N2QR6dfIx2r3w8U0Sl3fxb9QL_9G-ld20mmfFNpA_FV0xZ4RyqvPTa4YUHmH08tZaPwXkEuObD_pQnAUvj2rXqGE5LM78VRhgv6jsBIThJI-NKoiVuaHOzJja-zLlfPhjS52AQ2YA_YjhO-czcoIe5ve_d6v8IfHDtG5f_geo48NhZ0Dc3J5w56thqjH9bbM1B9PGeudSNeCx4shahXOdiiam1QQ"
            />
          </div>
        </div>

        <div className="relative z-10 text-slate-400 text-sm">
          © {new Date().getFullYear()} SmartMeds AI. HIPAA Compliant & Secure.
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-white dark:bg-background-dark">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2 text-primary dark:text-slate-100">
              <Activity className="h-8 w-8" />
              <span className="text-xl font-bold">SmartMeds AI</span>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
