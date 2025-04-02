const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Users
  const users = await prisma.user.createMany({
    data: [
      { name: 'Alice', role: 'cashier', email: 'alice@example.com', utorid: 'alice123' },
      { name: 'Bob', role: 'manager', email: 'bob@example.com', utorid: 'bob123' },
      { name: 'Charlie', role: 'superuser', email: 'charlie@example.com', utorid: 'charlie123' },
      { name: 'David', role: 'regular', email: 'david@example.com', utorid: 'david123' },
      { name: 'Eve', role: 'regular', email: 'eve@example.com', utorid: 'eve123' },
      { name: 'Frank', role: 'regular', email: 'frank@example.com', utorid: 'frank123' },
      { name: 'Grace', role: 'regular', email: 'grace@example.com', utorid: 'grace123' },
      { name: 'Hank', role: 'regular', email: 'hank@example.com', utorid: 'hank123' },
      { name: 'Ivy', role: 'regular', email: 'ivy@example.com', utorid: 'ivy123' },
      { name: 'Jack', role: 'regular', email: 'jack@example.com', utorid: 'jack123' },
    ],
  });

  console.log('Seeded users:', users);

  // Seed Transactions
  const transactionTypes = ['purchase', 'adjustment', 'transfer', 'redemption', 'event'];
  const transactions = [];
  for (let i = 0; i < 30; i++) {
    transactions.push({
      type: transactionTypes[i % transactionTypes.length],
      points: Math.floor(Math.random() * 100) + 1,
      spent: Math.random() > 0.5 ? Math.floor(Math.random() * 1000) + 1 : null,
      userId: Math.floor(Math.random() * 10) + 1, // Assuming user IDs are 1-10
      createdBy: Math.floor(Math.random() * 10) + 1, // Assuming user IDs are 1-10
      processedBy: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : null,
      remark: `Transaction remark ${i + 1}`,
    });
  }
  await prisma.transaction.createMany({ data: transactions });
  console.log('Seeded transactions.');

  // Seed Events
  const events = [];
  for (let i = 0; i < 5; i++) {
    events.push({
      name: `Event ${i + 1}`,
      description: `Description for Event ${i + 1}`,
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 3600 * 1000), // 1 hour later
      location: `Location ${i + 1}`,
      pointsAwarded: Math.floor(Math.random() * 100),
      pointsRemain: Math.floor(Math.random() * 100),
      capacity: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : null,
      published: Math.random() > 0.5,
    });
  }
  await prisma.event.createMany({ data: events });
  console.log('Seeded events.');

  // Seed Promotions
  const promotions = [];
  for (let i = 0; i < 5; i++) {
    promotions.push({
      name: `Promotion ${i + 1}`,
      description: `Description for Promotion ${i + 1}`,
      type: 'discount', // Example type, adjust as needed
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 7 * 24 * 3600 * 1000), // 1 week later
      minSpending: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 0,
      rate: Math.random() > 0.5 ? Math.random() : null,
      points: Math.random() > 0.5 ? Math.floor(Math.random() * 50) : 0,
    });
  }
  await prisma.promotion.createMany({ data: promotions });
  console.log('Seeded promotions.');

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });