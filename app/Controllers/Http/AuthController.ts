import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
    public async login({ auth, request, response }: HttpContextContract){
        const { username, password } = request.only(['username', 'password'])

        const token = await auth.attempt(username, password, {
            expiresIn: '3Days'
        })

        if(token){
            return response.status(200).send({result: 'success', data: {username: username, token: token}});
        }else{
            return response.status(403).send({
                result: 'error',
                msg: 'forbidden'
            })
        }
    }

    public async me({ auth, response }: HttpContextContract){
        return response.status(200).send({data: {user: auth.user} })
    }

    public async logout({ auth, response }: HttpContextContract){
        await auth.use('api').revoke()
        return response.status(200).send({message: 'logout success.'})
    }
}
