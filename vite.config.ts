import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables so they are available in plugins
dotenv.config();

// Custom plugin to handle email sending API in dev mode
const emailPlugin = () => ({
  name: 'configure-server',
  configureServer(server: any) {
    server.middlewares.use('/api/send-email', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const { to, subject, text } = JSON.parse(body);
            
            const transporter = nodemailer.createTransport({
              host: process.env.MAIL_HOST || 'smtp.gmail.com',
              port: parseInt(process.env.MAIL_PORT || '587', 10),
              secure: process.env.MAIL_PORT === '465', // true for 465, false for other ports
              auth: {
                user: process.env.MAIL_USERNAME || process.env.VITE_EMAIL_USER || 'kowsalyarvijaya1998@gmail.com',
                pass: process.env.MAIL_PASSWORD || process.env.VITE_EMAIL_PASS || 'gtxdxqisgqvfzjsl', 
              },
            });

            await transporter.sendMail({
              from: process.env.MAIL_FROM_ADDRESS ? `"Boss Academy LMS" <${process.env.MAIL_FROM_ADDRESS}>` : '"Boss Academy LMS" <noreply@bossacademy.com>',
              to,
              subject,
              text,
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error('Email error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to send email' }));
          }
        });
      } else {
        next();
      }
    });
  },
});

const supabaseAdminPlugin = () => ({
  name: 'supabase-admin-server',
  configureServer(server: any) {
    server.middlewares.use('/api/generate-reset-link', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { email } = JSON.parse(body);
            
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceRoleKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env file.' }));
            }

            // Using fetch to bypass needing @supabase/supabase-js imported in vite config directly
            const response = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/admin/generate_link`, {
              method: 'POST',
              headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: 'recovery',
                email: email
              })
            });

            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.msg || err.message || 'Failed to generate link');
            }

            const data = await response.json();
            
            // The action_link contains the token
            const actionLink = data.action_link;
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, action_link: actionLink }));
          } catch (error: any) {
            console.error('Generate Link Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Failed to generate reset link' }));
          }
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/create-user', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { email, password, user_metadata, profileData } = JSON.parse(body);
            
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceRoleKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env file. Required for bypassing Supabase rate limits on signup.' }));
            }

            const response = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
              method: 'POST',
              headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email,
                password,
                email_confirm: true,
                user_metadata
              })
            });

            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.msg || err.message || 'Failed to create user');
            }

            const data = await response.json();
            const authUserId = data.user?.user?.id || data.user?.id || data.id;

            if (profileData && authUserId) {
              profileData.id = authUserId;
              const profileRes = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                  'apikey': serviceRoleKey,
                  'Authorization': `Bearer ${serviceRoleKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify(profileData)
              });
              
              if (!profileRes.ok) {
                const err = await profileRes.json().catch(()=>({}));
                // Cleanup orphaned auth user on profile failure
                await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${authUserId}`, {
                  method: 'DELETE',
                  headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` }
                });
                throw new Error(err.message || err.details || err.hint || 'Profile insert failed. Rolled back auth creation.');
              }
            }
            
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, user: data }));
          } catch (error: any) {
            console.error('Create User Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Failed to create user' }));
          }
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/delete-user', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { userId } = JSON.parse(body);
            if (!userId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing userId' }));
            }
            
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceRoleKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env file.' }));
            }

            const headers = {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            };

            // 1. Unassign Mentor from any courses
            await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/courses?mentor_id=eq.${userId}`, {
              method: 'PATCH',
              headers: headers,
              body: JSON.stringify({ mentor_id: null })
            });

            // 2. Delete Student enrollments
            await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/enrollments?student_id=eq.${userId}`, {
              method: 'DELETE',
              headers: headers
            });

            // 3. Delete Student lesson progress
            await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/lesson_progress?student_id=eq.${userId}`, {
              method: 'DELETE',
              headers: headers
            });

            // 4. Delete Student payments
            await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/payments?student_id=eq.${userId}`, {
              method: 'DELETE',
              headers: headers
            });

            // 4.5. Delete Student certificates
            await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/certificates?student_id=eq.${userId}`, {
              method: 'DELETE',
              headers: headers
            });

            // 5. Delete Profile
            const profileDel = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
              method: 'DELETE',
              headers: headers
            });
            if (!profileDel.ok) {
              const err = await profileDel.json().catch(() => ({}));
              console.warn('Profile deletion warning (might already be deleted or restricted):', err);
            }

            // 6. Delete Auth User
            const response = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
              method: 'DELETE',
              headers: headers
            });

            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw new Error(err.msg || err.message || 'Failed to delete user');
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error: any) {
            console.error('Delete User Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Failed to delete user' }));
          }
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/update-user', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { userId, profileData, assignedCourses, isMentor, isStudent, studentCourseId } = JSON.parse(body);
            if (!userId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing userId' }));
            }
            
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            const headers = {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            };
            const baseUrl = `${process.env.VITE_SUPABASE_URL}/rest/v1`;

            // 1. Update Profile
            if (profileData && Object.keys(profileData).length > 0) {
              const profileRes = await fetch(`${baseUrl}/profiles?id=eq.${userId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(profileData)
              });
              if (!profileRes.ok) {
                const err = await profileRes.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to update profile');
              }
            }

            // 2. Update Mentor Courses
            if (isMentor && assignedCourses) {
              // Clear old assignments
              await fetch(`${baseUrl}/courses?mentor_id=eq.${userId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ mentor_id: null })
              });
              // Set new ones
              if (assignedCourses.length > 0) {
                const courseIds = assignedCourses.join(',');
                await fetch(`${baseUrl}/courses?id=in.(${courseIds})`, {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify({ mentor_id: userId })
                });
              }
            }

            // 3. Update Student Enrollments
            if (isStudent && studentCourseId) {
              // Delete old enrollment
              await fetch(`${baseUrl}/enrollments?student_id=eq.${userId}`, {
                method: 'DELETE',
                headers
              });
              // Create new enrollment
              await fetch(`${baseUrl}/enrollments`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ student_id: userId, course_id: studentCourseId })
              });
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error: any) {
            console.error('Update User Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Failed to update user' }));
          }
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/get-users', async (req: any, res: any, next: any) => {
      if (req.method === 'GET') {
        try {
          const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (!serviceRoleKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Missing VITE_SUPABASE_SERVICE_ROLE_KEY' }));
          }

          // Fetch users using the Service Role Key to bypass RLS
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/profiles?role=in.(Mentor,Student)&order=created_at.desc`, {
            method: 'GET',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch profiles');
          }

          const profiles = await response.json();
          
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, profiles }));
        } catch (error: any) {
          console.error('Get Users Error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message || 'Failed to get users' }));
        }
      } else {
        next();
      }
    });

    server.middlewares.use('/api/get-all-courses', async (req: any, res: any, next: any) => {
      if (req.method === 'GET') {
        try {
          const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (!serviceRoleKey) return res.end(JSON.stringify({ error: 'Missing service key' }));
          
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/courses?order=created_at.desc`, {
            method: 'GET',
            headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' }
          });
          const courses = await response.json();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, courses }));
        } catch (error: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      } else {
        next();
      }
    });

    server.middlewares.use('/api/create-course', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { courseData } = JSON.parse(body);
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            
            const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/courses`, {
              method: 'POST',
              headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
              body: JSON.stringify(courseData)
            });
            
            if (!response.ok) throw new Error('Failed to insert course');
            const data = await response.json();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, course: data[0] }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/update-course', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { id, courseData } = JSON.parse(body);
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            
            const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/courses?id=eq.${id}`, {
              method: 'PATCH',
              headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(courseData)
            });
            
            if (!response.ok) throw new Error('Failed to update course');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/delete-course', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { id } = JSON.parse(body);
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            
            const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/courses?id=eq.${id}`, {
              method: 'DELETE',
              headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) throw new Error('Failed to delete course');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else {
        next();
      }
    });

    // Generic DB Proxy for bypassing RLS on other tables (Modules, Lessons, etc.)
    server.middlewares.use('/api/db-proxy', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { path, method, payload } = JSON.parse(body);
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            
            const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/${path}`, {
              method: method || 'GET',
              headers: { 
                'apikey': serviceRoleKey, 
                'Authorization': `Bearer ${serviceRoleKey}`, 
                'Content-Type': 'application/json',
                'Prefer': (method === 'POST' || method === 'PATCH') ? 'return=representation' : undefined
              },
              body: payload ? JSON.stringify(payload) : undefined
            });
            
            if (!response.ok) {
                const errText = await response.text();
                console.error("Proxy Error:", errText);
                throw new Error('Failed proxy request');
            }
            
            const text = await response.text();
            let data = null;
            if (text) {
                try { data = JSON.parse(text); } catch(e) { data = text; }
            }
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/dashboard-stats', (req: any, res: any, next: any) => {
      if (req.method === 'GET') {
        (async () => {
          try {
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            const headers = { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` };
            const baseUrl = `${process.env.VITE_SUPABASE_URL}/rest/v1`;

            // Helper to get count
            const getCount = async (path: string) => {
              const r = await fetch(`${baseUrl}/${path}`, { method: 'HEAD', headers: { ...headers, 'Prefer': 'count=exact' } });
              return parseInt(r.headers.get('content-range')?.split('/')[1] || '0', 10);
            };

            const [
              totalCourses, activeCourses, completedCourses,
              totalStudents, totalMentors,
              totalEnrollments, payments
            ] = await Promise.all([
              getCount('courses'),
              getCount('courses?status=eq.Published'),
              getCount('courses?status=eq.Archived'),
              getCount('profiles?role=eq.Student'),
              getCount('profiles?role=eq.Mentor'),
              getCount('enrollments'),
              fetch(`${baseUrl}/payments?select=amount,status`, { headers }).then(r => r.json())
            ]);

            let totalRevenue = 0;
            let pendingPayments = 0;
            if (Array.isArray(payments)) {
              payments.forEach(p => {
                if (p.status === 'successful') totalRevenue += p.amount;
                if (p.status === 'pending') pendingPayments++;
              });
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              totalCourses, activeCourses, completedCourses,
              totalStudents, totalMentors,
              totalEnrollments, totalRevenue, pendingPayments
            }));
          } catch (error: any) {
            console.error('Dashboard Stats Proxy Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message || error.toString() }));
          }
        })();
      } else {
        next();
      }
    });

    server.middlewares.use('/api/recent-activity', (req: any, res: any, next: any) => {
      if (req.method === 'GET') {
        (async () => {
          try {
            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            const headers = { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` };
            const baseUrl = `${process.env.VITE_SUPABASE_URL}/rest/v1`;

            const [usersRes, enrollmentsRes, paymentsRes] = await Promise.all([
              fetch(`${baseUrl}/profiles?select=id,name,role,created_at&order=created_at.desc&limit=5`, { headers }),
              fetch(`${baseUrl}/enrollments?select=id,enrolled_at,student_id,course_id,status&order=enrolled_at.desc&limit=5`, { headers }),
              fetch(`${baseUrl}/payments?select=id,amount,status,created_at,student_id,course_id&order=created_at.desc&limit=5`, { headers })
            ]);

            const [users, enrollments, payments] = await Promise.all([
              usersRes.ok ? usersRes.json() : [],
              enrollmentsRes.ok ? enrollmentsRes.json() : [],
              paymentsRes.ok ? paymentsRes.json() : []
            ]);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ users, enrollments, payments }));
          } catch (error: any) {
            console.error('Recent Activity Proxy Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message || error.toString() }));
          }
        })();
      } else {
        next();
      }
    });

  }
});

// Custom plugin to handle Razorpay API in dev mode
const paymentPlugin = () => ({
  name: 'payment-server',
  configureServer(server: any) {
    server.middlewares.use('/api/create-order', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { amount, currency } = JSON.parse(body);
            
            const key_id = process.env.VITE_RAZORPAY_KEY_ID || 'dummy';
            const key_secret = process.env.VITE_RAZORPAY_KEY_SECRET || 'dummy';

            if (key_id === 'YOUR_RAZORPAY_TEST_KEY_ID' || key_secret === 'YOUR_RAZORPAY_TEST_KEY_SECRET' || key_id === 'dummy') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Please enter actual Razorpay test keys in your .env file instead of placeholders.' }));
            }

            const razorpay = new Razorpay({ key_id, key_secret });

            const order = await razorpay.orders.create({
              amount: amount * 100, // amount in smallest currency unit (paise)
              currency: currency || 'INR',
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(order));
          } catch (error: any) {
            console.error('Create Order Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Failed to create order' }));
          }
        });
      } else {
        next();
      }
    });
    server.middlewares.use('/api/complete-student-registration', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { paymentInfo, studentInfo } = JSON.parse(body);

            // 1. Verify Payment
            const secret = process.env.VITE_RAZORPAY_KEY_SECRET || 'dummy';
            const generated_signature = crypto
              .createHmac('sha256', secret)
              .update(paymentInfo.razorpay_order_id + "|" + paymentInfo.razorpay_payment_id)
              .digest('hex');

            if (generated_signature !== paymentInfo.razorpay_signature) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Invalid payment signature' }));
            }

            const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceRoleKey) throw new Error("Missing Service Role Key");
            
            const baseUrl = `${process.env.VITE_SUPABASE_URL}`;
            const headers = {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            };

            // 2. Create Auth User
            const authRes = await fetch(`${baseUrl}/auth/v1/admin/users`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                email: studentInfo.email,
                password: studentInfo.password,
                email_confirm: true
              })
            });
            const authData = await authRes.json();
            if (!authRes.ok) throw new Error(authData.msg || authData.message || 'Failed to create auth user');
            const userId = authData.id;

            // 3. Create Profile (with status 'active')
            const profileData = {
              id: userId,
              name: studentInfo.name,
              email: studentInfo.email,
              username: studentInfo.email,
              phone: studentInfo.phone,
              role: 'Student',
              status: 'active'
            };
            const profRes = await fetch(`${baseUrl}/rest/v1/profiles`, {
              method: 'POST', headers, body: JSON.stringify(profileData)
            });
            if (!profRes.ok) throw new Error('Failed to create profile');

            // 4. Record Payment
            const paymentId = crypto.randomUUID();
            const paymentRecord = {
              id: paymentId,
              student_id: userId,
              course_id: studentInfo.courseId,
              order_id: paymentInfo.razorpay_order_id,
              payment_id: paymentInfo.razorpay_payment_id,
              signature: paymentInfo.razorpay_signature,
              amount: paymentInfo.amount,
              currency: paymentInfo.currency,
              status: 'successful'
            };
            await fetch(`${baseUrl}/rest/v1/payments`, {
              method: 'POST', headers, body: JSON.stringify(paymentRecord)
            });

            // 5. Create Enrollment
            await fetch(`${baseUrl}/rest/v1/enrollments`, {
              method: 'POST', headers, body: JSON.stringify({
                student_id: userId,
                course_id: studentInfo.courseId,
                payment_id: paymentId,
                status: 'active'
              })
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, userId }));
          } catch (error: any) {
            console.error('Registration/Payment Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Registration failed' }));
          }
        });
      } else {
        next();
      }
    });
    server.middlewares.use('/api/verify-payment', (req: any, res: any, next: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(body);
            
            const secret = process.env.VITE_RAZORPAY_KEY_SECRET || 'dummy';
            const generated_signature = crypto
              .createHmac('sha256', secret)
              .update(razorpay_order_id + "|" + razorpay_payment_id)
              .digest('hex');

            if (generated_signature === razorpay_signature) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } else {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid signature' }));
            }
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Verification failed' }));
          }
        });
      } else {
        next();
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), emailPlugin(), supabaseAdminPlugin(), paymentPlugin()],
  optimizeDeps: {
    exclude: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
