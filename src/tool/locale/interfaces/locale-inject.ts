import type { LocaleData } from './locale-data.js';

export interface LocaleInject {
    getLang(): string;
    getData(): LocaleData[];
}