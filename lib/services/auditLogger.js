/**
 * Audit Logging Service
 * 
 * Tracks system modifications, role updates, bulk outreach submissions,
 * file imports, and deletions for operational accountability.
 */

export async function logAuditEvent({
  userId = null,
  userName = 'System',
  action,
  entityType,
  entityId = null,
  metadata = {},
  supabaseClient = null,
}) {
  const logEntry = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}`,
    user_id: userId,
    user_name: userName,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    metadata,
    created_at: new Date().toISOString(),
  };

  if (supabaseClient) {
    try {
      await supabaseClient.from('audit_logs').insert([logEntry]);
    } catch (err) {
      console.warn('Audit logging to Supabase failed:', err);
    }
  }

  return logEntry;
}
