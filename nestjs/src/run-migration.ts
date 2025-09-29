import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AddUserVerificationFields1712345678901 } from './migrations/1712345678901-AddUserVerificationFields';

// Charger les variables d'environnement
config();

// Configuration de la connexion à la base de données
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'enale',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});

// Exécuter la migration
async function runMigration() {
  try {
    console.log('Initialisation de la connexion à la base de données...');
    await AppDataSource.initialize();
    
    console.log('Exécution de la migration...');
    const migration = new AddUserVerificationFields1712345678901();
    await migration.up(AppDataSource.createQueryRunner());
    
    console.log('Migration exécutée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la migration:', error);
    process.exit(1);
  }
}

runMigration();
