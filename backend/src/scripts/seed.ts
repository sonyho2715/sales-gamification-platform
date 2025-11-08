import prisma from '../config/database';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

async function main() {
  logger.info('Starting database seed...');

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-furniture' },
    update: {},
    create: {
      name: 'Demo Furniture Store',
      slug: 'demo-furniture',
      settings: {},
    },
  });

  logger.info('Organization created:', organization.name);

  // Create locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { code: 'MAIN' },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'Main Store',
        code: 'MAIN',
        address: '123 Main St, City, State 12345',
      },
    }),
    prisma.location.upsert({
      where: { code: 'NORTH' },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'North Branch',
        code: 'NORTH',
        address: '456 North Ave, City, State 12345',
      },
    }),
    prisma.location.upsert({
      where: { code: 'SOUTH' },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'South Branch',
        code: 'SOUTH',
        address: '789 South Blvd, City, State 12345',
      },
    }),
  ]);

  logger.info(`Created ${locations.length} locations`);

  // Create product categories
  const categories = await Promise.all([
    prisma.productCategory.create({
      data: {
        organizationId: organization.id,
        name: 'Posturepedic Mattress',
        code: 'POSTURE',
        trackedForGoals: true,
      },
    }),
    prisma.productCategory.create({
      data: {
        organizationId: organization.id,
        name: 'Tempurpedic Mattress',
        code: 'TEMPUR',
        trackedForGoals: true,
      },
    }),
    prisma.productCategory.create({
      data: {
        organizationId: organization.id,
        name: 'Adjustable Bed Base',
        code: 'ADJUST',
        trackedForGoals: true,
      },
    }),
    prisma.productCategory.create({
      data: {
        organizationId: organization.id,
        name: 'Furniture Care Protection',
        code: 'FCP',
        trackedForGoals: false,
      },
    }),
  ]);

  logger.info(`Created ${categories.length} product categories`);

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create users
  const users = await Promise.all([
    // Admin
    prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        organizationId: organization.id,
        locationId: locations[0].id,
        email: 'admin@demo.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        hireDate: new Date('2023-01-01'),
      },
    }),
    // Manager
    prisma.user.upsert({
      where: { email: 'manager@demo.com' },
      update: {},
      create: {
        organizationId: organization.id,
        locationId: locations[0].id,
        email: 'manager@demo.com',
        passwordHash,
        firstName: 'Manager',
        lastName: 'User',
        role: 'MANAGER',
        hireDate: new Date('2023-02-01'),
      },
    }),
    // Salespeople
    prisma.user.upsert({
      where: { email: 'john.smith@demo.com' },
      update: {},
      create: {
        organizationId: organization.id,
        locationId: locations[0].id,
        email: 'john.smith@demo.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Smith',
        role: 'SALESPERSON',
        hireDate: new Date('2023-03-01'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.johnson@demo.com' },
      update: {},
      create: {
        organizationId: organization.id,
        locationId: locations[0].id,
        email: 'sarah.johnson@demo.com',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'SALESPERSON',
        hireDate: new Date('2023-03-15'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.davis@demo.com' },
      update: {},
      create: {
        organizationId: organization.id,
        locationId: locations[1].id,
        email: 'mike.davis@demo.com',
        passwordHash,
        firstName: 'Mike',
        lastName: 'Davis',
        role: 'SALESPERSON',
        hireDate: new Date('2023-04-01'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'emily.wilson@demo.com' },
      update: {},
      create: {
        organizationId: organization.id,
        locationId: locations[1].id,
        email: 'emily.wilson@demo.com',
        passwordHash,
        firstName: 'Emily',
        lastName: 'Wilson',
        role: 'SALESPERSON',
        hireDate: new Date('2023-04-15'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'david.brown@demo.com' },
      update: {},
      create: {
        organizationId: organization.id,
        locationId: locations[2].id,
        email: 'david.brown@demo.com',
        passwordHash,
        firstName: 'David',
        lastName: 'Brown',
        role: 'SALESPERSON',
        hireDate: new Date('2023-05-01'),
      },
    }),
  ]);

  logger.info(`Created ${users.length} users`);

  // Clean up existing sales and goals to allow fresh seed
  logger.info('Cleaning up existing sales and goals...');
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.goal.deleteMany({});
  logger.info('Cleanup complete');

  // Create sample sales for today
  const today = new Date();
  const salespeople = users.filter(u => u.role === 'SALESPERSON');

  const sales = [];
  for (let i = 0; i < salespeople.length; i++) {
    const salesperson = salespeople[i];
    const saleCount = Math.floor(Math.random() * 3) + 1; // 1-3 sales per person

    for (let j = 0; j < saleCount; j++) {
      const totalAmount = Math.floor(Math.random() * 3000) + 1000; // $1000-$4000
      const fcpAmount = totalAmount * (Math.random() * 0.25 + 0.10); // 10-35% FCP

      const sale = await prisma.sale.create({
        data: {
          organizationId: organization.id,
          locationId: salesperson.locationId!,
          userId: salesperson.id,
          transactionNumber: `TXN-${Date.now()}-${i}-${j}`,
          saleDate: today,
          saleTime: new Date(),
          totalAmount,
          fcpAmount,
          hoursWorked: 8,
          customerName: `Customer ${i * 10 + j}`,
          items: {
            create: [
              {
                productCategoryId: categories[Math.floor(Math.random() * categories.length)].id,
                productName: 'Sample Product',
                quantity: 1,
                unitPrice: totalAmount - fcpAmount,
                totalPrice: totalAmount - fcpAmount,
              },
              {
                productCategoryId: categories[3].id, // FCP
                productName: 'Furniture Care Protection',
                quantity: 1,
                unitPrice: fcpAmount,
                totalPrice: fcpAmount,
              },
            ],
          },
        },
      });

      sales.push(sale);
    }
  }

  logger.info(`Created ${sales.length} sample sales`);

  // Create goals for salespeople
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  for (const salesperson of salespeople) {
    await prisma.goal.create({
      data: {
        organizationId: organization.id,
        userId: salesperson.id,
        goalType: 'MONTHLY_SALES',
        targetValue: 50000,
        periodStart: firstDayOfMonth,
        periodEnd: lastDayOfMonth,
        createdBy: users[1].id, // Manager
      },
    });
  }

  logger.info('Created monthly goals for all salespeople');

  logger.info('Seed completed successfully!');
  logger.info('');
  logger.info('Login credentials:');
  logger.info('Admin: admin@demo.com / password123');
  logger.info('Manager: manager@demo.com / password123');
  logger.info('Salesperson: john.smith@demo.com / password123');
}

main()
  .catch((e) => {
    logger.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
