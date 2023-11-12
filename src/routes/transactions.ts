import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from "../database"
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

// criando uma transação

export async function transactionsRoutes(app: FastifyInstance) {

    // Utilizando Zod para validar os daods enviados

    app.get('/', { preHandler: [checkSessionIdExists] }, async (req) => {
        const { sessionId } = req.cookies

        const transactions = await knex('transactions')
        // Garantindo que as transações listadas sejam apenas do usuário com o sessionID logado
        .where('session_id', sessionId)
        .select()

        return {
            transactions,
        }
    })

    // Coletando informações de uma transação única, utilizando o uuID.
    // Validando a existencia do uuid utilizando Zod
    // .first() para o valor não ser retornado como array

    app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req) => {
        const { sessionId } = req.cookies
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getTransactionParamsSchema.parse(req.params)

        const transaction = await knex('transactions').where({
            id,
            session_id: sessionId
        }).first()

        return { transaction }
    })

    app.get('/summary', { preHandler: [checkSessionIdExists] }, async (req) => {
        const { sessionId } = req.cookies
        const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', {
            as: 'amount'
        })
        .first()

        return { summary }
    })

    // Cookies -> Formas de manter contextos entre requisições

    app.post('/', async (req, res) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })
    
        const { title, amount, type } = createTransactionBodySchema.parse(req.body)

        // Criação cookie

        let sessionId = req.cookies.sessionId
        
        if (!sessionId) {
            sessionId = randomUUID()

            res.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            })
        }
        
        await knex('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amount: type == 'credit' ? amount : amount * -1,
            session_id: sessionId
        })

        return res.status(201).send()
    })
}