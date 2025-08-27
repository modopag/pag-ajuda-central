import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Settings, Globe, Phone, MessageSquare, Database, AlertTriangle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDataAdapter } from "@/lib/data-adapter";
import { AssetUploader } from "@/components/admin/AssetUploader";
import { DataManager } from "@/components/admin/DataManager";
import EmailTestPanel from '@/components/admin/EmailTestPanel';
import type { Setting, GlobalSEOSettings, HelpQuickSettings, ReclameAquiSettings, BrandSettings } from "@/types/admin";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoSettings, setSeoSettings] = useState<GlobalSEOSettings>({
    default_title: "",
    default_meta_description: "",
    default_og_image: "",
    robots_txt: "",
    site_url: "https://ajuda.modopag.com.br/",
    google_analytics_id: "",
  });
  const [helpSettings, setHelpSettings] = useState<HelpQuickSettings>({
    phone: "",
    whatsapp_url: "",
    email: "",
    is_active: true,
  });
  const [reclameSettings, setReclameSettings] = useState<ReclameAquiSettings>({
    cards: []
  });
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    logo_black_url: "",
    logo_yellow_url: "",
    logo_icon_url: "",
    favicon_url: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const adapter = await getDataAdapter();
      const settings = await adapter.getAllSettings();
      
      settings.forEach((setting) => {
        const value = setting.type === 'json' ? JSON.parse(setting.value) : setting.value;
        
        switch (setting.key) {
          case 'global_seo':
            setSeoSettings(value);
            break;
          case 'help_quick':
            setHelpSettings(value);
            break;
          case 'reclame_aqui':
            setReclameSettings(value);
            break;
          case 'brand':
            setBrandSettings(value);
            break;
        }
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any, type: Setting['type'] = 'json') => {
    setSaving(true);
    try {
      const adapter = await getDataAdapter();
      await adapter.updateSetting(key, JSON.stringify(value), type);
      toast({ 
        title: "Sucesso", 
        description: "Configurações salvas com sucesso!" 
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addReclameCard = () => {
    setReclameSettings({
      cards: [
        ...reclameSettings.cards,
        { title: "", description: "", link_url: "", is_active: true }
      ]
    });
  };

  const updateReclameCard = (index: number, field: string, value: any) => {
    const newCards = [...reclameSettings.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setReclameSettings({ cards: newCards });
  };

  const removeReclameCard = (index: number) => {
    setReclameSettings({
      cards: reclameSettings.cards.filter((_, i) => i !== index)
    });
  };

  // Update favicon in index.html
  const updateFavicon = async (faviconUrl: string) => {
    if (!faviconUrl) return;
    
    try {
      // In a real implementation, this would update the actual index.html file
      // For demo purposes, we'll just update the current page's favicon
      const existingLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (existingLink) {
        existingLink.href = faviconUrl;
      }
      
      // Also update apple-touch-icon
      const appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleLink) {
        appleLink.href = faviconUrl;
      }
      
      toast({
        title: 'Favicon atualizado',
        description: 'O favicon foi atualizado com sucesso!'
      });
    } catch (error) {
      toast({
        title: 'Erro no favicon',
        description: 'Não foi possível atualizar o favicon.',
        variant: 'destructive'
      });
    }
  };

  const validateSiteUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configure as opções globais do sistema</p>
      </div>

      <Tabs defaultValue="seo" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Ajuda Rápida
          </TabsTrigger>
          <TabsTrigger value="reclame" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Reclame Aqui
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de SEO</CardTitle>
              <CardDescription>
                Configure os padrões de SEO para todo o site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site_url">URL do Site *</Label>
                <Input
                  id="site_url"
                  value={seoSettings.site_url}
                  onChange={(e) => setSeoSettings({...seoSettings, site_url: e.target.value})}
                  placeholder="https://ajuda.modopag.com.br/"
                  className={!validateSiteUrl(seoSettings.site_url) ? 'border-red-500' : ''}
                />
                {!validateSiteUrl(seoSettings.site_url) && (
                  <p className="text-xs text-red-600 mt-1">URL inválida. Use formato: https://exemplo.com/</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Usado para URLs canônicas, sitemap e Open Graph
                </p>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="default_title">Título Padrão</Label>
                <Input
                  id="default_title"
                  value={seoSettings.default_title}
                  onChange={(e) => setSeoSettings({...seoSettings, default_title: e.target.value})}
                  placeholder="ModoPag - Central de Ajuda"
                />
              </div>
              <div>
                <Label htmlFor="default_meta_description">Meta Description Padrão</Label>
                <Textarea
                  id="default_meta_description"
                  value={seoSettings.default_meta_description}
                  onChange={(e) => setSeoSettings({...seoSettings, default_meta_description: e.target.value})}
                  placeholder="Encontre respostas rápidas para suas dúvidas sobre o ModoPag"
                />
                <p className="text-xs text-muted-foreground">
                  {seoSettings.default_meta_description.length}/160 caracteres
                </p>
              </div>
              
              <div>
                <Label>Imagem OG Padrão</Label>
                <AssetUploader
                  label="Upload de OG Image"
                  accept="image/*"
                  maxSize={2}
                  currentAsset={seoSettings.default_og_image}
                  onUpload={(url) => setSeoSettings({...seoSettings, default_og_image: url})}
                  onRemove={() => setSeoSettings({...seoSettings, default_og_image: ''})}
                  description="Imagem usada nas redes sociais (recomendado: 1200x630px)"
                  compress={true}
                />
              </div>
              
              <div>
                <Label htmlFor="robots_txt">Robots.txt</Label>
                <Textarea
                  id="robots_txt"
                  value={seoSettings.robots_txt}
                  onChange={(e) => setSeoSettings({...seoSettings, robots_txt: e.target.value})}
                  placeholder="User-agent: *&#10;Allow: /"
                  rows={6}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="google_analytics_id">Google Analytics Measurement ID</Label>
                <Input
                  id="google_analytics_id"
                  value={seoSettings.google_analytics_id || ""}
                  onChange={(e) => setSeoSettings({...seoSettings, google_analytics_id: e.target.value})}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o Measurement ID do Google Analytics 4. Exemplo: G-NSK1S3D9Z4. 
                  Deixe vazio para não carregar o GA4.
                </p>
              </div>
              
              <Button 
                onClick={() => saveSetting('global_seo', seoSettings)} 
                disabled={saving || !validateSiteUrl(seoSettings.site_url)}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar SEO"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ajuda Rápida</CardTitle>
              <CardDescription>
                Configure os canais de atendimento exibidos no site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={helpSettings.is_active}
                  onCheckedChange={(checked) => setHelpSettings({...helpSettings, is_active: checked})}
                />
                <Label>Exibir seção de ajuda rápida</Label>
              </div>
              <Separator />
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={helpSettings.phone || ""}
                  onChange={(e) => setHelpSettings({...helpSettings, phone: e.target.value})}
                  placeholder="(11) 9999-9999"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp_url">URL do WhatsApp</Label>
                <Input
                  id="whatsapp_url"
                  value={helpSettings.whatsapp_url || ""}
                  onChange={(e) => setHelpSettings({...helpSettings, whatsapp_url: e.target.value})}
                  placeholder="https://wa.me/5511999999999"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={helpSettings.email || ""}
                  onChange={(e) => setHelpSettings({...helpSettings, email: e.target.value})}
                  placeholder="contato@modopag.com.br"
                />
              </div>
              <Button onClick={() => saveSetting('help_quick', helpSettings)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Ajuda"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reclame" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reclame Aqui</CardTitle>
              <CardDescription>
                Configure os cards da seção Reclame Aqui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reclameSettings.cards.map((card, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Card {index + 1}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeReclameCard(index)}
                      >
                        Remover
                      </Button>
                    </div>
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={card.title}
                        onChange={(e) => updateReclameCard(index, 'title', e.target.value)}
                        placeholder="Título do card"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={card.description}
                        onChange={(e) => updateReclameCard(index, 'description', e.target.value)}
                        placeholder="Descrição do card"
                      />
                    </div>
                    <div>
                      <Label>URL do Link</Label>
                      <Input
                        value={card.link_url}
                        onChange={(e) => updateReclameCard(index, 'link_url', e.target.value)}
                        placeholder="https://exemplo.com"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={card.is_active}
                        onCheckedChange={(checked) => updateReclameCard(index, 'is_active', checked)}
                      />
                      <Label>Ativo</Label>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="flex space-x-2">
                <Button variant="outline" onClick={addReclameCard}>
                  Adicionar Card
                </Button>
                <Button onClick={() => saveSetting('reclame_aqui', reclameSettings)} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Reclame Aqui"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Uploads */}
            <div className="space-y-4">
              <AssetUploader
                label="Logo Preta"
                accept="image/*"
                maxSize={2}
                currentAsset={brandSettings.logo_black_url}
                onUpload={(url) => setBrandSettings({...brandSettings, logo_black_url: url})}
                onRemove={() => setBrandSettings({...brandSettings, logo_black_url: ''})}
                description="Logo para fundos claros (SVG ou PNG recomendado)"
                compress={false}
              />

              <AssetUploader
                label="Logo Amarela"
                accept="image/*"
                maxSize={2}
                currentAsset={brandSettings.logo_yellow_url}
                onUpload={(url) => setBrandSettings({...brandSettings, logo_yellow_url: url})}
                onRemove={() => setBrandSettings({...brandSettings, logo_yellow_url: ''})}
                description="Logo para fundos escuros (SVG ou PNG recomendado)"
                compress={false}
              />
            </div>

            {/* Icon and Favicon */}
            <div className="space-y-4">
              <AssetUploader
                label="Ícone da Logo"
                accept="image/*"
                maxSize={1}
                currentAsset={brandSettings.logo_icon_url}
                onUpload={(url) => setBrandSettings({...brandSettings, logo_icon_url: url})}
                onRemove={() => setBrandSettings({...brandSettings, logo_icon_url: ''})}
                description="Versão em ícone da logo (quadrada, 256x256px recomendado)"
                compress={true}
              />

              <AssetUploader
                label="Favicon"
                accept="image/png,image/jpg,image/jpeg"
                maxSize={1}
                currentAsset={brandSettings.favicon_url}
                onUpload={(url) => {
                  setBrandSettings({...brandSettings, favicon_url: url});
                  updateFavicon(url);
                }}
                onRemove={() => setBrandSettings({...brandSettings, favicon_url: ''})}
                description="Ícone do site (PNG/JPG, 32x32px ou 16x16px)"
                compress={true}
              />

              {brandSettings.favicon_url && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Lovable não suporta favicons .ico. Use PNG/JPG.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button onClick={() => saveSetting('brand', brandSettings)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Configurações da Marca"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <DataManager 
            onSitemapUpdate={() => {
              toast({
                title: 'Sitemap atualizado',
                description: 'O sitemap foi reconstruído com sucesso!'
              });
            }}
          />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <EmailTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}