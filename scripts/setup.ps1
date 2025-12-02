# Ensure scripts can run (one-time per user)
$pol = Get-ExecutionPolicy -Scope CurrentUser
if ($pol -ne "RemoteSigned") {
    Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
}

# Create venv if missing
if (!(Test-Path ".\.venv")) {
    py -3 -m venv .venv
}

# Activate
.\.venv\Scripts\Activate.ps1

# Install deps
python -m pip install --upgrade pip
pip install -r requirements.txt
if (Test-Path ".\requirements-dev.txt") { pip install -r requirements-dev.txt }

Write-Host "Environment setup complete."
