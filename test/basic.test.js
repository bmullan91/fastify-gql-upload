const { promises: fs } = require('fs')
const tap = require('tap')
const path = require('path')
const FormData = require('form-data')
const { build, uploadsDir } = require('./build-server')

tap.test('fastify-gql-upload - should work', async t => {
  const server = build()
  await server.ready()

  const body = new FormData()

  const query = /* GraphQL */ `
    mutation UploadImage($image: Upload!) {
      uploadImage(image: $image)
    }
  `
  const operations = {
    query,
    variables: { image: null }
  }

  const fileData = 'a'
  const uploadFilename = 'a.png'

  body.append('operations', JSON.stringify(operations))
  body.append('map', JSON.stringify({ '1': ['variables.image'] }))
  body.append('1', fileData, { filename: uploadFilename })

  const res = await server.inject({
    method: 'POST',
    url: '/graphql',
    headers: body.getHeaders(),
    body
  })

  t.equal(res.statusCode, 200)
  t.deepEqual(JSON.parse(res.body), { data: { uploadImage: true } })

  const uploadedFile = await fs.readFile(
    path.join(uploadsDir, uploadFilename),
    {
      encoding: 'utf8'
    }
  )

  t.equal(uploadedFile, fileData)
  await server.close()
})

tap.test('Normal gql query should work', async t => {
  const server = build()
  await server.ready()

  const query = '{ add(x: 2, y: 2) }'

  const res = await server.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query
    }
  })

  t.equal(res.statusCode, 200)
  t.deepEqual(JSON.parse(res.body), {
    data: {
      add: 4
    }
  })

  await server.close()
})

tap.test('A normal http request to another route should work', async t => {
  const server = build()
  await server.ready()
  const res = await server.inject({ method: 'GET', url: '/' })

  t.strictEqual(res.statusCode, 200)
  t.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
  t.deepEqual(JSON.parse(res.payload), { hello: 'world' })
  await server.close()
})
