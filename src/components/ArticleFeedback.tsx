import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

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
    <div className="border-t border-border pt-6 mt-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Este artigo foi útil?
        </h3>
        
        {feedback === null && (
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => handleFeedback('helpful')}
              className="flex items-center space-x-2"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Sim, foi útil</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFeedback('not-helpful')}
              className="flex items-center space-x-2"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Não foi útil</span>
            </Button>
          </div>
        )}
        
          {feedback === 'helpful' && (
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <ThumbsUp className="w-8 h-8 text-accent mx-auto mb-2" aria-hidden="true" />
              <p className="text-foreground font-medium">Obrigado pelo seu feedback!</p>
              <p className="text-muted-foreground text-sm">Ficamos felizes em ajudar você.</p>
            </div>
          )}
          
          {feedback === 'not-helpful' && showContactForm && (
            <div className="text-center p-6 bg-secondary rounded-lg">
              <MessageSquare className="w-8 h-8 text-accent mx-auto mb-4" aria-hidden="true" />
            <h4 className="font-semibold text-foreground mb-2">
              Que pena que não conseguimos ajudar!
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              Nossa equipe está pronta para esclarecer suas dúvidas pessoalmente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  import('@/utils/analytics').then(({ trackWhatsAppCTA }) => {
                    trackWhatsAppCTA('article_feedback', articleId);
                  });
                  window.open('https://wa.me/5571981470573?text=Preciso%20de%20ajuda%20com%20um%20artigo%20da%20Central%20de%20Ajuda', '_blank');
                }}
                aria-label="Abrir WhatsApp para ajuda"
              >
                <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" />
                Falar no WhatsApp
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = 'mailto:contato@modopag.com.br?subject=Dúvida sobre artigo da Central de Ajuda'}
              >
                Enviar e-mail
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleFeedback;