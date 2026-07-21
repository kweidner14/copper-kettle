import { redirect } from 'next/navigation'

// This app is an API/admin host only — the public site lives in apps/web.
const Page = () => redirect('/admin')

export default Page
