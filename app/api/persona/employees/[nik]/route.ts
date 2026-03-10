import { NextResponse } from 'next/server'

type Params = Promise<{ nik: string }>

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { nik } = await params
    
    const res = await fetch(`https://persona-hris.vercel.app/api/employees/${nik}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Karyawan tidak ditemukan' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: `Gagal fetch dari Persona HRIS (${res.status})` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}