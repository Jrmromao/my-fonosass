import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { plans } from "@/lib/constants/content"

export default function PricingSection() {
  return (
    <section id="preços" className="py-20 md:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Planos Flexíveis
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                index === 1 ? 'border-indigo-600 shadow-xl scale-105' : 'hover:scale-105'
              }`}
            >
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">
                  {plan.price}<span className="text-base font-normal text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <Check className="size-5 text-indigo-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    index === 1 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50'
                  } transition-all duration-300`}
                >
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}