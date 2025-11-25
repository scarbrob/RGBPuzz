# RGBPuzz Setup Script
# Run this script to set up the development environment

Write-Host "🎨 RGBPuzz Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is available
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ npm $npmVersion installed" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

# Navigate to project root
$projectRoot = "c:\Repos\rgbpuzz"
Write-Host ""
Write-Host "Navigating to project directory: $projectRoot" -ForegroundColor Yellow
Set-Location $projectRoot

# Install shared dependencies
Write-Host ""
Write-Host "📦 Installing shared package dependencies..." -ForegroundColor Cyan
Set-Location "$projectRoot\shared"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install shared dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Shared dependencies installed" -ForegroundColor Green

# Build shared package
Write-Host ""
Write-Host "🔨 Building shared package..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to build shared package" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Shared package built" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location "$projectRoot\frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Install API dependencies
Write-Host ""
Write-Host "📦 Installing API dependencies..." -ForegroundColor Cyan
Set-Location "$projectRoot\api"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install API dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ API dependencies installed" -ForegroundColor Green

# Check Azure Functions Core Tools
Write-Host ""
Write-Host "Checking Azure Functions Core Tools..." -ForegroundColor Yellow
$funcVersion = func --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Azure Functions Core Tools installed (version $funcVersion)" -ForegroundColor Green
} else {
    Write-Host "⚠ Azure Functions Core Tools not found" -ForegroundColor Yellow
    Write-Host "  Install from: https://docs.microsoft.com/azure/azure-functions/functions-run-local" -ForegroundColor Gray
    Write-Host "  Or run: npm install -g azure-functions-core-tools@4 --unsafe-perm true" -ForegroundColor Gray
}

# Return to project root
Set-Location $projectRoot

# Display next steps
Write-Host ""
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the frontend development server:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In a new terminal, start the API:" -ForegroundColor White
Write-Host "   cd api" -ForegroundColor Gray
Write-Host "   npm run start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open your browser to:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   - DEVELOPMENT.md - Development guide" -ForegroundColor Gray
Write-Host "   - ROADMAP.md - Project roadmap and features" -ForegroundColor Gray
Write-Host "   - infrastructure/DEPLOYMENT.md - Azure deployment guide" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Magenta
