import React from 'react';

interface SplashViewProps {
  appTitle: string;
  AppIcon: React.ElementType;
}

const SplashView: React.FC<SplashViewProps> = ({ appTitle, AppIcon }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 gpu">
      <div className="relative mb-12 animate-float">
        <div className="absolute inset-0 scale-150 blur-3xl bg-purple-600/30 animate-pulse"></div>
        <AppIcon className="w-40 h-40 text-purple-400 relative z-10" />
      </div>
      <h1 className="text-5xl font-orbitron tracking-[0.5em] text-white glow-text uppercase mb-2 text-center px-4">{appTitle}</h1>
      <p className="mt-6 font-mono text-purple-500/80 tracking-[0.3em] text-xs animate-pulse uppercase">BOOTING SECURE CORE ENCLAVE...</p>
    </div>
  );
};

export default SplashView;
