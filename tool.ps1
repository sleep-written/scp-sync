$tsConfig = "tsconfig.build.json"
$execOutput = "scp-sync.exe"
$distFolder = (Get-Content "tsconfig.json" -Raw | ConvertFrom-Json).compilerOptions.outDir

function Clear-Files {
    param([boolean]$removeExec)

    if (Test-Path $distFolder) {
        Write-host "Deleting ""$distFolder""..."
        Remove-Item -Path $distFolder -Recurse
    }

    if ((Test-Path $execOutput) -and ($removeExec)) {
        Write-host "Deleting ""$execOutput""..."
        Remove-Item -Path $execOutput
    }
}

function Write-Executable {
    Clear-Files($true)

    Write-Output "Transpiling project..."
    npx bb-path-alias build $tsConfig
    npx nexe -i $distFolder\index.js -o $execOutput --build

    Clear-Files($false)
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
        Clear-Files($true)
    }

    "build" {
        Write-Executable
    }

    default {
        Show-Help
    }
}