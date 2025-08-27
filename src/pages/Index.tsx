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
import { useCachedSettings } from '@/hooks/useCachedSettings';
import { useSSRSafeQuery } from '@/hooks/useSSRSafeData';
import { getDataAdapter } from '@/lib/data-adapter';
import { Button } from "@/components/ui/button";
import { LazySection } from "@/components/performance/LazySection";
import { CategoryGridSkeleton } from '@/components/skeletons/CategoryGridSkeleton';
import { ProgressiveSkeleton } from '@/components/ui/progressive-skeleton';
import { ProgressiveSection } from '@/components/SmartLoadingStates';
import { MessageSquare, Mail } from "lucide-react";
import { ResilientErrorBoundary } from "@/components/ResilientErrorBoundary";

interface IndexProps {
  ssrData?: {
    categories: any[];
    faqs: any[];
  };
}

const Index = ({ ssrData }: IndexProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { seo } = useCachedSettings();

  // SSR-safe data fetching for categories and FAQs
  const { data: categories, isLoading: categoriesLoading } = useSSRSafeQuery(
    ['categories'],
    async () => {
      const adapter = await getDataAdapter();
      return adapter.getCategories();
    },
    ssrData?.categories
  );

  const { data: faqs, isLoading: faqsLoading } = useSSRSafeQuery(
    ['faqs'],
    async () => {
      const adapter = await getDataAdapter();
      return adapter.getFAQs();
    },
    ssrData?.faqs
  );

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
        canonicalUrl={seo.site_url || "https://ajuda.modopag.com.br/"}
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
                  <ProgressiveSkeleton variant="category" count={6} />
                </div>
              }
            >
              <ProgressiveSection
                isLoading={false} // Categories load progressively, no initial loading
                skeletonVariant="category"
                skeletonCount={6}
              >
                <CategoryGrid onCategoryClick={handleCategoryClick} />
              </ProgressiveSection>
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

        {/* FAQ Section with Progressive Loading */}
        <ResilientErrorBoundary
          fallback={
            <section className="py-16 px-4">
              <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Perguntas Frequentes
                </h2>
                <ProgressiveSkeleton variant="faq" count={5} />
              </div>
            </section>
          }
        >
          <ProgressiveSection
            isLoading={false} // FAQ loads progressively
            skeletonVariant="faq"
            skeletonCount={5}
          >
            <FAQSection />
          </ProgressiveSection>
        </ResilientErrorBoundary>

        {/* Reclame Aqui Section with Progressive Loading */}
        <LazySection 
          fallback={
            <section className="py-16 px-4 bg-muted/30">
              <div className="container mx-auto max-w-4xl">
                <ProgressiveSkeleton variant="card" count={2} />
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
