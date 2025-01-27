import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import readline from "readline";
import bcrypt from "bcrypt";

interface UserData {
  id: number;
  name: string;
  email: string;
  password: string;
}

const prisma = new PrismaClient();

async function parseUUser(filePath: string): Promise<number[]> {
  const userIds: number[] = [];

  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    // Each line format: user id | age | gender | occupation | zip code
    const parts = line.split("|");
    const userId = parseInt(parts[0], 10);
    if (!isNaN(userId)) {
      userIds.push(userId);
    }
  }

  return userIds;
}

async function importUsers() {
  const filePath = path.join(
    __dirname,
    "../data/u.user"
  );

  console.log("Parsing u.user file...");
  const userIds = await parseUUser(filePath);
  console.log(`Parsed ${userIds.length} users.`);

  console.log("Importing users into the database...");

  for (const id of userIds) {
    // Check if the user already exists to avoid duplicates
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      console.log(`User with ID ${id} already exists. Skipping.`);
      continue;
    }

    // Generate name and email
    const name = `User${id}`;
    const email = `user${id}@example.com`;
    const plainPassword = "123123123";

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, id);

    // Create the user
    try {
      await prisma.user.create({
        data: {
          id, // Assigning the same ID from the dataset
          name,
          email,
          password: hashedPassword,
        },
      });
      console.log(`Imported User ID ${id}: ${name}, ${email}`);
    } catch (error: any) {
      console.error(`Error importing User ID ${id}:`, error.message);
    }
  }

  console.log("User import completed.");
}

importUsers()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });