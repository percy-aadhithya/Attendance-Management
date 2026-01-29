import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Classes
  const classes = ['Bharatanatyam', 'Singing', 'Slokha']
  for (const className of classes) {
    await prisma.class.upsert({
      where: { name: className },
      update: {},
      create: { name: className },
    })
  }

  // Locations
  const locations = ['JP Nagar', 'Pride Apartment']
  for (const locationName of locations) {
    await prisma.location.upsert({
      where: { name: locationName },
      update: {},
      create: { name: locationName },
    })
  }

  console.log('Seed data created.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
