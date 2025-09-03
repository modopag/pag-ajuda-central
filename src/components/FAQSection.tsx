import {
  Accordion,
  AccordionContent,
  AccordionItem,  
  AccordionTrigger,
} from "./ui/accordion";
import { generateFAQJsonLd } from "@/utils/jsonLd";
import { useResilientFAQs } from "@/hooks/useResilientFAQs";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { AlertCircle, Wifi } from "lucide-react";
const FAQSection = () => {
  const { faqs, loading, error, retry, isStale, isOffline } = useResilientFAQs();

  // Show skeleton only on initial load
  if (loading && !faqs.length) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre respostas para as dúvidas mais comuns sobre o modoPAG
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border border-border rounded-lg bg-card p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show error fallback only if no data available
  if (error && !faqs.length) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
              <div>
                <p className="text-muted-foreground mb-4">
                  Não foi possível carregar as perguntas frequentes.
                </p>
                <Button onClick={retry} variant="outline" size="sm">
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const faqJsonLd = generateFAQJsonLd(faqs);

  return (
    <section className="py-16 px-4 bg-background">
      {/* JSON-LD for FAQ */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o modoPAG
          </p>
        </div>

        {/* Status indicator for stale/offline data - only show meaningful messages */}
        {(isStale || isOffline || (error && !loading)) && (
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground max-w-4xl mx-auto mb-6">
            {isOffline && <Wifi className="w-4 h-4" />}
            {isOffline ? (
              "Perguntas disponíveis offline"
            ) : isStale ? (
              "Conteúdo atualizando em segundo plano"
            ) : error ? (
              <span className="flex items-center gap-2">
                Problema na conexão - conteúdo pode estar desatualizado
                <Button onClick={retry} variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  Atualizar
                </Button>
              </span>
            ) : null}
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Desktop: 2 columns, Mobile: 1 column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Odd FAQs (1, 3, 5, 7, 9, 11, ...) */}
            <div className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs
                  .filter((_, index) => index % 2 === 0)
                  .map((faq, index) => (
                    <AccordionItem 
                      key={faq.id} 
                      value={`item-left-${index}`}
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

            {/* Right Column - Even FAQs (2, 4, 6, 8, 10, 12, ...) */}
            <div className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs
                  .filter((_, index) => index % 2 === 1)
                  .map((faq, index) => (
                    <AccordionItem 
                      key={faq.id} 
                      value={`item-right-${index}`}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;