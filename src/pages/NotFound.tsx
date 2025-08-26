import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import { SEOHelmet } from "@/components/SEO/SEOHelmet";
import { Button } from "@/components/ui/button";
import { MessageSquare, Home, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackWhatsAppCTA } from "@/utils/analytics";
import { monitoring } from "@/utils/monitoring";

const NotFound = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/${categorySlug}/`);
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppCTA('404_page', window.location.pathname);
    window.open('https://wa.me/5571981470573?text=Olá!%20Estava%20procurando%20por%20uma%20página%20que%20não%20foi%20encontrada%20e%20preciso%20de%20ajuda.', '_blank', 'noopener');
  };

  // Track 404 event
  monitoring.track404Error(window.location.pathname, document.referrer);

  return (
    <>
      <SEOHelmet
        title="Página não encontrada | modoPAG - Central de Ajuda"
        description="A página que você procura não foi encontrada. Use nossa busca ou navegue pelas categorias para encontrar o que precisa."
        noindex={true}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* 404 Hero */}
          <div className="text-center mb-12">
            <div className="text-8xl font-bold text-accent mb-4">404</div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Página não encontrada
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              A página que você está procurando não existe ou foi movida. 
              Que tal usar nossa busca ou navegar pelas categorias de ajuda?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
              
              <Link to="/buscar">
                <Button variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Ir para Busca
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Section */}
          <section className="mb-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-foreground mb-6">
                Procure pelo que você precisa
              </h2>
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Digite sua dúvida..."
              />
            </div>
          </section>

          {/* Categories Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center text-foreground mb-8">
              Ou navegue pelas categorias
            </h2>
            <CategoryGrid onCategoryClick={handleCategoryClick} />
          </section>

          {/* Contact Support */}
          <section className="bg-secondary py-12 px-4 rounded-xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ainda não encontrou?
              </h2>
              <p className="text-muted-foreground mb-6">
                Nossa equipe de suporte está pronta para ajudar você. 
                Entre em contato pelo WhatsApp e resolva sua dúvida rapidamente.
              </p>
              
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Falar com Suporte no WhatsApp
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Atendimento: Segunda a Sexta, das 8h às 18h
              </p>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NotFound;