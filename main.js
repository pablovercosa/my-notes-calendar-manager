const { Plugin, PluginSettingTab, Setting, Notice, normalizePath, TFile } = require("obsidian");

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const PROPERTY_EVENTS = {
  "criado": { kind: "note-created", reason: "Criação da nota" },
  "atualizado": { kind: "note-updated", reason: "Atualização da nota" },
  "data": { kind: "generic-date", reason: "Data da nota" },
  "próxima-revisão": { kind: "review", reason: "Próxima revisão" },
  "próxima_revisão": { kind: "review", reason: "Próxima revisão" },
  "proxima_revisao": { kind: "review", reason: "Próxima revisão" },
  "data-início": { kind: "start", reason: "Data de início" },
  "data_início": { kind: "start", reason: "Data de início" },
  "data_inicio": { kind: "start", reason: "Data de início" },
  "data-fim": { kind: "end", reason: "Data de término" },
  "data_fim": { kind: "end", reason: "Data de término" },
  "inicio": { kind: "start", reason: "Data de início" },
  "fim": { kind: "end", reason: "Data de término" },
  "prazo": { kind: "deadline", reason: "Prazo" },
  "vencimento": { kind: "due", reason: "Vencimento" }
};

const TASK_MARKERS = [
  ["➕", "Criação da tarefa", "task-created"],
  ["🛫", "Início da tarefa", "task-start"],
  ["⏳", "Agendamento da tarefa", "task-scheduled"],
  ["📅", "Vencimento da tarefa", "task-due"],
  ["✅", "Conclusão da tarefa", "task-completed"],
  ["❌", "Cancelamento da tarefa", "task-cancelled"]
];

const EVENT_TYPES = {
  "note-created": { label: "Notas criadas", className: "created", order: 10 },
  "note-updated": { label: "Notas modificadas", className: "updated", order: 20 },
  "task-completed": { label: "Tarefas concluídas", className: "completed", order: 30 },
  "task-overdue": { label: "Tarefas atrasadas", className: "overdue", order: 40 },
  "task-due": { label: "Tarefas com vencimento", className: "due", order: 50 },
  "task-cancelled": { label: "Tarefas canceladas", className: "cancelled", order: 60 },
  "review": { label: "Revisões", className: "review", order: 70 },
  "start": { label: "Inícios", className: "start", order: 80 },
  "end": { label: "Términos", className: "end", order: 90 },
  "deadline": { label: "Prazos", className: "deadline", order: 100 },
  "due": { label: "Vencimentos", className: "due", order: 110 },
  "task-start": { label: "Inícios de tarefas", className: "task-start", order: 120 },
  "task-scheduled": { label: "Tarefas agendadas", className: "scheduled", order: 130 },
  "task-created": { label: "Tarefas criadas", className: "task-created", order: 140 },
  "generic-date": { label: "Outras datas", className: "generic", order: 150 }
};

module.exports = class MyNotesCalendarManager extends Plugin {
  async onload() {
    this.settings = Object.assign({
      calendarFolder: "00 - Painéis/Calendário",
      excludedFolders: ["00 - Painéis/Calendário", "99 - Modelos", ".obsidian"],
      includedProperties: [
        "criado", "atualizado", "data", "proxima_revisao", "data_inicio", "data_fim",
        "inicio", "fim", "prazo", "vencimento"
      ]
    }, await this.loadData());

    this.syncing = false;
    this.syncTimer = null;

    this.addSettingTab(new PDTICalendarManagerSettingTab(this.app, this));

    this.addCommand({
      id: "atualizar-calendarios-mensais",
      name: "Atualizar calendários mensais",
      callback: () => this.syncCalendars(true)
    });

    this.app.workspace.onLayoutReady(() => this.queueSync(400));

    this.registerEvent(this.app.metadataCache.on("changed", (file) => {
      if (this.shouldIgnore(file.path)) return;
      this.queueSync();
    }));

    this.registerEvent(this.app.vault.on("create", (file) => {
      if (!(file instanceof TFile) || file.extension !== "md" || this.shouldIgnore(file.path)) return;
      this.queueSync();
    }));

    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (!(file instanceof TFile) || file.extension !== "md" || this.shouldIgnore(file.path)) return;
      this.queueSync();
    }));

    this.registerEvent(this.app.vault.on("delete", (file) => {
      if (!(file instanceof TFile) || file.extension !== "md" || this.shouldIgnore(file.path)) return;
      this.queueSync();
    }));

    this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
      if (!(file instanceof TFile) || file.extension !== "md") return;
      if (this.shouldIgnore(file.path) && this.shouldIgnore(oldPath)) return;
      this.queueSync();
    }));

    this.registerInterval(window.setInterval(() => this.queueSync(), 60 * 60 * 1000));
  }

  onunload() {
    if (this.syncTimer) window.clearTimeout(this.syncTimer);
  }

  queueSync(delay = 900) {
    if (this.syncTimer) window.clearTimeout(this.syncTimer);
    this.syncTimer = window.setTimeout(() => {
      this.syncTimer = null;
      this.syncCalendars(false);
    }, delay);
  }

  shouldIgnore(path) {
    const normalized = normalizePath(path || "");
    return this.settings.excludedFolders.some((folder) => {
      const excluded = normalizePath(folder);
      return normalized === excluded || normalized.startsWith(`${excluded}/`);
    });
  }

  async syncCalendars(showNotice = false) {
    if (this.syncing) {
      if (showNotice) new Notice("A sincronização dos calendários já está em andamento.");
      return null;
    }
    this.syncing = true;
    let result = null;

    try {
      await this.ensureFolder(this.settings.calendarFolder);
      const events = await this.collectEvents();
      const months = new Set(events.map((event) => event.date.slice(0, 7)));

      const now = new Date();
      months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

      for (const file of this.app.vault.getMarkdownFiles()) {
        const folder = normalizePath(this.settings.calendarFolder);
        if (file.parent?.path === folder && /^\d{4}-\d{2}$/.test(file.basename)) {
          months.add(file.basename);
        }
      }

      const orderedMonths = [...months].sort();
      const eventsByMonth = new Map();
      for (const month of orderedMonths) eventsByMonth.set(month, []);
      for (const event of events) {
        const month = event.date.slice(0, 7);
        if (!eventsByMonth.has(month)) eventsByMonth.set(month, []);
        eventsByMonth.get(month).push(event);
      }

      for (const month of orderedMonths) {
        await this.writeMonth(month, eventsByMonth.get(month) || [], orderedMonths);
      }

      result = { calendars: orderedMonths.length, links: events.length };
      if (showNotice) new Notice(`${orderedMonths.length} calendário(s) mensal(is) atualizado(s).`);
    } catch (error) {
      console.error("PDTI Calendar Manager:", error);
      new Notice(`Erro ao atualizar calendários: ${error.message || error}`);
    } finally {
      this.syncing = false;
    }

    return result;
  }

  async ensureFolder(path) {
    const normalized = normalizePath(path);
    if (this.app.vault.getAbstractFileByPath(normalized)) return;
    const parts = normalized.split("/");
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current)) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  async collectEvents() {
    const events = [];
    const seen = new Set();

    const addEvent = (date, file, reason, detail = "", kind = "generic-date") => {
      const normalizedDate = this.normalizeDate(date);
      if (!normalizedDate) return;
      const key = `${normalizedDate}|${file.path}|${kind}|${detail}`;
      if (seen.has(key)) return;
      seen.add(key);
      events.push({
        date: normalizedDate,
        path: file.path,
        name: file.basename,
        kind,
        reason,
        detail: this.cleanDetail(detail)
      });
    };

    for (const file of this.app.vault.getMarkdownFiles()) {
      if (this.shouldIgnore(file.path)) continue;

      const cache = this.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter || {};
      for (const [key, value] of Object.entries(frontmatter)) {
        const normalizedKey = key.toLocaleLowerCase("pt-BR");
        if (!this.settings.includedProperties.includes(normalizedKey)) continue;
        this.walkDates(value, (date, nestedKey) => {
          const propertyKey = nestedKey ? `${key}.${nestedKey}` : key;
          const eventType = this.eventForProperty(propertyKey);
          addEvent(date, file, eventType.reason, "", eventType.kind);
        });
      }

      addEvent(this.dateFromTimestamp(file.stat.mtime), file, "Última modificação do arquivo", "", "note-updated");

      if (file.path.startsWith("07 - Diários/") && /^\d{4}-\d{2}-\d{2}$/.test(file.basename)) {
        addEvent(file.basename, file, "Diário", "", "generic-date");
      }

      const content = await this.app.vault.cachedRead(file);
      this.collectTaskDates(content, file, addEvent);
      this.collectInlineDates(content, file, addEvent);
    }

    const created = new Set(
      events.filter((event) => event.kind === "note-created").map((event) => `${event.date}|${event.path}`)
    );
    const filtered = events.filter((event) =>
      event.kind !== "note-updated" || !created.has(`${event.date}|${event.path}`)
    );

    return filtered.sort((a, b) =>
      a.date.localeCompare(b.date) || a.path.localeCompare(b.path) || a.reason.localeCompare(b.reason)
    );
  }

  walkDates(value, callback, nestedKey = "") {
    if (value == null) return;

    if (typeof value === "string" || value instanceof Date) {
      const date = this.normalizeDate(value);
      if (date) callback(date, nestedKey);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => this.walkDates(item, callback, nestedKey ? `${nestedKey}.${index + 1}` : String(index + 1)));
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([key, item]) => {
        const next = nestedKey ? `${nestedKey}.${key}` : key;
        this.walkDates(item, callback, next);
      });
    }
  }

  collectTaskDates(content, file, addEvent) {
    for (const line of content.split(/\r?\n/)) {
      const taskMatch = line.match(/^\s*[-*+]\s+\[([ xX\-\/])\]\s+(.*)$/u);
      if (!taskMatch) continue;
      const status = taskMatch[1].toLocaleLowerCase("pt-BR");
      const description = this.cleanTaskDescription(taskMatch[2]);
      const taskDates = [];
      for (const [marker, label, kind] of TASK_MARKERS) {
        const regex = new RegExp(`${this.escapeRegExp(marker)}\\s*(\\d{4}-\\d{2}-\\d{2})`, "gu");
        let match;
        while ((match = regex.exec(line)) !== null) {
          taskDates.push({ date: match[1], label, kind });
        }
      }

      const completed = taskDates.filter((event) => event.kind === "task-completed");
      if (status === "x" || completed.length) {
        completed.forEach((event) => addEvent(event.date, file, event.label, description, event.kind));
        continue;
      }

      const cancelled = taskDates.filter((event) => event.kind === "task-cancelled");
      if (status === "-" || cancelled.length) {
        cancelled.forEach((event) => addEvent(event.date, file, event.label, description, event.kind));
        continue;
      }

      for (const event of taskDates) {
        const kind = event.kind === "task-due" && event.date < this.today() ? "task-overdue" : event.kind;
        addEvent(event.date, file, event.label, description, kind);
      }
    }
  }

  collectInlineDates(content, file, addEvent) {
    const regexes = [
      /\[([^\]\n]+?)::\s*(\d{4}-\d{2}-\d{2})(?:[T ][^\]\n]*)?\]/gu,
      /\(([^)\n]+?)::\s*(\d{4}-\d{2}-\d{2})(?:[T ][^)\n]*)?\)/gu
    ];

    for (const regex of regexes) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const property = match[1].trim().toLocaleLowerCase("pt-BR");
        if (!this.settings.includedProperties.includes(property)) continue;
        const eventType = this.eventForProperty(property);
        addEvent(match[2], file, eventType.reason, "", eventType.kind);
      }
    }
  }

  normalizeDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    }

    if (typeof value !== "string") return null;
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ][0-9:.+\-Z]+)?$/u);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const candidate = new Date(Date.UTC(year, month - 1, day));
    if (
      candidate.getUTCFullYear() !== year ||
      candidate.getUTCMonth() !== month - 1 ||
      candidate.getUTCDate() !== day
    ) return null;

    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  dateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  eventForProperty(key) {
    const base = key.split(".")[0].toLocaleLowerCase("pt-BR");
    return PROPERTY_EVENTS[base] || { kind: "generic-date", reason: `Propriedade: ${this.humanize(key)}` };
  }

  humanize(value) {
    const text = String(value)
      .replace(/[._-]+/gu, " ")
      .replace(/\s+/gu, " ")
      .trim();
    if (!text) return "Data";
    return text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
  }

  cleanTaskDescription(value) {
    let result = String(value);
    for (const [marker] of TASK_MARKERS) {
      const regex = new RegExp(`${this.escapeRegExp(marker)}\\s*\\d{4}-\\d{2}-\\d{2}`, "gu");
      result = result.replace(regex, "");
    }
    result = result.replace(/\s+/gu, " ").trim();
    return this.cleanDetail(result);
  }

  cleanDetail(value) {
    const text = String(value || "").replace(/\|/gu, "\\|").trim();
    return text.length > 120 ? `${text.slice(0, 117)}…` : text;
  }

  escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  }

  async writeMonth(monthKey, events, allMonths) {
    const [yearValue, monthText] = monthKey.split("-");
    const year = Number(yearValue);
    const month = Number(monthText);
    if (!year || month < 1 || month > 12) return;

    const path = normalizePath(`${this.settings.calendarFolder}/${monthKey}.md`);
    const existing = this.app.vault.getAbstractFileByPath(path);
    let createdDate = this.today();
    if (existing instanceof TFile) {
      const cache = this.app.metadataCache.getFileCache(existing);
      const originalCreated = cache?.frontmatter?.criado;
      if (this.normalizeDate(originalCreated)) createdDate = this.normalizeDate(originalCreated);
    }

    const content = this.buildMonthContent(monthKey, year, month, events, allMonths, createdDate);
    if (existing instanceof TFile) {
      const current = await this.app.vault.cachedRead(existing);
      if (current !== content) await this.app.vault.modify(existing, content);
    } else {
      await this.app.vault.create(path, content);
    }
  }

  buildMonthContent(monthKey, year, month, events, allMonths, createdDate) {
    const eventMap = new Map();
    for (const event of events) {
      if (!eventMap.has(event.date)) eventMap.set(event.date, []);
      eventMap.get(event.date).push(event);
    }

    const position = allMonths.indexOf(monthKey);
    const previous = position > 0 ? allMonths[position - 1] : null;
    const next = position >= 0 && position < allMonths.length - 1 ? allMonths[position + 1] : null;
    const navigation = [
      previous ? `[[${previous}|← ${this.monthLabel(previous)}]]` : "",
      next ? `[[${next}|${this.monthLabel(next)} →]]` : ""
    ].filter(Boolean).join(" · ");

    const lines = [
      "---",
      `title: "${monthKey}"`,
      "aliases: []",
      "tipo: painel-calendario",
      "status: gerado",
      "sistema: PDTI",
      "projeto: PDTI",
      "dominio: gestao",
      "confidencialidade: interna",
      "gerado_por: pdti-calendar-manager",
      `ano: ${year}`,
      `mes: ${month}`,
      `criado: ${createdDate}`,
      `atualizado: ${this.today()}`,
      "cssclasses:",
      "  - calendário-mensal",
      "tags:",
      "  - pdti",
      "  - painel",
      "  - calendario",
      "---",
      "",
      `# ${MONTH_NAMES[month - 1]} de ${year}`,
      "",
      "> [!info] Atualização automática",
      "> Este calendário mostra a atividade das notas por `criado` e `atualizado`, além de datas operacionais permitidas, campos Dataview equivalentes e datas de tarefas.",
      ""
    ];

    if (navigation) lines.push(navigation, "");

    lines.push(`| ${WEEKDAYS.join(" | ")} |`);
    lines.push(`| ${WEEKDAYS.map(() => "---").join(" | ")} |`);

    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const offset = (firstDay.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cells = [];

    for (let index = 0; index < offset; index += 1) cells.push("");
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvents = eventMap.get(date) || [];
      const badges = this.groupEventsByKind(dayEvents).map(([kind, groupedEvents]) =>
        this.renderBadge(kind, groupedEvents.length)
      );
      cells.push([`**${day}**`, badges.length ? `<span class="qs-calendar-badges">${badges.join("")}</span>` : ""]
        .filter(Boolean)
        .join("<br>"));
    }

    while (cells.length % 7 !== 0) cells.push("");
    for (let index = 0; index < cells.length; index += 7) {
      lines.push(`| ${cells.slice(index, index + 7).join(" | ")} |`);
    }

    lines.push("", "## Datas do mês", "");
    if (events.length === 0) {
      lines.push("Nenhuma data estruturada foi encontrada para este mês.");
    } else {
      for (const date of [...eventMap.keys()].sort()) {
        lines.push(`### ${date.split("-").reverse().join("/")}`, "");
        for (const [kind, groupedEvents] of this.groupEventsByKind(eventMap.get(date))) {
          const type = this.eventType(kind);
          lines.push(`- ${this.renderDot(kind)} **${type.label} (${groupedEvents.length})**`);
          for (const event of groupedEvents) {
            const linkPath = event.path.replace(/\.md$/u, "");
            const detail = event.detail ? ` — ${event.detail}` : "";
            lines.push(`  - [[${linkPath}|${event.name}]]${detail}`);
          }
        }
        lines.push("");
      }
    }

    return `${lines.join("\n").trimEnd()}\n`;
  }

  eventType(kind) {
    return EVENT_TYPES[kind] || EVENT_TYPES["generic-date"];
  }

  groupEventsByKind(events) {
    const groups = new Map();
    for (const event of events) {
      if (!groups.has(event.kind)) groups.set(event.kind, []);
      groups.get(event.kind).push(event);
    }
    return [...groups.entries()].sort((a, b) => this.eventType(a[0]).order - this.eventType(b[0]).order);
  }

  renderDot(kind) {
    const type = this.eventType(kind);
    return `<span class="qs-calendar-dot qs-calendar-${type.className}" aria-label="${type.label}"></span>`;
  }

  renderBadge(kind, count) {
    const type = this.eventType(kind);
    return `<span class="qs-calendar-badge qs-calendar-${type.className}" title="${type.label}: ${count}"><span class="qs-calendar-dot"></span><span class="qs-calendar-count">${count}</span></span>`;
  }

  monthLabel(monthKey) {
    const [yearText, monthText] = monthKey.split("-");
    return `${MONTH_NAMES[Number(monthText) - 1]} de ${yearText}`;
  }

  today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
};

class PDTICalendarManagerSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "PDTI Calendar Manager" });
    containerEl.createEl("p", {
      text: "O plugin cria calendários mensais a partir das datas do frontmatter, campos Dataview, datas de tarefas, diários e da última modificação real das notas. A sincronização relê o cofre e regrava os calendários gerados para incluir links faltantes e remover links obsoletos."
    });

    const statusEl = containerEl.createEl("p", { cls: "pdti-calendar-sync-status" });
    new Setting(containerEl)
      .setName("Sincronizar calendários")
      .setDesc("Revisa todas as datas e links reconhecidos pelo plugin.")
      .addButton((button) => button
        .setButtonText("Revisar e sincronizar")
        .setCta()
        .onClick(async () => {
          button.setDisabled(true);
          statusEl.setText("Sincronização em andamento...");

          const result = await this.plugin.syncCalendars(true);
          if (result) {
            statusEl.setText(`${result.calendars} calendário(s) revisado(s), com ${result.links} link(s) indexado(s).`);
          } else {
            statusEl.setText("A sincronização não foi concluída. Consulte a notificação do Obsidian.");
          }

          button.setDisabled(false);
        }));
  }
}
