import type { LocaleInject, LocaleData } from './interfaces/index.js';

import { getLang } from './get-lang.js';
import { getData } from './get-data.js';

export class Locale {
    #inject: LocaleInject;
    #data?: LocaleData[];
    #lang?: string;

    constructor(inject?: Partial<LocaleInject>) {
        this.#inject = {
            getLang,
            getData,
            ...(inject ?? {}),
        };
    }

    get(
        code: string,
        params?: Record<string, any>
    ): string {
        if (!this.#data) {
            this.#data = this.#inject.getData();
        }

        if (!this.#lang) {
            this.#lang = this.#inject.getLang();
        }

        const item = this.#data.find(x => x.code === code);
        let text = item?.[this.#lang] ?? item?.['en']!;
        if (typeof text !== 'string') {
            throw new Error(`The locale message with code "${code}" isn't found.`);
        }

        if (params) {
            for (const [ key, value ] of Object.entries(params)) {
                text = text.replaceAll(`\${${key}}`, value);
            }
        }

        return text;
    }
}