import { normalizePath, Plugin, PluginSettingTab, Setting, type App } from "obsidian";
import type { CalendarSettings, LocaleText, MetadataAuditResult, SyncResult } from "./types";

export interface SettingsHost {
  locale: LocaleText;
  settings: CalendarSettings;
  auditMetadata(): MetadataAuditResult;
  saveSettings(): Promise<void>;
  synchronize(): Promise<SyncResult | null>;
}

export class CalendarSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly host: SettingsHost & Plugin) {
    super(app, host);
  }

  display(): void {
    const { containerEl } = this;
    const { locale, settings } = this.host;
    containerEl.empty();
    containerEl.createEl("h2", { text: locale.settings.title });

    new Setting(containerEl)
      .setName(locale.settings.calendarFolder)
      .setDesc(locale.settings.calendarFolderDescription)
      .addText((text) => text
        .setValue(settings.calendarFolder)
        .onChange(async (value) => {
          settings.calendarFolder = normalizePath(value.trim());
          await this.host.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settings.excludedFolders)
      .setDesc(locale.settings.excludedFoldersDescription)
      .addTextArea((text) => text
        .setValue(settings.excludedFolders.join(", "))
        .onChange(async (value) => {
          settings.excludedFolders = parseList(value);
          await this.host.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settings.recognizedProperties)
      .setDesc(locale.settings.recognizedPropertiesDescription)
      .addTextArea((text) => text
        .setValue(settings.recognizedProperties.join(", "))
        .onChange(async (value) => {
          settings.recognizedProperties = parseList(value);
          await this.host.saveSettings();
        }));

    this.addToggle(locale.settings.includeCtime, "includeCtime");
    this.addToggle(locale.settings.includeMtime, "includeMtime");
    this.addToggle(locale.settings.includeTaskDates, "includeTaskDates");
    this.addToggle(locale.settings.automaticSync, "automaticSync");

    const status = containerEl.createEl("p", { cls: "mncm-sync-status" });

    new Setting(containerEl)
      .setName(locale.settings.sync)
      .setDesc(locale.settings.syncDescription)
      .addButton((button) => button
        .setButtonText(locale.settings.sync)
        .setCta()
        .onClick(async () => {
          button.setDisabled(true);
          status.setText(locale.settings.running);
          const result = await this.host.synchronize();
          status.setText(result ? locale.notices.syncComplete(result) : locale.notices.syncFailed);
          button.setDisabled(false);
        }));

    new Setting(containerEl)
      .setName(locale.settings.audit)
      .setDesc(locale.settings.auditDescription)
      .addButton((button) => button
        .setButtonText(locale.settings.audit)
        .onClick(() => {
          status.setText(locale.notices.auditComplete(this.host.auditMetadata()));
        }));
  }

  private addToggle(label: string, key: BooleanSettingKey): void {
    new Setting(this.containerEl)
      .setName(label)
      .addToggle((toggle) => toggle
        .setValue(this.host.settings[key])
        .onChange(async (value) => {
          this.host.settings[key] = value;
          await this.host.saveSettings();
        }));
  }
}

type BooleanSettingKey = {
  [Key in keyof CalendarSettings]: CalendarSettings[Key] extends boolean ? Key : never;
}[keyof CalendarSettings];

function parseList(value: string): string[] {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}
