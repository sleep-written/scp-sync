# SCP Sync

`scp-sync` is a Node.js command-line application designed for scenarios where frequent file transfers between a local machine and a remote server are needed. With `scp-sync`, you can create profiles that simplify repetitive downloads and uploads via SCP (Secure Copy Protocol), requiring only a profile selection and password entry for each file transfer.

## Features

-  **Profile Management**: Create reusable profiles for frequent file transfers, eliminating the need to retype SCP commands.
-  **File Transfer Automation**: Automatically generate and execute SCP commands for uploading and downloading files based on selected profiles.
-  **Optional SSH Parameters**: Add `PubkeyAcceptedAlgorithms +ssh-rsa` and `HostkeyAlgorithms +ssh-rsa` options to a profile if needed for specific SSH configurations.
-  **Multi language support**: Now the interface changes according the OS language. For now the app has english (default) and spanish support.

## Launch the application

### Download the executable

Simply download the executable [here](https://github.com/sleep-written/scp-sync/releases/tag/v0.0.3).

### Generating your executable (for Windows, requires "Node.js" v20+)

1. Install dependencies:
   ```ps
   npm ci
   ```

2. Install all required build tools (and dependencies):
   ```ps
   Set-ExecutionPolicy Unrestricted -Force
   iex ((New-Object System.Net.WebClient).DownloadString('https://boxstarter.org/bootstrapper.ps1'))
   get-boxstarter -Force
   Install-BoxstarterPackage https://raw.githubusercontent.com/nodejs/node/master/tools/bootstrap/windows_boxstarter -DisableReboots
   ```

2. Compile the application:
   ```ps
   npm run build
   ```

### Through source code directly (requires "Node.js" v20+)

1. Install dependencies:
   ```bash
   npm ci
   ```
   
2. Start the application:
   ```bash
   npm run start
   ```

## Usage

1.  **Create a Profile**:
    Select the "Add" option, and set the following parameters:
    -   `Process name`: An identifier for the process.
    -   `Process type`: Either `upload` or `download`.
    -   `Remote host`: The target server's hostname or IP address.
    -   `User name`: The SSH username.
    -   `Local path`: Path to the file/folder on the local machine.
    -   `Remote path`: Path on the remote server for upload/download.

2.  **Execute a Transfer**:
    -    Select a profile and press the "Execute" option to initialize the desired file transfer. The app will prompt for your SSH password, then handle the SCP command execution automatically.

3.  **Patch for legacy algorithms**:
    -    During profile setup, you can specify `PubkeyAcceptedAlgorithms +ssh-rsa` and `HostkeyAlgorithms +ssh-rsa` to accommodate legacy SSH settings if necessary.