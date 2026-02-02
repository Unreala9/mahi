Auth.tsx:23
 POST https://puqfxuisuqtnpgxfsyhe.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
installHook.js:1 [AUTH] Login error: AuthApiError: Invalid login credentials
    at async handleAuth (Auth.tsx:23:27)
installHook.js:1 [AUTH] Auth error caught: AuthApiError: Invalid login credentials
    at async handleAuth (Auth.tsx:23:27)
installHook.js:1 [AUTH] Error message: Invalid login credentials
installHook.js:1 [AUTH] Error stack: AuthApiError: Invalid login credentials
    at handleError2 (http://localhost:8080/node_modules/.vite/deps/@supabase_supabase-js.js?v=e9756b93:7410:9)
    at async _handleRequest2 (http://localhost:8080/node_modules/.vite/deps/@supabase_supabase-js.js?v=e9756b93:7451:5)
    at async _request (http://localhost:8080/node_modules/.vite/deps/@supabase_supabase-js.js?v=e9756b93:7435:16)
    at async SupabaseAuthClient.signInWithPassword (http://localhost:8080/node_modules/.vite/deps/@supabase_supabase-js.js?v=e9756b93:9192:15)
    at async handleAuth (http://localhost:8080/src/pages/Auth.tsx?t=1770040715046:42:35)
overrideMethod	@	installHook.js:1
console.error	@	main.tsx:23
handleAuth	@	Auth.tsx:76
