import React from 'react';
import {Bird, Cat, Dog, Fish, LucideIcon, Rabbit, Rat} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

// Types
interface ClockSection {
    num: number;
    text: string;
    color: string;
    textColor: string;
    animal: string;
    icon?: string;
    IconComponent?: LucideIcon;
    funWord: string;
    practiceWord: string;
    funFact: string;
    soundTip: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    syllables?: string[];
}

const clockData: ClockSection[] = [
    {
        num: 12,
        text: 'Doze',
        color: '#FFD700',
        textColor: '#000000',
        animal: 'Leão',
        icon: '🦁',
        funWord: 'RUGIDO!',
        practiceWord: 'RRR... RUGIDO!',
        funFact: 'Eu sou o rei da selva!',
        soundTip: 'Faça o som de um leão forte: RRR...'
    },
    {
        num: 1,
        text: 'Um',
        color: '#FFA500',
        textColor: '#000000',
        animal: 'Cachorro',
        IconComponent: Dog,
        funWord: 'AU AU!',
        practiceWord: 'A-AU AU!',
        funFact: 'Eu amo brincar com bola!',
        soundTip: 'Abra bem a boca: AU AU!'
    },
    {
        num: 2,
        text: 'Dois',
        color: '#FF4500',
        textColor: '#FFFFFF',
        animal: 'Gato',
        IconComponent: Cat,
        funWord: 'MIAU!',
        practiceWord: 'MI-AU!',
        funFact: 'Eu adoro tomar leite!',
        soundTip: 'Diga suavemente: MI-AU'
    },
    {
        num: 3,
        text: 'Três',
        color: '#FF0000',
        textColor: '#FFFFFF',
        animal: 'Elefante',
        icon: '🐘',
        funWord: 'FUUUU!',
        practiceWord: 'FUUUU!',
        funFact: 'Minha tromba é muito grande!',
        soundTip: 'Sopre forte com a boca: FUUUU!'
    },
    {
        num: 4,
        text: 'Quatro',
        color: '#8B0000',
        textColor: '#FFFFFF',
        animal: 'Passarinho',
        IconComponent: Bird,
        funWord: 'PIU PIU!',
        practiceWord: 'PI-U PI-U!',
        funFact: 'Eu voo pelo céu azul!',
        soundTip: 'Som suave e agudo: PIU PIU!'
    },
    {
        num: 5,
        text: 'Cinco',
        color: '#228B22',
        textColor: '#FFFFFF',
        animal: 'Peixinho',
        IconComponent: Fish,
        funWord: 'BLUB BLUB!',
        practiceWord: 'B-LUB B-LUB!',
        funFact: 'Eu nado na água fresquinha!',
        soundTip: 'Faça bolhas com a boca: BLUB BLUB!'
    },
    {
        num: 6,
        text: 'Seis',
        color: '#006400',
        textColor: '#FFFFFF',
        animal: 'Coelhinho',
        IconComponent: Rabbit,
        funWord: 'PUL PUL!',
        practiceWord: 'PU-LA PU-LA!',
        funFact: 'Eu adoro cenouras!',
        soundTip: 'Som saltitante: PUL PUL!'
    },
    {
        num: 7,
        text: 'Sete',
        color: '#0000CD',
        textColor: '#FFFFFF',
        animal: 'Ratinho',
        IconComponent: Rat,
        funWord: 'QUIQUI!',
        practiceWord: 'QUI-QUI!',
        funFact: 'Eu amo queijo!',
        soundTip: 'Som fininho: QUIQUI!'
    },
    {
        num: 8,
        text: 'Oito',
        color: '#000080',
        textColor: '#FFFFFF',
        animal: 'Pinguim',
        icon: '🐧',
        funWord: 'UA UA!',
        practiceWord: 'U-A U-A!',
        funFact: 'Eu nado no gelo!',
        soundTip: 'Som engraçado: UA UA!'
    },
    {
        num: 9,
        text: 'Nove',
        color: '#483D8B',
        textColor: '#FFFFFF',
        animal: 'Tartaruga',
        icon: '🐢',
        funWord: 'AH... AH...',
        practiceWord: 'A...A...',
        funFact: 'Devagar se vai longe!',
        soundTip: 'Som bem lento: AH... AH...'
    },
    {
        num: 10,
        text: 'Dez',
        color: '#4B0082',
        textColor: '#FFFFFF',
        animal: 'Tigre',
        icon: '🐯',
        funWord: 'ARRRR!',
        practiceWord: 'A-RRR!',
        funFact: 'Eu tenho listras bonitas!',
        soundTip: 'Som forte: ARRRR!'
    },
    {
        num: 11,
        text: 'Onze',
        color: '#FF1493',
        textColor: '#FFFFFF',
        animal: 'Macaco',
        icon: '🐵',
        funWord: 'U-U AH-AH!',
        practiceWord: 'U-U A-A!',
        funFact: 'Eu pulo nas árvores!',
        soundTip: 'Som divertido: U-U AH-AH!'
    }
];

interface Position {
    x: number;
    y: number;
}

interface ClockSectionProps {
    data: ClockSection;
    isSelected: boolean;
    onClick: (data: ClockSection) => void;
    position: Position;
}

interface PracticeCardProps {
    section: ClockSection;
}

// Components
const ClockSectionComponent: React.FC<ClockSectionProps> = ({
                                                                data,
                                                                isSelected,
                                                                onClick,
                                                                position
                                                            }) => {
    const iconSize = data.num <= 2 || data.num === 12 ? 40 : 30;

    return (
        <g onClick={() => onClick(data)}>
            <path
                d={createSectionPath(position.x, position.y, data.num)}
                fill={data.color}
                className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                style={{
                    filter: isSelected ? 'brightness(1.1)' : undefined,
                    transform: isSelected ? 'scale(1.02)' : undefined,
                    transformOrigin: 'center',
                }}
            />
            {data.IconComponent ? (
                <foreignObject
                    x={position.x - iconSize/2}
                    y={position.y - iconSize/2}
                    width={iconSize}
                    height={iconSize}
                    className="pointer-events-none"
                >
                    <div className="w-full h-full flex items-center justify-center">
                        <data.IconComponent
                            size={iconSize * 0.8}
                            color={isSelected ? '#FFFFFF' : data.textColor}
                        />
                    </div>
                </foreignObject>
            ) : (
                <text
                    x={position.x}
                    y={position.y}
                    fontSize={iconSize}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none pointer-events-none"
                >
                    {data.icon}
                </text>
            )}
            <text
                x={position.x}
                y={position.y + 35}
                fill={data.textColor}
                fontSize="24"
                fontWeight="bold"
                textAnchor="middle"
                className="select-none"
            >
                {data.num}
            </text>
        </g>
    );
};

const PracticeCard: React.FC<PracticeCardProps> = ({ section }) => {
    return (
        <Card className="p-4">
            <h4 className="font-bold mb-2">Vamos Praticar:</h4>
            <div className="flex gap-2 mb-2">
                {section.syllables?.map((syllable, i) => (
                    <Badge key={i} variant="secondary" className="text-lg">
                        {syllable}
                    </Badge>
                ))}
            </div>
            <p className="text-lg mb-2">{section.practiceWord}</p>
            <p className="text-sm text-gray-600">{section.soundTip}</p>
        </Card>
    );
};

const AnimalDisplay: React.FC<{ section: ClockSection }> = ({ section }) => {
    return (
        <div className="text-center">
            <div
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: section.color }}
            >
        <span className="text-4xl">
          {section.IconComponent ? (
              <section.IconComponent size={40} color="white" />
          ) : (
              section.icon
          )}
        </span>
            </div>
            <DialogTitle className="text-3xl" style={{ color: section.color }}>
                {section.text} ({section.num})
            </DialogTitle>
            <DialogDescription className="text-xl">
                {section.animal}
            </DialogDescription>
        </div>
    );
};

// Utility functions
const createSectionPath = (x: number, y: number, num: number): string => {
    const index = num === 12 ? 0 : num;
    const angle = (index * 30) - 90;
    const radius = 180;
    const startAngle = angle - 15;
    const endAngle = angle + 15;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 200 + radius * Math.cos(startRad);
    const y1 = 200 + radius * Math.sin(startRad);
    const x2 = 200 + radius * Math.cos(endRad);
    const y2 = 200 + radius * Math.sin(endRad);

    return `M200,200 L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`;
};

const getPosition = (num: number): Position => {
    const index = num === 12 ? 0 : num;
    const angle = (index * 30) - 90;
    const radius = 130;
    return {
        x: 200 + radius * Math.cos(angle * Math.PI / 180),
        y: 200 + radius * Math.sin(angle * Math.PI / 180)
    };
};

// Main component
const InteractiveClock: React.FC = () => {
    const [selectedSection, setSelectedSection] = React.useState<ClockSection | null>(null);
    const [open, setOpen] = React.useState(false);

    return (
        <div className="w-full max-w-4xl mx-auto p-8">
            <div className="relative w-[400px] h-[400px] mx-auto">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                    <circle cx="200" cy="200" r="195" fill="white" className="shadow-lg" />

                    {clockData.map((data) => (
                        <ClockSectionComponent
                            key={data.num}
                            data={data}
                            isSelected={selectedSection?.num === data.num}
                            onClick={(section) => {
                                setSelectedSection(section);
                                setOpen(true);
                            }}
                            position={getPosition(data.num)}
                        />
                    ))}
                </svg>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        {selectedSection && (
                            <>
                                <DialogHeader>
                                    <AnimalDisplay section={selectedSection} />
                                </DialogHeader>

                                <Card className="p-4">
                                    <p className="text-lg mb-2">{selectedSection.funFact}</p>
                                    <p className="text-2xl font-bold text-center" style={{ color: selectedSection.color }}>
                                        {selectedSection.funWord}
                                    </p>
                                </Card>

                                <PracticeCard section={selectedSection} />

                                <Button
                                    className="w-full text-white"
                                    style={{ backgroundColor: selectedSection.color }}
                                    onClick={() => setOpen(false)}
                                >
                                    Continuar Brincando! 🎮
                                </Button>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default InteractiveClock;