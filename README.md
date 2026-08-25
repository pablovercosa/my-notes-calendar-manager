# My Notes Calendar Manager

[English](#english) | [Português do Brasil](#português-do-brasil)

## English

My Notes Calendar Manager creates monthly calendar notes from dates already present in your Obsidian vault. It scans configured frontmatter properties, Obsidian task date markers, and optional file timestamps, then links each event to its source note.

The project is in early development and is not yet available in the Obsidian Community plugins directory.

### Current features

- Monthly calendars with links to source notes.
- Configurable calendar folder, excluded folders, and date properties.
- New installations use `00 - Progresso/Calendario` as the default calendar folder.
- Obsidian task markers for creation, start, scheduling, due date, completion, and cancellation.
- Optional `ctime` and `mtime` events. `ctime` starts disabled; `mtime` starts enabled.
- Manual and automatic synchronization.
- Read-only metadata audit.
- English and Brazilian Portuguese interface based on the Obsidian language.
- Desktop and mobile-compatible APIs. Mobile compatibility still requires device testing.

Dataview inline fields, daily note detection, and automatic frontmatter repair are not part of the current version.

### File safety

The plugin manages only the content between these markers:

```markdown
<!-- my-notes-calendar-manager:start -->
Generated calendar content
<!-- my-notes-calendar-manager:end -->
```

You can keep manual content outside the markers. The plugin refuses to overwrite an existing monthly file without valid markers and reports missing, duplicated, or out-of-order markers as errors.

Calendar synchronization does not modify source notes. The metadata audit also runs without writing files.

### Development

Requirements:

- Node.js 20 or newer.
- Obsidian 1.13.8 or newer.

Install dependencies and run the checks:

```bash
npm install
npm test
npm run build
```

The build writes `main.js` at the repository root. A test installation needs these files in an Obsidian plugin folder named `my-notes-calendar-manager`:

```text
main.js
manifest.json
styles.css
```

Use `npm run dev` while developing. The process watches TypeScript files and rebuilds `main.js`.

### Privacy

The plugin reads local Markdown notes in the configured scope. It does not require network access, send note content, or collect telemetry.

`ctime` and `mtime` reflect filesystem state, not a complete edit history. Datetime properties keep their written calendar day; the plugin validates the timestamp but does not shift that day to another timezone.

### License

[MIT](LICENSE)

## Português do Brasil

O My Notes Calendar Manager cria notas mensais de calendário a partir das datas que já existem no cofre do Obsidian. Ele examina propriedades configuradas do frontmatter, marcadores de datas em tarefas e timestamps opcionais dos arquivos. Cada evento contém um link para a nota de origem.

O projeto está em desenvolvimento inicial e ainda não está disponível no diretório de plugins da comunidade do Obsidian.

### Recursos atuais

- Calendários mensais com links para as notas de origem.
- Pasta dos calendários, pastas excluídas e propriedades de data configuráveis.
- Novas instalações usam `00 - Progresso/Calendario` como pasta padrão dos calendários.
- Marcadores de tarefas do Obsidian para criação, início, agendamento, vencimento, conclusão e cancelamento.
- Eventos opcionais de `ctime` e `mtime`. `ctime` começa desativado; `mtime` começa ativado.
- Sincronização manual e automática.
- Auditoria de metadados somente leitura.
- Interface em inglês e português do Brasil conforme o idioma do Obsidian.
- Uso de APIs compatíveis com desktop e mobile. A compatibilidade mobile ainda depende de testes em dispositivo.

Campos inline do Dataview, detecção de notas diárias e correção automática de frontmatter não fazem parte da versão atual.

### Segurança dos arquivos

O plugin altera somente o conteúdo delimitado por estes marcadores:

```markdown
<!-- my-notes-calendar-manager:start -->
Conteúdo gerado do calendário
<!-- my-notes-calendar-manager:end -->
```

O conteúdo manual pode ficar fora dos marcadores. O plugin não sobrescreve um arquivo mensal existente sem marcadores válidos e informa marcadores ausentes, duplicados ou fora de ordem.

A sincronização dos calendários não altera as notas de origem. A auditoria de metadados também não grava arquivos.

### Desenvolvimento

Requisitos:

- Node.js 20 ou mais recente.
- Obsidian 1.13.8 ou mais recente.

Instale as dependências e execute as verificações:

```bash
npm install
npm test
npm run build
```

O build gera `main.js` na raiz do repositório. Uma instalação de teste precisa destes arquivos em uma pasta de plugin chamada `my-notes-calendar-manager`:

```text
main.js
manifest.json
styles.css
```

Durante o desenvolvimento, use `npm run dev` para recompilar `main.js` quando os arquivos TypeScript mudarem.

### Privacidade

O plugin lê notas Markdown locais dentro do escopo configurado. Ele não precisa acessar a rede, não envia o conteúdo das notas e não coleta telemetria.

`ctime` e `mtime` representam o estado do sistema de arquivos, não um histórico completo de edições. Propriedades com data e hora mantêm o dia escrito no valor; o plugin valida o timestamp, mas não desloca esse dia para outro fuso horário.

### Licença

[MIT](LICENSE)
