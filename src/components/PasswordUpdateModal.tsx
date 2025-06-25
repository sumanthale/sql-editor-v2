import React, { useState, useEffect } from "react";
import { Connection, DatabaseType } from "../types/Connection";
import {
  X,
  Eye,
  EyeOff,
  Database,
  Key,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface PasswordUpdateModalProps {
  isOpen: boolean;
  connection: Connection | null;
  onClose: () => void;
  onUpdate: (connectionId: string, newPassword: string) => void;
}

const databaseTypeConfig = {
  PostgreSQL: { icon: '🐘', color: 'text-teal' },
  MySQL: { icon: '🐬', color: 'text-autumn' },
  Oracle: { icon: '🔶', color: 'text-brick' },
};

const environmentConfig = {
  dev: { icon: '🔧', name: 'Development' },
  qa: { icon: '🧪', name: 'QA' },
  staging: { icon: '🎭', name: 'Staging' },
  uat: { icon: '👥', name: 'UAT' },
  prod: { icon: '🚀', name: 'Production' },
};

export const PasswordUpdateModal: React.FC<PasswordUpdateModalProps> = ({
  isOpen,
  connection,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<"success" | "error" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (connection) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setUpdateResult(null);
    }
  }, [connection]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword) newErrors.newPassword = "New password is required";
    else if (formData.newPassword.length < 6) newErrors.newPassword = "Minimum 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (formData.currentPassword === formData.newPassword) newErrors.newPassword = "New password must differ from current";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !connection) return;
    setIsUpdating(true);
    setUpdateResult(null);
    setTimeout(() => {
      const success = formData.currentPassword && formData.newPassword === formData.confirmPassword;
      setUpdateResult(success ? "success" : "error");
      if (success) {
        onUpdate(connection.id, formData.newPassword);
        setTimeout(() => handleClose(), 2000);
      }
      setIsUpdating(false);
    }, 2000);
  };

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({ current: false, new: false, confirm: false });
    setUpdateResult(null);
    setErrors({});
    onClose();
  };

  const toggleVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isOpen || !connection) return null;

  const dbConfig = databaseTypeConfig[connection.type];
  const envConfig = environmentConfig[connection.environment];

  const renderPasswordInput = (
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    error: string | undefined, 
    field: "current" | "new" | "confirm"
  ) => (
    <div>
      <label className="text-xs font-medium text-theme-primary mb-1 block">{label}</label>
      <div className="relative">
        <input
          type={showPasswords[field] ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          className={`input-synchrony w-full px-3 py-2 pr-10 text-sm ${error ? "border-brick" : ""}`}
        />
        <button
          type="button"
          onClick={() => toggleVisibility(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary transition-synchrony"
        >
          {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-brick mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="card-synchrony w-full max-w-sm overflow-hidden border-0 shadow-theme-heavy">
        {/* Compact Header */}
        <div className="gradient-synchrony px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-charcoal" />
            <h2 className="text-lg font-bold text-charcoal">Update Password</h2>
          </div>
          <button 
            onClick={handleClose} 
            className="text-charcoal hover:text-opacity-80 p-1 rounded transition-synchrony"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Connection Info */}
          <div className="bg-theme-secondary rounded-lg p-3 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{dbConfig.icon}</span>
              <span className="font-semibold text-theme-primary">{connection.connectionName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-theme-secondary">
              <div><span className="font-medium">Type:</span> {connection.type}</div>
              <div><span className="font-medium">Env:</span> {envConfig.icon} {envConfig.name}</div>
              <div><span className="font-medium">Host:</span> {connection.host}</div>
              <div><span className="font-medium">Port:</span> {connection.port}</div>
              <div className="col-span-2"><span className="font-medium">User:</span> {connection.username}</div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="space-y-3">
            {renderPasswordInput(
              "Current Password", 
              formData.currentPassword, 
              (val) => setFormData((p) => ({ ...p, currentPassword: val })), 
              errors.currentPassword, 
              "current"
            )}
            {renderPasswordInput(
              "New Password", 
              formData.newPassword, 
              (val) => setFormData((p) => ({ ...p, newPassword: val })), 
              errors.newPassword, 
              "new"
            )}
            {renderPasswordInput(
              "Confirm Password", 
              formData.confirmPassword, 
              (val) => setFormData((p) => ({ ...p, confirmPassword: val })), 
              errors.confirmPassword, 
              "confirm"
            )}
          </div>

          {/* Update Result */}
          {updateResult && (
            <div className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2 ${
              updateResult === "success" 
                ? "bg-dark-green bg-opacity-10 text-dark-green" 
                : "bg-brick bg-opacity-10 text-brick"
            }`}>
              {updateResult === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-medium">
                {updateResult === "success" ? "Password updated successfully." : "Password update failed."}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-synchrony-secondary flex-1 py-2 px-3 rounded-lg transition-synchrony font-medium text-sm"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || updateResult === "success"}
              className="btn-synchrony-primary flex-1 py-2 px-3 rounded-lg transition-synchrony font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="spinner-synchrony w-3 h-3" />
              ) : (
                <Key className="w-3 h-3" />
              )}
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};