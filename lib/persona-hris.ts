const PERSONA_API_URL = process.env.NEXT_PUBLIC_PERSONA_API_URL || 'https://persona-hris.vercel.app'

export interface Employee {
  id: string
  nik: string
  full_name: string
  email: string
  phone: string
  position: string
  department: string
  join_date: string
  status: string
  photo_url: string | null
  birth_date: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
}

export async function getEmployees(): Promise<Employee[]> {
  try {
    // Pake proxy internal
    const res = await fetch('/api/persona/employees')
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Gagal mengambil data karyawan')
    }
    
    const response = await res.json()
    
    // Format response dari Persona: { success: true, data: [...] }
    if (!response.success) {
      throw new Error(response.error || 'Gagal mengambil data karyawan')
    }
    
    return response.data
  } catch (error) {
    console.error('Error in getEmployees:', error)
    throw error
  }
}

export async function getEmployeeByNIK(nik: string): Promise<Employee> {
  try {
    const res = await fetch(`/api/persona/employees/${nik}`)
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Karyawan tidak ditemukan')
      }
      const error = await res.json()
      throw new Error(error.error || 'Gagal mengambil data karyawan')
    }
    
    const response = await res.json()
    
    if (!response.success) {
      throw new Error(response.error || 'Gagal mengambil data karyawan')
    }
    
    return response.data
  } catch (error) {
    console.error(`Error in getEmployeeByNIK for NIK ${nik}:`, error)
    throw error
  }
}

// Optional: Search karyawan
export async function searchEmployees(query: string): Promise<Employee[]> {
  try {
    const employees = await getEmployees()
    
    // Filter berdasarkan query (case insensitive)
    const filtered = employees.filter(emp => 
      emp.full_name.toLowerCase().includes(query.toLowerCase()) ||
      emp.nik.toLowerCase().includes(query.toLowerCase()) ||
      emp.email.toLowerCase().includes(query.toLowerCase()) ||
      emp.department.toLowerCase().includes(query.toLowerCase())
    )
    
    return filtered
  } catch (error) {
    console.error('Error in searchEmployees:', error)
    throw error
  }
}