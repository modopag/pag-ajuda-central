import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Mock data for admin panel
const mockArticles = [
  {
    id: "1",
    title: "Como configurar sua maquininha modoPAG pela primeira vez",
    category: "Maquininhas modoPAG",
    status: "ativo",
    author: "Admin",
    lastUpdated: "2024-03-15",
    views: 1250,
  },
  {
    id: "2", 
    title: "Tipos de pagamento aceitos pela maquininha",
    category: "Maquininhas modoPAG",
    status: "ativo",
    author: "Admin",
    lastUpdated: "2024-03-10",
    views: 890,
  },
  {
    id: "3",
    title: "Como resolver problemas de conexão",
    category: "Maquininhas modoPAG", 
    status: "rascunho",
    author: "Admin",
    lastUpdated: "2024-03-08",
    views: 0,
  },
];

const categories = [
  "Maquininhas modoPAG",
  "Pagamentos e Vendas",
  "Conta Digital", 
  "Configurações",
  "Segurança",
  "Gestão de Clientes",
  "Relatórios e Extratos",
  "Suporte Técnico",
  "Perguntas Frequentes",
];

const Admin = () => {
  const [articles, setArticles] = useState(mockArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (credentials.username === "admin" && credentials.password === "modopag2024") {
      setIsLoggedIn(true);
    } else {
      alert("Credenciais inválidas. Use admin/modopag2024");
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStatusToggle = (articleId: string) => {
    setArticles(articles.map(article => 
      article.id === articleId 
        ? { ...article, status: article.status === "ativo" ? "inativo" : "ativo" }
        : article
    ));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Login do Administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Usuário
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    placeholder="Digite seu usuário"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Fazer Login
                </Button>
              </form>
              <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
                <strong>Demo:</strong> admin / modopag2024
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Admin Header */}
      <div className="bg-secondary py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">
              Painel Administrativo
            </h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Admin</Badge>
              <Button 
                variant="outline" 
                onClick={() => setIsLoggedIn(false)}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Artigo
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{articles.length}</div>
              <div className="text-sm text-muted-foreground">Total de Artigos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">
                {articles.filter(a => a.status === "ativo").length}
              </div>
              <div className="text-sm text-muted-foreground">Artigos Ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">
                {articles.filter(a => a.status === "rascunho").length}
              </div>
              <div className="text-sm text-muted-foreground">Rascunhos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {articles.reduce((sum, a) => sum + a.views, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total de Visualizações</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Articles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Artigos ({filteredArticles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-semibold">Título</th>
                    <th className="text-left py-3 px-2 font-semibold">Categoria</th>
                    <th className="text-left py-3 px-2 font-semibold">Status</th>
                    <th className="text-left py-3 px-2 font-semibold">Visualizações</th>
                    <th className="text-left py-3 px-2 font-semibold">Atualizado</th>
                    <th className="text-left py-3 px-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-muted-foreground">por {article.author}</div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{article.category}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant={article.status === "ativo" ? "default" : "secondary"}
                          className={article.status === "ativo" ? "bg-green-500" : ""}
                        >
                          {article.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">{article.views}</td>
                      <td className="py-3 px-2">{article.lastUpdated}</td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusToggle(article.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin;