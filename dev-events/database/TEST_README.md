# Database Model Unit Tests

This document explains how to run the unit tests for the Booking and Event models.

## Prerequisites

You need to install the following dev dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest mongodb-memory-server
```

## Test Coverage

The test suite covers the following scenarios:

### Booking Model Tests

1. **Valid data and email validation**
   - Saves bookings with valid data
   - Validates correct email formats
   - Rejects invalid email formats
   - Converts emails to lowercase

2. **Event reference validation**
   - Prevents saving when referenced eventId doesn't exist
   - Successfully saves when eventId exists
   - Requires eventId field

### Event Model Tests

3. **Valid data and slug generation**
   - Saves events with valid data
   - Automatically generates slug from title
   - Generates unique slugs for duplicate titles
   - Handles special characters in titles

4. **Field validation**
   - Requires all mandatory fields
   - Validates mode enum (online, offline, hybrid)
   - Converts mode to lowercase
   - Requires at least one agenda item
   - Requires at least one tag
   - Accepts multiple agenda items and tags

5. **Date and time normalization**
   - Normalizes dates to ISO format (YYYY-MM-DD)
   - Accepts ISO date format
   - Rejects invalid date formats
   - Validates time format (HH:MM)
   - Rejects invalid time formats
   - Normalizes various date formats to ISO

## Running the Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Structure

The tests use:
- **Jest** - Testing framework
- **MongoDB Memory Server** - In-memory MongoDB for testing
- **ts-jest** - TypeScript support for Jest

Each test is isolated with:
- `beforeAll`: Sets up in-memory MongoDB connection
- `afterEach`: Clears all collections between tests
- `afterAll`: Closes connections and stops MongoDB server

## Test File Location

The test file is located at: `database/models.test.ts`
