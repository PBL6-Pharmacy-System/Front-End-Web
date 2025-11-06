# Test Script cho Subcategory APIs
# Chạy script này để test tất cả endpoints trong subcategoryApiMap.js

Write-Host "🧪 Testing Subcategory API Endpoints" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Load System.Web assembly for URL encoding
Add-Type -AssemblyName System.Web

# Danh sách categories để test (mẫu - bạn có thể thêm nhiều hơn)
$testCategories = @(
    "Máy massage",
    "Vitamin tổng hợp",
    "Kem chống nắng da mặt",
    "Khẩu trang y tế",
    "Thuốc tiêu hoá",
    "Bổ não - cải thiện trí nhớ",
    "Dầu cá, Omega 3, DHA",
    "Máy đo huyết áp"
)

$baseUrl = "http://localhost:3000/api/products/category"
$successCount = 0
$failCount = 0
$results = @()

Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "Testing $($testCategories.Count) categories..." -ForegroundColor Gray
Write-Host ""

foreach ($category in $testCategories) {
    $encoded = [System.Web.HttpUtility]::UrlEncode($category)
    $url = "$baseUrl/$encoded"
    
    Write-Host "Testing: $category" -ForegroundColor Yellow
    Write-Host "  URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
        
        # Check response structure
        $productCount = 0
        if ($response.success -and $response.data) {
            if ($response.data.products) {
                $productCount = $response.data.products.Count
            } elseif ($response.data -is [Array]) {
                $productCount = $response.data.Count
            }
        } elseif ($response.products) {
            $productCount = $response.products.Count
        } elseif ($response -is [Array]) {
            $productCount = $response.Count
        }
        
        Write-Host "  ✅ Success: $productCount products" -ForegroundColor Green
        $successCount++
        
        $results += [PSCustomObject]@{
            Category = $category
            Status = "✅ Success"
            ProductCount = $productCount
            URL = $url
        }
        
        # Show sample product if available
        if ($productCount -gt 0) {
            $sampleProduct = $null
            if ($response.data.products) {
                $sampleProduct = $response.data.products[0]
            } elseif ($response.data -is [Array]) {
                $sampleProduct = $response.data[0]
            } elseif ($response.products) {
                $sampleProduct = $response.products[0]
            } elseif ($response -is [Array]) {
                $sampleProduct = $response[0]
            }
            
            if ($sampleProduct) {
                Write-Host "  📦 Sample: $($sampleProduct.name)" -ForegroundColor Cyan
                if ($sampleProduct.price) {
                    Write-Host "     Price: $($sampleProduct.price)" -ForegroundColor Gray
                }
                if ($sampleProduct.images -and $sampleProduct.images.Count -gt 0) {
                    Write-Host "     Images: $($sampleProduct.images.Count)" -ForegroundColor Gray
                }
            }
        }
        
    } catch {
        $errorMessage = $_.Exception.Message
        Write-Host "  ❌ Failed: $errorMessage" -ForegroundColor Red
        $failCount++
        
        $results += [PSCustomObject]@{
            Category = $category
            Status = "❌ Failed"
            ProductCount = 0
            URL = $url
            Error = $errorMessage
        }
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500  # Delay giữa các requests
}

# Summary
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($testCategories.Count)" -ForegroundColor White
Write-Host "✅ Success: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($successCount / $testCategories.Count) * 100, 2))%" -ForegroundColor $(if ($successCount -eq $testCategories.Count) { "Green" } else { "Yellow" })
Write-Host ""

# Show detailed results table
Write-Host "Detailed Results:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

# Export to CSV if needed
$exportPath = "subcategory_api_test_results.csv"
$results | Export-Csv -Path $exportPath -NoTypeInformation -Encoding UTF8
Write-Host "Results exported to: $exportPath" -ForegroundColor Gray

# Check for common issues
Write-Host ""
Write-Host "🔍 Common Issues Check:" -ForegroundColor Yellow
if ($failCount -gt 0) {
    Write-Host "  ⚠️ Some endpoints failed. Check:" -ForegroundColor Yellow
    Write-Host "     1. Backend server is running (port 3000)" -ForegroundColor Gray
    Write-Host "     2. Database has data for these categories" -ForegroundColor Gray
    Write-Host "     3. URL encoding is correct" -ForegroundColor Gray
    Write-Host "     4. Backend API routes are configured" -ForegroundColor Gray
} else {
    Write-Host "  ✅ All endpoints working!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review failed endpoints (if any)" -ForegroundColor Gray
Write-Host "  2. Check backend logs for errors" -ForegroundColor Gray
Write-Host "  3. Test in browser: http://localhost:5173" -ForegroundColor Gray
Write-Host "  4. Update subcategoryApiMap.js if needed" -ForegroundColor Gray
