import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import modopagLogo from "@/assets/modopag-logo.png";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src={modopagLogo} 
              alt="modoPAG" 
              className="h-10 w-auto"
            />
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-accent transition-colors duration-300">
              Início
            </a>
            <a href="/produtos" className="text-foreground hover:text-accent transition-colors duration-300">
              Produtos
            </a>
            <a href="/solucoes" className="text-foreground hover:text-accent transition-colors duration-300">
              Soluções
            </a>
            <a href="/contato" className="text-foreground hover:text-accent transition-colors duration-300">
              Contato
            </a>
          </nav>
          
          {/* CTA Button */}
          <Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
            Área do Cliente
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;