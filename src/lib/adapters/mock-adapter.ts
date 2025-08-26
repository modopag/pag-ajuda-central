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
  }
];

const DEMO_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Como criar uma conta no modoPAG?',
    slug: 'como-criar-conta-modopag',
    category_id: 'cat-1',
    content: `# Como criar uma conta no modoPAG

Para criar sua conta no modoPAG, siga estes passos simples:

## 1. Acesse o site oficial
Vá para [modopag.com.br](https://modopag.com.br) e clique em "Criar Conta".

## 2. Preencha seus dados
- Nome completo
- E-mail válido
- CPF ou CNPJ
- Telefone

## 3. Confirme seu e-mail
Verifique sua caixa de entrada e clique no link de confirmação.

## 4. Configure sua senha
Crie uma senha segura com pelo menos 8 caracteres.

> **Dica:** Use uma combinação de letras, números e símbolos para maior segurança.

Pronto! Sua conta está criada e você pode começar a usar o modoPAG.`,
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: 'Admin',
    meta_title: 'Como criar uma conta no modoPAG? | modoPAG - Central de Ajuda',
    meta_description: 'Aprenda como criar sua conta no modoPAG em poucos passos simples. Guia completo com todas as informações necessárias.',
    noindex: false,
    reading_time_minutes: 2,
    type: 'artigo',
    view_count: 145,
  },
  {
    id: 'art-2',
    title: 'Esqueci minha senha, como recuperar?',
    slug: 'recuperar-senha-modopag',
    category_id: 'cat-1',
    content: `# Esqueci minha senha, como recuperar?

Se você esqueceu sua senha do modoPAG, não se preocupe! É muito fácil recuperá-la.

## Passo a passo para recuperar senha

### 1. Acesse a página de login
Vá para [modopag.com.br/login](https://modopag.com.br/login)

### 2. Clique em "Esqueci minha senha"
Na tela de login, procure pelo link "Esqueci minha senha" abaixo do campo de senha.

### 3. Digite seu e-mail
Informe o e-mail cadastrado em sua conta.

### 4. Verifique seu e-mail
Em poucos minutos você receberá um e-mail com as instruções para criar uma nova senha.

### 5. Crie sua nova senha
Clique no link do e-mail e defina sua nova senha.

## Não recebeu o e-mail?

- Verifique a caixa de spam/lixo eletrônico
- Aguarde alguns minutos (pode demorar até 10 minutos)
- Certifique-se de que digitou o e-mail correto

Se ainda assim não receber, entre em contato com nosso suporte.`,
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: 'Admin',
    meta_title: 'Esqueci minha senha modoPAG, como recuperar? | modoPAG - Central de Ajuda',
    meta_description: 'Guia completo para recuperar sua senha do modoPAG. Passo a passo simples e rápido para acessar sua conta novamente.',
    noindex: false,
    reading_time_minutes: 3,
    type: 'artigo',
    view_count: 89,
  },
  {
    id: 'art-3',
    title: 'Quais métodos de pagamento são aceitos?',
    slug: 'metodos-pagamento-aceitos',
    category_id: 'cat-2',
    content: `# Quais métodos de pagamento são aceitos?

O modoPAG aceita diversos métodos de pagamento para sua comodidade.

## Cartões de Crédito
- Visa
- Mastercard
- American Express
- Elo
- Hipercard

## Cartões de Débito
- Visa Débito
- Mastercard Débito
- Elo Débito

## PIX
Pagamento instantâneo disponível 24h por dia, todos os dias da semana.

## Boleto Bancário
Vencimento em até 3 dias úteis após a emissão.

## Carteiras Digitais
- PicPay
- PayPal
- Mercado Pago

## Dinheiro em Conta
Saldo disponível em sua conta modoPAG.

### Taxas e Prazos

| Método | Taxa | Prazo de Compensação |
|--------|------|---------------------|
| PIX | Gratuito | Instantâneo |
| Cartão Crédito | 2,5% | D+1 |
| Cartão Débito | 1,5% | D+1 |
| Boleto | R$ 2,50 | D+3 |

> **Importante:** As taxas podem variar conforme o plano contratado.`,
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: 'Admin',
    meta_title: 'Métodos de pagamento aceitos pelo modoPAG | Central de Ajuda',
    meta_description: 'Conheça todos os métodos de pagamento aceitos pelo modoPAG: cartões, PIX, boleto e carteiras digitais. Taxas e prazos inclusos.',
    noindex: false,
    reading_time_minutes: 4,
    type: 'tutorial',
    view_count: 234,
  },
  {
    id: 'art-4',
    title: 'Como funciona o PIX no modoPAG?',
    slug: 'como-funciona-pix-modopag',
    category_id: 'cat-2',
    content: `# Como funciona o PIX no modoPAG?

O PIX é o método de pagamento mais rápido e prático disponível no modoPAG.

## O que é PIX?

O PIX é o sistema de pagamentos instantâneos criado pelo Banco Central do Brasil. Com ele, você pode fazer transferências e pagamentos 24 horas por dia, 7 dias da semana, incluindo feriados.

## Como usar PIX no modoPAG

### Para fazer um pagamento:

1. **Selecione PIX** como método de pagamento
2. **Escaneie o QR Code** com o app do seu banco
3. **Confirme a transação** no seu celular
4. **Pronto!** O pagamento é processado instantaneamente

### Para receber por PIX:

1. **Cadastre suas chaves PIX** na área de conta
2. **Compartilhe sua chave** com quem vai pagar
3. **Receba instantaneamente** na sua conta modoPAG

## Vantagens do PIX

✅ **Instantâneo**: Pagamentos processados em segundos  
✅ **Gratuito**: Sem taxas para pessoa física  
✅ **Disponível 24/7**: Funciona a qualquer hora  
✅ **Seguro**: Protegido pelo Banco Central  

## Tipos de chave PIX

- **CPF/CNPJ**: Seu documento
- **E-mail**: Endereço de e-mail cadastrado
- **Telefone**: Número de celular
- **Chave aleatória**: Sequência gerada automaticamente

## Limites PIX

| Período | Limite |
|---------|--------|
| Por transação | R$ 20.000 |
| Durante o dia | R$ 20.000 |
| Durante a noite (20h-6h) | R$ 1.000 |

> **Dica:** Os limites podem ser alterados no app do seu banco.`,
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: 'Admin',
    meta_title: 'Como funciona o PIX no modoPAG? Guia completo | Central de Ajuda',
    meta_description: 'Entenda como usar PIX no modoPAG. Guia completo com passo a passo, vantagens, limites e dicas para pagamentos instantâneos.',
    noindex: false,
    reading_time_minutes: 5,
    type: 'tutorial',
    view_count: 178,
  },
  {
    id: 'art-5',
    title: 'App não está funcionando, o que fazer?',
    slug: 'app-nao-funciona-solucoes',
    category_id: 'cat-3',
    content: `# App não está funcionando, o que fazer?

Se o app do modoPAG não está funcionando corretamente, siga estas soluções:

## Soluções Básicas

### 1. Verifique sua conexão
- Teste se a internet está funcionando
- Mude de Wi-Fi para dados móveis (ou vice-versa)
- Reinicie seu roteador se necessário

### 2. Force o fechamento do app
- **Android**: Abra o gerenciador de apps e force o fechamento
- **iOS**: Deslize para cima e remova o app da tela

### 3. Reinicie seu celular
Um simples restart pode resolver muitos problemas temporários.

## Soluções Avançadas

### 4. Atualize o aplicativo
- Vá na loja de aplicativos (Google Play ou App Store)
- Procure por "modoPAG"
- Toque em "Atualizar" se disponível

### 5. Limpe o cache (Android)
1. Vá em Configurações > Apps
2. Encontre o modoPAG
3. Toque em "Armazenamento"
4. Selecione "Limpar Cache"

### 6. Desinstale e reinstale
⚠️ **Atenção**: Certifique-se de lembrar seus dados de login antes de desinstalar.

## Problemas Específicos

### App trava na tela de login
- Verifique se sua senha está correta
- Tente recuperar a senha se necessário
- Limpe os dados do app (Android) ou reinstale (iOS)

### App fica lento
- Feche outros aplicativos em execução
- Verifique se há espaço livre no celular
- Reinicie o dispositivo

### Não consigo fazer pagamentos
- Verifique sua conexão com a internet
- Confirme se os dados do cartão estão corretos
- Tente um método de pagamento diferente

## Ainda não resolveu?

Entre em contato com nosso suporte técnico:

- **Chat ao vivo**: Disponível das 8h às 18h
- **WhatsApp**: (11) 99999-9999
- **E-mail**: suporte@modopag.com.br

Inclua as seguintes informações:
- Modelo do celular
- Versão do sistema operacional
- Versão do app
- Descrição detalhada do problema`,
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: 'Admin',
    meta_title: 'App modoPAG não funciona? Soluções e dicas | Central de Ajuda',
    meta_description: 'Problemas com o app modoPAG? Confira soluções práticas para resolver travamentos, lentidão e outros problemas técnicos.',
    noindex: false,
    reading_time_minutes: 6,
    type: 'tutorial',
    view_count: 67,
  },
  {
    id: 'art-6',
    title: 'Como entrar em contato com o suporte?',
    slug: 'contato-suporte-modopag',
    category_id: 'cat-3',
    content: `# Como entrar em contato com o suporte?

Precisa de ajuda? Temos diversos canais de atendimento para você!

## Canais de Atendimento

### 💬 Chat ao Vivo
**Disponível**: Segunda a sexta, 8h às 18h  
**Como acessar**: Entre no app ou site e clique no ícone de chat  
**Tempo médio de resposta**: 2 minutos  

### 📱 WhatsApp
**Número**: (11) 99999-9999  
**Disponível**: 24 horas por dia  
**Como usar**: Salve o número e mande uma mensagem  

### 📧 E-mail
**Endereço**: suporte@modopag.com.br  
**Tempo de resposta**: Até 24 horas  
**Melhor para**: Dúvidas detalhadas e documentos  

### 📞 Telefone
**Central de Atendimento**: 0800-123-4567  
**Disponível**: Segunda a sexta, 8h às 18h  
**Gratuito**: Para todo o Brasil  

## Antes de Entrar em Contato

Para um atendimento mais rápido, tenha em mãos:

✅ **CPF ou CNPJ** cadastrado na conta  
✅ **E-mail** da conta modoPAG  
✅ **Descrição detalhada** do problema  
✅ **Prints ou fotos** se necessário  

## Tipos de Suporte por Canal

### Chat ao Vivo ⚡
Ideal para:
- Dúvidas rápidas sobre pagamentos
- Problemas com login
- Informações sobre taxas
- Suporte básico do app

### WhatsApp 📱
Ideal para:
- Emergências fora do horário comercial
- Compartilhar prints e documentos
- Seguimento de chamados
- Suporte via áudio/vídeo

### E-mail 📧
Ideal para:
- Solicitações formais
- Envio de documentos
- Problemas complexos
- Denúncias e sugestões

### Telefone 📞
Ideal para:
- Problemas urgentes com dinheiro
- Bloqueio de conta
- Fraudes e segurança
- Atendimento personalizado

## Central de Ajuda Online

Antes de entrar em contato, visite nossa Central de Ajuda:

🔗 **faq.modopag.com.br**

Você pode encontrar respostas para:
- Perguntas frequentes
- Tutoriais passo a passo
- Guias de segurança
- Novidades e atualizações

## Status dos Serviços

Verificar se há problemas conhecidos:

🔗 **status.modopag.com.br**

- Status em tempo real dos serviços
- Manutenções programadas
- Histórico de incidentes

> **Dica**: Nosso chat ao vivo é o canal mais rápido para a maioria das dúvidas!`,
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: 'Admin',
    meta_title: 'Como falar com suporte modoPAG? Todos os canais | Central de Ajuda',
    meta_description: 'Conheça todos os canais para falar com o suporte modoPAG: chat, WhatsApp, e-mail e telefone. Horários e dicas inclusos.',
    noindex: false,
    reading_time_minutes: 4,
    type: 'artigo',
    view_count: 112,
  }
];

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
