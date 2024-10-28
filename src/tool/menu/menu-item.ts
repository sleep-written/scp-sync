import type { Menu } from './menu.js';

export interface MenuItem {
    name: string;
    value?: Menu | (() => Promise<void>);
}
