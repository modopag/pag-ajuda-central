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

        {/* Status indicator for stale/offline data */}
        {(isStale || isOffline || error) && (
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground max-w-4xl mx-auto mb-6">
            {isOffline && <Wifi className="w-4 h-4" />}
            {isOffline ? (
              "Mostrando dados salvos (offline)"
            ) : isStale ? (
              "Dados podem estar desatualizados"
            ) : error ? (
              <span className="flex items-center gap-2">
                Erro ao atualizar dados
                <Button onClick={retry} variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  Tentar novamente
                </Button>
              </span>
            ) : null}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
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
      </div>
    </section>
  );
};

export default FAQSection;