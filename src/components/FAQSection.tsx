import { HelpCircle, Search, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <HelpCircle className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded mb-2">
                    {faq.category}
                  </span>
                  <h3 className="font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact Block for when users don't find answers */}
        <div className="bg-secondary p-8 rounded-2xl text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Não encontrou sua resposta?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Nossa equipe está pronta para ajudar você com qualquer dúvida específica sobre nossos produtos e serviços.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => window.open('https://wa.me/5571981470573?text=Venho%20do%20site%20e%20quero%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20modoPAG.%20%5Bbotao%5D', '_blank')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Falar no WhatsApp
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:contato@modopag.com.br'}
            >
              Enviar e-mail
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;