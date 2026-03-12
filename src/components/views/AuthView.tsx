import React from 'react';
import { UserProfile } from '../../types';
import { AuthMode } from '../../hooks/useAuth';
import { NeonCard, NeonInput, NeonButton } from '../UI';
import { User, Fingerprint } from 'lucide-react';

interface AuthViewProps {
  error: string;
  pin: string;
  setPin: (pin: string) => void;
  confirmPin: string;
  setConfirmPin: (pin: string) => void;
  newUserName: string;
  setNewUserName: (name: string) => void;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  users: UserProfile[];
  activeUser: UserProfile | null;
  setActiveUser: (user: UserProfile | null) => void;
  onLogin: () => void;
  onRegister: () => void;
  onBiometricLogin: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({
  error, pin, setPin, confirmPin, setConfirmPin, newUserName, setNewUserName,
  authMode, setAuthMode, users, activeUser, setActiveUser,
  onLogin, onRegister, onBiometricLogin
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 auth-bg relative gpu">
      <div className="z-10 w-full max-w-md animate-in-zoom">
        <NeonCard variant="purple" className="shadow-2xl ring-1 ring-purple-500/20">
          <div className="flex border-b border-purple-900/30 mb-10 rounded-t-2xl overflow-hidden bg-black/20">
            {['LOGIN', 'REGISTER'].map((mode: any) => (
              <button
                key={mode}
                onClick={() => setAuthMode(mode)}
                className={`flex-1 py-5 font-orbitron text-[10px] tracking-[0.3em] transition-all duration-300 ${authMode === mode ? 'text-purple-400 bg-purple-950/40 border-b-2 border-purple-500' : 'text-slate-600 hover:text-purple-300 hover:bg-purple-950/10'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {authMode === 'LOGIN' && (
              <div className="space-y-6">
                <div className="max-h-52 overflow-y-auto space-y-3 mb-6 custom-scrollbar pr-2 -mr-2">
                  {users.map(u => (
                    <button key={u.id} onClick={() => setActiveUser(u)}
                      className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${activeUser?.id === u.id ? 'bg-purple-900/50 border-purple-500 text-white' : 'bg-slate-900/60 border-slate-800/50 text-slate-500 hover:bg-slate-800'}`}>
                      <User className="w-5 h-5" />
                      <span className="font-bold tracking-[0.1em] text-sm">{u.name.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
                <NeonInput type="password" placeholder="VAULT ACCESS PIN" value={pin} onChange={e => setPin(e.target.value)} className="text-center tracking-[1.5em] text-3xl font-bold h-16" />
                <div className="flex gap-4 pt-2">
                  <NeonButton onClick={onLogin} className="flex-1 bg-purple-600 h-14">ACCESS ENCLAVE</NeonButton>
                  {(activeUser) && <button onClick={onBiometricLogin} className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl text-purple-400"><Fingerprint className="w-7 h-7" /></button>}
                </div>
              </div>
            )}
            {authMode === 'REGISTER' && (
              <div className="space-y-5 animate-in-fade">
                <NeonInput placeholder="IDENTITY NAME" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                <NeonInput type="password" placeholder="MASTER PIN (4+ DIGITS)" value={pin} onChange={e => setPin(e.target.value)} />
                <NeonInput type="password" placeholder="CONFIRM PIN" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} />
                <NeonButton onClick={onRegister} className="w-full bg-purple-600 h-14 mt-4">INITIALIZE IDENTITY</NeonButton>
              </div>
            )}
            {error && <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-[10px] text-red-400 text-center animate-pulse uppercase">{error}</div>}
          </div>
        </NeonCard>
      </div>
    </div>
  );
};

export default AuthView;
