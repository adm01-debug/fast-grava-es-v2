import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { supportedLanguages } from '@/i18n';
import { cn } from '@/lib/utils';

export const LanguageSwitcher = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function LanguageSwitcher(props, ref) {
  const { i18n, t } = useTranslation();

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t('common.changeLanguage', 'Alterar idioma')} className="gap-2 h-9 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{currentLanguage.code.split('-')[0]}</span>
          <span className="ml-1 text-base leading-none">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 glass-card border-primary/20">
        <div className="px-2 py-1.5 mb-2 border-b border-border/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('common.language', 'Idioma')}</p>
        </div>
        {supportedLanguages.map((language) => {
          const isActive = i18n.language === language.code;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 mb-1 last:mb-0",
                isActive ? "bg-primary/20 text-primary font-bold" : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">{language.flag}</span>
                <span className="text-xs uppercase font-bold tracking-wide">{language.name}</span>
              </div>
              {isActive && <Check className="h-3.5 w-3.5 animate-in zoom-in-50 duration-300" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
