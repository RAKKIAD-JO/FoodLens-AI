import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import apiRouter from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';

const app = express();

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads as public static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Swagger Documentation Mock (JSON description)
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FoodLens AI API',
    version: '1.0.0',
    description: 'API Documentation for FoodLens AI calorie and nutrition tracking application',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server',
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  name: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['email', 'name', 'password'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Success' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        responses: {
          200: { description: 'Success' },
        },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routing
app.use('/api', apiRouter);

// Base route health check
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'FoodLens AI API is running.',
    docs: '/api-docs',
  });
});

// Error handling middleware
app.use(errorMiddleware as any);

export default app;
