import type { MenuItem } from './menu-item.js';
import * as inquirer from '@inquirer/prompts';

export class Menu {
    #message: string;
    #choices: MenuItem[] = [];

    constructor(message: string, choices: MenuItem[]) {
        this.#message = message;
        this.#choices = choices;
    }

    async execute(): Promise<void> {
        const result = await inquirer.select({
            message: this.#message,
            choices: this.#choices.map(({ name, value }) => ({
                name,
                value: value ?? null
            })),
        });

        if (result instanceof Menu) {
            return result.execute();
        } else if (result) {
            return result();
        }
    }
}