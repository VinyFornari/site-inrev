# Inrev — site-inrev

Site da Inrev Control & Management. A home, o blog, o sitemap, o RSS, o `robots.txt`, a página 404 e as políticas de privacidade e cookies são gerados na hora do deploy. O código da home fica em `src/` (JSX, CSS e fontes). Nada disso entra no ar: o build publica só o HTML e os assets.

## Build

A Cloudflare Pages deve usar:

- Comando de build: `npm ci && npm run build`
- Diretório de saída: raiz do repositório (`/`)
- Branch de produção: `main`

`npm run build` gera a home (`scripts/build-home.mjs`) e depois o blog (`scripts/build-blog.mjs`).

`esbuild`, `react`, `react-dom`, `marked` e `gray-matter` estão em `dependencies` porque a Pages define `NODE_ENV=production`, e nesse modo o `npm ci` não instala `devDependencies`. O React publicado é o UMD de produção 18.3.1, o mesmo da home anterior. O Node é 22 (`.node-version`).

O build é idempotente. Ele regrava a saída gerada e não altera `blog/img/`. Nada gerado entra no Git (veja `.gitignore`).

Na Cloudflare Pages (`CF_PAGES=1`), o mesmo build apaga da saída os arquivos que não são o site (`package.json`, `README.md`, `scripts/`, `content/`, `src/`, `node_modules` e afins). A Pages não aceita um `_redirects` com status 404, e um arquivo presente na raiz seria público. Sem o arquivo, o endereço responde 404. O `index.html`, o `app.[hash].js`, o React e as fontes com hash permanecem.

## Redirect do apex

O `_redirects` da Pages não redireciona por host (a documentação lista "Domain-level redirects" como sem suporte). O apex continua no ar até esta regra existir no domínio `inrev.com.br`, em **Rules → Redirect Rules → Create rule**:

- Nome: `Apex para www`
- Se: Custom filter expression `http.host eq "inrev.com.br"`
- Então: Dynamic redirect, expressão `concat("https://www.inrev.com.br", http.request.uri.path)`, código **301**, **Preserve query string** ligado

`http://inrev.com.br/caminho?x=1` já sobe para `https://` pelo Always Use HTTPS e, com a regra, segue para `https://www.inrev.com.br/caminho?x=1`. A expressão não casa com `www`, então não há loop.

## Como publicar uma notícia

1. Crie `content/blog/AAAA-MM-DD-slug.md`. O nome do arquivo tem de ser a data e o `slug` do front-matter.
2. Preencha o front-matter:
   - `title`, `slug`, `date` (`AAAA-MM-DD`, fuso de referência America/Sao_Paulo)
   - `summary` com no máximo 160 caracteres
   - `category`, uma destas: Modelos & Lançamentos, Big Techs, Agentes & Automação, Regulação & Ética, Negócios & PME, Ferramentas, Brasil
   - `tags` (lista), `cover` (`/blog/img/<slug>.webp`), `coverAlt`, `coverCredit`
   - `sources` com `name` e `url`
   - `author` (se omitir, fica "Redação Inrev")
   - `instagramUrl` e `linkedinUrl` se o tema também saiu nas redes
   - `draft: true` deixa o texto de fora do build
3. No corpo, escreva o texto original e uma seção `## O que isso muda para a sua empresa`. Ela vira o box da página. Cite a fonte e use só trechos curtos.
4. Coloque as imagens em `blog/img/`, cada uma com menos de 250 KB:
   - capa 1600×900 em WebP, usada na página: `blog/img/<slug>.webp`
   - Open Graph 1200×630 em JPEG, para `og:image` e Twitter: `blog/img/<slug>-og.jpg`
   - Foto de terceiros só com licença e crédito.
5. Abra um pull request para `main`. A Cloudflare Pages publica um preview (em geral `https://<branch>.site-inrev.pages.dev`; a barra da branch vira hífen). Confira `/blog/`, o artigo e a categoria.
6. No merge, o deploy de produção leva cerca de um minuto. Não faça commit do HTML gerado.

Para ver localmente: `npm ci && npm run build` e sirva a raiz do repositório.
