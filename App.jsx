import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Users, 
  QrCode, 
  Plus, 
  Lock, 
  CheckCircle2, 
  Settings, 
  Copy, 
  Trash2, 
  Shuffle, 
  Globe, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('game_sessions');
    return saved ? JSON.parse(saved) : [{
      id: 'sess-1',
      title: 'Activity Registration 1',
      maxCapacity: 20,
      isOpen: true,
      students: [],
      teams: [],
      createdAt: new Date().toISOString()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem('active_session_id') || 'sess-1';
  });

  const [viewMode, setViewMode] = useState('organizer');
  const [hostDomain, setHostDomain] = useState(() => {
    return window.location.origin + window.location.pathname;
  });

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentMajor, setStudentMajor] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Create New Session Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCapacity, setNewCapacity] = useState(30);

  // QR Code State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('game_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Handle URL parameters for Student direct scan navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionFromUrl = params.get('session');
    const viewFromUrl = params.get('view');

    if (sessionFromUrl) {
      setActiveSessionId(sessionFromUrl);
    }
    if (viewFromUrl === 'student') {
      setViewMode('student');
    }
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Generate Direct QR Code
  useEffect(() => {
    if (activeSession) {
      const cleanBase = hostDomain.replace(/\/+$/, '');
      const studentUrl = `${cleanBase}?session=${activeSession.id}&view=student`;
      
      QRCode.toDataURL(studentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0A192F',
          light: '#FFFFFF'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error(err));
    }
  }, [activeSession, hostDomain]);

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSess = {
      id: 'sess-' + Date.now(),
      title: newTitle.trim(),
      maxCapacity: Number(newCapacity) || 20,
      isOpen: true,
      students: [],
      teams: [],
      createdAt: new Date().toISOString()
    };

    setSessions([newSess, ...sessions]);
    setActiveSessionId(newSess.id);
    setNewTitle('');
    setNewCapacity(30);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!studentName.trim() || !studentMajor.trim()) {
      setRegisterError('Please enter both your full name and major.');
      return;
    }

    if (!activeSession.isOpen) {
      setRegisterError('Registration for this session is closed.');
      return;
    }

    if (activeSession.students.length >= activeSession.maxCapacity) {
      setRegisterError('Capacity limit reached! Registration closed.');
      return;
    }

    const newStudent = {
      id: 'std-' + Date.now(),
      name: studentName.trim(),
      major: studentMajor.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedStudents = [...activeSession.students, newStudent];
    const isNowFull = updatedStudents.length >= activeSession.maxCapacity;

    setSessions(sessions.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          students: updatedStudents,
          isOpen: isNowFull ? false : s.isOpen
        };
      }
      return s;
    }));

    setRegisterSuccess(true);
    setStudentName('');
    setStudentMajor('');
  };

  const handleToggleSessionStatus = (id) => {
    setSessions(sessions.map(s => {
      if (s.id === id) {
        return { ...s, isOpen: !s.isOpen };
      }
      return s;
    }));
  };

  const handleDeleteSession = (id) => {
    if (sessions.length === 1) {
      alert("You must keep at least one registration session.");
      return;
    }
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const handleSplitTeams = (numTeams) => {
    if (activeSession.students.length === 0) return;

    const shuffled = [...activeSession.students].sort(() => 0.5 - Math.random());
    const newTeams = Array.from({ length: numTeams }, (_, i) => ({
      name: `Team ${i + 1}`,
      members: []
    }));

    shuffled.forEach((student, index) => {
      newTeams[index % numTeams].members.push(student);
    });

    setSessions(sessions.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, teams: newTeams };
      }
      return s;
    }));
  };

  const currentStudentDirectUrl = `${hostDomain.replace(/\/+$/, '')}?session=${activeSession?.id}&view=student`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#0A192F] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/20">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Game Registration Portal</h1>
              <p className="text-xs text-blue-200">Organizer Management & Direct Mobile Check-in</p>
            </div>
          </div>

          <div className="flex items-center bg-white/10 p-1 rounded-lg border border-white/10 text-xs font-medium">
            <button
              onClick={() => setViewMode('organizer')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'organizer' 
                  ? 'bg-white text-[#0A192F] font-semibold shadow-sm' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Organizer Dashboard
            </button>
            <button
              onClick={() => setViewMode('student')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'student' 
                  ? 'bg-white text-[#0A192F] font-semibold shadow-sm' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Student Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 gap-6">

        {/* ORGANIZER VIEW */}
        {viewMode === 'organizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Sessions List & Split Teams */}
            <div className="space-y-6">

              {/* Session Selector & Manager */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-500" /> Sessions Manager
                  </h2>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {sessions.length} Session(s)
                  </span>
                </div>

                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setActiveSessionId(s.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                        activeSessionId === s.id
                          ? 'border-[#0A192F] bg-blue-50/50 ring-1 ring-[#0A192F]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-[#0A192F]">{s.title}</p>
                        <p className="text-xs text-slate-500">
                          {s.students.length} / {s.maxCapacity} Registered
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          s.students.length >= s.maxCapacity || !s.isOpen
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {s.students.length >= s.maxCapacity ? 'FULL' : s.isOpen ? 'OPEN' : 'CLOSED'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(s.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create New Session */}
                <form onSubmit={handleCreateSession} className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Create New Session
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Session Title (e.g. Round 2 Game)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                      required
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="Max Student Limit"
                          value={newCapacity}
                          onChange={(e) => setNewCapacity(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-[#0A192F] hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Create
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Team Splitter */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-[#0A192F] flex items-center gap-2 mb-3">
                  <Shuffle className="w-4 h-4 text-slate-500" /> Auto Team Splitter
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Randomly assign current registered students into balanced teams.
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleSplitTeams(count)}
                      disabled={activeSession.students.length === 0}
                      className="py-2 px-3 border border-slate-200 hover:border-[#0A192F] hover:bg-slate-50 disabled:opacity-50 text-[#0A192F] font-semibold text-xs rounded-lg transition-colors flex justify-center items-center gap-1"
                    >
                      {count} Teams
                    </button>
                  ))}
                </div>

                {/* Display Split Teams */}
                {activeSession.teams && activeSession.teams.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 max-h-60 overflow-y-auto">
                    {activeSession.teams.map((t, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="font-bold text-xs text-[#0A192F] mb-1">
                          {t.name} ({t.members.length} Players)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {t.members.map((m) => (
                            <span key={m.id} className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Middle & Right Column: QR Code Share & Registered Students */}
            <div className="lg:col-span-2 space-y-6">

              {/* QR Code & Share Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Scan QR Code" className="w-52 h-52 object-contain" />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                      Generating QR Code...
                    </div>
                  )}
                  <p className="text-xs font-semibold text-[#0A192F] mt-2">Scan to Register Directly</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs bg-blue-100 text-[#0A192F] font-bold px-2 py-0.5 rounded">
                      Active Event
                    </span>
                    <h3 className="text-lg font-bold text-[#0A192F] mt-1">{activeSession.title}</h3>
                    <p className="text-xs text-slate-500">
                      Students who scan this QR code are directed straight to this registration form with no external redirects.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">
                      Direct Mobile Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentStudentDirectUrl}
                        className="flex-1 bg-slate-50 text-slate-600 px-3 py-1.5 text-xs rounded-md border border-slate-200 font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentStudentDirectUrl);
                          alert('Direct Link Copied!');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Manual Domain Configurator for Local Network Testing */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-500" /> Host Domain / Custom IP Address
                    </label>
                    <input
                      type="text"
                      value={hostDomain}
                      onChange={(e) => setHostDomain(e.target.value)}
                      placeholder="e.g. https://yourdomain.com or http://192.168.1.10:5173"
                      className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
                    />
                    <p className="text-[10px] text-slate-400">
                      Change this if testing over local Wi-Fi or setting up a custom domain.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleToggleSessionStatus(activeSession.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        activeSession.isOpen
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {activeSession.isOpen ? 'Manually Lock Registration' : 'Open Registration'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Registered Student Table */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-emerald-600" /> Registered Students
                    </h2>
                    <p className="text-xs text-slate-500">
                      Total: {activeSession.students.length} / {activeSession.maxCapacity} Seats Taken
                    </p>
                  </div>

                  <div className="w-full sm:w-48 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        activeSession.students.length >= activeSession.maxCapacity 
                          ? 'bg-rose-500' 
                          : 'bg-[#0A192F]'
                      }`}
                      style={{
                        width: `${Math.min(100, (activeSession.students.length / activeSession.maxCapacity) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {activeSession.students.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No students registered yet.</p>
                    <p className="text-[11px] text-slate-400">Share the QR code to let students check in.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50">
                          <th className="p-3 font-bold">#</th>
                          <th className="p-3 font-bold">Student Name</th>
                          <th className="p-3 font-bold">Major</th>
                          <th className="p-3 font-bold text-right">Time Registered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeSession.students.map((st, idx) => (
                          <tr key={st.id} className="hover:bg-slate-50/80">
                            <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                            <td className="p-3 font-bold text-[#0A192F]">{st.name}</td>
                            <td className="p-3 text-slate-600">{st.major}</td>
                            <td className="p-3 text-right text-slate-400">{st.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* STUDENT VIEW */}
        {viewMode === 'student' && (
          <div className="max-w-md mx-auto w-full py-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              
              {/* Card Banner */}
              <div className="bg-[#0A192F] text-white p-6 text-center">
                <span className="text-[10px] bg-white/20 text-blue-200 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                  Student Check-In
                </span>
                <h2 className="text-xl font-bold mt-2">{activeSession.title}</h2>
                <p className="text-xs text-blue-200 mt-1">
                  Spots Remaining: {Math.max(0, activeSession.maxCapacity - activeSession.students.length)} / {activeSession.maxCapacity}
                </p>
              </div>

              <div className="p-6">
                {/* Case 1: Registration Success */}
                {registerSuccess ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A192F]">You are Registered!</h3>
                    <p className="text-xs text-slate-500">
                      Your entry has been recorded. Please await instructions from the event organizer.
                    </p>
                    <button
                      onClick={() => setRegisterSuccess(false)}
                      className="mt-4 text-xs font-semibold text-[#0A192F] underline hover:text-slate-600"
                    >
                      Register another student
                    </button>
                  </div>
                ) : activeSession.students.length >= activeSession.maxCapacity || !activeSession.isOpen ? (
                  /* Case 2: Registration Closed / Capacity Reached */
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-rose-900">Registration Closed</h3>
                    <p className="text-xs text-slate-600">
                      {activeSession.students.length >= activeSession.maxCapacity
                        ? 'This session has reached its maximum student limit.'
                        : 'Registration for this session is currently closed by the organizer.'}
                    </p>

                    {/* Display Registered Students List */}
                    <div className="pt-4 border-t border-slate-100 text-left">
                      <h4 className="text-xs font-bold text-[#0A192F] mb-2">Registered Attendees ({activeSession.students.length})</h4>
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {activeSession.students.map((st, i) => (
                          <div key={st.id} className="text-xs flex justify-between text-slate-700 py-1 border-b border-slate-100 last:border-0">
                            <span className="font-medium">{i + 1}. {st.name}</span>
                            <span className="text-slate-400 text-[11px]">{st.major}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Case 3: Registration Form */
                  <form onSubmit={handleRegister} className="space-y-4">
                    {registerError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{registerError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alex Johnson"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Major / Field of Study <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={studentMajor}
                        onChange={(e) => setStudentMajor(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#0A192F] hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-sm shadow-md transition-colors"
                    >
                      Complete Registration
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
