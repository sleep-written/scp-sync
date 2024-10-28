$tsConfig = "tsconfig.build.json"
$seaConfig = "sea-config.json"
$execOutput = "app.exe"
$blobOutput = (Get-Content $seaConfig -Raw | ConvertFrom-Json).output
$distFolder = (Get-Content "tsconfig.json" -Raw | ConvertFrom-Json).compilerOptions.outDir

function Clean-Files {
    param([boolean]$removeExec)

    if (Test-Path $distFolder) {
        Write-host "Deleting ""$distFolder""..."
        Remove-Item -Path $distFolder -Recurse
    }

    if (Test-Path $blobOutput) {
        Write-host "Deleting ""$blobOutput""..."
        Remove-Item -Path $blobOutput
    }

    if ((Test-Path $execOutput) -and ($removeExec)) {
        Write-host "Deleting ""$execOutput""..."
        Remove-Item -Path $execOutput
    }
}

function Build-Exec {
    Clean-Files($true)

    Write-Output "Transpiling project..."
    npx bb-path-alias build $tsConfig
    npx rollup -c

    Write-Output "Generating blob..."
    node --input-type=module --experimental-sea-config $seaConfig

    Write-Output "Populating executable..."
    node -e "require('fs').copyFileSync(process.execPath, '$execOutput');"
    signtool remove /s $execOutput

    npx postject $execOutput NODE_SEA_BLOB $blobOutput `
        --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

    Clean-Files($false)
}

function Show-Help {
    Write-Host "Command list:"
    Write-Host "-------------"
    Write-Host "build - Generates the executable from the source file."
    Write-Host "clean - Delete all compiled files and folder."
    Write-Host
}

switch ($args[0]) {
    "clean" {
        Clean-Files($true)
    }

    "build" {
        Build-Exec
    }

    default {
        Show-Help
    }
}