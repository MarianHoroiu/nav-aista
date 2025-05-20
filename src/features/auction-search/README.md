# Auction Search Feature

This feature module handles auction search form automation and result processing.

## Purpose

The auction search feature allows users to:

- Automatically fill in auction search forms based on company profile
- Execute searches on e-licitatie.ro
- Process and filter search results
- Save interesting auctions for later review

## Components

- UI Components
  - Search form controls
  - Result list and filtering
  - Auction preview card
- Services
  - Form detection service
  - Form filling service
  - Result extraction service
- Content Script Integration
  - DOM interaction utilities
  - Form field mapping
  - Result page parser

## Integration Points

- Uses core domain models:
  - `Auction` entity
  - `CompanyProfile` for matching criteria
- Interfaces with:
  - Content scripts for website interaction
  - Storage services for saving results

## Technical Notes

- DOM manipulation is isolated to specific adapter classes
- Website-specific selectors are kept in a configuration object
- Uses MutationObserver to detect dynamic content changes
