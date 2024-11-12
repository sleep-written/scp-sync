export function getLang(): string {
    const { locale } = Intl
        .DateTimeFormat()
        .resolvedOptions();

    return locale
        .replace(/-.+$/gi, '');
}