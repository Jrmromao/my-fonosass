import { BookOpen, Brain, Sparkles } from 'lucide-react'

export const navigationItems = ["Recursos", "Sobre", "Preços"]

export const features = [
  {
    title: "Exercícios Personalizados",
    description: "Ampla variedade de exercícios adaptados para abordar questões específicas de desenvolvimento da linguagem.",
    icon: BookOpen
  },
  {
    title: "Análise de Progresso",
    description: "Acompanhamento detalhado do desenvolvimento do paciente com métricas e visualizações intuitivas.",
    icon: Brain
  },
  {
    title: "Tecnologia Adaptativa",
    description: "Exercícios que se ajustam automaticamente ao nível e progresso do paciente para um aprendizado otimizado.",
    icon: Sparkles
  }
]

export const aboutItems = [
  "Criado por especialistas em fonoaudiologia",
  "Suporte técnico dedicado ao setor de saúde",
  "Atualizações frequentes baseadas no feedback dos usuários",
  "Conformidade total com LGPD e padrões internacionais"
]

export const plans = [
  {
    name: "Básico",
    price: "R$ 97",
    features: [
      "Até 50 pacientes",
      "Agendamento básico",
      "Prontuário digital",
      "Suporte por email"
    ]
  },
  {
    name: "Profissional",
    price: "R$ 197",
    features: [
      "Pacientes ilimitados",
      "Agendamento avançado",
      "Prontuário digital",
      "Relatórios e análises",
      "Suporte prioritário"
    ]
  },
  {
    name: "Clínica",
    price: "R$ 497",
    features: [
      "Múltiplos profissionais",
      "Gestão completa",
      "Telemedicina integrada",
      "Personalização avançada",
      "Suporte VIP"
    ]
  }
]

export const footerLinks = [
  { title: "Produto", items: ["Recursos", "Preços", "Integrações"] },
  { title: "Empresa", items: ["Sobre", "Blog", "Carreiras"] },
  { title: "Suporte", items: ["Ajuda", "Tutoriais", "Contato"] },
  { title: "Legal", items: ["Privacidade", "Termos", "Cookies"] }
]