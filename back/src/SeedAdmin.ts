import * as bcrypt from 'bcryptjs';
import { UserService } from "./user/user.service";
import { AdminService } from './admin/admin.service';

export async function seedAdmin(adminService: AdminService) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
  
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment');
    }
  
    const existingAdmin = await adminService.findByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await adminService.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin seeded.');
    }
  }
  