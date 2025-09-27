# Almanaque da Fala - Q Context File

## Project Overview
Almanaque da Fala is a comprehensive speech therapy platform designed for Brazilian Portuguese fonoaudiólogos (speech therapists). The platform provides AI-powered tools for exercise generation, voice demonstration, and therapeutic content management.

## Target Users
- **Primary**: Brazilian fonoaudiólogos (speech therapists)
- **Secondary**: Parents and caregivers of children with speech disorders
- **Focus**: Practical, daily-use tools that solve real therapy problems

## Technical Stack
- **Framework**: Next.js 15.5.3 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Authentication**: Clerk
- **Database**: (Not specified in current context)
- **AI Services**: 
  - OpenAI API (GPT-4 for text generation)
  - Google Cloud Text-to-Speech API (for natural voice synthesis)
- **Deployment**: Vercel (inferred from scripts)

## Key Features

### 1. Voice Demonstration Tool
- **Purpose**: Preserve therapist's voice during sessions
- **Technology**: Google TTS (primary) with browser TTS fallback
- **Content**: Phoneme-specific therapeutic phrases in Brazilian Portuguese
- **Features**: 
  - Slow motion speech (0.4x speed for therapy)
  - Repeat mode (3x automatic repetition)
  - High-quality neural voices
- **Location**: `/dashboard/ai/text-to-speech`

### 2. Exercise Generation (AI-Powered)
- **Purpose**: Generate therapeutic exercises for specific phonemes
- **Technology**: OpenAI GPT-4
- **Content**: Customized exercises based on patient needs
- **Location**: `/dashboard/ai/exercise-generator`

### 3. Dashboard
- **Purpose**: Central hub for therapists
- **Features**: Patient management, exercise library, voice tools
- **Design**: Professional, clean interface matching clinical needs

## File Structure
```
my-fonosass/
├── app/
│   ├── dashboard/
│   │   ├── ai/
│   │   │   ├── text-to-speech/     # Voice demonstration
│   │   │   └── exercise-generator/ # AI exercise generation
│   │   └── page.tsx               # Main dashboard
│   └── api/
│       └── ai/
│           ├── google-tts/        # Google TTS endpoint
│           └── generate-content/  # Content generation
├── components/
│   ├── ui/                        # shadcn/ui components
│   └── ai/
│       └── VoiceDemo.tsx         # Voice demonstration component
├── lib/
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## Development Guidelines

### Code Style
- **Minimal implementations**: Write only necessary code
- **Practical focus**: Prioritize features therapists actually use
- **Brazilian Portuguese**: All therapeutic content in pt-BR
- **Accessibility**: Ensure clinical usability

### Design Principles
- **Professional appearance**: Suitable for clinical environments
- **Immediate value**: Features must solve real daily problems
- **Simple UX**: Therapists need quick, reliable tools
- **Consistent branding**: Purple/pink gradients, clean cards

### API Integration
- **Google TTS**: High-quality voice synthesis for therapy
- **OpenAI**: Content generation and exercise creation
- **Error handling**: Graceful fallbacks for all AI services
- **Performance**: Fast response times for session use

## Business Context

### Problem Solved
- **Voice strain**: Therapists get hoarse from repeating words 50+ times per session
- **Inconsistent modeling**: Tired therapists provide inconsistent pronunciation
- **Home practice**: Parents need correct pronunciation models
- **Time efficiency**: Reduce repetitive tasks during therapy

### Value Proposition
- **Voice preservation**: Save therapist's voice for actual therapy
- **Professional quality**: Consistent, perfect pronunciation models
- **Immediate ROI**: Usable from first session
- **Clinical integration**: Fits existing therapy workflows

### Monetization
- **Freemium model**: Basic features free, premium AI features paid
- **Target pricing**: R$ 79/month for individual therapists
- **Market size**: 15,000+ registered fonoaudiólogos in Brazil

## Therapeutic Content

### Phonemes Covered
- **/r/**: R forte (vibrante múltipla) - rato, carro, para
- **/ɾ/**: R fraco (tepe) - cara, porta, amor  
- **/l/**: L lateral - lua, bola, palato
- **/ʎ/**: LH lateral palatal - palha, filho, trabalho
- **/s/**: S fricativa surda - sapo, casa, pasta
- **/z/**: Z fricativa sonora - zebra, rosa, buzina
- **/ʃ/**: CH fricativa pós-alveolar - chuva, bicho, machado
- **/ʒ/**: J/G fricativa sonora - jato, gelo, girafa
- **/k/**: C/QU oclusiva surda - casa, quero, escola
- **/g/**: G oclusiva sonora - gato, fogo, bigode

### Content Structure
- **Syllables**: Basic building blocks (RA, RE, RI, RO, RU)
- **Simple words**: Single phoneme focus (RATO, CASA, BOLA)
- **Complex words**: Multiple syllables (CARRO, PALATO, CHOCOLATE)
- **Motivational phrases**: Encouragement (MUITO BEM!, PERFEITO!)

## Environment Variables
```
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI Services
OPENAI_API_KEY=
GOOGLE_CLOUD_API_KEY=

# Database (if applicable)
DATABASE_URL=
```

## Deployment
- **Platform**: Vercel
- **Domain**: almanaquedafala.com.br (inferred)
- **Environment**: Production ready with CSP headers
- **Performance**: Optimized for clinical use

## Current Development Focus
1. **Voice quality optimization**: Ensuring natural Brazilian Portuguese pronunciation
2. **Therapy workflow integration**: Making tools fit real session needs  
3. **Performance optimization**: Fast, reliable responses during live therapy
4. **Content expansion**: More phonemes and therapeutic exercises

## Success Metrics
- **Daily usage**: Therapists using voice demo 20+ times per session
- **Voice preservation**: Reduced therapist vocal fatigue
- **Patient outcomes**: Improved pronunciation consistency
- **User retention**: Therapists can't work without it

---

*This context file helps Q understand the Almanaque da Fala project structure, goals, and development priorities for more effective assistance.*
