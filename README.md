# Normalization Quest Lab (DataQuest)

> **⚠️ IMPORTANTE**: Este README es la guía principal.  
> Para instalación detallada ver [`INSTALLATION.md`](./INSTALLATION.md).  
> Para documentación de API ver [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

> Interactive educational platform for learning database normalization (1FN, 2FN, 3FN, BCNF) through gamification

## Project Overview

**Normalization Quest Lab** is a comprehensive educational application designed to teach database normalization through an interactive, gamified learning experience. It combines:

- **Backend Core**: A sophisticated normalization engine implementing database theory algorithms (Laravel 11 + PHP 8.2)
- **Frontend Interface**: An intuitive React application with React Flow visualization (Vite + TypeScript)
- **Gamification**: Quest-based missions, XP rewards, badges, and ranking system
- **Pedagogical Features**: Intelligent hints, step-by-step diagnosis, and personalized learning paths

## Technologies

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 11, PHP 8.2+ |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | PostgreSQL 15+ (via Supabase) |
| Auth | Laravel Sanctum (token-based) |
| Validation | Custom name validation with blocked terms DB table |

## Quick Start

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- npm or yarn
- PostgreSQL 15+ (or a Supabase account)

### Backend Setup

1. Clone and install dependencies:
```bash
composer install
php artisan key:generate
```

2. Configure database in `.env` (copy from `.env.example`):
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dataquest
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

3. Run migrations and seeders:
```bash
php artisan migrate
php artisan db:seed --class=BlockedTermsSeeder
```

4. Start the server:
```bash
php artisan serve
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

## Supabase Setup (Production/Cloud)

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Enter project name (e.g., `dataquest`)
4. Set a secure database password
5. Choose a region close to you
6. Click **Create new project** (wait ~2 minutes)

### 2. Get Your Credentials
1. In your project dashboard, go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** → `SUPABASE_URL` (e.g., `https://abcxyz.supabase.co`)
   - **anon public key** → `SUPABASE_ANON_KEY`
   - **Database password** (set during project creation)

### 3. Import the Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Open the file `supabase_schema.sql` from this project
4. Copy its entire contents and paste into the SQL Editor
5. Click **Run** (or Ctrl+Enter)
6. Verify all tables were created: go to **Table Editor** → you should see:
   - `users`
   - `esquemas`
   - `validaciones`
   - `puzzles`
   - `intentos_puzzle`
   - `retos_semanales`
   - `participaciones_reto`
   - `logs_sistema`
   - `dominios_aprendizaje`
   - `logros_usuario`
   - `blocked_terms`

### 4. Configure Environment Variables
Create or update your `.env` file:

```env
# Database connection (from Supabase Project Settings → Database)
DB_CONNECTION=pgsql
DB_HOST=db.abcxyz.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-db-password

# Supabase client credentials (from Project Settings → API)
SUPABASE_URL=https://abcxyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database mode
DATABASE_MODE=supabase
```

For the **direct database connection** (used by Laravel), go to **Project Settings** → **Database** → **Connection string** → select **Laravel** tab to get the exact `.env` values.

### 5. Test Connection
```bash
php artisan tinker
>>> DB::connection()->getPdo()
# Should return a PDO object (no exception = connected)
```

## Variables de entorno necesarias

Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
APP_KEY=base64:your-generated-key

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dataquest
DB_USERNAME=postgres
DB_PASSWORD=your_password

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

DATABASE_MODE=local

VITE_API_URL=http://localhost:8000/api
```

> **IMPORTANTE**: Nunca subas el archivo `.env` a repositorios públicos. Ya está incluido en `.gitignore`.

## Blocked Terms (Palabras Prohibidas)

The system includes a validation system that blocks offensive, inappropriate, or invalid names during registration.

### Table Structure

Table: `blocked_terms`

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| term | TEXT (UNIQUE) | The blocked term |
| category | TEXT | Category (offensive, reserved_name, etc.) |
| severity | TEXT | Severity level (low, medium, high) |
| is_active | BOOLEAN | Whether the term is currently enforced |
| description | TEXT | Optional description |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Categories

- `historical_inappropriate` - Names with historical negative connotations
- `hate_reference` - Hate speech references
- `reserved_name` - System reserved names (admin, root, etc.)
- `invalid_name` - Test or placeholder names
- `offensive` - Profanity or offensive terms
- `violence` - Violence-related terms
- `sexual_explicit` - Explicit sexual content
- `incoherent` - Random keyboard spam, repeated characters

### Managing Blocked Terms

Via the command line:
```bash
# List all blocked terms
php artisan blocked-terms list

# Add a new term
php artisan blocked-terms add hitler --category=historical_inappropriate --severity=high

# Remove a term
php artisan blocked-terms remove hitler

# Toggle a term active/inactive
php artisan blocked-terms toggle hitler
```

Via the Supabase dashboard (if connected):
1. Go to **Table Editor** → `blocked_terms`
2. Add, edit, or toggle terms directly

### How Validation Works

1. User submits a name during registration
2. The `NameValidationService` normalizes the name (lowercase, remove accents, replace leet-speak)
3. The normalized name is checked against all active `blocked_terms`
4. If a match is found, registration is rejected with a clear error message
5. If no match, registration proceeds normally

Normalization includes:
- Lowercase conversion
- Whitespace trimming and collapsing
- Accent/diacritic removal (NFD normalization)
- Leet-speak substitution (1→i, 3→e, 4→a, 0→o, 5→s, 7→t)
- Non-alphanumeric character removal

## Project Structure

```
├── app/
│   ├── Console/Commands/           # Artisan commands (ManageBlockedTerms)
│   ├── Domain/
│   │   ├── Entities/               # FunctionalDependency, RelationSchema
│   │   └── Services/               # NormalizationEngine, DecompositionService,
│   │                                 AcademicService, GamificationService,
│   │                                 ClosureExplainerService
│   ├── Services/                   # NameValidationService, ValidationCacheService,
│   │                                 DidacticValidatorService, AcademicProgressService
│   ├── Http/
│   │   ├── Controllers/Api/        # AuthController, NormalizationController,
│   │   │                             AcademyController, AdminController,
│   │   │                             AnalyticsController, ReportController,
│   │   │                             ProgressController, DidacticValidatorController,
│   │   │                             SchemaController, PasswordResetController,
│   │   │                             HealthController
│   │   └── Middleware/             # AdminMiddleware, ApiRateLimiting,
│   │                                 DataProtectionMiddleware
│   └── Models/                     # User, Esquema, Validacion, BlockedTerm,
│                                     ParticipacionReto, Log, LogroUsuario,
│                                     DominioAprendizaje, RetoSemanal, IntentoPuzzle,
│                                     Puzzle
├── database/
│   ├── migrations/                 # Database migrations (+ Sanctum migrations)
│   └── seeders/                    # BlockedTermsSeeder
├── frontend/
│   └── src/
│       ├── components/             # React components (AcademyView, AuthModal,
│       │                             Sidebar, DashboardHome, LoadingSpinner, etc.)
│       ├── services/               # API client (axiosInstance)
│       └── types.ts                # TypeScript interfaces (ViewType, etc.)
├── config/                         # app, cache, logging, auth, sanctum, cors,
│                                     normalization, database
├── tests/
│   ├── Unit/Services/              # NameValidationServiceTest, NormalizationEngineTest
│   └── Feature/                    # AuthTest, SchemaValidationTest, CorsTest
├── supabase_schema.sql             # PostgreSQL schema for Supabase import
├── .env.example                    # Environment template
├── phpunit.xml.dist                # PHPUnit configuration
└── .github/workflows/ci.yml        # CI pipeline
```

## Key API Endpoints

### Authentication (Público)
- `POST /api/auth/register` - Register (with name validation + blocked terms)
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Authentication (Protegido)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Normalization Engine
- `POST /api/validate-schema` - Validate schema (1FN-BCNF)
- `POST /api/export-validation` - Export validation report
- `POST /api/explain/closure` - Step-by-step attribute closure
- `POST /api/explain/candidate-keys` - Discover candidate keys
- `POST /api/explain/decomposition` - Show decomposition steps

### Academy (Didactic Learning Path)
- `GET /api/academy` - Get academy overview
- `GET /api/academy/explain/{nf}` - Didactic explanation for a normal form
- `GET /api/academy/exercise` - Get practice exercise
- `POST /api/academy/evaluate` - Evaluate exercise answer
- `POST /api/academy/decompose` - Decompose schema to 3NF
- `POST /api/academy/validate-up-to` - Validate up to a target NF

### Didactic Validation
- `POST /api/didactic-validate` - Full didactic validation with analogies
- `POST /api/quick-analyze` - Quick analysis snapshot

### Reports
- `POST /api/report/generate` - Generate normalization report

### Progress & Analytics
- `GET /api/progress` - Get user progress
- `GET /api/progress/learning-path` - Get personalized learning path
- `GET /api/analytics/mastery/{userId}` - Get mastery levels
- `GET /api/analytics/history/{userId}` - Get validation history

### Schemas (Protegido)
- `GET /api/schemas` - List saved schemas
- `GET /api/schemas/{id}` - Get schema detail
- `DELETE /api/schemas/{id}` - Delete schema

### Admin (Protegido, role=administrador)
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/{id}/toggle` - Toggle user active status
- `GET /api/admin/blocked-terms` - List blocked terms
- `POST /api/admin/blocked-terms` - Add blocked term
- `DELETE /api/admin/blocked-terms/{id}` - Remove blocked term

### Health
- `GET /api/health` - Health check

## Testing

```bash
# Run all PHP tests (36 tests, 69+ assertions)
php vendor/bin/phpunit

# Run frontend type check
cd frontend && npx tsc --noEmit
```

## Troubleshooting

### Connection fails to Supabase
1. Verify credentials in `.env` (check Project Settings → API)
2. Ensure the database password is correct (reset in Project Settings → Database if needed)
3. Check that your IP is allowed: Supabase → Project Settings → Database → **Allow incoming connections**
4. Try connecting with `psql` to verify credentials:
   ```bash
   psql -h db.abcxyz.supabase.co -p 5432 -d postgres -U postgres
   ```

### Migration errors
1. If using Supabase, run the SQL from `supabase_schema.sql` manually in SQL Editor
2. If using local PostgreSQL, run `php artisan migrate --force`

### Validation not working
1. Ensure `blocked_terms` table has data: `php artisan blocked-terms list`
2. If empty, seed the table: `php artisan db:seed --class=BlockedTermsSeeder`
3. Check logs in `storage/logs/laravel.log`

## Prueba rápida

1. Iniciar el servidor backend:
   ```bash
   php artisan serve
   ```

2. Iniciar el frontend (en otra terminal):
   ```bash
   cd frontend && npm run dev
   ```

3. Abrir el navegador en `http://localhost:5173`
4. Hacer clic en **Iniciar Sesión** → **Regístrate aquí**
5. Intentar registrarse con un nombre válido (ej: "Juan Perez") → debería funcionar
6. Intentar registrarse con un nombre prohibido (ej: "admin", "test", "hitler") → el sistema debe bloquearlo
7. Intentar registrarse con un nombre vacío o solo espacios → el sistema debe mostrar error

## Modified / Created Files

| File | Action | Description |
|------|--------|-------------|
| `app/Domain/Services/NormalizationEngine.php` | **Modified** | Extended with 4FN/5FN detection (findMultivaluedDependencies, findJoinDependencies) |
| `app/Domain/Services/DecompositionService.php` | **Created** | Full decomposition to 3NF with SQL generation |
| `app/Domain/Services/AcademicService.php` | **Created** | Didactic explanations, exercises, answer evaluation for all 6 NFs |
| `app/Services/DidacticValidatorService.php` | **Created** | Complete validation with anomaly detection, analogies, priority recommendations |
| `app/Services/AcademicProgressService.php` | **Created** | User progress tracking, 8 achievements, learning path state machine |
| `app/Services/NameValidationService.php` | **Created** | Name normalization + blocked terms validation |
| `app/Http/Controllers/Api/AcademyController.php` | **Created** | 6 endpoints (index, explain, exercise, evaluate, decompose, validateUpTo) |
| `app/Http/Controllers/Api/DidacticValidatorController.php` | **Created** | didactic-validate, quick-analyze endpoints |
| `app/Http/Controllers/Api/ReportController.php` | **Created** | Report generation with full normalization output |
| `app/Http/Controllers/Api/ProgressController.php` | **Created** | User progress + learning path endpoints |
| `app/Http/Controllers/Api/AdminController.php` | **Created** | Admin dashboard, user CRUD, blocked-terms CRUD |
| `app/Http/Controllers/Api/PasswordResetController.php` | **Created** | Forgot/reset password with cache tokens |
| `app/Http/Controllers/Api/HealthController.php` | **Created** | Health check endpoint |
| `app/Http/Controllers/Api/SchemaController.php` | **Created** | User schema CRUD (index, show, destroy) |
| `app/Http/Controllers/Api/AuthController.php` | **Modified** | Added name validation, Sanctum token auth, me/updateProfile endpoints |
| `app/Http/Middleware/AdminMiddleware.php` | **Created** | Admin role check middleware |
| `app/Models/ParticipacionReto.php` | **Created** | Missing model referenced by User and RetoSemanal |
| `app/Models/BlockedTerm.php` | **Created** | Model for blocked_terms table |
| `config/normalization.php` | **Created** | Academy config (8 ranks, XP values, mastery thresholds) |
| `config/cache.php` | **Created** | Cache configuration |
| `config/logging.php` | **Created** | Logging configuration |
| `config/auth.php` | **Created** | Auth configuration (guards, providers) |
| `config/sanctum.php` | **Created** | Sanctum configuration |
| `config/cors.php` | **Created** | CORS with restricted origins/methods/headers |
| `routes/api.php` | **Modified** | 20+ endpoints organized by group, Sanctum + admin middleware |
| `bootstrap/app.php` | **Modified** | Registered AdminMiddleware, ApiRateLimiting |
| `supabase_schema.sql` | **Created** | PostgreSQL schema with admin-only RLS, 50 blocked terms |
| `database/seeders/BlockedTermsSeeder.php` | **Created** | 50 blocked terms in 8 categories |
| `tests/Unit/Services/NameValidationServiceTest.php` | **Created** | 14 name normalization tests |
| `tests/Unit/Services/NormalizationEngineTest.php` | **Created** | 11 engine tests (closure, keys, 1FN-5FN, edge cases) |
| `tests/Feature/AuthTest.php` | **Created** | 6 integration tests for auth flow |
| `tests/Feature/SchemaValidationTest.php` | **Created** | 3 schema validation tests |
| `tests/Feature/CorsTest.php` | **Created** | 2 CORS header tests |
| `tests/TestCase.php` | **Created** | Base test case with SQLite :memory: |
| `phpunit.xml.dist` | **Created** | PHPUnit configuration |
| `.github/workflows/ci.yml` | **Created** | CI pipeline (PHP lint+test, Node type-check+build) |
| `frontend/src/components/AcademyView.tsx` | **Created** | Learning path UI + explanation panel + practice |
| `frontend/src/components/AuthModal.tsx` | **Modified** | Two-level validation, axios instance, animations |
| `frontend/src/components/Sidebar.tsx` | **Modified** | Academia nav item, glow indicator |
| `frontend/src/components/LoadingSpinner.tsx` | **Created** | Animated loading spinner component |
| `frontend/src/index.css` | **Modified** | Animation suite, glassmorphism, skeleton loading, badges |
| `frontend/src/App.tsx` | **Modified** | AcademyView import + rendering on 'academy' view |
| `frontend/src/types.ts` | **Modified** | ViewType includes 'academy' |
| `.dockerignore` | **Created** | Docker build exclusions |
| `vercel.json` | **Created** | Vercel deployment config + CSP headers |
| `nginx/default.conf` | **Created** | Nginx config with CSP + gzip |

## Security

- **Sanctum token-based authentication** for all protected API routes
- **bcrypt password hashing** via Laravel's `Hash::make`
- **Content-Security-Policy** headers configured in nginx (`default-src 'self'`)
- **HSTS** enabled (`max-age=31536000; includeSubDomains`)
- **Name validation** against blocked terms during registration and profile updates
- **Input validation** on all endpoints via Laravel `validate()`

## License

This project is licensed under the MIT License.
