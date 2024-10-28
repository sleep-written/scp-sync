import test from 'ava';
import { SSHConfig } from './ssh-config.js';

test('Parse (well formatted)', t => {
    const target = new SSHConfig([
        'Host 192.168.99.199',
        '  HostName 192.168.99.199',
        '  User git',
        '  IdentityFile ~/.ssh/id_ñeee',
        'Host github.com-ñeee',
        '  HostName github.com',
        '  User git',
        '  IdentityFile ~/.ssh/ñeee',
        'Host *',
        '  ForwardX11 yes',
        '  ForwardX11Trusted yes'
    ].join('\n'));

    t.deepEqual(target.items, [
        {
            host: '192.168.99.199',
            params: {
                HostName:           { value: '192.168.99.199' },
                User:               { value: 'git' },
                IdentityFile:       { value: '~/.ssh/id_ñeee' },
            }
        },
        {
            host: 'github.com-ñeee',
            params: {
                HostName:           { value: 'github.com' },
                User:               { value: 'git' },
                IdentityFile:       { value: '~/.ssh/ñeee' },
            }
        },
        {
            host: '*',
            params: {
                ForwardX11:         { value: 'yes' },
                ForwardX11Trusted:  { value: 'yes' },
            }
        }
    ]);

    t.is(target.toString(), [
        'Host 192.168.99.199',
        '  HostName 192.168.99.199',
        '  User git',
        '  IdentityFile ~/.ssh/id_ñeee\n',
        'Host github.com-ñeee',
        '  HostName github.com',
        '  User git',
        '  IdentityFile ~/.ssh/ñeee\n',
        'Host *',
        '  ForwardX11 yes',
        '  ForwardX11Trusted yes'
    ].join('\n'));
});

test('Parse (well formatted with comments)', t => {
    const target = new SSHConfig([
        '# JajJAjaj holaaa 1',
        'Host 192.168.99.199',
        '  HostName 192.168.99.199',
        '  User git',
        '  IdentityFile ~/.ssh/id_ñeee\n',
        '# JajJAjaj holaaa 2',
        'Host github.com-ñeee',
        '  # Joder chaval',
        '  HostName github.com',
        '  # AjajA',
        '  # wena',
        '  User git',
        '  IdentityFile ~/.ssh/ñeee\n',
        '# JajJAjaj holaaa 3',
        'Host *',
        '  ForwardX11 yes',
        '  ForwardX11Trusted yes'
    ].join('\n'));

    t.deepEqual(target.items, [
        {
            host: '192.168.99.199',
            params: {
                HostName:           { value: '192.168.99.199' },
                User:               { value: 'git' },
                IdentityFile:       { value: '~/.ssh/id_ñeee' },
            },
            comments: 'JajJAjaj holaaa 1'
        },
        {
            host: 'github.com-ñeee',
            params: {
                HostName:           { value: 'github.com', comments: 'Joder chaval' },
                User:               { value: 'git', comments: 'AjajA\nwena' },
                IdentityFile:       { value: '~/.ssh/ñeee' },
            },
            comments: 'JajJAjaj holaaa 2'
        },
        {
            host: '*',
            params: {
                ForwardX11:         { value: 'yes' },
                ForwardX11Trusted:  { value: 'yes' },
            },
            comments: 'JajJAjaj holaaa 3'
        }
    ]);

    t.is(target.toString(), [
        '# JajJAjaj holaaa 1',
        'Host 192.168.99.199',
        '  HostName 192.168.99.199',
        '  User git',
        '  IdentityFile ~/.ssh/id_ñeee\n',
        '# JajJAjaj holaaa 2',
        'Host github.com-ñeee',
        '  # Joder chaval',
        '  HostName github.com',
        '  # AjajA',
        '  # wena',
        '  User git',
        '  IdentityFile ~/.ssh/ñeee\n',
        '# JajJAjaj holaaa 3',
        'Host *',
        '  ForwardX11 yes',
        '  ForwardX11Trusted yes'
    ].join('\n'));
});

test('Parse (chaotic format)', t => {
    const target = new SSHConfig([
        '                         Host         192.168.99.199',
        '  HostName 192.168.99.199',
        '  User        git\n\n',
        '                IdentityFile    ~/.ssh/id_ñeee',
        'Host github.com-ñeee',
        '        HostName github.com',
        '\n\n# JAjajJAj',
        '\n\n# JAjajJAj\n',
        '                User git                    ',
        '        IdentityFile ~/.ssh/ñeee',
        'Host 192.168.99.199',
        '  ForwardX11 no',
        '  ForwardX11Trusted no\n\n',
        'Host *',
        '  ForwardX11 yes',
        '  ForwardX11Trusted yes\n       '
    ].join('\n'));

    t.deepEqual(target.items, [
        {
            host: '192.168.99.199',
            params: {
                HostName:           { value: '192.168.99.199' },
                User:               { value: 'git' },
                IdentityFile:       { value: '~/.ssh/id_ñeee' },
                ForwardX11:         { value: 'no' },
                ForwardX11Trusted:  { value: 'no' },
            }
        },
        {
            host: 'github.com-ñeee',
            params: {
                HostName:           { value: 'github.com' },
                User:               { value: 'git', comments: 'JAjajJAj\nJAjajJAj' },
                IdentityFile:       { value: '~/.ssh/ñeee' },
            }
        },
        {
            host: '*',
            params: {
                ForwardX11:         { value: 'yes' },
                ForwardX11Trusted:  { value: 'yes' },
            }
        }
    ]);

    t.is(target.toString(), [
        'Host 192.168.99.199',
        '  HostName 192.168.99.199',
        '  User git',
        '  IdentityFile ~/.ssh/id_ñeee',
        '  ForwardX11 no',
        '  ForwardX11Trusted no\n',
        'Host github.com-ñeee',
        '  HostName github.com',
        '  # JAjajJAj',
        '  # JAjajJAj',
        '  User git',
        '  IdentityFile ~/.ssh/ñeee\n',
        'Host *',
        '  ForwardX11 yes',
        '  ForwardX11Trusted yes'
    ].join('\n'));
});
