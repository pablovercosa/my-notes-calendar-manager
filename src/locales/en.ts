import type { LocaleText } from "../types";

export const en: LocaleText = {
  code: "en",
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  eventLabels: {
    "note-created": "Notes created",
    "note-updated": "Notes updated",
    "task-completed": "Tasks completed",
    "task-overdue": "Tasks overdue",
    "task-due": "Tasks due",
    "task-cancelled": "Tasks cancelled",
    review: "Reviews",
    start: "Starts",
    end: "Ends",
    deadline: "Deadlines",
    "task-start": "Task starts",
    "task-scheduled": "Tasks scheduled",
    "task-created": "Tasks created",
    "generic-date": "Other dates",
  },
  settings: {
    title: "My Notes Calendar Manager",
    calendarFolder: "Calendar folder",
    calendarFolderDescription: "Monthly calendar notes are created in this folder.",
    excludedFolders: "Excluded folders",
    excludedFoldersDescription: "Comma-separated vault paths that will not be scanned.",
    recognizedProperties: "Date properties",
    recognizedPropertiesDescription: "Comma-separated frontmatter properties containing dates.",
    includeCtime: "Include file creation time",
    includeMtime: "Include file modification time",
    includeTaskDates: "Include task dates",
    automaticSync: "Synchronize automatically",
    sync: "Synchronize calendars",
    syncDescription: "Scan the configured scope and update managed monthly calendars.",
    audit: "Review metadata",
    auditDescription: "Report missing or invalid date metadata without changing notes.",
    running: "Operation in progress...",
  },
  notices: {
    auditComplete: ({ invalidMetadata, missingMetadata, notesScanned }) =>
      `Reviewed ${notesScanned} notes: ${missingMetadata} without date metadata and ${invalidMetadata} with invalid values.`,
    invalidFolder: "Choose a valid calendar folder.",
    syncAlreadyRunning: "Calendar synchronization is already running.",
    syncComplete: ({ calendarsChanged, errors, eventsFound, notesScanned }) =>
      `Scanned ${notesScanned} notes and found ${eventsFound} events. Updated ${calendarsChanged} calendars with ${errors.length} errors.`,
    syncFailed: "Calendar synchronization failed. Check the developer console.",
  },
  calendar: {
    activity: "Activity",
    empty: "No structured dates were found for this month.",
    generatedWarning: "Managed by My Notes Calendar Manager. Content inside the markers may be overwritten.",
  },
};
