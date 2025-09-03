import { faker } from "@faker-js/faker";

export function maskFullName() {
  return faker.person.fullName();
}

export function maskLastName() {
  return faker.person.lastName();
}

export function maskPassword() {
  //todo
  return "";
}

export function maskSSN() {
  const randomDigits = () => Math.floor(100 + Math.random() * 900);
  const randomTwo = () => Math.floor(10 + Math.random() * 90);
  const randomFour = () => Math.floor(1000 + Math.random() * 9000);
  return `${randomDigits()}-${randomTwo()}-${randomFour()}`;
}

export function maskPassportNumber() {
  const letters = faker.string.alpha({ count: 2, casing: "upper" });
  const digits = faker.string.numeric(7);
  return `${letters}${digits}`;
}

export function maskEmail() {
  return faker.internet.email();
}

export function maskPhoneNumber() {
  return faker.phone.number({ style: "international" });
}

export function maskStreetAddress() {
  return faker.location.streetAddress();
}

export function maskPostalCode() {
  return faker.location.zipCode();
}

export function maskCreditCardNumber() {
  return faker.finance.creditCardNumber();
}

export function maskCreditCardExpiry() {
  const month = String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0");
  const year = String(faker.number.int({ min: 25, max: 35 })); // e.g., 2025-2035
  return `${month}/${year.slice(-2)}`;
}

export function maskCreditCardCVV() {
  return faker.finance.creditCardCVV();
}
