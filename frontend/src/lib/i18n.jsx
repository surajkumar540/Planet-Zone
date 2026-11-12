import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { REGIONAL } from "./locales";

/**
 * Lightweight translations for the storefront.
 *
 * The English text itself is the key: `t("Add to bag")`. A missing translation
 * falls back to English, so a new string never renders blank, and adding a
 * language means adding one dictionary below. `{name}` placeholders are filled
 * from the second argument: `t("{n} products", { n: 12 })`.
 *
 * Product names and descriptions come from the database and are not translated.
 */

/** `translate` is the word "translation" in that language, shown in the menu. */
export const LANGUAGES = [
  { code: "en", label: "English", native: "English", translate: "" },
  { code: "hi", label: "Hindi", native: "हिन्दी", translate: "अनुवाद" },
  { code: "ta", label: "Tamil", native: "தமிழ்", translate: "மொழிபெயர்ப்பு" },
  { code: "te", label: "Telugu", native: "తెలుగు", translate: "అనువాదం" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", translate: "ಭಾಷಾಂತರ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", translate: "വിവർത്തനം" },
  { code: "bn", label: "Bengali", native: "বাংলা", translate: "অনুবাদ" },
  { code: "mr", label: "Marathi", native: "मराठी", translate: "भाषांतर" },
];

const STORAGE_KEY = "planet.language";

const HI = {
  // Navigation and account
  Home: "होम",
  Shop: "शॉप",
  About: "हमारे बारे में",
  Contact: "संपर्क",
  Wishlist: "विशलिस्ट",
  "Sign in": "साइन इन",
  "Sign out": "साइन आउट",
  Profile: "प्रोफ़ाइल",
  Orders: "ऑर्डर",
  Dashboard: "डैशबोर्ड",
  Language: "भाषा",
  Search: "खोजें",
  "Search products, brands and more": "उत्पाद, ब्रांड और बहुत कुछ खोजें",

  // Search suggestions
  Products: "उत्पाद",
  Categories: "श्रेणियाँ",
  Brands: "ब्रांड",
  "Recent searches": "हाल की खोजें",
  "Shop by department": "विभाग के अनुसार खरीदें",
  Clear: "साफ़ करें",
  "See all results for “{q}”": "“{q}” के सभी परिणाम देखें",
  "No matches for “{q}”": "“{q}” के लिए कोई परिणाम नहीं",
  "Try a shorter word or a brand name.": "छोटा शब्द या ब्रांड का नाम आज़माएँ।",

  // Product card and bag
  "Add to bag": "बैग में डालें",
  Added: "जोड़ दिया",
  "Sold out": "बिक गया",
  "Choose options": "विकल्प चुनें",
  "Only {n} left": "केवल {n} बचे",
  Featured: "विशेष",
  "Added to your bag": "आपके बैग में जोड़ दिया गया",
  "View bag": "बैग देखें",
  Checkout: "चेकआउट",
  "Bag: {n} items": "बैग: {n} आइटम",
  "Bag: 1 item": "बैग: 1 आइटम",
  "Already in your bag": "पहले से आपके बैग में",
  "You have all {n} in stock in your bag.": "स्टॉक में मौजूद सभी {n} आपके बैग में हैं।",

  // Shop
  "All products": "सभी उत्पाद",
  "Results for “{q}”": "“{q}” के परिणाम",
  "{n} products": "{n} उत्पाद",
  "1 product": "1 उत्पाद",
  "Finding products…": "उत्पाद खोजे जा रहे हैं…",
  Filters: "फ़िल्टर",
  "Clear all": "सब हटाएँ",
  Category: "श्रेणी",
  Price: "कीमत",
  Brand: "ब्रांड",
  "Customer rating": "ग्राहक रेटिंग",
  "Offers & availability": "ऑफ़र और उपलब्धता",
  "On sale": "सेल में",
  "In stock": "स्टॉक में",
  "& up": "और ऊपर",
  "Show {n} more": "{n} और दिखाएँ",
  "Show less": "कम दिखाएँ",
  "Nothing matched": "कुछ नहीं मिला",
  "Try removing a filter or two, or search for something a little broader.":
    "एक-दो फ़िल्टर हटाकर देखें, या थोड़ा व्यापक खोजें।",
  "Clear all filters": "सभी फ़िल्टर हटाएँ",
  "Show {n} products": "{n} उत्पाद दिखाएँ",
  "Newest first": "सबसे नए पहले",
  "Price: low to high": "कीमत: कम से ज़्यादा",
  "Price: high to low": "कीमत: ज़्यादा से कम",
  "Top rated": "सबसे ज़्यादा रेटेड",
  "Name: A–Z": "नाम: A–Z",
  "Find a category": "श्रेणी खोजें",
  "Find a brand": "ब्रांड खोजें",
  All: "सभी",
  "Loading more…": "और लोड हो रहे हैं…",
  "You've seen all {n} products": "आपने सभी {n} उत्पाद देख लिए",
  "Back to top": "ऊपर जाएँ",
  "Nothing to filter yet.": "अभी फ़िल्टर करने को कुछ नहीं।",
  "Under ₹500": "₹500 से कम",

  // Home
  "Featured this week": "इस हफ़्ते के ख़ास",
  "New arrivals": "नए उत्पाद",
  "Rated four stars and above": "चार स्टार और उससे ऊपर",
  "View all": "सब देखें",
  "Shop by category": "श्रेणी के अनुसार खरीदें",
  "Jump straight to the shelf you came for.": "सीधे अपनी पसंद की श्रेणी पर जाएँ।",
  Browse: "ब्राउज़ करें",
  Handpicked: "चुनिंदा",
  "Just landed": "अभी-अभी आए",
  "Customer favourites": "ग्राहकों की पसंद",
  "Free delivery": "मुफ़्त डिलीवरी",
  "On orders above ₹499": "₹499 से ऊपर के ऑर्डर पर",
  "7-day returns": "7 दिन में वापसी",
  "No questions asked": "बिना कोई सवाल",
  "Secure payments": "सुरक्षित भुगतान",
  "Cards, UPI, net banking": "कार्ड, UPI, नेट बैंकिंग",
  "Quality checked": "गुणवत्ता जाँची गई",
  "Inspected before it ships": "भेजने से पहले जाँचा गया",
  "New season, new shelf": "नया मौसम, नई शेल्फ़",
  "Fresh picks added this week. Be the first to find your new favourite.":
    "इस हफ़्ते नए उत्पाद जुड़े हैं। अपनी नई पसंद सबसे पहले खोजें।",
  "Shop new arrivals": "नए उत्पाद देखें",
  "Limited time": "सीमित समय",
  "Everyday value": "रोज़ की बचत",
  "Save up to {n}%": "{n}% तक की बचत",
  "Prices you'll love": "पसंद आने वाली कीमतें",
  "On selected essentials while stocks last.": "चुनिंदा ज़रूरी सामान पर, स्टॉक रहने तक।",
  "Fairly priced essentials, delivered across India.": "सही दाम पर ज़रूरी सामान, पूरे भारत में डिलीवरी।",
  "Shop the deals": "ऑफ़र देखें",
  "Browse the shop": "शॉप देखें",
  "On us": "हमारी ओर से",
  "Free delivery over ₹499": "₹499 से ऊपर मुफ़्त डिलीवरी",
  "Plus 7-day easy returns on every order. No fine print.":
    "साथ ही हर ऑर्डर पर 7 दिन में आसान वापसी। कोई छिपी शर्त नहीं।",
  "Start shopping": "खरीदारी शुरू करें",
  "Deal of the day": "आज का ऑफ़र",
  "Pick of the day": "आज की पसंद",
  "Offer refreshes in": "ऑफ़र बदलेगा",
  "Next pick in": "अगली पसंद",
  hrs: "घंटे",
  min: "मिनट",
  sec: "सेकंड",
  "View details": "विवरण देखें",
  "Small shop, carefully stocked": "छोटी दुकान, सोच-समझकर चुना सामान",
  "Every product is chosen by people, checked before it ships, and easy to send back.":
    "हर उत्पाद लोगों द्वारा चुना जाता है, भेजने से पहले जाँचा जाता है, और आसानी से लौटाया जा सकता है।",
  "Explore the shop": "शॉप देखें",

  // Footer
  Account: "खाता",
  Company: "कंपनी",
  "Your profile": "आपकी प्रोफ़ाइल",
  "Your orders": "आपके ऑर्डर",
  "Your bag": "आपका बैग",
  "About us": "हमारे बारे में",
  "Everyday essentials, sourced carefully and delivered across India.":
    "रोज़मर्रा का ज़रूरी सामान, सावधानी से चुना और पूरे भारत में पहुँचाया।",
  "Prices include GST where applicable.": "कीमतों में लागू GST शामिल है।",
  "All rights reserved.": "सर्वाधिकार सुरक्षित।",

  // Profile
  "Your account": "आपका खाता",
  "Personal details": "व्यक्तिगत जानकारी",
  Addresses: "पते",
  Security: "सुरक्षा",
  "First name": "पहला नाम",
  "Last name": "उपनाम",
  "Mobile number": "मोबाइल नंबर",
  Email: "ईमेल",
  "Email can't be changed": "ईमेल बदला नहीं जा सकता",
  "Save changes": "बदलाव सहेजें",
  "Saved addresses": "सहेजे गए पते",
  "Add an address": "पता जोड़ें",
  "New address": "नया पता",
  Default: "डिफ़ॉल्ट",
  Remove: "हटाएँ",
  "Change password": "पासवर्ड बदलें",
  "Current password": "मौजूदा पासवर्ड",
  "New password": "नया पासवर्ड",
  "Confirm new password": "नए पासवर्ड की पुष्टि करें",
  "Update password": "पासवर्ड अपडेट करें",
  "Member since {date}": "{date} से सदस्य",
  "Verified email": "सत्यापित ईमेल",
  "No addresses yet": "अभी कोई पता नहीं",
  "Save one now and checkout will be one tap faster.": "अभी एक पता सहेजें, चेकआउट और तेज़ होगा।",

  // About
  "Our story": "हमारी कहानी",
  "A shop that keeps its promises.": "एक दुकान जो अपने वादे निभाती है।",
  "See what we stock": "देखें हमारे पास क्या है",
  "What we hold ourselves to": "हम किन बातों पर कायम हैं",
  "Four things we don't compromise on": "चार बातें जिन पर हम समझौता नहीं करते",
  "Sourced responsibly": "ज़िम्मेदारी से चुना गया",
  "Honest listings": "ईमानदार जानकारी",
  "People first": "लोग पहले",
  "Built to last": "टिकाऊ सामान",
  "The shop today": "आज की दुकान",
  "Products on the shelf": "शेल्फ़ पर उत्पाद",
  Departments: "विभाग",
  "How an order reaches you": "आपका ऑर्डर आप तक कैसे पहुँचता है",
};

const DICTIONARIES = { en: {}, hi: HI, ...REGIONAL };

const I18nContext = createContext(null);

const readStored = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((language) => language.code === stored) ? stored : "en";
  } catch {
    return "en";
  }
};

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(readStored);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private mode: the choice simply is not remembered.
    }
  }, [lang]);

  const t = useCallback(
    (text, vars) => {
      const template = DICTIONARIES[lang]?.[text] ?? text;
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang: setLangState, t, languages: LANGUAGES }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

/** `const { t, lang, setLang, languages } = useI18n();` Works (in English) outside the provider too. */
export const useI18n = () =>
  useContext(I18nContext) || {
    lang: "en",
    setLang: () => {},
    languages: LANGUAGES,
    t: (text, vars) =>
      vars ? text.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match)) : text,
  };

export default useI18n;
