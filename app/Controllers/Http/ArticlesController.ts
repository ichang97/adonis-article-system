import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from 'App/Models/Article'
import ArticleCategory from 'App/Models/ArticleCategory'
import { schema } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class ArticlesController {
  public async index({ response }: HttpContextContract) {
    try{
      const articles = await Article.all()

      //store articles into redis
      await Redis.set('ARTICLES', JSON.stringify(articles))
      const articleRedis = await Redis.get('ARTICLES')
      console.log(articleRedis)

      return response.status(200).send({result: 'success', data: articleRedis})
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    try{
      const file = await request.file('cover_image', {
        size: '2mb',
        extnames: ['jpg', 'png', 'gif']
      })

      const payload = await request.validate({
        schema: schema.create({
          title: schema.string(),
          content: schema.string(),
          owner_id: schema.number()
        })
      })

      const article = await Article.create(payload)

      // file upload
      if(file){
        await file.moveToDisk('adonis-articles/images', {
          visibility: 'private'
        }, 's3')

        const updateFileArticle = await Article.find(article.id)

        if(updateFileArticle){
          updateFileArticle.cover_image = `${file?.fileName}`
          await updateFileArticle.save()
        }
      }

      const category = new ArticleCategory()
      category.article_id = article.id
      category.category_id = request.input('category_id')

      await category.save()
      
      return response.status(200).send({result: 'success', data: article})

      }catch(e){
        return response.status(500).send({result: 'error', message: e})
      }

  }

  public async show({ params, response }: HttpContextContract) {
    const { id: articleId } = params

    try{
      const article = await Article.find(articleId)

      if(article){
        return response.status(200).send({result: 'success', data: article})
      }else{
        return response.status(404).send({result: 'error', message: 'article not found.'})
      }
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, params, response }: HttpContextContract) {
    const { id: articleId } = params

    try{
      const article = await Article.find(articleId)

      if(article){
        const payload = await request.validate({
          schema: schema.create({
            title: schema.string(),
            content: schema.string()
          })
        })

        await article?.merge(payload).save()

        const file = await request.file('cover_image', {
          size: '2mb',
          extnames: ['jpg', 'png', 'gif']
        })

        if(file){
          //delete old file
          await Drive.use('s3').delete(article.cover_image)

          await file.moveToDisk('adonis-articles/images', {
            visibility: 'private'
          }, 's3')
  
          article.cover_image = `${file?.fileName}`
          await article.save()
        }

        return response.status(200).send({result: 'success', data: article})
      }else{
        return response.status(404).send({result: 'error', message: 'article not found.'})
      }
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try{
      const { id: articleId } = params
      
      const article = await Article.find(articleId)

      if(article){
        //delete cover before delete article
        if(article.cover_image){
          await Drive.use('s3').delete(article.cover_image)
        }

        const category = await ArticleCategory.findBy('article_id', article.id)
        category?.delete()

        article.delete()

        return response.status(200).send({result: 'success', deleted_data: article})
      }else{
        return response.status(404).send({result: 'error', message: 'article not found.'})
      }
    }catch(e){
      return response.status(500).send({result: 'error', message: e})
    }
  }
}
