// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        transactions: {
            id: string,
            title: string,
            amount: number,
            created_at: string,
            session_id?: string
        },

        users: {
            id: string,
            name: string,
            email: string,
            session_id?: string
        }
    }
}