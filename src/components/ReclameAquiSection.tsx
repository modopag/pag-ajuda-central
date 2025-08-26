import { Award, Shield, Users, Star } from "lucide-react";

const ReclameAquiSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Uma empresa com <span className="text-accent">integridade comprovada!</span>
        </h2>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
          Reconhecimento que comprova nossa excelência e compromisso com nossos clientes
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Top 100 Brasil</h3>
            <p className="text-sm text-muted-foreground">
              Prêmio do Reclame AQUI 2025
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Selo RA1000</h3>
            <p className="text-sm text-muted-foreground">
              Atendimento reconhecido no Reclame AQUI
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-foreground mb-2">+ de 30 milhões</h3>
            <p className="text-sm text-muted-foreground">
              de operações desde 2024
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Nota 8.1 / 10</h3>
            <p className="text-sm text-muted-foreground">
              atribuída pelos nossos clientes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReclameAquiSection;