import type { LocaleText } from "../types";

export const ptBR: LocaleText = {
  code: "pt-BR",
  months: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ],
  weekdays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
  eventLabels: {
    "note-created": "Notas criadas",
    "note-updated": "Notas modificadas",
    "task-completed": "Tarefas concluídas",
    "task-overdue": "Tarefas atrasadas",
    "task-due": "Tarefas com vencimento",
    "task-cancelled": "Tarefas canceladas",
    review: "Revisões",
    start: "Inícios",
    end: "Términos",
    deadline: "Prazos",
    "task-start": "Inícios de tarefas",
    "task-scheduled": "Tarefas agendadas",
    "task-created": "Tarefas criadas",
    "generic-date": "Outras datas",
  },
  settings: {
    title: "My Notes Calendar Manager",
    calendarFolder: "Pasta dos calendários",
    calendarFolderDescription: "As notas mensais de calendário serão criadas nesta pasta.",
    excludedFolders: "Pastas excluídas",
    excludedFoldersDescription: "Caminhos do cofre separados por vírgula que não serão examinados.",
    recognizedProperties: "Propriedades de data",
    recognizedPropertiesDescription: "Propriedades do frontmatter com datas, separadas por vírgula.",
    includeCtime: "Incluir data de criação do arquivo",
    includeMtime: "Incluir data de modificação do arquivo",
    includeTaskDates: "Incluir datas de tarefas",
    automaticSync: "Sincronizar automaticamente",
    sync: "Sincronizar calendários",
    syncDescription: "Examina o escopo configurado e atualiza os calendários mensais gerenciados.",
    audit: "Revisar metadados",
    auditDescription: "Informa metadados ausentes ou inválidos sem alterar as notas.",
    running: "Operação em andamento...",
  },
  notices: {
    auditComplete: ({ invalidMetadata, missingMetadata, notesScanned }) =>
      `${notesScanned} notas revisadas: ${missingMetadata} sem metadados de data e ${invalidMetadata} com valores inválidos.`,
    invalidFolder: "Escolha uma pasta válida para os calendários.",
    syncAlreadyRunning: "A sincronização dos calendários já está em andamento.",
    syncComplete: ({ calendarsChanged, errors, eventsFound, notesScanned }) =>
      `${notesScanned} notas examinadas e ${eventsFound} eventos encontrados. ${calendarsChanged} calendários atualizados, com ${errors.length} erros.`,
    syncFailed: "A sincronização falhou. Consulte o console de desenvolvimento.",
  },
  calendar: {
    activity: "Atividade",
    empty: "Nenhuma data estruturada foi encontrada para este mês.",
    generatedWarning: "Gerenciado pelo My Notes Calendar Manager. O conteúdo entre os marcadores pode ser sobrescrito.",
  },
};
