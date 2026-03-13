import { supabase } from './supabase'
import { headers } from 'next/headers'

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
 * Log aktivitas dari server component
 * HANYA untuk Server Components
 */
export async function logActivityServer(data: ActivityLogData) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    const { error } = await supabase.from('activity_logs').insert({
      user_id: data.userId,
      user_email: data.userEmail,
      user_name: data.userName,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      details: data.details || {},
      ip_address: ipAddress,
      user_agent: userAgent
    })

    if (error) console.error('Error logging activity:', error)
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}