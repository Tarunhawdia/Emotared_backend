//this is only for testing purpose to clear the database
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    // First check if any contacts exist
    const count = await prisma.contact.count();

    if (count === 0) {
      console.log("No data present in Contact table.");
      return;
    }

    // If contacts exist, proceed with deletion
    await prisma.contact.deleteMany({});
    console.log("All data cleared from Contact table.");
  } catch (error) {
    console.error("Error clearing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
