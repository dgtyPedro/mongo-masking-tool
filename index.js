import {
  maskFullName,
  maskSSN,
  maskPassportNumber,
  maskEmail,
  maskPhoneNumber,
  maskStreetAddress,
  maskPostalCode,
  maskCreditCardNumber,
  maskCreditCardExpiry,
  maskCreditCardCVV,
} from "./utils/masks.js";

import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";
// import { printDiff, prettyPrintDiff } from "./utils/diff.js";

const maskers = {
  fullName: maskFullName,
  ssn: maskSSN,
  passportNumber: maskPassportNumber,
  email: maskEmail,
  phoneNumber: maskPhoneNumber,
  streetAddress: maskStreetAddress,
  postalCode: maskPostalCode,
  creditCardNumber: maskCreditCardNumber,
  creditCardExpiry: maskCreditCardExpiry,
  creditCardCVV: maskCreditCardCVV,
};

function applyMasks(dataMap, record) {
  const result = {};
  for (const key in dataMap) {
    if (typeof dataMap[key] === "string") {
      const maskFn = maskers[dataMap[key]];
      result[key] = maskFn ? maskFn() : record[key];
    } else if (typeof dataMap[key] === "object" && dataMap[key] !== null) {
      result[key] = applyMasks(dataMap[key], record[key] || {});
    }
  }
  return result;
}

dotenv.config();
async function main() {
  console.log("Hello World.");
  const cliArg = process.argv[2];
  if (!cliArg) {
    console.error("Usage: node index.js <mapName>");
    process.exit(1);
  }
  const mapPath = path.resolve("maps", `${cliArg}.json`);
  if (!fs.existsSync(mapPath)) {
    console.error(`Map file not found: ${mapPath}`);
    process.exit(1);
  }
  const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
  const { database, collection, data: dataMap } = map;
  console.log(
    `Using map: ${mapPath} | database: ${database} | collection: ${collection}`
  );

  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(database);
  const col = db.collection(collection);

  const total = await col.countDocuments({});
  const sanitizedNow = await col.countDocuments({ sanitized: true });
  const unsanitizedCount = total - sanitizedNow;
  if (unsanitizedCount === 0) {
    console.log("All records are already sanitized.");
    await client.close();
    process.exit(0);
  } else {
    const percentSanitized = ((sanitizedNow / total) * 100).toFixed(2);
    console.log(
      `Found ${unsanitizedCount} unsanitized records out of ${total}. Starting sanitization...`
    );
    if (sanitizedNow > 0) {
      console.log(
        `Progress resumes at ${percentSanitized}% of all records sanitized.`
      );
    }
  }
  let processed = 0;
  let lastPercent = Math.floor((sanitizedNow / total) * 100);
  const unsanitizedCursor = col.find({ sanitized: { $ne: true } });
  while (await unsanitizedCursor.hasNext()) {
    const original = await unsanitizedCursor.next();
    const sanitized = {
      ...original,
      ...applyMasks(dataMap, original),
      sanitized: true,
    };
    await col.replaceOne({ _id: original._id }, sanitized);
    processed++;
    const sanitizedCurrent = sanitizedNow + processed;
    const percent = Math.floor((sanitizedCurrent / total) * 100);
    if (percent >= lastPercent + 1 || percent === 100) {
      console.log(
        `${percent}% of all records sanitized (${sanitizedCurrent}/${total})`
      );
      lastPercent = percent;
    }
  }
  const sanitizedFinal = await col.countDocuments({ sanitized: true });
  const percentSanitizedFinal = ((sanitizedFinal / total) * 100).toFixed(2);
  console.log(
    `Sanitization complete. ${percentSanitizedFinal}% of all records are sanitized.`
  );
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
