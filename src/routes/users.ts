import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { knex } from "../database"
import crypto from 'node:crypto'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"


export async function usersRoutes(app: FastifyInstance) {

    // Create User

    app.post('/users', async (req, res) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string()
        })

        const { name, email } = createUserBodySchema.parse(req.body)

        let sessionId = req.cookies.sessionId
    
        if (!sessionId) {
            sessionId = crypto.randomUUID()

            res.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('users').insert({
            id: crypto.randomUUID(),
            name,
            email,
            session_id: sessionId
        })

        return res.status(201).send()
    })

    // List Users

    app.get('/users', { preHandler: [checkSessionIdExists] }, async (req) => {
        const { sessionId } = req.cookies

        const users = await knex('users').where('session_id', sessionId).select()

        return { users }
    })

    // List especific user

    app.get('/users/:id', { preHandler: [checkSessionIdExists] }, async (req) => {
        const { sessionId } = req.cookies

        const userParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = userParamsSchema.parse(req.params)

        const user = await knex('users').where({
            id,
            session_id: sessionId
        }).first()

        return { user }
    })

}