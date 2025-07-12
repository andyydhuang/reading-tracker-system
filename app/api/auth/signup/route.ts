// app/api/auth/signup/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('name') as string;

  const supabase = createClient(); // Instantiate the server-side client

  // 1. Sign up the user with Supabase Auth
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Store the name in user metadata
      },
      // Redirect after email confirmation (if enabled in Supabase settings)
      emailRedirectTo: `${requestUrl.origin}/auth/confirm`,
    },
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  // 2. If signup is successful, insert into profiles table
  const supabaseAdmin = createClient(); 
 
  if (user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: user.id,
          full_name: fullName,
          email: user.email,
          updated_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return NextResponse.json({ error: 'Account created, but profile could not be set up. Please contact support.' }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Signup successful! Please check your email for a confirmation link if required.' }, { status: 200 });
}