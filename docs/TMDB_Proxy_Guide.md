## Guia: Protegendo o Token da TMDB com Proxy Serverless (Vercel)

Este guia documenta as alterações feitas neste projeto para esconder o token sensível da TMDB (Read Access Token v4) do navegador, usando uma Function serverless na Vercel como proxy. Assim, o front-end não expõe o token, mas segue capaz de consumir a API da TMDB.

### Por que isso é necessário?
Em apps Vite, variáveis que começam com `VITE_` ficam disponíveis no navegador. Tokens sensíveis (como o Bearer v4 da TMDB) não devem ser expostos em produção. Por isso criamos um endpoint backend (serverless) que injeta o header `Authorization` no servidor e chama a TMDB em nome do cliente.

---

## O que foi alterado no código

1) Criado o arquivo `api/tmdb.js` (proxy serverless da TMDB)

```startLine:endLine:api/tmdb.js
/* eslint-env node */
/* global process */
export default async function handler(req, res) {
  try {
    const { path = "/discover/movie", search = "" } = req.query || {};

    const url = `https://api.themoviedb.org/3${path}${search ? `?${search}` : ""}`;

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        // TMDB_BEARER é lido do ambiente do servidor (Vercel)
        Authorization: `Bearer ${typeof process !== 'undefined' && process.env ? process.env.TMDB_BEARER : ''}`,
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ message: "TMDB proxy error", error: String(err) });
  }
}
```

2) Atualizado `src/App.jsx` para usar o proxy com fallback local

- Foi adicionada a função `buildTmdbRequest(query)` que decide:
  - Se existe `VITE_TMDB_API_KEY` (ambiente local), chama a TMDB diretamente com header `Authorization: Bearer ...`.
  - Se NÃO existe (produção segura), usa o proxy `/api/tmdb`.

Trecho relevante:

```startLine:endLine:src/App.jsx
const TMDB_TOKEN = import.meta.env.VITE_TMDB_API_KEY

function buildTmdbRequest(query) {
  if (TMDB_TOKEN) {
    const endpoint = query
      ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`
      : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc`
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_TOKEN}`
      }
    }
    return { endpoint, options }
  }
  // Sem token no client: usar proxy serverless
  const endpoint = query
    ? `/api/tmdb?path=/search/movie&search=query=${encodeURIComponent(query)}`
    : `/api/tmdb?path=/discover/movie&search=sort_by=popularity.desc`
  return { endpoint, options: {} }
}
```

> Observação: Todo o restante do componente (debounce, Appwrite trending, render) se mantém.

---

## Como configurar no Vercel (Produção)

1) Variável de ambiente segura (no servidor)
- Vercel Dashboard → Project → Settings → Environment Variables → Add
- Nome: `TMDB_BEARER`
- Valor: seu `API Read Access Token (v4)` da TMDB (o token longo que começa com `ey...`)
- Ambientes: Production e Preview
- Salve

2) Redeploy
- Faça o redeploy do projeto para que o build use as novas variáveis.

3) Appwrite CORS (se necessário)
- No painel do Appwrite, inclua o domínio do seu site da Vercel como origem permitida (ex.: `https://seuapp.vercel.app`).
- Allowed Methods: GET, POST, PATCH (conforme uso)
- Allowed Headers: `Content-Type`, `Authorization`
- Garanta que o `VITE_APPWRITE_ENDPOINT` é público (não `localhost`).

---

## Como usar em Desenvolvimento (Local)

Opção A (simples): usar `.env` local com `VITE_TMDB_API_KEY`
- Crie/edite `.env` na raiz:

```env
VITE_TMDB_API_KEY=SEU_TOKEN_V4_TMBD
```

- Rode o projeto (`npm run dev`). O front chamará a TMDB diretamente.

Opção B (mais próximo da produção): usar o proxy local
- Instale a CLI da Vercel e rode `vercel dev` para simular as functions.
- Defina `TMDB_BEARER` no ambiente local do `vercel dev` (Vercel CLI pergunta/env file).
- Remova `VITE_TMDB_API_KEY` do `.env` local para garantir que o front usa o proxy.

---

## Riscos e Boas Práticas

- Nunca exponha `TMDB_BEARER` em variáveis que começam com `VITE_` em produção.
- Deixe `TMDB_BEARER` apenas no servidor (Vercel Environment Variables sem prefixo `VITE_`).
- Se mantiver `VITE_TMDB_API_KEY` local, entenda que ficará visível no navegador (ok para dev, não para prod).

---

## Solução de Problemas

- 401/403 ao chamar TMDB via proxy:
  - Verifique se `TMDB_BEARER` está setado na Vercel e o redeploy foi feito.
  - Confira se a Function está sendo chamada (`/api/tmdb`) no Network tab do navegador.

- CORS/Permissões Appwrite:
  - Inclua o domínio da Vercel em CORS no Appwrite.
  - Revise permissões da Collection (read/write conforme necessário).

- Variável `VITE_TMDB_API_KEY` sendo alertada como pública na Vercel:
  - É esperado. Remova-a em produção e use apenas o proxy com `TMDB_BEARER`.

---

## Referências úteis

- Vercel Serverless Functions: https://vercel.com/docs/functions/serverless-functions
- Variáveis de Ambiente Vercel: https://vercel.com/docs/projects/environment-variables
- Vite Env Vars: https://vitejs.dev/guide/env-and-mode.html


