import { spawn } from 'child_process';

export async function cmd(command: string, ...args: string[]) {
    return new Promise<string>((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: process.cwd()
        });

        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];

        child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
        child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
        child.once('close', code => {
            if (code !== 0) {
                child.stdout.removeAllListeners();
                child.stderr.removeAllListeners();
                child.removeAllListeners();
                child.kill();
                
                const message = Buffer
                    .concat(stderr)
                    .toString('utf-8');

                reject(new Error(message ?? 'Error no identificado...'));
            } else {
                const message = Buffer
                    .concat(stdout)
                    .toString('utf-8');

                resolve(message);
            }
        });
    });
}