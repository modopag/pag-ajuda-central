import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, AlertTriangle, Phone } from 'lucide-react';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';

export default function BestPractices() {
  return (
    <>
      <SEOHelmet
        title="Manual de Boas Práticas - Evite Bloqueios | modoPAG"
        description="Guia completo com 10 boas práticas para evitar bloqueios e retenções em suas transações. Aprenda a vender com segurança e estabilidade."
        canonicalUrl="https://ajuda.modopag.com.br/boas-praticas"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para início
          </Link>

          {/* Title Section */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  🧾 Manual de Boas Práticas modoPAG
                </h1>
                <p className="text-lg text-muted-foreground">
                  Evite bloqueios e retenções em suas vendas.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Seguindo estas orientações, você garante mais segurança e estabilidade nas suas operações.
                </p>
              </div>
            </div>
          </div>

          {/* Best Practices List */}
          <div className="space-y-6">
            {/* Practice 1 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                1. Mantenha seus dados sempre atualizados
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• Use <strong>sempre o mesmo CPF ou CNPJ</strong> em todas as suas vendas.</li>
                <li>• Evite divergências entre o titular da conta modoPAG e o titular da conta PagBank.</li>
                <li>• Caso mude de endereço ou telefone, <strong>atualize seus dados cadastrais</strong> no app PagBank e na plataforma modoPAG.</li>
              </ul>
            </div>

            {/* Practice 2 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                2. Venda apenas produtos e serviços permitidos
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• Não use a maquininha para <strong>receber valores de terceiros</strong>, empréstimos ou transferências pessoais.</li>
                <li>• Evite transações relacionadas a <strong>serviços financeiros, rifas, apostas, criptomoedas ou jogos de azar</strong>.</li>
                <li>• Utilize a maquininha <strong>somente para o seu negócio real</strong>, com transparência e coerência nas vendas.</li>
              </ul>
            </div>

            {/* Practice 3 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                3. Evite picos de movimentação sem histórico
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• Se você costuma vender R$ 2.000 por mês, <strong>não realize de repente uma venda de R$ 20.000</strong> sem justificativa.</li>
                <li>• Para grandes vendas, prefira <strong>dividir em parcelas</strong> ou <strong>enviar nota fiscal e comprovantes de entrega</strong>.</li>
                <li>• Movimentações muito acima do histórico normal podem <strong>gerar bloqueio automático por segurança</strong>.</li>
              </ul>
            </div>

            {/* Practice 4 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                4. Tenha sempre nota fiscal e comprovantes
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• Guarde <strong>nota fiscal, contratos, orçamentos e comprovantes de entrega</strong>.</li>
                <li>• Em caso de análise de segurança, esses documentos podem <strong>acelerar a liberação do saldo</strong>.</li>
                <li>• Se vender produtos físicos, <strong>tire fotos dos produtos e da entrega</strong>.</li>
              </ul>
            </div>

            {/* Practice 5 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                5. Evite usar a maquininha para fins pessoais
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• Nunca use a maquininha para <strong>transferências ou cobranças entre familiares e amigos</strong>.</li>
                <li>• Isso pode ser interpretado como <strong>risco de transação indevida</strong> e gerar retenções.</li>
              </ul>
            </div>

            {/* Practice 6 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                6. Atenção ao CPF ou CNPJ cadastrado
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• O CPF ou CNPJ cadastrado na conta PagBank <strong>é o responsável legal pelas vendas</strong>.</li>
                <li>• Se outra pessoa usar a maquininha, isso <strong>pode gerar bloqueios automáticos</strong>.</li>
                <li>• O ideal é que <strong>somente o titular autorizado realize as transações</strong>.</li>
              </ul>
            </div>

            {/* Practice 7 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                7. Evite cancelamentos e estornos frequentes
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• Muitos cancelamentos em pouco tempo podem indicar <strong>atividade suspeita</strong>.</li>
                <li>• Sempre tente resolver com o cliente antes de estornar uma venda.</li>
                <li>• Cancelamentos excessivos podem reduzir sua <strong>confiabilidade no sistema</strong>.</li>
              </ul>
            </div>

            {/* Practice 8 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                8. Tenha mais de uma forma de pagamento
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• Tenha <strong>duas maquininhas</strong> (ou uma maquininha e um <strong>link de pagamento modoLINK</strong>) para evitar parar suas vendas.</li>
                <li>• Assim você <strong>mantém suas operações ativas</strong> mesmo em caso de análise temporária.</li>
              </ul>
            </div>

            {/* Practice 9 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                9. Mantenha seu negócio visível e organizado
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• Tenha <strong>redes sociais ativas e atualizadas</strong> (Instagram, WhatsApp Business, Google Meu Negócio).</li>
                <li>• Isso ajuda nas análises de segurança e aumenta a <strong>credibilidade da sua marca</strong>.</li>
              </ul>
            </div>

            {/* Practice 10 */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                10. Em caso de análise ou bloqueio, não se desespere
              </h2>
              <ul className="space-y-2 text-muted-foreground ml-7">
                <li>• As análises são <strong>medidas de segurança do PagBank</strong> e costumam ser resolvidas em poucos dias úteis.</li>
                <li>• Tenha à mão: <strong>nota fiscal, comprovante de entrega e informações do cliente</strong>.</li>
                <li>• Se precisar, conte com o <strong>suporte modoPAG</strong> para acompanhar o caso.</li>
              </ul>
            </div>
          </div>

          {/* Extra Tip */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              💡 Dica extra modoPAG
            </h3>
            <p className="text-muted-foreground italic">
              "Venda com CPF ou CNPJ, tenha sempre comprovantes e siga as boas práticas:
              o segredo para nunca ter valores bloqueados está em manter a <strong>transparência e regularidade</strong>."
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Aviso Importante (Disclaimer)
            </h3>
            <p className="text-muted-foreground text-sm mb-3">
              A <strong>modoPAG</strong> atua apenas como <strong>intermediadora de tecnologia e parceira comercial</strong> do PagBank.
              Não somos responsáveis por análises, bloqueios, liberações de saldo ou contestações de vendas realizadas nas maquininhas do PagBank.
            </p>
            <p className="text-muted-foreground text-sm">
              Em casos de bloqueios, retenções ou contestações, o <strong>suporte e a análise são conduzidos diretamente pelo PagBank</strong>, conforme suas políticas internas de segurança e compliance.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-card border border-border rounded-lg p-6 mt-6 text-center">
            <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              📞 Precisa de ajuda?
            </h3>
            <p className="text-muted-foreground mb-2">
              Entre em contato com nosso time de suporte:
            </p>
            <p className="text-foreground font-medium">
              <strong>WhatsApp:</strong> (71) 98147-0573
            </p>
            <Link 
              to="/suporte-e-contato" 
              className="text-primary hover:underline inline-block mt-2"
            >
              ajuda.modopag.com.br
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
