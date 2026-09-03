# IA NAI — versão completa

## O que este projeto faz
- Interface responsiva para celular.
- Upload de foto da redação.
- Envia a imagem ao backend.
- Backend usa a OpenAI Responses API com entrada de imagem.
- A IA transcreve a redação e corrige as 5 competências do ENEM.
- Mostra nota 0–1000, justificativas e melhorias de acentuação, ortografia, pontuação, concordância, regência, conectivos e vocabulário.
- Sugere alternativas apenas quando fizer sentido.

## Rodar no computador ou em uma hospedagem Node
1. Instale Node.js.
2. Copie `.env.example` para `.env`.
3. Coloque sua chave:
   OPENAI_API_KEY=sua_chave
4. Instale:
   npm install
5. Rode:
   npm start
6. Abra:
   http://localhost:3000

## Segurança
Nunca coloque a chave no `public/app.js` ou em HTML. O `.env` deve permanecer privado e está no `.gitignore`.

A documentação oficial da OpenAI confirma que a Responses API aceita imagem como `input_image` e que a chave deve ser mantida em variável de ambiente.
