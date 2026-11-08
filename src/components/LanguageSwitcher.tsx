
"use client";

import { useRouter } from "next/navigation";
import type { Language } from "@/lib/i18n";

export default function LanguageSwitcher({
  language,
}: {
  language: Language;
}) {
  const router = useRouter();

  function changeLanguage(nextLanguage: Language) {
    document.cookie = `drivex-language=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div
      className="flex items-center rounded-full border border-neutral-200 bg-white p-1 text-xs font-semibold"
      aria-label="Choose language"
    >
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-full px-3 py-2 transition ${
          language === "en"
            ? "bg-neutral-950 text-white"
            : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("hi")}
        aria-pressed={language === "hi"}
        className={`rounded-full px-3 py-2 transition ${
          language === "hi"
            ? "bg-orange-500 text-black"
            : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
