import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Settings, Globe, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDataAdapter } from "@/lib/data-adapter";
import type { Setting, GlobalSEOSettings, HelpQuickSettings, ReclameAquiSettings, BrandSettings } from "@/types/admin";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoSettings, setSeoSettings] = useState<GlobalSEOSettings>({
    default_title: "",
    default_meta_description: "",
    default_og_image: "",
    robots_txt: "",
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
        <TabsList className="grid w-full grid-cols-4">
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
              </div>
              <div>
                <Label htmlFor="default_og_image">Imagem OG Padrão (URL)</Label>
                <Input
                  id="default_og_image"
                  value={seoSettings.default_og_image}
                  onChange={(e) => setSeoSettings({...seoSettings, default_og_image: e.target.value})}
                  placeholder="https://exemplo.com/og-image.jpg"
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
              <Button onClick={() => saveSetting('global_seo', seoSettings)} disabled={saving}>
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
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Marca</CardTitle>
              <CardDescription>
                Configure logos e elementos visuais da marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo_black_url">Logo Preta (URL)</Label>
                <Input
                  id="logo_black_url"
                  value={brandSettings.logo_black_url || ""}
                  onChange={(e) => setBrandSettings({...brandSettings, logo_black_url: e.target.value})}
                  placeholder="https://exemplo.com/logo-black.svg"
                />
              </div>
              <div>
                <Label htmlFor="logo_yellow_url">Logo Amarela (URL)</Label>
                <Input
                  id="logo_yellow_url"
                  value={brandSettings.logo_yellow_url || ""}
                  onChange={(e) => setBrandSettings({...brandSettings, logo_yellow_url: e.target.value})}
                  placeholder="https://exemplo.com/logo-yellow.svg"
                />
              </div>
              <div>
                <Label htmlFor="logo_icon_url">Ícone da Logo (URL)</Label>
                <Input
                  id="logo_icon_url"
                  value={brandSettings.logo_icon_url || ""}
                  onChange={(e) => setBrandSettings({...brandSettings, logo_icon_url: e.target.value})}
                  placeholder="https://exemplo.com/icon.svg"
                />
              </div>
              <div>
                <Label htmlFor="favicon_url">Favicon (URL)</Label>
                <Input
                  id="favicon_url"
                  value={brandSettings.favicon_url || ""}
                  onChange={(e) => setBrandSettings({...brandSettings, favicon_url: e.target.value})}
                  placeholder="https://exemplo.com/favicon.ico"
                />
              </div>
              <Button onClick={() => saveSetting('brand', brandSettings)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Marca"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}