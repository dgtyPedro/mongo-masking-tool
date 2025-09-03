import { MongoClient } from "mongodb";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config();
function createUser() {
  return {
    full_name: faker.person.fullName(),
    date_of_birth: faker.date
      .birthdate({ min: 1950, max: 2005, mode: "year" })
      .toISOString()
      .split("T")[0],
    gender: faker.person.sexType(),
    ssn: faker.helpers.replaceSymbols("###-##-####"),
    passport_number: faker.string.alphanumeric(9).toUpperCase(),
    email: faker.internet.email(),
    phone: faker.phone.number("+1-###-###-####"),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postal_code: faker.location.zipCode(),
      country: "USA",
    },
    employment: {
      company: faker.company.name(),
      position: faker.person.jobTitle(),
    },
    credit_card: {
      network: faker.helpers.arrayElement(["Visa", "Mastercard", "Amex"]),
      number: faker.finance.creditCardNumber(),
      expiry: faker.date.future({ years: 5 }).toISOString().slice(0, 7),
    },
    notes: faker.lorem.paragraphs(100),
    history: Array.from({ length: 50 }, () => ({
      timestamp: faker.date.past().toISOString(),
      action: faker.hacker.phrase(),
    })),
  };
}

async function seed() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("maskingbenchmark");
    const collection = db.collection("users");

    console.log("Starting  seeder...");

    for (let i = 0; i < 1000; i++) {
      const batch = Array.from({ length: 100 }, () => createUser()); // 100 docs por batch
      await collection.insertMany(batch);
      console.log(`Inserted batch ${i + 1} (total ${(i + 1) * 100} docs)`);
    }

    console.log("Finished seeding.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

seed();
