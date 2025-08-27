import { useState } from 'react';
import { ChevronRight, List, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTableOfContents } from '@/hooks/useTableOfContents';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  className?: string;
  mobileCollapsible?: boolean;
}

export function TableOfContents({ 
  className,
  mobileCollapsible = false 
}: TableOfContentsProps) {
  const { headings, activeHeading, scrollToHeading } = useTableOfContents();
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (headings.length === 0) return null;

  const getIndentLevel = (level: number) => {
    switch (level) {
      case 2: return 'ml-0';
      case 3: return 'ml-4';
      case 4: return 'ml-8';
      default: return 'ml-0';
    }
  };

  const getTextSize = (level: number) => {
    switch (level) {
      case 2: return 'text-sm font-medium';
      case 3: return 'text-sm';
      case 4: return 'text-xs';
      default: return 'text-sm';
    }
  };

  // Mobile version
  if (mobileCollapsible) {
    return (
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span>Índice do artigo</span>
          </div>
          <ChevronRight 
            className={cn(
              "w-4 h-4 transition-transform",
              !isCollapsed && "rotate-90"
            )} 
          />
        </Button>
        
        {!isCollapsed && (
          <Card className="mt-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <ScrollArea className="max-h-64 p-4">
              <nav className="space-y-2">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => {
                      scrollToHeading(heading.id);
                      setIsCollapsed(true);
                    }}
                    className={cn(
                      "block w-full text-left p-2 rounded-md transition-all duration-200",
                      getIndentLevel(heading.level),
                      getTextSize(heading.level),
                      activeHeading === heading.id
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "hover:bg-primary/10 text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <span className="line-clamp-2">{heading.text}</span>
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </Card>
        )}
      </div>
    );
  }

  // Desktop sticky sidebar version
  return (
    <div className={cn("overflow-y-auto", className)} style={{ maxHeight: 'calc(50vh - 2rem)' }}>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              Índice
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          
          <ScrollArea className="max-h-[calc(100vh-16rem)]">
            <nav className="space-y-1 pr-3">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    "group flex items-start w-full text-left p-2 rounded-md transition-all duration-300",
                    getIndentLevel(heading.level),
                    getTextSize(heading.level),
                    activeHeading === heading.id
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-[1.02] border border-primary/30"
                      : "hover:bg-primary/10 text-foreground/70 hover:text-foreground hover:scale-[1.01]"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 mr-3 transition-all duration-300",
                    activeHeading === heading.id
                      ? "bg-primary-foreground shadow-sm"
                      : "bg-primary/40 group-hover:bg-primary/60"
                  )} />
                  <span className="line-clamp-3 leading-relaxed">
                    {heading.text}
                  </span>
                </button>
              ))}
            </nav>
          </ScrollArea>
          
          {/* Progress indicator */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out" 
                  style={{ 
                    width: `${headings.length > 0 && activeHeading ? 
                      ((headings.findIndex(h => h.id === activeHeading) + 1) / headings.length) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              <span className="tabular-nums">
                {activeHeading ? headings.findIndex(h => h.id === activeHeading) + 1 : 0}/{headings.length}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}