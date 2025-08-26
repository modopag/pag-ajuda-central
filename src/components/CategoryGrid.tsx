import { 
  CreditCard, 
  Smartphone, 
  Settings, 
  HelpCircle, 
  Shield, 
  DollarSign,
  Users,
  FileText,
  Phone
} from "lucide-react";
import CategoryCard from "./CategoryCard";

const categories = [
  {
    id: "maquininhas",
    title: "Maquininhas modoPAG",
    description: "Tudo sobre nossas maquininhas, configuração e uso diário",
    icon: CreditCard,
    articleCount: 15,
  },
  {
    id: "pagamentos",
    title: "Pagamentos e Vendas",
    description: "Como processar vendas, estornos e gerenciar transações",
    icon: DollarSign,
    articleCount: 23,
  },
  {
    id: "conta-digital",
    title: "Conta Digital",
    description: "Gerencie sua conta, transferências e extratos",
    icon: Smartphone,
    articleCount: 18,
  },
  {
    id: "configuracoes",
    title: "Configurações",
    description: "Personalize sua conta e preferências do sistema",
    icon: Settings,
    articleCount: 12,
  },
  {
    id: "seguranca",
    title: "Segurança",
    description: "Proteja sua conta e entenda nossas medidas de segurança",
    icon: Shield,
    articleCount: 8,
  },
  {
    id: "clientes",
    title: "Gestão de Clientes",
    description: "Cadastre e gerencie informações dos seus clientes",
    icon: Users,
    articleCount: 10,
  },
  {
    id: "relatorios",
    title: "Relatórios e Extratos",
    description: "Acesse relatórios de vendas e extratos detalhados",
    icon: FileText,
    articleCount: 14,
  },
  {
    id: "suporte",
    title: "Suporte Técnico",
    description: "Resolva problemas técnicos e entre em contato conosco",
    icon: Phone,
    articleCount: 7,
  },
  {
    id: "faq",
    title: "Perguntas Frequentes",
    description: "Respostas rápidas para as dúvidas mais comuns",
    icon: HelpCircle,
    articleCount: 25,
  },
];

interface CategoryGridProps {
  onCategoryClick?: (categoryId: string) => void;
}

const CategoryGrid = ({ onCategoryClick }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          title={category.title}
          description={category.description}
          icon={category.icon}
          articleCount={category.articleCount}
          onClick={() => onCategoryClick?.(category.id)}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;