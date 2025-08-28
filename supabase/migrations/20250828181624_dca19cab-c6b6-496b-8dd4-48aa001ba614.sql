-- Adicionar política INSERT para completar a segurança da tabela users
-- Esta política permite que apenas usuários autenticados criem registros para si mesmos

CREATE POLICY "Users can insert their own user record" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK ((id = auth.uid()) AND (auth.uid() IS NOT NULL));

-- Comentário: Esta política garante que usuários só podem criar registros com seu próprio ID