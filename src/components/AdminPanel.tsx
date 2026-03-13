import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  FilePlus,
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { dbService, UserProfile, MedicalRecord } from "../services/localDb";
import { cn } from "../lib/utils";

export const AdminPanel = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"users" | "records">("users");
  const navigate = useNavigate();

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // User Form State
  const [userForm, setUserForm] = useState<Partial<UserProfile>>({
    name: "",
    patientId: "",
    phone: "",
    email: "",
    avatar: "",
  });

  // Record Form State
  const [recordForm, setRecordForm] = useState<Partial<MedicalRecord>>({
    type: "test_report",
    title: "",
    description: "",
    amount: 0,
    doctorName: "",
    department: "",
    status: "pending",
    fileData: "",
    fileType: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadUsers = async () => {
    const allUsers = await dbService.getAllUsers();
    setUsers(allUsers);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.patientId) {
      showMessage("Name and Patient ID are required", "error");
      return;
    }

    const newUser: UserProfile = {
      id: userForm.id || Date.now().toString(),
      name: userForm.name,
      patientId: userForm.patientId,
      phone: userForm.phone || "",
      email: userForm.email || "",
      avatar: userForm.avatar,
      createdAt: userForm.createdAt || Date.now(),
    };

    await dbService.addUser(newUser);
    setUserForm({ name: "", patientId: "", phone: "", email: "", avatar: "" });
    loadUsers();
    showMessage("User saved successfully", "success");
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      showMessage("Please select a user first", "error");
      return;
    }
    if (!recordForm.title || !recordForm.type) {
      showMessage("Title and Type are required", "error");
      return;
    }

    let analysisResult = "";
    if (recordForm.fileData && recordForm.fileType) {
      setIsAnalyzing(true);
      showMessage("Analyzing document...", "success");
      try {
        const { analyzeDocument } = await import("../services/geminiService");
        analysisResult = await analyzeDocument(
          recordForm.fileData,
          recordForm.fileType,
          recordForm.type,
        );
      } catch (error) {
        console.error("Analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      userId: selectedUserId,
      type: recordForm.type as any,
      title: recordForm.title,
      date: Date.now(),
      description: recordForm.description || "",
      amount: recordForm.amount,
      doctorName: recordForm.doctorName,
      department: recordForm.department,
      status: recordForm.status,
      fileData: recordForm.fileData,
      fileType: recordForm.fileType,
      analysis: analysisResult,
      createdAt: Date.now(),
    };

    await dbService.addRecord(newRecord);
    setRecordForm({
      type: "test_report",
      title: "",
      description: "",
      amount: 0,
      doctorName: "",
      department: "",
      status: "pending",
      fileData: "",
      fileType: "",
    });
    showMessage("Record added successfully", "success");
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isAvatar: boolean = false,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (isAvatar) {
        setUserForm((prev) => ({ ...prev, avatar: base64 }));
      } else {
        setRecordForm((prev) => ({
          ...prev,
          fileData: base64,
          fileType: file.type,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteUser = async (id: string) => {
    // We use a simple custom confirmation state instead of window.confirm
    // For simplicity in this panel, we'll just delete directly but show a message
    // A full modal would be better, but this avoids the iframe issue
    await dbService.deleteUser(id);
    const records = await dbService.getRecordsByUser(id);
    for (const record of records) {
      await dbService.deleteRecord(record.id);
    }
    loadUsers();
    if (selectedUserId === id) setSelectedUserId("");
    showMessage("User and records deleted", "success");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden bg-slate-950">
      {message && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4",
            message.type === "success"
              ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
              : "bg-red-500/20 border border-red-500/50 text-red-400",
          )}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-8 border-b border-cyan-900/50 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 text-cyan-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-red-500 glow-text flex items-center gap-2">
                <Shield className="w-6 h-6" /> ADMIN PANEL
              </h1>
              <p className="text-slate-400 text-xs uppercase tracking-widest">
                Restricted Access Area
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-2 text-sm text-cyan-300 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" /> Change App Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      localStorage.setItem("appLogo", base64);
                      showMessage("App logo updated successfully", "success");
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab("users")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "users"
                    ? "bg-cyan-900/50 text-cyan-300"
                    : "text-slate-400 hover:text-white",
                )}
              >
                Manage Users
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "records"
                    ? "bg-cyan-900/50 text-cyan-300"
                    : "text-slate-400 hover:text-white",
                )}
              >
                Add Records
              </button>
            </div>
          </div>
        </header>

        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Form */}
            <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />{" "}
                {userForm.id ? "Edit User" : "Add New User"}
              </h2>

              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={userForm.patientId}
                    onChange={(e) =>
                      setUserForm({ ...userForm, patientId: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={userForm.phone}
                      onChange={(e) =>
                        setUserForm({ ...userForm, phone: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({ ...userForm, email: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {userForm.avatar && (
                      <img
                        src={userForm.avatar}
                        alt="Preview"
                        className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      />
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-2 text-sm text-cyan-300 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, true)}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save User
                  </button>
                  {userForm.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setUserForm({
                          name: "",
                          patientId: "",
                          phone: "",
                          email: "",
                          avatar: "",
                        })
                      }
                      className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Users List */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Registered Users ({users.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Patient ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3 rounded-tr-lg text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-3 font-mono text-cyan-400">
                          {user.patientId}
                        </td>
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                              <Users className="w-3 h-3" />
                            </div>
                          )}
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {user.phone}
                          <br />
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setUserForm(user)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-slate-500"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "records" && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-cyan-400" /> Add Medical Record
            </h2>

            <form onSubmit={handleRecordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">
                  Select Patient
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                  required
                >
                  <option value="">-- Select a Patient --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Record Type
                  </label>
                  <select
                    value={recordForm.type}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                  >
                    <option value="test_report">Test Report</option>
                    <option value="prescription">Prescription</option>
                    <option value="appointment">Appointment</option>
                    <option value="invoice">Invoice</option>
                    <option value="bill">Bill</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={recordForm.title}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, title: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                    required
                    placeholder="e.g. Blood Test Results"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">
                  Description / Notes
                </label>
                <textarea
                  value={recordForm.description}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none h-24 resize-none"
                  placeholder="Enter details..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    value={recordForm.doctorName}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        doctorName: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                    placeholder="Dr. Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={recordForm.department}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        department: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Amount (SAR)
                  </label>
                  <input
                    type="number"
                    value={recordForm.amount || ""}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        amount: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none font-mono"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="border border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-950/50">
                <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-4">
                  Upload Document or Image (Optional)
                </p>

                <label className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-4 py-2 text-sm text-cyan-300 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" /> Select File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, false)}
                  />
                </label>

                {recordForm.fileData && (
                  <div className="mt-4 text-xs text-emerald-400 flex items-center justify-center gap-1">
                    <Save className="w-3 h-3" /> File attached successfully
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors uppercase tracking-wider mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Record to Patient
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
