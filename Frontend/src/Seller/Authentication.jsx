import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 14.5v-5l-3 3-1.5-1.5 4.5-4.5 4.5 4.5-1.5 1.5-3-3v5h-1z"
      fill="white"
    />
    <path
      d="M17 8c-2.8-2.8-7.2-2.8-10 0"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 3.5C9 3.5 6.5 5 5 7.5c2-1 4.5-1.5 7-1 2.5.5 4.5 2 5.5 4C18.5 8 16 3.5 12 3.5z"
      fill="rgba(255,255,255,0.6)"
    />
  </svg>
);

const Logo = () => (
  <div className="flex items-center gap-2.5 mb-6">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(145deg, #3a7d55, #2d6a4f)" }}>
      {/* Leaf icon matching the uploaded logo */}
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path
          d="M22 6C16 6 9 10 9 18c0 2.5.8 4.6 2 6"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"
        />
        <path
          d="M9 18C9 12 14 7 22 6c0 8-4 14-11 16"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
        <path
          d="M11 24c-1.5-1.5-2-3.5-2-6"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"
        />
        <path
          d="M11 24C9 26 8 27 7 28"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"
        />
        <path
          d="M15 16c2-2 4.5-4 7-5"
          stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6"
        />
      </svg>
    </div>
    <div>
      <div className="font-bold text-gray-900 text-lg leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>KrishiMitra</div>
    </div>
  </div>
);

const TabSwitch = ({ active, onChange }) => {
  const { t } = useTranslation();
  return (
  <div className="flex bg-gray-100 rounded-2xl p-1 mb-7">
    <button
      onClick={() => onChange("signin")}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
        active === "signin"
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {t('authSignIn')}
    </button>
    <button
      onClick={() => onChange("signup")}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
        active === "signup"
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {t('authSignUp')}
    </button>
  </div>
  );
};

const InputField = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-800 mb-1.5">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-2xl border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200"
      style={{
        borderColor: "#e5e7eb",
        background: "#f9fafb",
      }}
      onFocus={e => {
        e.target.style.borderColor = "#2d6a4f";
        e.target.style.background = "#fff";
        e.target.style.boxShadow = "0 0 0 3px rgba(45,106,79,0.08)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "#e5e7eb";
        e.target.style.background = "#f9fafb";
        e.target.style.boxShadow = "none";
      }}
    />
  </div>
);

const SignUpPage = ({ onSwitch }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://krushimitra-business.vercel.app/api/seller/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("sellerToken", data.token);
        navigate("/seller-dashboard");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {t('authCreateAccount')}
      </h1>
      <p className="text-sm text-gray-400 mb-6">{t('authFarmerSubtitle')}</p>

      <TabSwitch active="signup" onChange={onSwitch} />

      {error && <div className="mb-4 text-red-500 text-sm font-semibold">{error}</div>}

      <InputField
        label={t('authFullName')}
        placeholder="Ramesh Patel"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <InputField
        label={t('authMobile')}
        placeholder="+91 98XXX XXXXX"
        value={form.mobile}
        onChange={e => setForm({ ...form, mobile: e.target.value })}
      />
      <InputField
        label={t('authEmail')}
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <InputField
        label={t('authPassword')}
        type="password"
        placeholder={t('authPasswordHint')}
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className={`w-full py-3.5 rounded-2xl text-white font-semibold text-sm mt-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${loading ? "opacity-70" : ""}`}
        style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}
      >
        {loading ? t('authCreating') : t('authCreateBtn')}
      </button>

      <p className="text-center text-sm text-gray-400 mt-5">
        {t('authBuyerPrompt')}{" "}
        <button onClick={() => navigate('/buyer-auth')} className="font-semibold" style={{ color: "#2d6a4f" }}>
          {t('authContinueBuyer')}
        </button>
      </p>
    </div>
  );
};

const SignInPage = ({ onSwitch }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ credential: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://krushimitra-business.vercel.app/api/seller/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("sellerToken", data.token);
        navigate("/seller-dashboard");
      } else {
        setError(data.message || "Signin failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {t('authWelcomeBack')}
      </h1>
      <p className="text-sm text-gray-400 mb-6">{t('authSignInSubtitle')}</p>

      <TabSwitch active="signin" onChange={onSwitch} />

      {error && <div className="mb-4 text-red-500 text-sm font-semibold">{error}</div>}

      <InputField
        label={t('authEmailOrMobile')}
        placeholder="you@example.com"
        value={form.credential}
        onChange={e => setForm({ ...form, credential: e.target.value })}
      />
      <InputField
        label={t('authPassword')}
        type="password"
        placeholder=""
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button
        onClick={handleSignin}
        disabled={loading}
        className={`w-full py-3.5 rounded-2xl text-white font-semibold text-sm mt-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${loading ? "opacity-70" : ""}`}
        style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}
      >
        {loading ? t('authSigningIn') : t('authSignInBtn')}
      </button>

      <p className="text-center text-sm text-gray-400 mt-5">
        {t('authBuyerPrompt')}{" "}
        <button onClick={() => navigate('/buyer-auth')} className="font-semibold" style={{ color: "#2d6a4f" }}>
          {t('authContinueBuyer')}
        </button>
      </p>
    </div>
  );
};

export default function Authentication() {
  const [page, setPage] = useState("signup");
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('krishimitra_language', lang);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: "#f5f4ef" }}
    >
      

      <div
        className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm"
        style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07)" }}
      >
        <Logo />
        {page === "signup" ? (
          <SignUpPage onSwitch={setPage} />
        ) : (
          <SignInPage onSwitch={setPage} />
        )}
      </div>
    </div>
  );
}