import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "green" | "red" | "blue" | "purple";
  sublabel?: string;
  className?: string;
}

const StatCard = ({ label, value, icon: Icon, variant = "blue", sublabel, className }: StatCardProps) => {
  const variantStyles = {
    green: {
      bg: "bg-green-500/10",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      border: "border-green-500/20",
      glow: "hover:shadow-green-500/20"
    },
    red: {
      bg: "bg-red-500/10",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      border: "border-red-500/20",
      glow: "hover:shadow-red-500/20"
    },
    blue: {
      bg: "bg-blue-500/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      border: "border-blue-500/20",
      glow: "hover:shadow-blue-500/20"
    },
    purple: {
      bg: "bg-purple-500/10",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
      border: "border-purple-500/20",
      glow: "hover:shadow-purple-500/20"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6 border transition-all duration-300 group",
        "bg-[#131824] border-white/5",
        `hover:border-${variant}-500/30 hover:shadow-lg ${styles.glow}`,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", styles.iconBg)}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>
      
      <div>
        <p className="text-gray-400 text-sm mb-2">{label}</p>
        <p className="text-3xl font-bold text-white mb-1">
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-500">{sublabel}</p>
        )}
      </div>

      {/* Subtle gradient overlay */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", styles.bg)} />
    </div>
  );
};

export default StatCard;
