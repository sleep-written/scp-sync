import { Auditor } from 'audit-var';

export const auditor = new Auditor({
    type: 'array',
    items: {
        type: 'object',
        keys: {
            title:      { type: 'string' },
            username:   { type: 'string' },
            hostname:   { type: 'string' },
            localPath:  { type: 'string' },
            remotePath: { type: 'string' },
            type:       {
                type: 'enum',
                values: [ 'upload', 'download' ] as const
            }
        }
    }
})

type AuditorItem = Auditor<typeof auditor['structure']['items']>;
export type ConfigItem = ReturnType<AuditorItem['audit']>;