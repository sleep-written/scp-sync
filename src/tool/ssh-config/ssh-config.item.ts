export interface SSHConfigParam {
    value: string;
    comments?: string;
}

export interface SSHConfigItem {
    host: string;
    params: Record<string, SSHConfigParam>;
    comments?: string;
}
