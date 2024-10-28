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

    async sendFile(localPath: string, remotePath: string): Promise<void> {
        const { hostname, username } = this.#connection;
        await cmd('scp', localPath, `${username}@${hostname}:${remotePath}`);
    }

    async getFile(localPath: string, remotePath: string): Promise<void> {
        const { hostname, username } = this.#connection;
        await cmd('scp', `${username}@${hostname}:${remotePath}`, localPath);
    }
}
