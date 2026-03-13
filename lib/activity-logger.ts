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

/**
 * Log aktivitas dari client component
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