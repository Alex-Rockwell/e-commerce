const fs = require('fs')
const crypto = require('crypto')

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
    records.push(attrs)
    await this.writeAll(records)
  }

  async writeAll(records) {
    await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2))
  }

  randomId() {
    return crypto.randomBytes(4).toString('hex')
  }
}

const test = async () => {
  const repo = new UsersRepository('users.json')

  await repo.create({ email: 'test@test.com', password: 'password'})

  users = await repo.getAll()

  console.log(users)
}
test()
