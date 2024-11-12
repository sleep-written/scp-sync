import type { ConfigItem } from './auditor.js';

import { access, readFile, writeFile } from 'fs/promises';
import { basename, resolve } from 'path';
import { auditor } from './auditor.js';
import { locale } from '@/logger.js';

export class AppConfig {
    #path: string;
    get path(): string {
        return this.#path;
    }

    get basename(): string {
        return basename(this.#path);
    }

    constructor(path: string) {
        this.#path = resolve(path);
    }

    async exist(): Promise<boolean> {
        try {
            await access(this.#path);
            return true;
        } catch {
            return false;
        }
    }

    async load(): Promise<ConfigItem[]> {
        try {
            const text = await readFile(this.#path, 'utf-8');
            const json = JSON.parse(text);
            return auditor.audit(json);
        } catch (err) {
            throw new Error(
                locale.get('app-config-invalid'),
                { cause: err }
            );
        }
    }

    async save(data: ConfigItem[]): Promise<void> {
        try {
            const json = auditor.audit(data);
            const text = JSON.stringify(json, null, 4);
            await writeFile(this.#path, text, 'utf-8');
        } catch (err) {
            throw new Error(
                locale.get('app-config-generation-failed'),
                { cause: err }
            );
        }
    }
}