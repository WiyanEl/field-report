import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.route'
import reportRoutes from './routes/report.route'
import userRoutes from './routes/user.route'

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Field Report API is running",
  });
});

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reports', reportRoutes)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

export default app