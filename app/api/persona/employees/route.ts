import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://persona-hris.vercel.app/api/employees', {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache selama 60 detik biar gak terlalu sering fetch
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      console.error('Persona API error:', res.status, res.statusText)
      return NextResponse.json(
        { 
          success: false, 
          error: `Gagal fetch dari Persona HRIS (${res.status})` 
        },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error' 
      },
      { status: 500 }
    )
  }
}