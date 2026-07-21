import type { Endpoint } from 'payload'

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const contactEndpoint: Endpoint = {
  path: '/contact',
  method: 'post',
  handler: async (req) => {
    const body = (req.json ? await req.json() : {}) as {
      name?: string
      email?: string
      message?: string
    }

    if (!body.name || !isValidEmail(body.email) || !body.message) {
      return Response.json(
        { error: 'name, a valid email, and message are all required.' },
        { status: 400 },
      )
    }

    await req.payload.create({
      collection: 'contact-submissions',
      data: {
        name: body.name,
        email: body.email,
        message: body.message,
      },
    })

    return Response.json({ success: true })
  },
}
