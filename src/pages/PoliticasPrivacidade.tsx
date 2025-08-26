import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Cookie, Mail, Phone } from 'lucide-react';

export default function PoliticasPrivacidade() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Política de Privacidade - modoPAG",
    "description": "Política de Privacidade da modoPAG em conformidade com a LGPD",
    "url": "https://ajuda.modopag.com.br/politicas-de-privacidade",
    "inLanguage": "pt-BR",
    "isPartOf": {
      "@type": "WebSite",
      "name": "modoPAG Central de Ajuda",
      "url": "https://ajuda.modopag.com.br"
    }
  };

  return (
    <>
      <SEOHelmet 
        title="Política de Privacidade | modoPAG Central de Ajuda"
        description="Saiba como a modoPAG coleta, usa e protege seus dados pessoais. Política de privacidade em conformidade com a LGPD."
        canonicalUrl="https://ajuda.modopag.com.br/politicas-de-privacidade"
        jsonLd={jsonLd}
      />

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <header className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Esta política descreve como a modoPAG coleta, usa e protege suas informações 
              pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                1. Informações que Coletamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Dados fornecidos por você:</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Nome, e-mail e telefone para suporte</li>
                  <li>Informações de feedback sobre artigos</li>
                  <li>Dados de navegação para melhorar a experiência</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Dados coletados automaticamente:</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Endereço IP e informações do dispositivo</li>
                  <li>Dados de navegação e uso do site</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                2. Uso de Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Tipos de cookies que utilizamos:</h3>
                
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Cookies Necessários</h4>
                    <p className="text-sm text-muted-foreground">
                      Essenciais para o funcionamento do site. Incluem cookies de autenticação, 
                      segurança e navegação básica.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Cookies Analíticos</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilizamos Google Analytics para entender como você usa nosso site e 
                      melhorar sua experiência. Estes dados são anonimizados.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium">Cookies de Marketing</h4>
                    <p className="text-sm text-muted-foreground">
                      Reservado para uso futuro. Atualmente não utilizamos cookies de marketing 
                      ou publicidade direcionada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Seus direitos sobre cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Você pode gerenciar suas preferências de cookies a qualquer momento através 
                  do botão "Gerenciar Cookies" no rodapé do site. Respeitamos a configuração 
                  "Não Rastrear" do seu navegador.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Como Usamos suas Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fornecer e melhorar nossos serviços de suporte</li>
                <li>Responder a suas dúvidas e solicitações</li>
                <li>Analisar o uso do site para melhorar a experiência</li>
                <li>Cumprir obrigações legais e regulamentares</li>
                <li>Detectar e prevenir fraudes ou problemas técnicos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Compartilhamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Não vendemos, alugamos ou comercializamos suas informações pessoais. 
                Podemos compartilhar dados apenas nos seguintes casos:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Com fornecedores de serviços que nos ajudam a operar o site (Google Analytics)</li>
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger nossos direitos, propriedade ou segurança</li>
                <li>Com seu consentimento explícito</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Seus Direitos (LGPD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Você tem direito a:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Confirmação da existência de tratamento</li>
                    <li>Acesso aos dados</li>
                    <li>Correção de dados incompletos/inexatos</li>
                    <li>Anonimização, bloqueio ou eliminação</li>
                    <li>Portabilidade dos dados</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Como exercer seus direitos:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Entre em contato conosco</li>
                    <li>Identifique-se adequadamente</li>
                    <li>Especifique sua solicitação</li>
                    <li>Responderemos em até 15 dias</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Segurança e Retenção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Medidas de Segurança:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Criptografia de dados em trânsito (HTTPS)</li>
                  <li>Controles de acesso e autenticação</li>
                  <li>Monitoramento de segurança</li>
                  <li>Backups seguros e regulares</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Período de Retenção:</h4>
                <p className="text-muted-foreground">
                  Mantemos seus dados pelo tempo necessário para cumprir as finalidades 
                  descritas nesta política ou conforme exigido por lei. Dados analíticos 
                  são automaticamente excluídos após 26 meses.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                7. Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Para dúvidas sobre esta política ou para exercer seus direitos sob a LGPD:
                </p>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="font-medium">E-mail:</span>
                      <a href="mailto:privacidade@modopag.com.br" className="text-primary hover:underline">
                        privacidade@modopag.com.br
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">Telefone:</span>
                      <a href="tel:+5511999999999" className="text-primary hover:underline">
                        (11) 99999-9999
                      </a>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  <strong>Encarregado de Dados (DPO):</strong> Para questões específicas sobre 
                  proteção de dados, entre em contato através dos canais acima identificando 
                  sua solicitação como "LGPD - Encarregado de Dados".
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Alterações nesta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta política pode ser atualizada periodicamente. Mudanças significativas 
                serão comunicadas através do site ou por e-mail. Recomendamos que você 
                revise esta página regularmente para se manter informado sobre nossas 
                práticas de privacidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}