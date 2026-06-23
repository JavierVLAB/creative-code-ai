# Spec: auth-flow

Define cómo funciona la autenticación en CurateArtAI: clientes Supabase, pantallas, protección de rutas y flujo completo.

CurateArtAI es una SPA (Vite + React), no Next.js. No hay middleware de servidor ni Server Components.
La protección de rutas ocurre en el cliente con condicionales React + RLS como última capa en la BD.

---

## Clientes Supabase

Hay dos clientes, uno por contexto:

### `createBrowserSupabase()` — frontend
```typescript
// front/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export function createBrowserSupabase() {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  )
}

// Instancia singleton para usar en hooks y componentes
export const supabase = createBrowserSupabase()
```

- Usa la **publishable key** (pública, va al navegador)
- Gestiona sesión en localStorage automáticamente
- Respeta RLS — un usuario solo accede a sus filas

### `createAdminSupabase()` — backend
```typescript
// backend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  )
}
```

- Usa la **secret key** (privada, solo en el backend)
- Bypassa RLS — para operaciones del sistema (crear perfiles, verificar tokens)
- Nunca llega al navegador

---

## Variables de entorno

```
# front/.env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# backend/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

---

## Pantallas y flujo

### Estados de sesión

```
Sin sesión                    Con sesión
─────────────────             ─────────────────────────────
/login  → LoginPage           /app   → workspace principal
/signup → SignupPage          /app/* → protegido
```

### Flujo de registro

```
SignupPage
  → email + contraseña
  → supabase.auth.signUp()
  → Supabase crea usuario en auth.users
  → trigger handle_new_user() crea fila en profiles
  → redirige a /app
```

### Flujo de login

```
LoginPage
  → email + contraseña
  → supabase.auth.signInWithPassword()
  → sesión guardada en localStorage
  → redirige a /app
```

### Flujo de logout

```
cualquier pantalla
  → botón logout
  → supabase.auth.signOut()
  → sesión eliminada
  → redirige a /login
```

---

## Protección de rutas en SPA

Sin middleware de servidor, la protección ocurre en el componente raíz.

### Hook `useSession`

```typescript
// front/src/hooks/useSession.ts
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}
```

### Componente `ProtectedRoute`

```typescript
// front/src/components/auth/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useSession()

  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

### Uso en el router

```typescript
<Routes>
  <Route path="/login"  element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/app/*"  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  } />
  <Route path="/" element={<Navigate to="/app" replace />} />
</Routes>
```

---

## Capas de seguridad

```
Layer 1 — React Router
  ProtectedRoute redirige a /login si no hay sesión

Layer 2 — Supabase RLS
  Un usuario solo accede a sus filas (user_id = auth.uid())
  Aunque se burle el cliente, la BD bloquea el acceso

Layer 3 — Backend Mastra
  @mastra/auth-supabase verifica el token Bearer en cada request
  Requests sin token válido devuelven 401
```

---

## Trigger en base de datos

Al registrarse, Supabase crea el usuario en `auth.users`. Un trigger crea automáticamente su perfil:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

El perfil se crea vacío — el usuario puede completarlo después.

---

## Non-goals (MVP)

- Sin SSO (Google, GitHub, Apple)
- Sin verificación de email (confirmación automática)
- Sin recuperación de contraseña (se añade en una fase posterior)
- Sin roles (todos los usuarios tienen el mismo acceso a sus datos)
- Sin invitaciones por email
