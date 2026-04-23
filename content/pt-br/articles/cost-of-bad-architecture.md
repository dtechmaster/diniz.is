---
title: O custo de uma arquitetura ruim
description: Arquitetura ruim não se anuncia. Acumula silenciosamente — até que reescrever se torna a única opção. Como identificar antes que seja tarde.
date: 2026-04-15
image: /articles/cost-of-bad-architecture.jpg
readingTime: 5 min
tags:
  - Arquitetura
  - Sistemas
  - Engenharia
---

A linha de código mais cara é a que é escrita em cima de uma decisão errada.

Arquitetura ruim não falha dramaticamente. Falha devagar — em custos de manutenção crescentes, tempos de entrega aumentando, risco operacional elevado, e na resignação silenciosa de bons engenheiros que se cansam de trabalhar em torno de fundações quebradas.

## Como a arquitetura ruim realmente parece

Raramente é óbvio por fora. O sistema funciona. Features são entregues. Tudo parece bem — até não ser mais.

Os sinais são mais sutis:

- Cada nova feature exige tocar em 5 arquivos não relacionados
- Ninguém consegue explicar por que algo foi construído daquela forma
- O sistema funciona em staging mas se comporta diferente em produção
- Adicionar um novo membro da equipe leva meses antes de ser efetivo
- "Vamos consertar depois" foi dito há dois anos

Esses são sintomas de dívida arquitetural. Não dívida técnica — dívida arquitetural. A diferença importa.

Dívida técnica pode ser paga incrementalmente. Dívida arquitetural geralmente não. Em algum momento, o custo de trabalhar ao redor da fundação supera o custo de substituí-la.

## As três falhas mais comuns

**1. Camada de abstração errada**

Equipes constroem abstrações para lidar com complexidade futura antes de entender o problema presente. O resultado é uma camada que trata 70% dos casos elegantemente e 30% dos casos com gambiarras que crescem com o tempo.

A correção: construa para o que você tem. Generalize quando o padrão estiver comprovado.

**2. Acoplamento forte**

Quando componentes sabem demais sobre os outros, uma mudança num quebra algo em outro — de forma imprevisível. A equipe para de refatorar porque não consegue prever o raio de impacto. A velocidade cai. O sistema fica frágil.

**3. Sem dono claro dos dados**

Múltiplos serviços escrevem nas mesmas tabelas. Lógica de negócio vive no banco, na API, no frontend, e às vezes num job agendado que ninguém lembra. Quando algo dá errado, é impossível saber onde olhar.

## O custo real

Um estudo da McKinsey estimou que 20–40% dos gastos em tecnologia são desperdiçados gerenciando dívida técnica. Dívida arquitetural é pior porque não pode ser paga incrementalmente — exige uma reescrita, o que significa meses de manutenção paralela, alto risco e uma equipe esticada entre dois sistemas simultaneamente.

O custo médio de uma reescrita completa de um sistema de médio porte: 6–18 meses de tempo de engenharia, risco operacional significativo e uma equipe incapaz de entregar novo valor durante todo esse período.

## A opção mais barata

Problemas arquiteturais são muito mais baratos de identificar cedo. Uma sessão de diagnóstico no início de um projeto — ou antes de um esforço de escala significativo — custa uma fração do que uma reescrita custa.

As perguntas são simples: *Como os dados fluem? Quem é dono do quê? O que acontece quando isso cresce 10x? Onde estão os pontos de falha?*

Boa arquitetura não é esperta. É a ausência de surpresas.
