import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import nodemailer from 'nodemailer'

const emailPlugin = () => {
  return {
    name: 'email-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/send-email' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const env = loadEnv(server.config.mode, process.cwd(), '');
              
              const isGmail = env.MAIL_HOST?.includes('gmail');
              
              const transporter = nodemailer.createTransport(isGmail ? {
                service: 'gmail',
                auth: {
                  user: env.MAIL_USERNAME,
                  pass: env.MAIL_PASSWORD,
                },
              } : {
                host: env.MAIL_HOST,
                port: parseInt(env.MAIL_PORT || '587'),
                secure: false,
                auth: {
                  user: env.MAIL_USERNAME,
                  pass: env.MAIL_PASSWORD,
                },
              });

              await transporter.sendMail({
                from: `"${env.MAIL_FROM_NAME || 'LMS'}" <${env.MAIL_FROM_ADDRESS}>`,
                to: data.to,
                subject: data.subject,
                text: data.text,
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (error: any) {
              console.error('SMTP Error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: error.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    emailPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
