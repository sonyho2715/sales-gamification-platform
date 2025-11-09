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

  // Create sample sales for last 30 days
  const today = new Date();
  const salespeople = users.filter(u => u.role === 'SALESPERSON');

  logger.info('Creating sales data for last 30 days...');
  const sales = [];

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const saleDate = new Date(today);
    saleDate.setDate(saleDate.getDate() - dayOffset);
    saleDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < salespeople.length; i++) {
      const salesperson = salespeople[i];
      const saleCount = Math.floor(Math.random() * 4) + 2; // 2-5 sales per person per day

      for (let j = 0; j < saleCount; j++) {
        const hour = Math.floor(Math.random() * 8) + 9; // 9am-5pm
        const minute = Math.floor(Math.random() * 60);
        const saleTime = new Date(saleDate);
        saleTime.setHours(hour, minute, 0, 0);

        const totalAmount = Math.floor(Math.random() * 3500) + 800; // $800-$4300
        const fcpAmount = totalAmount * (Math.random() * 0.30 + 0.08); // 8-38% FCP
        const hoursWorked = Math.random() * 3 + 5; // 5-8 hours

        const sale = await prisma.sale.create({
          data: {
            organizationId: organization.id,
            locationId: salesperson.locationId!,
            userId: salesperson.id,
            transactionNumber: `TXN-${saleDate.getTime()}-${i}-${j}`,
            saleDate,
            saleTime,
            totalAmount,
            fcpAmount,
            hoursWorked,
            customerName: `Customer ${dayOffset * 100 + i * 10 + j}`,
            notes: Math.random() > 0.7 ? 'Excellent customer interaction!' : undefined,
            items: {
              create: [
                {
                  productCategoryId: categories[Math.floor(Math.random() * 3)].id,
                  productName: categories[Math.floor(Math.random() * 3)].name,
                  quantity: 1,
                  unitPrice: totalAmount - fcpAmount,
                  totalPrice: totalAmount - fcpAmount,
                  costPrice: (totalAmount - fcpAmount) * 0.55,
                  marginAmount: (totalAmount - fcpAmount) * 0.45,
                  marginPercentage: 45,
                },
                {
                  productCategoryId: categories[3].id, // FCP
                  productName: 'Furniture Care Protection',
                  quantity: 1,
                  unitPrice: fcpAmount,
                  totalPrice: fcpAmount,
                  costPrice: fcpAmount * 0.2,
                  marginAmount: fcpAmount * 0.8,
                  marginPercentage: 80,
                },
              ],
            },
          },
        });

        sales.push(sale);
      }
    }
  }

  logger.info(`Created ${sales.length} sample sales over last 30 days`);

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

  // Create coaching playbooks
  logger.info('Creating coaching playbooks...');

  const manager = users.find(u => u.role === 'MANAGER')!;
  const playbooks = [];

  // High priority - Performance drop
  playbooks.push(await prisma.coachingPlaybook.create({
    data: {
      organizationId: organization.id,
      userId: salespeople[3].id,
      trigger: 'PERFORMANCE_DROP',
      status: 'RECOMMENDED',
      priority: 8,
      title: `${salespeople[3].firstName}'s sales dropped 25% this week`,
      description: 'Performance has declined significantly compared to last week.',
      diagnosisData: {
        currentWeekSales: 8500,
        previousWeekSales: 11333,
        dropPercentage: 25,
        avgDailySales: 1214,
      },
      recommendedActions: [
        { action: 'Schedule 1-on-1 meeting', priority: 1, description: 'Discuss challenges and barriers' },
        { action: 'Review recent sales approach', priority: 2, description: 'Identify what changed' },
        { action: 'Shadow top performer', priority: 3, description: 'Learn from successful techniques' },
      ],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  }));

  // Medium priority - Low FCP
  playbooks.push(await prisma.coachingPlaybook.create({
    data: {
      organizationId: organization.id,
      userId: salespeople[4].id,
      managerId: manager.id,
      trigger: 'LOW_FCP_RATE',
      status: 'ASSIGNED',
      priority: 6,
      title: `${salespeople[4].firstName}'s FCP rate is 22% (target: 35%)`,
      description: 'FCP percentage is significantly below company average and target.',
      diagnosisData: {
        currentFCP: 22,
        targetFCP: 35,
        companyAvgFCP: 28,
        gap: 13,
      },
      recommendedActions: [
        { action: 'FCP training session', priority: 1, description: 'Review FCP techniques' },
        { action: 'Practice role-play scenarios', priority: 2, description: 'Build confidence' },
        { action: 'Set daily FCP goals', priority: 3, description: 'Track progress daily' },
      ],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  }));

  // In progress - Below goal
  playbooks.push(await prisma.coachingPlaybook.create({
    data: {
      organizationId: organization.id,
      userId: salespeople[2].id,
      managerId: manager.id,
      trigger: 'BELOW_GOAL',
      status: 'IN_PROGRESS',
      priority: 5,
      title: `${salespeople[2].firstName} is at 65% of weekly sales goal`,
      description: 'Consistently performing below target goals.',
      diagnosisData: {
        currentProgress: 9750,
        goalTarget: 15000,
        percentageAchieved: 65,
        daysRemaining: 3,
      },
      recommendedActions: [
        { action: 'Focus on high-value products', priority: 1, description: 'Prioritize premium items' },
        { action: 'Increase customer engagement', priority: 2, description: 'Build rapport' },
        { action: 'Daily check-ins', priority: 3, description: 'Monitor progress' },
      ],
      progressNotes: [
        {
          note: 'Had initial conversation - motivated to improve',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: `${manager.firstName} ${manager.lastName}`,
        },
      ],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  }));

  // Completed playbook
  playbooks.push(await prisma.coachingPlaybook.create({
    data: {
      organizationId: organization.id,
      userId: salespeople[1].id,
      managerId: manager.id,
      trigger: 'MANUAL',
      status: 'COMPLETED',
      priority: 4,
      title: 'New product line training',
      description: 'Training on new product line and sales techniques.',
      diagnosisData: {
        reason: 'New product launch training',
      },
      recommendedActions: [
        { action: 'Complete product training', priority: 1, description: 'Learn features' },
        { action: 'Practice demonstrations', priority: 2, description: 'Build confidence' },
      ],
      progressNotes: [
        {
          note: 'Completed product training successfully',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: `${manager.firstName} ${manager.lastName}`,
        },
      ],
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  }));

  logger.info(`Created ${playbooks.length} coaching playbooks`);

  logger.info('Seed completed successfully!');
  logger.info('');
  logger.info('📊 Summary:');
  logger.info(`   - Users: ${users.length} (${salespeople.length} salespeople, 1 manager, 1 admin)`);
  logger.info(`   - Locations: ${locations.length}`);
  logger.info(`   - Product Categories: ${categories.length}`);
  logger.info(`   - Sales: ${sales.length} (last 30 days)`);
  logger.info(`   - Goals: ${salespeople.length}`);
  logger.info(`   - Coaching Playbooks: ${playbooks.length}`);
  logger.info('');
  logger.info('🔑 Login credentials:');
  logger.info('   Admin: admin@demo.com / password123');
  logger.info('   Manager: manager@demo.com / password123');
  logger.info('   Sales: john.smith@demo.com / password123');
  logger.info('   Sales: sarah.johnson@demo.com / password123');
  logger.info('   Sales: mike.davis@demo.com / password123');
  logger.info('');
}

main()
  .catch((e) => {
    logger.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
