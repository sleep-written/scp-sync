import type { LocaleData } from './interfaces/locale-data.js';

import { getAsset, isSea } from 'node:sea';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';

export function getData(): LocaleData[] {
    let text: string;
    if (!isSea()) {
        const path = join(process.cwd(), './locale.csv');
        text = readFileSync(path, 'utf-8');
    } else {
        text = getAsset('locale.csv', 'utf-8');
    }

    return parse(text, {
        columns: true,
        encoding: 'utf-8',
        autoParse: true,
        autoParseDate: true,
        delimiter: ';'
    });
}