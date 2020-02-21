'use strict'

const fastify = require('fastify')
const GQL = require('fastify-gql')
const { GraphQLUpload } = require('graphql-upload')
const fs = require('fs')
const util = require('util')
const stream = require('stream')
const path = require('path')

const pipeline = util.promisify(stream.pipeline)
const uploadsDir = path.resolve(__dirname, './uploads')

const schema = /* GraphQL */ `
  scalar Upload
  type Query {
    add(x: Int, y: Int): Int
  }
  type Mutation {
    uploadImage(image: Upload): Boolean
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
      const { filename, createReadStream } = await image
      const rs = createReadStream()
      const ws = fs.createWriteStream(path.join(uploadsDir, filename))
      await pipeline(rs, ws)
      return true
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

  app.get("/", async (request, reply) => {
    return { hello: "world" };
  });

  return app
}

module.exports = {
  build,
  uploadsDir
}
