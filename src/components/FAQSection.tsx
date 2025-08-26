import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Quais são as taxas da modoPAG?",
      answer: "Nossas taxas são as menores do Brasil, a partir de 1,49% no débito e 2,69% no crédito à vista.",
      category: "Taxas"
    },
    {
      question: "Como funciona o prazo de recebimento?",
      answer: "Você recebe em até 1 dia útil no débito e pode escolher receber em 1 ou 30 dias no crédito.",
      category: "Recebimento"
    },
    {
      question: "Qual maquininha é ideal para meu negócio?",
      answer: "Temos três modelos: modo MINI (portátil), modo PRO (conexão via chip) e modo SMART (completa).",
      category: "Maquininhas"
    },
    {
      question: "Como solicitar minha maquininha?",
      answer: "É simples! Cadastre-se no nosso site, escolha seu plano e receba em casa sem custo de frete.",
      category: "Maquininhas"
    },
    {
      question: "O que é o modoLINK?",
      answer: "É nossa solução para vendas online. Crie links de pagamento e receba via PIX, cartão ou boleto.",
      category: "modoLINK"
    },
    {
      question: "Posso usar a conta digital da modoPAG?",
      answer: "Sim! Nossa conta digital é gratuita e você pode movimentar seu dinheiro sem taxas extras.",
      category: "Conta Digital"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Encontre respostas claras sobre taxas, prazos de recebimento, maquininhas, 
            conta digital e tudo o que você precisa para vender mais com tranquilidade.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left py-6 hover:no-underline">
                  <div className="flex items-start space-x-3 w-full">
                    <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded flex-shrink-0 mt-1">
                      {faq.category}
                    </span>
                    <h3 className="font-semibold text-foreground text-left">
                      {faq.question}
                    </h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="ml-16">
                    <p className="text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
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