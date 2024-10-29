import { resolve } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

import { AppConfig, ConfigManager } from '@tool/app-config/index.js';
import { pressAnyKey, logger } from './logger.js';
import { Menu } from '@tool/menu/index.js';
import { SCP } from '@tool/scp/index.js';

async function main(): Promise<void> {
    let loop = true;
    const configPath = process.argv.some(x => x === '--debug')
        ?   resolve('./.anzio-transfer.json')
        :   resolve(homedir(), '.anzio-transfer.json');

    while (loop) {
        console.clear();
        logger.info('Main menu.');

        const config = new AppConfig(configPath);
        const configManager = new ConfigManager({ config });
        const configData = await configManager.get();
        const menu = new Menu('Select an option:', [
            ...configData.map((value, index) => ({
                name: '→ ' + value.title,
                value: new Menu('Options:', [
                    {
                        name: '→ Execute',
                        async value(): Promise<void> {
                            try {
                                console.log('');
                                logger.info('Initialize transfer...');
                                const scp = new SCP(value);
                                const { localPath, remotePath, useRSA } = value;
                                if (value.type === 'upload') {
                                    await scp.sendFile(localPath, remotePath, useRSA);
                                } else {
                                    await scp.getFile(localPath, remotePath, useRSA);
                                }
                                
                                logger.info('Transfer complete!');
                                await pressAnyKey();

                            } catch (err: any) {
                                logger.error('Transfer failed:');
                                const message = (err?.message as string)
                                    .split(/\n/gi)
                                    .map(x => chalk.grey(`\t  ${x}`));

                                console.log(message.join('\n'));
                                await pressAnyKey();

                            }
                        }
                    },
                    {
                        name: '→ Modify',
                        value: () => configManager.set({ value, index })
                    },
                    {
                        name: '→ Delete',
                        value: new Menu('Are you sure?', [
                            { name: 'No...' },
                            { name: 'Yes!!!', value: () => configManager.del(index) },
                        ])
                    },
                    { name: '← Return' }
                ])
            })),
            {
                name: '→ Add',
                value(): Promise<void> {
                    return configManager.set();
                }
            },
            {
                name: '→ Exit',
                async value(): Promise<void> {
                    loop = false;
                }
            }
        ]);

        await menu.execute();
    }
}

main()
    .then(() => logger.info('Complete!'))
    .catch(err => logger.error(err?.message));