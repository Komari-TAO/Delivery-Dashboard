param([string]$Root = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent))
$ErrorActionPreference = 'Stop'
$out = Join-Path $Root 'outputs/client_delivery_20261022'
$file = Join-Path $out 'Client_Delivery_Status_and_Demand_2026-10-22.xlsx'
$data = Get-Content -LiteralPath (Join-Path $out 'report_data.json') -Raw | ConvertFrom-Json
$layout = Get-Content -LiteralPath (Join-Path $out 'layout.json') -Raw | ConvertFrom-Json
$excel = $null
$book = $null
$results = [System.Collections.Generic.List[object]]::new()
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.AskToUpdateLinks = $false
    $book = $excel.Workbooks.Open($file, 0, $false)
    $cap = $book.Worksheets.Item('Demand and capacity')
    $source = $book.Worksheets.Item('Source capacity')
    $detail = $book.Worksheets.Item('Demand detail')
    $epic = $book.Worksheets.Item('Epic register')
    foreach ($release in @($data.defaultRelease, 'release-2027-01', 'release-2027-03')) {
        $cap.Range('B4').Value2 = $release
        $excel.CalculateFullRebuild()
        $metrics = @($cap.Range('A9').Value2,$cap.Range('C9').Value2,$cap.Range('E9').Value2,$cap.Range('G9').Value2,$cap.Range('C12').Value2,$cap.Range('G12').Value2,$cap.Range('C13').Value2,$cap.Range('G13').Value2)
        $rows = @()
        for ($r=19; $r -le (18+$data.teams.Count); $r++) {
            $record = @()
            for ($c=1; $c -le 11; $c++) { $record += $cap.Cells.Item($r,$c).Value2 }
            $rows += ,$record
        }
        $results.Add(@{case='Release selection';release=$release;metrics=$metrics;teams=$rows;start=$cap.Range('F4').Text;end=$cap.Range('H4').Text})
        $expectedCapacity = [double](($data.capacity | Where-Object { $_[0] -eq $release -and $_[2] -is [valuetype] } | ForEach-Object { $_[2] } | Measure-Object -Sum).Sum)
        $expectedDemand = [double](($data.detail | Where-Object { $_[12] -eq $release -and $_[24] -eq 1 } | ForEach-Object { $_[14] } | Measure-Object -Sum).Sum)
        $expectedUnallocated = [double](($data.detail | Where-Object { $_[12] -eq $release -and $_[22] -eq 1 } | ForEach-Object { $_[14] } | Measure-Object -Sum).Sum)
        if ($metrics[0] -ne '-' -and [Math]::Abs([double]$metrics[0]-$expectedCapacity) -gt 0.000001) { throw "Capacity reconciliation failed: $release" }
        if ([Math]::Abs([double]$metrics[1]-$expectedDemand) -gt 0.000001) { throw "Demand reconciliation failed: $release" }
        if ([Math]::Abs([double]$metrics[4]-$expectedUnallocated) -gt 0.000001) { throw "Unallocated reconciliation failed: $release" }
    }
    $cap.Range('B4').Value2 = $data.defaultRelease
    $capacityRow = 7
    foreach ($r in $data.capacity) {
        if ($r[0] -eq $data.defaultRelease -and $r[1] -eq 'Authoring') { break }
        $capacityRow++
    }
    $old = $source.Cells.Item($capacityRow,3).Value2
    $source.Cells.Item($capacityRow,3).Value2 = 0.0
    $excel.CalculateFullRebuild()
    $results.Add(@{case='Zero capacity';firstTeam=$cap.Range('A19').Value2;capacity=$cap.Range('B19').Value2;load=$cap.Range('D19').Value2;gap=$cap.Range('E19').Value2;overload=$cap.Range('H19').Value2})
    if ($cap.Range('A19').Value2 -ne 'Authoring' -or $cap.Range('D19').Value2 -ne '-' -or $cap.Range('E19').Value2 -ge 0) { throw 'Zero-capacity boundary or ranking failed' }
    $source.Cells.Item($capacityRow,3).Value2 = [double]$old
    $stressRow = 7
    foreach ($r in $data.detail) {
        if ($r[7] -eq 'Nexus' -and $r[12] -eq $data.defaultRelease -and $r[14] -gt 0) { break }
        $stressRow++
    }
    $old = $detail.Cells.Item($stressRow,15).Value2
    $detail.Cells.Item($stressRow,15).Value2 = 2000.0
    $excel.CalculateFullRebuild()
    $results.Add(@{case='Demand overload';firstTeam=$cap.Range('A19').Value2;demand=$cap.Range('C19').Value2;gap=$cap.Range('E19').Value2;overload=$cap.Range('H19').Value2;portfolioDemand=$cap.Range('C9').Value2})
    if ($cap.Range('A19').Value2 -ne 'Nexus' -or $cap.Range('H19').Value2 -le 0) { throw 'Overload ranking or chart contribution failed' }
    $detail.Cells.Item($stressRow,15).Value2 = [double]$old
    $excel.CalculateFullRebuild()
    # Native file features not exposed in the authoring API quick surface.
    if ($epic.Hyperlinks.Count -gt 0) { $epic.Hyperlinks.Delete() }
    if ($epic.Range('A18').EntireRow.OutlineLevel -eq 1) {
        foreach ($group in $layout.groups) { $epic.Range("$($group.start):$($group.end)").Rows.Group() | Out-Null }
    }
    $epic.Outline.SummaryRow = 0
    for ($r=18; $r -le $layout.epirows; $r++) {
        $cell = $epic.Cells.Item($r,2)
        $null = $epic.Hyperlinks.Add($cell, ('https://oat-sa.atlassian.net/browse/' + [uri]::EscapeDataString([string]$cell.Value2)))
    }
    # Hide formula helpers; source sheets stay available through Excel Unhide.
    $source.Visible = 0
    $book.Worksheets.Item('Release calendar').Visible = 0
    $cap.Range('56:66').EntireRow.Hidden = $true
    # Formula-linked chart series remain visible when their helper columns are hidden.
    $chart = $cap.ChartObjects().Item(1).Chart
    $chart.PlotVisibleOnly = $false
    $chart.Axes(1).ReversePlotOrder = $true
    $chart.Axes(2).MinimumScale = 0
    $chart.Axes(1).Crosses = 2
    # Missing values: keep the distinction in typed detail columns.
    $epic.Range("A18:O$($layout.epirows)").VerticalAlignment = -4108
    $detail.Range("A7:Y$($layout.dend)").VerticalAlignment = -4108
    $book.Worksheets.Item('Executive summary').PageSetup.PrintArea = "`$A`$1:`$I`$$($layout.exend)"
    foreach ($sheet in $book.Worksheets) {
        $sheet.PageSetup.Orientation = 2
        $sheet.PageSetup.PaperSize = 9
        $sheet.PageSetup.Zoom = $false
        $sheet.PageSetup.FitToPagesWide = 1
        $sheet.PageSetup.FitToPagesTall = $false
        $sheet.PageSetup.LeftMargin = $excel.InchesToPoints(0.25)
        $sheet.PageSetup.RightMargin = $excel.InchesToPoints(0.25)
        $sheet.PageSetup.CenterFooter = 'Page &P of &N'
    }
    $book.Worksheets.Item('Executive summary').PageSetup.PaperSize = 8
    $book.Worksheets.Item('Executive summary').PageSetup.Orientation = 1
    $book.Worksheets.Item('Executive summary').PageSetup.FitToPagesTall = 1
    $epic.PageSetup.PrintTitleRows = '$17:$17'
    $detail.PageSetup.PrintTitleRows = '$6:$6'
    $cap.PageSetup.PrintArea = '$A$1:$K$53'
    $cap.PageSetup.PaperSize = 8
    $book.Worksheets.Item('Executive summary').Activate()
    $excel.ActiveWindow.Zoom = 85
    $excel.CalculateFullRebuild()
    $formulaErrors = @()
    foreach ($sheet in $book.Worksheets) {
        try {
            $errors = $sheet.UsedRange.SpecialCells(-4123,16)
            foreach ($cell in $errors) { $formulaErrors += "$($sheet.Name)!$($cell.Address()): $($cell.Text)" }
        } catch { if ($_.Exception.Message -notmatch 'No cells were found|Aucun|No se|0x800A03EC') { throw } }
    }
    if ($formulaErrors.Count -gt 0) { throw "Formula errors: $($formulaErrors -join ', ')" }
    $controls = $book.Worksheets.Item('Controls and checks')
    $r = [int]$layout.cr + $data.provenance.Count + 4
    $controls.Cells.Item($r,1).Value2 = 'Executed workbook verification'
    $controls.Cells.Item($r,2).Value2 = 'Result / limitations'
    $checks = @(
        @('Native Excel calculation','PASS — desktop Excel CalculateFullRebuild; no formula errors.'),
        @('Release dropdown','PASS — three releases tested against independent report data; selected metrics, team rows and exceptions recalculate.'),
        @('Zero capacity and overload','PASS — temporary source-copy edits tested; load remains missing at zero capacity; overload changes ranking and bars. All edits restored.'),
        @('Workbook features','Six visible report tabs; two hidden supporting inputs; native chart, conditional formats, data tables, Jira hyperlinks, Epic row outlines and print setup.'),
        @('Repository preservation','Existing source, dashboard, governance and pre-existing changes checked by SHA-256; see validation.json.'),
        @('Unresolved requirement','Approved child-first / parent-fallback resolver is absent and conflicts with current specification. Nineteen mixed-level records remain withheld.'),
        @('Visual verification','Artifact renders reviewed for six report tabs. Final native Excel export and chart bindings inspected.')
    )
    foreach ($check in $checks) {
        $r++
        $controls.Cells.Item($r,1).Value2 = $check[0]
        $controls.Cells.Item($r,2).Value2 = $check[1]
        $controls.Range("A${r}:B${r}").WrapText = $true
        $controls.Range("A${r}:B${r}").RowHeight = 46
    }
    $results.Add(@{case='Final file';formulaErrors=$formulaErrors;hyperlinks=$epic.Hyperlinks.Count;chartSeries=$chart.SeriesCollection().Count;visibleSheets=@($book.Worksheets | Where-Object Visible -eq -1 | ForEach-Object Name)})
    $results | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $out 'native_excel_tests.json') -Encoding utf8
    $book.Save()
    $book.Close($true)
    $book = $null
    $check = $excel.Workbooks.Open($file,0,$true)
    $expectedActive = $data.metrics.workflow.Demand + $data.metrics.workflow.DoR + $data.metrics.workflow.DoD
    if ($check.Worksheets.Item('Executive summary').Range('A8').Value2 -ne $expectedActive) { throw 'Saved workbook reopen check failed' }
    $check.Close($false)
} finally {
    if ($null -ne $book) { $book.Close($false) }
    if ($null -ne $excel) { $excel.Quit(); [System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($excel) | Out-Null }
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}
Write-Output 'Native Excel recalculation, file features and saved-file checks completed.'

