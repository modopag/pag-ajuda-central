import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";

// Mock data for articles
const mockArticles = {
  maquininhas: [
    { id: "1", title: "Como configurar sua maquininha modoPAG pela primeira vez", summary: "Passo a passo completo para configurar e começar a usar sua maquininha." },
    { id: "2", title: "Tipos de pagamento aceitos pela maquininha", summary: "Conheça todas as formas de pagamento suportadas." },
    { id: "3", title: "Como resolver problemas de conexão", summary: "Soluções para problemas de wifi e bluetooth." },
    { id: "4", title: "Atualização de software da maquininha", summary: "Como manter sua maquininha sempre atualizada." },
  ],
  pagamentos: [
    { id: "5", title: "Como processar uma venda com cartão de crédito", summary: "Guia completo para vendas no crédito." },
    { id: "6", title: "Estornos e cancelamentos de transações", summary: "Como reverter vendas quando necessário." },
    { id: "7", title: "Parcelamento de vendas", summary: "Configure e processe vendas parceladas." },
  ],
  "conta-digital": [
    { id: "8", title: "Como acessar sua conta digital", summary: "Primeiros passos no app e portal web." },
    { id: "9", title: "Transferências e saques", summary: "Movimente seu dinheiro com facilidade." },
    { id: "10", title: "Extratos e comprovantes", summary: "Acesse e baixe seus documentos financeiros." },
  ],
};

const categoryNames = {
  maquininhas: "Maquininhas modoPAG",
  pagamentos: "Pagamentos e Vendas", 
  "conta-digital": "Conta Digital",
  configuracoes: "Configurações",
  seguranca: "Segurança",
  clientes: "Gestão de Clientes",
  relatorios: "Relatórios e Extratos",
  suporte: "Suporte Técnico",
  faq: "Perguntas Frequentes",
};

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const categoryName = categoryNames[categoryId as keyof typeof categoryNames] || "Categoria";
  const articles = mockArticles[categoryId as keyof typeof mockArticles] || [];

  const handleSearch = (query: string) => {
    // Implementar busca na categoria
    console.log(`Searching for "${query}" in category ${categoryId}`);
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="py-4 px-4 border-b border-border">
        <div className="container mx-auto">
          <nav className="flex items-center space-x-2 text-sm">
            <Home className="w-4 h-4" />
            <button 
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Central de Ajuda
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{categoryName}</span>
          </nav>
        </div>
      </div>
      
      {/* Category Header */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6 p-0 h-auto font-normal text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Central de Ajuda
          </Button>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Encontre respostas específicas sobre {categoryName.toLowerCase()}
          </p>
          
          {/* Search within category */}
          <div className="max-w-2xl">
            <SearchBar 
              onSearch={handleSearch}
              placeholder={`Pesquisar em ${categoryName}`}
            />
          </div>
        </div>
      </section>
      
      {/* Articles List */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Artigos em {categoryName}
          </h2>
          
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div 
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {article.summary}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Em breve, artigos específicos para esta categoria estarão disponíveis.
              </p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Category;