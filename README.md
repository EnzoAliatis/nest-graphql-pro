<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Dev

1. Clonar el repo

2. Copiar el env.template y renombrar a .env

3. Ejecutar `pnpm install`

4. Levantar la imagen de Docker
   `docker-compose up`

5. Levantar el server de nest
   `pnpm start:dev`

6. Visitar
   `localhost:3000/graphql`

7. Ejecutar el seed, **"mutation"**, para llenar la base de datos

```
mutation Mutation {
  runSeed
}
```
