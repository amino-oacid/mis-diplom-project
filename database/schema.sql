-- Удаление существующих таблиц
DROP TABLE IF EXISTS inventory_log CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удаление существующих типов
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS inventory_type CASCADE;

-- Роли пользователей системы
CREATE TYPE user_role AS ENUM ('admin', 'doctor');

-- Статусы приёма
CREATE TYPE appointment_status AS ENUM (
    'scheduled',    -- Запланирован
    'in_progress',  -- В процессе
    'completed',    -- Завершён
    'cancelled'     -- Отменён
);

-- Пол пациента
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- Тип инвентаря
CREATE TYPE inventory_type AS ENUM (
    'medication',   -- Медикаменты
    'consumable',   -- Расходные материалы
    'equipment'     -- Оборудование
);


-- Таблица: users (Пользователи системы)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'doctor',
    last_name VARCHAR(100) NOT NULL,      
    first_name VARCHAR(100) NOT NULL,     
    middle_name VARCHAR(100),             
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    refresh_token VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: patients (Пациенты)
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,      
    first_name VARCHAR(100) NOT NULL,     
    middle_name VARCHAR(100),             
    birth_date DATE NOT NULL,
    gender gender_type NOT NULL,
    phone VARCHAR(20) NOT NULL,          
    phone_additional VARCHAR(20),         
    email VARCHAR(255),
    address TEXT,
    passport_series VARCHAR(10),         
    passport_number VARCHAR(20),          
    passport_issued_by TEXT,              
    passport_issued_date DATE,           
    snils VARCHAR(14),                   
    insurance_policy VARCHAR(50),        
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: doctors (Врачи)
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(150) NOT NULL,  
    qualification VARCHAR(100),           
    experience_years INTEGER DEFAULT 0,   
    office_number VARCHAR(20),
    education TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: services (Медицинские услуги)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: medical_records (Электронные медицинские карты)
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    card_number VARCHAR(50) UNIQUE,
    blood_type VARCHAR(10),              
    allergies TEXT,
    chronic_diseases TEXT,
    life_anamnesis TEXT,
    surgeries TEXT,
    family_anamnesis TEXT,
    bad_habits TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: appointments (Приёмы)
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    complaints TEXT,
    diagnosis TEXT,
    conclusion TEXT,
    recommendations TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: prescriptions (Назначения)
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    form VARCHAR(100),
    frequency VARCHAR(150),               
    administration_route VARCHAR(100),   
    duration VARCHAR(100),                
    start_date DATE,
    end_date DATE,
    instructions TEXT,
    prescribed_by INTEGER REFERENCES doctors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: inventory (Склад)
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type inventory_type NOT NULL DEFAULT 'consumable',
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    unit VARCHAR(50) NOT NULL DEFAULT 'шт', 
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    purchase_price DECIMAL(10, 2),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: inventory_log (Журнал движения склада)
CREATE TABLE inventory_log (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('income', 'expense')),
    quantity INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    reason TEXT,
    performed_by INTEGER NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_users_login ON users(login);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_patients_full_name ON patients(last_name, first_name, middle_name);
CREATE INDEX idx_patients_birth_date ON patients(birth_date);
CREATE INDEX idx_patients_snils ON patients(snils);
CREATE INDEX idx_patients_insurance_policy ON patients(insurance_policy);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_services_code ON services(code);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_card_number ON medical_records(card_number);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX idx_appointments_doctor_date_time ON appointments(doctor_id, appointment_date, start_time);
CREATE INDEX idx_prescriptions_appointment_id ON prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_start_date ON prescriptions(start_date);
CREATE INDEX idx_inventory_type ON inventory(type);
CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity, min_quantity) WHERE quantity <= min_quantity;
CREATE INDEX idx_inventory_log_inventory_id ON inventory_log(inventory_id);
CREATE INDEX idx_inventory_log_appointment_id ON inventory_log(appointment_id);
CREATE INDEX idx_inventory_log_performed_at ON inventory_log(performed_at);
CREATE INDEX idx_inventory_log_operation_type ON inventory_log(operation_type);

-- Триггер
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применение триггера ко всем таблицам с полем updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Тестовые услуги клиники
INSERT INTO services (code, name, description, category, price) VALUES
('CONS-001', 'Первичная консультация терапевта', 'Осмотр, сбор анамнеза, назначение обследований', 'Терапия', 2000.00),
('CONS-002', 'Повторная консультация терапевта', 'Оценка результатов обследований, корректировка лечения', 'Терапия', 1500.00),
('CONS-003', 'Первичная консультация кардиолога', 'Осмотр, ЭКГ, рекомендации', 'Кардиология', 3500.00),
('CONS-004', 'Повторная консультация кардиолога', 'Оценка динамики, корректировка терапии', 'Кардиология', 2500.00),
('CONS-005', 'Первичная консультация невролога', 'Неврологический осмотр, назначения', 'Неврология', 3000.00),
('CONS-006', 'Повторная консультация невролога', 'Контрольный осмотр', 'Неврология', 2000.00),
('DIAG-001', 'ЭКГ', 'Электрокардиография в покое', 'Диагностика', 1000.00),
('DIAG-002', 'УЗИ органов брюшной полости', 'Комплексное ультразвуковое исследование', 'Диагностика', 2500.00),
('DIAG-003', 'УЗИ щитовидной железы', 'Ультразвуковое исследование щитовидной железы', 'Диагностика', 1500.00),
('DIAG-004', 'Общий анализ крови', 'Клинический анализ крови с лейкоформулой', 'Лабораторная диагностика', 800.00),
('DIAG-005', 'Биохимический анализ крови', 'Расширенный биохимический профиль', 'Лабораторная диагностика', 2000.00),
('PROC-001', 'Внутривенная инъекция', 'Внутривенное введение препарата', 'Процедуры', 500.00),
('PROC-002', 'Внутримышечная инъекция', 'Внутримышечное введение препарата', 'Процедуры', 300.00),
('PROC-003', 'Капельница', 'Инфузионная терапия', 'Процедуры', 1500.00),
('PROC-004', 'Перевязка', 'Перевязка раны', 'Процедуры', 800.00)
ON CONFLICT (code) DO NOTHING;