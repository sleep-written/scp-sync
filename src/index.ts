import { resolve } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

import { pressAnyKey, logger, locale } from './logger.js';
import { AppConfig, ConfigManager } from '@tool/app-config/index.js';
import { Menu } from '@tool/menu/index.js';
import { SCP } from '@tool/scp/index.js';

async function main(): Promise<void> {
    let loop = true;
    const configPath = process.argv.some(x => x === '--debug')
        ?   resolve('./.scp-sync.config.json')
        :   resolve(homedir(), '.scp-sync.config.json');

    while (loop) {
        console.clear();
        logger.info(locale.get('main-menu-title'));

        const config = new AppConfig(configPath);
        const configManager = new ConfigManager({ config });
        const configData = await configManager.get();
        const menu = new Menu(locale.get('main-menu-message'), [
            ...configData.map((value, index) => ({
                name: '→ ' + value.title,
                value: new Menu(locale.get('profile-menu-title', { name: value.title }), [
                    {
                        name: locale.get('profile-menu-option-execute'),
                        async value(): Promise<void> {
                            try {
                                console.log('');
                                logger.info(locale.get('transfer-initialize'));
                                const scp = new SCP(value);
                                const { localPath, remotePath, useRSA } = value;
                                if (value.type === 'upload') {
                                    await scp.sendFile(localPath, remotePath, useRSA);
                                } else {
                                    await scp.getFile(localPath, remotePath, useRSA);
                                }
                                
                                logger.info(locale.get('transfer-complete'));
                                await pressAnyKey();

                            } catch (err: any) {
                                logger.info(locale.get('transfer-failed'));
                                const message = (err?.message as string)
                                    .split(/\n/gi)
                                    .map(x => chalk.grey(`\t  ${x}`));

                                console.log(message.join('\n'));
                                await pressAnyKey();

                            }
                        }
                    },
                    {
                        name: locale.get('profile-menu-option-modify'),
                        value: () => configManager.set({ value, index })
                    },
                    {
                        name: locale.get('profile-menu-option-delete'),
                        value: new Menu(locale.get('profile-menu-option-delete-message'), [
                            {
                                name: locale.get('profile-menu-option-delete-false')
                            },
                            {
                                name: locale.get('profile-menu-option-delete-true'),
                                value: () => configManager.del(index)
                            },
                        ])
                    },
                    {
                        name: locale.get('profile-menu-option-return'),
                    }
                ])
            })),
            {
                name: locale.get('main-menu-option-add'),
                value(): Promise<void> {
                    return configManager.set();
                }
            },
            {
                name: locale.get('main-menu-option-exit'),
                async value(): Promise<void> {
                    loop = false;
                }
            }
        ]);

        await menu.execute();
    }
}

main()
    .then (()  =>   logger.info(locale.get('main-menu-complete')))
    .catch(err =>   logger.error(err?.message));