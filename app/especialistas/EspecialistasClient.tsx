'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Award,
  Clock,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { useState } from 'react';

export default function EspecialistasClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [favoriteSpecialists, setFavoriteSpecialists] = useState<Set<number>>(
    new Set()
  );

  const handleFavorite = (specialistId: number) => {
    setFavoriteSpecialists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(specialistId)) {
        newSet.delete(specialistId);
      } else {
        newSet.add(specialistId);
      }
      return newSet;
    });
  };

  const especialistas = [
    {
      id: 1,
      nome: 'Dra. Eliane Mota',
      especialidade: 'Linguagem Infantil',
      experiencia: '18 anos',
      avaliacao: 4.9,
      consultas: 1850,
      localizacao: 'São Paulo, SP',
      online: true,
      preco: 'R$ 180/hora',
      formacao: 'Doutorado em Fonoaudiologia - USP',
      crfa: 'CRFa 2-12345',
      descricao:
        'Especialista em desenvolvimento de linguagem em crianças de 0-6 anos. Experiência em TEA, atraso de linguagem e distúrbios de aprendizagem. Atua há mais de 18 anos na área.',
      especialidades: [
        'Linguagem Infantil',
        'TEA',
        'Atraso de Linguagem',
        'Fonologia',
        'Distúrbios de Aprendizagem',
      ],
      disponibilidade: 'Segunda a Sexta, 8h às 18h',
    },
    {
      id: 2,
      nome: 'Dr. Celso Pereira',
      especialidade: 'Motricidade Orofacial',
      experiencia: '22 anos',
      avaliacao: 4.8,
      consultas: 2100,
      localizacao: 'Rio de Janeiro, RJ',
      online: true,
      preco: 'R$ 200/hora',
      formacao: 'Doutorado em Motricidade Orofacial - UFRJ',
      crfa: 'CRFa 2-23456',
      descricao:
        'Especialista em motricidade orofacial e disfagia. Atua com pacientes adultos e idosos. Experiência em reabilitação de funções orofaciais e estética facial.',
      especialidades: [
        'Motricidade Orofacial',
        'Disfagia',
        'Ortodontia',
        'Fonoaudiologia Estética',
        'Reabilitação Orofacial',
      ],
      disponibilidade: 'Segunda a Quinta, 9h às 17h',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-white" />
          </div>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Especialistas em Fonoaudiologia
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Conecte-se com fonoaudiólogos especialistas e receba orientação
          profissional personalizada
        </p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar especialistas por nome, especialidade ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
      >
        {[
          { icon: Users, color: 'blue', value: '2', label: 'Especialistas' },
          {
            icon: MessageCircle,
            color: 'green',
            value: '3,950+',
            label: 'Consultas Realizadas',
          },
          {
            icon: Star,
            color: 'purple',
            value: '4.85',
            label: 'Avaliação Média',
          },
          {
            icon: Award,
            color: 'orange',
            value: '10+',
            label: 'Especialidades',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
          >
            <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div
                  className={`w-16 h-16 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900 flex items-center justify-center mx-auto mb-4`}
                >
                  <stat.icon
                    className={`h-8 w-8 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mb-8"
      >
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Especialidade:
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                >
                  <option value="all">Todas</option>
                  <option value="linguagem">Linguagem Infantil</option>
                  <option value="motricidade">Motricidade Orofacial</option>
                  <option value="audiologia">Audiologia</option>
                  <option value="hospitalar">Fonoaudiologia Hospitalar</option>
                  <option value="educacional">
                    Fonoaudiologia Educacional
                  </option>
                  <option value="trabalho">Fonoaudiologia do Trabalho</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Disponibilidade:
                </label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                >
                  <option value="all">Todas</option>
                  <option value="online">Apenas Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('all');
                  setSelectedAvailability('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Specialists Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
      >
        {especialistas.map((especialista, index) => (
          <motion.div
            key={especialista.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
          >
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`/api/placeholder/64/64`} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 text-lg">
                        {especialista.nome
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {especialista.nome}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {especialista.especialidade}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {especialista.avaliacao}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({especialista.consultas} consultas)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`mb-2 ${especialista.online ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                    >
                      {especialista.online ? 'Online' : 'Presencial'}
                    </Badge>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {especialista.preco}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <GraduationCap className="h-4 w-4" />
                    <span>{especialista.formacao}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Award className="h-4 w-4" />
                    <span>{especialista.crfa}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>{especialista.localizacao}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>{especialista.disponibilidade}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {especialista.descricao}
                </p>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Especialidades:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {especialista.especialidades.map((especialidade, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {especialidade}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Agendar Consulta
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className={`px-3 transition-colors ${
                        favoriteSpecialists.has(especialista.id)
                          ? 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'hover:border-red-500 hover:text-red-500'
                      }`}
                      onClick={() => handleFavorite(especialista.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${favoriteSpecialists.has(especialista.id) ? 'fill-current' : ''}`}
                      />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="mt-16"
      >
        <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Não encontrou o especialista ideal?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Nossa equipe pode ajudar você a encontrar o fonoaudiólogo perfeito
              para suas necessidades específicas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 transition-colors">
                  <Phone className="h-5 w-5 mr-2" />
                  Falar com Consultor
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Enviar E-mail
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
