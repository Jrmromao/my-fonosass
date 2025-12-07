import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@fonosaas.com' },
      update: {
        role: 'ADMIN',
      },
      create: {
        email: 'admin@fonosaas.com',
        clerkUserId: 'admin-test-user-123',
        fullName: 'Admin User',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@fonosaas.com');
    console.log('🔑 Clerk User ID:', adminUser.clerkUserId);
    console.log('👤 Role:', adminUser.role);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('🎉 Admin user setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin user setup failed:', error);
      process.exit(1);
    });
}

export default createAdminUser;
