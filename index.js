const fp = require('fastify-plugin')
const { processRequest } = require('graphql-upload')

function fastifyGQLUpload(fastify, options = {}, done) {
  fastify.addContentTypeParser('multipart', (req, done) => {
    req.isMultipart = true
    done()
  })

  fastify.addHook('preValidation', async function(request, reply) {
    if (!request.req.isMultipart) {
      return
    }

    request.body = await processRequest(request.req, reply.res, options)
  })

  done()
}

module.exports = fp(fastifyGQLUpload, {
  fastify: '>= 2.x',
  name: 'fastify-gql-upload'
})
