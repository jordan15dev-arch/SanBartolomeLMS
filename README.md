# San Bartolome High School LMS

## Authentication setup

1. Install dependencies with `npm install` and copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service-role key to client code.
3. Apply `supabase/migrations/20261116000000_auth_profiles.sql` to the Supabase project.
4. In Supabase Authentication, enable Google and configure the Google OAuth credentials. Add `/auth/callback` to the allowed redirect URLs.
5. To use the 6-digit recovery screen, configure the Supabase password recovery email template to include `{{ .Token }}`. The standard recovery link template does not deliver an OTP.
6. Run `npm run dev`.

The login API resolves LRN/Faculty ID values on the server using the service role, then authenticates with Supabase Auth. Profiles are readable only by their owner. Google sign-ups are provisioned by the auth trigger; the callback applies the selected role only to profiles marked as awaiting first-time OAuth setup.