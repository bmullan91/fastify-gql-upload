const fastify = require('fastify')
const GQL = require('fastify-gql')
const { GraphQLUpload } = require('graphql-upload')

const schema = /* GraphQL */ `
  scalar Upload
  type Query {
    add(x: Int, y: Int): Int
  }
  type Mutation {
    uploadImage(image: Upload): String
  }
`

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    add: async (_, { x, y }) => {
      return x + y
    }
  },
  Mutation: {
    uploadImage: async (_, { image }) => {
      const { createReadStream } = await image
      const rs = createReadStream()

      let data = ''

      for await (const chunk of rs) {
        data += chunk
      }

      return data
    }
  }
}

function build(opts) {
  const app = fastify(opts)

  app.register(require('../index.js'))

  app.register(GQL, {
    schema,
    resolvers
  })

  app.get('/', async (request, reply) => {
    return { hello: 'world' }
  })

  return app
}

module.exports = {
  build
}
