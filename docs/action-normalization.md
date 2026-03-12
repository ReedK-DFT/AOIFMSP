# Connector Action Normalization

## Purpose

AOIFMSP should not expose imported connector actions as a flat, raw list and assume the MSP will sort out overlap manually.

The platform needs a normalized action catalog that maps heterogeneous PSA, RMM, documentation, Graph, and custom-tool actions into common AOIFMSP platform objects and verbs.

That normalized layer is what should back:

- direct UI actions
- workflow blocks
- AI-assisted workflow drafting
- tenant-management wizards
- technician guided actions

## Core Design Rule

Imported actions are ingestion material, not the final user-facing catalog.

The final catalog should be curated around normalized platform objects such as:

- tickets
- tasks
- devices
- alerts
- documentation
- runbooks
- users
- licenses
- groups
- roles
- standards

Each normalized action should define:

- the canonical object type
- the canonical verb such as `get`, `list`, `create`, `update`, `assign`, `reset`, or `delete`
- the capability domain it belongs to
- which tool type is normally authoritative for that domain
- how overlapping tool actions should be handled

## Tool Authority Defaults

Default authority rules for onboarding MSPs:

- PSA is authoritative for tickets and tasking
- RMM is authoritative for device state, remediation, and operational alerts
- Documentation systems are authoritative for runbooks, knowledge records, and documentation assets
- Microsoft Graph or curated identity connectors are authoritative for users, licenses, groups, roles, and standards-backed tenant administration

These defaults are starting rules, not blind assumptions.

AOIFMSP should let each MSP review and override the effective authority profile during onboarding because:

- some MSPs already have strong cross-tool integrations in place
- some tools are partially configured or underused
- some tools expose the same object but only one is reliable enough to be primary

## Overlap Strategy

When AOIFMSP imports actions, it should classify each connector action into one of these dispositions:

- `authoritative`: the preferred source for this capability
- `augmenting`: adds value around the authoritative tool without replacing it
- `fallback`: available when the authoritative tool is absent or intentionally not used
- `redundant`: technically possible but not enabled by default because it overlaps working functionality
- `disabled`: imported but intentionally hidden until reviewed

This allows AOIFMSP to avoid duplicating useful existing MSP workflows while still filling gaps.

## Onboarding Review Model

During connector onboarding, AOIFMSP should create or update a tool-capability profile for each core tool.

That profile should record:

- tool type such as PSA, RMM, documentation, Graph, or custom
- whether the tool is authoritative, supporting, legacy, or unknown in the MSP stack
- which domains it currently covers well
- known gaps or misconfigurations
- overlap policy decisions made during onboarding review

The normalized catalog should use that profile before deciding whether an imported action is enabled by default.

## UX Implication

In the UI, platform admins should review imported actions in two stages:

1. raw connector import preview
2. normalized platform-action review

That second stage should answer:

- what AOIFMSP object this action maps to
- whether it becomes the default action for that object and verb
- whether it augments an existing tool instead
- whether it should stay hidden until reviewed

That is the layer that keeps AOIFMSP from becoming another overlapping admin surface that fights the MSP's existing tooling.

## Deployment Implication

Because normalized actions can create first-class admin and workflow capabilities, they must be governed by AOIFMSP platform administrators.

The standard deployment flow should therefore:

- create an `AOIFMSP Admins` group in the MSP tenant
- add the initial setup operator to that group
- use that group as the administrative boundary for connector import, action review, and platform-level governance

## Current Code Direction

The repository now includes the first object-model scaffolding for this:

- normalized platform action catalog entities
- connector-to-platform action mapping entities
- tool capability profile entities
- a normalization preview helper that applies authority defaults and overlap dispositions to imported actions

The next implementation step is to persist normalization results during connector import and expose them in the connector admin UI for approval.
