import { useState } from "react";
import { ChevronDown, Check, X, Globe } from "lucide-react";

export default function StoreFooter() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [privacyChoicesOpen, setPrivacyChoicesOpen] = useState(false);

  const footerLinks = {
    "What's New": [
      "FAB Store roadmap",
      "Featured launches",
      "AI service catalog",
      "Partner highlights",
      "TP.ai blog",
    ],
    "FAB Store": [
      "TP.ai account",
      "FAB Store support",
      "Engagement playbooks",
      "Flexible payments",
      "Policies and Code of Conduct",
      "Request a FAB Store demo",
    ],
    "For Builders": [
      "Publish your solution",
      "Generate your app badge",
      "FAB Builder",
      "API documentation",
    ],
    "TP.ai": [
      "About TP.ai (Teleperformance AI)",
      "Careers",
      "Company news",
      "Investors",
      "Diversity & inclusion",
      "Accessibility",
      "Sustainability",
    ],
  };

  const legalLinks = [
    "Contact TP.ai",
    "Privacy",
    "Terms of use",
    "Trademarks",
    "Safety & eco",
    "Recycling",
    "About our ads",
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#0E0931] via-[#161045] to-[#23165E] border-t border-white/10 mt-auto text-white">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,rgba(147,112,255,0.3),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(0,227,255,0.22),transparent_40%)]" />
      <div className="absolute inset-0 opacity-[0.2] bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:200px_200px]" />
      <div className="relative">
      {/* Upper Section - Navigation Links */}
      <div className="w-full px-6 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h3 className="text-sm font-semibold text-white">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle navigation if needed
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-white/50">
          TP.ai is the AI product and platform vertical of Teleperformance, building production-grade AI solutions for regulated industries.
        </p>
      </div>

      {/* Lower Section - Utility and Legal Links */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Left side - Language & Privacy */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>English (United States)</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      languageOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {languageOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#0F1025] border border-white/10 rounded-lg shadow-2xl py-2 z-50">
                    {["English (United States)", "Español", "Français", "Deutsch"].map(
                      (lang) => (
                        <button
                          key={lang}
                          className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                          onClick={() => setLanguageOpen(false)}
                        >
                          {lang}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Privacy Choices */}
              <button
                onClick={() => setPrivacyChoicesOpen(!privacyChoicesOpen)}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <div className="relative w-4 h-4">
                  <Check className="w-3 h-3 absolute top-0 left-0 text-green-600" />
                  <X className="w-3 h-3 absolute bottom-0 right-0 text-red-600" />
                </div>
                <span>Your Privacy Choices</span>
              </button>
            </div>

            {/* Right side - Legal Links */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              {legalLinks.map((link, idx) => (
                <a
                  key={link}
                  href="#"
                  className="hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle navigation if needed
                  }}
                >
                  {link}
                </a>
              ))}
              <span className="text-white/50">
                © TP.ai · a Teleperformance company · {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}

