## 1. Redirección de la raíz según sesión

- [x] 1.1 Crear `front/src/components/auth/RootRedirect.tsx`: `loading` → `LoadingScreen`; con sesión → `Navigate /app`; sin sesión → `Navigate /playground`
- [x] 1.2 Usar `RootRedirect` en la ruta `/` de `main.tsx` y eliminar el import de `Navigate` (quedó sin uso)
- [x] 1.3 Verificar build (`tsc -b && vite build`) y lint sin errores
