const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/admin/Users.tsx', 'utf8');

  // 1. Add isSavingStudent
  if (!content.includes('const [isSavingStudent')) {
    content = content.replace(
      /const \[isSavingMentor, setIsSavingMentor\] = useState\(false\);/,
      `const [isSavingMentor, setIsSavingMentor] = useState(false);\n  const [isSavingStudent, setIsSavingStudent] = useState(false);`
    );
  }

  // 2. Replace handleAddStudent
  const handleAddStudentRegex = /const handleAddStudent = async \(e: React\.FormEvent\) => \{[\s\S]*?\};(\s*const handleAddMentor =)/;

  const newHandleAddStudent = `const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingStudent) return;
    
    // Validate required fields
    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      showNotification('Name and Email are required.', 'error');
      return;
    }

    setIsSavingStudent(true);
    
    if (!IS_MOCK_SUPABASE) {
      try {
        // 1. Create Auth User via REST first to get an ID
        const userId = await createAuthUser(newStudent.email.trim(), newStudent.password);

        // 2. Insert into Profiles with the new ID
        const profileData = {
          id: userId,
          name: newStudent.name.trim(),
          username: newStudent.email.trim(),
          email: newStudent.email.trim(),
          phone: newStudent.phone || null,
          course: newStudent.course || null,
          role: 'Student',
          status: newStudent.status
        };

        const { data: newUser, error: createError } = await supabaseAdmin.from('profiles').insert([profileData]).select().single();

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
        }

        showNotification('Student created successfully!', 'success');
        
        await fetchData();
        setIsAddModalOpen(false);
        setNewStudent({ name: '', email: '', phone: '', course: '', password: '', status: 'active' });
      } catch (err: any) {
        showNotification(err.message || 'Failed to insert data into Supabase.', 'error');
      } finally {
        setIsSavingStudent(false);
      }
    } else {
      // Mock logic
      const token = crypto.randomUUID();
      const newProfile = {
        id: crypto.randomUUID(), 
        name: newStudent.name,
        username: newStudent.email,
        email: newStudent.email,
        phone: newStudent.phone || undefined,
        password: null,
        reset_token: token,
        course: newStudent.course,
        assigned_courses: newStudent.course ? [newStudent.course] : [],
        role: 'Student' as any,
        status: newStudent.status,
        payment_status: 'verified' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const currentUsers = getMockUsers();
      const updated = [newProfile, ...currentUsers];
      setMockUsers(updated);
      setUsers(updated);
      
      if (newProfile.assigned_courses?.length) {
        syncStudentEnrollments(newProfile.id, newProfile.assigned_courses);
      }
      
      setIsAddModalOpen(false);
      setNewStudent({ name: '', email: '', phone: '', course: '', password: '', status: 'active' });
      await sendRegistrationEmail(newProfile);
      setIsSavingStudent(false);
    }
  };$1`;

  content = content.replace(handleAddStudentRegex, newHandleAddStudent);

  // 3. Replace handleAddMentor
  const handleAddMentorRegex = /const handleAddMentor = async \(e: React\.FormEvent\) => \{[\s\S]*?\};(\s*const handleDeleteUser =)/;

  const newHandleAddMentor = `const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingMentor) return;
    
    // Validate required fields
    if (!newMentor.name.trim() || !newMentor.email.trim() || !newMentor.major_course?.trim()) {
      showNotification('Name, Email, and Major Course are required.', 'error');
      return;
    }

    setIsSavingMentor(true);
    
    if (!IS_MOCK_SUPABASE) {
      try {
        const email = newMentor.email.trim();
        if (!email) throw new Error("Email is required");

        // 1. Create Auth User via REST first to get an ID
        const userId = await createAuthUser(email, newMentor.password);

        // 2. Insert into Profiles with the new ID
        const profileData = {
          id: userId,
          name: newMentor.name.trim(),
          username: email,
          email: email,
          phone: newMentor.phone || null,
          role: 'Mentor',
          status: newMentor.status,
          employee_id: newMentor.employee_id || null,
          major_course: newMentor.major_course.trim()
        };

        const { data: newUser, error: createError } = await supabaseAdmin.from('profiles').insert([profileData]).select().single();

        if (createError) {
          throw new Error(createError.message || 'Failed to create mentor profile');
        }

        // Assign courses if provided
        if (newMentor.assigned_courses && newMentor.assigned_courses.length > 0 && newUser) {
            for (const courseId of newMentor.assigned_courses) {
                await supabaseAdmin.from('courses').update({ mentor_id: newUser.id }).eq('id', courseId);
            }
        }

        showNotification('Mentor created successfully!', 'success');
        
        await fetchData();
        setIsAddMentorModalOpen(false);
        setNewMentor({ name: '', employee_id: '', email: '', phone: '', major_course: '', password: '', assigned_courses: [], status: 'active' });
      } catch (err: any) {
        showNotification(err.message || 'Failed to insert data into Supabase.', 'error');
      } finally {
        setIsSavingMentor(false);
      }
    } else {
      // Mock logic
      const token = crypto.randomUUID();
      const newProfile = {
        id: crypto.randomUUID(),
        name: newMentor.name,
        username: newMentor.email || \`\${newMentor.employee_id.toLowerCase()}@bossacademy.com\`,
        employee_id: newMentor.employee_id,
        email: newMentor.email || \`\${newMentor.employee_id.toLowerCase()}@bossacademy.com\`,
        phone: newMentor.phone || undefined,
        password: null, 
        reset_token: token,
        major_course: newMentor.major_course,
        assigned_courses: newMentor.assigned_courses,
        role: 'Mentor' as any,
        status: newMentor.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const currentUsers = getMockUsers();
      const updated = [newProfile, ...currentUsers];
      setMockUsers(updated);
      setUsers(updated);
      
      setIsAddMentorModalOpen(false);
      setNewMentor({ name: '', employee_id: '', email: '', phone: '', major_course: '', password: '', assigned_courses: [], status: 'active' });
      await sendRegistrationEmail(newProfile);
      setIsSavingMentor(false);
    }
  };$1`;

  content = content.replace(handleAddMentorRegex, newHandleAddMentor);

  // 4. Update the buttons to show loading state
  // Student button
  content = content.replace(
    /onClick=\{handleAddStudent\}\s*className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"/,
    `disabled={isSavingStudent}
                  onClick={handleAddStudent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"`
  );
  content = content.replace(
    /onClick=\{handleAddStudent\}\s*className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"\s*>\s*Add Student/,
    `disabled={isSavingStudent}
                  onClick={handleAddStudent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingStudent ? 'Saving...' : 'Add Student'}`
  );

  // Mentor button
  content = content.replace(
    /onClick=\{handleAddMentor\}\s*className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"/,
    `disabled={isSavingMentor}
                  onClick={handleAddMentor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"`
  );
  content = content.replace(
    /onClick=\{handleAddMentor\}\s*className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"\s*>\s*Add Mentor/,
    `disabled={isSavingMentor}
                  onClick={handleAddMentor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingMentor ? 'Saving...' : 'Add Mentor'}`
  );

  fs.writeFileSync('src/pages/admin/Users.tsx', content);
  console.log("Successfully patched Users.tsx");
} catch (e) {
  console.error(e);
}
