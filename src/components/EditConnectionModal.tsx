import React, { useState, useEffect } from "react";
import { Connection, DatabaseType, EnvironmentType } from "../types/Connection";
import {
  X,
  Eye,
  EyeOff,
  Database,
  Save,
  ChevronDown,
  Shield,
  Check,
  AlertCircle,
  Loader,
} from "lucide-react";

interface EditConnectionModalProps {
  isOpen: boolean;
  connection: Connection | null;
  onClose: () => void;
  onSave: (connection: Connection) => void;
}

const defaultPorts = {
  PostgreSQL: 5432,
  MySQL: 3306,
  Oracle: 1521,
};

const databaseTypes: { value: DatabaseType; label: string; icon: string }[] = [
  { value: "PostgreSQL", label: "PostgreSQL", icon: "🐘" },
  { value: "MySQL", label: "MySQL", icon: "🐬" },
  { value: "Oracle", label: "Oracle", icon: "🔶" },
];

const environmentOptions: {
  value: EnvironmentType;
  label: string;
  icon: string;
}[] = [
  { value: "dev", label: "Development", icon: "🔧" },
  { value: "qa", label: "QA", icon: "🧪" },
  { value: "staging", label: "Staging", icon: "🎭" },
  { value: "uat", label: "UAT", icon: "👥" },
  { value: "prod", label: "Production", icon: "🚀" },
];

export const EditConnectionModal: React.FC<EditConnectionModalProps> = ({
  isOpen,
  connection,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    type: "PostgreSQL" as DatabaseType,
    connectionName: "",
    databaseName: "",
    host: "localhost",
    port: defaultPorts.PostgreSQL,
    username: "",
    password: "",
    environment: "dev" as EnvironmentType,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null
  );
  const [testError, setTestError] = useState<string>("");
  const [connectionTested, setConnectionTested] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (connection) {
      setFormData({
        type: connection.type,
        connectionName: connection.connectionName,
        databaseName: connection.databaseName,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        environment: connection.environment,
      });
      setConnectionTested(true); // Assume existing connection was tested
      setTestResult("success");
      setHasChanges(false);
    }
  }, [connection]);

  const handleTypeChange = (type: DatabaseType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      port: defaultPorts[type],
    }));
    setHasChanges(true);
    setConnectionTested(false);
    setTestResult(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // if the field is environment don't set the canges

    if (field !== "environment") {
      setHasChanges(true);
    }

    if (connectionTested) {
      setConnectionTested(false);
      setTestResult(null);
    }
  };

  const validateForm = () => {
    return (
      formData.connectionName.trim() &&
      formData.host.trim() &&
      formData.username.trim() &&
      formData.port > 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission if connection was tested successfully after changes
    if (hasChanges && (!connectionTested || testResult !== "success")) {
      alert("Please test the connection successfully before saving changes.");
      return;
    }

    if (connection) {
      onSave({
        ...connection,
        ...formData,
        lastUsed: new Date().toISOString(),
        isConnected: testResult === "success",
      });
    }
    onClose();
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      alert(
        "Please fill in all required fields before testing the connection."
      );
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);
    setTestError("");

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 2000 + Math.random() * 1000)
      );

      const isValidConnection = await simulateConnectionTest(formData);

      if (isValidConnection.success) {
        setTestResult("success");
        setConnectionTested(true);
      } else {
        setTestResult("error");
        setTestError(isValidConnection.error || "Connection failed");
        setConnectionTested(false);
      }
    } catch (error) {
      setTestResult("error");
      setTestError("Unexpected error occurred during connection test");
      setConnectionTested(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const simulateConnectionTest = async (
    data: typeof formData
  ): Promise<{ success: boolean; error?: string }> => {
    if (data.host === "invalid-host") {
      return {
        success: false,
        error: "Host not found. Please check the hostname.",
      };
    }

    if (data.username === "invalid-user") {
      return {
        success: false,
        error: "Authentication failed. Invalid username or password.",
      };
    }

    if (data.port < 1 || data.port > 65535) {
      return {
        success: false,
        error: "Invalid port number. Must be between 1 and 65535.",
      };
    }

    if (data.databaseName === "nonexistent") {
      return {
        success: false,
        error: "Database does not exist or access denied.",
      };
    }

    if (data.host.includes("timeout")) {
      return {
        success: false,
        error: "Connection timeout. Please check network connectivity.",
      };
    }

    return { success: true };
  };

  if (!isOpen || !connection) return null;

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="card-synchrony w-full max-w-md overflow-hidden border-0 shadow-theme-heavy">
        {/* Header */}
        <div className="gradient-synchrony px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-charcoal" />
            <h2 className="text-lg font-bold text-charcoal">Edit Connection</h2>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal hover:text-opacity-80 p-1 rounded transition-synchrony"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Database Type & Environment Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-theme-primary mb-1 block">
                Database Type
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) =>
                    handleTypeChange(e.target.value as DatabaseType)
                  }
                  className="input-synchrony w-full px-3 py-2 pr-8 text-sm appearance-none cursor-pointer"
                >
                  {databaseTypes.map((db) => (
                    <option key={db.value} value={db.value}>
                      {db.icon} {db.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-theme-primary mb-1 block">
                Environment
              </label>
              <div className="relative">
                <select
                  value={formData.environment}
                  onChange={(e) =>
                    handleInputChange(
                      "environment",
                      e.target.value as EnvironmentType
                    )
                  }
                  className="input-synchrony w-full px-3 py-2 pr-8 text-sm appearance-none cursor-pointer"
                >
                  {environmentOptions.map((env) => (
                    <option key={env.value} value={env.value}>
                      {env.icon} {env.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Connection Name */}
          <div>
            <label className="text-xs font-medium text-theme-primary mb-1 block">
              Connection Name *
            </label>
            <input
              type="text"
              value={formData.connectionName}
              required
              onChange={(e) =>
                handleInputChange("connectionName", e.target.value)
              }
              className="input-synchrony w-full px-3 py-2 text-sm"
              placeholder="My Database Connection"
            />
          </div>

          {/* Host & Port Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-theme-primary mb-1 block">
                Host *
              </label>
              <input
                type="text"
                value={formData.host}
                required
                onChange={(e) => handleInputChange("host", e.target.value)}
                className="input-synchrony w-full px-3 py-2 text-sm"
                placeholder="localhost"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-theme-primary mb-1 block">
                Port *
              </label>
              <input
                type="number"
                value={formData.port}
                required
                onChange={(e) =>
                  handleInputChange("port", parseInt(e.target.value) || 0)
                }
                className="input-synchrony w-full px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Username & Database Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-theme-primary mb-1 block">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                required
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="input-synchrony w-full px-3 py-2 text-sm"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-theme-primary mb-1 block">
                Database
              </label>
              <input
                type="text"
                value={formData.databaseName}
                onChange={(e) =>
                  handleInputChange("databaseName", e.target.value)
                }
                className="input-synchrony w-full px-3 py-2 text-sm"
                placeholder="database_name"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-theme-primary mb-1 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="input-synchrony w-full px-3 py-2 pr-10 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary transition-synchrony"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                testResult === "success"
                  ? " bg-opacity-10 text-dark-green border border-dark-green border-opacity-30"
                  : "bg-opacity-10 text-brick border border-brick border-opacity-30"
              }`}
            >
              {testResult === "success" ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <div>
                <div className="font-medium">
                  {testResult === "success"
                    ? "Connection successful!"
                    : "Connection failed"}
                </div>
                {testError && (
                  <div className="text-xs mt-1 opacity-90">{testError}</div>
                )}
              </div>
            </div>
          )}

          {/* Changes Notice */}
          {hasChanges && !connectionTested && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-sm  bg-opacity-10 text-autumn border border-autumn border-opacity-30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Changes detected. Please test the connection before saving.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingConnection || !validateForm()}
              className="flex-1 bg-dark-green text-white py-2 px-3 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-synchrony font-medium text-sm flex items-center justify-center gap-2"
            >
              {isTestingConnection ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3" />
                  <span>Test</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-synchrony-secondary px-4 py-2 rounded-lg transition-synchrony font-medium text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                hasChanges && (!connectionTested || testResult !== "success")
              }
              className="btn-synchrony-primary flex-1 py-2 px-3 rounded-lg transition-synchrony font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
