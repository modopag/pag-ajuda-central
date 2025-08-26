import { toast } from '@/hooks/use-toast';

// Like functionality
export const handleArticleLike = async (articleId: string) => {
  try {
    // Check if already liked (using localStorage for now)
    const likedKey = `article_liked_${articleId}`;
    const alreadyLiked = localStorage.getItem(likedKey) === 'true';
    
    if (alreadyLiked) {
      toast({
        title: "Já curtido!",
        description: "Você já curtiu este artigo anteriormente.",
      });
      return false;
    }

    // Mark as liked
    localStorage.setItem(likedKey, 'true');
    
    // Track analytics
    try {
      const analytics = await import('@/utils/analytics');
      if ('trackEvent' in analytics && typeof analytics.trackEvent === 'function') {
        analytics.trackEvent('article_like', { articleId });
      }
    } catch (error) {
      console.log('Analytics not available');
    }

    toast({
      title: "Artigo curtido! 👍",
      description: "Obrigado pelo seu feedback positivo.",
    });
    
    return true;
  } catch (error) {
    console.error('Error liking article:', error);
    toast({
      title: "Erro",
      description: "Não foi possível curtir o artigo. Tente novamente.",
      variant: "destructive"
    });
    return false;
  }
};

// Share functionality
export const handleArticleShare = async (title: string, url?: string) => {
  const shareUrl = url || window.location.href;
  const shareData = {
    title: title,
    text: `Confira este artigo da Central de Ajuda da modoPAG: ${title}`,
    url: shareUrl
  };

  try {
    // Try native share API first (mobile/PWA)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      
      // Track analytics
      try {
        const analytics = await import('@/utils/analytics');
        if ('trackEvent' in analytics && typeof analytics.trackEvent === 'function') {
          analytics.trackEvent('article_share', { method: 'native', articleTitle: title });
        }
      } catch (error) {
        console.log('Analytics not available');
      }
      
      return true;
    }
    
    // Fallback: Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Link copiado! 📋",
      description: "O link do artigo foi copiado para sua área de transferência.",
    });
    
    // Track analytics
    try {
      const analytics = await import('@/utils/analytics');
      if ('trackEvent' in analytics && typeof analytics.trackEvent === 'function') {
        analytics.trackEvent('article_share', { method: 'clipboard', articleTitle: title });
      }
    } catch (error) {
      console.log('Analytics not available');
    }
    
    return true;
  } catch (error) {
    console.error('Error sharing article:', error);
    
    // Ultimate fallback: Show share options
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Confira este artigo: ${title} - ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Compartilhar via WhatsApp",
      description: "Abrindo WhatsApp para compartilhamento...",
    });
    
    return true;
  }
};

// Check if article is already liked
export const isArticleLiked = (articleId: string): boolean => {
  return localStorage.getItem(`article_liked_${articleId}`) === 'true';
};