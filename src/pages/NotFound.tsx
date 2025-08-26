import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Category } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Home, FileX } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const adapter = await getDataAdapter();
        const categoriesData = await adapter.getCategories();
        setCategories(categoriesData.filter(cat => cat.is_active).slice(0, 6));
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <SEOHelmet
        title="Página não encontrada | modoPAG - Central de Ajuda"
        description="A página que você está procurando não foi encontrada. Use nossa busca ou navegue pelas categorias da Central de Ajuda modoPAG."
        noindex={true}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Error Icon and Message */}
            <div className="mb-12">
              <FileX className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Página não encontrada
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                A página que você está procurando não existe ou foi removida.
              </p>
            </div>

            {/* Search Section */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Tente buscar pelo que precisa
                </CardTitle>
                <CardDescription>
                  Use nossa busca para encontrar artigos, tutoriais e FAQs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
                  <Input
                    placeholder="Digite sua busca..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!searchQuery.trim()}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Categories Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Ou navegue pelas categorias
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-left">
                          <Link 
                            to={`/category/${category.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {category.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-left">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Ações rápidas
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Voltar ao Início
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Voltar à página anterior
                  </Button>
                </div>
              </div>

              {/* Contact Support */}
              <div className="pt-8 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Ainda precisa de ajuda?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Nossa equipe de suporte está disponível para ajudar você
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button 
                    onClick={() => window.open('https://wa.me/5571981470573?text=Vim%20da%20Central%20de%20Ajuda%20e%20preciso%20de%20suporte%20-%20página%20não%20encontrada', '_blank')}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = 'mailto:contato@modopag.com.br?subject=Suporte - Página não encontrada'}
                    className="flex-1"
                  >
                    E-mail
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
