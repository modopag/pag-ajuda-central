import { useParams, Navigate } from 'react-router-dom';
import { useResilientFAQs } from '@/hooks/useResilientFAQs';
import { FAQ_CATEGORIES } from '@/constants/faqCategories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,  
  AccordionTrigger,
} from "@/components/ui/accordion";
import { generateFAQJsonLd } from "@/utils/jsonLd";

export default function FAQCategory() {
  const { categorySlug } = useParams();
  const { faqs, loading, error, retry } = useResilientFAQs();

  // Find the category
  const category = FAQ_CATEGORIES.find(cat => cat.value === categorySlug);
  
  // If category doesn't exist, redirect to 404
  if (!category) {
    return <Navigate to="/404" replace />;
  }

  // Filter FAQs by category
  const categoryFAQs = faqs.filter(faq => faq.category === categorySlug);

  if (loading && !faqs.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border border-border rounded-lg bg-card p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !faqs.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Erro ao carregar FAQs</h1>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar as perguntas frequentes.
              </p>
              <Button onClick={retry} variant="outline">
                Tentar novamente
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const faqJsonLd = generateFAQJsonLd(categoryFAQs);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHelmet
        title={`FAQs - ${category.label} | modoPAG Central de Ajuda`}
        description={`Perguntas frequentes sobre ${category.label.toLowerCase()}. Encontre respostas rápidas para suas dúvidas sobre ${category.label.toLowerCase()} no modoPAG.`}
        canonicalUrl={`https://ajuda.modopag.com.br/faq/${categorySlug}`}
      />
      
      {/* JSON-LD for FAQ */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <span>•</span>
            <span>FAQs</span>
            <span>•</span>
            <span className="text-foreground font-medium">{category.label}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                to="/"
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                aria-label="Voltar para início"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  FAQs - {category.label}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {categoryFAQs.length === 0 
                    ? `Nenhuma pergunta encontrada para ${category.label.toLowerCase()}.`
                    : `${categoryFAQs.length} pergunta${categoryFAQs.length !== 1 ? 's' : ''} sobre ${category.label.toLowerCase()}.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          {categoryFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Não há perguntas frequentes disponíveis para esta categoria.
              </p>
              <Link to="/">
                <Button variant="outline">
                  Voltar ao início
                </Button>
              </Link>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {categoryFAQs.map((faq, index) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={`item-${index}`}
                    className="border border-border rounded-lg bg-card px-6"
                  >
                    <AccordionTrigger 
                      className="text-left hover:no-underline py-6"
                      aria-expanded="false"
                    >
                      <span className="text-foreground font-semibold">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 pt-0 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}