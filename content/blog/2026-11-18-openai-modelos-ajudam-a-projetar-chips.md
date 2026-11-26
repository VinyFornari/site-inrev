---
title: "OpenAI diz que seus modelos já ajudam a projetar chips, inclusive GPUs da AMD"
slug: openai-modelos-ajudam-a-projetar-chips
date: "2026-11-18"
summary: "No chip Jalapeño, mudanças propostas pelos modelos reduziram a área em cerca de 13% e 10%. Com a AMD, o ganho chegou a até 14%."
category: "Big Techs"
tags:
  - OpenAI
  - chips
  - AMD
  - hardware
cover: /blog/img/openai-modelos-ajudam-a-projetar-chips.webp
coverAlt: "Sam Altman, CEO da OpenAI, falando em um evento"
coverCredit: "TechCrunch, Wikimedia Commons, CC BY 2.0"
coverCreditUrl: "https://commons.wikimedia.org/wiki/File:Sam_Altman_CropEdit_James_Tamim.jpg"
coverLicense: "CC BY 2.0"
coverLicenseUrl: "https://creativecommons.org/licenses/by/2.0/deed.pt"
sources:
  - name: "OpenAI — Advancing chip design with OpenAI models"
    url: "https://openai.com/index/advancing-chip-design-with-our-models/"
author: "Redação Inrev"
draft: false
---

Em 18 de novembro de 2026, a OpenAI publicou resultados sobre o uso dos seus modelos no projeto de chips, tanto no seu primeiro chip próprio quanto em hardware da AMD.

## No Jalapeño

O Jalapeño é o primeiro chip de inferência da OpenAI, feito com a Broadcom. A empresa diz que começou a usar o GPT-o3 mini no projeto no início de 2025.

- Na unidade vetorial, as mudanças propostas pelos modelos reduziram a área de células padrão em cerca de 13%.
- Na unidade matricial, a redução foi de cerca de 10%.
- Um multiplicador redesenhado usou cerca de 15% menos área e passou de dois ciclos de clock para um.
- As otimizações foram validadas em silício.

## Com a AMD

Em parceria com a AMD, a OpenAI relata ganho de até 14% em potência, desempenho e área (PPA) no projeto da GPU principal da AMD, em comparação com bases já muito otimizadas. O resultado veio em menos de cinco meses, o que a OpenAI descreve como cerca de um ano de progresso.

A AMD já incluiu parte das mudanças em um design enviado à fabricação. Também verificou ganhos de um dígito percentual em blocos da sua próxima CPU principal.

## Ressalvas e próximos passos

Os números são da própria OpenAI, e os 14% são um máximo, não uma média. A empresa também testou os modelos em dois núcleos RISC-V de código aberto e reconhece que o teste precisa de ajustes para representar melhor um projeto de produção.

Com a Synopsys, a OpenAI está treinando o GPT-Synopsys, um modelo para operar ferramentas de automação de projeto eletrônico (EDA) como fazem os projetistas de chips.

O relato completo está no [site da OpenAI](https://openai.com/index/advancing-chip-design-with-our-models/).
