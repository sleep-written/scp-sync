import { createPrompt, useKeypress } from '@inquirer/core';
import { Locale } from '@tool/locale/index.js';
import { Logger } from 'tslog';

export const logger = new Logger({
    name: 'scp-sync',
    prettyLogTemplate: [
        // '{{name}}',
        // '[{{hh}}:{{MM}}:{{ss}}.{{ms}}]',
        '→ {{logLevelName}}\t: '
    ].join(' ')
});

export const locale = new Locale();
export async function pressAnyKey(message?: string): Promise<void> {
    const input = createPrompt<void, {}>((_, done) => {
        // Llamamos a done() en cualquier tecla presionada
        useKeypress(() => done());
        return message ?? 'Press any key to continue...';
    });

    await input({});
}