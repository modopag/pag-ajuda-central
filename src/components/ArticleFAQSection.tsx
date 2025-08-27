import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getDataAdapter } from '@/lib/data-adapter';
import type { ArticleFAQ } from '@/types/admin';

interface ArticleFAQSectionProps {
  articleId: string;
}

export function ArticleFAQSection({ articleId }: ArticleFAQSectionProps) {
  const [faqs, setFaqs] = useState<ArticleFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadFAQs = async () => {
      console.log('🔍 ArticleFAQSection - Loading FAQs for article:', articleId);
      try {
        const adapter = await getDataAdapter();
        const data = await adapter.getArticleFAQs(articleId);
        console.log('📊 ArticleFAQSection - FAQs loaded:', {
          articleId,
          faqCount: data?.length || 0,
          faqs: data
        });
        setFaqs(data);
      } catch (error) {
        console.error('❌ ArticleFAQSection - Error loading FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadFAQs();
    } else {
      console.warn('⚠️ ArticleFAQSection - No articleId provided');
      setLoading(false);
    }
  }, [articleId]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded(id);
    }
  };

  console.log('🎯 ArticleFAQSection - Render state:', {
    loading,
    faqsLength: faqs.length,
    articleId,
    shouldRender: !loading && faqs.length > 0
  });

  if (loading) {
    console.log('⏳ ArticleFAQSection - Still loading FAQs');
    return null;
  }

  if (faqs.length === 0) {
    console.log('📭 ArticleFAQSection - No FAQs found, not rendering section');
    return null;
  }

  return (
    <section className="mt-8" aria-labelledby="article-faqs-heading">
      <h3 id="article-faqs-heading" className="text-xl font-semibold mb-4 text-foreground">
        Perguntas Frequentes
      </h3>
      
      <div className="space-y-2">
        {faqs.map((faq) => {
          const isExpanded = expandedItems.has(faq.id);
          
          return (
            <div
              key={faq.id}
              className="border-l-2 border-l-muted-foreground/20 bg-muted/30 rounded-r-lg"
            >
              <button
                className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-r-lg"
                onClick={() => toggleExpanded(faq.id)}
                onKeyDown={(e) => handleKeyDown(e, faq.id)}
                aria-expanded={isExpanded}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <span className="font-medium text-foreground pr-4 flex-1">
                  {faq.question}
                </span>
                
                <span className="flex-shrink-0 text-muted-foreground">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              </button>
              
              {isExpanded && (
                <div
                  id={`faq-answer-${faq.id}`}
                  className="px-4 pb-3 text-muted-foreground leading-relaxed border-t border-t-muted-foreground/10"
                  role="region"
                  aria-labelledby={`faq-question-${faq.id}`}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                    className="prose prose-sm max-w-none [&>p:first-child]:mt-2 [&>p:last-child]:mb-0"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}