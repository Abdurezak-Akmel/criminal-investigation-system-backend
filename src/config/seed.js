import bcrypt from 'bcryptjs';
import User from '../modules/users/user.model.js';

export async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD is not configured.');
    return;
  }

  // if admin email already exixts, make sure it has administrative priviledges
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.isActive = true;
      await existingAdmin.save();
    }

    console.log(`Admin account already exists for ${adminEmail}.`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const badgeNumber = `ADMIN-${Date.now().toString().slice(-6)}`;

  await User.create({
    email: adminEmail,
    passwordHash,
    fullName: 'System Administrator',
    role: 'admin',
    badgeNumber,
    agencyDepartment: 'Administration',
    contactPhone: '',
    isVerified: true,
    isActive: true,
  });

  console.log(`Seeded admin user: ${adminEmail}`);
}

export default seedAdmin;
