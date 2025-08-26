import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import ReclameAquiSection from "@/components/ReclameAquiSection";
import FAQSection from "@/components/FAQSection";
import { SEOHelmet } from "@/components/SEO/SEOHelmet";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Navigate to search page with query
    navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <>
      <SEOHelmet
        title="modoPAG - Central de Ajuda"
        description="Central de Ajuda modoPAG - Encontre respostas para suas dúvidas sobre pagamentos digitais, cartões e soluções financeiras."
        ogTitle="Central de Ajuda modoPAG"
        ogDescription="Encontre respostas para suas dúvidas sobre pagamentos digitais, cartões e soluções financeiras."
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Central de Ajuda da <span className="text-accent">modoPAG</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Encontre respostas rápidas para suas dúvidas sobre maquininhas, pagamentos e muito mais.
            </p>
            
            {/* Search Bar */}
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Como podemos ajudar você hoje?"
            />
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Categorias de Ajuda
            </h2>
            
            <CategoryGrid onCategoryClick={handleCategoryClick} />
          </div>
        </section>
        
        {/* Quick Help Section */}
        <section className="py-16 px-4 bg-secondary">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Precisa de ajuda rápida?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nossa equipe de suporte está disponível de segunda a sexta-feira, em horário comercial. Atendemos por WhatsApp e e-mail.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
                <p className="text-muted-foreground text-sm mb-4">Seg-Sex, 8h às 18h</p>
                <Button 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => window.open('https://wa.me/5571981470573?text=Venho%20do%20site%20e%20quero%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20modoPAG.%20%5Bbotao%5D', '_blank')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </div>
              
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-foreground mb-2">E-mail</h3>
                <p className="text-muted-foreground text-sm mb-4">Resposta em até 24h</p>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = 'mailto:contato@modopag.com.br'}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar e-mail
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* Reclame AQUI Section */}
        <ReclameAquiSection />
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
