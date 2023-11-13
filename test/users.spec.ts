/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('User Routes', async () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })

    // test create user

    test('create user', async () => {
        await request(app.server)
            .post('/users')
            .send({
                name: 'Name',
                email: 'email@email.com'
            })
            .expect(201)
    })
})