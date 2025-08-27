import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/dropdown-navigation";
import { Link, useLocation } from "react-router-dom";
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { SkipLink } from '@/components/SkipLink';
import { useResilientCategories } from '@/hooks/useResilientCategories';
import logoBlack from "@/assets/modopag-logo-black.png";

const Header = () => {
  const location = useLocation();
  const { categories } = useResilientCategories();
  
  // Pages that have their own search functionality - hide header search
  const pagesWithSearch = [
    '/', // Homepage
    '/buscar', // Search page
    '/404', // 404 page
    '/410', // Gone page
  ];
  
  // Check if current page is a category page (has its own search)
  const isCategoryPage = /^\/[^\/]+\/$/.test(location.pathname);
  
  // Hide search if on pages with their own search or category pages
  const shouldHideSearch = pagesWithSearch.includes(location.pathname) || isCategoryPage;

  return (
    <>
      <SkipLink />
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center flex-shrink-0"
              aria-label="modoPAG - Central de Ajuda"
            >
              <img 
                src="/favicon.png"
                alt="modoPAG - Central de Ajuda"
                title="Ir para a página inicial"
                className="h-12 md:h-14 w-auto"
                width="56"
                height="56"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            </Link>
            
            {/* Search Bar - Hidden on pages with their own search */}
            {!shouldHideSearch && (
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <SearchAutocomplete 
                  placeholder="Pesquisar na central de ajuda..."
                  showButton={false}
                  className="w-full"
                />
              </div>
            )}
          
          {/* Navigation */}
          <NavigationMenu className="hidden lg:flex">
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
                <NavigationMenuTrigger className="text-foreground hover:text-accent transition-colors duration-300">
                  Categorias
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] max-h-[500px] overflow-y-auto">
                    {categories.map((category) => (
                      <NavigationMenuLink 
                        key={category.id}
                        asChild
                      >
                        <Link
                          to={`/${category.slug}/`}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{category.name}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {category.description || `Artigos sobre ${category.name.toLowerCase()}`}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
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
            </NavigationMenuList>
          </NavigationMenu>
          
            {/* Mobile Search Button - Hidden on pages with search */}
            {!shouldHideSearch && (
              <Link 
                to="/buscar" 
                className="md:hidden p-2 hover:bg-accent/10 rounded-md transition-colors"
                aria-label="Pesquisar"
              >
                <Search className="h-5 w-5" />
              </Link>
            )}
          
          {/* CTA Button */}
          <Button 
            variant="default" 
            className="bg-accent text-accent-foreground hover:bg-accent/90 flex-shrink-0"
            onClick={() => window.open('https://conta.modopag.com.br/', '_blank')}
          >
            <span className="hidden sm:inline">Área do Cliente</span>
            <span className="sm:hidden">Login</span>
          </Button>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;