import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/dropdown-navigation";
import { Link } from "react-router-dom";
import logoBlack from "@/assets/modopag-logo-black.svg";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center"
            aria-label="modoPAG - Central de Ajuda"
          >
            <img 
              src={logoBlack}
              alt="modoPAG - Central de Ajuda"
              title="Ir para a página inicial"
              className="h-8 w-auto"
              width="280"
              height="60"
            />
          </Link>
          
          {/* Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-accent transition-colors duration-300">
                  Maquininhas
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    <NavigationMenuLink 
                      href="https://modopag.com.br/maquininhas/"
                      target="_blank"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Todas as Maquininhas</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Conheça toda nossa linha de maquininhas
                      </p>
                    </NavigationMenuLink>
                    <NavigationMenuLink 
                      href="https://modopag.com.br/maquininhas/modo-mini/"
                      target="_blank"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">modo MINI</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Compacta e portátil
                      </p>
                    </NavigationMenuLink>
                    <NavigationMenuLink 
                      href="https://modopag.com.br/maquininhas/modo-pro/"
                      target="_blank"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">modo PRO</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Conexão via chip
                      </p>
                    </NavigationMenuLink>
                    <NavigationMenuLink 
                      href="https://modopag.com.br/maquininhas/modo-smart/"
                      target="_blank"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">modo SMART</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Solução completa
                      </p>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="https://modopag.com.br/modolink/"
                  target="_blank"
                  className="text-foreground hover:text-accent transition-colors duration-300 px-4 py-2 rounded-md hover:bg-accent/10"
                >
                  modo LINK
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="https://modopag.com.br/maquininhas/taxas/"
                  target="_blank"
                  className="text-foreground hover:text-accent transition-colors duration-300 px-4 py-2 rounded-md hover:bg-accent/10"
                >
                  Planos e Taxas
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="https://modopag.com.br/calculadora-de-repasse/"
                  target="_blank"
                  className="text-foreground hover:text-accent transition-colors duration-300 px-4 py-2 rounded-md hover:bg-accent/10"
                >
                  Calculadora
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* CTA Button */}
          <Button 
            variant="default" 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => window.open('https://conta.modopag.com.br/', '_blank')}
          >
            Área do Cliente
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;