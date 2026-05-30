# SVI Infra Solutions — Future Plan & Product Roadmap

यह दस्तावेज़ **SVI Infra Solutions Pvt. Ltd.** के आगामी डिजिटल बदलावों (Digital Transformation) और नए प्रीमियम फीचर्स के लिए एक विस्तृत तकनीकी और व्यावहारिक रोडमैप है। इसमें उन 7 महत्वपूर्ण फीचर्स का योजनाबद्ध आर्किटेक्चर शामिल है जो प्लेटफॉर्म को भारत का सबसे एडवांस्ड रियल एस्टेट और एम्प्लॉई मैनेजमेंट सिस्टम बनाएंगे।

---

## 📅 Roadmap Overview & Priority Matrix

हम इन फीचर्स को 3 फेज (Phases) में विभाजित करके लागू करने का प्रस्ताव रखते हैं ताकि सिस्टम की स्थिरता बनी रहे:

| Feature | Phase | Priority | Tech Complexity | Key Dependency |
| :--- | :--- | :--- | :--- | :--- |
| **🌐 Multi-lingual Toggle** | Phase 1 | High | Low | i18n Translation dictionary |
| **🤖 Gemini AI Chatbot** | Phase 1 | High | Medium | Gemini API & Supabase Lead table |
| **📊 Interactive ROI & EMI Calculator** | Phase 1 | Medium | Low | React State / Mathematical models |
| **💼 Premium Customer Portal** | Phase 2 | High | High | Supabase Auth, Storage & Schema |
| **🗺️ Interactive Map Search** | Phase 2 | Medium | Medium | Google Maps JS SDK & Geo-queries |
| **📍 Employee Geofencing** | Phase 3 | High | High | Geolocation API & Check-in validation |
| **💬 SMS & WhatsApp Alerts** | Phase 3 | Medium | Medium | Twilio / Meta Cloud API |

---

## 🛠️ Detailed Feature Architecture & Implementation Plan

---

### 1. 🤖 Gemini AI Chatbot (फ्लोटिंग असिस्टेंट)
वेबसाइट पर आने वाले ग्राहकों को ऑटोमैटिक जवाब देने और लीड्स कैप्चर करने के लिए एक स्मार्ट एआई एजेंट।

*   **UI/UX Design Concept:**
    *   स्क्रीन के निचले-दाएं (bottom-right) कोने में एक फ्लोटिंग गोल्ड-ग्लोइंग बबल आइकन (Gemini Aura)।
    *   क्लिक करने पर एक स्लीक ग्लासमोर्फिक (Glassmorphic) चैट विंडो खुलेगी जिसमें टाइपिंग इंडिकेटर और पहले से तय सुझाव (जैसे *"Jaipur properties under 40L"*) होंगे।
    *   Framer Motion द्वारा स्मूथ स्लाइड-अप और स्केल-इन एनिमेशन।
*   **Technical Architecture:**
    *   **Frontend:** React component (`src/components/common/AIChatbot.tsx`) जिसमें local state के जरिए मैसेज स्टोर होंगे।
    *   **Backend:** API Endpoint (`app/api/ai/chat/route.ts`) जो यूजर के इनपुट को प्राप्त कर `@google/genai` API को कॉल करेगा।
    *   **Context Injection:** एआई मॉडल को कंपनी सेटिंग्स (`company_settings.json`) और वर्तमान प्रोजेक्ट्स (Supabase `projects` टेबल) का डेटा सिस्टम प्रॉम्प्ट के साथ फीड किया जाएगा ताकि वह सटीक जवाब दे सके।
*   **Supabase Schema Changes:**
    *   लीड कैप्चर करने के लिए एक नई टेबल `ai_leads` बनाई जाएगी:
        ```sql
        CREATE TABLE ai_leads (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_name TEXT,
            customer_phone TEXT,
            customer_email TEXT,
            inquiry_summary TEXT,
            chat_transcript JSONB,
            lead_status TEXT DEFAULT 'New',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ```

---

### 2. 📊 Interactive ROI & EMI Calculator
इन्वेस्टर और फ्लैट खरीदारों के लिए रिटर्न और मंथली किस्तों को विजुअली कैलकुलेट करने का एक अट्रैक्टिव टूल।

*   **UI/UX Design Concept:**
    *   दो टैब वाला एक इंटरेक्टिव विज़ुअल कार्ड:
        1.  **EMI Calculator:** लोन अमाउंट, ब्याज दर (Interest Rate) और अवधि (Tenure) के लिए स्लीक रेंज स्लाइडर्स (Range Sliders)।
        2.  **ROI Tracker:** फुलर स्मार्ट सिटी (Phulera Smart City) जैसे ग्रोथ कॉरिडोर में प्लॉट की वर्तमान दर और ऐतिहासिक सराहना (Appreciation) के आधार पर संभावित 5-साल का रिटर्न ग्राफ़ (Recharts का उपयोग करके)।
*   **Technical Architecture:**
    *   पूरी तरह से क्लाइंट-साइड रिएक्ट कंपोनेंट (`src/components/common/PropertyCalculator.tsx`)।
    *   गणितीय फॉर्मूले का उपयोग करके रीयल-टाइम कैलकुलेशन:
        $$\text{EMI} = \frac{P \times r \times (1+r)^n}{(1+r)^n - 1}$$
        *(जहाँ $P$ = Principal Amount, $r$ = Monthly Interest Rate, $n$ = Monthly Tenure)*
    *   Recharts का उपयोग करके एक एनिमेटेड एरिया चार्ट (Area Chart) जो भविष्य के प्रोजेक्टेड वैल्युएशन को दिखाएगा।

---

### 3. 🗺️ Interactive Google Map Search
मैप पर सीधे प्रोजेक्ट पिन्स पर क्लिक करके प्रोजेक्ट और उसके नज़दीकी महत्वपूर्ण स्थानों (Amenities) को देखना।

*   **UI/UX Design Concept:**
    *   एक स्प्लिट-स्क्रीन (Split Screen) लेआउट: बायीं तरफ प्रोजेक्ट्स की लिस्ट और दायीं तरफ फुल-स्क्रीन इंटरेक्टिव गूगल मैप।
    *   कस्टम गोल्ड मार्कर पिन्स (Gold Marker Pins) जो होवर करने पर बड़े होते हैं।
    *   मार्कर पर क्लिक करने पर एक खूबसूरत **Infowindow Card** खुले जिसमें प्रोजेक्ट की फोटो, RERA नंबर और "Explore Site" बटन हो।
*   **Technical Architecture:**
    *   `@vis.gl/react-google-maps` पैकेज का पूरा उपयोग।
    *   Google Places API का उपयोग करके प्रोजेक्ट कोऑर्डिनेट्स के चारों ओर 5-10 किलोमीटर के दायरे में आने वाले स्कूल, अस्पताल, हाईवे, और रेलवे स्टेशन की दूरी और ट्रैवल टाइम दिखाना।
    *   मैप स्टाइलिंग को वेबसाइट के लाइट/डार्क थीम के साथ ऑटोमैटिकली सिंक करना (Custom Snazzy Maps Styles for Luxury Dark Theme)।

---

### 4. 💼 Premium Customer Portal (क्लाइंट लॉग-इन डैशबोर्ड)
बायर्स के लिए एक वन-स्टॉप पोर्टल जहाँ वे अपने खरीदे गए प्रॉपर्टी की डिटेल्स, इनवॉइस और पेमेंट प्रोग्रेस देख सकें।

*   **UI/UX Design Concept:**
    *   लॉगिन करने के बाद क्लाइंट को एक कस्टमाइज्ड ग्रिड डैशबोर्ड दिखे।
    *   **Installment Timeline:** एक इंटरैक्टिव प्रोग्रेस स्टेप-बार (Timeline Tracker) जो चुकाई गई किस्तों को 'Green Check' और आगामी किस्तों को 'Pending Orange' में दिखाए।
    *   **Digital Locker:** एक साफ ग्रिड जहाँ सीधे अलॉटमेंट लेटर, बिल्डर-बायर एग्रीमेंट (BBA), और टैक्स इनवॉइस के पीडीएफ डाउनलोड लिंक्स मौजूद हों।
*   **Technical Architecture:**
    *   **Auth:** Supabase Auth का उपयोग करके कस्टमर रोल (`role = 'customer'`) वाले यूजर्स के लिए सुरक्षित रूट बनाना (`app/(customer)/dashboard/page.tsx`)।
    *   **Data Fetching:** क्लाइंट के एकाउंट से जुड़े प्रोजेक्ट्स, खरीदे गए प्लॉट्स/फ्लैट्स और पेमेंट हिस्ट्री को लाने के लिए Supabase API क्वेरीज़।
*   **Supabase Schema Changes:**
    *   प्रॉपर्टी अलॉटमेंट और इंस्टॉलमेंट्स को ट्रैक करने के लिए टेबल्स:
        ```sql
        CREATE TABLE customer_allotments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id),
            project_id UUID,
            property_no TEXT, -- (flat / plot number)
            total_price NUMERIC,
            allotted_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE property_installments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            allotment_id UUID REFERENCES customer_allotments(id),
            installment_no INT,
            due_amount NUMERIC,
            due_date DATE,
            status TEXT CHECK (status IN ('Paid', 'Pending', 'Overdue')),
            paid_date DATE,
            transaction_id TEXT,
            invoice_url TEXT
        );
        ```

---

### 5. 🌐 Multi-lingual Toggle (Hindi & English)
हिंदी और इंग्लिश भाषी दोनों प्रकार के ग्राहकों की सुविधा के लिए वन-क्लिक लैंग्वेज टॉगल।

*   **UI/UX Design Concept:**
    *   हेडर में सर्च या प्रोफाइल आइकॉन के बगल में एक गोल, स्लीक **"EN / हिंदी"** टॉगल बटन।
    *   चेंज होने पर पूरी वेबसाइट पर बिना पेज रीलोड हुए टेक्स्ट का अनुवाद (Smooth i18n Transitions) होना।
*   **Technical Architecture:**
    *   **Next.js App Router i18n Integration** या **React Context API** के ज़रिए लोकलाइजेशन (Localization) मैनेज करना।
    *   अनुवाद की फ़ाइलें `src/locales/en.json` और `src/locales/hi.json` में होंगी।
    *   SEO ऑप्टिमाइजेशन के लिए `lang="hi"` या `lang="en"` मेटाडेटा को ऑटोमैटिकली अपडेट करना।

---

### 6. 📍 Employee Geofencing (कर्मचारी हाजिरी जिओ-फेंसिंग)
कर्मचारियों की अटेंडेंस मार्क करते समय उनके फिजिकल लोकेशन को प्रोजेक्ट साइट के 200 मीटर के दायरे में वेरिफाई करना।

*   **UI/UX Design Concept:**
    *   एडमिन पैनल के हाजिरी कंपोनेंट (`MarkAttendance.tsx`) में चेक-इन बटन दबाने पर एक लाइव लोडिंग स्पिनर जो लिखेगा *"Verifying location..."*।
    *   दायरे के अंदर होने पर ग्रीन टिक के साथ हाजिरी मार्क होगी; बाहर होने पर रेड अलर्ट दिखेगा जिसमें साइट से उनकी दूरी (जैसे *"You are 2.5 km away from Shyam Aangan site"*) दिखाई देगी।
*   **Technical Architecture:**
    *   **Frontend Location Check:** HTML5 Geolocation API (`navigator.geolocation.getCurrentPosition`) का उपयोग करके यूजर के अक्षांश (Latitude) और देशांतर (Longitude) प्राप्त करना।
    *   **Backend Verification:** API Route (`app/api/admin/attendance/check-in/route.ts`) पर कोऑर्डिनेट्स भेजना। बैकएंड सर्वर-साइड पर **Haversine Formula** का उपयोग करके कर्मचारी और प्रोजेक्ट साइट के बीच की हवाई दूरी की गणना करेगा।
    *   **Haversine Formula Calculation:**
        ```typescript
        function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
            const R = 6371e3; // Earth radius in meters
            const phi1 = (lat1 * Math.PI) / 180;
            const phi2 = (lat2 * Math.PI) / 180;
            const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
            const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

            const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                      Math.cos(phi1) * Math.cos(phi2) *
                      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c; // Distance in meters
        }
        ```
*   **Supabase Schema Changes:**
    *   कर्मचारी हाजिरी टेबल में कोऑर्डिनेट्स स्टोर करने के लिए कॉलम्स जोड़ना:
        ```sql
        ALTER TABLE attendance_records 
        ADD COLUMN check_in_lat NUMERIC,
        ADD COLUMN check_in_lon NUMERIC,
        ADD COLUMN check_out_lat NUMERIC,
        ADD COLUMN check_out_lon NUMERIC,
        ADD COLUMN is_geofence_verified BOOLEAN DEFAULT FALSE;
        ```

---

### 7. 💬 SMS & WhatsApp Alerts
वेबसाइट के किसी भी बड़े अपडेट या इंस्टॉलमेंट रिमाइंडर पर ग्राहकों को रियल-टाइम नोटिफिकेशन भेजना।

*   **UI/UX Design Concept:**
    *   यूजर प्रोफाइल सेटिंग्स में एक **"Notification Preferences"** सेक्शन जहाँ ग्राहक खुद चुन सकें कि उन्हें WhatsApp, SMS या Email में से किस माध्यम पर अलर्ट चाहिए।
*   **Technical Architecture:**
    *   **Twilio API (for SMS)** और **Meta/WhatsApp Business Cloud API** का उपयोग।
    *   जब कोई एडमिन पैनल से नया अलॉटमेंट लेटर या इनवॉइस जारी करेगा, तो बैकएंड में Supabase Database Trigger या Edge Function ट्रिगर होगा।
    *   यह ट्रिगर एक व्हाट्सएप टेम्पलेट मैसेज भेजेगा (जैसे: *"नमस्ते {{name}}, आपके प्लॉट {{plot_no}} का अलॉटमेंट लेटर जारी हो गया है। डाउनलोड करने के लिए क्लिक करें: {{link}}"*)।
*   **Supabase Schema Changes:**
    *   नोटिफिकेशन लॉग्स और प्रेफरेंस स्टोर करने के लिए टेबल अपग्रेड:
        ```sql
        CREATE TABLE user_notification_settings (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id),
            sms_enabled BOOLEAN DEFAULT TRUE,
            whatsapp_enabled BOOLEAN DEFAULT TRUE,
            email_enabled BOOLEAN DEFAULT TRUE
        );

        CREATE TABLE sent_sms_whatsapp_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            message_type TEXT, -- 'WhatsApp' or 'SMS'
            recipient_number TEXT,
            message_content TEXT,
            status TEXT, -- 'Sent', 'Delivered', 'Failed'
            sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ```

---

## 📈 Next Steps for Execution

1.  **Phase 1 Development:** हम सबसे पहले **i18n (Multi-lingual)** और **Gemini AI chatbot** से शुरुआत करने की सलाह देते हैं क्योंकि इनसे कम समय में सबसे ज्यादा प्रभाव पड़ेगा।
2.  **Schema Migrations:** प्रत्येक फेज़ की शुरुआत में Supabase माइग्रेशन को अप्लाई किया जाएगा।
3.  **UI Feedback Cycles:** डिजाइन एस्थेटिक्स को बेहद प्रीमियम रखने के लिए Framer Motion की स्लीक थीमिंग सबसे पहले वैलिडेट की जाएगी।

---

## 🚀 Advanced Next-Gen Frontend Features (अतिरिक्त आधुनिक फ्रंटएंड फीचर्स)

ऊपर दिए गए 7 मुख्य फीचर्स के अलावा, रियल एस्टेट वेबसाइट को एक **अल्ट्रा-लग्जरी और इंटरनेशनल ब्रांड** लुक देने के लिए हम फ्रंटएंड में निम्नलिखित आधुनिक फीचर्स जोड़ सकते हैं:

### 1. 🌐 360° Interactive Virtual Tour (360° वर्चुअल टूर व्यूअर)
बिना साइट पर जाए, ग्राहक सीधे अपने ब्राउज़र या मोबाइल स्क्रीन से पूरे टाउनशिप या फ्लैट के अंदर का 360-डिग्री इंटरैक्टिव व्यू देख सकें।
*   **How it works:** Three.js या Pannellum लाइब्रेरी का उपयोग करके रेंडर या वास्तविक पैनोरमा फोटोग्राफ्स को ब्राउज़र में रेंडर किया जाएगा।
*   **UX Impact:** ग्राहक स्क्रीन को ड्रैग करके चारों तरफ देख सकते हैं और हॉटस्पॉट्स (Hotspots) पर क्लिक करके एक कमरे से दूसरे कमरे में जा सकते हैं।

### 2. 🗺️ Interactive SVG Site Layout & Plot Selector (इंटरेक्टिव प्लॉट सेलेक्टर)
टाउनशिप (जैसे Shyam Aangan) के नक्शे को एक साधारण इमेज के बजाय एक **इंटरेक्टिव SVG मैप** में बदलना।
*   **How it works:** प्रत्येक प्लॉट/फ्लैट को एक क्लिक करने योग्य वेक्टर ऑब्जेक्ट (SVG Path) में बदला जाएगा।
*   **Color-Coded Status:** 
    *   🟢 **Green:** Available (खाली प्लॉट)
    *   🔴 **Red:** Sold (बिक चुका प्लॉट)
    *   🟡 **Yellow:** Booked / Under Hold
*   **UX Impact:** ग्राहक प्लॉट पर होवर करेंगे तो उसका साइज (Sq. Yards) और प्राइस दिखेगा। क्लिक करने पर सीधे बुकिंग फॉर्म खुल जाएगा।

### 3. ⚖️ Property Comparison Matrix (प्रॉपर्टी तुलना मैट्रिक्स)
ग्राहकों को दो या तीन प्रोजेक्ट्स/प्लॉट्स को साइड-बाय-साइड (Side-by-Side) कंपेयर करने की सुविधा देना।
*   **How it works:** ग्राहक प्रोजेक्ट्स को "Compare List" में जोड़ेंगे। फ्रंटएंड एक सुंदर कंपैरिजन टेबल दिखाएगा।
*   **Comparison Factors:** प्राइस, लोकेशन (Jaipur vs Noida), आरईआरए (RERA) अप्रूवल स्टेटस, बुनियादी सुविधाएं (पानी की टंकी, बिजली लाइन, पार्क, डामर रोड, गेटेड बाउंड्री), और हाईवे से दूरी।

### 4. 🎯 Gamified Property Finder Quiz (गेमिफाइड प्रॉपर्टी खोज क्विज)
नए ग्राहकों को सही प्रॉपर्टी तक पहुंचाने के लिए एक इंटरैक्टिव और गेमिफाइड 4-स्टेप क्विज।
*   **How it works:** एक के बाद एक एनिमेटेड प्रश्न (उदा. *"आपका उद्देश्य क्या है? - निवेश या स्वयं का घर"*, *"आपका बजट क्या है?"*, *"पसंदीदा लोकेशन क्या है?"*)।
*   **UX Impact:** अंत में एक सुंदर कंफेटी (Confetti) एनीमेशन के साथ सर्वश्रेष्ठ मैचिंग प्रोजेक्ट्स की लिस्ट दिखेगी। इससे लीड कंवर्जन (Lead Conversion) बहुत बढ़ता है।

### 5. 🏠 Interactive 2D/3D Floor Plan Toggle (2D/3D फ्लोर प्लान विज़ुअलाइज़र)
फ्लैट्स और विला (Villa) के लिए फ्लोर प्लान को कस्टमाइज करके देखना।
*   **How it works:** ग्राहक एक साधारण 2D ब्लूप्रिंट से 3D कलर्ड रेंडर पर स्विच कर सकते हैं।
*   **Furnished vs Unfurnished Toggle:** एक बटन क्लिक करके देख सकते हैं कि फर्नीचर रखने के बाद कमरा कैसा दिखेगा (Image Swipe Slider का उपयोग करके)।

### 6. 📝 Dynamic Custom PDF Brochure Builder (कस्टम पीडीएफ ब्रोशर मेकर)
ग्राहकों को उनके नाम और चुनिंदा प्राथमिकताओं (Preferences) के साथ एक पर्सनलाइज्ड ब्रोशर डाउनलोड करने की सुविधा देना।
*   **How it works:** ग्राहक जिन प्रोजेक्ट्स को सिलेक्ट करेंगे, सिस्टम फ्रंटएंड पर ही jsPDF का उपयोग करके एक कस्टमाइज्ड ब्रोशर बनाएगा जिसपर लिखा होगा: *"Prepared Custom Brochure for [Client Name]"*।

---
*© 2026 SVI Infra Solutions Pvt. Ltd. All rights reserved. Confidential Roadmap.*
