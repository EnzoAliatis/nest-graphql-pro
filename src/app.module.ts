import { join } from 'path';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // Configuracion basicas de GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),

    // Configuracion de GraphQL con Autenticacion
    // GraphQLModule.forRootAsync({
    //   driver: ApolloDriver,
    //   imports: [AuthModule],
    //   inject: [JwtService],
    //   useFactory: async (jwtService: JwtService) => ({
    //     autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //     playground: false,
    //     plugins: [ApolloServerPluginLandingPageLocalDefault],
    //     context({ req }) {
    //       try {
    //         const token = req.headers.authorization?.replace('Bearer ', '');
    //         const payload = jwtService.verify(token);
    //         if (!payload) {
    //           throw new Error('Invalid token');
    //         }
    //       } catch (error) {
    //         console.log(error);
    //         throw new Error('No token provided');
    //       }

    //       // if (!token) {
    //       //   throw new Error('No token provided');
    //       // }
    //     },
    //   }),
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: true,
      autoLoadEntities: true,
    }),
    ItemsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
