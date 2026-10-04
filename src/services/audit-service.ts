import { getDatabase } from './database';
import { AuditLog, AuditActionType } from '@/types/mahasiswa';

export const AuditService = {
  /**
   * Records a critical administrative mutation into the append-only audit_logs table.
   */
  async logActivity(
    action: AuditActionType | string,
    entity: string,
    entityId?: string | number | null,
    details?: string | null,
    actor: string = 'admin'
  ): Promise<AuditLog> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const strEntityId = entityId !== undefined && entityId !== null ? String(entityId) : null;
    const cleanDetails = details || null;

    const res = await db.runAsync(
      `INSERT INTO audit_logs (timestamp, action, entity, entity_id, details, actor, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [now, action, entity, strEntityId, cleanDetails, actor, now]
    );

    return {
      id: res.lastInsertRowId,
      timestamp: now,
      action,
      entity,
      entityId: strEntityId,
      entity_id: strEntityId,
      details: cleanDetails,
      actor,
      createdAt: now,
      created_at: now,
    };
  },

  /**
   * Retrieves audit logs chronologically (newest first) with optional filtering and search.
   */
  async getAuditLogs(
    filterActionOrOptions?: string | { action?: string; filterAction?: string; searchQuery?: string; search?: string; limit?: number },
    searchQuery?: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    let filterAction: string | undefined;
    let actualSearchQuery = searchQuery;
    let actualLimit = limit;

    if (filterActionOrOptions && typeof filterActionOrOptions === 'object') {
      filterAction = filterActionOrOptions.action || filterActionOrOptions.filterAction;
      actualSearchQuery = filterActionOrOptions.searchQuery || filterActionOrOptions.search;
      actualLimit = filterActionOrOptions.limit ?? 100;
    } else {
      filterAction = filterActionOrOptions;
    }

    // Filter by action category or exact action
    if (filterAction && filterAction !== 'Semua') {
      const normalized = filterAction.toUpperCase();
      if (normalized === 'NILAI') {
        query += ' AND action LIKE ?';
        params.push('%NILAI%');
      } else if (normalized === 'KRS') {
        query += ' AND action LIKE ?';
        params.push('%KRS%');
      } else if (normalized === 'MAHASISWA') {
        query += ' AND action LIKE ?';
        params.push('%MAHASISWA%');
      } else if (normalized === 'DATABASE') {
        query += ' AND (action LIKE ? OR action LIKE ?)';
        params.push('%DATABASE%', '%DELETE%');
      } else {
        query += ' AND action = ?';
        params.push(filterAction);
      }
    }

    // Search query across entity, entity_id, details, actor
    if (actualSearchQuery && actualSearchQuery.trim()) {
      const term = `%${actualSearchQuery.trim()}%`;
      query += ' AND (entity LIKE ? OR entity_id LIKE ? OR details LIKE ? OR actor LIKE ?)';
      params.push(term, term, term, term);
    }

    query += ' ORDER BY id DESC LIMIT ?;';
    params.push(actualLimit);

    const rows = await db.getAllAsync<any>(query, params);
    return rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      action: r.action,
      entity: r.entity,
      entityId: r.entity_id,
      entity_id: r.entity_id,
      details: r.details,
      actor: r.actor,
      createdAt: r.created_at,
      created_at: r.created_at,
    }));
  },
};
