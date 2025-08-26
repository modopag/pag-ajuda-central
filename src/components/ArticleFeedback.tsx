import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";
import { monitoring } from '@/utils/monitoring';

interface ArticleFeedbackProps {
  articleId: string;
}

const ArticleFeedback = ({ articleId }: ArticleFeedbackProps) => {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    
    // Track feedback event
    import('@/utils/analytics').then(({ trackFAQFeedback }) => {
      trackFAQFeedback(articleId, type === 'helpful');
    });
    
    // Track for monitoring (especially low feedback)
    monitoring.trackLowFeedback(articleId, type === 'helpful' ? 'helpful' : 'not_helpful');
    
    if (type === 'helpful') {
      toast({
        title: "Obrigado pelo feedback!",
        description: "Ficamos felizes que conseguimos ajudar você.",
      });
    } else {
      setShowContactForm(true);
    }
  };

  return (
    <section className="bg-gradient-to-r from-primary/5 via-background to-accent/5 rounded-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Este artigo foi útil?
        </h2>
        <p className="text-muted-foreground">
          Seu feedback nos ajuda a melhorar o conteúdo para todos
        </p>
      </div>
      
      {feedback === null && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => handleFeedback('helpful')}
          >
            <ThumbsUp className="w-5 h-5 mr-2" />
            Sim, foi útil
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => handleFeedback('not-helpful')}
          >
            <ThumbsDown className="w-5 h-5 mr-2" />
            Não foi útil
          </Button>
        </div>
      )}
      
      {feedback === 'helpful' && (
        <div className="text-center p-6 bg-gradient-to-br from-accent/10 to-primary/5 rounded-xl border border-accent/20">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Obrigado pelo seu feedback!</h3>
          <p className="text-muted-foreground">Ficamos felizes em ajudar você.</p>
        </div>
      )}
      
      {feedback === 'not-helpful' && showContactForm && (
        <div className="text-center p-6 bg-gradient-to-br from-secondary/80 to-secondary/60 rounded-xl border border-border">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Que pena que não conseguimos ajudar!
          </h3>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está pronta para esclarecer suas dúvidas pessoalmente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              size="lg"
              className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                import('@/utils/analytics').then(({ trackWhatsAppCTA }) => {
                  trackWhatsAppCTA('article_feedback', articleId);
                });
                window.open('https://wa.me/5571981470573?text=Preciso%20de%20ajuda%20com%20um%20artigo%20da%20Central%20de%20Ajuda', '_blank');
              }}
              aria-label="Abrir WhatsApp para ajuda"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            <Button 
              size="lg"
              variant="secondary"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = 'mailto:contato@modopag.com.br?subject=Dúvida sobre artigo da Central de Ajuda'}
            >
              Enviar e-mail
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ArticleFeedback;