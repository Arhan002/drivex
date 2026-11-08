"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Fuel,
  Settings2,
  Wallet,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type Showroom = {
  id: string;
  name: string;
  city: string;
};

type CarModel = {
  id: string;
  name: string;
};

type BuyerDetails = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
};

type EnquiryFormProps = {
  source: "new_car" | "used_car";
  modelId?: string;
  showrooms: Showroom[];
  models?: CarModel[];
  userRole?: string | null;
  buyerDetails?: BuyerDetails | null;
};

export default function EnquiryForm({
  source,
  modelId,
  showrooms,
  models = [],
  userRole,
  buyerDetails,
}: EnquiryFormProps) {
  const [buyerName, setBuyerName] = useState(buyerDetails?.fullName ?? "");
  const [email, setEmail] = useState(buyerDetails?.email ?? "");
  const [phone, setPhone] = useState(buyerDetails?.phone ?? "");
  const [showroomId, setShowroomId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(modelId || "");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fuelPreference, setFuelPreference] = useState("");
  const [transmissionPreference, setTransmissionPreference] = useState("");
  const [budget, setBudget] = useState("");
  const [purchaseTimeline, setPurchaseTimeline] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [submissionSucceeded, setSubmissionSucceeded] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )drivex-language=(en|hi)(?:;|$)/);
    setLanguage(match?.[1] === "hi" ? "hi" : "en");
  }, []);

  const copy = {
    en: {
      nextStep: "Your next step",
      interested: "Interested in this car",
      usedCarIntro: "Tell us what you are looking for. Our dealership team will help you with pricing, availability and the next steps.",
      formLabel: "Enquiry form",
      title: "Let's get to know you.",
      subtitle: "Share your details and we'll get in touch with you.",
      personal: "Personal information",
      contactDetails: "Your contact details",
      fullName: "Full name",
      fullNamePlaceholder: "Enter your full name",
      email: "Email address",
      phone: "Phone number",
      phonePlaceholder: "10-digit phone number",
      showroom: "Preferred showroom",
      chooseShowroom: "Choose a showroom",
      noShowrooms: "No showrooms are currently available. Please contact our team.",
      carModel: "Interested Car Model (Optional)",
      notDecided: "Not decided yet",
      preferences: "Your preferences",
      preferencesHelp: "Help us understand what you are looking for",
      fuel: "Fuel preference",
      selectFuel: "Select fuel type",
      transmission: "Transmission",
      selectTransmission: "Select transmission",
      noPreference: "No preference",
      budget: "Budget",
      selectBudget: "Select your budget",
      under5: "Under ₹5 lakh",
      range5to10: "₹5–10 lakh",
      range10to15: "₹10–15 lakh",
      range15to25: "₹15–25 lakh",
      above25: "Above ₹25 lakh",
      timeline: "Purchase timeline",
      selectTimeline: "When are you planning to buy?",
      immediately: "Immediately",
      withinMonth: "Within 1 month",
      oneToThree: "1–3 months",
      threeToSix: "3–6 months",
      exploring: "Just exploring",
      optional: "These preferences are optional.",
      consent: "I agree to be contacted by DriveX regarding my enquiry.",
      submitting: "Submitting your enquiry...",
      submit: "Submit enquiry",
      submitted: "Enquiry submitted successfully! Reference:",
      failed: "Enquiry submission failed.",
      somethingWrong: "Something went wrong.",
      privacy: "Your information will be used by the DriveX dealership team to respond to your enquiry.",
      petrol: "Petrol",
      diesel: "Diesel",
      cng: "CNG",
      electric: "Electric",
      hybrid: "Hybrid",
      manual: "Manual",
      automatic: "Automatic",
    },
    hi: {
      nextStep: "अगला कदम",
      interested: "क्या आप इस कार में रुचि रखते हैं",
      usedCarIntro: "अपनी ज़रूरत बताएं। हमारी डीलरशिप टीम कीमत, उपलब्धता और आगे की प्रक्रिया में आपकी मदद करेगी।",
      formLabel: "पूछताछ फ़ॉर्म",
      title: "आइए, आपके बारे में जानें।",
      subtitle: "अपनी जानकारी साझा करें। हम आपसे जल्द संपर्क करेंगे।",
      personal: "व्यक्तिगत जानकारी",
      contactDetails: "आपकी संपर्क जानकारी",
      fullName: "पूरा नाम",
      fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
      email: "ईमेल पता",
      phone: "फ़ोन नंबर",
      phonePlaceholder: "10 अंकों का फ़ोन नंबर",
      showroom: "पसंदीदा शोरूम",
      chooseShowroom: "शोरूम चुनें",
      noShowrooms: "अभी कोई शोरूम उपलब्ध नहीं है। कृपया हमारी टीम से संपर्क करें।",
      carModel: "पसंदीदा कार मॉडल (वैकल्पिक)",
      notDecided: "अभी तय नहीं किया",
      preferences: "आपकी पसंद",
      preferencesHelp: "हमें अपनी पसंद और ज़रूरतों के बारे में बताएं",
      fuel: "ईंधन की पसंद",
      selectFuel: "ईंधन का प्रकार चुनें",
      transmission: "गियर सिस्टम",
      selectTransmission: "गियर सिस्टम चुनें",
      noPreference: "कोई विशेष पसंद नहीं",
      budget: "बजट",
      selectBudget: "अपना बजट चुनें",
      under5: "₹5 लाख से कम",
      range5to10: "₹5–10 लाख",
      range10to15: "₹10–15 लाख",
      range15to25: "₹15–25 लाख",
      above25: "₹25 लाख से अधिक",
      timeline: "खरीदने की समय-सीमा",
      selectTimeline: "आप कार कब खरीदना चाहते हैं?",
      immediately: "तुरंत",
      withinMonth: "1 महीने के भीतर",
      oneToThree: "1–3 महीने",
      threeToSix: "3–6 महीने",
      exploring: "अभी जानकारी ले रहे हैं",
      optional: "ये सभी प्राथमिकताएँ वैकल्पिक हैं।",
      consent: "मैं अपनी पूछताछ के संबंध में DriveX से संपर्क किए जाने के लिए सहमत हूँ।",
      submitting: "आपकी पूछताछ भेजी जा रही है...",
      submit: "पूछताछ भेजें",
      submitted: "पूछताछ सफलतापूर्वक भेजी गई! संदर्भ संख्या:",
      failed: "पूछताछ भेजी नहीं जा सकी।",
      somethingWrong: "कुछ गड़बड़ हो गई। कृपया फिर कोशिश करें।",
      privacy: "आपकी जानकारी का उपयोग DriveX डीलरशिप टीम आपकी पूछताछ का जवाब देने के लिए करेगी।",
      petrol: "पेट्रोल",
      diesel: "डीज़ल",
      cng: "सीएनजी",
      electric: "इलेक्ट्रिक",
      hybrid: "हाइब्रिड",
      manual: "मैनुअल",
      automatic: "ऑटोमैटिक",
    },
  }[language];

  const inputStyle =
    "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-300 hover:border-neutral-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60";

  const labelStyle = "mb-2 block text-sm font-semibold text-neutral-700";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSubmissionSucceeded(false);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerName,
          email,
          phone,
          showroomId,
          modelId:
            source === "new_car"
              ? selectedModelId || null
              : modelId || null,
          source,
          fuelPreference,
          transmissionPreference,
          budget,
          purchaseTimeline,
          consentGiven: consent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || copy.failed);
      }

      setSubmissionSucceeded(true);
      setMessage(
        `${copy.submitted} ${result.enquiry.enquiry_id}`
      );

      // Keep registered buyer details populated for any subsequent enquiry.
      setBuyerName(buyerDetails?.fullName ?? "");
      setEmail(buyerDetails?.email ?? "");
      setPhone(buyerDetails?.phone ?? "");
      setShowroomId("");
      setConsent(false);
      setFuelPreference("");
      setTransmissionPreference("");
      setBudget("");
      setPurchaseTimeline("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : copy.somethingWrong
      );
    } finally {
      setLoading(false);
    }
  }

  // Hide enquiry form from dealership staff.
  if (["admin", "consultant"].includes(userRole?.trim().toLowerCase() ?? "")) {
    return null;
  }

  return (
    <section
      className="bg-[#f7f7f5] px-4 py-16 sm:px-8 lg:py-24"
      style={language === "hi" ? { fontFamily: "var(--font-hindi), sans-serif" } : undefined}
    >
      <div className="mx-auto max-w-7xl">
        {source === "used_car" && (
          <div className="mb-10 overflow-hidden rounded-[2rem] bg-[#090909] p-8 text-white shadow-xl sm:p-12">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
                  <Sparkles size={15} />
                  {copy.nextStep}
                </p>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
                  {copy.interested}
                  <span className="text-orange-500">?</span>
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
                  {copy.usedCarIntro}
                </p>
              </div>
              <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-orange-400 md:flex">
                <User size={36} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}

        <div className="stagger-item rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-xl sm:p-8 lg:p-12">
          <div className="mb-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              {copy.formLabel}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
              {copy.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              {copy.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-9">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <User size={19} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">
                    {copy.personal}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {copy.contactDetails}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>{copy.fullName}</label>
                  <input
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder={copy.fullNamePlaceholder}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>{copy.email}</label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`${inputStyle} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>{copy.phone}</label>
                  <div className="relative">
                    <Phone
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      required
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={copy.phonePlaceholder}
                      className={`${inputStyle} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>{copy.showroom}</label>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <select
                      required
                      value={showroomId}
                      onChange={(e) => setShowroomId(e.target.value)}
                      className={`${inputStyle} pl-11`}
                    >
                      <option value="">{copy.chooseShowroom}</option>
                      {showrooms.map((showroom) => (
                        <option key={showroom.id} value={showroom.id}>
                          {showroom.name} – {showroom.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {showrooms.length === 0 && (
                <p className="mt-3 text-sm text-red-600">
                  {copy.noShowrooms}
                </p>
              )}
            </div>

            <div className="border-t border-neutral-100" />

            {source === "new_car" && (
              <div>
                <label
                  htmlFor="carModel"
                  className="mb-2 block text-sm font-semibold text-neutral-700"
                >
                  Interested Car Model (Optional)
                </label>
                <select
                  id="carModel"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                >
                  <option value="">{copy.notDecided}</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Settings2 size={19} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">
                    {copy.preferences}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {copy.preferencesHelp}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    <span className="inline-flex items-center gap-2">
                      <Fuel size={15} className="text-orange-600" />
                      Fuel preference
                    </span>
                  </label>
                  <select
                    value={fuelPreference}
                    onChange={(e) => setFuelPreference(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">{copy.selectFuel}</option>
                    <option value="Petrol">{copy.petrol}</option>
                    <option value="Diesel">{copy.diesel}</option>
                    <option value="CNG">{copy.cng}</option>
                    <option value="Electric">{copy.electric}</option>
                    <option value="Hybrid">{copy.hybrid}</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>
                    <span className="inline-flex items-center gap-2">
                      <Settings2 size={15} className="text-orange-600" />
                      Transmission
                    </span>
                  </label>
                  <select
                    value={transmissionPreference}
                    onChange={(e) => setTransmissionPreference(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">{copy.selectTransmission}</option>
                    <option value="Manual">{copy.manual}</option>
                    <option value="Automatic">{copy.automatic}</option>
                    <option value="No preference">{copy.noPreference}</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>
                    <span className="inline-flex items-center gap-2">
                      <Wallet size={15} className="text-orange-600" />
                      Budget
                    </span>
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">{copy.selectBudget}</option>
                    <option value="Under ₹5 lakh">{copy.under5}</option>
                    <option value="₹5–10 lakh">{copy.range5to10}</option>
                    <option value="₹10–15 lakh">{copy.range10to15}</option>
                    <option value="₹15–25 lakh">{copy.range15to25}</option>
                    <option value="Above ₹25 lakh">{copy.above25}</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={15} className="text-orange-600" />
                      Purchase timeline
                    </span>
                  </label>
                  <select
                    value={purchaseTimeline}
                    onChange={(e) => setPurchaseTimeline(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">{copy.selectTimeline}</option>
                    <option value="Immediately">{copy.immediately}</option>
                    <option value="Within 1 month">{copy.withinMonth}</option>
                    <option value="1–3 months">{copy.oneToThree}</option>
                    <option value="3–6 months">{copy.threeToSix}</option>
                    <option value="Just exploring">{copy.exploring}</option>
                  </select>
                </div>
              </div>

              <p className="mt-4 text-xs text-neutral-400">
                {copy.optional}
              </p>
            </div>

            <div className="border-t border-neutral-100" />

            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600 transition hover:bg-orange-50/60">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-orange-600"
              />
              <span>
                {copy.consent}
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || showrooms.length === 0}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? copy.submitting : copy.submit}
              {!loading && (
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>

            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-medium ${
                  submissionSucceeded
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {submissionSucceeded && (
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                )}
                <span className="break-all">{message}</span>
              </div>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          {copy.privacy}
        </p>
      </div>
    </section>
  );
}
