# Forecast Resolution Specification

## 1. Purpose

This document defines the authoritative technical resolution framework used by Version 2.1 to resolve governed Jira planning items into a deterministic, explainable, traceable, reproducible, and reconcilable forecast.

This specification defines the properties and ordered decisions that a conforming forecast resolver must satisfy. It does not define implementation code, storage design, processing technology, or user-interface behaviour.

Business meaning remains governed by:

* `Forecasting_Governance.md`
* `MVP_Business_Rules.md`
* `Data_Dictionary.md`
* `KPI_Definitions.md`
* `Semantic_Visualization_Governance.md`
* `Release_Cycle_Governance.md`

This specification must not override or redefine those documents. Forecast allocation precedence, Release Cycle classification, terminal-status treatment, Planning Exception semantics, field ownership, KPI definitions, and visualization behaviour remain governed by their respective authoritative documents.

---

## 2. Design Principles

The Version 2.1 forecast resolver must be:

* **Deterministic:** identical governed inputs under the same governance version produce identical outputs.
* **Explainable:** every resolution outcome can be explained using governed source fields and governed rules.
* **Traceable:** every contributing demand value can be traced to its Jira Key and source Remaining Estimate.
* **Reproducible:** a completed resolution can be repeated from the same governed input snapshot with the same result.
* **Unique:** each Jira planning item may contribute its Remaining Estimate at most once.
* **Reconcilable:** forecast totals can be rebuilt from the item-level contribution population.
* **Non-inferential:** the resolver does not invent business meaning, estimates, dates, hierarchy semantics, or ownership.
* **Ownership-neutral:** the resolver provides planning visibility and never makes a Team-allocation decision.
* **Future AI compatible:** later advisory capabilities may consume the traceable outputs, but they must not alter Version 2.1 resolution semantics.

No-double-counting applies to source demand contribution. A source Remaining Estimate associated with a Jira planning item must never be duplicated across forecast buckets, hierarchy levels, Team states, or output populations.

---

## 3. Resolution Inputs

Version 2.1 resolution uses the following governed Jira planning-item inputs:

| Input | Resolution purpose |
| --- | --- |
| Jira Key | Stable identity and item-level traceability |
| Parent Key | Hierarchy context and validation only |
| Issue Type | Source classification and validation only |
| Original Estimate | Reconciliation and future planning-intelligence context only |
| Remaining Estimate | Authoritative Version 2.1 forecast demand value |
| Team | Current planning ownership state when supplied; a missing value is valid Unallocated Demand |
| Status | Governed terminal-status exclusion |
| Target Release | Primary governed forecast-bucket input |
| Due Date | Governed fallback forecast-bucket input |

Jira is the authoritative source for Version 2.1 forecast demand and planning metadata used by this specification. Release classification for Target Release is determined using the calendar governed by `Release_Cycle_Governance.md`.

The global analytical exclusion is an input-boundary rule: normalized exact Jira keys TEMPO-54, TEMPO-92, TEMPO-106, TEMPO-111, and TEMPO-112 must be removed before the resolver assesses eligibility, demand value, hierarchy, status, Forecast Bucket, Allocation State, or Planning Exception outcome. The rule uses trimming plus uppercase normalization and does not use prefix or substring matching. It does not change the parked implementation status or any other forecasting semantic.

Original Estimate must not replace, override, or supplement Remaining Estimate in Version 2.1 demand calculations.

Tempo is not a forecast-resolution input. Tempo worklogs, logged effort, historical execution, contributor history, and Tempo Team values must not affect Version 2.1 forecast contribution, bucket resolution, Allocation State, or Planning Exception classification.

---

## 4. Resolution Outputs

A conforming resolution produces the following logical outputs:

### Forecast-Contributing Jira Items

The unique Jira planning items whose Remaining Estimate contributes to forecast demand. Each contribution retains its Jira Key, source Remaining Estimate, resolved Forecast Bucket, and Allocation State so the total can be reconstructed and audited.

### Forecast Bucket

The single governed time-allocation outcome for a contributing item. Its value and precedence are determined exclusively by `Forecasting_Governance.md` using Target Release first and Future Due Date only as the governed fallback.

### Allocation State

Allocation State describes Team assignment only:

* **Allocated:** the Jira planning item has a governed delivery Team assignment.
* **Unallocated:** the Jira planning item has no delivery Team assignment.

Allocation State is independent from Forecast Bucket. An Unallocated item with a valid future Forecast Bucket remains valid forecast demand, remains visible in applicable forecast outputs, and contributes to Portfolio Remaining Demand.

### Planning Exceptions

Planning Exceptions contain only Jira planning items that cannot be allocated to a valid future Target Release or Future Due Date under `Forecasting_Governance.md`. Missing Team is never a Planning Exception.

### Validation Population

The validation population contains sufficient item-level evidence to account for every planning item assessed by the resolver and its outcome. It supports duplicate detection, contribution reconciliation, exclusion verification, source traceability, and reproducibility without changing the business meaning of any outcome.

---

## 5. Resolution Rules

### 5.1 Resolution Identity and Contribution Grain

Jira Key is the identity of a Jira planning item for forecast resolution. A planning item may produce no more than one Remaining Estimate contribution.

Repeated source representations of the same Jira planning item must not create repeated demand. Conflicting source representations of the same Jira Key must be exposed through the validation population and must not be silently resolved through an invented value or hierarchy assumption.

### 5.2 Governed Demand Value

Remaining Estimate is the only value that may contribute to Version 2.1 forecast demand. The resolver must preserve the governed source value and must never fabricate, redistribute, split, proportion, or modify it.

Original Estimate remains available for reconciliation and future planning intelligence but must not contribute to Version 2.1 forecast demand.

If a usable Remaining Estimate is not present, the resolver must not substitute Original Estimate, logged effort, a parent estimate, a child estimate, a default value, or an inferred value. The item and the absence of a usable governed demand value must remain traceable in the validation population. This condition must not be classified as a Planning Exception unless the item independently meets the governed Planning Exception definition.

### 5.3 Hierarchy Resolution Boundary

Estimates may legitimately exist on Epics, Stories, Tasks, Bugs, and other governed Jira planning items. Parent and child estimates may represent different planning meanings, and their numerical relationship does not establish whether one contains, replaces, or duplicates another.

Therefore:

* Parent Key and Issue Type must not, by themselves, determine forecast contribution.
* A parent estimate must not be assumed to include or exclude child estimates.
* A child estimate must not be assumed to replace or supplement a parent estimate.
* Estimates must not be inherited between related Jira items.
* Related estimates must not be merged, rolled up, netted, suppressed, or redistributed solely because of hierarchy.
* Numerical equality or variance between parent and child estimates is not evidence of shared business meaning.

The resolver must treat distinct Jira Keys as distinct source planning items unless an additional governed source rule explicitly establishes otherwise. Any future contributor-selection rule across hierarchy levels requires separate governance approval; this specification does not introduce one.

### 5.4 Status Resolution

Terminal work must not contribute to future demand. Terminal-status membership and exclusion remain governed by `Forecasting_Governance.md` and the existing MVP business governance. The resolver must not infer completion from dates, estimates, worklogs, hierarchy, or historical execution.

### 5.5 Forecast-Bucket Resolution

For each eligible Jira planning item, the resolver must apply the forecast allocation precedence governed by `Forecasting_Governance.md` exactly once:

1. resolve against a valid future Target Release using the governed Release Cycle calendar;
2. otherwise resolve against a Future Due Date under the governed fallback rule;
3. otherwise classify the item as a Planning Exception.

An item must never contribute to both a Target Release bucket and a Future Due Date bucket. The resolver must not infer a missing planning date or Release Cycle boundary.

### 5.6 Team Allocation State

The resolver may report the Team value supplied by governed planning data and derive only whether that value is present or absent for Allocation State.

A missing Team produces Unallocated Demand. It is an expected planning state, not an error and not a Planning Exception. Unallocated Demand remains part of the unique forecast-contributing population when its Forecast Bucket is valid.

Delivery Management is the sole authority for Team allocation. The resolver must never:

* fabricate or automatically assign a Team;
* infer Team ownership from Parent Key, Issue Type, Assignee, historical execution, Tempo, or prior delivery patterns;
* allocate demand based solely on available capacity;
* convert a recommendation into an allocation decision.

### 5.7 Resolution Outcome

Each assessed Jira planning item must have one traceable resolution outcome consistent with the governed rules. Forecast contribution, Forecast Bucket, Allocation State, terminal exclusion, Planning Exception classification, and validation evidence must remain distinguishable so that one classification cannot silently change another.

---

## 6. Validation Requirements

A conforming Version 2.1 resolution must demonstrate:

### No Duplicate Remaining Estimate Contribution

* each contributing Jira Key appears once in the contribution population;
* each contribution is assigned to one Forecast Bucket only;
* the same source Remaining Estimate is not repeated through hierarchy expansion, joins, grouping, or output generation.

### Portfolio Reconciliation

The sum of unique forecast-contributing Remaining Estimate values must equal Portfolio Remaining Demand.

Portfolio Remaining Demand must reconcile to the governed Target Release and Future Due Date populations and to the governed Team and Assignee views as defined by `Forecasting_Governance.md`. Unallocated Demand is included in Portfolio Remaining Demand. Planning Exceptions are excluded from forecast totals and reconciled separately under the existing governance.

### Forecast Reproducibility and Stability

Identical governed input values, the same Release Cycle calendar, the same reporting date, and the same governance version must produce the same contributing items, Forecast Buckets, Allocation States, Planning Exceptions, and totals.

Input ordering, file ordering, duplicate joins, or presentation ordering must not change the result.

### Jira Traceability

Every forecast contribution must be traceable from the resolved output to one Jira Key and its source Remaining Estimate. Every Forecast Bucket and Allocation State must be explainable from the governed fields used to derive it.

### Validation Completeness

Validation must expose duplicate Jira identities, conflicting source representations, missing usable governed demand values, bucket-resolution outcomes, terminal exclusions, Planning Exceptions, and Unallocated Demand without reclassifying Unallocated Demand as invalid data or as a Planning Exception.

Validation evidence is technical reconciliation evidence only. It must not create new business rules, planning decisions, Team assignments, or UI behaviour.

---

## 7. Deferred Capabilities

The following capabilities are outside Version 2.1 forecast resolution:

* AI recommendations
* Team-allocation recommendations
* Tempo-assisted planning intelligence
* planning-maturity scoring
* historical estimation learning
* confidence scoring
* predictive forecasting

If introduced later, these capabilities must remain separate from the deterministic Version 2.1 calculation. Any future Team-allocation recommendation must be advisory only and must never replace a Delivery Management decision.

---

## 8. Non-Negotiable Rules

* Never count the same source demand twice.
* Never allow one Jira planning item to contribute Remaining Estimate more than once.
* Never allocate one contribution to both Target Release and Due Date.
* Never fabricate, split, redistribute, or modify an estimate.
* Never substitute Original Estimate or Tempo data for Remaining Estimate.
* Never fabricate planning metadata.
* Never infer planning dates or hierarchy meaning.
* Never infer Team ownership.
* Never allocate work to a Team automatically.
* Never treat missing Team as an error or Planning Exception.
* Never use available capacity alone to allocate demand.
* Never use Tempo to calculate Version 2.1 demand.
* Never admit a globally excluded exact issue key to the forecast-resolution population.
* Never use AI, predictive logic, confidence scoring, or historical learning in Version 2.1 resolution.
* Never redefine business semantics, KPI formulas, Release Cycle rules, or visualization behaviour in this specification.
