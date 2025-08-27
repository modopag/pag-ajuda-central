import {
  Accordion,
  AccordionContent,
  AccordionItem,  
  AccordionTrigger,
} from "./ui/accordion";
import { generateFAQJsonLd } from "@/utils/jsonLd";
import { useFAQs } from "@/hooks/useFAQs";
import { Skeleton } from "./ui/skeleton";
const FAQSection = () => {
  const { faqs, loading, error } = useFAQs();

  if (loading) {
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

  if (error) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground">
              Erro ao carregar as perguntas frequentes. Tente novamente mais tarde.
            </p>
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