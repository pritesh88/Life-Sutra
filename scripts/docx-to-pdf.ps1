<#
  Converts the given .docx files in public/research-papers to .pdf using
  Microsoft Word COM automation (high-fidelity, preserves original layout).
  Originals are left untouched. Re-run safely; existing PDFs are overwritten.

  Note: each file gets its own Word.Application instance. Reusing a single
  instance across multiple Documents.Open calls in a loop was found to hang
  Word intermittently (likely OLE/equation-object activation on some docs).
#>

param(
    [string[]]$Files = @(
        "quantum-emotional-semiconductors",
        "bhava-centric-communication-architecture",
        "collective-emotional-field-model-qefm",
        "integrative-vedanta-islf-framework",
        "astrological-emotional-quotient-aeq",
        "theory-of-quantum-emotion-tqe",
        "bhava-sutra",
        "from-vrittis-to-emotional-fields"
    )
)

$papersDir = Join-Path $PSScriptRoot "..\public\research-papers"
$papersDir = (Resolve-Path $papersDir).Path
$wdFormatPDF = 17
$results = @()

function Convert-DocxToPdf($name) {
    $docxPath = Join-Path $papersDir "$name.docx"
    $pdfPath = Join-Path $papersDir "$name.pdf"

    if (-not (Test-Path $docxPath)) {
        return [pscustomobject]@{ File = $name; Status = "MISSING SOURCE" }
    }

    $word = New-Object -ComObject Word.Application
    $word.Visible = $true
    $word.DisplayAlerts = 0
    try {
        $doc = $word.Documents.Open($docxPath, $false, $true, $false)
        $doc.SaveAs2($pdfPath, $wdFormatPDF)
        $doc.Close([ref]0)
        $size = (Get-Item $pdfPath).Length
        return [pscustomobject]@{ File = $name; Status = "OK"; Bytes = $size }
    } catch {
        return [pscustomobject]@{ File = $name; Status = "ERROR"; Bytes = $_.Exception.Message }
    } finally {
        $word.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    }
}

foreach ($name in $Files) {
    $results += Convert-DocxToPdf $name
}

$results | Format-Table -AutoSize
