import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class AuthController {
    public async login({ auth, request, response }: HttpContextContract){
        const { username, password } = request.only(['username', 'password'])

        const token = await auth.attempt(username, password, {
            expiresIn: '3Days'
        })

        if(token){
            const userData = {
                username: username,
                token: token
            }

            //store user data into redis
            await Redis.set('USERS_DATA', JSON.stringify(userData))
            console.log(await Redis.get('USERS_DATA'))

            return response.status(200).send({result: 'success', data: userData});
        }else{
            return response.status(403).send({
                result: 'error',
                msg: 'forbidden'
            })
        }
    }

    public async me({ response }: HttpContextContract){
        const redisData = await Redis.get('USERS_DATA')

        if(redisData){
            const userData = JSON.parse(redisData)
            console.log(redisData)
            return response.status(200).send({data: {user: userData}})
        }else{
            return response.status(404).send({result: 'error', message: 'no user data in redis.'})
        }
    }

    public async logout({ auth, response }: HttpContextContract){
        await auth.use('api').revoke()
        return response.status(200).send({message: 'logout success.'})
    }
}
