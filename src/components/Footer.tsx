import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookieManageButton } from "@/components/CookieManageButton";

const Footer = () => {
  const { showBanner } = useCookieConsent();
  
  return (
    <footer className={`bg-modopag-black text-white mt-20 relative ${showBanner ? 'mb-44 z-[60]' : ''}`}>
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
                src="/lovable-uploads/47a12c64-faaa-4bba-95d6-25d38d68ad02.png"
                alt="modoPAG - Central de Ajuda"
                title="modoPAG - Central de Ajuda"
                aria-label="modoPAG - Central de Ajuda"
                className="h-12 md:h-16 w-auto"
                width="280"
                height="60"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
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
              <li><a href="https://modopag.com.br/sobre-nos/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors">Sobre nós</a></li>
              <li><a href="https://modopag.com.br/termos-de-uso-e-condicoes-de-uso/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors">Termos e condições de uso</a></li>
              <li><a href="https://modopag.com.br/politicas-de-privacidade/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors">Políticas de privacidade</a></li>
              <li><a href="https://modopag.com.br/termo-consentimento-produto-modopag-pagbank/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors">Termos de consentimento</a></li>
            </ul>
          </div>
          
          {/* Produtos */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produtos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://modopag.com.br/maquininhas/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors">Maquininhas</a></li>
              <li><a href="https://modopag.com.br/modolink/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors">modoLINK</a></li>
              <li><a href="https://modopag.com.br/calculadora-de-repasse/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors">Calculadora de taxas</a></li>
            </ul>
          </div>
          
          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-white mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-300 hover:text-modopag-yellow transition-colors">Central de Ajuda</Link></li>
              <li><Link to="/boas-praticas" className="text-gray-300 hover:text-modopag-yellow transition-colors">Boas Práticas</Link></li>
              <li><a href="mailto:contato@modopag.com.br" className="text-gray-300 hover:text-modopag-yellow transition-colors">Fale Conosco</a></li>
              <li><CookieManageButton /></li>
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
              <a href="https://www.facebook.com/people/Modo-PAG/61560902013241/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors" aria-label="Facebook do modoPAG">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/modopag/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors" aria-label="Instagram do modoPAG">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/modopag/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors" aria-label="LinkedIn do modoPAG">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://x.com/modopag" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-modopag-yellow transition-colors" aria-label="Twitter/X do modoPAG">
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