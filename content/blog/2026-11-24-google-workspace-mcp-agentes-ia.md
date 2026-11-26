---
title: "Google Workspace passa a exigir MCP para agentes de IA"
slug: google-workspace-mcp-agentes-ia
date: "2026-11-24"
summary: "MCP e a CLI do Google Workspace estão em disponibilidade geral. Em fevereiro de 2027, agentes de IA terão de acessar os dados via MCP."
category: "Agentes & Automação"
tags:
  - Google Workspace
  - MCP
  - agentes de IA
  - Gmail
cover: /blog/img/google-workspace-mcp-agentes-ia.webp
coverAlt: "Placa do Google na Charleston Road, em Mountain View, Califórnia"
coverCredit: "Dietmar Rabich, Wikimedia Commons, CC BY-SA 4.0"
coverCreditUrl: "https://commons.wikimedia.org/wiki/File:Mountain_View_(CA,_USA),_Charleston_Road,_Google-Schild_--_2022_--_2896.jpg"
coverLicense: "CC BY-SA 4.0"
coverLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt"
sources:
  - name: "Google Workspace Updates — MCP servers, CLI e faixas de uso"
    url: "https://workspaceupdates.googleblog.com/2026/11/mcp-servers-cli-standardized-usage-tiers-now-available.html"
  - name: "Google for Developers — faixas de uso e cotas das APIs e dos servidores MCP"
    url: "https://developers.google.com/workspace/guides/quota-usage-tiers"
author: "Redação Inrev"
instagramUrl: "https://www.instagram.com/p/DgMBgOBEcGi/"
linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7531543171068227584"
draft: false
---

Em 24 de novembro de 2026, o Google colocou em disponibilidade geral os servidores MCP do Workspace e a CLI oficial. Com eles vêm faixas de uso padronizadas e controles novos para o administrador. Agentes de IA que leem Gmail, Drive e Agenda deixam de ter a API REST como caminho principal.

## Dois caminhos oficiais

O Model Context Protocol (MCP) é um padrão aberto: o agente descobre ferramentas e pede ações sem a empresa escrever uma integração para cada fluxo. O Google passou a hospedar servidores para Gmail, Drive, Docs, Planilhas, Apresentações, Agenda, Chat e Tasks. A CLI leva essas ferramentas ao terminal, a máquinas virtuais e a ambientes isolados, com login por escopo.

Os dois caminhos são do Google e feitos para agente. As ferramentas devolvem um resumo dentro do Workspace, com confirmação da pessoa, auditoria e controle do admin.

## 1º de fevereiro de 2027

A exigência técnica começa nessa data. Um agente de IA precisa usar MCP para obter dados do Workspace, em vez de chamar a API REST diretamente. Quem continuar na REST fica no teto do tier Standard, mesmo que o projeto esteja em outra faixa. Cota maior para uso agêntico pede MCP no tier Scaled. Cota de servidor MCP não entra na exceção de uso interno.

No mesmo dia passa a valer o Workspace AI Tools Addendum, que restringe guardar por muito tempo certos dados tirados das APIs e usar agente para varrer essas APIs.

## Standard não cobra. Scaled, a partir de abril, cobra.

O modelo de faixas, anunciado em maio, estreou com esta nota em Gmail, Agenda e Drive, nas APIs e nos servidores MCP.

No tier Standard não há custo e não é preciso conta de faturamento. Nos servidores MCP em disponibilidade geral, o teto é de 5.000 requisições por dia, por projeto e por produto, além dos limites por minuto. Algumas ferramentas contam como mais de uma requisição, porque disparam várias chamadas. Acima da cota, o serviço segura os pedidos até a janela renovar: limita, não cobra. O Google afirma que mais de 99% dos desenvolvedores ativos já cabem no Standard.

O tier Scaled atende volume maior. Vale para o projeto inteiro, exige conta de faturamento ativa e, para subir a cota, um pedido de aumento. A cobrança começa em 1º de abril de 2027. Nas APIs REST, só depois de uma franquia diária sem custo. Nos servidores MCP de Gmail, Agenda e Drive, a documentação não prevê essa franquia: a cobrança vale desde a primeira requisição bem-sucedida. Quem não entrar no Scaled não recebe fatura. Em abril, o projeto que estava acima do limite padrão volta ao teto do Standard, sem custo adicional.

## O admin continua no comando

O anúncio estende ao agente controles que a empresa já usa no Workspace:

- Aprovação humana para ação sensível. Criar um rascunho pode seguir. Ler arquivo externo ou compartilhar dado pode pedir confirmação da pessoa.
- Registro de auditoria das ações do agente e das confirmações.
- Prevenção contra perda de dados (DLP) já definida para o usuário também vale quando ele usa um agente.
- Identidade do agente. Ele se identifica no OAuth, entra pelo MCP, e o admin trata o acesso no console como trata um aplicativo.

## O que isso muda para a sua empresa

Uma PME em Gmail, Drive e Agenda raramente passa de 5.000 requisições por dia em cada produto com um agente simples. O risco de fevereiro não é a fatura. É um fluxo parar porque ainda usa API REST, um conector genérico ou um robô que raspa a tela.

Vale listar o que lê e escreve em e-mail, agenda e arquivo, de quem é o acesso — fornecedor, script interno ou conta de alguém do time — e se o volume cabe no Standard. Uso moderado e interno: migrar o agente para MCP até fevereiro, sem abrir faturamento. Volume alto, ou fornecedor acima de 5.000 requisições MCP por dia: tier Scaled a partir de abril, com cobrança desde a primeira chamada nos MCP de Gmail, Agenda e Drive. A exceção de uso interno pode aumentar cota de API REST dentro da organização. Ela não aumenta cota de MCP.

Confirmação humana, log e DLP colocam um responsável no circuito antes de o agente agir pela empresa. A Inrev ajuda PMEs de Ribeirão Preto e região a fazer esse mapa antes que o prazo vire incidente.

## Por onde começar

No painel do Google Cloud, compare cada projeto ao teto do Standard. Se ninguém estoura o limite, não é obrigatório trocar de faixa. O que o uso por agentes precisa resolver, até 1º de fevereiro de 2027, é o caminho: de REST para MCP.

A nota oficial está no [blog de atualizações do Google Workspace](https://workspaceupdates.googleblog.com/2026/11/mcp-servers-cli-standardized-usage-tiers-now-available.html). Cotas e cobrança estão no [guia de faixas de uso](https://developers.google.com/workspace/guides/quota-usage-tiers).
