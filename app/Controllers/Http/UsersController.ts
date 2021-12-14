import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class UsersController {
  public async index({}: HttpContextContract) {
    const users = await User.all()
    return users
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    const userSchema = schema.create({
      firstname: schema.string(),
      lastname: schema.string(),
      username: schema.string({}, [
        rules.unique({
          table: 'users',
          column: 'username'
        })
      ]),
      password: schema.string({}, [
        rules.confirmed()
      ]),
      date_of_birth: schema.date({
        format: 'yyyy-MM-dd'
      })
    })

    const payload = await request.validate({
      schema: userSchema,
      messages: {
        'required' : '{{ field }} is required.',
        'unique': 'Username is duplicate, try again.'
      }
    })


    try{
      const user = await User.create(payload)
      return response.status(200).send({result: 'success', data: user})
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
