import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ArticleCategories extends BaseSchema {
  protected tableName = 'article_categories'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('article_id').unsigned().references('id').inTable('articles')
      table.integer('category_id').unsigned().references('id').inTable('categories')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
