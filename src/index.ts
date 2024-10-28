import { resolve } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

import { AppConfig, ConfigManager } from '@tool/app-config/index.js';
import { pressAnyKey, logger } from './logger.js';
import { SSHConfig } from '@tool/ssh-config/index.js';
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
                                if (value.type === 'upload') {
                                    await scp.sendFile(value.localPath, value.remotePath);
                                } else {
                                    await scp.getFile(value.localPath, value.remotePath);
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
                        name: '→ Patch ssh config',
                        value: async () => {
                            console.log('');
                            console.log('  This options creates/modify the file "~/.ssh/config",');
                            console.log(`  adding to the "${value.hostname}" these parameters:`);
                            console.log(`  - PubkeyAcceptedAlgorithms +ssh-rsa`);
                            console.log(`  - HostkeyAlgorithms +ssh-rsa\n`);
                            const menu = new Menu('Are you sure?', [
                                {
                                    name: 'No...'
                                },
                                {
                                    name: 'Yes!!!',
                                    value: async () => {
                                        const sshConfig = await SSHConfig.load();
                                        sshConfig.set(value.hostname, {
                                            PubkeyAcceptedAlgorithms: {
                                                value: '+ssh-rsa',
                                            },
                                            HostkeyAlgorithms: {
                                                value: '+ssh-rsa',
                                            },
                                        });
                                        await sshConfig.save();
                                        console.log(`  The file "~/.ssh/config" has been successfully patched!\n`);
                                        await pressAnyKey();
                                    }
                                },
                            ]);

                            await menu.execute();
                        }
                    },
                    {
                        name: '→ Modify',
                        value: new Menu('Are you sure?', [
                            { name: 'No...' },
                            { name: 'Yes!!!', value: () => configManager.set({ value, index }) },
                        ])
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