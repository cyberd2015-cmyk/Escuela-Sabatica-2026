import { BookOpen, Globe, Heart, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { QRPreview } from '@/components/QRPreview';

const features = [
    {
        icon: BookOpen,
        title: "Lecciones de Vida",
        description: "Gestión del currículo y estudio diario de la palabra.",
    },
    {
        icon: Globe,
        title: "Testificación Global",
        description: "Alcance comunitario y misiones en todo el mundo.",
    },
    {
        icon: Heart,
        title: "Oración y Reflexión",
        description: "Crecimiento espiritual y comunión a través de la oración.",
    },
    {
        icon: Award,
        title: "Metas y Laureles",
        description: "Excelencia histórica y cumplimiento de los objetivos institucionales.",
    },
];

export default function Index() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            <QRPreview />
            {/* Hero Section */}
            <section className="w-full bg-hero-gradient text-white py-20 px-4 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    {/* Subtle logo pattern background could go here */}
                </div>

                <div className="z-10 max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-6">
                        Sello 1853
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Transformación Institucional para la Escuela Sabática 2026.
                        Excelencia, Compromiso y Fidelidad.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-institutional-gold hover:bg-gold-600 text-institutional-blue border-none font-bold rounded-xl"
                            onClick={() => navigate('/login')}
                        >
                            Ingresar al Portal
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white text-white hover:bg-white/10 rounded-xl"
                        >
                            Conocer más
                        </Button>
                    </div>
                </div>
            </section>

            {/* Pillars Section */}
            <section className="max-w-7xl mx-auto px-4 py-20 w-full">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-institutional-blue mb-4">
                        Los 4 Pilares del Logo
                    </h2>
                    <div className="h-1 w-20 bg-institutional-gold mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-institutional-gold rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-institutional-blue/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-8 h-8 text-institutional-blue" />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest text-institutional-blue mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground italic text-sm mb-4">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Footer info */}
            <footer className="w-full border-t py-10 bg-white dark:bg-slate-900 border-institutional-gold/20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">
                        © 2026 Escuela Sabática - Proyecto "Sello 1853"
                    </p>
                </div>
            </footer>
        </div>
    );
}
