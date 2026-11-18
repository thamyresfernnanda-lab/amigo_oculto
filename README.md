# Segredo do Amigo Oculto

Aplicação estática gratuita, pronta para publicar na Vercel. Não utiliza banco de dados, credenciais ou APIs externas.

## Executar localmente

```powershell
npm start
```

Abra [http://localhost:3000](http://localhost:3000).

## Publicar na Vercel

1. Suba este repositório para o GitHub.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Mantenha as configurações detectadas e clique em **Deploy**.

Não há variáveis de ambiente nem serviços para configurar. A Vercel publicará os arquivos estáticos e os links funcionarão no celular de qualquer participante.

## Privacidade

Cada resultado é criptografado no navegador com AES-GCM antes de gerar o link. O link inclui uma chave aleatória de 256 bits no fragmento (`#`), que não é enviada ao servidor. Sem o link exato, não é viável descobrir outro resultado. Trate cada link como uma senha: quem o possuir conseguirá abrir o resultado correspondente.

O WhatsApp é aberto somente após o clique do organizador e nunca recebe dados por API.
