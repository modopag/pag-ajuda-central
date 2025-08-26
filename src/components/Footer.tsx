import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import modopagLogo from "@/assets/modopag-logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <img 
              src={modopagLogo} 
              alt="modoPAG" 
              className="h-10 w-auto mb-4"
            />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Soluções completas de pagamento para fazer seu negócio crescer.
            </p>
          </div>
          
          {/* Produtos */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Produtos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Maquininhas</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Checkout Online</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Link de Pagamento</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Conta Digital</a></li>
            </ul>
          </div>
          
          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Status dos Serviços</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Fale Conosco</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Documentação</a></li>
            </ul>
          </div>
          
          {/* Empresa */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Carreiras</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Imprensa</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Termos de Uso</a></li>
            </ul>
          </div>
        </div>
        
        {/* Divisor */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 modoPAG. Todos os direitos reservados.
            </p>
            
            {/* Redes Sociais */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;