import type { Endpoint } from 'payload'

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const newsletterEndpoint: Endpoint = {
  path: '/newsletter',
  method: 'post',
  handler: async (req) => {
    const body = (req.json ? await req.json() : {}) as { email?: string }

    if (!isValidEmail(body.email)) {
      return Response.json({ error: 'A valid email is required.' }, { status: 400 })
    }

    try {
      await req.payload.create({
        collection: 'newsletter-subscribers',
        data: { email: body.email },
      })
    } catch (err) {
      // Most likely a duplicate email (unique constraint) — treat as success
      // so the form doesn't leak which addresses are already subscribed.
      req.payload.logger.warn(`Newsletter signup issue for ${body.email}: ${String(err)}`)
    }

    return Response.json({ success: true })
  },
}
