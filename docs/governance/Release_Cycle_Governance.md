# Release Cycle Governance

## 1. Purpose

This document governs the business meaning of Release Cycles for the AI-Assisted Delivery Management Platform.

It defines:

- Release Cycle semantics
- Release calendar ownership
- The relationship with Target Release
- The relationship with Date Range
- The relationship with Forecasting
- Chronological ordering

This document does not define:

- KPI calculations
- Dashboard rendering
- Visualization behavior

## Implementation Status

Release Cycle governance is approved; dashboard implementation is currently parked. The Release Cycle UI filter is intentionally hidden to prevent reliance on incomplete semantics, while Jira Delivery field implementation remains outstanding. This document remains authoritative for future implementation. The temporary absence of the filter does not cancel or redefine the approved Release Cycle business rules.

## 2. Authoritative Source

The authoritative source is the CSV dataset: `data/raw/Release Cycle.csv`.

This dataset is the single source of truth for Release Cycle definitions. Each Release Cycle contains, at minimum:

- Release Name
- Start Date
- End Date

The End Date represents the official Code Freeze date. No other dataset, hardcoded value, or calculation may redefine Release Cycle dates.

## 3. Business Meaning

A Release Cycle represents the official Engineering delivery iteration. It is not simply a label; it is a governed business calendar used to organize delivery planning and execution.

## 4. Release Cycle Calendar

Release Start Date is the beginning of the engineering iteration.

Release End Date is the official Code Freeze. After the End Date, the Release Cycle becomes historical.

## 5. Relationship with Target Release

Target Release is a Jira field representing the intended production release of a feature.

Release Cycle is the governed Engineering delivery calendar. A Target Release may reference a governed Release Cycle for temporal classification.

The two concepts are related but are not interchangeable.

For future implementation, Jira Delivery determines operational Release Cycle membership. Target Release is used for forecasting; forecast allocation remains governed exclusively by Forecasting_Governance.md.

## 6. Current, Future and Historical Releases

**Current/Future Release**: a Release Cycle whose End Date is greater than or equal to the current reporting date.

**Historical Release**: a Release Cycle whose End Date is earlier than the current reporting date.

## 7. Relationship with Date Range

Date Range answers: “When did activity occur?”

Release Cycle answers: “Which delivery iteration?”

Both filters may coexist. They represent different business concepts. Selecting both applies the intersection of both scopes; neither filter replaces the other.

## 8. Chronological Ordering

Release Cycle selectors must always be ordered chronologically using Release Start Date, never alphabetically.

## 9. Relationship with Forecasting

Forecasting uses the governed Release Cycle calendar to determine whether a Target Release references a Current, Future, or Historical Release Cycle.

Release Cycle Governance does not define forecast allocation logic.

Forecast allocation, backport handling, Planning Exceptions, and Future Due Date fallback are governed exclusively by Forecasting_Governance.md.

## 10. Relationship with Master Date

Master Date governs chronological calendar logic. Release Cycle governs Engineering delivery iterations.

The two calendars complement each other and must remain consistent. Master Date must not redefine Release Cycle boundaries, and Release Cycle must not redefine chronological calendar dates.

## 11. Non-Negotiable Rules

- The CSV dataset `data/raw/Release Cycle.csv` is the authoritative Release Cycle source.
- Hardcoded Release Cycle dates are prohibited.
- Release selectors must always be ordered chronologically using Release Start Date.
- Release End Date represents Code Freeze.
- Date Range and Release Cycle answer different business questions.
- Release Cycle governance applies wherever Release Cycle calendar semantics are used.
