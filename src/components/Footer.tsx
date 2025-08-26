import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-modopag-black text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <Link 
              to="/" 
              className="inline-block mb-4"
              aria-label="modoPAG - Central de Ajuda"
            >
              <img 
                src="/lovable-uploads/f53c780b-8fc2-40b8-934d-758902a1bf9b.png"
                alt="modoPAG - Central de Ajuda"
                title="Ir para a página inicial"
                className="h-8 w-auto"
                width="280"
                height="60"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Ative o modo de vender com as menores taxas do Brasil!
            </p>
          </div>
          
          {/* Institucional */}
          <div>
            <h3 className="font-semibold text-white mb-4">Institucional</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://modopag.com.br/sobre-nos/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">Sobre nós</a></li>
              <li><a href="https://modopag.com.br/termos-de-uso-e-condicoes-de-uso/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">Termos e condições de uso</a></li>
              <li><a href="https://modopag.com.br/politicas-de-privacidade/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">Políticas de privacidade</a></li>
              <li><a href="https://modopag.com.br/termo-consentimento-produto-modopag-pagbank/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">Termos de consentimento</a></li>
            </ul>
          </div>
          
          {/* Produtos */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produtos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://modopag.com.br/maquininhas/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">Maquininhas</a></li>
              <li><a href="https://modopag.com.br/modolink/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">modoLINK</a></li>
              <li><a href="https://modopag.com.br/calculadora-de-repasse/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">Calculadora de taxas</a></li>
            </ul>
          </div>
          
          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-white mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-300 hover:text-accent transition-colors">Central de Ajuda</a></li>
              <li><a href="mailto:contato@modopag.com.br" className="text-gray-300 hover:text-accent transition-colors">Fale Conosco</a></li>
            </ul>
          </div>
        </div>
        
        {/* Divisor */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm text-center md:text-left">
              <p className="mb-2">modoPAG - Tecnologia e Inovação em Pagamentos LTDA</p>  
              <p>© 2025 modoPAG • CNPJ: 58.172.447/0001-28</p>
              <p>Av. Maria Quitéria, 645 - Feira de Santana/BA - CEP: 44088-000</p>
            </div>
            
            {/* Redes Sociais */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="https://www.facebook.com/people/Modo-PAG/61560902013241/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/modopag/" target="_blank" className="text-gray-300 hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/modopag/about/?viewAsMember=true" target="_blank" className="text-gray-300 hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://x.com/modopag" target="_blank" className="text-gray-300 hover:text-accent transition-colors">
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