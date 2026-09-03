const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Users.tsx', 'utf8').replace(/\r\n/g, '\n');

// Replace Student DB Insert
const studentOld = `        const { data: newUser, error: createError } = await supabaseAdmin.from('profiles').insert([profileData]).select().single();

        if (createError) {
          throw new Error(createError.message || 'Failed to create student profile');
        }

        // Add to enrollments if course selected
        if (newStudent.course && newUser) {
          await supabaseAdmin.from('enrollments').insert([{
            student_id: newUser.id,
            course_id: newStudent.course,
            status: 'active'
          }]);
        }`.replace(/\r\n/g, '\n');

const studentNew = `        const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        const baseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        const profileRes = await fetch(\`\${baseUrl}/rest/v1/profiles\`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': \`Bearer \${serviceRoleKey}\`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(profileData)
        });

        if (!profileRes.ok) {
          const err = await profileRes.json().catch(()=>({}));
          throw new Error(err.message || err.details || 'Failed to create student profile');
        }
        const [newUser] = await profileRes.json();

        // Add to enrollments if course selected
        if (newStudent.course && newUser) {
          await fetch(\`\${baseUrl}/rest/v1/enrollments\`, {
            method: 'POST',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': \`Bearer \${serviceRoleKey}\`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              student_id: newUser.id,
              course_id: newStudent.course,
              status: 'active'
            })
          });
        }`;

// Replace Mentor DB Insert
const mentorOld = `        const { data: newUser, error: createError } = await supabaseAdmin.from('profiles').insert([profileData]).select().single();

        if (createError) {
          throw new Error(createError.message || 'Failed to create mentor profile');
        }

        // Assign courses if provided
        if (newMentor.assigned_courses && newMentor.assigned_courses.length > 0 && newUser) {
            for (const courseId of newMentor.assigned_courses) {
                await supabaseAdmin.from('courses').update({ mentor_id: newUser.id }).eq('id', courseId);
            }
        }`.replace(/\r\n/g, '\n');

const mentorNew = `        const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        const baseUrl = import.meta.env.VITE_SUPABASE_URL;

        const profileRes = await fetch(\`\${baseUrl}/rest/v1/profiles\`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': \`Bearer \${serviceRoleKey}\`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(profileData)
        });

        if (!profileRes.ok) {
          const err = await profileRes.json().catch(()=>({}));
          throw new Error(err.message || err.details || 'Failed to create mentor profile');
        }
        const [newUser] = await profileRes.json();

        // Assign courses if provided
        if (newMentor.assigned_courses && newMentor.assigned_courses.length > 0 && newUser) {
            for (const courseId of newMentor.assigned_courses) {
                await fetch(\`\${baseUrl}/rest/v1/courses?id=eq.\${courseId}\`, {
                  method: 'PATCH',
                  headers: {
                    'apikey': serviceRoleKey,
                    'Authorization': \`Bearer \${serviceRoleKey}\`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ mentor_id: newUser.id })
                });
            }
        }`;

if (!code.includes(studentOld)) {
  console.log('Failed to find studentOld!');
} else {
  code = code.replace(studentOld, studentNew);
  console.log('Patched Student');
}

if (!code.includes(mentorOld)) {
  console.log('Failed to find mentorOld!');
} else {
  code = code.replace(mentorOld, mentorNew);
  console.log('Patched Mentor');
}

fs.writeFileSync('src/pages/admin/Users.tsx', code, 'utf8');
