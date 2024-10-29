# SCP Sync

`scp-sync` is a Node.js command-line application designed for scenarios where frequent file transfers between a local machine and a remote server are needed. With `scp-sync`, you can create profiles that simplify repetitive downloads and uploads via SCP (Secure Copy Protocol), requiring only a profile selection and password entry for each file transfer.

## Features

-   **Profile Management**: Create reusable profiles for frequent file transfers, eliminating the need to retype SCP commands.
-   **File Transfer Automation**: Automatically generate and execute SCP commands for uploading and downloading files based on selected profiles.
-   **Optional SSH Parameters**: Add `PubkeyAcceptedAlgorithms +ssh-rsa` and `HostkeyAlgorithms +ssh-rsa` options to a profile if needed for specific SSH configurations.

## Launch the application

### Download the executable

Simply download the executable [here](https://github.com/sleep-written/scp-sync/releases/tag/v0.0.2).

### Generating your executable (for Windows, requires "Node.js" v20+)

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Start the application:
   ```bash
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