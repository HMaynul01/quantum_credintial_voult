import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  FileText,
  Activity,
  Calendar,
  FilePlus,
  User,
  Phone,
  Mail,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { dbService, UserProfile, MedicalRecord } from "../services/localDb";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";

export const UserDashboard = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "bill" | "invoice" | "test_report" | "appointment" | "prescription"
  >("all");
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLogo = localStorage.getItem("appLogo");
    if (savedLogo) {
      setAppLogo(savedLogo);
    }

    const loadData = async () => {
      const currentUserId = localStorage.getItem("currentUser");
      if (!currentUserId) {
        navigate("/");
        return;
      }

      const userData = await dbService.getUser(currentUserId);
      if (!userData) {
        navigate("/");
        return;
      }

      setUser(userData);
      const userRecords = await dbService.getRecordsByUser(currentUserId);
      setRecords(userRecords.sort((a, b) => b.date - a.date));
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const filteredRecords =
    activeTab === "all" ? records : records.filter((r) => r.type === activeTab);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-500">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)] overflow-hidden">
              {appLogo ? (
                <img
                  src={appLogo}
                  alt="App Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Activity className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-orbitron font-bold text-white glow-text">
                NORI KSA
              </h1>
              <p className="text-cyan-200/70 text-xs uppercase tracking-widest">
                Patient Portal
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline text-sm uppercase tracking-wider">
              Logout
            </span>
          </button>
        </header>

        {/* User Profile Card */}
        <div className="neon-card-wrapper mb-8">
          <div className="neon-card-inner variant-dark p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-cyan-500/50 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-slate-800 flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-cyan-500/50" />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name}
              </h2>
              <p className="text-cyan-400 font-mono text-sm mb-4">
                ID: {user.patientId}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-4 h-4 text-teal-400" />
                  <span>{user.phone || "N/A"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4 text-teal-400" />
                  <span>{user.email || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
          {[
            { id: "all", label: "All Records", icon: Activity },
            { id: "appointment", label: "Appointments", icon: Calendar },
            { id: "test_report", label: "Test Reports", icon: FileText },
            { id: "prescription", label: "Prescriptions", icon: FilePlus },
            { id: "invoice", label: "Invoices", icon: FileText },
            { id: "bill", label: "Bills", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "bg-slate-900/50 text-slate-400 border border-slate-800 hover:bg-slate-800",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No records found in this category.</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="bg-slate-900/60 border border-cyan-900/30 rounded-xl p-5 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
                          record.type === "appointment"
                            ? "bg-purple-500/20 text-purple-300"
                            : record.type === "test_report"
                              ? "bg-blue-500/20 text-blue-300"
                              : record.type === "prescription"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-orange-500/20 text-orange-300",
                        )}
                      >
                        {record.type.replace("_", " ")}
                      </span>
                      <span className="text-slate-400 text-sm font-mono">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {record.title}
                    </h3>
                    <p className="text-slate-300 text-sm mb-3">
                      {record.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      {record.doctorName && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" /> Dr. {record.doctorName}
                        </div>
                      )}
                      {record.department && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {record.department}
                        </div>
                      )}
                      {record.amount && (
                        <div className="flex items-center gap-1 text-emerald-400 font-mono">
                          SAR {record.amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {record.fileData && (
                    <div className="shrink-0 flex flex-col items-center justify-center sm:border-l sm:border-slate-800 sm:pl-4">
                      {record.fileType?.startsWith("image/") ? (
                        <a
                          href={record.fileData}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 block"
                        >
                          <img
                            src={record.fileData}
                            alt="Document"
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="w-6 h-6 text-white" />
                          </div>
                        </a>
                      ) : (
                        <a
                          href={record.fileData}
                          download={`${record.title.replace(/\s+/g, "_")}.pdf`}
                          className="flex flex-col items-center justify-center w-20 h-20 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-cyan-400"
                        >
                          <FileText className="w-8 h-8 mb-1" />
                          <span className="text-[10px] uppercase">
                            Download
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {record.analysis && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400 font-medium text-sm">
                      <Sparkles className="w-4 h-4" /> AI Analysis
                    </div>
                    <div className="text-sm text-slate-300 prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-cyan-400 prose-headings:text-white prose-strong:text-cyan-300">
                      <ReactMarkdown>{record.analysis}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
