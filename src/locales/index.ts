import { getLanguage } from "obsidian";
import type { LocaleText } from "../types";
import { en } from "./en";
import { ptBR } from "./pt-BR";

export function getLocale(language = getLanguage()): LocaleText {
  return language.toLowerCase().startsWith("pt") ? ptBR : en;
}
