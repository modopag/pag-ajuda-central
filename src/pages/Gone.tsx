import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { SEOHelmet } from "@/components/SEO/SEOHelmet";
import { Button } from "@/components/ui/button";
import { MessageSquare, Home, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackWhatsAppCTA } from "@/utils/analytics";

const Gone = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppCTA('410_page', window.location.pathname);
    window.open('https://wa.me/5571981470573?text=Olá!%20Estava%20procurando%20por%20um%20conteúdo%20que%20foi%20removido%20e%20preciso%20de%20ajuda.', '_blank');
  };

  return (
    <>
      <SEOHelmet
        title="Conteúdo removido | modoPAG - Central de Ajuda"
        description="Este conteúdo foi removido permanentemente. Use nossa busca para encontrar informações atualizadas ou entre em contato conosco."
        noindex={true}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* 410 Hero */}
          <div className="text-center mb-12">
            <Archive className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Conteúdo removido
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              O conteúdo que você está procurando foi removido permanentemente, 
              pois pode estar desatualizado ou ter sido substituído por informações mais recentes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
              
              <Button 
                onClick={handleWhatsAppClick}
                variant="outline"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Falar com Suporte
              </Button>
            </div>
          </div>

          {/* Search Section */}
          <section className="mb-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-foreground mb-6">
                Procure por informações atualizadas
              </h2>
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Digite sua dúvida..."
              />
            </div>
          </section>

          {/* Info Section */}
          <section className="bg-secondary py-12 px-4 rounded-xl max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Por que este conteúdo foi removido?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-accent font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Informação desatualizada</h3>
                  <p className="text-sm text-muted-foreground">
                    O conteúdo continha informações que não são mais válidas
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-accent font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Conteúdo substituído</h3>
                  <p className="text-sm text-muted-foreground">
                    Foi criado um novo artigo com informações mais completas
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-accent font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Reorganização</h3>
                  <p className="text-sm text-muted-foreground">
                    O conteúdo foi movido ou integrado a outra seção
                  </p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Nossa Central de Ajuda está sempre sendo atualizada para oferecer as informações mais precisas e úteis.
              </p>
              
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Entre em contato se não encontrar o que precisa
              </Button>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Gone;