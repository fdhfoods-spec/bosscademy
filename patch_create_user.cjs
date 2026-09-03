const fs = require('fs');

try {
  const filepath = 'src/pages/admin/Users.tsx';
  let content = fs.readFileSync(filepath, 'utf8');
  
  const searchString = `const createAuthUser = async (email: string, password?: string) => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!serviceRoleKey || !baseUrl) {
    throw new Error("Missing Supabase credentials in environment variables.");
  }

  const authRes = await fetch(\`\${baseUrl}/auth/v1/admin/users\`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': \`Bearer \${serviceRoleKey}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: password || \`\${email.split('@')[0]}@1001\`,
      email_confirm: true
    })
  });

  const authData = await authRes.json();
  if (!authRes.ok) {
    throw new Error(authData.msg || authData.message || 'Failed to create auth user');
  }

  return authData.id;
};`;

  const newFunc = `const createAuthUser = async (email: string, password?: string) => {
  const authRes = await fetch('/api/create-auth-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });

  const authData = await authRes.json();
  if (!authRes.ok) {
    throw new Error(authData.error || authData.message || 'Failed to create auth user');
  }

  return authData.id;
};`;

  // We replace strictly this exact block of code
  if (content.includes('import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY')) {
    content = content.replace(searchString, newFunc);
    fs.writeFileSync(filepath, content);
    console.log("Patched", filepath);
  } else {
    console.log("Could not find string in", filepath);
  }
} catch (e) {
  console.error(e);
}
