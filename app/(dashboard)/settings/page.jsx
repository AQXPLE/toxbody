'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import {
  Settings as SettingsIcon,
  Globe,
  Clock,
  Instagram,
  RotateCcw,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({
    organization_name: 'The Tox Technique',
    default_timezone: 'America/Chicago',
    pagination_limit: 25,
    repeat_warning_enabled: true,
    meta_api_configured: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    db.getSettings().then(setSettings);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await db.updateSettings(settings);
      addToast({
        title: 'Settings Saved',
        message: 'Platform configuration updated successfully.',
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Save Failed', message: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset to default seed data? This will restore initial accounts, staff, and the core repeat scenarios.')) {
      db.resetStore();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>System Configuration & Settings</span>
            <Badge variant="danger" size="sm">
              Admin
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global organization parameters, operational timezone, repeat alert thresholds, and Meta API integration status.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization & Timezone */}
        <div className="rounded-xl border border-zinc-800 bg-[#121319] p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono flex items-center gap-2">
            <Globe className="h-4 w-4 text-amber-400" />
            <span>Organization & Reporting Timezone</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-200 block mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={settings.organization_name}
                onChange={(e) =>
                  setSettings({ ...settings, organization_name: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-200 block mb-1">
                Default Business Timezone (Reporting)
              </label>
              <select
                value={settings.default_timezone}
                onChange={(e) =>
                  setSettings({ ...settings, default_timezone: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="America/Chicago">Central Time — America/Chicago (CT)</option>
                <option value="America/New_York">Eastern Time — America/New_York (ET)</option>
                <option value="America/Denver">Mountain Time — America/Denver (MT)</option>
                <option value="America/Los_Angeles">Pacific Time — America/Los_Angeles (PT)</option>
              </select>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                All date-based analytics and outreach timestamps use this timezone rather than client browser time.
              </span>
            </div>
          </div>
        </div>

        {/* Repeat Outreach Behavior */}
        <div className="rounded-xl border border-zinc-800 bg-[#121319] p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber-400" />
            <span>Repeat Outreach Behavior</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.repeat_warning_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, repeat_warning_enabled: e.target.checked })
                }
                className="rounded border-zinc-700 text-amber-500 focus:ring-0"
              />
              <span className="text-xs text-zinc-200">
                Show prominent visual alerts when submitting repeat same-account outreach
              </span>
            </label>
            <p className="text-[11px] text-zinc-400 pl-6">
              Per policy, repeat outreach is preserved as a new historical event, flagged with repeat count, and never silently blocked.
            </p>
          </div>
        </div>

        {/* Meta / Instagram API Integration Status */}
        <div className="rounded-xl border border-zinc-800 bg-[#121319] p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono flex items-center gap-2">
            <Instagram className="h-4 w-4 text-amber-400" />
            <span>Meta / Instagram Graph API Integration</span>
          </h3>

          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">API Connection Status</span>
              <Badge variant="default" size="xs">
                External verification unavailable
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              The external verification architecture is fully abstracted in{' '}
              <span className="font-mono text-amber-300">lib/services/instagramVerification.js</span>.
              To enable live Meta API verification, provide <span className="font-mono text-zinc-200">META_APP_ID</span> and <span className="font-mono text-zinc-200">INSTAGRAM_GRAPH_ACCESS_TOKEN</span> in your server environment. The platform gracefully handles unconfigured states without failing or scraping.
            </p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium underline underline-offset-2"
          >
            Reset to Default Seed Data
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
