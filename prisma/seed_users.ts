import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding users...");


  // Delete existing users to ensure clean state
  await prisma.usuario.deleteMany({});

  // Seed dnavarro (ADMIN)
  const dnavarro = await prisma.usuario.create({
    data: {
      username: "dnavarro",
      password: "csl123",
      rol: "ADMIN",
    },
  });
  console.log(`Created user: ${dnavarro.username} (${dnavarro.rol})`);

  // Seed admin (ADMIN)
  const admin = await prisma.usuario.create({
    data: {
      username: "admin",
      password: "admin",
      rol: "ADMIN",
    },
  });
  console.log(`Created user: ${admin.username} (${admin.rol})`);

  // Seed lector (LECTOR)
  const lector = await prisma.usuario.create({
    data: {
      username: "lector",
      password: "lector",
      rol: "LECTOR",
    },
  });
  console.log(`Created user: ${lector.username} (${lector.rol})`);

  console.log("User seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
