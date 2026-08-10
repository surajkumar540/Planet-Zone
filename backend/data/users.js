/**
 * Seed accounts. Passwords are plaintext here on purpose: the seeder creates
 * users through the model, whose pre-save hook hashes them. Pre-hashing would
 * result in a double hash and unusable credentials.
 */
const users = [
  {
    firstName: "Admin",
    lastName: "Singh",
    email: "jaibhandari804@gmail.com",
    password: "Test@1234",
    isAdmin: true,
    emailVerify: true,
  },
  {
    firstName: "Suraj",
    lastName: "Gautam",
    email: "surajgautam56876@gmail.com",
    password: "Test@1234",
    isAdmin: true,
    emailVerify: true,
  },
];

module.exports = users;
