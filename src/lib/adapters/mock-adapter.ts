// Mock adapter for local data persistence using localStorage

import type { DataAdapter, Category, Article, Tag, ArticleTag, Media, Redirect, Feedback, User, Setting, AnalyticsEvent, SlugHistoryEntry } from '@/types/admin';

// Storage keys
const STORAGE_KEYS = {
  categories: 'modopag_categories',
  articles: 'modopag_articles',
  tags: 'modopag_tags',
  articleTags: 'modopag_article_tags',
  media: 'modopag_media',
  redirects: 'modopag_redirects',
  feedback: 'modopag_feedback',
  users: 'modopag_users',
  settings: 'modopag_settings',
  events: 'modopag_events',
};

// Initial demo data
const DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Conta e Login',
    slug: 'conta-login',
    description: 'Dúvidas sobre criação de conta, login e recuperação de senha',
    icon_url: '🔐',
    position: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Pagamentos',
    slug: 'pagamentos',
    description: 'Como realizar pagamentos, métodos aceitos e problemas relacionados',
    icon_url: '💳',
    position: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Suporte Técnico',
    slug: 'suporte-tecnico',
    description: 'Problemas técnicos, bugs e questões do sistema',
    icon_url: '🛠️',
    position: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Conta Digital',
    slug: 'conta-digital',
    description: 'Informações sobre conta digital, funcionalidades e benefícios',
    icon_url: '💰',
    position: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

  const DEMO_ARTICLES: Article[] = [
    {
      id: 'art-1',
      title: 'Como criar uma conta no modoPAG?',
      slug: 'como-criar-conta-modopag',
      category_id: 'cat-1',
      content: `<h1>Como criar uma conta no modoPAG</h1>

<p><strong>Criar uma conta no modoPAG é simples e rápido!</strong> Siga este passo a passo completo para começar a usar nossa plataforma de pagamentos digitais.</p>

<h2>1. Acesse o site oficial</h2>
<p>Vá para <a href="https://modopag.com.br" target="_blank" rel="noopener">modopag.com.br</a> e clique no botão <strong>"Criar Conta"</strong> no canto superior direito da tela.</p>

<h2>2. Preencha seus dados pessoais</h2>
<p>Complete o formulário com as seguintes informações obrigatórias:</p>
<ul>
  <li><strong>Nome completo:</strong> Digite seu nome como aparece nos documentos</li>
  <li><strong>E-mail:</strong> Use um e-mail válido que você tenha acesso</li>
  <li><strong>CPF ou CNPJ:</strong> Informe o documento correto</li>
  <li><strong>Telefone celular:</strong> Para verificação via SMS</li>
</ul>

<blockquote>
  <p><strong>💡 Dica de segurança:</strong> Use um e-mail que você acessa frequentemente, pois enviamos notificações importantes por lá.</p>
</blockquote>

<h2>3. Confirme seu e-mail</h2>
<p>Após preencher os dados, você receberá um e-mail de confirmação. <strong>Clique no link dentro de 24 horas</strong> para ativar sua conta.</p>

<h2>4. Configure sua senha segura</h2>
<p>Crie uma senha forte seguindo estas diretrizes:</p>
<ul>
  <li>Mínimo de 8 caracteres</li>
  <li>Pelo menos 1 letra maiúscula</li>
  <li>Pelo menos 1 número</li>
  <li>Pelo menos 1 símbolo especial (@, #, $, etc.)</li>
</ul>

<h2>5. Verificação via SMS</h2>
<p>Digite o código de 6 dígitos que será enviado para o celular cadastrado. O código é válido por 10 minutos.</p>

<h2>Pronto! Sua conta está criada</h2>
<p>Agora você pode acessar sua área do cliente e começar a usar todos os recursos do modoPAG:</p>
<ul>
  <li>Realizar pagamentos e transferências</li>
  <li>Receber pagamentos via PIX, cartão e boleto</li>  
  <li>Acompanhar extratos e comprovantes</li>
  <li>Configurar notificações</li>
</ul>

<p><strong>Problemas na criação da conta?</strong> Entre em contato com nosso suporte pelo chat ou WhatsApp.</p>`,
      status: 'published',
      published_at: new Date('2024-01-15').toISOString(),
      updated_at: new Date('2024-01-20').toISOString(),
      author: 'Equipe modoPAG',
      meta_title: 'Como criar conta no modoPAG? Guia completo passo a passo',
      meta_description: 'Aprenda como criar sua conta no modoPAG em poucos minutos. Guia completo com passo a passo, dicas de segurança e solução de problemas.',
      noindex: false,
      reading_time_minutes: 3,
      type: 'tutorial',
      view_count: 1245,
    },
    {
      id: 'art-2', 
      title: 'Esqueci minha senha, como recuperar?',
      slug: 'recuperar-senha-modopag',
      category_id: 'cat-1',
      content: `<h1>Esqueci minha senha, como recuperar?</h1>

<p><strong>Esqueceu sua senha do modoPAG?</strong> Não se preocupe! É muito fácil recuperá-la seguindo nosso processo seguro de redefinição.</p>

<h2>Passo a passo para recuperar senha</h2>

<h3>1. Acesse a página de login</h3>
<p>Vá para <a href="https://modopag.com.br/login" target="_blank" rel="noopener">modopag.com.br/login</a> no seu computador ou celular.</p>

<h3>2. Clique em "Esqueci minha senha"</h3>
<p>Na tela de login, procure pelo link <strong>"Esqueci minha senha"</strong> logo abaixo do campo de senha.</p>

<h3>3. Digite seu e-mail cadastrado</h3>
<p>Informe o e-mail que você usou para criar sua conta no modoPAG. Certifique-se de digitá-lo corretamente.</p>

<h3>4. Verifique seu e-mail</h3>
<p>Em até 5 minutos você receberá um e-mail da modoPAG com o assunto <strong>"Redefinir senha da sua conta"</strong>.</p>

<h3>5. Clique no link seguro</h3>
<p>No e-mail, clique no botão <strong>"Redefinir Senha"</strong>. Esse link é válido por 2 horas por segurança.</p>

<h3>6. Crie sua nova senha</h3>
<p>Digite uma nova senha forte seguindo os critérios de segurança:</p>
<ul>
  <li>Entre 8 e 30 caracteres</li>
  <li>Pelo menos 1 letra maiúscula</li>
  <li>Pelo menos 1 letra minúscula</li>
  <li>Pelo menos 1 número</li>
  <li>Pelo menos 1 símbolo especial</li>
</ul>

<h2>Não recebeu o e-mail?</h2>

<p>Se não recebeu o e-mail de recuperação, verifique:</p>

<h3>✅ Caixa de spam/lixo eletrônico</h3>
<p>O e-mail pode ter ido para a pasta de spam. Procure por remetente <strong>noreply@modopag.com.br</strong>.</p>

<h3>✅ E-mail digitado corretamente</h3>
<p>Confirme se o e-mail informado está exato, sem espaços extras ou caracteres incorretos.</p>

<h3>✅ Aguarde alguns minutos</h3>
<p>O e-mail pode demorar até 10 minutos para chegar, especialmente em horários de pico.</p>

<h2>Ainda com problemas?</h2>

<p>Se mesmo após seguir todos os passos você não conseguir recuperar sua senha, entre em contato conosco:</p>

<ul>
  <li><strong>Chat online:</strong> Disponível das 8h às 18h</li>
  <li><strong>WhatsApp:</strong> (11) 99999-9999</li>
  <li><strong>E-mail:</strong> suporte@modopag.com.br</li>
</ul>

<blockquote>
  <p><strong>🔒 Dica de segurança:</strong> Nunca compartilhe sua senha com terceiros. A modoPAG jamais solicitará sua senha por telefone ou e-mail.</p>
</blockquote>`,
      status: 'published',
      published_at: new Date('2024-01-18').toISOString(),
      updated_at: new Date('2024-01-22').toISOString(),
      author: 'Equipe modoPAG',
      meta_title: 'Como recuperar senha esquecida do modoPAG? Passo a passo',
      meta_description: 'Esqueceu sua senha do modoPAG? Siga nosso guia passo a passo para recuperar o acesso à sua conta de forma rápida e segura.',
      noindex: false,
      reading_time_minutes: 4,
      type: 'tutorial',
      view_count: 892,
    },
    {
      id: 'art-3',
      title: 'Quais métodos de pagamento aceita o modoPAG?',
      slug: 'metodos-pagamento-modopag',
      category_id: 'cat-2',
      content: `<h1>Quais métodos de pagamento aceita o modoPAG?</h1>

<p><strong>O modoPAG aceita diversos métodos de pagamento</strong> para oferecer máxima flexibilidade aos nossos usuários. Conheça todas as opções disponíveis:</p>

<h2>💳 Cartões de Crédito</h2>
<p>Aceitamos as principais bandeiras do mercado:</p>
<ul>
  <li><strong>Visa:</strong> Crédito nacional e internacional</li>
  <li><strong>Mastercard:</strong> Todas as modalidades</li>
  <li><strong>American Express:</strong> Crédito tradicional e corporate</li>
  <li><strong>Elo:</strong> Bandeira nacional</li>
  <li><strong>Hipercard:</strong> Crédito tradicional</li>
  <li><strong>Diners Club:</strong> Para compras corporativas</li>
</ul>

<h2>💎 Cartões de Débito</h2>
<p>Débito online direto da sua conta bancária:</p>
<ul>
  <li><strong>Visa Débito:</strong> Principais bancos brasileiros</li>
  <li><strong>Mastercard Débito:</strong> Débito eletrônico</li>
  <li><strong>Elo Débito:</strong> Bandeira nacional</li>
</ul>

<h2>⚡ PIX - Pagamento Instantâneo</h2>
<p><strong>O método mais rápido e econômico!</strong></p>
<ul>
  <li>✅ <strong>Disponível 24h por dia, 7 dias por semana</strong></li>
  <li>✅ <strong>Sem taxas para pessoa física</strong></li>
  <li>✅ <strong>Confirmação em até 10 segundos</strong></li>
  <li>✅ <strong>Seguro e regulamentado pelo Banco Central</strong></li>
</ul>

<h2>📄 Boleto Bancário</h2>
<p>Tradicional e confiável:</p>
<ul>
  <li>Vencimento padrão em 3 dias úteis</li>
  <li>Pode ser pago em bancos, lotéricas e internet banking</li>
  <li>Compensação em até 3 dias úteis após pagamento</li>
</ul>

<h2>📱 Carteiras Digitais</h2>
<p>Pagamento rápido através de apps:</p>
<ul>
  <li><strong>PicPay:</strong> Saldo ou cartão vinculado</li>
  <li><strong>PayPal:</strong> Para compras internacionais</li>
  <li><strong>Mercado Pago:</strong> Todas as modalidades</li>
  <li><strong>PagSeguro:</strong> Digital wallet</li>
</ul>

<h2>💰 Saldo modoPAG</h2>
<p>Use o saldo disponível em sua conta:</p>
<ul>
  <li>Saldo de recebimentos anteriores</li>
  <li>Transferências recebidas</li>
  <li>Cashback de transações</li>
</ul>

<h2>📊 Tabela de Taxas e Prazos</h2>

<table>
  <thead>
    <tr>
      <th>Método de Pagamento</th>
      <th>Taxa</th>
      <th>Prazo de Compensação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>PIX</strong></td>
      <td>Gratuito*</td>
      <td>Instantâneo</td>
    </tr>
    <tr>
      <td><strong>Cartão de Crédito</strong></td>
      <td>2,5% a 3,2%**</td>
      <td>D+1 útil</td>
    </tr>
    <tr>
      <td><strong>Cartão de Débito</strong></td>
      <td>1,8% a 2,1%**</td>
      <td>D+1 útil</td>
    </tr>
    <tr>
      <td><strong>Boleto</strong></td>
      <td>R$ 3,50</td>
      <td>D+3 úteis</td>
    </tr>
    <tr>
      <td><strong>Carteiras Digitais</strong></td>
      <td>1,9% a 2,8%**</td>
      <td>D+1 útil</td>
    </tr>
    <tr>
      <td><strong>Saldo modoPAG</strong></td>
      <td>Gratuito</td>
      <td>Instantâneo</td>
    </tr>
  </tbody>
</table>

<p><small>* Gratuito para pessoa física. ** Taxas podem variar conforme plano contratado.</small></p>

<blockquote>
  <p><strong>💡 Dica importante:</strong> As taxas podem ser reduzidas de acordo com seu volume de transações e plano escolhido. Consulte nosso time comercial!</p>
</blockquote>

<h2>Como escolher o melhor método?</h2>

<h3>Para pagamentos urgentes:</h3>
<p>Use <strong>PIX</strong> ou <strong>Saldo modoPAG</strong> - são instantâneos e sem taxas.</p>

<h3>Para parcelamentos:</h3>
<p>Cartão de crédito oferece opções de parcelamento em até 12x.</p>

<h3>Para quem não tem conta bancária:</h3>
<p>Boleto bancário pode ser pago em diversos estabelecimentos.</p>

<p><strong>Tem dúvidas sobre qual método usar?</strong> Nossa equipe está disponível para ajudar via chat ou WhatsApp!</p>`,
      status: 'published',
      published_at: new Date('2024-01-20').toISOString(),
      updated_at: new Date('2024-01-25').toISOString(),
      author: 'Equipe modoPAG',
      meta_title: 'Métodos de pagamento modoPAG: PIX, cartão, boleto e mais',
      meta_description: 'Conheça todos os métodos de pagamento aceitos pelo modoPAG: PIX, cartões, boleto, carteiras digitais. Compare taxas e prazos.',
      noindex: false,
      reading_time_minutes: 6,
      type: 'artigo',
      view_count: 1567,
    },
    {
      id: 'art-4',
      title: 'O que é a conta digital modoPAG?',
      slug: 'o-que-e-conta-digital-modopag',
      category_id: 'cat-4',
      content: `<h1>O que é a conta digital modoPAG?</h1>

<p><strong>A conta digital modoPAG é uma solução financeira completa</strong> que oferece praticidade, segurança e economia para suas transações do dia a dia.</p>

<h2>✨ Principais características</h2>

<h3>📱 100% Digital</h3>
<p>Sua conta funciona inteiramente pelo aplicativo, sem necessidade de ir a agências bancárias:</p>
<ul>
  <li>Abertura de conta em minutos</li>
  <li>Gerenciamento completo pelo app</li>
  <li>Suporte online 24/7</li>
  <li>Interface intuitiva e moderna</li>
</ul>

<h3>💰 Sem taxas abusivas</h3>
<p>Economize com nossa política de tarifas transparentes:</p>
<ul>
  <li><strong>Conta gratuita:</strong> Sem taxa de manutenção</li>
  <li><strong>PIX gratuito:</strong> Transferências instantâneas sem custo</li>
  <li><strong>TED limitada:</strong> Até 2 gratuitas por mês</li>
  <li><strong>Cartão de débito:</strong> Anuidade zero</li>
</ul>

<h3>🔒 Máxima segurança</h3>
<p>Sua conta protegida pelos mais altos padrões de segurança:</p>
<ul>
  <li>Criptografia de ponta a ponta</li>
  <li>Autenticação biométrica</li>
  <li>Notificações em tempo real</li>
  <li>Bloqueio automático em caso de suspeita</li>
</ul>

<h2>🚀 Funcionalidades disponíveis</h2>

<h3>💳 Cartão de débito virtual e físico</h3>
<p>Receba seu cartão virtual na hora e o físico em casa:</p>
<ul>
  <li>Função contactless (aproximação)</li>
  <li>Válido em todo território nacional</li>
  <li>Controle de limites pelo app</li>
  <li>Bloqueio e desbloqueio instantâneo</li>
</ul>

<h3>⚡ PIX integrado</h3>
<p>Receba e envie dinheiro na velocidade da luz:</p>
<ul>
  <li>Chaves PIX ilimitadas (CPF, e-mail, celular)</li>
  <li>QR Code dinâmico para recebimentos</li>
  <li>Agendamento de transferências</li>
  <li>Limites personalizáveis</li>
</ul>

<h3>📊 Controle financeiro inteligente</h3>
<p>Organize suas finanças como nunca antes:</p>
<ul>
  <li>Categorização automática de gastos</li>
  <li>Metas de economia personalizadas</li>
  <li>Relatórios mensais detalhados</li>
  <li>Alertas de gastos por categoria</li>
</ul>

<h2>🎯 Quem pode abrir uma conta?</h2>

<p>Nossa conta digital está disponível para:</p>
<ul>
  <li><strong>Pessoa Física:</strong> Brasileiros e residentes no Brasil</li>
  <li><strong>Idade mínima:</strong> 18 anos completos</li>
  <li><strong>Documentação:</strong> CPF regular e RG válido</li>
  <li><strong>Comprovação:</strong> Endereço atualizado (últimos 3 meses)</li>
</ul>

<blockquote>
  <p><strong>💡 Dica especial:</strong> A conta digital modoPAG é perfeita para freelancers, empreendedores e pessoas que buscam praticidade no dia a dia!</p>
</blockquote>

<h2>📈 Vantagens exclusivas</h2>

<table>
  <thead>
    <tr>
      <th>Recurso</th>
      <th>Conta Tradicional</th>
      <th>Conta Digital modoPAG</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Taxa de manutenção</strong></td>
      <td>R$ 15-30/mês</td>
      <td><strong>R$ 0</strong></td>
    </tr>
    <tr>
      <td><strong>PIX</strong></td>
      <td>Limitado</td>
      <td><strong>Ilimitado e gratuito</strong></td>
    </tr>
    <tr>
      <td><strong>Cartão de débito</strong></td>
      <td>R$ 25-40/ano</td>
      <td><strong>R$ 0</strong></td>
    </tr>
    <tr>
      <td><strong>Atendimento</strong></td>
      <td>Horário comercial</td>
      <td><strong>24/7 online</strong></td>
    </tr>
  </tbody>
</table>

<p><strong>Pronto para começar?</strong> Abra sua conta digital modoPAG agora mesmo e descubra um novo jeito de cuidar do seu dinheiro!</p>`,
      status: 'published',
      published_at: new Date('2024-01-25').toISOString(),
      updated_at: new Date('2024-01-30').toISOString(),
      author: 'Equipe modoPAG',
      meta_title: 'Conta digital modoPAG: gratuita, segura e sem burocracia',
      meta_description: 'Descubra a conta digital modoPAG: sem taxas, PIX gratuito, cartão sem anuidade e controle financeiro inteligente. Abra agora mesmo!',
      noindex: false,
      reading_time_minutes: 5,
      type: 'artigo',
      view_count: 2134,
    },
    {
      id: 'art-5',
      title: 'Como abrir uma conta digital no modoPAG?',
      slug: 'como-abrir-conta-digital-modopag',
      category_id: 'cat-4',
      content: `<h1>Como abrir uma conta digital no modoPAG?</h1>

<p><strong>Abrir sua conta digital no modoPAG é rápido, seguro e 100% online!</strong> Em menos de 10 minutos você terá acesso a todos os recursos da nossa plataforma financeira.</p>

<h2>📋 Documentos necessários</h2>
<p>Tenha em mãos os seguintes documentos antes de começar:</p>
<ul>
  <li><strong>CPF:</strong> Regularizado junto à Receita Federal</li>
  <li><strong>RG ou CNH:</strong> Documento de identidade com foto</li>
  <li><strong>Comprovante de endereço:</strong> Últimos 3 meses (conta de luz, água, telefone)</li>
  <li><strong>Selfie:</strong> Para validação biométrica</li>
</ul>

<h2>🚀 Passo a passo completo</h2>

<h3>1️⃣ Baixe o aplicativo</h3>
<p>Instale o app oficial modoPAG:</p>
<ul>
  <li><strong>Android:</strong> Google Play Store</li>
  <li><strong>iOS:</strong> Apple App Store</li>
  <li><strong>Versão web:</strong> app.modopag.com.br</li>
</ul>

<h3>2️⃣ Inicie o cadastro</h3>
<p>Na tela inicial, toque em <strong>"Abrir minha conta"</strong>:</p>
<ul>
  <li>Informe seu CPF completo</li>
  <li>Digite seu nome completo</li>
  <li>Insira uma senha forte (8+ caracteres)</li>
  <li>Confirme seu e-mail principal</li>
</ul>

<h3>3️⃣ Dados pessoais</h3>
<p>Preencha suas informações com atenção:</p>
<ul>
  <li>Data de nascimento</li>
  <li>Nome da mãe completo</li>
  <li>Estado civil</li>
  <li>Profissão e renda mensal</li>
</ul>

<h3>4️⃣ Endereço residencial</h3>
<p>Confirme seu endereço atual:</p>
<ul>
  <li>CEP (busca automática)</li>
  <li>Número da residência</li>
  <li>Complemento (se houver)</li>
  <li>Ponto de referência</li>
</ul>

<h3>5️⃣ Verificação de identidade</h3>
<p>Processo de validação biométrica:</p>
<ul>
  <li>Fotografe a frente do seu RG/CNH</li>
  <li>Fotografe o verso do documento</li>
  <li>Tire uma selfie segurando o documento</li>
  <li>Aguarde a validação automática (2-5 minutos)</li>
</ul>

<h3>6️⃣ Comprovante de endereço</h3>
<p>Envie uma foto nítida do comprovante:</p>
<ul>
  <li>Deve estar em seu nome ou de parente próximo</li>
  <li>Data máxima de 3 meses</li>
  <li>Endereço deve coincidir com o informado</li>
  <li>Imagem clara e legível</li>
</ul>

<h3>7️⃣ Configurações de segurança</h3>
<p>Defina suas preferências de proteção:</p>
<ul>
  <li>Ative a biometria (digital/facial)</li>
  <li>Configure seu PIN de 6 dígitos</li>
  <li>Defina limites de transações</li>
  <li>Escolha notificações por e-mail/SMS</li>
</ul>

<h2>✅ Aprovação da conta</h2>

<p><strong>Análise automática:</strong> Na maioria dos casos, a aprovação é instantânea!</p>

<h3>🚦 Status possíveis</h3>
<ul>
  <li><strong>✅ Aprovada:</strong> Conta ativada imediatamente</li>
  <li><strong>⏳ Em análise:</strong> Revisão manual (até 24h)</li>
  <li><strong>📋 Pendente:</strong> Documentos adicionais necessários</li>
  <li><strong>❌ Recusada:</strong> Não atende aos critérios (raro)</li>
</ul>

<h2>🎉 Primeiros passos após aprovação</h2>

<h3>Ative seu cartão virtual</h3>
<p>Seu cartão de débito estará disponível imediatamente:</p>
<ul>
  <li>Visualize dados do cartão no app</li>
  <li>Configure senha de 4 dígitos</li>
  <li>Ative compras online</li>
  <li>Solicite cartão físico (opcional)</li>
</ul>

<h3>Configure o PIX</h3>
<p>Registre suas chaves PIX preferidas:</p>
<ul>
  <li>CPF (já vem pré-cadastrado)</li>
  <li>E-mail principal</li>
  <li>Número de celular</li>
  <li>Chave aleatória (se desejar)</li>
</ul>

<h2>⚠️ Problemas na abertura?</h2>

<h3>Documento não aprovado</h3>
<p>Se sua identidade não foi validada:</p>
<ul>
  <li>Certifique-se de que a foto está nítida</li>
  <li>Documento deve estar dentro da validade</li>
  <li>Evite reflexos ou sombras na imagem</li>
  <li>Tente novamente em ambiente bem iluminado</li>
</ul>

<h3>CPF irregular</h3>
<p>Regularize sua situação antes de abrir a conta:</p>
<ul>
  <li>Acesse receita.fazenda.gov.br</li>
  <li>Verifique pendências em seu CPF</li>
  <li>Quite eventuais débitos pendentes</li>
  <li>Aguarde atualização no sistema (48h)</li>
</ul>

<blockquote>
  <p><strong>🎯 Dica importante:</strong> Durante o processo, mantenha uma conexão estável de internet e evite sair do aplicativo até concluir todas as etapas!</p>
</blockquote>

<p><strong>Ainda com dificuldades?</strong> Nossa equipe de suporte está pronta para ajudar via chat online ou WhatsApp!</p>`,
      status: 'published',
      published_at: new Date('2024-02-01').toISOString(),
      updated_at: new Date('2024-02-05').toISOString(),
      author: 'Equipe modoPAG',
      meta_title: 'Como abrir conta digital modoPAG: passo a passo completo',
      meta_description: 'Aprenda como abrir sua conta digital modoPAG em 10 minutos. Passo a passo completo, documentos necessários e dicas para aprovação rápida.',
      noindex: false,
      reading_time_minutes: 7,
      type: 'tutorial',
      view_count: 3021,
    }];

const DEMO_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Login', slug: 'login', created_at: new Date().toISOString() },
  { id: 'tag-2', name: 'Senha', slug: 'senha', created_at: new Date().toISOString() },
  { id: 'tag-3', name: 'PIX', slug: 'pix', created_at: new Date().toISOString() },
  { id: 'tag-4', name: 'Cartão', slug: 'cartao', created_at: new Date().toISOString() },
  { id: 'tag-5', name: 'App', slug: 'app', created_at: new Date().toISOString() },
  { id: 'tag-6', name: 'Suporte', slug: 'suporte', created_at: new Date().toISOString() },
];

const DEMO_ARTICLE_TAGS: ArticleTag[] = [
  { article_id: 'art-1', tag_id: 'tag-1' },
  { article_id: 'art-2', tag_id: 'tag-2' },
  { article_id: 'art-2', tag_id: 'tag-1' },
  { article_id: 'art-3', tag_id: 'tag-3' },
  { article_id: 'art-3', tag_id: 'tag-4' },
  { article_id: 'art-4', tag_id: 'tag-3' },
  { article_id: 'art-5', tag_id: 'tag-5' },
  { article_id: 'art-6', tag_id: 'tag-6' },
];

const DEMO_SETTINGS: Setting[] = [
  {
    key: 'global_seo_title',
    value: 'modoPAG - Central de Ajuda',
    type: 'text',
    updated_at: new Date().toISOString(),
  },
  {
    key: 'global_seo_meta_description',
    value: 'Central de Ajuda modoPAG. Encontre respostas para suas dúvidas sobre pagamentos, conta, PIX e muito mais.',
    type: 'text',
    updated_at: new Date().toISOString(),
  },
  {
    key: 'global_seo_og_image',
    value: '/assets/og-default.jpg',
    type: 'text',
    updated_at: new Date().toISOString(),
  },
  {
    key: 'robots_txt',
    value: 'User-agent: *\nDisallow: /admin/\nAllow: /',
    type: 'text',
    updated_at: new Date().toISOString(),
  },
  {
    key: 'help_quick_settings',
    value: JSON.stringify({
      phone: '0800-123-4567',
      whatsapp_url: 'https://wa.me/5511999999999',
      email: 'suporte@modopag.com.br',
      is_active: true,
    }),
    type: 'json',
    updated_at: new Date().toISOString(),
  },
  {
    key: 'reclame_aqui_settings',
    value: JSON.stringify({
      cards: [
        {
          title: 'Reclame AQUI',
          description: 'Avalie nossa empresa e veja o que outros usuários dizem',
          link_url: 'https://reclameaqui.com.br/empresa/modopag',
          is_active: true,
        },
        {
          title: 'Nota no Reclame AQUI',
          description: '⭐ 4.2/5 baseado em 1.234 avaliações',
          link_url: 'https://reclameaqui.com.br/empresa/modopag',
          is_active: true,
        },
      ],
    }),
    type: 'json',
    updated_at: new Date().toISOString(),
  },
  {
    key: 'brand_settings',
    value: JSON.stringify({
      logo_black_url: '/assets/modopag-logo-black.svg',
      logo_yellow_url: '/assets/modopag-logo-yellow.svg',
      logo_icon_url: '/assets/modopag-logo.png',
      favicon_url: '/favicon.ico',
    }),
    type: 'json',
    updated_at: new Date().toISOString(),
  },
];

export class MockAdapter implements DataAdapter {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getStorageData<T>(key: string, defaultData: T[] = []): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultData;
    } catch {
      return defaultData;
    }
  }

  private setStorageData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private initializeStorage(): void {
    // Initialize with demo data if empty
    if (!localStorage.getItem(STORAGE_KEYS.categories)) {
      this.setStorageData(STORAGE_KEYS.categories, DEMO_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.articles)) {
      this.setStorageData(STORAGE_KEYS.articles, DEMO_ARTICLES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.tags)) {
      this.setStorageData(STORAGE_KEYS.tags, DEMO_TAGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.articleTags)) {
      this.setStorageData(STORAGE_KEYS.articleTags, DEMO_ARTICLE_TAGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.settings)) {
      this.setStorageData(STORAGE_KEYS.settings, DEMO_SETTINGS);
    }
  }

  constructor() {
    this.initializeStorage();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.getStorageData<Category>(STORAGE_KEYS.categories, DEMO_CATEGORIES);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find(c => c.id === id) || null;
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory: Category = {
      ...category,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    categories.push(newCategory);
    this.setStorageData(STORAGE_KEYS.categories, categories);
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    
    categories[index] = { ...categories[index], ...updates, updated_at: new Date().toISOString() };
    this.setStorageData(STORAGE_KEYS.categories, categories);
    return categories[index];
  }

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    this.setStorageData(STORAGE_KEYS.categories, filtered);
  }

  // Articles
  async getArticles(filters?: { category_id?: string; status?: any; search?: string }): Promise<Article[]> {
    let articles = this.getStorageData<Article>(STORAGE_KEYS.articles, DEMO_ARTICLES);
    
    if (filters?.category_id) {
      articles = articles.filter(a => a.category_id === filters.category_id);
    }
    if (filters?.status) {
      articles = articles.filter(a => a.status === filters.status);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(search) || 
        a.content.toLowerCase().includes(search)
      );
    }
    
    return articles.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  async getArticleById(id: string): Promise<Article | null> {
    const articles = await this.getArticles();
    return articles.find(a => a.id === id) || null;
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const articles = await this.getArticles();
    return articles.find(a => a.slug === slug) || null;
  }

  async createArticle(article: Omit<Article, 'id' | 'updated_at' | 'view_count'>): Promise<Article> {
    const articles = await this.getArticles();
    const newArticle: Article = {
      ...article,
      id: this.generateId(),
      updated_at: new Date().toISOString(),
      view_count: 0,
    };
    articles.push(newArticle);
    this.setStorageData(STORAGE_KEYS.articles, articles);
    return newArticle;
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const articles = await this.getArticles();
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Article not found');
    
    articles[index] = { ...articles[index], ...updates, updated_at: new Date().toISOString() };
    this.setStorageData(STORAGE_KEYS.articles, articles);
    return articles[index];
  }

  async deleteArticle(id: string): Promise<void> {
    const articles = await this.getArticles();
    const filtered = articles.filter(a => a.id !== id);
    this.setStorageData(STORAGE_KEYS.articles, filtered);
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.getStorageData<Tag>(STORAGE_KEYS.tags, DEMO_TAGS);
  }

  async getTagById(id: string): Promise<Tag | null> {
    const tags = await this.getTags();
    return tags.find(t => t.id === id) || null;
  }

  async createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const tags = await this.getTags();
    const newTag: Tag = {
      ...tag,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    };
    tags.push(newTag);
    this.setStorageData(STORAGE_KEYS.tags, tags);
    return newTag;
  }

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    const tags = await this.getTags();
    const index = tags.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tag not found');
    
    tags[index] = { ...tags[index], ...updates };
    this.setStorageData(STORAGE_KEYS.tags, tags);
    return tags[index];
  }

  async deleteTag(id: string): Promise<void> {
    const tags = await this.getTags();
    const filtered = tags.filter(t => t.id !== id);
    this.setStorageData(STORAGE_KEYS.tags, filtered);
  }

  // Article Tags
  async getArticleTags(articleId: string): Promise<Tag[]> {
    const articleTags = this.getStorageData<ArticleTag>(STORAGE_KEYS.articleTags, DEMO_ARTICLE_TAGS);
    const tags = await this.getTags();
    
    const articleTagIds = articleTags
      .filter(at => at.article_id === articleId)
      .map(at => at.tag_id);
    
    return tags.filter(t => articleTagIds.includes(t.id));
  }

  async addTagToArticle(articleId: string, tagId: string): Promise<void> {
    const articleTags = this.getStorageData<ArticleTag>(STORAGE_KEYS.articleTags, DEMO_ARTICLE_TAGS);
    const exists = articleTags.some(at => at.article_id === articleId && at.tag_id === tagId);
    
    if (!exists) {
      articleTags.push({ article_id: articleId, tag_id: tagId });
      this.setStorageData(STORAGE_KEYS.articleTags, articleTags);
    }
  }

  async removeTagFromArticle(articleId: string, tagId: string): Promise<void> {
    const articleTags = this.getStorageData<ArticleTag>(STORAGE_KEYS.articleTags, DEMO_ARTICLE_TAGS);
    const filtered = articleTags.filter(at => !(at.article_id === articleId && at.tag_id === tagId));
    this.setStorageData(STORAGE_KEYS.articleTags, filtered);
  }

  // Media
  async getMediaList(): Promise<Media[]> {
    return this.getStorageData<Media>(STORAGE_KEYS.media, []);
  }

  async getMediaById(id: string): Promise<Media | null> {
    const media = await this.getMediaList();
    return media.find(m => m.id === id) || null;
  }

  async createMedia(media: Omit<Media, 'id' | 'created_at'>): Promise<Media> {
    const mediaList = await this.getMediaList();
    const newMedia: Media = {
      ...media,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    };
    mediaList.push(newMedia);
    this.setStorageData(STORAGE_KEYS.media, mediaList);
    return newMedia;
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.getMediaList();
    const filtered = media.filter(m => m.id !== id);
    this.setStorageData(STORAGE_KEYS.media, filtered);
  }

  // Redirects
  async getRedirects(): Promise<Redirect[]> {
    return this.getStorageData<Redirect>(STORAGE_KEYS.redirects, []);
  }

  async createRedirect(redirect: Omit<Redirect, 'id' | 'created_at'>): Promise<Redirect> {
    const redirects = await this.getRedirects();
    const newRedirect: Redirect = {
      ...redirect,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    };
    redirects.push(newRedirect);
    this.setStorageData(STORAGE_KEYS.redirects, redirects);
    return newRedirect;
  }

  async updateRedirect(id: string, updates: Partial<Redirect>): Promise<Redirect> {
    const redirects = await this.getRedirects();
    const index = redirects.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Redirect not found');
    
    redirects[index] = { ...redirects[index], ...updates };
    this.setStorageData(STORAGE_KEYS.redirects, redirects);
    return redirects[index];
  }

  async deleteRedirect(id: string): Promise<void> {
    const redirects = await this.getRedirects();
    const filtered = redirects.filter(r => r.id !== id);
    this.setStorageData(STORAGE_KEYS.redirects, filtered);
  }

  // Feedback
  async getFeedback(articleId?: string): Promise<Feedback[]> {
    let feedback = this.getStorageData<Feedback>(STORAGE_KEYS.feedback, []);
    if (articleId) {
      feedback = feedback.filter(f => f.article_id === articleId);
    }
    return feedback.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> {
    const feedbackList = await this.getFeedback();
    const newFeedback: Feedback = {
      ...feedback,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    };
    feedbackList.push(newFeedback);
    this.setStorageData(STORAGE_KEYS.feedback, feedbackList);
    return newFeedback;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | null> {
    const settings = this.getStorageData<Setting>(STORAGE_KEYS.settings, DEMO_SETTINGS);
    return settings.find(s => s.key === key) || null;
  }

  async updateSetting(key: string, value: string, type: Setting['type'] = 'text'): Promise<Setting> {
    const settings = this.getStorageData<Setting>(STORAGE_KEYS.settings, DEMO_SETTINGS);
    const index = settings.findIndex(s => s.key === key);
    
    const setting: Setting = {
      key,
      value,
      type,
      updated_at: new Date().toISOString(),
    };
    
    if (index >= 0) {
      settings[index] = setting;
    } else {
      settings.push(setting);
    }
    
    this.setStorageData(STORAGE_KEYS.settings, settings);
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return this.getStorageData<Setting>(STORAGE_KEYS.settings, DEMO_SETTINGS);
  }

  // Analytics
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    const events = this.getStorageData<AnalyticsEvent>(STORAGE_KEYS.events, []);
    const newEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    events.push(newEvent);
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    this.setStorageData(STORAGE_KEYS.events, events);
  }

  async getEvents(filters?: { event_type?: string; limit?: number }): Promise<AnalyticsEvent[]> {
    let events = this.getStorageData<AnalyticsEvent>(STORAGE_KEYS.events, []);
    
    if (filters?.event_type) {
      events = events.filter(e => e.event_type === filters.event_type);
    }
    
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (filters?.limit) {
      events = events.slice(0, filters.limit);
    }
    
    return events;
  }

  // Data management
  async exportData(): Promise<string> {
    const data = {
      categories: await this.getCategories(),
      articles: await this.getArticles(),
      tags: await this.getTags(),
      articleTags: this.getStorageData<ArticleTag>(STORAGE_KEYS.articleTags, []),
      media: await this.getMediaList(),
      redirects: await this.getRedirects(),
      feedback: await this.getFeedback(),
      settings: await this.getAllSettings(),
      events: await this.getEvents(),
      slugHistory: this.getStorageData<SlugHistoryEntry>('slug_history'),
      exportedAt: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  async getSlugHistory(articleId: string): Promise<SlugHistoryEntry[]> {
    const slugHistory = this.getStorageData<SlugHistoryEntry>('slug_history');
    return slugHistory.filter(entry => entry.article_id === articleId);
  }

  async recordSlugChange(entry: Omit<SlugHistoryEntry, 'id'>): Promise<SlugHistoryEntry> {
    const slugHistory = this.getStorageData<SlugHistoryEntry>('slug_history');
    const newEntry: SlugHistoryEntry = {
      ...entry,
      id: this.generateId()
    };
    
    slugHistory.push(newEntry);
    this.setStorageData('slug_history', slugHistory);
    
    return newEntry;
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.categories) this.setStorageData(STORAGE_KEYS.categories, data.categories);
      if (data.articles) this.setStorageData(STORAGE_KEYS.articles, data.articles);
      if (data.tags) this.setStorageData(STORAGE_KEYS.tags, data.tags);
      if (data.articleTags) this.setStorageData(STORAGE_KEYS.articleTags, data.articleTags);
      if (data.media) this.setStorageData(STORAGE_KEYS.media, data.media);
      if (data.redirects) this.setStorageData(STORAGE_KEYS.redirects, data.redirects);
      if (data.feedback) this.setStorageData(STORAGE_KEYS.feedback, data.feedback);
      if (data.settings) this.setStorageData(STORAGE_KEYS.settings, data.settings);
      if (data.events) this.setStorageData(STORAGE_KEYS.events, data.events);
      if (data.slugHistory) this.setStorageData('slug_history', data.slugHistory);
      
    } catch (error) {
      throw new Error('Invalid JSON data format');
    }
  }
}
