'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

interface ExercisePreviewDialogProps {
  exercise: {
    id: string
    name: string
    description: string
    type: string
    difficulty: string
    phoneme: string
    ageRange: string
  }
}

export function ExercisePreviewDialog({ exercise }: ExercisePreviewDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{exercise.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{exercise.difficulty}</Badge>
            <Badge variant="outline">{exercise.type}</Badge>
            {exercise.phoneme && (
              <Badge variant="outline">/{exercise.phoneme}/</Badge>
            )}
            <Badge variant="outline">{exercise.ageRange}</Badge>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Descrição:</h3>
            <p className="text-muted-foreground">{exercise.description}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Preview do Exercício</h3>
            <p className="text-sm text-muted-foreground">
              Este é um exercício de fonoaudiologia focado no fonema /{exercise.phoneme}/ 
              para {exercise.ageRange.toLowerCase()}. O exercício inclui atividades práticas 
              e material de apoio para desenvolvimento da fala.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              Preview limitado: Para acessar o exercício completo e fazer download, 
              é necessário ter uma assinatura ativa.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
