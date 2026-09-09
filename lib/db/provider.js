/**
 * Unified Database Provider & Data Layer
 * 
 * Provides an intelligent abstraction that:
 * 1. Checks for active Supabase PostgreSQL connection
 * 2. Uses Supabase queries when configured
 * 3. Falls back smoothly to an in-memory/localStorage reactive store for local development/demos
 * 4. Strictly enforces the core business rules:
 *    - Canonical Influencer normalization
 *    - Repeat outreach calculation (same account vs cross-account)
 *    - Historical undated import preservation
 */

import {
  INITIAL_LOCATIONS,
  INITIAL_ACCOUNTS,
  INITIAL_EMPLOYEES,
  INITIAL_ASSIGNMENTS,
  INITIAL_INFLUENCERS,
  INITIAL_OUTREACH,
  INITIAL_SETTINGS,
} from './seedData.js';
import { normalizeHandle, extractAndNormalizeHandles } from '../normalization.js';
import { analyzeOutreachBatch } from '../repeatDetection.js';
import { createClient } from '../supabase/client.js';

const STORAGE_KEY = 'tox_technique_db_v1';
const CURRENT_USER_KEY = 'tox_technique_current_user_v1';

class DataProvider {
  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.supabase = this.isClient ? createClient() : null;
    this.memoryStore = null;
    this.initStore();
  }

  initStore() {
    if (this.isClient) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.memoryStore = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not read from localStorage, using memory store');
      }
    }

    if (!this.memoryStore) {
      this.memoryStore = {
        locations: [...INITIAL_LOCATIONS],
        accounts: [...INITIAL_ACCOUNTS],
        employees: [...INITIAL_EMPLOYEES],
        assignments: [...INITIAL_ASSIGNMENTS],
        influencers: [...INITIAL_INFLUENCERS],
        outreach: [...INITIAL_OUTREACH],
        settings: { ...INITIAL_SETTINGS },
        auditLogs: [],
        importBatches: [],
      };
      this.persist();
    }
  }

  persist() {
    if (this.isClient && this.memoryStore) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryStore));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }
  }

  resetStore() {
    this.memoryStore = {
      locations: [...INITIAL_LOCATIONS],
      accounts: [...INITIAL_ACCOUNTS],
      employees: [...INITIAL_EMPLOYEES],
      assignments: [...INITIAL_ASSIGNMENTS],
      influencers: [...INITIAL_INFLUENCERS],
      outreach: [...INITIAL_OUTREACH],
      settings: { ...INITIAL_SETTINGS },
      auditLogs: [],
      importBatches: [],
    };
    this.persist();
  }

  // ==========================================================================
  // AUTH / CURRENT USER SIMULATION
  // ==========================================================================
  getCurrentUser() {
    if (this.isClient) {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        try {
          const user = JSON.parse(stored);
          const fresh = this.memoryStore.employees.find((e) => e.id === user.id);
          return fresh || user;
        } catch (e) {}
      }
    }
    // Default to Daniyal (Admin)
    return this.memoryStore.employees[0];
  }

  setCurrentUser(employeeOrId) {
    let user = employeeOrId;
    if (typeof employeeOrId === 'string') {
      user = this.memoryStore.employees.find((e) => e.id === employeeOrId) || this.memoryStore.employees[0];
    }
    if (this.isClient && user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    return user;
  }

  // ==========================================================================
  // LOCATIONS
  // ==========================================================================
  async getLocations() {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('locations').select('*').order('name');
      if (!error && data) return data;
    }
    return [...this.memoryStore.locations];
  }

  async createLocation(locationData) {
    const newLoc = {
      id: `loc-${Date.now()}`,
      name: locationData.name,
      city: locationData.city || locationData.name,
      state: locationData.state || '',
      country: locationData.country || 'USA',
      active: true,
      notes: locationData.notes || '',
      created_at: new Date().toISOString(),
    };
    this.memoryStore.locations.push(newLoc);
    this.persist();
    return newLoc;
  }

  // ==========================================================================
  // MARKETING ACCOUNTS
  // ==========================================================================
  async getAccounts() {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('marketing_accounts').select('*').order('account_name');
      if (!error && data) return data;
    }
    return [...this.memoryStore.accounts];
  }

  async getAccountById(id) {
    const accounts = await this.getAccounts();
    return accounts.find((a) => a.id === id) || null;
  }

  async createAccount(accData) {
    const newAcc = {
      id: `acc-${Date.now()}`,
      account_name: accData.account_name,
      instagram_handle: accData.instagram_handle.replace(/^@/, '').toLowerCase(),
      display_name: accData.display_name || `The Tox ${accData.account_name}`,
      location_id: accData.location_id || null,
      active: true,
      notes: accData.notes || '',
      created_at: new Date().toISOString(),
    };
    this.memoryStore.accounts.push(newAcc);
    this.persist();
    return newAcc;
  }

  async updateAccount(id, updates) {
    const index = this.memoryStore.accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.memoryStore.accounts[index] = { ...this.memoryStore.accounts[index], ...updates };
      this.persist();
      return this.memoryStore.accounts[index];
    }
    return null;
  }

  // ==========================================================================
  // EMPLOYEES & ASSIGNMENTS
  // ==========================================================================
  async getEmployees() {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('profiles').select('*').order('full_name');
      if (!error && data) return data;
    }
    return [...this.memoryStore.employees];
  }

  async getAssignments() {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('employee_account_assignments').select('*');
      if (!error && data) return data;
    }
    return [...this.memoryStore.assignments];
  }

  async getPermittedAccountsForEmployee(employeeId) {
    const employee = this.memoryStore.employees.find((e) => e.id === employeeId);
    const allAccounts = await this.getAccounts();

    // Admins and Managers have access to all accounts
    if (employee && (employee.role === 'admin' || employee.role === 'manager')) {
      return allAccounts;
    }

    const assignments = await this.getAssignments();
    const assignedIds = new Set(
      assignments.filter((asg) => asg.employee_id === employeeId).map((asg) => asg.account_id)
    );

    return allAccounts.filter((a) => assignedIds.has(a.id));
  }

  async updateEmployeeRole(employeeId, newRole) {
    const emp = this.memoryStore.employees.find((e) => e.id === employeeId);
    if (emp) {
      emp.role = newRole;
      this.persist();
    }
    return emp;
  }

  async updateAssignments(employeeId, accountIds) {
    // Filter out old assignments for this employee
    this.memoryStore.assignments = this.memoryStore.assignments.filter((asg) => asg.employee_id !== employeeId);
    
    // Add new assignments
    for (const accId of accountIds) {
      this.memoryStore.assignments.push({
        id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        employee_id: employeeId,
        account_id: accId,
      });
    }
    this.persist();
    return this.memoryStore.assignments;
  }

  async createEmployee(employeeData) {
    const newEmp = {
      id: `emp-${Date.now()}`,
      email: employeeData.email,
      full_name: employeeData.full_name,
      role: employeeData.role || 'staff',
      active: true,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
    this.memoryStore.employees.push(newEmp);

    if (employeeData.assigned_account_ids && Array.isArray(employeeData.assigned_account_ids)) {
      for (const accId of employeeData.assigned_account_ids) {
        this.memoryStore.assignments.push({
          id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          employee_id: newEmp.id,
          account_id: accId,
        });
      }
    }

    this.persist();
    return newEmp;
  }

  // ==========================================================================
  // INFLUENCERS
  // ==========================================================================
  async getInfluencers(filters = {}) {
    let list = [...this.memoryStore.influencers];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim().replace(/^@/, '');
      list = list.filter((inf) => {
        return (
          inf.normalized_handle.includes(q) ||
          (inf.display_name && inf.display_name.toLowerCase().includes(q)) ||
          (inf.city && inf.city.toLowerCase().includes(q)) ||
          (inf.niche && inf.niche.toLowerCase().includes(q))
        );
      });
    }

    if (filters.location_id) {
      list = list.filter((inf) => inf.primary_location_id === filters.location_id);
    }

    if (filters.niche) {
      list = list.filter((inf) => inf.niche && inf.niche.toLowerCase().includes(filters.niche.toLowerCase()));
    }

    if (filters.verified !== undefined) {
      list = list.filter((inf) => inf.verified === filters.verified);
    }

    return list;
  }

  async getInfluencerById(id) {
    return this.memoryStore.influencers.find((inf) => inf.id === id) || null;
  }

  async getInfluencerByHandle(handle) {
    const norm = normalizeHandle(handle);
    if (!norm.isValid) return null;
    return this.memoryStore.influencers.find((inf) => inf.normalized_handle === norm.normalized) || null;
  }

  // ==========================================================================
  // OUTREACH RECORDS
  // ==========================================================================
  async getOutreachRecords(filters = {}) {
    let list = [...this.memoryStore.outreach];

    if (filters.influencer_id) {
      list = list.filter((o) => o.influencer_id === filters.influencer_id);
    }

    if (filters.account_id) {
      list = list.filter((o) => o.account_id === filters.account_id);
    }

    if (filters.employee_id) {
      list = list.filter((o) => o.employee_id === filters.employee_id);
    }

    if (filters.is_repeat_same_account !== undefined) {
      list = list.filter((o) => o.is_repeat_same_account === filters.is_repeat_same_account);
    }

    // Sort descending by date/submitted_at
    list.sort((a, b) => {
      const timeA = new Date(a.outreach_date || a.submitted_at || a.created_at || 0).getTime();
      const timeB = new Date(b.outreach_date || b.submitted_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    return list;
  }

  /**
   * Preview a bulk submission before committing
   */
  async previewOutreachBatch({ accountId, handlesText }) {
    const handles = extractAndNormalizeHandles(handlesText);
    const existingInfluencers = await this.getInfluencers();
    const existingOutreach = await this.getOutreachRecords();
    const marketingAccounts = await this.getAccounts();

    return analyzeOutreachBatch({
      handles,
      accountId,
      existingInfluencers,
      existingOutreach,
      marketingAccounts,
    });
  }

  /**
   * Commit a bulk submission into the database
   */
  async submitOutreachBatch({
    accountId,
    employeeId,
    handlesText,
    outreachDate = new Date().toISOString(),
    status = 'Contacted',
    notes = '',
  }) {
    const preview = await this.previewOutreachBatch({ accountId, handlesText });
    const targetAccount = await this.getAccountById(accountId);
    const createdOutreaches = [];

    for (const item of preview.analyzedHandles) {
      if (!item.isValid) continue;

      let influencerId = item.influencerId;

      // 1. Create missing influencer if new
      if (!influencerId) {
        const newInfluencer = {
          id: `inf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          instagram_handle: item.formatted,
          normalized_handle: item.normalized,
          instagram_url: item.url,
          display_name: item.formatted.replace('@', ''),
          follower_count: 0,
          niche: 'General',
          primary_location_id: targetAccount?.location_id || null,
          verified: false,
          profile_status: 'active',
          is_active: true,
          source: 'submission',
          created_at: new Date().toISOString(),
        };
        this.memoryStore.influencers.push(newInfluencer);
        influencerId = newInfluencer.id;
      }

      // 2. Determine repeat details
      const priorSameAccount = this.memoryStore.outreach.filter(
        (r) => r.influencer_id === influencerId && r.account_id === accountId
      );

      const isRepeat = priorSameAccount.length > 0;
      const repeatCount = priorSameAccount.length;
      const lastPrior = isRepeat ? priorSameAccount[priorSameAccount.length - 1] : null;

      // 3. Create Outreach Record
      const newOutreach = {
        id: `out-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        influencer_id: influencerId,
        account_id: accountId,
        employee_id: employeeId,
        submitted_at: new Date().toISOString(),
        outreach_date: outreachDate,
        is_repeat_same_account: isRepeat,
        repeat_count_for_account: repeatCount,
        previous_outreach_id: lastPrior ? lastPrior.id : null,
        status: status || 'Contacted',
        notes: notes || '',
        source: 'submission',
        created_at: new Date().toISOString(),
      };

      this.memoryStore.outreach.unshift(newOutreach);
      createdOutreaches.push(newOutreach);
    }

    this.persist();

    // Log audit event
    this.logAudit({
      userId: employeeId,
      action: 'LOG_OUTREACH_BATCH',
      entityType: 'outreach',
      metadata: {
        accountId,
        submittedCount: createdOutreaches.length,
        repeatsCount: createdOutreaches.filter((o) => o.is_repeat_same_account).length,
      },
    });

    return {
      success: true,
      submittedCount: createdOutreaches.length,
      records: createdOutreaches,
    };
  }

  // ==========================================================================
  // TSV / CSV BATCH IMPORT COMMITTAL
  // ==========================================================================
  async commitTsvImport({
    fileName,
    parsedResult,
    employeeId,
  }) {
    const { uniqueInfluencers, outreaches } = parsedResult;
    const allAccounts = await this.getAccounts();
    const accountLookup = new Map();
    allAccounts.forEach((a) => {
      accountLookup.set(a.account_name.toLowerCase(), a);
      accountLookup.set(a.instagram_handle.toLowerCase(), a);
    });

    let newInfluencersCreated = 0;
    let existingInfluencersMatched = 0;
    let outreachRecordsCreated = 0;
    let repeatsDetected = 0;

    // 1. Process Influencers
    for (const inf of uniqueInfluencers) {
      const existing = this.memoryStore.influencers.find((i) => i.normalized_handle === inf.normalized_handle);
      if (!existing) {
        const newRecord = {
          id: `inf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          instagram_handle: inf.instagram_handle,
          normalized_handle: inf.normalized_handle,
          instagram_url: `https://www.instagram.com/${inf.normalized_handle}/`,
          display_name: inf.normalized_handle,
          follower_count: 0,
          niche: 'Imported',
          verified: false,
          profile_status: 'active',
          is_active: true,
          source: 'historical_import',
          created_at: new Date().toISOString(),
        };
        this.memoryStore.influencers.push(newRecord);
        newInfluencersCreated++;
      } else {
        existingInfluencersMatched++;
      }
    }

    // Refresh map
    const influencerMap = new Map(
      this.memoryStore.influencers.map((inf) => [inf.normalized_handle, inf])
    );

    // 2. Process Outreach Records
    const batchId = `batch-${Date.now()}`;
    for (const entry of outreaches) {
      const targetInfluencer = influencerMap.get(entry.normalizedHandle);
      if (!targetInfluencer) continue;

      // Match account by context
      const accountMatch = accountLookup.get(entry.accountContext.toLowerCase()) || allAccounts[0];
      const accountId = accountMatch.id;

      // Check if this influencer was already contacted from this account
      const priorOutreaches = this.memoryStore.outreach.filter(
        (o) => o.influencer_id === targetInfluencer.id && o.account_id === accountId
      );

      const isRepeat = priorOutreaches.length > 0;
      if (isRepeat) repeatsDetected++;

      const newOutreach = {
        id: `out-hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        influencer_id: targetInfluencer.id,
        account_id: accountId,
        employee_id: employeeId || null,
        submitted_at: new Date().toISOString(),
        outreach_date: null, // Legacy historical data: Date unavailable!
        is_repeat_same_account: isRepeat,
        repeat_count_for_account: priorOutreaches.length,
        previous_outreach_id: isRepeat ? priorOutreaches[priorOutreaches.length - 1].id : null,
        status: 'Contacted',
        notes: `Imported from ${fileName} (Column: ${entry.accountContext})`,
        source: 'historical_import',
        import_batch_id: batchId,
        created_at: new Date().toISOString(),
      };

      this.memoryStore.outreach.push(newOutreach);
      outreachRecordsCreated++;
    }

    // Record batch metadata
    const batchRecord = {
      id: batchId,
      file_name: fileName,
      file_type: 'tsv',
      uploaded_by: employeeId,
      total_rows: parsedResult.totalRows,
      recognized_handles: outreaches.length,
      new_influencers_count: newInfluencersCreated,
      repeat_outreach_count: repeatsDetected,
      ambiguous_rows_count: parsedResult.ambiguousCount,
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };
    this.memoryStore.importBatches.unshift(batchRecord);

    this.persist();

    this.logAudit({
      userId: employeeId,
      action: 'HISTORICAL_IMPORT_COMPLETED',
      entityType: 'import_batch',
      entityId: batchId,
      metadata: {
        fileName,
        newInfluencersCreated,
        outreachRecordsCreated,
        repeatsDetected,
      },
    });

    return {
      success: true,
      batchId,
      newInfluencersCreated,
      existingInfluencersMatched,
      outreachRecordsCreated,
      repeatsDetected,
    };
  }

  // ==========================================================================
  // AUDIT & SETTINGS
  // ==========================================================================
  logAudit({ userId, action, entityType, entityId = null, metadata = {} }) {
    const user = this.memoryStore.employees.find((e) => e.id === userId);
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      user_name: user?.full_name || 'System',
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    };
    this.memoryStore.auditLogs.unshift(entry);
    this.persist();
    return entry;
  }

  async getAuditLogs(limit = 50) {
    return this.memoryStore.auditLogs.slice(0, limit);
  }

  async getSettings() {
    return { ...this.memoryStore.settings };
  }

  async updateSettings(newSettings) {
    this.memoryStore.settings = { ...this.memoryStore.settings, ...newSettings };
    this.persist();
    return this.memoryStore.settings;
  }

  // ==========================================================================
  // DASHBOARD & ANALYTICS CALCULATION
  // ==========================================================================
  async getDashboardMetrics() {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    
    // Start of week (7 days ago)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Start of month (30 days ago)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const outreach = this.memoryStore.outreach;
    const influencers = this.memoryStore.influencers;
    const accounts = this.memoryStore.accounts;
    const employees = this.memoryStore.employees;

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    let totalRepeats = 0;
    const uniqueInfluencerIdsReached = new Set();

    for (const item of outreach) {
      if (item.is_repeat_same_account) totalRepeats++;
      uniqueInfluencerIdsReached.add(item.influencer_id);

      const d = item.outreach_date || item.submitted_at;
      if (d) {
        const itemDate = new Date(d);
        if (d.slice(0, 10) === todayStr) todayCount++;
        if (itemDate >= weekAgo) weekCount++;
        if (itemDate >= monthAgo) monthCount++;
      }
    }

    return {
      totalOutreach: outreach.length,
      outreachToday: todayCount,
      outreachThisWeek: weekCount,
      outreachThisMonth: monthCount,
      totalInfluencers: influencers.length,
      uniqueInfluencersReached: uniqueInfluencerIdsReached.size,
      repeatOutreachCount: totalRepeats,
      repeatRate: outreach.length > 0 ? ((totalRepeats / outreach.length) * 100).toFixed(1) : 0,
      activeAccountsCount: accounts.filter((a) => a.active).length,
      activeEmployeesCount: employees.filter((e) => e.active).length,
    };
  }
}

// Export singleton instance
export const db = new DataProvider();
