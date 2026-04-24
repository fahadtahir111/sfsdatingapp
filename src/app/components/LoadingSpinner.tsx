"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "stone";
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = "md", 
  color = "primary", 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4"
  };

  const colorClasses = {
    primary: "border-yellow-400 border-t-transparent",
    stone: "border-stone-200 border-t-stone-900"
  };

  const spinner = (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
