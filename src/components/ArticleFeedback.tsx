import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "@/hooks/use-toast";
import { monitoring } from '@/utils/monitoring';

interface ArticleFeedbackProps {
  articleId: string;
}

const ArticleFeedback = ({ articleId }: ArticleFeedbackProps) => {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    
    // Track feedback event
    import('@/utils/analytics').then(({ trackFAQFeedback }) => {
      trackFAQFeedback(articleId, type === 'helpful');
    });
    
    // Track for monitoring (especially low feedback)
    monitoring.trackLowFeedback(articleId, type === 'helpful' ? 'helpful' : 'not_helpful');
    
    if (type === 'helpful') {
      // Save helpful feedback to storage
      saveFeedback(type);
      toast({
        title: "Obrigado pelo feedback!",
        description: "Ficamos felizes que conseguimos ajudar você.",
      });
    } else {
      setShowContactForm(true);
    }
  };

  const saveFeedback = async (rating: 'helpful' | 'not_helpful', comment?: string) => {
    try {
      const { getDataAdapter } = await import('@/lib/data-adapter');
      const adapter = await getDataAdapter();
      
      // Create user feedback entry
      const feedbackData = {
        article_id: articleId,
        is_helpful: rating === 'helpful',
        comment: comment || '',
      };

      await adapter.createFeedback(feedbackData);
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!userComment.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, escreva um comentário antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingComment(true);
    try {
      await saveFeedback('not_helpful', userComment);
      toast({
        title: "Feedback enviado!",
        description: "Obrigado pelo seu comentário. Nossa equipe irá analisar.",
      });
      setUserComment('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comentário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
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
        <div className="text-center p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-xl border border-primary/20">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Que pena que não conseguimos ajudar!
          </h3>
          <p className="text-muted-foreground mb-8">
            Conte-nos o que você estava procurando para melhorarmos nosso conteúdo.
          </p>
          
          {/* Comment Section */}
          <div className="max-w-lg mx-auto mb-8">
            <Textarea
              placeholder="Descreva brevemente o que você gostaria de encontrar neste artigo..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="min-h-[100px] mb-4 bg-background/50 border-primary/20 focus:border-primary"
              maxLength={500}
            />
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-muted-foreground">
                {userComment.length}/500 caracteres
              </span>
              <Button
                onClick={handleCommentSubmit}
                disabled={!userComment.trim() || isSubmittingComment}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmittingComment ? 'Enviando...' : 'Enviar Feedback'}
              </Button>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6">
            <p className="text-muted-foreground mb-6">
              Ou entre em contato direto com nossa equipe:
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
        </div>
      )}
    </section>
  );
};

export default ArticleFeedback;