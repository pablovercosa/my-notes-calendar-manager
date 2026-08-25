import { getLanguage, Notice, Plugin, TFile } from "obsidian";
import { shouldIgnore } from "./calendar/collect-events";
import { syncCalendars } from "./calendar/sync-calendars";
import { createDefaultSettings, loadSettings } from "./defaults";
import { getLocale } from "./locales";
import { auditMetadata } from "./metadata/audit-metadata";
import { CalendarSettingTab, type SettingsHost } from "./settings";
import type { CalendarSettings, LocaleText, MetadataAuditResult, SyncResult } from "./types";

export default class MyNotesCalendarManager extends Plugin implements SettingsHost {
  locale: LocaleText = getLocale();
  settings: CalendarSettings = createDefaultSettings(getLanguage());

  private syncTimer: number | null = null;
  private synchronizationRunning = false;
  private synchronizationRequested = false;

  async onload(): Promise<void> {
    this.settings = loadSettings(await this.loadData(), getLanguage());

    this.addSettingTab(new CalendarSettingTab(this.app, this));
    this.addCommand({
      id: "sync-calendars",
      name: this.locale.settings.sync,
      callback: () => void this.synchronize(),
    });
    this.addCommand({
      id: "audit-metadata",
      name: this.locale.settings.audit,
      callback: () => {
        new Notice(this.locale.notices.auditComplete(this.auditMetadata()));
      },
    });

    this.registerAutomaticSynchronization();
  }

  onunload(): void {
    if (this.syncTimer !== null) window.clearTimeout(this.syncTimer);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  auditMetadata(): MetadataAuditResult {
    return auditMetadata(this.app, this.settings);
  }

  async synchronize(showNotice = true): Promise<SyncResult | null> {
    if (this.synchronizationRunning) {
      this.synchronizationRequested = true;
      if (showNotice) new Notice(this.locale.notices.syncAlreadyRunning);
      return null;
    }

    if (!this.settings.calendarFolder.trim()) {
      new Notice(this.locale.notices.invalidFolder);
      return null;
    }

    this.synchronizationRunning = true;
    let result: SyncResult | null = null;

    try {
      do {
        this.synchronizationRequested = false;
        result = await syncCalendars(this.app, this.settings, this.locale);
      } while (this.synchronizationRequested);

      if (showNotice) new Notice(this.locale.notices.syncComplete(result));
      return result;
    } catch (error) {
      console.error("My Notes Calendar Manager:", error);
      if (showNotice) new Notice(this.locale.notices.syncFailed);
      return null;
    } finally {
      this.synchronizationRunning = false;
    }
  }

  private registerAutomaticSynchronization(): void {
    this.app.workspace.onLayoutReady(() => this.queueSynchronization(400));

    this.registerEvent(this.app.metadataCache.on("changed", (file) => {
      if (this.shouldQueue(file)) this.queueSynchronization();
    }));
    this.registerEvent(this.app.vault.on("create", (file) => {
      if (this.shouldQueue(file)) this.queueSynchronization();
    }));
    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (this.shouldQueue(file)) this.queueSynchronization();
    }));
    this.registerEvent(this.app.vault.on("delete", (file) => {
      if (this.shouldQueue(file)) this.queueSynchronization();
    }));
    this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
      const relevantNewPath = this.shouldQueue(file);
      const relevantOldPath = oldPath.endsWith(".md") && !shouldIgnore(oldPath, this.settings);
      if (relevantNewPath || relevantOldPath) this.queueSynchronization();
    }));
  }

  private shouldQueue(file: unknown): file is TFile {
    return this.settings.automaticSync
      && file instanceof TFile
      && file.extension === "md"
      && !shouldIgnore(file.path, this.settings);
  }

  private queueSynchronization(delay = this.settings.debounceMs): void {
    if (!this.settings.automaticSync) return;
    if (this.syncTimer !== null) window.clearTimeout(this.syncTimer);

    this.syncTimer = window.setTimeout(() => {
      this.syncTimer = null;
      void this.synchronize(false);
    }, delay);
  }
}
