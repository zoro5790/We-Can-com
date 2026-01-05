import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { ICONS, APP_NAME, DEVELOPER_NAME, ADMIN_EMAIL, ADMIN_PASS, DEVELOPER_EMAIL, SCHOOL_DATA } from './constants';
import { GeminiService } from './services/geminiService';
import { AppView, User, UserRole, Report, ChatMessage, Quiz, UserStatus, ReportReason, ViolationRecord } from './types';

// --- Global Store Context ---
interface AppState {
  currentUser: User | null;
  view: AppView;
  users: User[];
  reports: Report[];
  chatMessages: ChatMessage[];
  login: (u: User) => void;
  logout: () => void;
  navigate: (v: AppView) => void;
  addReport: (r: Report) => void;
  addChatMessage: (m: ChatMessage) => void;
  registerUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;
  blockUser: (targetId: string) => void;
  unblockUser: (targetId: string) => void;
  applySanction: (userId: string, type: 'WARNING' | 'MUTE' | 'BAN' | 'ACTIVE', reason: string) => void;
}

const AppContext = createContext<AppState>({} as AppState);
const useAppStore = () => useContext(AppContext);

// --- Helper Components ---

const VerifiedBadge = ({ email }: { email?: string }) => {
  if (email === DEVELOPER_EMAIL) {
    return (
      <ICONS.Verified 
        size={16} 
        className="text-blue-500 inline-block align-middle mr-1 ml-1" 
        fill="currentColor" 
        color="white" 
      />
    );
  }
  return null;
};

// --- Components ---

// 1. Splash Screen
const SplashScreen = () => {
  const { navigate } = useAppStore();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden text-white p-6">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="z-10 flex flex-col items-center animate-fade-in">
        <div className="animate-float mb-8 bg-white/10 p-6 rounded-3xl backdrop-blur-lg border border-white/20 shadow-2xl">
          <ICONS.BrainCircuit size={80} className="text-indigo-300 drop-shadow-glow" />
        </div>
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">{APP_NAME}</h1>
        <p className="text-xl text-indigo-200 mb-12 font-light">مستقبلك يبدأ هنا</p>
        
        <button 
          onClick={() => navigate(AppView.LOGIN)}
          className="bg-white text-indigo-900 font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95"
        >
          ابدأ التعلم
        </button>
      </div>
      
      <div className="mt-auto mb-8 flex flex-col items-center z-10 opacity-70">
         <p className="text-xs text-indigo-300 mb-2">تطوير</p>
         <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <p className="text-md font-bold text-white">{DEVELOPER_NAME}</p>
            <VerifiedBadge email={DEVELOPER_EMAIL} />
         </div>
      </div>
    </div>
  );
};

// 2. Login Screen
const LoginScreen = () => {
  const { login, navigate, users, registerUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Backdoor
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const adminUser: User = {
        id: 'admin-001',
        name: DEVELOPER_NAME,
        email: email,
        role: UserRole.ADMIN,
        grade: 'Admin',
        stage: 'System',
        preferences: { chat: true, announcements: true },
        status: UserStatus.ACTIVE,
        blockedUsers: [],
        violations: []
      };
      
      // Ensure admin is in the users list for persistence
      const adminExists = users.find(u => u.email === ADMIN_EMAIL);
      if (!adminExists) {
        registerUser(adminUser);
      }
      
      login(adminUser);
      navigate(AppView.ADMIN);
      return;
    }

    // Developer Special Login
    if (email === DEVELOPER_EMAIL) {
        let existingDev = users.find(u => u.email === DEVELOPER_EMAIL);
        if (!existingDev) {
             const devUser: User = {
                id: 'dev-001',
                name: 'المطور',
                email: email,
                role: UserRole.STUDENT,
                password: password,
                stage: 'المرحلة الثانوية',
                grade: 'مطور النظام',
                preferences: { chat: true, announcements: true },
                status: UserStatus.ACTIVE,
                blockedUsers: [],
                violations: []
              };
              registerUser(devUser);
              existingDev = devUser;
        }
        login(existingDev);
        navigate(AppView.HOME);
        return;
    }

    // Regular User Logic
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.password === password) {
         if (user.status === UserStatus.BANNED) {
             setError("تم حظر حسابك بسبب مخالفة القوانين. يرجى التواصل مع الإدارة.");
             return;
         }
         login(user);
         navigate(AppView.HOME);
      } else {
         setError("كلمة المرور غير صحيحة");
      }
    } else {
      if(email.includes('@') && password.length > 5) {
          setError("المستخدم غير موجود، الرجاء التسجيل");
      } else {
          setError("البيانات غير صالحة");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="glass p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 p-4 rounded-2xl shadow-inner">
                <ICONS.Lessons size={40} className="text-indigo-600" />
            </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-2 text-slate-800">مرحباً بعودتك</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">سجل دخولك للمتابعة في منصة We Can</p>
        
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-center text-sm flex items-center justify-center gap-2"><ICONS.Alert size={16}/> {error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">البريد الإلكتروني</label>
            <input 
              type="email" 
              className="w-full p-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none focus:bg-white transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full p-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none focus:bg-white transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition transform hover:-translate-y-0.5">
            تسجيل دخول
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center">
          <button onClick={() => navigate(AppView.SUDANESE_FORM)} className="w-full border-2 border-indigo-100 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition">
            تسجيل دخول عبر المدرسة السودانية
          </button>
          <div className="text-sm text-slate-500">
            ليس لديك حساب؟ <span onClick={() => navigate(AppView.SIGNUP)} className="text-indigo-600 font-bold cursor-pointer hover:underline">انشئ حساب جديد</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Signup Screen
const SignupScreen = () => {
  const { registerUser, navigate } = useAppStore();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirm: '', 
    stage: Object.keys(SCHOOL_DATA)[0], 
    grade: SCHOOL_DATA[Object.keys(SCHOOL_DATA)[0]][0]
  });

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value;
    const newGrades = SCHOOL_DATA[newStage];
    setFormData({
      ...formData,
      stage: newStage,
      grade: newGrades[0] 
    });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Password Validation
    if (formData.password.length < 8) {
      alert("لضمان أمان حسابك، يجب أن تكون كلمة المرور 8 خانات على الأقل");
      return;
    }

    if (formData.password !== formData.confirm) {
      alert("كلمات المرور غير متطابقة");
      return;
    }
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: UserRole.STUDENT,
      stage: formData.stage,
      grade: formData.grade,
      password: formData.password,
      schoolInfo: { schoolName: 'المدرسة العامة', classroom: '1' },
      preferences: { chat: true, announcements: true },
      status: UserStatus.ACTIVE,
      blockedUsers: [],
      violations: []
    };
    registerUser(newUser);
    alert("تم إنشاء الحساب بنجاح!");
    navigate(AppView.LOGIN);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="glass p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-slate-800">انضم إلينا</h2>
        <form onSubmit={handleSignup} className="space-y-3">
          <input 
            type="text" placeholder="الاسم الكامل" 
            className="w-full p-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
          />
          <input 
            type="email" placeholder="البريد الإلكتروني" 
            className="w-full p-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
          />
          <div className="grid grid-cols-2 gap-3">
             <input 
                type="password" placeholder="كلمة المرور" 
                className="w-full p-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
            />
            <input 
                type="password" placeholder="تأكيد" 
                className="w-full p-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none"
                value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} required 
            />
          </div>
          <p className="text-[10px] text-slate-500 pr-1">* كلمة المرور يجب أن تكون 8 أحرف على الأقل</p>
          
          <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
            <div>
              <label className="text-xs font-bold text-indigo-800 mb-1 block">المرحلة</label>
              <select 
                className="w-full p-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-indigo-400 text-sm"
                value={formData.stage} onChange={handleStageChange}
              >
                {Object.keys(SCHOOL_DATA).map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-indigo-800 mb-1 block">الصف</label>
              <select 
                className="w-full p-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-indigo-400 text-sm"
                value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}
              >
                {SCHOOL_DATA[formData.stage].map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition hover:opacity-90">
            تسجيل
          </button>
        </form>
        <button onClick={() => navigate(AppView.LOGIN)} className="mt-6 text-slate-500 text-sm w-full text-center hover:text-indigo-600">
          لديك حساب بالفعل؟ تسجيل دخول
        </button>
      </div>
    </div>
  );
};

// 4. Sudanese School Form
const SudaneseSchoolForm = () => {
    const { navigate } = useAppStore();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("تم حفظ البيانات، يمكنك الآن تسجيل الدخول.");
        navigate(AppView.LOGIN);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="glass p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-green-600 animate-fade-in">
                <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">المدرسة السودانية</h2>
                <p className="text-center text-gray-500 mb-6 text-sm">استمارة تسجيل بيانات الطالب</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="اسم الطالب" className="w-full p-4 bg-white/50 border rounded-xl focus:bg-white" required />
                    <input type="text" placeholder="المرحلة الدراسية" className="w-full p-4 bg-white/50 border rounded-xl focus:bg-white" required />
                    <input type="text" placeholder="الصف" className="w-full p-4 bg-white/50 border rounded-xl focus:bg-white" required />
                    <input type="email" placeholder="البريد الإلكتروني" className="w-full p-4 bg-white/50 border rounded-xl focus:bg-white" required />
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-md">
                        حفظ البيانات
                    </button>
                </form>
                 <button onClick={() => navigate(AppView.LOGIN)} className="mt-4 text-slate-500 text-sm w-full text-center hover:underline">
                    عودة
                </button>
            </div>
        </div>
    );
};

// --- Dashboard & Features ---

const NavigationBar = () => {
  const { view, navigate } = useAppStore();

  const navItems = [
    { view: AppView.HOME, icon: ICONS.Home, label: "الرئيسية" },
    { view: AppView.LESSONS, icon: ICONS.Lessons, label: "الدروس" },
    { view: AppView.QUIZZES, icon: ICONS.Quizzes, label: "الاختبارات" },
    { view: AppView.CHAT, icon: ICONS.Chat, label: "الشات" },
    { view: AppView.AI_ASSISTANT, icon: ICONS.Assistant, label: "المساعد" },
    { view: AppView.PROFILE, icon: ICONS.Profile, label: "حسابي" }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl px-6 py-3 flex gap-4 items-center z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = view === item.view;
        return (
          <button 
            key={item.view}
            onClick={() => navigate(item.view)}
            title={item.label}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
              isActive 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 transform -translate-y-2' 
              : 'text-slate-400 hover:bg-white hover:text-indigo-500'
            }`}
          >
            <Icon size={22} className={isActive ? 'fill-current' : ''} />
          </button>
        );
      })}
    </div>
  );
};

const Header = ({ title }: { title: string }) => {
    const { logout, currentUser } = useAppStore();
    return (
        <header className="glass-dark text-white p-4 shadow-lg sticky top-0 z-40 flex justify-between items-center backdrop-blur-md bg-slate-900/80">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ICONS.BrainCircuit className="text-indigo-400" />
              {title}
            </h1>
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                   <span className="text-xs font-bold ml-1">{currentUser?.name}</span>
                   <VerifiedBadge email={currentUser?.email} />
                </div>
                <button onClick={logout} className="p-2 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white rounded-full transition-colors">
                    <ICONS.Logout size={18} />
                </button>
            </div>
        </header>
    )
}

const LessonsView = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedFile, setSelectedFile] = useState<{name: string, data: string, mimeType: string} | null>(null);
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentUser } = useAppStore();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                setSelectedFile({
                    name: file.name,
                    data: base64,
                    mimeType: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExplain = async () => {
        if(!prompt && !selectedFile) return;
        setLoading(true);
        const level = currentUser?.grade ? `${currentUser.stage} - ${currentUser.grade}` : "المرحلة الدراسية";
        const result = await GeminiService.explainLesson(prompt, level, selectedFile || undefined);
        setExplanation(result);
        setLoading(false);
    };

    return (
        <div className="p-4 pb-32 animate-fade-in">
            <div className="glass p-6 rounded-3xl shadow-lg mb-6">
                <h2 className="font-bold text-xl mb-3 flex items-center gap-2 text-indigo-700">
                    <div className="bg-indigo-100 p-2 rounded-lg"><ICONS.Upload size={20} /></div>
                    رفع المحتوى (PDF/صور)
                </h2>
                <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf,image/*" />
                <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center mb-4 cursor-pointer transition-colors group ${selectedFile ? 'border-green-400 bg-green-50/50' : 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50'}`}>
                     {selectedFile ? <><ICONS.Check size={32} className="text-green-500 mb-2" /><span className="text-sm font-bold text-green-600 truncate max-w-xs">{selectedFile.name}</span></> : <><ICONS.File size={32} className="text-indigo-300 group-hover:text-indigo-500 transition-colors mb-2" /><span className="text-sm font-medium text-indigo-400">اختر ملف PDF أو صورة</span></>}
                </div>
                <p className="text-xs text-slate-500 font-bold mb-2 mr-1">ماذا تريد أن أشرح؟</p>
                <textarea className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl text-sm h-24 mb-4 focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition" placeholder={selectedFile ? "مثال: اشرح لي الصفحة رقم 5..." : "يمكنك أيضاً كتابة نص الدرس هنا..."} value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
                <button onClick={handleExplain} disabled={loading || (!prompt && !selectedFile)} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20">{loading ? "جاري التحليل والشرح..." : "شرح بالذكاء الاصطناعي"}{!loading && <ICONS.BrainCircuit size={18} />}</button>
            </div>
            {explanation && (<div className="glass p-6 rounded-3xl shadow-xl border border-white/50 animate-fade-in"><h3 className="font-bold mb-4 text-xl text-slate-800 border-b pb-2">الشرح الذكي:</h3><div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">{explanation}</div></div>)}
        </div>
    );
};

const QuizzesView = () => {
    const [text, setText] = useState('');
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState<number[]>([]);
    const [score, setScore] = useState<number | null>(null);

    const handleGenerate = async () => {
        if(!text) return;
        setLoading(true);
        setQuiz(null);
        setScore(null);
        const result = await GeminiService.generateQuiz(text);
        if (result) { setQuiz(result); setAnswers(new Array(result.questions.length).fill(-1)); }
        setLoading(false);
    };

    const submitQuiz = () => {
        if (!quiz) return;
        let s = 0;
        quiz.questions.forEach((q, idx) => { if (answers[idx] === q.correctAnswer) s++; });
        setScore(s);
    };

    return (
        <div className="p-4 pb-32 animate-fade-in">
             {!quiz ? (
                <div className="glass p-6 rounded-3xl shadow-lg">
                    <h2 className="font-bold text-xl mb-4 text-orange-600 flex items-center gap-2"><div className="bg-orange-100 p-2 rounded-lg"><ICONS.Quizzes size={20} /></div>مولد الاختبارات</h2>
                    <textarea className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl text-sm h-40 mb-4 focus:ring-2 focus:ring-orange-400 focus:bg-white outline-none transition" placeholder="ضع نص الوحدة هنا لتوليد أسئلة..." value={text} onChange={(e) => setText(e.target.value)}></textarea>
                    <button onClick={handleGenerate} disabled={loading || !text} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 shadow-lg shadow-orange-500/20">{loading ? "جاري إعداد الأسئلة..." : "ابدأ الاختبار"}</button>
                </div>
             ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-2"><h2 className="text-2xl font-bold text-white drop-shadow-md">{quiz.title || "اختبار"}</h2><button onClick={() => setQuiz(null)} className="text-sm bg-white/20 text-white px-3 py-1 rounded-full hover:bg-white/30 backdrop-blur-sm">إلغاء</button></div>
                    {quiz.questions.map((q, qIdx) => (
                        <div key={qIdx} className="glass p-5 rounded-3xl shadow-sm"><p className="font-bold text-slate-800 mb-4 text-lg">{qIdx + 1}. {q.question}</p><div className="space-y-2">{q.options.map((opt, oIdx) => (<button key={oIdx} onClick={() => { if (score !== null) return; const newAnswers = [...answers]; newAnswers[qIdx] = oIdx; setAnswers(newAnswers); }} className={`w-full text-right p-4 rounded-xl border transition-all ${score !== null ? oIdx === q.correctAnswer ? 'bg-green-100 border-green-500 text-green-800' : answers[qIdx] === oIdx ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white/50 opacity-50' : answers[qIdx] === oIdx ? 'bg-indigo-100 border-indigo-500 text-indigo-900 shadow-md' : 'bg-white/60 border-transparent hover:bg-white hover:shadow-sm'}`}>{opt}</button>))}</div></div>
                    ))}
                    {score === null ? (<button onClick={submitQuiz} className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-700 transition">تسليم الإجابات</button>) : (<div className="glass-dark text-white p-8 rounded-3xl text-center mb-8 shadow-2xl"><p className="text-lg opacity-80">النتيجة النهائية</p><p className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 my-4">{score} / {quiz.questions.length}</p><button onClick={() => setQuiz(null)} className="mt-4 bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition transform">اختبار جديد</button></div>)}
                </div>
             )}
        </div>
    );
};

// --- Security Modals ---
const ReportModal = ({ targetUser, onClose }: { targetUser: User; onClose: () => void }) => {
    const { addReport, currentUser } = useAppStore();
    const [reason, setReason] = useState<ReportReason>(ReportReason.ABUSE);
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (!currentUser) return;
        
        addReport({
            id: Date.now().toString(),
            reporterId: currentUser.id,
            reporterName: currentUser.name,
            reporterEmail: currentUser.email,
            reportedId: targetUser.id,
            reportedName: targetUser.name,
            reportedEmail: targetUser.email,
            reason: reason,
            description: description,
            date: new Date().toLocaleDateString('ar-EG'),
            timestamp: Date.now(),
            status: 'PENDING'
        });
        alert('تم إرسال البلاغ للإدارة للمراجعة.');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl">
                <h3 className="font-bold text-xl mb-4 text-red-600 flex items-center gap-2">
                    <ICONS.Report size={24} /> إبلاغ عن مستخدم
                </h3>
                <p className="text-sm text-gray-500 mb-4">أنت تبلغ عن <b>{targetUser.name}</b>. سيتم مراجعة بلاغك بسرية تامة.</p>
                
                <label className="block text-xs font-bold text-gray-700 mb-1">سبب البلاغ</label>
                <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-red-400 outline-none"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                >
                    {Object.values(ReportReason).map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <label className="block text-xs font-bold text-gray-700 mb-1">تفاصيل إضافية (اختياري)</label>
                <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 mb-4 focus:ring-2 focus:ring-red-400 outline-none text-sm"
                    placeholder="اشرح المشكلة باختصار..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex gap-2">
                    <button onClick={handleSubmit} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg">إرسال البلاغ</button>
                    <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl">إلغاء</button>
                </div>
            </div>
        </div>
    );
}

// User Action Menu (Block/Report)
const UserActionModal = ({ targetUser, onClose }: { targetUser: User; onClose: () => void }) => {
    const { blockUser, unblockUser, currentUser } = useAppStore();
    const [showReport, setShowReport] = useState(false);
    
    const isBlocked = currentUser?.blockedUsers.includes(targetUser.id);

    if (showReport) {
        return <ReportModal targetUser={targetUser} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white p-6 rounded-3xl w-full max-w-xs shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-500">
                    <ICONS.User size={32} />
                </div>
                <h3 className="font-bold text-lg text-slate-800">{targetUser.name}</h3>
                <p className="text-xs text-slate-500 mb-6">{targetUser.email}</p>

                <div className="space-y-3">
                    <button 
                        onClick={() => {
                            if (isBlocked) unblockUser(targetUser.id);
                            else blockUser(targetUser.id);
                            onClose();
                        }}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isBlocked ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-white'}`}
                    >
                        {isBlocked ? <><ICONS.Unlock size={18} /> إلغاء الحظر</> : <><ICONS.Block size={18} /> حظر المستخدم</>}
                    </button>
                    
                    <button 
                        onClick={() => setShowReport(true)}
                        className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition"
                    >
                        <ICONS.Report size={18} /> إبلاغ عن إساءة
                    </button>

                    <button onClick={onClose} className="text-sm text-slate-400 mt-2 hover:text-slate-600">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

// Add SupportModal component
const SupportModal = ({ onClose }: { onClose: () => void }) => {
    const { addReport, currentUser } = useAppStore();
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!currentUser) return;
        
        addReport({
            id: Date.now().toString(),
            reporterId: currentUser.id,
            reporterName: currentUser.name,
            reporterEmail: currentUser.email,
            reportedId: 'system-admin',
            reportedName: 'الإدارة',
            reportedEmail: 'support@wecan.app',
            reason: 'دعم فني',
            description: message,
            date: new Date().toLocaleDateString('ar-EG'),
            timestamp: Date.now(),
            status: 'PENDING'
        });
        alert('تم إرسال رسالتك إلى الدعم الفني. سيقوم فريقنا بمراجعتها قريباً.');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-xl mb-4 text-slate-800 flex items-center gap-2">
                    <ICONS.Admin size={24} className="text-red-500" /> الدعم الفني
                </h3>
                <p className="text-sm text-gray-500 mb-4">كيف يمكننا مساعدتك؟ أرسل رسالة مباشرة للإدارة.</p>
                
                <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 h-32 mb-4 focus:ring-2 focus:ring-indigo-400 outline-none text-sm resize-none"
                    placeholder="اكتب رسالتك هنا..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <div className="flex gap-2">
                    <button onClick={handleSubmit} disabled={!message.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 transition">إرسال</button>
                    <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

// Feature: Chat
const ChatView = () => {
    const { chatMessages, addChatMessage, currentUser, users, updateUser } = useAppStore();
    const [msg, setMsg] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [showParticipants, setShowParticipants] = useState(false);
    const [selectedUserForAction, setSelectedUserForAction] = useState<User | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    const getClassRoomId = (stage: string, grade: string) => `${stage}_${grade}`;
    const getCurrentUserClassRoomId = () => currentUser ? getClassRoomId(currentUser.stage || '', currentUser.grade || '') : '';
    const isAdmin = currentUser?.role === UserRole.ADMIN;
    const myClassRoomId = getCurrentUserClassRoomId();

    useEffect(() => {
        if (!selectedRoomId || !currentUser) return;
        if (currentUser.currentRoomId !== selectedRoomId) {
            updateUser({ ...currentUser, currentRoomId: selectedRoomId });
        }
        // ... (Mock socket logic preserved) ...
    }, [selectedRoomId]);

    // FILTER: Hide blocked messages
    const filteredMessages = chatMessages.filter(m => {
        if (!selectedRoomId) return false;
        
        // Hide messages from blocked users
        if (currentUser?.blockedUsers.includes(m.senderId)) return false;

        if (selectedRoomId === 'public') return m.receiverId === 'public';
        const isClassRoom = Object.keys(SCHOOL_DATA).some(stage => 
            SCHOOL_DATA[stage].some(grade => getClassRoomId(stage, grade) === selectedRoomId)
        );
        if (isClassRoom) return m.receiverId === selectedRoomId;
        return (m.senderId === currentUser?.id && m.receiverId === selectedRoomId) || (m.senderId === selectedRoomId && m.receiverId === currentUser?.id);
    });

    const roomParticipants = users.filter(u => {
        if (!selectedRoomId) return false;
        if (selectedRoomId === 'public') return true;
        const isClassRoom = Object.keys(SCHOOL_DATA).some(stage => 
            SCHOOL_DATA[stage].some(grade => getClassRoomId(stage, grade) === selectedRoomId)
        );
        if (isClassRoom) {
            const [stage, grade] = selectedRoomId.split('_');
            return u.stage === stage && u.grade === grade;
        }
        return u.id === selectedRoomId || u.id === currentUser?.id;
    });

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, selectedRoomId]);

    const handleSend = () => {
        if(!msg.trim() || !selectedRoomId) return;
        
        // CHECK MUTE STATUS
        if (currentUser?.status === UserStatus.MUTED) {
            alert("تم كتم حسابك مؤقتاً بسبب مخالفة القوانين. لا يمكنك إرسال الرسائل.");
            return;
        }

        addChatMessage({
            id: Date.now().toString(),
            senderId: currentUser?.id || 'anon',
            senderName: currentUser?.name || 'مجهول',
            senderEmail: currentUser?.email,
            receiverId: selectedRoomId,
            text: msg,
            timestamp: Date.now(),
            isAi: false
        });
        setMsg('');
    };

    // Lobby View
    if (!selectedRoomId) {
        return (
            <div className="p-4 pb-32 animate-fade-in">
                <h2 className="font-bold text-2xl mb-6 text-white drop-shadow-md">غرف الدردشة</h2>
                <div onClick={() => setSelectedRoomId(myClassRoomId)} className="glass p-6 rounded-3xl shadow-lg border-r-8 border-indigo-500 mb-6 flex items-center gap-4 cursor-pointer hover:bg-white/90 transition transform hover:scale-[1.02] relative overflow-hidden"><div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/30 z-10"><ICONS.Lessons size={32} className="text-white" /></div><div className="z-10"><h3 className="font-bold text-xl text-slate-800">غرفة صفي</h3><p className="text-sm text-slate-500 font-medium mt-1">{currentUser?.stage} - {currentUser?.grade}</p></div></div>
                <div onClick={() => setSelectedRoomId('public')} className="glass p-4 rounded-2xl shadow-sm border-r-4 border-green-500 mb-6 flex items-center gap-4 cursor-pointer hover:bg-white/80 transition"><div className="bg-green-100 p-3 rounded-xl text-green-600"><ICONS.Chat size={24} /></div><div><h3 className="font-bold text-slate-800">المحادثة العامة</h3><p className="text-xs text-slate-500">لجميع الطلاب</p></div></div>
                {isAdmin && (<div className="mb-6"><h3 className="font-bold text-white mb-3 text-lg flex items-center gap-2"><ICONS.Admin size={20}/> لوحة تحكم الغرف</h3><div className="space-y-4">{Object.keys(SCHOOL_DATA).map(stage => (<div key={stage} className="glass-dark p-4 rounded-2xl border border-white/10"><h4 className="text-indigo-300 font-bold mb-3 text-sm">{stage}</h4><div className="grid grid-cols-2 gap-2">{SCHOOL_DATA[stage].map(grade => (<button key={grade} onClick={() => setSelectedRoomId(getClassRoomId(stage, grade))} className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-lg transition text-right">{grade}</button>))}</div></div>))}</div></div>)}
                <h3 className="font-bold text-sm text-indigo-100 mb-3 px-2">محادثات خاصة</h3>
                <div className="relative mb-4 mx-2"><input type="text" placeholder="بحث..." className="w-full p-3 pl-10 rounded-xl bg-white/20 border border-white/10 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/30 transition text-sm" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} /><div className="absolute left-3 top-3 text-indigo-200"><ICONS.Search size={16} /></div></div>
                <div className="space-y-2">
                    {users.filter(u => u.id !== currentUser?.id && (u.name.toLowerCase().includes(userSearchQuery.toLowerCase()))).map(u => (
                         <div key={u.id} onClick={() => setSelectedRoomId(u.id)} className="glass p-3 rounded-2xl shadow-sm flex items-center gap-3 cursor-pointer hover:bg-white/80 transition">
                            <div className="bg-slate-100 p-2 rounded-full relative"><ICONS.User size={18} className="text-slate-600" />{u.currentRoomId && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>}</div>
                            <div className="flex-1"><h3 className="font-bold text-sm text-slate-800">{u.name}<VerifiedBadge email={u.email} /></h3><span className="text-[10px] text-slate-400">{u.grade}</span></div>
                         </div>
                    ))}
                </div>
            </div>
        );
    }

    // Room View
    let roomName = selectedRoomId === 'public' ? 'المحادثة العامة' : (selectedRoomId.includes('_') ? selectedRoomId.split('_')[1] : users.find(u => u.id === selectedRoomId)?.name || 'مستخدم');

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] rounded-t-3xl overflow-hidden glass border-0 relative">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-xl p-3 flex items-center justify-between px-4 text-slate-800 font-bold shadow-sm border-b border-slate-100 z-20">
                <div className="flex items-center gap-3 overflow-hidden"><div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md"><ICONS.Chat size={20}/></div><span className="truncate">{roomName}</span></div>
                <div className="flex gap-2">
                    <button onClick={() => setShowParticipants(!showParticipants)} className={`p-2 rounded-xl transition ${showParticipants ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}><ICONS.User size={18} /></button>
                    <button onClick={() => setSelectedRoomId(null)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-slate-600 transition">خروج</button>
                </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden relative">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {filteredMessages.map((m) => {
                        const isMe = m.senderId === currentUser?.id;
                        return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                                <div className={`max-w-[85%] p-3 shadow-sm relative group cursor-pointer ${isMe ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100'}`}
                                     onClick={() => {
                                         if (!isMe && !isAdmin) {
                                             const u = users.find(u => u.id === m.senderId);
                                             if (u) setSelectedUserForAction(u);
                                         }
                                     }}>
                                    {!isMe && <div className="flex items-center gap-1 mb-1"><p className="text-[10px] text-indigo-600 font-bold">{m.senderName}</p><VerifiedBadge email={m.senderEmail} /></div>}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                                    <span className={`text-[9px] absolute bottom-1 ${isMe ? 'left-2 text-indigo-200' : 'left-2 text-slate-400'}`}>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={endRef} />
                </div>

                {/* Participants & Action Modal */}
                {showParticipants && (
                    <div className="w-48 bg-white border-r border-slate-100 overflow-y-auto animate-fade-in absolute right-0 h-full z-10 shadow-xl glass">
                        <div className="p-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md sticky top-0"><h4 className="text-xs font-bold text-slate-500 uppercase">المتواجدون</h4></div>
                        <div className="p-2 space-y-1">
                            {roomParticipants.map(u => (
                                <div key={u.id} 
                                     onClick={() => u.id !== currentUser?.id && setSelectedUserForAction(u)}
                                     className={`flex items-center gap-2 p-2 rounded-lg transition cursor-pointer hover:bg-slate-50`}>
                                    <div className={`w-2 h-2 rounded-full ${u.role === UserRole.ADMIN ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                                    <p className="text-xs font-bold text-slate-700 truncate">{u.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedUserForAction && <UserActionModal targetUser={selectedUserForAction} onClose={() => setSelectedUserForAction(null)} />}

            <div className="p-3 bg-white border-t flex gap-2 items-center z-20 relative">
                 <input type="text" className="flex-1 bg-slate-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" placeholder={currentUser?.status === UserStatus.MUTED ? "أنت مكتوم حالياً..." : `رسالة إلى ${roomName}...`} value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={currentUser?.status === UserStatus.MUTED} />
                 <button onClick={handleSend} disabled={currentUser?.status === UserStatus.MUTED} className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition transform hover:scale-110 disabled:opacity-50"><ICONS.Send size={20} className="ml-0.5" /></button>
            </div>
        </div>
    );
};

// Feature: Admin Dashboard (Enhanced for Discipline)
const AdminDashboard = () => {
    const { users, applySanction, logout, reports } = useAppStore();
    const [tab, setTab] = useState<'users' | 'reports'>('users');

    const handleSanctionClick = (userId: string, type: 'WARNING' | 'MUTE' | 'BAN' | 'ACTIVE') => {
        const reason = prompt("ما هو سبب هذا الإجراء؟ (سيظهر للمستخدم)");
        if (reason) {
            applySanction(userId, type, reason);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2"><ICONS.Admin className="text-red-500" />لوحة التحكم</h1>
                <button onClick={logout} className="bg-red-500/20 text-red-200 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition text-sm">تسجيل خروج</button>
            </div>

            <div className="flex gap-4 mb-6">
                <button onClick={() => setTab('users')} className={`flex-1 py-3 rounded-xl font-bold transition ${tab === 'users' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>المستخدمين ({users.length})</button>
                <button onClick={() => setTab('reports')} className={`flex-1 py-3 rounded-xl font-bold transition ${tab === 'reports' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>البلاغات ({reports.length})</button>
            </div>

            {tab === 'users' ? (
                <div className="space-y-3">
                    {users.map(user => (
                        <div key={user.id} className="bg-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/5 hover:bg-white/10 transition">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold">{user.name}</p>
                                    {user.status === UserStatus.BANNED && <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded font-bold">محظور</span>}
                                    {user.status === UserStatus.MUTED && <span className="bg-yellow-500 text-[10px] px-2 py-0.5 rounded text-black font-bold">مكتوم</span>}
                                </div>
                                <p className="text-xs text-slate-400">{user.email} | مخالفات: {user.violations?.length || 0}</p>
                            </div>
                            {user.role !== UserRole.ADMIN && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleSanctionClick(user.id, 'WARNING')} className="bg-blue-500/20 text-blue-300 p-2 rounded hover:bg-blue-500/40 text-xs font-bold">تحذير</button>
                                    <button onClick={() => handleSanctionClick(user.id, 'MUTE')} className="bg-yellow-500/20 text-yellow-300 p-2 rounded hover:bg-yellow-500/40 text-xs font-bold">كتم</button>
                                    {user.status === UserStatus.BANNED ? 
                                        <button onClick={() => handleSanctionClick(user.id, 'ACTIVE')} className="bg-green-500/20 text-green-300 p-2 rounded hover:bg-green-500/40 text-xs font-bold">فك الحظر</button> :
                                        <button onClick={() => handleSanctionClick(user.id, 'BAN')} className="bg-red-500/20 text-red-300 p-2 rounded hover:bg-red-500/40 text-xs font-bold">حظر</button>
                                    }
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.length === 0 && <div className="text-center text-slate-500 py-10"><ICONS.Check size={48} className="mx-auto mb-4 opacity-20" /><p>لا توجد بلاغات حالياً</p></div>}
                    {reports.map(rep => (
                        <div key={rep.id} className="bg-white p-4 rounded-xl text-slate-800 border-r-4 border-red-500">
                            <div className="flex justify-between mb-2 border-b pb-2">
                                <span className="font-bold text-sm text-red-600 flex items-center gap-2"><ICONS.Report size={16}/> {rep.reason}</span>
                                <span className="text-xs text-slate-400">{rep.date}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div><p className="text-xs text-slate-500">المُبلِّغ</p><p className="font-bold">{rep.reporterName}</p></div>
                                <div><p className="text-xs text-slate-500">المُبلَّغ عنه</p><p className="font-bold">{rep.reportedName}</p></div>
                            </div>
                            {rep.description && <p className="bg-slate-100 p-2 rounded text-xs text-slate-600 mb-3">{rep.description}</p>}
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => handleSanctionClick(rep.reportedId, 'MUTE')} className="text-xs bg-yellow-100 text-yellow-700 px-3 py-2 rounded font-bold hover:bg-yellow-200">كتم المستخدم</button>
                                <button onClick={() => handleSanctionClick(rep.reportedId, 'BAN')} className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded font-bold hover:bg-red-200">حظر المستخدم</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Feature: Home View
const HomeView = () => {
    const { navigate, currentUser } = useAppStore();
    const features = [
        { view: AppView.LESSONS, icon: ICONS.Lessons, title: "شرح الدروس", desc: "شرح ذكي للمناهج", color: "from-blue-500 to-indigo-600" },
        { view: AppView.QUIZZES, icon: ICONS.Quizzes, title: "الاختبارات", desc: "اختبر معلوماتك", color: "from-orange-400 to-red-500" },
        { view: AppView.CHAT, icon: ICONS.Chat, title: "مجتمع الطلاب", desc: "تواصل مع زملائك", color: "from-green-400 to-emerald-600" },
        { view: AppView.AI_ASSISTANT, icon: ICONS.Assistant, title: "المساعد الذكي", desc: "اسأل أي شيء", color: "from-purple-500 to-fuchsia-600" },
    ];

    return (
        <div className="p-6 pb-32 animate-fade-in">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">مرحباً، {currentUser?.name.split(' ')[0]} 👋</h2>
                    <p className="text-indigo-100 mb-6">جاهز للتعلم اليوم؟ لنحقق أهدافك معاً!</p>
                    <button onClick={() => navigate(AppView.AI_ASSISTANT)} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition shadow-lg">ابدأ المحادثة الآن</button>
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            </div>

            <h3 className="font-bold text-xl text-slate-800 mb-4 px-2">استكشف We Can</h3>
            <div className="grid grid-cols-2 gap-4">
                {features.map((f, i) => (
                    <div key={i} onClick={() => navigate(f.view)} className="glass p-4 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col items-center text-center border border-white/40">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 transition duration-300`}>
                            <f.icon size={28} />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{f.title}</h4>
                        <p className="text-[10px] text-slate-500">{f.desc}</p>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 glass p-6 rounded-3xl border border-indigo-100">
                <div className="flex items-center gap-4 mb-4">
                     <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><ICONS.BrainCircuit size={24} /></div>
                     <div><h4 className="font-bold text-slate-800">نصيحة اليوم</h4><p className="text-xs text-slate-500">من الذكاء الاصطناعي</p></div>
                </div>
                <p className="text-sm text-slate-600 italic leading-relaxed">"النجاح ليس مفتاح السعادة، بل السعادة هي مفتاح النجاح. إذا أحببت ما تقوم به، ستكون ناجحاً بالتأكيد."</p>
            </div>
        </div>
    );
}

// Feature: Profile View
const ProfileView = () => {
    const { currentUser, logout, navigate } = useAppStore();
    const [showSupport, setShowSupport] = useState(false); // State for modal
    
    if (!currentUser) return null;

    return (
        <div className="p-6 pb-32 animate-fade-in">
             <div className="flex flex-col items-center mb-8">
                 <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full p-1 shadow-2xl mb-4">
                     <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                         <ICONS.User size={40} className="text-indigo-400" />
                     </div>
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">{currentUser.name} <VerifiedBadge email={currentUser.email} /></h2>
                 <p className="text-slate-500">{currentUser.stage} - {currentUser.grade}</p>
             </div>

             <div className="space-y-4">
                 <div className="glass p-4 rounded-2xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><ICONS.File size={20}/></div>
                         <div><p className="font-bold text-sm">بياناتي</p><p className="text-xs text-slate-400">تعديل المعلومات الشخصية</p></div>
                     </div>
                     <ICONS.Edit size={16} className="text-slate-400" />
                 </div>
                 <div className="glass p-4 rounded-2xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><ICONS.Notification size={20}/></div>
                         <div><p className="font-bold text-sm">الإشعارات</p><p className="text-xs text-slate-400">التحكم في التنبيهات</p></div>
                     </div>
                     <div className="w-10 h-6 bg-green-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div></div>
                 </div>
                 <div className="glass p-4 rounded-2xl flex items-center justify-between cursor-pointer" onClick={() => setShowSupport(true)}>
                     <div className="flex items-center gap-3">
                         <div className="bg-red-100 p-2 rounded-xl text-red-600"><ICONS.Admin size={20}/></div>
                         <div><p className="font-bold text-sm">الدعم الفني</p><p className="text-xs text-slate-400">تواصل مع الإدارة</p></div>
                     </div>
                 </div>
             </div>

             <button onClick={logout} className="w-full mt-8 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center gap-2">
                 <ICONS.Logout size={20} /> تسجيل خروج
             </button>
             
             <div className="mt-8 text-center text-xs text-slate-400">
                 <p>الإصدار 1.0.0</p>
                 <p>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
             </div>

             {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
        </div>
    );
};

// Feature: Assistant View
const AssistantView = () => {
    const { currentUser } = useAppStore();
    const [messages, setMessages] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([
        { role: 'model', parts: [{ text: `أهلاً بك يا ${currentUser?.name.split(' ')[0]}! أنا مساعدك الذكي في We Can. كيف يمكنني مساعدتك في دراستك اليوم؟` }] }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        setInput('');
        
        // Add user message
        const newHistory = [...messages, { role: 'user' as const, parts: [{ text: userMsg }] }];
        setMessages(newHistory);
        setLoading(true);

        // Call Gemini
        const responseText = await GeminiService.chatWithAssistant(messages.map(m => ({ role: m.role, parts: m.parts })), userMsg);
        
        setMessages([...newHistory, { role: 'model', parts: [{ text: responseText }] }]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] rounded-t-3xl overflow-hidden glass border-0 relative">
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                 {messages.map((m, i) => (
                     <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                         <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                             {m.role === 'model' && <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs"><ICONS.Assistant size={14}/> المساعد الذكي</div>}
                             <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.parts[0].text}</p>
                         </div>
                     </div>
                 ))}
                 {loading && (
                     <div className="flex justify-start animate-fade-in">
                         <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                         </div>
                     </div>
                 )}
                 <div ref={bottomRef} />
             </div>
             <div className="p-3 bg-white border-t flex gap-2 items-center z-20">
                 <input 
                    type="text" 
                    className="flex-1 bg-slate-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" 
                    placeholder="اكتب سؤالك هنا..." 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 />
                 <button onClick={handleSend} disabled={loading || !input.trim()} className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50">
                    <ICONS.Send size={20} className="ml-0.5" />
                 </button>
             </div>
        </div>
    );
};

// --- Main App Component ---

const App = () => {
  // Initialize State from LocalStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const saved = localStorage.getItem('wecan_current_user');
      return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<AppView>(() => {
       const savedUser = localStorage.getItem('wecan_current_user');
       if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
           return parsedUser.role === 'ADMIN' ? AppView.ADMIN : AppView.HOME;
       }
       return AppView.SPLASH;
  });

  const [users, setUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem('wecan_users');
      if (saved) return JSON.parse(saved);
      return [
        {id: '1', name: 'مجدي أشرف', email: DEVELOPER_EMAIL, role: UserRole.STUDENT, stage: 'المرحلة الثانوية', grade: 'مطور النظام', password: '123', schoolInfo: {schoolName: 'Dev School', classroom: '1'}, preferences: { chat: true, announcements: true }, status: UserStatus.ACTIVE, blockedUsers: [], violations: []},
        {id: '2', name: 'أحمد محمد', email: 'ahmed@test.com', role: UserRole.STUDENT, stage: 'مرحلة الأساس', grade: 'الفصل السادس', password: '123', schoolInfo: {schoolName: 'الخرطوم', classroom: '6-أ'}, preferences: { chat: true, announcements: true }, status: UserStatus.ACTIVE, blockedUsers: [], violations: []}
      ];
  });

  const [reports, setReports] = useState<Report[]>(() => {
      const saved = localStorage.getItem('wecan_reports');
      return saved ? JSON.parse(saved) : [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
      const saved = localStorage.getItem('wecan_messages');
      return saved ? JSON.parse(saved) : [
         {id: '1', senderId: '0', senderName: 'النظام', receiverId: 'public', text: 'مرحباً بكم في مجتمع We Can', timestamp: Date.now()}
      ];
  });

  // Effects for Persistence
  useEffect(() => {
      localStorage.setItem('wecan_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
      localStorage.setItem('wecan_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
      localStorage.setItem('wecan_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
      if (currentUser) {
          localStorage.setItem('wecan_current_user', JSON.stringify(currentUser));
      } else {
          localStorage.removeItem('wecan_current_user');
      }
  }, [currentUser]);

  // Navigation
  const navigate = (v: AppView) => setView(v);

  // Auth & User Management
  const login = (u: User) => setCurrentUser(u);
  
  const logout = () => {
    setCurrentUser(null);
    setView(AppView.LOGIN);
  };

  const registerUser = (u: User) => {
    if (users.find(existing => existing.email === u.email)) {
        alert("البريد الإلكتروني مستخدم بالفعل");
        return;
    }
    setUsers([...users, u]);
  };

  const updateUser = (u: User) => {
    setUsers(users.map(existing => existing.id === u.id ? u : existing));
    if (currentUser && currentUser.id === u.id) {
        setCurrentUser(u);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const blockUser = (targetId: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, blockedUsers: [...currentUser.blockedUsers, targetId] };
    updateUser(updatedUser);
  };

  const unblockUser = (targetId: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, blockedUsers: currentUser.blockedUsers.filter(id => id !== targetId) };
    updateUser(updatedUser);
  };

  const applySanction = (userId: string, type: 'WARNING' | 'MUTE' | 'BAN' | 'ACTIVE', reason: string) => {
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) return;

      const violation: ViolationRecord = {
          date: Date.now(),
          type: type === 'ACTIVE' ? 'WARNING' : type,
          reason: reason
      };

      const newStatus = type === 'ACTIVE' ? UserStatus.ACTIVE : 
                        type === 'BAN' ? UserStatus.BANNED : 
                        type === 'MUTE' ? UserStatus.MUTED : targetUser.status;

      const updatedUser = {
          ...targetUser,
          status: newStatus,
          violations: [...targetUser.violations, violation]
      };

      setUsers(users.map(u => u.id === userId ? updatedUser : u));
  };

  // Data helpers
  const addReport = (r: Report) => setReports([...reports, r]);
  const addChatMessage = (m: ChatMessage) => setChatMessages([...chatMessages, m]);

  // View routing
  const renderCurrentView = () => {
    switch (view) {
      case AppView.SPLASH: return <SplashScreen />;
      case AppView.LOGIN: return <LoginScreen />;
      case AppView.SIGNUP: return <SignupScreen />;
      case AppView.SUDANESE_FORM: return <SudaneseSchoolForm />;
      case AppView.HOME: return <HomeView />;
      case AppView.LESSONS: return <LessonsView />;
      case AppView.QUIZZES: return <QuizzesView />;
      case AppView.CHAT: return <ChatView />;
      case AppView.AI_ASSISTANT: return <AssistantView />;
      case AppView.PROFILE: return <ProfileView />;
      case AppView.ADMIN: return <AdminDashboard />;
      default: return <SplashScreen />;
    }
  };

  const isFullScreen = [AppView.SPLASH, AppView.LOGIN, AppView.SIGNUP, AppView.SUDANESE_FORM, AppView.ADMIN].includes(view);
  
  const getTitle = () => {
      switch(view) {
          case AppView.HOME: return APP_NAME;
          case AppView.LESSONS: return "شرح الدروس";
          case AppView.QUIZZES: return "الاختبارات";
          case AppView.CHAT: return "الدردشة";
          case AppView.AI_ASSISTANT: return "المساعد الذكي";
          case AppView.PROFILE: return "الملف الشخصي";
          default: return APP_NAME;
      }
  };

  const contextValue: AppState = {
      currentUser,
      view,
      users,
      reports,
      chatMessages,
      login,
      logout,
      navigate,
      addReport,
      addChatMessage,
      registerUser,
      updateUser,
      deleteUser,
      blockUser,
      unblockUser,
      applySanction
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
        {!isFullScreen && <Header title={getTitle()} />}
        <main className={!isFullScreen ? "container mx-auto max-w-md pb-24" : ""}>
            {renderCurrentView()}
        </main>
        {!isFullScreen && <NavigationBar />}
      </div>
    </AppContext.Provider>
  );
};

export default App;