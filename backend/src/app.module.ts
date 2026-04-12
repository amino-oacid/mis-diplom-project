import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigFactory } from './config/database.config';
import { HashModule } from './modules/hash/hash.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ServicesModule } from './modules/services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config], isGlobal: true }), // Подключение конфига бекенда
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigFactory,
    }), // Подключение конфига бд для TypeOrm
    HashModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PrescriptionsModule,
    InventoryModule,
    ReportsModule,
    ServicesModule,
  ], // Подключение всех остальных модулей
  controllers: [AppController], // Контроллер бекенда
  providers: [],
})
export class AppModule {}
