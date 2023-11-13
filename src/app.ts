import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'

export const app = fastify()

app.register(cookie)
app.register(usersRoutes)
app.register(transactionsRoutes)