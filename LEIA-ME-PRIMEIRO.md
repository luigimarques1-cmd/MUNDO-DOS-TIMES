# MUNDO DOS TIMES — SITE PRONTO

O site já está personalizado com o nome **MUNDO DOS TIMES**, logo, WhatsApp, Instagram, 4 banners principais rotativos (a cada 5 segundos), 9 banners das ligas, seção **OUTRAS COLEÇÕES** com banner horizontal e 8 coleções, e banner vertical final.

## Publicação no GitHub + Vercel

1. Extraia o ZIP.
2. Envie TODOS os arquivos da pasta para a raiz do repositório do GitHub, mantendo `index.html`, `style.css`, `script.js` e `configuracao.js` juntos.
3. Na Vercel, importe o repositório e escolha **Framework Preset: Other** e sem comando de build.
4. Publicado o site, confira as imagens e os links no celular e computador.

## Personalizar

Edite `configuracao.js`:
- `loja` contém nome, logo, contatos, banners principais, coleções e banner final.
- `ligas` contém as 9 categorias originais, seus banners, clubes, escudos e links.
- A cor de destaque da interface é dourado **#D4AF37**.
- Os escudos e URLs de catálogos dos clubes foram preservados exatamente como na base enviada.

## Observações dos dados recebidos

- **CORTA VENTO (coleção 03):** link de destino atualizado para https://photos.app.goo.gl/3s49Jmcv8XXXQNaX6.
- **MANGA LONGA (coleção 04):** link de destino confirmado para https://photos.app.goo.gl/6y4X1pzGdvKidoYCA.
- **Imagens das coleções:** CORTA VENTO usa a imagem `(2).png` e MANGA LONGA usa a imagem `(3).png`, com links próprios.

As URLs de imagens e catálogos dependem dos serviços externos; não foi possível verificar o carregamento remoto de cada arquivo neste ambiente. Você poderá conferir quando publicar.

## Tamanhos recomendados

- 4 banners principais: **1080 × 1440 px** (3:4)
- Banners das ligas: **1080 × 608 px** (horizontal)
- Banner de Outras Coleções: **1080 × 608 px** (horizontal)
- 8 imagens de Outras Coleções: **1080 × 1080 px** (1:1)
- Banner final: **1080 × 1440 px** (3:4)

No menu lateral, **OUTRAS COLEÇÕES** abre a seção antes do banner final. Cada coleção mostra seu nome em MAIÚSCULAS abaixo da imagem, sem texto adicional. Os banners principais possuem setas e rotação automática. O banner final fica fixo.
