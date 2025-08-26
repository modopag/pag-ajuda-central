import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';
import { Shield, BarChart3, Target, X } from 'lucide-react';

export const CookiePreferencesModal = () => {
  const {
    showPreferences,
    preferences: currentPreferences,
    savePreferences,
    setShowPreferences,
    isDNTEnabled,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState<CookiePreferences>(currentPreferences);

  // Update local state when current preferences change
  useEffect(() => {
    setPreferences(currentPreferences);
  }, [currentPreferences]);

  const handleSave = () => {
    savePreferences(preferences);
  };

  const handleClose = () => {
    setShowPreferences(false);
    // Reset to current preferences if user closes without saving
    setPreferences(currentPreferences);
  };

  const cookieCategories = [
    {
      id: 'necessary',
      title: 'Cookies Necessários',
      description: 'Essenciais para o funcionamento básico do site. Não podem ser desabilitados.',
      icon: Shield,
      required: true,
      examples: 'Autenticação, segurança, navegação básica',
    },
    {
      id: 'analytics',
      title: 'Cookies Analíticos',
      description: 'Nos ajudam a entender como você usa o site para melhorar a experiência.',
      icon: BarChart3,
      required: false,
      examples: 'Google Analytics, métricas de performance, estatísticas de uso',
    },
    {
      id: 'marketing',
      title: 'Cookies de Marketing',
      description: 'Utilizados para personalizar anúncios e medir a eficácia de campanhas.',
      icon: Target,
      required: false,
      examples: 'Publicidade direcionada, rastreamento de conversões (reservado para uso futuro)',
    },
  ];

  return (
    <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Preferências de Cookies
          </DialogTitle>
          <DialogDescription>
            Escolha quais tipos de cookies você deseja permitir. Você pode alterar essas 
            preferências a qualquer momento.
          </DialogDescription>
        </DialogHeader>

        {isDNTEnabled && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ <strong>Não Rastrear Ativado:</strong> Detectamos que você tem a configuração 
              "Não Rastrear" ativada em seu navegador. Mesmo se você permitir cookies analíticos 
              ou de marketing, respeitaremos sua preferência e não coletaremos esses dados.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {cookieCategories.map((category) => {
            const Icon = category.icon;
            const isEnabled = preferences[category.id as keyof CookiePreferences];
            
            return (
              <Card key={category.id} className="transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-base">{category.title}</CardTitle>
                        {category.required && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Obrigatório
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={category.id}
                        checked={isEnabled}
                        onCheckedChange={(checked) => {
                          if (!category.required) {
                            setPreferences(prev => ({
                              ...prev,
                              [category.id]: checked
                            }));
                          }
                        }}
                        disabled={category.required}
                        aria-describedby={`${category.id}-description`}
                      />
                      <Label htmlFor={category.id} className="sr-only">
                        {category.title}
                      </Label>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription id={`${category.id}-description`} className="mb-2">
                    {category.description}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground">
                    <strong>Exemplos:</strong> {category.examples}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <h4 className="font-medium mb-2">Sobre seus direitos</h4>
          <p className="text-sm text-muted-foreground">
            Você pode alterar essas preferências a qualquer momento através do botão 
            "Gerenciar Cookies" no rodapé do site. Seus dados são processados de acordo 
            com nossa Política de Privacidade e a LGPD.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Salvar Preferências
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};