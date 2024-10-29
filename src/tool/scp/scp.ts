import { cmd } from './cmd.js';

export interface Connection {
    hostname: string;
    username: string;
}

export class SCP {
    #connection: Connection;

    constructor(connection: Connection) {
        this.#connection = connection;
    }

    async sendFile(localPath: string, remotePath: string, useRSA?: boolean): Promise<void> {
        const { hostname, username } = this.#connection;
        const args = [ localPath, `${username}@${hostname}:${remotePath}` ];
        if (useRSA) {
            args.unshift('-o', 'HostKeyAlgorithms=ssh-rsa');
        }

        await cmd('scp', ...args);
    }

    async getFile(localPath: string, remotePath: string, useRSA?: boolean): Promise<void> {
        const { hostname, username } = this.#connection;
        const args = [ `${username}@${hostname}:${remotePath}`, localPath ];
        if (useRSA) {
            args.unshift('-o', 'HostKeyAlgorithms=ssh-rsa');
        }

        await cmd('scp', ...args);
    }
}
