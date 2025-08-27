import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import ReclameAquiSection from "@/components/ReclameAquiSection";
import FAQSection from "@/components/FAQSection";
import { SkipLink } from "@/components/SkipLink";
import { SEOHelmet } from "@/components/SEO/SEOHelmet";
import { generateWebsiteJsonLd } from '@/utils/jsonLd';
import { useSettings } from '@/hooks/useSettings';
import { Button } from "@/components/ui/button";
import { LazySection } from "@/components/performance/LazySection";
import { CategoryGridSkeleton } from '@/components/skeletons/CategoryGridSkeleton';
import { MessageSquare, Mail } from "lucide-react";
import { ResilientErrorBoundary } from "@/components/ResilientErrorBoundary";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { seo } = useSettings();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/${categorySlug}/`);
  };

  const websiteJsonLd = generateWebsiteJsonLd();

  // Add console marker for debugging router context
  if (import.meta.env.DEV) {
    console.log('[Homepage] Router mounted successfully - crash should be resolved');
  }

  return (
    <>
      <SEOHelmet
        title="Central de Ajuda modoPAG - Soluções de Pagamento"
        description="Encontre respostas rápidas sobre maquininhas, conta digital, pagamentos e muito mais na Central de Ajuda da modoPAG. Tire suas dúvidas aqui!"
        canonicalUrl={seo.site_url}
        jsonLd={websiteJsonLd}
        ogTitle="Central de Ajuda modoPAG - Tire suas dúvidas sobre pagamentos"
        ogDescription="Central de suporte completa da modoPAG. Artigos, tutoriais e guias sobre maquininhas, conta digital e soluções de pagamento."
      />
      <Header />
      <SkipLink />
      <main id="main-content" className="min-h-screen">
        {/* Hero Section - LCP optimized */}
        <section className="hero-section bg-gradient-to-br from-primary/5 via-primary/3 to-background py-16 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="hero-title text-4xl md:text-5xl font-bold text-foreground mb-6">
              Central de Ajuda modoPAG
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Encontre respostas rápidas para suas dúvidas sobre maquininhas, conta digital, pagamentos e muito mais.
            </p>
            
            <SearchBar 
              onSearch={handleSearch}
              placeholder="O que você está procurando?"
            />
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Busque por categoria
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Navegue pelas nossas categorias organizadas para encontrar exatamente o que precisa.
              </p>
            </div>
            
            <ResilientErrorBoundary
              fallback={
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">
                    Não foi possível carregar as categorias no momento.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Show basic fallback categories */}
                    <div className="category-card">
                      <div className="category-icon">📋</div>
                      <h3 className="category-title">Dúvidas Gerais</h3>
                      <p className="text-muted-foreground">Informações básicas sobre nossos serviços</p>
                    </div>
                    <div className="category-card">
                      <div className="category-icon">💳</div>
                      <h3 className="category-title">Maquininhas</h3>
                      <p className="text-muted-foreground">Tudo sobre nossas soluções de pagamento</p>
                    </div>
                    <div className="category-card">
                      <div className="category-icon">💬</div>
                      <h3 className="category-title">Suporte</h3>
                      <p className="text-muted-foreground">Entre em contato conosco</p>
                    </div>
                  </div>
                </div>
              }
            >
              <LazySection
                fallback={<CategoryGridSkeleton />}
                rootMargin="50px"
              >
                <CategoryGrid onCategoryClick={handleCategoryClick} />
              </LazySection>
            </ResilientErrorBoundary>
          </div>
        </section>

        {/* Quick Help Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Precisa de ajuda rápida?
              </h2>
              <p className="text-lg text-muted-foreground">
                Entre em contato conosco pelos canais oficiais
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center p-8 bg-background rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">WhatsApp</h3>
                <p className="text-muted-foreground mb-4">
                  Fale conosco pelo WhatsApp para atendimento rápido e personalizado
                </p>
                <Button
                  onClick={() => window.open('https://wa.me/5571981470573?text=Venho%20do%20site%20e%20quero%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20modoPAG.%20%5Bbotao%5D', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Conversar no WhatsApp
                </Button>
              </div>
              
              <div className="text-center p-8 bg-background rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">E-mail</h3>
                <p className="text-muted-foreground mb-4">
                  Envie sua dúvida por e-mail e receba uma resposta detalhada
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:suporte@modopag.com.br'}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar E-mail
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <ResilientErrorBoundary
          fallback={
            <section className="py-16 px-4">
              <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Perguntas Frequentes
                </h2>
                <p className="text-muted-foreground mb-8">
                  Não foi possível carregar as perguntas no momento, mas você pode entrar em contato conosco.
                </p>
                <Button 
                  onClick={() => window.open('https://wa.me/5571981470573', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </div>
            </section>
          }
        >
          <LazySection 
            fallback={
              <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                  <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-muted rounded w-64 mx-auto"></div>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            }
          >
            <FAQSection />
          </LazySection>
        </ResilientErrorBoundary>

        {/* Reclame Aqui Section */}
        <LazySection 
          fallback={
            <section className="py-16 px-4 bg-muted/30">
              <div className="container mx-auto max-w-4xl">
                <div className="animate-pulse space-y-6">
                  <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </div>
            </section>
          }
        >
          <ReclameAquiSection />
        </LazySection>
      </main>
      <Footer />
    </>
  );
};

export default Index;
