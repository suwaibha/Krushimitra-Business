import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('krishimitra_language', lang);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f5f5ef", fontFamily: "'Georgia', serif" }}>
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1a5c2a" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C8 3 5 7 5 11c0 3 2 5.5 5 6.5V21h4v-3.5c3-1 5-3.5 5-6.5 0-4-3-8-7-8z" fill="white" />
              <path d="M12 3v18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg leading-none" style={{ fontFamily: "'Georgia', serif" }}>{t('brandName')}</div>
          </div>
        </div>
        <div className="relative">
          <select
            className="flex items-center gap-2 pl-10 pr-8 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors appearance-none outline-none cursor-pointer"
            onChange={handleLanguageChange}
            value={i18n.language}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="kn">Kannada</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center px-2 text-gray-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-20" style={{ background: "#f5f5ef" }}>
        {/* Trust badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-10"
          style={{ background: "#e8ede8", color: "#2d6a2d", border: "1px solid #c5d9c5" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3C8 3 5 7 5 11c0 3 2 5.5 5 6.5V21h4v-3.5c3-1 5-3.5 5-6.5 0-4-3-8-7-8z" />
            <path d="M12 3v18" />
          </svg>
          {t('trustedBy')}
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold text-gray-900 max-w-2xl leading-tight mb-6" style={{ fontFamily: "'Georgia', serif" }}>
          {t('heroTitle1')}
          <span style={{ color: "#1e7a1e" }}>{t('heroTitleHighlight')}</span>
          {t('heroTitle2')}
        </h1>

        {/* Subheadline */}
        <p className="text-gray-500 text-lg max-w-xl leading-relaxed mb-10">
          {t('heroSubtitle')}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#1a5c2a" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3C8 3 5 7 5 11c0 3 2 5.5 5 6.5V21h4v-3.5c3-1 5-3.5 5-6.5 0-4-3-8-7-8z" />
              <path d="M12 3v18" />
            </svg>
            {t('getStartedFarmer')}
          </button>
          <button
            onClick={() => navigate('/buyer-auth')}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base border-2 border-gray-200 bg-white text-gray-800 transition-all hover:bg-gray-50 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {t('getStartedBuyer')}
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
            {t('activeListings')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-lg">★</span>
            {t('averageRating')}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="px-6 pb-24" style={{ background: "#f5f5ef" }}>
        <div className="max-w-2xl mx-auto">
          {/* Section label */}
          <div className="flex justify-center mb-6">
            <span
              className="px-4 py-1.5 rounded-full text-sm text-gray-600"
              style={{ background: "#ede8e0", border: "1px solid #ddd8d0" }}
            >
              {t('howItWorks')}
            </span>
          </div>

          {/* Section title */}
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "'Georgia', serif" }}>
            {t('howItWorksTitle')}
          </h2>

          {/* Steps */}
          <div className="flex flex-col gap-5">
            {[
              {
                num: "01",
                title: t('step1Title'),
                desc: t('step1Desc'),
              },
              {
                num: "02",
                title: t('step2Title'),
                desc: t('step2Desc'),
              },
              {
                num: "03",
                title: t('step3Title'),
                desc: t('step3Desc'),
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative flex items-start justify-between bg-white rounded-2xl px-8 py-7 shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-1 z-10">
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1a5c2a" }}>
                    {t('step')} {step.num}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1" style={{ fontFamily: "'Georgia', serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 max-w-xs leading-relaxed">{step.desc}</p>
                </div>
                {/* Big watermark number */}
                <span
                  className="text-8xl font-bold select-none pointer-events-none absolute right-6 top-1/2 -translate-y-1/2"
                  style={{ color: "#f0f0ec", fontFamily: "'Georgia', serif", lineHeight: 1 }}
                >
                  {step.num}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;