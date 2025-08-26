import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,  
  AccordionTrigger,
} from "./ui/accordion";
import { generateFAQJsonLd } from "@/utils/jsonLd";

const FAQSection = () => {
  const faqs = [
    {
      question: "Como configurar minha maquininha modoPAG?",
      answer: "Para configurar sua maquininha, ligue o equipamento, conecte ao Wi-Fi seguindo as instruções na tela, e faça login com seus dados modoPAG. O processo é simples e intuitivo.",
      category: "Configuração"
    },
    {
      question: "Quais são as taxas da modoPAG?",
      answer: "A modoPAG oferece as menores taxas do Brasil. Para débito à vista: 1,49% + R$ 0,05. Para crédito à vista: 2,19% + R$ 0,05. Consulte nosso site para mais detalhes.",
      category: "Taxas"
    },
    {
      question: "Como funciona o PIX na maquininha?",
      answer: "O PIX funciona de forma instantânea. Digite o valor, selecione PIX, apresente o QR Code ao cliente. O pagamento é processado imediatamente e você recebe na hora.",
      category: "PIX"
    },
    {
      question: "Quanto tempo demora para receber o dinheiro?",
      answer: "PIX: receba na hora. Débito: D+1 (próximo dia útil). Crédito à vista: D+30. Você pode antecipar seus recebíveis com taxa especial.",
      category: "Recebimentos"
    },
    {
      question: "Como sacar meu dinheiro?",
      answer: "Acesse o app modoPAG ou sua conta no portal, vá em 'Sacar' e escolha sua conta bancária cadastrada. Saques são gratuitos e processados em até 1 dia útil.",
      category: "Saques"
    },
    {
      question: "O que fazer se a maquininha não ligar?",
      answer: "Verifique se está carregada (conecte ao carregador por alguns minutos). Se persistir o problema, pressione o botão liga/desliga por 10 segundos para reiniciar.",
      category: "Suporte Técnico"
    }
  ];
  
  // Generate JSON-LD for FAQ
  const faqJsonLd = generateFAQJsonLd(faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer
  })));

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
            Respostas rápidas para as dúvidas mais comuns dos nossos clientes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg bg-card px-6"
              >
                <AccordionTrigger 
                  className="text-left hover:no-underline py-6"
                  aria-expanded="false"
                >
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded-full mr-3">
                        {faq.category}
                      </span>
                      <span className="text-foreground font-semibold">
                        {faq.question}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pt-0">
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