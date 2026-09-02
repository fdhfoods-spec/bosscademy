const fs = require('fs');
const files = [
  'd:\\Boss lms\\src\\pages\\admin\\Users.tsx', 
  'd:\\Boss lms\\src\\pages\\admin\\Courses.tsx', 
  'd:\\Boss lms\\src\\pages\\admin\\Certificates.tsx', 
  'd:\\Boss lms\\src\\pages\\admin\\Dashboard.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ IS_MOCK_SUPABASE, supabase, supabaseAdmin \}/g, "import { IS_MOCK_SUPABASE, supabaseAdmin }");
  content = content.replace(/import \{ supabase, IS_MOCK_SUPABASE, supabaseAdmin \}/g, "import { IS_MOCK_SUPABASE, supabaseAdmin }");
  content = content.replace(/import \{ supabase, supabaseAdmin \}/g, "import { supabaseAdmin }");
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
});
