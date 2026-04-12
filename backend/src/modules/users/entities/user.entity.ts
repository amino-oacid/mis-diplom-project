import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  AfterLoad,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum UserRole {
  ADMIN = 'admin',    // Администратор - полный доступ к функционалу: приемы, пациенты, склад, отчеты
  DOCTOR = 'doctor',  // Врач - доступ только к приемам и пациентам
}

// User - сущность для хранения данных пользователей системы (врачей и администраторов)
// Используется для аутентификации и авторизации
@Entity('users') // В бд таблица users
export class User {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор пользователя, автоинкрементный первичный ключ

  @Column({ type: 'varchar', length: 50, unique: true })
  login: string; // логин для входа в систему

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string; // bcrypt-хеш пароля

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DOCTOR,
  })
  role: UserRole; // роль пользователя (admin или doctor)

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string; // фамилия пользователя

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string; // имя пользователя

  @Column({ type: 'varchar', length: 100, name: 'middle_name', nullable: true })
  middleName: string | null; // отчество пользователя

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null; // электронная почта

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null; // телефон

  @Column({ type: 'varchar', length: 150, nullable: true })
  position: string | null; // должность сотрудника

  /**
   * Зачем хранить в БД:
   * - Позволяет отозвать сессию (logout), при выходе обнуляется
   * - Защита от повторного использования старых токенов
   *
   * При обновлении токенов (POST /api/auth/refresh):
   * 1. Проверяем, что присланный токен совпадает с сохранённым
   * 2. Генерируем новую пару токенов
   * 3. Обновляем refreshToken в БД
   */
  @Column({ type: 'varchar', length: 500, name: 'refresh_token', nullable: true })
  refreshToken: string | null; // refresh токен пользователя

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи

  @OneToOne(() => Doctor, (doctor) => doctor.user)
  doctor: Doctor; // связь с таблицей doctors (1:1), если role === 'doctor', то существует связанная запись в таблице doctors

  fullName: string; // полное ФИО пользователя, вычисляется автоматически после загрузки сущности из БД (@AfterLoad)

  @AfterLoad()
  computeFullName() {
    const parts = [this.lastName, this.firstName];
    if (this.middleName) {
      parts.push(this.middleName);
    }
    this.fullName = parts.join(' ');
  }
}
