import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { ROLES } from "../../constants";
import { useAuth } from "../../context/AuthContext";

interface PageLayoutProps {
  role?: string;
  children: ReactNode;
}

export const PageLayout = ({ role, children }: PageLayoutProps) => {
  const { profile } = useAuth();
  const userRole = role || profile?.role || ROLES.PATIENT;

  return (
    <div className="flex min-h-screen w-full bg-background dark:bg-slate-950 font-display text-slate-900 dark:text-slate-100">
      <Sidebar role={userRole} />

      <div className={`flex-1 flex flex-col ml-32 transition-all duration-300`}>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default PageLayout;
