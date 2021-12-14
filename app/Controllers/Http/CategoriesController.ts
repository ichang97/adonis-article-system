import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Category from 'App/Models/Category'

export default class CategoriesController {
  public async index({}: HttpContextContract) {
    const category = Category.all()
    return category
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        name: schema.string({}, [
          rules.unique({
            table: 'categories',
            column: 'name'
          })
        ])
      })
    })

    try{
      const category = await Category.create(payload)
      return response.status(200).send({result: 'success', data: category})
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try{
      const category = await Category.find(params.id)

      if(category){
        return response.status(200).send({result: 'success', data: category})
      }else{
        return response.status(404).send({result: 'error', message: 'not found.'})
      }
      
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, params, response }: HttpContextContract) {
    const payload = await request.only(['name'])

    try{
      const {id: categoryId} = params
      const category = await Category.find(categoryId)

      if(category){
        await category?.merge(payload).save()
        return response.status(200).send({result: 'success', data: category})
      }else{
        return response.status(404).send({result: 'error', message: 'not found.'})
      }
      
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const {id: categoryId} = params

    try{
      const category = await Category.find(categoryId)
      await category?.delete()

      if(category){
        return response.status(200).send({result: 'success', deleted_data: category})
      }else{
        return response.status(404).send({result: 'error', message: 'not found.'})
      }
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }
}
