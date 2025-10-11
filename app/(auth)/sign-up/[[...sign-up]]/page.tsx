import CustomSignUpForm from '@/components/auth/CustomSignUpForm';
import { Home, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex relative">
      {/* Home Button - Floating and Playful */}
      <div className="absolute top-6 left-6 z-10">
        <a
          href="/"
          className="group flex items-center space-x-2 px-4 py-2 rounded-full bg-white/90 dark:bg-indigo-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-indigo-200 dark:border-indigo-700"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-indigo-700 dark:text-indigo-200 font-medium text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
            Voltar ao Início
          </span>
        </a>
      </div>
      {/* Left Side - Promotional Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-100 to-fuchsia-100 dark:from-indigo-900 dark:to-fuchsia-900 flex-col items-center justify-center px-12 text-indigo-900 dark:text-white">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="w-32 h-32 rounded-full bg-white/80 dark:bg-indigo-800/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Image
              src="/images/logo.png"
              alt="Almanaque da Fala Logo"
              width={112}
              height={112}
              className="object-contain"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400">
            Almanaque da Fala
          </h1>

          {/* Description */}
          <p className="text-lg text-indigo-700 dark:text-indigo-200 leading-relaxed mb-8">
            Desbloqueie seu potencial com exercícios avançados de
            fonoaudiologia. Confiado por milhares de terapeutas para criar,
            gerenciar e acompanhar o progresso dos pacientes com facilidade.
          </p>

          {/* Fun Navigation for Children */}
          <div className="flex flex-col items-center space-y-4">
            <a
              href="/"
              className="group flex items-center space-x-3 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              <span>Explorar Exercícios Divertidos</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>

            <p className="text-sm text-indigo-600 dark:text-indigo-300 text-center">
              Mais de 100 exercícios interativos para crianças brasileiras
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-full max-w-md px-8 py-12">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <a
              href="/"
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <Image
                src="/images/logo.png"
                alt="Almanaque da Fala Logo"
                width={112}
                height={112}
                className="object-contain"
                priority
              />
            </a>
          </div>

          <CustomSignUpForm />
        </div>
      </div>
    </div>
  );
}
