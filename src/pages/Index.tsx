import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast({
      title: "Pesquisa realizada",
      description: `Você pesquisou por: "${query}"`,
    });
    // Aqui seria implementada a lógica de busca real
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
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
            Nossa equipe de suporte está disponível para ajudar você com qualquer dúvida ou problema.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">Chat Online</h3>
              <p className="text-muted-foreground text-sm mb-4">Disponível 24/7</p>
              <button className="w-full bg-accent text-accent-foreground py-2 px-4 rounded-lg hover:bg-accent/90 transition-colors">
                Iniciar Chat
              </button>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
              <p className="text-muted-foreground text-sm mb-4">Seg-Sex, 8h às 18h</p>
              <button className="w-full bg-accent text-accent-foreground py-2 px-4 rounded-lg hover:bg-accent/90 transition-colors">
                Falar no WhatsApp
              </button>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground text-sm mb-4">Resposta em até 24h</p>
              <button className="w-full bg-accent text-accent-foreground py-2 px-4 rounded-lg hover:bg-accent/90 transition-colors">
                Enviar Email
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
