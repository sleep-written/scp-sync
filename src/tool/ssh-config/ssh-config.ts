import type { SSHConfigItem, SSHConfigParam } from './ssh-config.item.js';

import { access, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

export class SSHConfig {
    static async load(): Promise<SSHConfig> {
        const path = join(homedir(), '.ssh/config');
        const exist = await access(path)
            .then(_ => true)
            .catch(_ => false);

        if (exist) {
            const text = await readFile(path, 'utf-8');
            return new SSHConfig(text);
        } else {
            return new SSHConfig([]);
        }
    }

    #items: SSHConfigItem[] = [];
    get items(): SSHConfigItem[] {
        return this.#items;
    }

    constructor(input: string | SSHConfigItem[]) {
        if (typeof input === 'string') {
            // Parse an string into a serialized array
            const commRegExp = /^\s*#\s?/gi;
            const lines = input
                .replace(/\n+/gi, '\n')
                // .replace(/(?<!#)( +)/gi, ' ')
                .trim()
                .split(/\n+/gi)
                .map(x => x.trim());
    
            let comments: string | undefined;
            let item: SSHConfigItem | undefined;
            for (const line of lines) {
                const host = line.match(/(?<=host\s+).+(?=\s*$)/gi)?.[0]?.trim();
                if (typeof host === 'string') {
                    if (item) {
                        this.set(item.host, item.params, item.comments);
                    }
    
                    item = this.#items.find(x => x.host === host);
                    if (!item) {
                        item = { host, params: {} };
                    } else if (typeof comments !== 'string') {
                        comments = item.comments;
                    } else if (typeof item.comments === 'string') {
                        comments = `${comments}\n${item.comments}`;
                    }

                    if (typeof comments === 'string') {
                        item.comments = comments.trimEnd();
                        comments = undefined;
                    }
    
                } else if (line.match(commRegExp)) {
                    const result = line.replace(commRegExp, '');
                    if (typeof comments === 'string') {
                        comments += `\n${result}`;
                    } else {
                        comments = result;
                    }

                } else if (item) {
                    const [ key, ...valueParts ] = line
                        .trim()
                        .split(/\s+/gi);
    
                    const [ value, ...commentParts ] = valueParts
                        .join(' ')
                        .split('#');

                    if (commentParts.length > 0) {
                        const result = commentParts.join(' ');
                        if (typeof comments === 'string') {
                            comments += `\n${result}`;
                        } else {
                            comments = result;
                        }
                    }

                    item.params[key] = { value };
                    if (typeof comments === 'string')  {
                        item.params[key].comments = comments.trimEnd();
                        comments = undefined;
                    }
    
                }
            }
    
            if (item) {
                this.set(item.host, item.params, item.comments);
            }

        } else {
            // Assign the serialized array
            this.#items = input;

        }
    }

    set(host: string, params: Record<string, SSHConfigParam>, comments?: string): this {
        let item = this.#items.find(x => x.host === host);
        if (item) {
            if (typeof comments === 'string') {
                item.comments = comments;
            } else {
                delete item.comments;
            }

            for (const [ key, value ] of Object.entries(params)) {
                item.params[key] = value;
            }

        } else {
            const item = { host, params, comments };
            if (typeof comments === 'string') {
                item.comments = comments;
            } else {
                delete item.comments;
            }

            this.#items.push(item);

        }

        return this;
    }

    toString(): string {
        let out = '';
        for (const { host, params, comments } of this.#items) {
            if (typeof comments === 'string') {
                out += `# ${comments}\n`;
            }

            out += `Host ${host}\n`;
            for (const [ key, { value, comments } ] of Object.entries(params)) {
                if (typeof comments === 'string') {
                    out += comments
                        .split('\n')
                        .map(x => `  # ${x}\n`)
                        .join('');
                }
                out += `  ${key} ${value}\n`;
            }
            out += '\n';
        }

        return out.trim();
    }

    save(): Promise<void> {
        const path = join(homedir(), '.ssh/config');
        const text = this.toString();
        return writeFile(path, text, 'utf-8');
    }
}