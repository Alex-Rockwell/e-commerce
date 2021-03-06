const fs = require('fs')
const crypto = require('crypto')
const util = require('util')

const scrypt = util.promisify(crypto.scrypt)

class UsersRepository {
  constructor(filename) {
    if (!filename) {
      throw new Error('creating a repository require a filename')
    }

    this.filename = filename
    try {
      fs.accessSync(this.filename)
    } catch (err) {
      fs.writeFileSync(this.filename, '[]')
    }
  }

  async getAll() {
    return JSON.parse(await fs.promises.readFile(this.filename, 'utf-8'))
  }

  async create(attrs) {
    const records = await this.getAll()
    attrs.id = this.randomId()

    const salt = crypto.randomBytes(8).toString('hex')
    const buf = await scrypt(attrs.password, salt, 64)

    const record = {
      ...attrs,
      password: `${buf.toString('hex')}.${salt}`
    }
    records.push(record)

    await this.writeAll(records)

    return record
  }

  async comparePasswords(saved, supplied) {
    // saved -> password saved in database 'hashedpassword.salt'
    // supplied -> given by user, trying sign in
    const [hashed, salt] = saved.split('.')
    const hashedSupplied = await scrypt(supplied, salt, 64)

    return hashed === hashedSupplied.toString('hex')
  }

  async writeAll(records) {
    await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2))
  }

  randomId() {
    return crypto.randomBytes(4).toString('hex')
  }

  async getOne(id) {
    const records = await this.getAll()
    return records.find(record => record.id === id)
  }

  async delete(id) {
    const records = await this.getAll()
    const filteredRecords = records.filter(record => record.id !== id)
    await this.writeAll(filteredRecords)
  }

  async update(id, attrs) {
    const records = await this.getAll()
    const record = records.find(record => record.id === id)

    if (!record) {
      throw new Error(`record with id ${id} not found`)
    }

    Object.assign(record, attrs)
    await this.writeAll(records)
  }

  async getOneBy(filters) {
    const records = await this.getAll()

    for (let record of records) {
      let found = true

      for (let key in filters) {
        if (filters[key] !== record[key]) {
          found = false
        }
      }

      if (found) {
        return record
      }
    }
  }
}

module.exports = new UsersRepository('users.json')
