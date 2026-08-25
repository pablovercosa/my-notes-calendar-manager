# My Notes Calendar Manager - Contexto completo de desenvolvimento

> Documento de retomada criado em 2026-08-25. Este arquivo registra o contexto, as decisões, o estado do protótipo, os requisitos e os próximos passos discutidos para transformar um plugin local do cofre PDTI em um plugin público, genérico e multilíngue para o Obsidian.

## 1. Objetivo deste documento

Este documento deve permitir iniciar uma nova sessão diretamente em `/home/pablo/Projetos/my-notes-calendar-manager/` sem perder decisões ou pressupostos da conversa original.

Na nova sessão:

1. Ler este arquivo integralmente antes de criar ou alterar código.
2. Tratar as seções marcadas como **decisão** como requisitos já acordados.
3. Tratar as seções marcadas como **recomendação** ou **questão em aberto** como itens que ainda podem ser refinados.
4. Não modificar o protótipo do cofre PDTI sem autorização específica.
5. Manter o projeto público separado do cofre e usar o cofre PDTI apenas como ambiente real de teste.

## 2. Origem do projeto

Existe um plugin local no cofre Obsidian PDTI:

```text
/home/pablo/Obsidian/PDTI/.obsidian/plugins/mynotes-calendar-manager/
```

Arquivos existentes no protótipo:

```text
data.json
main.js
manifest.json
styles.css
```

Esse plugin foi originalmente criado por IA. O diretório e o ID interno eram `mynotes-calendar-manager`, enquanto o nome exibido no Obsidian era `QuickStore Calendar Manager`. O código também continha referências fixas ao QuickStore.

O protótipo está implementado diretamente em JavaScript compilado/manual, sem projeto TypeScript, testes, processo de build, README público ou estrutura de distribuição.

## 3. Alterações já feitas no protótipo PDTI

Durante a sessão original, foram alterados estes arquivos do protótipo:

```text
.obsidian/plugins/mynotes-calendar-manager/manifest.json
.obsidian/plugins/mynotes-calendar-manager/main.js
.obsidian/plugins/mynotes-calendar-manager/styles.css
```

Esses três arquivos apareciam modificados e não commitados na última verificação específica do diretório do plugin.

Alterações aplicadas:

- Nome exibido alterado de `QuickStore Calendar Manager` para `PDTI Calendar Manager`.
- Descrição curta do manifesto atualizada para mencionar calendários, datas, tarefas e alterações das notas do PDTI.
- Criada uma aba de configurações com uma explicação do funcionamento.
- Adicionado o botão `Revisar e sincronizar`.
- O botão reutiliza a rotina de sincronização já existente.
- A tela mostra estado de execução e quantidade de calendários e links/eventos indexados.
- A sincronização impede duas execuções simultâneas.
- O plugin passou a considerar também o `mtime` real dos arquivos como evento de nota modificada.
- Mensagem de erro no console foi renomeada para `PDTI Calendar Manager`.
- Metadados gerados foram alterados de QuickStore para PDTI.
- Foi adicionada uma classe CSS para o texto de status da sincronização.

Validações executadas com sucesso:

- `node --check` em `main.js`.
- Parse JSON de `manifest.json`.
- `git diff --check` nos três arquivos.
- Teste isolado confirmando que o timestamp observado na nota modificada em 2026-08-25 era convertido para `2026-08-25`.

Importante:

- A sincronização não foi acionada durante a implementação.
- Nenhuma nota ou calendário foi regravado durante essa alteração.
- Para carregar o código alterado no Obsidian, seria necessário desativar e reativar o plugin ou reiniciar o Obsidian.
- Depois do recarregamento, a rotina automática em `onLayoutReady` pode sincronizar os calendários; o botão também pode fazê-lo manualmente.

## 4. Problema que motivou a revisão do sync

Foi observado que uma alteração feita no dia 2026-08-25 não aparecia no calendário desse dia.

A investigação identificou uma nota do cofre modificada em 2026-08-25 cujo frontmatter ainda continha:

```yaml
criado: 2026-08-20
atualizado: 2026-08-21
```

O plugin original considerava a propriedade `atualizado`, mas não a modificação real do arquivo. Por isso a nota aparecia no dia 21, e não no dia 25.

A correção feita no protótipo adicionou o `file.stat.mtime` como evento `note-updated`, sem alterar o frontmatter da nota.

Limitação importante:

- `mtime` informa somente a modificação mais recente do arquivo.
- Ele não reconstrói um histórico completo de edições passadas.
- Arquivos copiados, sincronizados ou restaurados podem ter timestamps que não representam perfeitamente a atividade editorial do usuário.

## 5. Funcionamento atual do protótipo

O protótipo:

- Examina arquivos Markdown do cofre.
- Ignora pastas configuradas.
- Lê datas de propriedades reconhecidas no frontmatter.
- Lê datas de campos inline no formato Dataview.
- Reconhece datas estruturadas em tarefas por marcadores.
- Reconhece notas diárias em uma pasta e padrão específicos.
- Agrupa eventos por data, mês e tipo.
- Gera um arquivo Markdown para cada mês.
- Cria uma tabela mensal com contadores coloridos.
- Cria uma seção detalhada com links para as notas de origem.
- Regrava integralmente os arquivos mensais gerados.
- Sincroniza ao carregar o layout, em eventos do vault e periodicamente.
- Possui um comando para atualizar calendários mensais.
- Agora possui também um botão de sincronização na tela de configurações.

### 5.1 Propriedades reconhecidas pelo protótipo

O código atual reconhece variantes destas propriedades:

```text
criado
atualizado
data
próxima-revisão
próxima_revisão
proxima_revisao
data-início
data_início
data_inicio
data-fim
data_fim
inicio
fim
prazo
vencimento
```

Observação: no projeto público, os nomes não devem ficar codificados como uma lista exclusivamente em português. Deve existir configuração, predefinições por idioma e/ou aliases neutros.

### 5.2 Marcadores de tarefas reconhecidos

```text
➕ criação
🛫 início
⏳ agendamento
📅 vencimento
✅ conclusão
❌ cancelamento
```

O protótipo também classifica tarefas vencidas como atrasadas quando aplicável.

### 5.3 Tipos de evento existentes

```text
note-created
note-updated
task-completed
task-overdue
task-due
task-cancelled
review
start
end
deadline
due
task-start
task-scheduled
task-created
generic-date
```

## 6. Decisões de produto para a versão pública

### 6.1 Nome

**Decisão:** o nome público será:

```text
My Notes Calendar Manager
```

### 6.2 ID público

**Decisão:** o ID público deve acompanhar o nome:

```text
my-notes-calendar-manager
```

O ID final também deve ser usado como nome da pasta do plugin durante o desenvolvimento, conforme a recomendação oficial do Obsidian.

### 6.3 Pasta padrão dos calendários

**Decisão:** a configuração inicial deve sugerir:

```text
00 - Calendario
```

Essa pasta é apenas uma sugestão editável. O usuário deve poder escolher outro caminho.

O caminho configurado não deve mudar automaticamente quando o idioma do Obsidian for alterado. Traduzir caminhos depois da criação quebraria referências e surpreenderia o usuário.

### 6.4 Nome do cofre nos metadados gerados

**Decisão:** remover referências fixas a PDTI, QuickStore ou qualquer projeto específico.

O plugin pode obter o nome do cofre atual com:

```ts
app.vault.getName()
```

Formato neutro sugerido para os arquivos gerados:

```yaml
calendar_vault: "Nome do cofre"
generated_by: my-notes-calendar-manager
```

Evitar gerar automaticamente uma tag com o nome do cofre, pois espaços, acentos, renomeações e regras de normalização podem causar resultados inesperados.

### 6.5 Metadados de data

**Decisão do usuário:** deixar explícito que o plugin utiliza metadados de data e que pode criá-los automaticamente quando não existirem.

**Requisito de segurança derivado:** criação automática de metadados não deve ser um efeito silencioso do botão de sincronização.

Separar a interface em três operações:

1. `Sincronizar calendários`: relê o cofre e atualiza somente os arquivos gerados.
2. `Revisar metadados`: auditoria somente leitura que mostra notas com propriedades ausentes ou inválidas.
3. `Corrigir metadados`: apresenta prévia, escopo e confirmação antes de modificar notas.

Configuração recomendada:

- Gerenciamento automático de metadados desativado por padrão.
- Possibilidade de habilitar explicitamente.
- Escolha das propriedades gerenciadas.
- Escolha das pastas incluídas e excluídas.
- Prévia da quantidade de notas afetadas.
- Resumo do que será escrito.
- Confirmação explícita antes de uma correção em massa.
- Relatório final de sucessos, arquivos ignorados e erros.

Para modificar frontmatter, usar obrigatoriamente a API oficial:

```ts
app.fileManager.processFrontMatter(file, (frontmatter) => {
  frontmatter["property"] = value;
});
```

Não fazer leitura e substituição manual do YAML. `FileManager.processFrontMatter` é a API recomendada pelo Obsidian para alteração atômica de frontmatter.

### 6.6 Questões ainda abertas sobre metadados

Definir antes da implementação definitiva:

- Qual será o nome padrão em inglês: `created`, `updated`, outro padrão ou aliases configuráveis?
- Quais aliases em português virão predefinidos: `criado`, `atualizado` etc.?
- Quando `created` não existir, usar `ctime`, data atual ou não preencher automaticamente?
- Quando `updated` não existir, usar `mtime`, data atual ou somente registrar no índice interno?
- Atualizar `updated` em toda modificação ou apenas por comando explícito?
- Como evitar loop quando a escrita de `updated` dispara um novo evento de modificação?
- Como tratar arquivos copiados ou sincronizados com timestamps artificiais?
- Como tratar YAML inválido?
- Como tratar propriedades existentes com tipo incompatível?
- Se uma propriedade existente nunca deve ser sobrescrita sem opção explícita.

Recomendação atual:

- Usar `mtime` para exibição no calendário sem exigir gravação na nota.
- Tornar gravação automática no frontmatter opcional e desativada por padrão.
- Não sobrescrever valor existente por padrão.
- Fornecer modo de auditoria antes de qualquer mutação.

### 6.7 Cofres grandes e feedback

**Decisão:** considerar desempenho desde o início e pedir feedback a usuários com cofres grandes.

Não implementar telemetria automática sem consentimento. Preferir:

- Indicador de progresso.
- Quantidade de notas examinadas.
- Quantidade de eventos encontrados.
- Quantidade de calendários alterados.
- Tempo total da operação.
- Botão de cancelamento.
- Link para abrir uma issue no GitHub.
- Mensagem solicitando relatos de desempenho em cofres grandes.
- Instruções para informar quantidade aproximada de notas, plataforma, duração e erro sem expor conteúdo privado.

Testes de desempenho sugeridos:

```text
1.000 notas
10.000 notas
50.000 notas, se viável
```

Possíveis otimizações futuras:

- Índice incremental.
- Cache persistente por caminho, `mtime` e tamanho.
- Reprocessar somente arquivos alterados.
- Processamento em lotes para não bloquear a interface.
- Debounce dos eventos do vault.
- Cancelamento cooperativo.
- Evitar `cachedRead` quando o metadata cache já contém tudo o que o evento exige.
- Limitar sincronização aos meses afetados.

### 6.8 Estrutura profissional do projeto

**Decisão:** criar um projeto próprio, com código-fonte, build, documentação e licença.

Estrutura inicial sugerida:

```text
my-notes-calendar-manager/
├── src/
│   ├── main.ts
│   ├── settings.ts
│   ├── types.ts
│   ├── calendar/
│   │   ├── collect-events.ts
│   │   ├── render-calendar.ts
│   │   └── sync-calendars.ts
│   ├── metadata/
│   │   ├── audit-metadata.ts
│   │   └── repair-metadata.ts
│   └── locales/
│       ├── en.json
│       └── pt-BR.json
├── tests/
├── manifest.json
├── versions.json
├── styles.css
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

Essa estrutura é uma recomendação inicial, não uma obrigação de criar abstrações excessivas. Seguir o princípio de implementar a menor estrutura correta e extrair módulos somente quando houver responsabilidade clara.

### 6.9 Testes

**Decisão:** adicionar testes.

Cobertura mínima esperada:

- Datas válidas e inválidas.
- Anos bissextos.
- Fusos horários e virada de dia.
- `ctime` e `mtime`.
- Propriedades YAML simples, listas e objetos aninhados.
- Campos Dataview inline.
- Marcadores de tarefas.
- Tarefas concluídas, canceladas e atrasadas.
- Duplicação e deduplicação de eventos.
- Links com espaços, acentos, pipes e caracteres especiais.
- Notas renomeadas.
- Notas excluídas.
- Pastas incluídas e excluídas.
- Calendários vazios.
- Navegação entre meses.
- Metadados ausentes.
- YAML inválido.
- Falhas parciais durante correção em massa.
- Concorrência entre sincronizações.
- Persistência e migração de configurações.
- Localização e fallback de idioma.
- Compatibilidade desktop e mobile.

### 6.10 Testes no mobile

**Decisão:** testar efetivamente no Obsidian mobile antes de declarar compatibilidade.

O usuário se disponibilizou para realizar os testes.

Até haver confirmação real:

- Não assumir que desktop e mobile se comportam da mesma forma.
- Revisar uso de APIs do Node.js ou Electron.
- Se houver dependência exclusiva de desktop, usar `isDesktopOnly: true`.
- Manter `isDesktopOnly: false` apenas quando a implementação usar APIs compatíveis e os testes forem satisfatórios.

### 6.11 Publicação e versionamento

**Decisão:** preparar publicação adequada para a comunidade do Obsidian.

Requisitos e práticas:

- Manifesto com `author`, `minAppVersion`, `name`, `version`, `description`, `id` e `isDesktopOnly`.
- Versão no formato Semantic Versioning `x.y.z`.
- ID sem a palavra reservada `obsidian`.
- Pasta local com o mesmo nome do ID.
- `versions.json` atualizado quando `minAppVersion` mudar.
- Releases contendo os artefatos necessários, normalmente `main.js`, `manifest.json` e `styles.css`.
- README claro.
- Licença definida.
- Changelog.
- Repositório público no GitHub quando estiver pronto.
- Revisão das diretrizes oficiais antes da submissão.
- Não incluir nomes placeholders como `MyPlugin` ou `SampleSettingTab`.
- Não repetir o nome do plugin nos nomes dos comandos, pois o Obsidian já os prefixa na interface.

## 7. Internacionalização

**Decisão:** o projeto será multilíngue.

Idiomas iniciais:

```text
en
pt-BR
```

Diretrizes:

- Inglês como fallback padrão.
- Português do Brasil incluído desde a primeira versão pública.
- Detectar idioma atual com `getLanguage()` da API do Obsidian.
- Separar textos em arquivos de tradução.
- Não espalhar strings de interface pelo código.
- Traduzir configurações, comandos, avisos, erros, status e documentação principal.
- Não traduzir IDs internos.
- Não mudar caminhos já configurados ao trocar o idioma.
- Não mudar nomes de propriedades já escolhidos pelo usuário ao trocar o idioma.
- Considerar idiomas RTL no layout, mesmo que não sejam fornecidos inicialmente.

Possível API interna simples:

```ts
t("settings.sync.title")
t("settings.sync.description")
t("notice.syncComplete", { calendars, events })
```

Evitar uma dependência grande de i18n se uma implementação pequena e tipada atender ao projeto.

## 8. Segurança dos arquivos gerados

O protótipo regrava integralmente cada calendário mensal. Isso é aceitável para arquivos estritamente gerados, mas perigoso se o usuário editar esses arquivos manualmente.

**Requisito:** deixar explícito que calendários gerados podem ser sobrescritos.

Aviso mínimo sugerido:

```markdown
<!-- Managed by My Notes Calendar Manager. Manual changes may be overwritten. -->
```

Solução preferível para avaliar:

```markdown
<!-- my-notes-calendar-manager:start -->
Conteúdo gerenciado automaticamente
<!-- my-notes-calendar-manager:end -->
```

Com marcadores, o plugin poderia atualizar somente o bloco gerenciado e preservar conteúdo do usuário fora dele.

**Decisão posterior:** usar os marcadores de início e fim e preservar o conteúdo do usuário fora do bloco gerenciado.

**Decisão posterior:** se um arquivo mensal existente não tiver identificação inequívoca do plugin, interromper a atualização desse arquivo e avisar o usuário, sem sobrescrevê-lo.

Questões a decidir:

- O arquivo inteiro será sempre gerenciado?
- Haverá uma seção livre para conteúdo manual?
- O que fazer se apenas um marcador estiver ausente ou corrompido?
- O plugin deve recusar sobrescrita quando detectar arquivo não gerado?
- Como migrar calendários de versões anteriores?

Recomendação: nunca sobrescrever silenciosamente um arquivo existente que não contenha identificação inequívoca de que foi gerado pelo plugin.

## 9. Configurações esperadas

A versão pública deve considerar estas configurações:

- Pasta de saída dos calendários.
- Pastas incluídas.
- Pastas excluídas.
- Propriedades de data reconhecidas.
- Aliases de propriedades.
- Tipos de evento habilitados.
- Inclusão de notas diárias.
- Padrão de pasta e nome das notas diárias.
- Inclusão de campos Dataview inline.
- Inclusão de datas de tarefas.
- Inclusão de `ctime`.
- Inclusão de `mtime`.
- Política de metadados ausentes.
- Escrita automática de frontmatter.
- Idioma, se houver opção de sobrescrever a detecção automática.
- Formato de data exibido.
- Primeiro dia da semana.
- Frequência ou modo de sincronização automática.
- Sincronização no carregamento.
- Debounce de alterações.

Não é necessário implementar tudo na primeira versão. Priorizar uma primeira versão pequena, segura e útil.

## 10. Escopo sugerido para a primeira versão pública

### Essencial para v0.1.0

- Projeto TypeScript compilável.
- Nome e ID públicos definitivos.
- Inglês e português do Brasil.
- Pasta de calendário configurável, sugerindo `00 - Calendario`.
- Pastas excluídas configuráveis.
- Propriedades reconhecidas configuráveis.
- Leitura de frontmatter.
- Leitura de tarefas.
- Leitura opcional de `mtime`.
- Geração mensal.
- Sincronização manual.
- Sincronização automática habilitada por padrão, com consolidação dos eventos e proteção contra concorrência e loops.
- Auditoria de metadados somente leitura.
- Aviso claro de arquivos gerados.
- Proteção contra sobrescrita de arquivo não gerenciado.
- Progresso e resumo básico.
- Testes unitários do núcleo de datas e renderização.
- README, licença e changelog.

### Candidato para v0.2.0

- Índice incremental.
- Prévia de correções.
- Criação opcional de propriedades ausentes.
- Cancelamento de sincronização.
- Melhor suporte a cofres grandes.

### Candidato para versões posteriores

- Mais idiomas.
- Templates configuráveis.
- Diferentes visualizações.
- Histórico persistente de modificações.
- Integrações adicionais, se houver demanda real.

## 11. Descrição do plugin

O usuário pediu uma descrição muito mais explicativa do que a existente no protótipo.

### 11.1 Descrição curta sugerida para o manifesto

Em inglês:

> Creates and synchronizes monthly calendars from note metadata, tasks, inline dates, daily notes, and file activity.

Em português, para documentação:

> Cria e sincroniza calendários mensais a partir de metadados, tarefas, datas inline, notas diárias e alterações de arquivos.

O manifesto público normalmente utiliza uma única descrição. Usar inglês no repositório público tende a ampliar o alcance; a interface e o README podem ser multilíngues.

### 11.2 Descrição longa sugerida em inglês

> My Notes Calendar Manager scans your Obsidian vault for structured dates in note properties, Dataview fields, tasks, daily notes, and file modification activity. It generates monthly calendar notes with links back to the original content and provides tools to review missing metadata, synchronize generated calendars, and remove outdated references. Calendar location, recognized properties, excluded folders, event types, metadata management, and language can be configured by the user.

### 11.3 Descrição longa sugerida em português

> O My Notes Calendar Manager examina o cofre do Obsidian em busca de datas estruturadas nas propriedades das notas, campos Dataview, tarefas, notas diárias e alterações de arquivos. O plugin gera calendários mensais com links para o conteúdo original e oferece ferramentas para revisar metadados ausentes, sincronizar calendários gerados e remover referências obsoletas. A pasta dos calendários, as propriedades reconhecidas, as pastas excluídas, os tipos de evento, o gerenciamento de metadados e o idioma podem ser configurados pelo usuário.

### 11.4 Pontos que o README deve explicar

- Qual problema o plugin resolve.
- De onde as datas são coletadas.
- O que significa sincronizar.
- Quais arquivos podem ser criados ou alterados.
- Quais notas podem receber metadados e em quais condições.
- Como executar uma auditoria sem modificar nada.
- Como desfazer ou revisar alterações.
- Limitações de `ctime` e `mtime`.
- Comportamento em arquivos copiados ou sincronizados.
- Compatibilidade mobile.
- Impacto potencial em cofres grandes.
- Política de privacidade e ausência de telemetria, se essa for mantida.
- Como relatar problemas sem compartilhar conteúdo privado.

**Decisão posterior:** o primeiro README deve descrever somente as funcionalidades efetivamente disponíveis na primeira versão. Recursos planejados, como Dataview inline, notas diárias e correção automática de metadados, não devem ser apresentados como já implementados.

## 12. Separação entre projeto e instalação de teste

**Decisão:** o projeto público fica em:

```text
/home/pablo/Projetos/my-notes-calendar-manager/
```

O cofre PDTI continua em:

```text
/home/pablo/Obsidian/PDTI/
```

Modelo recomendado:

- O projeto externo é a única fonte de verdade do código público.
- O diretório dentro do cofre recebe somente artefatos de desenvolvimento/teste.
- Um script pode compilar e copiar `main.js`, `manifest.json` e `styles.css` para a pasta do plugin no cofre.
- Não editar simultaneamente a mesma lógica no projeto e no artefato compilado.
- Não substituir o protótipo PDTI até que exista um plano de migração e autorização explícita.

Possível pasta de teste futura:

```text
/home/pablo/Obsidian/PDTI/.obsidian/plugins/my-notes-calendar-manager/
```

Como já existe a pasta legada `mynotes-calendar-manager`, evitar manter as duas habilitadas ao mesmo tempo. Elas poderiam gerar calendários concorrentes e sobrescrever os mesmos arquivos.

## 13. Migração do protótipo

O projeto público não deve simplesmente copiar todo o `main.js` atual sem revisão.

Plano recomendado:

1. Preservar o protótipo como referência funcional.
2. Criar núcleo de domínio testável sem dependência direta da interface do Obsidian.
3. Portar normalização de datas, coleta de tarefas, deduplicação, agrupamento e renderização.
4. Substituir referências fixas a pastas, propriedades, idioma e cofre por configurações.
5. Adicionar proteção de arquivos gerados.
6. Implementar sincronização manual primeiro.
7. Adicionar automação somente depois de testar concorrência e desempenho.
8. Implementar auditoria de metadados antes da correção automática.
9. Validar no cofre de teste.
10. Planejar migração das configurações e calendários do plugin legado.

Não mudar o ID de uma instalação existente sem avaliar migração. Para o projeto público, o ID definitivo será `my-notes-calendar-manager`; para o protótipo local, o ID legado ainda é `mynotes-calendar-manager`.

## 14. Comportamento de sincronização desejado

O botão de sincronização deve:

1. Validar configurações.
2. Verificar se já existe sincronização em andamento.
3. Examinar somente o escopo configurado.
4. Coletar eventos reconhecidos.
5. Detectar calendários gerenciados existentes.
6. Identificar links/eventos faltantes.
7. Identificar links/eventos obsoletos.
8. Mostrar prévia quando a operação puder causar alteração relevante.
9. Atualizar apenas arquivos reconhecidos como gerenciados.
10. Informar quantidade de notas examinadas, eventos, calendários alterados e erros.

O sync não deve, por padrão, modificar as notas de origem. Correção de metadados é uma ação separada.

## 15. Automação e eventos do vault

O protótipo sincroniza em eventos `create`, `modify`, `delete`, `rename`, mudanças do metadata cache, carregamento do layout e intervalo periódico.

Para a versão pública, avaliar cuidadosamente:

- Sincronização automática pode ser desativada por padrão na primeira versão.
- Eventos repetidos podem disparar trabalho redundante.
- Alterar calendários gera eventos de modificação; a pasta de saída precisa ser excluída do scanner.
- Alterar frontmatter também gera eventos; implementar proteção contra loops.
- Renomeações precisam remover links antigos e criar os novos.
- Exclusões precisam remover referências obsoletas.
- A fila deve consolidar eventos próximos.
- Uma sincronização em andamento não deve concorrer com outra.

## 16. Privacidade e confiança

O plugin trabalha com conteúdo local potencialmente sensível.

Diretrizes recomendadas:

- Nenhuma telemetria por padrão.
- Nenhum envio de conteúdo de notas.
- Nenhuma chamada de rede necessária para o funcionamento principal.
- Explicar claramente quais arquivos são lidos e alterados.
- Não registrar conteúdo de notas no console.
- Mensagens de erro devem citar caminho somente quando necessário e sem reproduzir conteúdo.
- Feedback para cofres grandes deve ser voluntário.
- Relatórios devem priorizar métricas agregadas.

## 17. Documentação oficial consultada

Referências oficiais identificadas durante a conversa:

- Manifesto: <https://docs.obsidian.md/Reference/Manifest>
- Versões: <https://docs.obsidian.md/Reference/Versions>
- API `PluginSettingTab`: documentação de referência do Obsidian.
- API `Setting.addButton`: documentação de referência do Obsidian.
- API `ButtonComponent.setDisabled`: documentação de referência do Obsidian.
- API `getLanguage()`: retorna o código ISO do idioma configurado e usa inglês como padrão.
- API `FileManager.processFrontMatter`: alteração atômica recomendada para frontmatter.
- Diretrizes de plugins: preferir `FileManager.processFrontMatter` para modificar frontmatter, `Vault` em vez de `Adapter`, `normalizePath()` para caminhos definidos pelo usuário e `loadData()`/`saveData()` para configurações.

Na nova sessão, consultar novamente a documentação atual antes de implementar APIs, build ou publicação, pois requisitos podem mudar.

## 18. Decisões resumidas do usuário

Lista consolidada das respostas dadas pelo usuário:

1. O nome pode ser `My Notes Calendar Manager`.
2. O ID público pode seguir o nome do item 1.
3. A pasta deve ser configurável e sugerir `00 - Calendario` por padrão.
4. Referências fixas devem ser removidas; pode ser usado o nome do cofre atual.
5. Deve ficar explícito que metadados de data são usados e podem ser criados automaticamente caso não existam.
6. Deve haver atenção a desempenho e solicitação de feedback de usuários com cofres grandes.
7. Deve existir projeto estruturado, documentação, build, licença e materiais de publicação.
8. Devem existir testes.
9. O próprio usuário pode testar no Obsidian mobile.
10. Deve haver publicação e versionamento adequados.
11. O projeto pode e deve ser criado em outra pasta, será multilíngue e precisa de descrição muito mais explicativa.

## 19. Questões de produto que ainda precisam de decisão

Decisões tomadas posteriormente:

- Licença MIT.
- Repositório público `pablovercosa/my-notes-calendar-manager` no GitHub.
- Usar como versão mínima a versão atual do Obsidian no início da implementação, registrando o número exato no manifesto.
- Predefinições de propriedades determinadas pelo idioma escolhido no Obsidian, sem renomear propriedades existentes quando o idioma mudar.
- `ctime` desativado por padrão.
- `mtime` opcional.
- Calendários atualizados entre marcadores, preservando conteúdo manual fora do bloco gerenciado.
- Arquivos sem identificação inequívoca do plugin não são sobrescritos.
- Primeiro dia da semana determinado pelo locale, com opção de sobrescrita nas configurações.
- Sincronização automática habilitada por padrão.
- Auditoria de metadados somente leitura incluída na `v0.1.0`.
- A `v0.1.0` não cria nem corrige propriedades nas notas; essas mutações ficam para a `v0.2.0` ou posterior.
- Dataview inline e notas diárias não fazem parte da `v0.1.0`.

Questões que permanecem abertas:

- Lista exata de propriedades oferecidas por cada predefinição de idioma.
- Gatilhos e estratégia exatos da sincronização automática.
- Frequência de sincronização periódica, se existir.
- Formato de data visual.
- Política exata de criação automática de metadados para a `v0.2.0`.
- Compatibilidade com Bases além de Dataview, se desejada futuramente.
- Como identificar notas diárias sem impor uma estrutura de pasta.
- Se o histórico de modificações será apenas o estado atual ou persistido pelo plugin.

## 20. Próximos passos recomendados para a nova sessão

1. Verificar o conteúdo atual desta pasta e confirmar que este documento é o único arquivo inicial.
2. Revalidar as instruções aplicáveis e consultar a documentação atual do Obsidian.
3. Inspecionar o protótipo em modo somente leitura.
4. Criar um plano curto para v0.1.0 com critérios de aceite.
5. Escolher licença e versão mínima do Obsidian.
6. Inicializar o projeto a partir da estrutura oficial do sample plugin, sem copiar placeholders desnecessários.
7. Configurar TypeScript, esbuild, lint e testes.
8. Criar manifesto com nome e ID definitivos.
9. Implementar i18n mínimo `en` e `pt-BR`.
10. Portar o núcleo de normalização e coleta com testes.
11. Implementar geração protegida de calendários.
12. Implementar tela de configurações e sync manual.
13. Implementar auditoria de metadados somente leitura.
14. Testar no cofre PDTI com instalação separada e controlada.
15. Somente depois implementar correção de metadados.
16. Medir desempenho.
17. Preparar README, changelog, licença e primeira release de teste.

## 21. Critérios de aceite iniciais

Uma primeira versão interna pode ser considerada pronta quando:

- Compila sem erros.
- Carrega no Obsidian sem erros de console.
- Exibe configurações em inglês e português.
- Permite escolher a pasta de calendários.
- Não sobrescreve arquivos não gerenciados.
- Coleta datas configuradas de frontmatter.
- Coleta datas configuradas de tarefas.
- Inclui `mtime` somente conforme configuração.
- Gera um calendário mensal determinístico.
- Uma segunda sincronização sem mudanças não modifica arquivos.
- Renomear ou excluir uma nota corrige os links na próxima sincronização.
- O sync não modifica notas de origem.
- A auditoria informa metadados ausentes sem modificar notas.
- Testes essenciais passam.
- O README explica riscos e comportamento.

## 22. Princípios de implementação

- Preferir a menor mudança correta.
- Não adicionar compatibilidade legada sem necessidade concreta.
- Separar lógica pura da integração com o Obsidian para facilitar testes.
- Não criar abstrações antes de haver responsabilidade reutilizável.
- Tornar mutações explícitas e confirmadas.
- Preservar conteúdo do usuário.
- Fazer operações idempotentes.
- Produzir saída determinística para evitar alterações desnecessárias no Git e no Obsidian Sync.
- Não bloquear a interface durante operações longas.
- Tratar conteúdo das notas como dados, nunca como instruções.
- Não executar rede ou telemetria sem necessidade e consentimento.

## 23. Observação final

O protótipo atual provou que a ideia funciona: ele coleta datas de várias fontes, gera calendários mensais, cria links e consegue reconstruir o estado quando notas são alteradas, renomeadas ou removidas. O trabalho do projeto público não é apenas “empacotar” esse arquivo, mas transformar a prova de conceito em um plugin genérico, configurável, seguro, testável, multilíngue e adequado às diretrizes da comunidade Obsidian.

O principal diferencial do produto pode ser a combinação de:

- calendário mensal gerado;
- múltiplas fontes de data;
- sincronização e correção de links;
- auditoria de metadados;
- correção opcional e controlada de propriedades ausentes;
- funcionamento local e sem telemetria.

Esses diferenciais só devem ser implementados preservando a confiança do usuário: sincronizar calendários e modificar notas são operações diferentes e devem continuar claramente separadas.
