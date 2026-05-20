'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { formatDate } from '@/lib/utils/formatters';
import type { Profile } from '@/types';

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name?.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-urbanist)',
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--color-text-secondary)',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {children}
    </h2>
  );
}

function FieldRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        padding: '12px 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <span style={{ color: 'var(--color-text-disabled)', marginTop: '2px', flexShrink: 0 }}>
        {icon}
      </span>
      <div>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-disabled)',
            marginBottom: '3px',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)', fontFamily: 'var(--font-inter)' }}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  rightElement,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  disabled?: boolean;
  error?: string;
  rightElement?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontSize: '0.6875rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-inter)',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: rightElement ? '12px 44px 12px 14px' : '12px 14px',
            background: disabled ? 'var(--color-surface-2)' : 'var(--color-surface)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
            fontSize: '0.9375rem',
            fontFamily: 'var(--font-inter)',
            outline: 'none',
            transition: 'border-color var(--duration-fast) var(--ease-smooth)',
            cursor: disabled ? 'not-allowed' : 'text',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            if (!disabled && !error)
              (e.target as HTMLInputElement).style.borderColor = 'var(--color-gold)';
          }}
          onBlur={(e) => {
            if (!disabled)
              (e.target as HTMLInputElement).style.borderColor = error
                ? 'var(--color-error)'
                : 'var(--color-border)';
          }}
        />
        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontFamily: 'var(--font-inter)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({
  label,
  loading,
  loadingLabel = 'Saving…',
  onClick,
  disabled,
}: {
  label: string;
  loading: boolean;
  loadingLabel?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '11px 24px',
        background: loading || disabled ? 'var(--color-surface-2)' : 'var(--color-gold)',
        color: loading || disabled ? 'var(--color-text-disabled)' : '#0A0A0F',
        border: 'none',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-inter)',
        fontWeight: 600,
        fontSize: '0.8125rem',
        letterSpacing: '0.06em',
        transition: 'all var(--duration-fast) var(--ease-smooth)',
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold-light)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-gold)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          loading || disabled ? 'var(--color-surface-2)' : 'var(--color-gold)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid #fff',
              borderRadius: '9999px',
            }}
            className="animate-spin"
          />
          {loadingLabel}
        </>
      ) : (
        <>
          <Save size={14} strokeWidth={1.5} />
          {label}
        </>
      )}
    </button>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const supabase = createBrowserClient();

  // Profile data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit profile form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Load profile on mount
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, created_at')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
      }
      setLoadingProfile(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save profile ─────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() || null })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, full_name: fullName.trim(), phone: phone.trim() || null } : prev);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function handleChangePassword() {
    setPasswordError('');

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    setSavingPassword(true);
    try {
      // 1. Verify current password by reauthenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile!.email,
        password: currentPassword,
      });
      if (signInError) {
        setPasswordError('Current password is incorrect.');
        return;
      }

      // 2. Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6 space-y-8">
          {/* Avatar skeleton */}
          <div className="flex items-center gap-5">
            <div
              className="animate-pulse"
              style={{ width: '72px', height: '72px', background: 'var(--color-surface-2)', flexShrink: 0 }}
            />
            <div className="space-y-2 flex-1">
              <div className="animate-pulse h-5 w-40" style={{ background: 'var(--color-surface-2)' }} />
              <div className="animate-pulse h-3.5 w-56" style={{ background: 'var(--color-surface-2)' }} />
            </div>
          </div>
          {/* Fields skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-14" style={{ background: 'var(--color-surface-2)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = getInitials(profile.full_name);
  const profileDirty =
    fullName.trim() !== (profile.full_name ?? '') ||
    (phone.trim() || null) !== profile.phone;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6">

        {/* ── Avatar + name header ────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
            padding: '24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Initials avatar */}
          <div
            style={{
              width: '72px',
              height: '72px',
              background: 'var(--color-gold)',
              color: '#0A0A0F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-urbanist)',
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div>
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-urbanist)',
                marginBottom: '4px',
              }}
            >
              {profile.full_name || 'Student'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-inter)' }}>
              {profile.email}
            </p>
          </div>
        </div>

        {/* ── Profile info ────────────────────────────────────────────── */}
        <div
          style={{
            padding: '24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            marginBottom: '24px',
          }}
        >
          <SectionHeading>Account Details</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <FieldRow label="Email" value={profile.email} icon={<Mail size={16} strokeWidth={1.5} />} />
            <FieldRow
              label="Phone"
              value={profile.phone ?? ''}
              icon={<Phone size={16} strokeWidth={1.5} />}
            />
            <FieldRow
              label="Member Since"
              value={formatDate(profile.created_at)}
              icon={<Calendar size={16} strokeWidth={1.5} />}
            />
            <FieldRow label="Account Type" value="Student" icon={<User size={16} strokeWidth={1.5} />} />
          </div>
        </div>

        {/* ── Edit profile form ────────────────────────────────────────── */}
        <div
          style={{
            padding: '24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            marginBottom: '24px',
          }}
        >
          <SectionHeading>Edit Profile</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <InputField
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              placeholder="Your full name"
            />
            <InputField
              label="Phone Number"
              value={phone}
              onChange={setPhone}
              type="tel"
              placeholder="e.g. 08012345678"
            />
            {/* Email — read-only */}
            <InputField
              label="Email (read-only)"
              value={profile.email}
              disabled
            />
          </div>
          <SubmitButton
            label="Save Changes"
            loading={savingProfile}
            onClick={handleSaveProfile}
            disabled={!profileDirty}
          />
        </div>

        {/* ── Change password form ─────────────────────────────────────── */}
        <div
          style={{
            padding: '24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <SectionHeading>Change Password</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>

            <InputField
              label="Current Password"
              value={currentPassword}
              onChange={(v) => { setCurrentPassword(v); setPasswordError(''); }}
              type={showCurrent ? 'text' : 'password'}
              placeholder="Your current password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-disabled)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              }
              // Show inline error only on current password field
              error={passwordError === 'Current password is incorrect.' ? passwordError : undefined}
            />

            <InputField
              label="New Password"
              value={newPassword}
              onChange={(v) => { setNewPassword(v); setPasswordError(''); }}
              type={showNew ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-disabled)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              }
            />

            <InputField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setPasswordError(''); }}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat new password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-disabled)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              }
              error={
                passwordError && passwordError !== 'Current password is incorrect.'
                  ? passwordError
                  : undefined
              }
            />
          </div>

          <SubmitButton
            label="Change Password"
            loadingLabel="Changing…"
            loading={savingPassword}
            onClick={handleChangePassword}
            disabled={!currentPassword && !newPassword && !confirmPassword}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <Lock size={13} strokeWidth={1.5} style={{ color: 'var(--color-text-disabled)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)', fontFamily: 'var(--font-inter)' }}>
              For security, you'll be asked to verify your current password before making changes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}