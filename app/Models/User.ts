import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, hasMany, HasMany, manyToMany, ManyToMany} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public firstname: string

  @column()
  public lastname: string

  @column()
  public username: string

  @column()
  public password: string

  @column.date()
  public dateOfBirth: DateTime
  
  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true, serialize: (value: DateTime) =>{
      return value.toFormat('yyyy-mm-dd HH:mm:ss')
    }
  })

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async passwordHashing(user: User){
    user.password = await Hash.make(user.password)
  }
}
