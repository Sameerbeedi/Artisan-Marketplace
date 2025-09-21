'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'bn' | 'kn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation strings
const translations = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.features': 'Features', 
    'nav.recommendations': 'Recommendations',
    'nav.marketplace': 'Marketplace',
    'nav.tools': 'Artisan Tools',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.signOut': 'Sign Out',
    
    // Hero Section
    'hero.badge': 'AI-Powered Marketplace',
    'hero.title': 'Discover Authentic Artisan Crafts',
    'hero.subtitle': 'Connect with skilled artisans and find unique, handcrafted products with the help of AI-powered recommendations tailored just for you.',
    'hero.exploreMarketplace': 'Explore Marketplace',
    'hero.artisanTools': 'Artisan Tools',
    'hero.happyCustomers': '1000+ Happy Customers',
    'hero.rating': '4.9/5 Rating',
    
    // Features
    'features.title': 'Why Choose Our Marketplace?',
    'features.subtitle': 'Experience the perfect blend of traditional craftsmanship and modern technology',
    
    // Story Tool
    'story.title': 'AI Story Generator',
    'story.productTitle': 'Product Title',
    'story.productDescription': 'Product Description', 
    'story.materials': 'Materials Used',
    'story.stateQuality': 'State/Quality',
    'story.generateStory': 'Generate Story + Price + AR Model',
    'story.generating': 'Generating...',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
  },
  hi: {
    // Header
    'nav.home': 'होम',
    'nav.features': 'फीचर्स',
    'nav.recommendations': 'सुझाव',
    'nav.marketplace': 'बाजार',
    'nav.tools': 'कारीगर उपकरण',
    'nav.signIn': 'साइन इन',
    'nav.signUp': 'साइन अप',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.signOut': 'साइन आउट',
    
    // Hero Section
    'hero.badge': 'AI-संचालित बाजार',
    'hero.title': 'प्रामाणिक कारीगर शिल्प खोजें',
    'hero.subtitle': 'कुशल कारीगरों से जुड़ें और अपने लिए तैयार AI-संचालित सुझावों की मदद से अनोखे, हस्तनिर्मित उत्पाद खोजें।',
    'hero.exploreMarketplace': 'बाजार देखें',
    'hero.artisanTools': 'कारीगर उपकरण',
    'hero.happyCustomers': '1000+ खुश ग्राहक',
    'hero.rating': '4.9/5 रेटिंग',
    
    // Features
    'features.title': 'हमारा बाजार क्यों चुनें?',
    'features.subtitle': 'पारंपरिक शिल्प कौशल और आधुनिक तकनीक का सही मिश्रण अनुभव करें',
    
    // Story Tool
    'story.title': 'AI कहानी जेनरेटर',
    'story.productTitle': 'उत्पाद शीर्षक',
    'story.productDescription': 'उत्पाद विवरण',
    'story.materials': 'उपयोग की गई सामग्री',
    'story.stateQuality': 'राज्य/गुणवत्ता',
    'story.generateStory': 'कहानी + मूल्य + AR मॉडल जेनरेट करें',
    'story.generating': 'जेनरेट हो रहा है...',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
  },
  ta: {
    // Header
    'nav.home': 'முகப்பு',
    'nav.features': 'அம்சங்கள்',
    'nav.recommendations': 'பரிந்துரைகள்',
    'nav.marketplace': 'சந்தை',
    'nav.tools': 'கைவினைஞர் கருவிகள்',
    'nav.signIn': 'உள்நுழைவு',
    'nav.signUp': 'பதிவு செய்யவும்',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.signOut': 'வெளியேறு',
    
    // Hero Section
    'hero.badge': 'AI-சக்தியாக்கப்பட்ட சந்தை',
    'hero.title': 'உண்மையான கைவினைஞர் கைவினைகளைக் கண்டறியவும்',
    'hero.subtitle': 'திறமையான கைவினைஞர்களுடன் இணைந்து உங்களுக்காக தனிப்பயனாக்கப்பட்ட AI-சக்தியாக்கப்பட்ட பரிந்துரைகளின் உதவியுடன் தனித்துவமான, கையால் செய்யப்பட்ட தயாரிப்புகளைக் கண்டறியவும்.',
    'hero.exploreMarketplace': 'சந்தையை ஆராயவும்',
    'hero.artisanTools': 'கைவினைஞர் கருவிகள்',
    'hero.happyCustomers': '1000+ மகிழ்ச்சியான வாடிக்கையாளர்கள்',
    'hero.rating': '4.9/5 மதிப்பீடு',
    
    // Features
    'features.title': 'எங்கள் சந்தையை ஏன் தேர்வு செய்ய வேண்டும்?',
    'features.subtitle': 'பாரம்பரிய கைவினைத்திறன் மற்றும் நவீன தொழில்நுட்பத்தின் சரியான கலவையை அனுபவிக்கவும்',
    
    // Story Tool
    'story.title': 'AI கதை ஜெனரேட்டர்',
    'story.productTitle': 'தயாரிப்பு தலைப்பு',
    'story.productDescription': 'தயாரிப்பு விளக்கம்',
    'story.materials': 'பயன்படுத்தப்பட்ட பொருட்கள்',
    'story.stateQuality': 'மாநிலம்/தரம்',
    'story.generateStory': 'கதை + விலை + AR மாதிரி உருவாக்கவும்',
    'story.generating': 'உருவாக்கப்படுகிறது...',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.cancel': 'ரத்து செய்',
    'common.save': 'சேமிக்கவும்',
  },
  bn: {
    // Header
    'nav.home': 'হোম',
    'nav.features': 'ফিচার',
    'nav.recommendations': 'সুপারিশ',
    'nav.marketplace': 'বাজার',
    'nav.tools': 'কারিগর সরঞ্জাম',
    'nav.signIn': 'সাইন ইন',
    'nav.signUp': 'সাইন আপ',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.signOut': 'সাইন আউট',
    
    // Hero Section
    'hero.badge': 'AI-চালিত বাজার',
    'hero.title': 'খাঁটি কারিগর কারুশিল্প আবিষ্কার করুন',
    'hero.subtitle': 'দক্ষ কারিগরদের সাথে সংযুক্ত হন এবং আপনার জন্য কাস্টমাইজ করা AI-চালিত সুপারিশের সাহায্যে অনন্য, হস্তনির্মিত পণ্য খুঁজুন।',
    'hero.exploreMarketplace': 'বাজার অন্বেষণ করুন',
    'hero.artisanTools': 'কারিগর সরঞ্জাম',
    'hero.happyCustomers': '1000+ সন্তুষ্ট গ্রাহক',
    'hero.rating': '4.9/5 রেটিং',
    
    // Features
    'features.title': 'কেন আমাদের বাজার বেছে নিবেন?',
    'features.subtitle': 'ঐতিহ্যবাহী কারুশিল্প এবং আধুনিক প্রযুক্তির নিখুঁত মিশ্রণ অনুভব করুন',
    
    // Story Tool
    'story.title': 'AI গল্প জেনারেটর',
    'story.productTitle': 'পণ্যের শিরোনাম',
    'story.productDescription': 'পণ্যের বিবরণ',
    'story.materials': 'ব্যবহৃত উপাদান',
    'story.stateQuality': 'রাজ্য/গুণমান',
    'story.generateStory': 'গল্প + মূল্য + AR মডেল তৈরি করুন',
    'story.generating': 'তৈরি হচ্ছে...',
    
    // Common
    'common.loading': 'লোড হচ্ছে...',
    'common.error': 'ত্রুটি',
    'common.success': 'সফল',
    'common.cancel': 'বাতিল',
    'common.save': 'সেভ করুন',
  },
  kn: {
    // Header
    'nav.home': 'ಮುಖ್ಯಪುಟ',
    'nav.features': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
    'nav.recommendations': 'ಶಿಫಾರಸುಗಳು',
    'nav.marketplace': 'ಮಾರುಕಟ್ಟೆ',
    'nav.tools': 'ಕರಕುಶಲ ಉಪಕರಣಗಳು',
    'nav.signIn': 'ಸೈನ್ ಇನ್',
    'nav.signUp': 'ಸೈನ್ ಅಪ್',
    'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'nav.signOut': 'ಸೈನ್ ಔಟ್',
    
    // Hero Section
    'hero.badge': 'AI-ಚಾಲಿತ ಮಾರುಕಟ್ಟೆ',
    'hero.title': 'ಅಧಿಕೃತ ಕರಕುಶಲ ಕಲೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    'hero.subtitle': 'ನುರಿತ ಕರಕುಶಲತೆಗಾರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ ಮತ್ತು ನಿಮಗಾಗಿ ಕಸ್ಟಮೈಸ್ ಮಾಡಲಾದ AI-ಚಾಲಿತ ಶಿಫಾರಸುಗಳ ಸಹಾಯದಿಂದ ಅನನ್ಯ, ಕೈಯಿಂದ ತಯಾರಿಸಿದ ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ.',
    'hero.exploreMarketplace': 'ಮಾರುಕಟ್ಟೆ ಅನ್ವೇಷಿಸಿ',
    'hero.artisanTools': 'ಕರಕುಶಲ ಉಪಕರಣಗಳು',
    'hero.happyCustomers': '1000+ ಸಂತೋಷದ ಗ್ರಾಹಕರು',
    'hero.rating': '4.9/5 ರೇಟಿಂಗ್',
    
    // Features
    'features.title': 'ನಮ್ಮ ಮಾರುಕಟ್ಟೆಯನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು?',
    'features.subtitle': 'ಸಾಂಪ್ರದಾಯಿಕ ಕರಕುಶಲತೆ ಮತ್ತು ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನದ ಪರಿಪೂರ್ಣ ಮಿಶ್ರಣವನ್ನು ಅನುಭವಿಸಿ',
    
    // Story Tool
    'story.title': 'AI ಕಥೆ ಜನರೇಟರ್',
    'story.productTitle': 'ಉತ್ಪನ್ನದ ಶೀರ್ಷಿಕೆ',
    'story.productDescription': 'ಉತ್ಪನ್ನದ ವಿವರಣೆ',
    'story.materials': 'ಬಳಸಿದ ವಸ್ತುಗಳು',
    'story.stateQuality': 'ರಾಜ್ಯ/ಗುಣಮಟ್ಟ',
    'story.generateStory': 'ಕಥೆ + ಬೆಲೆ + AR ಮಾದರಿ ರಚಿಸಿ',
    'story.generating': 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    
    // Common
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.error': 'ದೋಷ',
    'common.success': 'ಯಶಸ್ಸು',
    'common.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'common.save': 'ಉಳಿಸಿ',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}