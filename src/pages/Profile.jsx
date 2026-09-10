import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../api/userService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { inputCls, Field } from './DeploymentRequests';

const defaultPreferences = {
  emailNotifications: true,
  deploymentReminders: true
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState(defaultPreferences);

  const [saving, setSaving] = useState(false);

  const [profileImage, setProfileImage] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (!user) return;

    setForm(f => ({
      ...f,
      name: user.name || '',
      mobile: user.mobile || ''
    }));

    setPreferences({
      ...defaultPreferences,
      ...(user.preferences || {})
    });

    setProfileImage(user.profileImageUrl || '');
    setSelectedImage('');
  }, [user]);

  function set(k, v) {
    setForm(f => ({
      ...f,
      [k]: v
    }));
  }

  function setPref(k, v) {
    setPreferences(p => ({
      ...p,
      [k]: v
    }));
  }

  function openFilePicker() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        const img = new Image();

        img.onload = () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(
              MAX_WIDTH / width,
              MAX_HEIGHT / height
            );

            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not process the selected image.'));
            return;
          }

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const compressedImage = canvas.toDataURL(
            'image/jpeg',
            0.82
          );

          resolve(compressedImage);
        };

        img.onerror = () => {
          reject(new Error('The selected file is not a valid image.'));
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Could not read the selected image.'));
      };

      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be 5 MB or less.');
      e.target.value = '';
      return;
    }

    try {
      const imageData = await resizeImage(file);

      setSelectedImage(imageData);
    } catch (error) {
      toast.error(
        error.message || 'Could not process the image.'
      );
    }

    e.target.value = '';
  }

  async function saveProfile(e) {
    e.preventDefault();

    setSaving(true);

    try {
      const changingPassword =
        form.newPassword ||
        form.currentPassword ||
        form.confirmPassword;

      if (
        changingPassword &&
        (
          !form.currentPassword ||
          !form.newPassword ||
          !form.confirmPassword
        )
      ) {
        throw new Error(
          'Fill current password, new password and confirmation to change your password.'
        );
      }

      const res = await userService.updateProfile({
        name: form.name,
        mobile: form.mobile,

        currentPassword: changingPassword
          ? form.currentPassword
          : undefined,

        newPassword: changingPassword
          ? form.newPassword
          : undefined,

        confirmPassword: changingPassword
          ? form.confirmPassword
          : undefined,

        preferences,

        /*
         * Only send this when a new image was selected.
         * The backend will upload it to Google Drive and
         * store only the resulting URL in Google Sheets.
         */
        profileImage: selectedImage || undefined
      });

      updateUser(res.user);

      setProfileImage(
        res.user?.profileImageUrl || ''
      );

      setSelectedImage('');

      setForm(f => ({
        ...f,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      toast.success(
        'Profile updated successfully.'
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const displayedImage =
    selectedImage ||
    profileImage ||
    '';

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">

      <div>
        <h1 className="text-xl font-bold text-ink-900">
          My Profile
        </h1>

        <p className="text-sm text-ink-400 mt-0.5">
          Manage your account details, password and preferences.
        </p>
      </div>

      <form
        onSubmit={saveProfile}
        className="space-y-5"
      >

        <Card className="p-6">

          <h2 className="text-sm font-semibold text-ink-900 mb-4">
            Account details
          </h2>

          {/* =================================================
              PROFILE PHOTO
             ================================================= */}
          <div className="flex items-center gap-5 pb-6 mb-6 border-b border-ink-100">

            <div
              className="
                w-24
                h-24
                rounded-full
                overflow-hidden
                bg-[#2563EB]
                flex
                items-center
                justify-center
                text-white
                flex-shrink-0
                ring-4
                ring-blue-50
              "
            >

              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt={user.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />

                  <path
                    d="M4 21a8 8 0 0 1 16 0"
                  />
                </svg>
              )}

            </div>

            <div className="min-w-0">

              <p className="text-sm font-semibold text-ink-900">
                {user.name || 'User'}
              </p>

              <p className="text-sm text-ink-400 mt-0.5">
                {user.role || '—'}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={openFilePicker}
                className="
                  mt-3
                  inline-flex
                  items-center
                  justify-center
                  px-4
                  py-2
                  rounded-lg
                  border
                  border-ink-200
                  bg-white
                  text-sm
                  font-medium
                  text-ink-700
                  hover:bg-ink-50
                  transition-colors
                "
              >
                Change photo
              </button>

              <p className="text-xs text-ink-400 mt-2">
                JPG, PNG or other image formats. Maximum 5 MB.
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <Field
              label="Full name"
              required
            >
              <input
                required
                value={form.name}
                onChange={e =>
                  set('name', e.target.value)
                }
                className={inputCls}
              />
            </Field>

            <Field label="Email">
              <input
                value={user.email || ''}
                disabled
                className={`${inputCls} bg-ink-50 text-ink-400 cursor-not-allowed`}
              />
            </Field>

            <Field
              label="Mobile number"
              required
            >
              <input
                required
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={e =>
                  set(
                    'mobile',
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10)
                  )
                }
                className={inputCls}
              />
            </Field>

            <Field label="User ID">
              <input
                value={user.id || ''}
                disabled
                className={`${inputCls} bg-ink-50 text-ink-400 cursor-not-allowed font-mono`}
              />
            </Field>

          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">

            <Info
              label="Role"
              value={user.role || '—'}
            />

            <Info
              label="Account status"
              value={user.status || '—'}
            />

            <Info
              label="Admin access"
              value={
                user.power
                  ? 'DevOps Admin'
                  : 'Standard'
              }
            />

            <Info
              label="Created"
              value={
                user.createdAt
                  ? new Date(
                      user.createdAt
                    ).toLocaleString()
                  : '—'
              }
            />

            <Info
              label="Last updated"
              value={
                user.updatedAt
                  ? new Date(
                      user.updatedAt
                    ).toLocaleString()
                  : '—'
              }
            />

          </div>

        </Card>

        <Card className="p-6">

          <h2 className="text-sm font-semibold text-ink-900 mb-1">
            Change password
          </h2>

          <p className="text-xs text-ink-400 mb-4">
            Leave these fields empty if you do not want to change your password.
          </p>

          <div className="grid md:grid-cols-3 gap-4">

            <Field label="Current password">
              <input
                type="password"
                value={form.currentPassword}
                onChange={e =>
                  set(
                    'currentPassword',
                    e.target.value
                  )
                }
                className={inputCls}
                autoComplete="current-password"
              />
            </Field>

            <Field label="New password">
              <input
                type="password"
                minLength={8}
                value={form.newPassword}
                onChange={e =>
                  set(
                    'newPassword',
                    e.target.value
                  )
                }
                className={inputCls}
                autoComplete="new-password"
              />
            </Field>

            <Field label="Confirm new password">
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e =>
                  set(
                    'confirmPassword',
                    e.target.value
                  )
                }
                className={inputCls}
                autoComplete="new-password"
              />
            </Field>

          </div>

        </Card>

        <Card className="p-6">

          <h2 className="text-sm font-semibold text-ink-900 mb-1">
            Preferences
          </h2>

          <p className="text-xs text-ink-400 mb-4">
            Choose how OPSFlow should behave for you.
          </p>

          <div className="space-y-3">

            <Preference
              label="Email notifications"
              description="Receive important OPSFlow account and workflow notifications."
              checked={
                preferences.emailNotifications
              }
              onChange={v =>
                setPref(
                  'emailNotifications',
                  v
                )
              }
            />

            <Preference
              label="Deployment reminders"
              description="Keep deployment timing and assignment reminders enabled."
              checked={
                preferences.deploymentReminders
              }
              onChange={v =>
                setPref(
                  'deploymentReminders',
                  v
                )
              }
            />

          </div>

        </Card>

        <div className="flex justify-end">

          <Button
            loading={saving}
            type="submit"
            size="lg"
          >
            Save changes
          </Button>

        </div>

      </form>

    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-400 mb-0.5">
        {label}
      </p>

      <p className="text-sm font-medium text-ink-900">
        {value}
      </p>
    </div>
  );
}

function Preference({
  label,
  description,
  checked,
  onChange
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-ink-200 px-4 py-3 cursor-pointer hover:bg-ink-50">

      <span>
        <span className="block text-sm font-medium text-ink-900">
          {label}
        </span>

        <span className="block text-xs text-ink-400 mt-0.5">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={e =>
          onChange(e.target.checked)
        }
        className="h-4 w-4 accent-brand-500"
      />

    </label>
  );
}