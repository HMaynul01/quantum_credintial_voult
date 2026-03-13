import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ShieldAlert, User, Key } from "lucide-react";
import { dbService } from "../services/localDb";

export const Login = () => {
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState("");
  const [logoClicks, setLogoClicks] = useState(0);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLogo = localStorage.getItem("appLogo");
    if (savedLogo) {
      setAppLogo(savedLogo);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!patientId.trim()) {
      setError("Please enter your Patient ID");
      return;
    }

    try {
      const users = await dbService.getAllUsers();
      const user = users.find((u) => u.patientId === patientId);

      if (user) {
        localStorage.setItem("currentUser", user.id);
        navigate("/dashboard");
      } else {
        setError("Patient ID not found. Please contact administration.");
      }
    } catch (err) {
      setError("An error occurred during login.");
    }
  };

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 5) {
      navigate("/admin-hidden-panel");
    }

    // Reset clicks after 3 seconds
    setTimeout(() => {
      setLogoClicks(0);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="neon-card-wrapper">
          <div className="neon-card-inner variant-dark p-8 flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full bg-slate-900 border-2 border-cyan-500/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer transition-transform active:scale-95 overflow-hidden"
              onClick={handleLogoClick}
            >
              {appLogo ? (
                <img
                  src={appLogo}
                  alt="App Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Activity className="w-12 h-12 text-cyan-400" />
              )}
            </div>

            <h1 className="text-3xl font-orbitron font-bold text-white mb-2 text-center glow-text">
              NORI KSA
            </h1>
            <p className="text-cyan-200/70 text-sm mb-8 text-center uppercase tracking-widest">
              Hospital Patient Portal
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-cyan-300/80 font-medium uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Patient ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                    placeholder="Enter your Patient ID"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all uppercase tracking-wider flex items-center justify-center gap-2 touch-ripple"
              >
                <Key className="w-5 h-5" /> Access Records
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                Secure Offline Storage • No Data Connection Required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
