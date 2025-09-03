# Masking Tool

A Node.js tool for masking (sanitizing) sensitive data in MongoDB collections, with support for resumable progress and customizable masking maps.

## Features

- Masks sensitive fields in MongoDB collections using fake data
- Progress is saved: resume from where you left off
- Customizable masking maps (see `maps/`)
- Seeder for generating large test datasets

## Requirements

- Node.js 18+
- MongoDB instance (local or remote)

## Setup

1. Clone the repository.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure your MongoDB URI in the `.env` file:
   ```env
   MONGO_URI=mongodb://localhost:27017
   ```

## Usage

### 1. Seeding the Database

To generate test data:

```sh
node utils/seeder.js
```

This will create 100,000 user records in the `maskingbenchmark.users` collection.

### 2. Masking Data

To mask (sanitize) a collection:

```sh
node index.js test
```

- `test` refers to the map file in `maps/test.json`.
- The script will only mask records that have not been sanitized yet (`sanitized: true`).
- Progress is shown as a percentage of all records.
- You can stop and resume at any time; progress will continue from where it left off.

### 3. Customizing Masking

Edit or add map files in the `maps/` directory to define which fields to mask and how.

### 4. Masking Functions

Masking logic is defined in `utils/masks.js` using the `@faker-js/faker` library.

## Project Structure

- `index.js` — Main masking script
- `utils/masks.js` — Masking functions
- `utils/seeder.js` — Seeder for test data
- `utils/diff.js` — Utility for diffing records (optional)
- `maps/` — Masking map definitions
- `.env` — MongoDB connection string

## Example Map File

See `maps/test.json` for an example of how to define which fields to mask.

## License

MIT
