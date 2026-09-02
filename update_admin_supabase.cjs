const fs = require('fs');
const files = [
  'd:\\Boss lms\\src\\pages\\admin\\Users.tsx', 
  'd:\\Boss lms\\src\\pages\\admin\\Courses.tsx', 
  'd:\\Boss lms\\src\\pages\\admin\\Certificates.tsx', 
  'd:\\Boss lms\\src\\pages\\admin\\Dashboard.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ IS_MOCK_SUPABASE, supabase \} from '..\/..\/lib\/supabase';/g, "import { IS_MOCK_SUPABASE, supabase, supabaseAdmin } from '../../lib/supabase';");
  content = content.replace(/import \{ supabase, IS_MOCK_SUPABASE \} from '..\/..\/lib\/supabase';/g, "import { supabase, IS_MOCK_SUPABASE, supabaseAdmin } from '../../lib/supabase';");
  content = content.replace(/import \{ supabase \} from '..\/..\/lib\/supabase';/g, "import { supabase, supabaseAdmin } from '../../lib/supabase';");
  
  content = content.replace(/supabase\.from/g, 'supabaseAdmin.from');
  content = content.replace(/supabase\.auth\.resetPasswordForEmail/g, 'supabaseAdmin.auth.resetPasswordForEmail');
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
