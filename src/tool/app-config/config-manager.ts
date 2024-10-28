import type { ConfigItem } from './auditor.js';

import * as inquirer from '@inquirer/prompts';
import { AppConfig } from './app-config.js';

interface Inject {
    getParams: Record<
        keyof ConfigItem,
        (
            v?: string,
            s?: AbortSignal
        ) => Promise<string>
    >;
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
                    message: `Set the process name: `,
                    required: true
                }, { signal })),
                type: inject?.getParams?.type ?? ((v, signal) => inquirer.select<ConfigItem['type']>({
                    default: v,
                    message: `Set the process type: `,
                    choices: [ 'upload', 'download' ]
                }, { signal })),
                hostname: inject?.getParams?.hostname ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: `Set the remote host: `,
                    required: true
                }, { signal })),
                username: inject?.getParams?.username ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: `Set the user name: `,
                    required: true
                }, { signal })),
                localPath: inject?.getParams?.localPath ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: `Set the local path: `,
                    required: true
                }, { signal })),
                remotePath: inject?.getParams?.remotePath ?? ((v, signal) => inquirer.input({
                    default: v,
                    message: `Set the remote path: `,
                    required: true
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
            title:      await getParams.title     ( value?.title ),
            type:       await getParams.type      ( value?.type ) as any,
            hostname:   await getParams.hostname  ( value?.hostname ),
            username:   await getParams.username  ( value?.username ),
            localPath:  await getParams.localPath ( value?.localPath ),
            remotePath: await getParams.remotePath( value?.remotePath ),
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