import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Home, ArrowLeft, Clock, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

// Mock data for articles
const mockArticles = {
  "1": {
    title: "Como configurar sua maquininha modoPAG pela primeira vez",
    category: "Maquininhas modoPAG",
    categoryId: "maquininhas",
    author: "Equipe modoPAG",
    lastUpdated: "15 de março de 2024",
    readTime: "5 min",
    content: `
      <h2>Primeiros passos com sua maquininha modoPAG</h2>
      
      <p>Parabéns pela aquisição da sua maquininha modoPAG! Este guia vai te ajudar a configurar e começar a usar seu equipamento rapidamente.</p>
      
      <h3>O que você vai precisar:</h3>
      <ul>
        <li>Sua maquininha modoPAG</li>
        <li>Conexão com Wi-Fi ou dados móveis</li>
        <li>Aplicativo modoPAG instalado no seu celular</li>
        <li>Seus dados de login da conta modoPAG</li>
      </ul>
      
      <h3>Passo 1: Ligue sua maquininha</h3>
      <p>Pressione e segure o botão de ligar/desligar por 3 segundos até a tela acender.</p>
      
      <h3>Passo 2: Conecte à internet</h3>
      <p>Sua maquininha se conectará automaticamente via chip interno. Se preferir usar Wi-Fi:</p>
      <ol>
        <li>No menu principal, selecione "Configurações"</li>
        <li>Escolha "Wi-Fi"</li>
        <li>Selecione sua rede e digite a senha</li>
      </ol>
      
      <h3>Passo 3: Faça login na sua conta</h3>
      <p>Use os mesmos dados de acesso da sua conta modoPAG para sincronizar a maquininha.</p>
      
      <h3>Passo 4: Teste uma transação</h3>
      <p>Recomendamos fazer uma venda teste de R$ 1,00 para verificar se tudo está funcionando corretamente.</p>
      
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
        <h4 class="font-semibold text-yellow-800 mb-2">💡 Dica importante</h4>
        <p class="text-yellow-700">Mantenha sua maquininha sempre carregada e atualizada para o melhor desempenho.</p>
      </div>
      
      <p>Se você encontrar qualquer dificuldade durante a configuração, nossa equipe de suporte está disponível 24/7 para ajudar!</p>
    `,
    relatedArticles: [
      { id: "2", title: "Tipos de pagamento aceitos pela maquininha" },
      { id: "3", title: "Como resolver problemas de conexão" },
      { id: "4", title: "Atualização de software da maquininha" },
    ],
  },
  "2": {
    title: "Tipos de pagamento aceitos pela maquininha",
    category: "Maquininhas modoPAG",
    categoryId: "maquininhas",
    author: "Equipe modoPAG",
    lastUpdated: "10 de março de 2024",
    readTime: "3 min",
    content: `
      <h2>Formas de pagamento disponíveis</h2>
      
      <p>Sua maquininha modoPAG aceita todos os principais meios de pagamento do mercado brasileiro.</p>
      
      <h3>Cartões de Crédito</h3>
      <ul>
        <li>Visa</li>
        <li>Mastercard</li>
        <li>American Express</li>
        <li>Elo</li>
        <li>Hipercard</li>
        <li>Diners Club</li>
      </ul>
      
      <h3>Cartões de Débito</h3>
      <ul>
        <li>Visa Débito</li>
        <li>Mastercard Débito</li>
        <li>Elo Débito</li>
      </ul>
      
      <h3>Pagamentos por Aproximação (NFC)</h3>
      <p>Aceita pagamentos contactless de cartões e dispositivos móveis como:</p>
      <ul>
        <li>Samsung Pay</li>
        <li>Google Pay</li>
        <li>Apple Pay</li>
        <li>Cartões com tecnologia NFC</li>
      </ul>
      
      <h3>PIX</h3>
      <p>Processe pagamentos PIX instantâneos gerando QR codes na tela da maquininha.</p>
      
      <p>Todas as transações são processadas com máxima segurança e criptografia de ponta a ponta.</p>
    `,
    relatedArticles: [
      { id: "1", title: "Como configurar sua maquininha modoPAG pela primeira vez" },
      { id: "5", title: "Como processar uma venda com cartão de crédito" },
      { id: "7", title: "Parcelamento de vendas" },
    ],
  },
};

const Article = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  
  const article = mockArticles[articleId as keyof typeof mockArticles];

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-8">O artigo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate("/")} variant="default">
            Voltar para Central de Ajuda
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

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
            <button 
              onClick={() => navigate(`/category/${article.categoryId}`)}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              {article.category}
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{article.title}</span>
          </nav>
        </div>
      </div>
      
      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/category/${article.categoryId}`)}
                className="mb-6 p-0 h-auto font-normal text-muted-foreground hover:text-accent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para {article.category}
              </Button>
              
              <article>
                <header className="mb-8">
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    {article.title}
                  </h1>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime} de leitura</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    Última atualização: {article.lastUpdated}
                  </p>
                </header>
                
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                {/* Feedback Section */}
                <div className="mt-12 p-6 bg-secondary rounded-xl">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Este artigo foi útil?
                  </h3>
                  <div className="flex space-x-4">
                    <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground">
                      👍 Sim
                    </Button>
                    <Button variant="outline" className="hover:bg-destructive hover:text-destructive-foreground">
                      👎 Não
                    </Button>
                  </div>
                </div>
              </article>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Artigos relacionados
                  </h3>
                  
                  <div className="space-y-3">
                    {article.relatedArticles.map((relatedArticle) => (
                      <button
                        key={relatedArticle.id}
                        onClick={() => navigate(`/article/${relatedArticle.id}`)}
                        className="block w-full text-left p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <span className="text-sm font-medium">
                          {relatedArticle.title}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-3">
                      Ainda com dúvidas?
                    </h4>
                    <Button 
                      variant="default" 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Falar com Suporte
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Article;