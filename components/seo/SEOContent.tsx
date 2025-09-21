export default function SEOContent() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Primary keyword section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-indigo-900 mb-6">
            Software Completo para Fonoaudiólogos Brasileiros
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            O <strong>FonoSaaS</strong> é o <strong>software para fonoaudiólogo</strong> mais completo do Brasil. 
            Nossa plataforma oferece <strong>sistema de fonoaudiologia</strong> integrado com gestão de pacientes, 
            <strong>prontuário eletrônico fonoaudiologia</strong> e exercícios terapêuticos especializados.
          </p>
        </div>

        {/* Features with keywords */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">
              Gestão Clínica Fonoaudiológica
            </h3>
            <p className="text-gray-600">
              Sistema completo de <strong>gestão clínica fono</strong> com agendamentos, 
              prontuários digitais e controle financeiro em conformidade com LGPD.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">
              Exercícios Fonoaudiológicos Online
            </h3>
            <p className="text-gray-600">
              Biblioteca com centenas de <strong>exercícios fonoaudiológicos online</strong> 
              organizados por fonemas e dificuldades específicas.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">
              Prontuário Digital Seguro
            </h3>
            <p className="text-gray-600">
              <strong>Prontuário eletrônico fonoaudiologia</strong> com backup automático, 
              criptografia e total conformidade com regulamentações do CFFa.
            </p>
          </div>
        </div>

        {/* Local SEO */}
        <div className="bg-gradient-to-r from-indigo-50 to-pink-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-indigo-900 mb-4 text-center">
            Desenvolvido Especialmente para o Mercado Brasileiro
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-indigo-800 mb-2">Conformidade Legal</h4>
              <ul className="text-gray-700 space-y-1">
                <li>✓ Conformidade total com LGPD</li>
                <li>✓ Adequado às normas do CFFa</li>
                <li>✓ Suporte em português brasileiro</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-800 mb-2">Recursos Localizados</h4>
              <ul className="text-gray-700 space-y-1">
                <li>✓ Exercícios adaptados ao português</li>
                <li>✓ Integração com sistemas brasileiros</li>
                <li>✓ Suporte técnico nacional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
