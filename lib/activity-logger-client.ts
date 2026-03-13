export interface ActivityLogData {
  userId?: string
  userEmail?: string
  userName?: string
  action: string
  entityType?: 'asset' | 'loan' | 'user' | 'category' | 'login' | 'auth'
  entityId?: string
  details?: any
}

/**
 * Log aktivitas dari client component
 * Panggil API endpoint
 */
export async function logActivityClient(data: ActivityLogData) {
  try {
    const response = await fetch('/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      console.error('Failed to log activity:', await response.text())
    }
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}