# Configuration de NestJS avec MySQL

Ce guide vous explique comment configurer un projet NestJS avec une base de données MySQL en utilisant TypeORM.

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (gestionnaire de paquets Node.js)
- MySQL installé et en cours d'exécution
- Un utilisateur MySQL avec les droits suffisants

## Étapes d'installation

### 1. Création du projet

```bash
# Installation du CLI NestJS globalement (si ce n'est pas déjà fait)
npm install -g @nestjs/cli

# Création d'un nouveau projet
nest new nom-du-projet
cd nom-du-projet
```

### 2. Installation des dépendances

```bash
# Installation des dépendances requises
npm install --save @nestjs/typeorm typeorm mysql2 @nestjs/config
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=nom_de_la_base
DB_SYNC=true  # À désactiver en production
```

Créez également un fichier `.env.example` avec les mêmes clés mais sans les valeurs sensibles.

### 4. Configuration du module principal

Mettez à jour le fichier `src/app.module.ts` :

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'test'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', 'true') === 'true',
      }),
    }),
  ],
})
export class AppModule {}
```

### 5. Création d'une entité

Créez un dossier `src/entities` et ajoutez une entité, par exemple `user.entity.ts` :

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;
}
```

### 6. Création d'un module

Créez un module pour gérer vos entités, par exemple `src/user/user.module.ts` :

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule]
})
export class UserModule {}
```

### 7. Démarrage du serveur

```bash
# Mode développement (avec rechargement à chaud)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

## Dépannage ##

### Erreur : "Mysql package has not been found installed"

```bash
npm install mysql2 --save
```

### Erreur de connexion à la base de données

1. Vérifiez que MySQL est en cours d'exécution
2. Vérifiez les identifiants dans le fichier `.env`
3. Assurez-vous que l'utilisateur a les droits nécessaires

## Bonnes pratiques

- Ne jamais commettre le fichier `.env` dans le contrôle de version
- Utiliser des migrations pour les changements de schéma en production
- Désactiver `synchronize: true` en production
- Utiliser des variables d'environnement pour la configuration

## Ressources utiles

- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation TypeORM](https://typeorm.io/)
- [Documentation MySQL](https://dev.mysql.com/doc/)
