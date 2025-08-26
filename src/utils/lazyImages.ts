// Lazy loading utility for article images

export const initializeLazyImages = () => {
  // Only run on client side
  if (typeof window === 'undefined') return;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        
        // Add loaded class for CSS transition
        img.addEventListener('load', () => {
          img.classList.add('loaded');
        });
        
        // Add error handling
        img.addEventListener('error', () => {
          img.alt = `Erro ao carregar imagem: ${img.alt || 'Imagem sem descrição'}`;
          img.classList.add('error');
        });
        
        // Ensure image has proper alt text
        if (!img.alt || img.alt.trim() === '') {
          console.warn('Image without alt text detected:', img.src);
        }
        
        observer.unobserve(img);
      }
    });
  });

  // Observe all images in article content
  const articleImages = document.querySelectorAll('.article-content.lazy-images img');
  articleImages.forEach(img => {
    imageObserver.observe(img);
  });

  return () => {
    imageObserver.disconnect();
  };
};