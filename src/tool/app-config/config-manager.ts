import type { ConfigItem } from './auditor.js';

import * as inquirer from '@inquirer/prompts';
import { AppConfig } from './app-config.js';
import { locale } from '@/logger.js';

interface Inject {
    getParams: {
        [K in keyof ConfigItem]: (
            v?: ConfigItem[K],
            s?: AbortSignal
        ) => Promise<ConfigItem[K]>
    };
    config: {
        exist(): Promise<boolean>;
        load(): Promise<ConfigItem[]>;
        save(v: ConfigItem[]): Promise<void>;
    }
}

export class ConfigManager {
    #inject: Inject;

    constructor(inject?: Partial<Inject>) {
        this.#inject = {
            config: inject?.config ?? new AppConfig('./.anzio-transfer'),
            getParams: {
                title: inject?.getParams?.title ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: locale.get('app-config-set-title'),
                    required: true
                }, { signal })),
                type: inject?.getParams?.type ?? ((v, signal) => inquirer.select<ConfigItem['type']>({
                    default: v,
                    message: locale.get('app-config-set-type'),
                    choices: [
                        { name: locale.get('app-config-type-option-upload'),   value: 'upload', },
                        { name: locale.get('app-config-type-option-download'), value: 'download' },
                    ]
                }, { signal })),
                hostname: inject?.getParams?.hostname ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: locale.get('app-config-set-hostname'),
                    required: true
                }, { signal })),
                username: inject?.getParams?.username ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: locale.get('app-config-set-username'),
                    required: true
                }, { signal })),
                localPath: inject?.getParams?.localPath ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: locale.get('app-config-set-local-path'),
                    required: true
                }, { signal })),
                remotePath: inject?.getParams?.remotePath ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: locale.get('app-config-set-remote-path'),
                    required: true
                }, { signal })),
                useRSA: inject?.getParams?.useRSA ?? ((v, signal) => inquirer.confirm({
                    default: v,
                    message: locale.get('app-config-set-ssh-rsa'),
                }, { signal })),
            }
        };
    }

    async get(): Promise<ConfigItem[]> {
        const { config } = this.#inject;
        const data = await config.exist()
            ?   await config.load()
            :   [];

        return data;
    }

    async set(original?: { index: number; value: ConfigItem }): Promise<void> {
        const { index, value } = original ?? {};
        const { getParams } = this.#inject;

        const data = await this.get();
        const item: ConfigItem = {
            title:      await getParams.title       ( value?.title ),
            type:       await getParams.type        ( value?.type ) as any,
            hostname:   await getParams.hostname    ( value?.hostname ),
            username:   await getParams.username    ( value?.username ),
            localPath:  await getParams.localPath   ( value?.localPath ),
            remotePath: await getParams.remotePath  ( value?.remotePath ),
            useRSA:     await getParams.useRSA      ( value?.useRSA ),
        };

        if (typeof index === 'number') {
            data.splice(index ?? 0, 1, item);
        } else {
            data.push(item);
        }

        return this.#inject.config.save(data);
    }

    async del(index: number): Promise<void> {
        const data = await this.get();
        data.splice(index, 1);
        return this.#inject.config.save(data);
    }
}