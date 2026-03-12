import { useState, useEffect } from 'react';
import { UserProfile, UserConfig } from '../types';
import { db } from '../services/db';
// FIX: Import 'encryptData' to be used when creating a new user's vault.
import { hashPin, decryptData, encryptData } from '../services/cryptoService';
import { authenticateBiometrics } from '../services/webauthnService';
import { useNotification } from '../contexts/NotificationContext';

export type AppView = 'SPLASH' | 'AUTH' | 'DASHBOARD';
export type AuthMode = 'LOGIN' | 'REGISTER' | 'RECOVERY';

const useAuth = () => {
  const [view, setView] = useState<AppView>('SPLASH');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [sessionKey, setSessionKey] = useState<string>('');
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [authError, setAuthError] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');

  const { addNotification } = useNotification();

  useEffect(() => {
    const startup = async () => {
      await db.init();
      const loadedUsers = await db.getUsers();
      setUsers(loadedUsers);
      if (loadedUsers.length > 0) {
        setActiveUser(loadedUsers[0]);
      } else {
        setAuthMode('REGISTER');
      }
      setTimeout(() => setView('AUTH'), 2000);
    };
    startup();
  }, []);

  const handleAuthSuccess = (user: UserProfile, config: UserConfig, userPin: string) => {
    setSessionKey(userPin);
    localStorage.setItem('QAV_SESSION_USER', JSON.stringify({ user, config }));
    setView('DASHBOARD');
    setAuthError('');
    setPin('');
    setConfirmPin('');
  };

  const handleLogin = async () => {
    if (!activeUser || !pin) return setAuthError("PIN required.");
    const config = await db.getUserConfig(activeUser.id);
    if (config) {
      const hashed = await hashPin(pin);
      if (hashed === config.masterHash) {
        handleAuthSuccess(activeUser, config, pin);
      } else {
        setAuthError("PROTOCOL ERROR: INVALID PIN");
      }
    } else {
      setAuthError("Configuration not found for user.");
    }
  };

  const handleBiometricLogin = async () => {
    if (!activeUser) return;
    const config = await db.getUserConfig(activeUser.id);
    if (config?.biometricCredential) {
      setProcessMessage("VERIFYING BIOMETRICS...");
      setIsProcessing(true);
      const success = await authenticateBiometrics(config.biometricCredential.id);
      setIsProcessing(false);
      if (success) {
        // In a real scenario, you'd use the biometric assertion to get a session key
        // from a server. For this client-side model, we need a fallback.
        // This is a conceptual limitation of a purely client-side model with biometrics.
        addNotification({ message: 'Biometric success! PIN still required for decryption.', type: 'info' });
      } else {
        setAuthError("BIOMETRIC CHALLENGE FAILED");
      }
    } else {
      addNotification({ message: 'Biometrics not registered for this user.', type: 'warning' });
    }
  };

  const handleRegister = async () => {
    if (!newUserName || pin.length < 4) return setAuthError("NAME & 4-DIGIT PIN MINIMUM REQUIRED");
    if (pin !== confirmPin) return setAuthError("PIN MISMATCH DETECTED");

    setProcessMessage("INITIALIZING IDENTITY...");
    setIsProcessing(true);

    const newId = crypto.randomUUID();
    const newUser: UserProfile = { id: newId, name: newUserName, createdAt: Date.now() };
    const hashed = await hashPin(pin);
    const config: UserConfig = {
      userId: newId,
      setupComplete: true,
      masterHash: hashed,
      biometricsEnabled: false,
      recoveryEmail: '',
      autoLockTimer: 5,
      theme: 'cyan',
    };

    try {
        await db.saveUser(newUser);
        await db.saveUserConfig(config);
        // Create an empty vault for the new user
        await db.saveVaultData(newId, await encryptData([], pin));

        setUsers([...users, newUser]);
        setActiveUser(newUser);
        setAuthMode('LOGIN');
        addNotification({ message: `Identity ${newUserName} created successfully.`, type: 'success' });
    } catch (e) {
        setAuthError("Failed to register identity on the server.");
    } finally {
        setIsProcessing(false);
    }
  };

  const logout = () => {
    setSessionKey('');
    localStorage.removeItem('QAV_SESSION_USER');
    setView('AUTH');
    setPin('');
    setAuthError('SESSION TERMINATED');
  };

  return {
    view,
    authMode,
    setAuthMode,
    users,
    activeUser,
    setActiveUser,
    sessionKey,
    pin,
    setPin,
    confirmPin,
    setConfirmPin,
    newUserName,
    setNewUserName,
    authError,
    setAuthError,
    isProcessing,
    processMessage,
    handleLogin,
    handleRegister,
    handleBiometricLogin,
    logout,
  };
};

export default useAuth;