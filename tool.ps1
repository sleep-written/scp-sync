$TsConfig = "tsconfig.build.json";
$SeaConfig = "sea-config.json";
$ExecOutput = "scp-sync.exe";
$BlobOutput = (Get-Content $SeaConfig -Raw      | ConvertFrom-Json).output;
$DistFolder = (Get-Content "tsconfig.json" -Raw | ConvertFrom-Json).compilerOptions.outDir;

function Clear-Files {
    param([boolean]$RemoveExec);

    if (Test-Path $DistFolder) {
        Write-host "Deleting ""$DistFolder""...";
        Remove-Item -Path $DistFolder -Recurse;
    }

    if (Test-Path $BlobOutput) {
        Write-host "Deleting ""$BlobOutput""...";
        Remove-Item -Path $BlobOutput;
    }

    if ((Test-Path $ExecOutput) -and ($RemoveExec)) {
        Write-host "Deleting ""$ExecOutput""...";
        Remove-Item -Path $ExecOutput;
    }
}

function Write-Executable {
    Clear-Files -RemoveExec $true;

    Write-Output "Transpiling project...";
    npx bb-path-alias build $TsConfig;
    npx rollup -c;
    # npx nexe -i $DistFolder\bundle.cjs -r ./locale.csv -o $ExecOutput --build --verbose;

    Write-Output "Generating blob..."
    node --input-type=module --experimental-sea-config $SeaConfig

    Write-Output "Populating executable..."
    node -e "require('fs').copyFileSync(process.execPath, '$ExecOutput');"
    signtool remove /s $ExecOutput

    npx postject $ExecOutput NODE_SEA_BLOB $BlobOutput `
        --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

    Clear-Files -RemoveExec $false;
}

function Show-Help {
    Write-Host "Command list:";
    Write-Host "-------------";
    Write-Host "build - Generates the executable from the source file.";
    Write-Host "clean - Delete all compiled files and folder.";
    Write-Host;
}

switch ($args[0]) {
    "clean" {
        Clear-Files -RemoveExec $true;
    }

    "build" {
        Clear-Files -RemoveExec $true;
        Write-Executable;
    }

    default {
        Show-Help;
    }
}