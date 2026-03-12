import React from 'react';
import useAuth from './hooks/useAuth';
import useAppConfig from './hooks/useAppConfig';
import AuthView from './components/views/AuthView';
import SplashView from './components/views/SplashView';
import DashboardView from './components/views/DashboardView';
import { NotificationDisplay } from './components/shared/Notification';
import { VaultProvider } from './contexts/VaultContext';
// FIX: Import Aperture icon from lucide-react.
import { Aperture } from 'lucide-react';

const App: React.FC = () => {
  const { appConfig, AppIcon } = useAppConfig();
  const {
    view,
    authError,
    pin,
    setPin,
    confirmPin,
    setConfirmPin,
    newUserName,
    setNewUserName,
    authMode,
    setAuthMode,
    users,
    activeUser,
    setActiveUser,
    handleLogin,
    handleRegister,
    handleBiometricLogin,
    isProcessing,
    processMessage,
    logout,
  } = useAuth();

  const renderView = () => {
    switch (view) {
      case 'SPLASH':
        return <SplashView appTitle={appConfig.appTitle} AppIcon={AppIcon} />;
      
      case 'AUTH':
        return (
          <AuthView
            error={authError}
            pin={pin}
            setPin={setPin}
            confirmPin={confirmPin}
            setConfirmPin={setConfirmPin}
            newUserName={newUserName}
            setNewUserName={setNewUserName}
            authMode={authMode}
            setAuthMode={setAuthMode}
            users={users}
            activeUser={activeUser}
            setActiveUser={setActiveUser}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onBiometricLogin={handleBiometricLogin}
          />
        );
        
      case 'DASHBOARD':
        if (activeUser) {
          return (
            <VaultProvider user={activeUser}>
              <DashboardView
                user={activeUser}
                appConfig={appConfig}
                AppIcon={AppIcon}
                onLogout={logout}
              />
            </VaultProvider>
          );
        }
        return null; // Should not happen if logic is correct
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-rajdhani overflow-hidden selection:bg-purple-500/40 gpu">
      {renderView()}
      
      {/* Global Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in-fade gpu">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
            <Aperture className="w-20 h-20 text-purple-400 animate-spin" />
          </div>
          <span className="font-orbitron tracking-[0.5em] text-purple-400 uppercase text-sm">{processMessage}</span>
        </div>
      )}
      <NotificationDisplay />
    </div>
  );
};

export default App;