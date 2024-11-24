import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { features } from "@/lib/constants/content"

export default function FeaturesSection() {
  return (
    <section id="recursos" className="py-20 md:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Recursos Inovadores
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-white to-indigo-50">
                <CardHeader>
                  <div className="mb-2">
                    <Icon className="size-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="mt-12 text-center">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700 text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-indigo-200 transition-all duration-300">
            Explore Nossos Exercícios
          </Button>
        </div>
      </div>
    </section>
  )
}