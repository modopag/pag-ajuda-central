-- Função para limpar e gerar slug básico
CREATE OR REPLACE FUNCTION public.generate_base_slug(title_text TEXT)
RETURNS TEXT AS $$
DECLARE
    slug_text TEXT;
    stop_words TEXT[] := ARRAY[
        'a', 'o', 'e', 'da', 'de', 'do', 'das', 'dos', 'em', 'para', 'com', 'que', 'na', 'no', 'nas', 'nos',
        'um', 'uma', 'uns', 'umas', 'se', 'por', 'ao', 'aos', 'ou', 'mas', 'como', 'quando', 'onde', 'pela',
        'pelo', 'pelas', 'pelos', 'sua', 'seu', 'suas', 'seus', 'esta', 'este', 'estas', 'estes', 'essa',
        'esse', 'essas', 'esses', 'aquela', 'aquele', 'aquelas', 'aqueles', 'the', 'and', 'or', 'of', 'in',
        'to', 'for', 'with', 'at', 'by', 'from', 'on', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'have',
        'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must'
    ];
    word TEXT;
    words TEXT[];
    clean_words TEXT[] := '{}';
BEGIN
    -- Converter para minúsculo e normalizar
    slug_text := lower(title_text);
    
    -- Remover acentos
    slug_text := unaccent(slug_text);
    
    -- Remover caracteres especiais exceto espaços e hífens
    slug_text := regexp_replace(slug_text, '[^a-z0-9\s\-]', '', 'g');
    
    -- Converter espaços múltiplos em espaço único
    slug_text := regexp_replace(slug_text, '\s+', ' ', 'g');
    
    -- Trim espaços das extremidades
    slug_text := trim(slug_text);
    
    -- Dividir em palavras
    words := string_to_array(slug_text, ' ');
    
    -- Filtrar stop-words
    FOREACH word IN ARRAY words
    LOOP
        word := trim(word);
        -- Manter palavras que não são stop-words e têm pelo menos 2 caracteres
        IF word != '' AND array_length(array(SELECT 1 WHERE word = ANY(stop_words)), 1) IS NULL AND length(word) >= 2 THEN
            clean_words := array_append(clean_words, word);
        END IF;
    END LOOP;
    
    -- Se não restou nenhuma palavra, usar as primeiras 3 palavras originais
    IF array_length(clean_words, 1) IS NULL OR array_length(clean_words, 1) = 0 THEN
        clean_words := words[1:3];
    END IF;
    
    -- Juntar com hífens
    slug_text := array_to_string(clean_words, '-');
    
    -- Remover hífens múltiplos
    slug_text := regexp_replace(slug_text, '-+', '-', 'g');
    
    -- Remover hífens das extremidades
    slug_text := trim(slug_text, '-');
    
    -- Garantir que não está vazio
    IF slug_text = '' OR slug_text IS NULL THEN
        slug_text := 'artigo';
    END IF;
    
    -- Limitar tamanho máximo
    IF length(slug_text) > 80 THEN
        slug_text := left(slug_text, 80);
        -- Garantir que não termina com hífen após o corte
        slug_text := regexp_replace(slug_text, '-+$', '');
    END IF;
    
    RETURN slug_text;
END;
$$ LANGUAGE plpgsql;

-- Função para garantir slug único por categoria
CREATE OR REPLACE FUNCTION public.generate_unique_slug(title_text TEXT, category_id_param UUID, article_id_param UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
    slug_exists BOOLEAN;
BEGIN
    -- Gerar slug base
    base_slug := generate_base_slug(title_text);
    final_slug := base_slug;
    
    -- Verificar se slug já existe na mesma categoria (excluindo o próprio artigo se estiver editando)
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM articles 
            WHERE slug = final_slug 
            AND category_id = category_id_param
            AND (article_id_param IS NULL OR id != article_id_param)
        ) INTO slug_exists;
        
        -- Se não existe, usar esse slug
        IF NOT slug_exists THEN
            EXIT;
        END IF;
        
        -- Incrementar contador e tentar novamente
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
        
        -- Proteção contra loop infinito
        IF counter > 100 THEN
            final_slug := base_slug || '-' || extract(epoch from now())::integer;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Função trigger para auto-gerar slug
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Gerar slug automaticamente se título foi alterado ou é um novo registro
    IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR 
       (TG_OP = 'UPDATE' AND OLD.title != NEW.title) OR
       (TG_OP = 'UPDATE' AND NEW.slug IS NULL) THEN
        
        NEW.slug := generate_unique_slug(NEW.title, NEW.category_id, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para auto-gerar slug
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON articles;
CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

-- Instalar extensão unaccent se não existir (para remover acentos)
CREATE EXTENSION IF NOT EXISTS unaccent;