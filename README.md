# Mis Finanzas

Gestor de finanzas personales: carga rápida de gastos/ingresos, movimientos con filtros, dashboard con gráficos, presupuestos por categoría, metas de ahorro e importación de CSV bancario.

## Desarrollo local

```bash
npm install
npm run db:seed   # crea el usuario único (SEED_EMAIL/SEED_PASSWORD en .env) y categorías por defecto
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Iniciá sesión con el email y contraseña definidos en `.env` (`SEED_EMAIL` / `SEED_PASSWORD`). **Cambiá `SEED_PASSWORD` antes de usar la app en serio** y volvé a correr `npm run db:seed`.

Base de datos: SQLite local (`dev.db`, ignorado por git). Para inspeccionarla visualmente: `npm run db:studio`.

## Estructura

- `app/(auth)/login` — login.
- `app/(app)/*` — páginas protegidas (dashboard, nuevo, movimientos, presupuestos, metas, categorías, importar), cada una con su `actions.ts` de Server Actions.
- `lib/` — cliente Prisma, auth (JWT en cookie httpOnly), validaciones zod, queries de agregación, helpers de fecha/formato/CSV.
- `prisma/schema.prisma` — modelos (User, Category, Transaction, Budget, Goal).

## Desplegar en producción (Vercel + Neon)

1. Crear cuenta gratis en [Neon](https://neon.tech) y una base Postgres nueva; copiar el `DATABASE_URL`.
2. En `prisma/schema.prisma` cambiar `provider = "sqlite"` por `provider = "postgresql"` en el bloque `datasource`, y correr `npx prisma migrate dev --name postgres` en local contra el nuevo `DATABASE_URL` para generar la migración.
3. Subir el repo a GitHub.
4. Crear cuenta gratis en [Vercel](https://vercel.com), importar el repo.
5. Cargar variables de entorno en Vercel: `DATABASE_URL`, `AUTH_SECRET` (generar uno nuevo y largo, no reusar el de desarrollo), `SEED_EMAIL`, `SEED_PASSWORD`.
6. Tras el primer deploy, correr el seed contra producción (`npx prisma db seed` con el `DATABASE_URL` de producción en el entorno) para crear el usuario y las categorías.
7. Entrar desde el celular a la URL de Vercel y loguearse.
