# 🧪 Eco-Chemist - Smart Chemistry Learning Hub

<div align="center">
<img width="1200" height="475" alt="Eco-Chemist Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

**An Advanced STEM Educational Platform for Environmental Chemistry**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

---

## 🌟 **Overview**

Eco-Chemist is a cutting-edge educational platform combining **artificial intelligence**, **chemistry**, and **environmental awareness** to create an immersive learning experience. Built for STEM competitions and classroom use, it empowers students to understand the chemistry of everyday materials while promoting sustainable practices.

---

## ✨ **Core Features**

### 1. 🔬 **Advanced Material Scanner**
Transform your camera into a scientific instrument:
- **AI-Powered Polymer Identification** - Instantly identify 7 types of plastics (PET, HDPE, PVC, LDPE, PP, PS, OTHER)
- **Recyclability Scoring System** - Visual 0-100 scale with color-coded ratings
- **Chemical Structure Display** - Shows molecular formula with LaTeX rendering and chemical bonds notation
- **Environmental Impact Timeline** - Displays natural degradation periods (450-700 years)
- **Common Applications** - Lists real-world uses in both English and Arabic
- **Safety Ratings** - Comprehensive safety information for each material
- **Offline-First AI** - Processes images securely without persistent storage

**Security Features:**
- Validates image format and size (max 10MB)
- Prevents metadata injection attacks
- No raw image persistence for privacy

---

### 2. ⚖️ **Matrix-Based Equation Balancer**

Revolutionary approach to chemical equation balancing:
- **Gaussian Elimination (RREF)** - Uses linear algebra instead of trial-and-error
- **Step-by-Step Explanation** - Interactive 4-stage breakdown:
  1. Element Matrix Setup
  2. Gaussian Elimination Process
  3. Back Substitution
  4. Result Verification
- **LaTeX Preview** - Real-time equation rendering
- **AI Fallback** - Google Gemini handles complex equations when local solver fails
- **Educational Mode** - Toggle-able matrix method visualization

**Security Features:**
- Chemical formula whitelist validation
- Input sanitization (prevents code injection)
- Maximum length enforcement (200 chars)

---

### 3. 🧬 **Molecular Structure Analyzer**

Deep dive into molecular geometry:
- **Lewis Structure Generation** - AI-powered visualization
- **VSEPR Geometry Prediction** - Accurate molecular shape determination
- **Hybridization Detection** - sp, sp², sp³ orbital analysis
- **Interactive 3D Viewer** - Zoom, pan, and rotate controls
- **Bond Angle Estimation** - Theoretical vs predicted comparison
- **Detailed Analysis** - Comprehensive molecular properties

**Security Features:**
- Molecular formula validation (letters & numbers only)
- Safe SVG rendering (XSS prevention)
- No arbitrary script execution in viewer

---

### 4. 📊 **Eco Impact Analytics Engine**

Track your environmental contribution:
- **CO₂ Savings Tracker** - Estimates carbon footprint reduction (kg)
- **Plastic Identification Count** - Total samples analyzed
- **Activity Streak** - Daily engagement tracking
- **Visual Dashboard** - Color-coded metrics with gradient cards
- **Gamification** - XP points, levels, and ranks
- **Progress Motivation** - Encouraging environmental messages

**Data Privacy:**
- Local storage only (no cloud sync by default)
- Optional anonymized analytics
- No personal identifiers in logs

---

### 5. 🤖 **Hardened AI Eco-Tutor**

Secure and intelligent chemistry assistant:
- **Domain-Restricted Knowledge** - Focus on chemistry and environmental science
- **Prompt Injection Protection** - Advanced pattern detection
- **Rate Limiting** - 20 requests/minute to prevent abuse
- **Input Sanitization** - HTML/script tag removal
- **Response Moderation** - Filters unsafe AI outputs
- **Context Isolation** - Session-based memory
- **Security Badge** - Shows "Protected" status
- **Clear Chat Feature** - Privacy-first design

**Bilingual Support:** 
- Full Arabic and English interface
- LaTeX rendering for scientific notation
- Cultural localization

---

## 🛡️ **Security Architecture**

### **Global Security Measures**

1. **Input Validation Layer**
   - Chemical formula whitelist (`A-Z`, `a-z`, `0-9`, `+`, `-`, `->`, `=`, `()`)
   - Maximum length enforcement
   - Special character filtering

2. **Prompt Injection Detection**
   - Detects keywords: "ignore instructions", "you are now", "system:", etc.
   - Blocks special tokens and markup
   - Fallback graceful error handling

3. **Rate Limiting**
   - In-memory rate limiter (20 req/min)
   - Per-session tracking
   - Sliding window algorithm

4. **AI Response Filtering**
   - Removes `<script>`, `<iframe>` tags
   - Sanitizes event handlers
   - Flags suspicious content

5. **Error Handling**
   - No stack trace exposure
   - User-friendly error messages
   - Bilingual error responses

---

## 🚀 **Installation & Setup**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Google Gemini API key ([Get one here](https://ai.google.dev/))
- Firebase project (for authentication)

### **Quick Start**

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd Eco-Chemist

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create .env.local file with:
API_KEY=your_gemini_api_key_here
FIREBASE_API_KEY=your_firebase_api_key
# ... (other Firebase config)

# 4. Run development server
npm run dev

# 5. Open in browser
# http://localhost:5173 (or port shown in terminal)
```

---

## 🏗️ **Project Structure**

```
Eco-Chemist/
├── components/
│   ├── Scanner.tsx          # Advanced material scanner
│   ├── StudySuite.tsx       # Equation balancer + Lewis structures
│   ├── AiTutor.tsx          # Secure AI chat assistant
│   ├── PeriodicTable.tsx    # Interactive periodic table
│   ├── Auth.tsx             # Firebase authentication
│   └── Latex.tsx            # Math rendering component
├── services/
│   ├── geminiService.ts     # Google Gemini API integration
│   ├── firebase.ts          # Firebase auth service
│   └── system-prompt.ts     # AI tutor system instructions
├── utils/
│   ├── chemistry.ts         # Equation balancing algorithms
│   └── security.ts          # Security utilities (NEW)
├── constants.ts             # Plastic types & elements database
├── types.ts                 # TypeScript interfaces
├── App.tsx                  # Main application
└── index.css                # Global styles + animations
```

---

## 📚 **Technology Stack**

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19.2.4 + TypeScript 5.8.2 |
| **Build Tool** | Vite 6.2.0 |
| **Styling** | TailwindCSS 4.1.18 |
| **AI Engine** | Google Gemini 2.5 Flash |
| **Math Rendering** | KaTeX 0.16.9 |
| **Authentication** | Firebase 12.9.0 |
| **Icons** | Lucide React 0.563.0 |
| **Language** | Bilingual (Arabic/English) |

---

## 🎓 **Educational Value**

### **Learning Outcomes**
Students will be able to:
- ✅ Identify polymer types and understand their chemical composition
- ✅ Balance complex chemical equations using matrix algebra
- ✅ Visualize molecular structures and predict geometry
- ✅ Understand environmental impact of materials
- ✅ Make informed recycling decisions
- ✅ Apply chemistry concepts to real-world problems

---

## 🌍 **Environmental Impact**

Eco-Chemist promotes sustainability by:
- 📱 **Mobile-First** - Accessible on any device, anywhere
- ♻️ **Recycling Education** - Teaches proper plastic sorting
- 🌱 **CO₂ Awareness** - Tracks environmental savings
- 🔬 **Scientific Literacy** - Evidence-based decision making
- 🌐 **Global Reach** - Bilingual for wider adoption

---

## 🔐 **Privacy & Compliance**

- ✅ No user data sold or shared
- ✅ Local-first storage (Firebase optional)
- ✅ Camera access only when needed
- ✅ No image persistence (privacy-first scanner)
- ✅ Transparent AI usage
- ✅ GDPR-friendly design

---

## 🏆 **Competition Ready**

Perfect for:
- 🥇 **STEM Competitions** - Showcases innovation and technical excellence
- 🏫 **Science Fairs** - Combines chemistry, computer science, and environmental science
- 🌟 **Hackathons** - Full-stack project with AI integration
- 📖 **Classroom Use** - Practical tool for chemistry education

---

## 🤝 **Contributing**

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 **Acknowledgments**

- Google Gemini for AI capabilities
- Firebase for authentication infrastructure
- KaTeX for beautiful math rendering
- Lucide for clean, modern icons
- The open-source community

---

## 📧 **Contact & Support**

- **AI Studio Link**: https://ai.studio/apps/drive/1_ezqHVoOj1s76pbpNOPR_LhruWz9C6GC
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

---

<div align="center">

**Built with ❤️ for science education and environmental awareness**

🧪 **Make Chemistry Fun** | 🌍 **Save the Planet** | 🚀 **Powered by AI**

</div>
