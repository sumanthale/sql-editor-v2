import React, { useState } from "react";
import { Connection } from "../types/Connection";
import {
  Trash2,
  Edit3,
  Network,
  Key,
  Grip,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

interface ConnectionCardProps {
  connection: Connection;
  onDelete: (id: string) => void;
  onEdit: (connection: Connection) => void;
  onUpdatePassword: (connection: Connection) => void;
  onConnect: (connection: Connection) => void;
  onDisconnect: (connection: Connection) => void;
}

const environmentConfig = {
  dev: {
    icon: "🔧",
    badge: "bg-green-600",
    border: "border-green-600",
    bg: "bg-green-50",
    name: "DEV",
  },
  qa: {
    icon: "🧪",
    badge: "bg-blue-600",
    border: "border-blue-500",
    bg: "bg-blue-50",
    name: "QA",
  },
  staging: {
    icon: "🎭",
    badge: "bg-yellow-600",
    border: "border-yellow-600",
    bg: "bg-yellow-50",
    name: "Staging",
  },
  uat: {
    icon: "👥",
    badge: "bg-purple-600",
    border: "border-purple-600",
    bg: "bg-purple-50",
    name: "UAT",
  },
  prod: {
    icon: "🚀",
    badge: "bg-red-600",
    border: "border-red-600",
    bg: "bg-red-50",
    name: "PROD",
  },
};

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onDelete,
  onEdit,
  onUpdatePassword,
  onConnect,
  onDisconnect,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: connection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const envConfig = environmentConfig[connection.environment];
  const isConnected = connection.isConnected || false;

  const handleDeleteConfirmed = () => {
    onDelete(connection.id);
    setShowConfirmModal(false);
  };

  const handleConnectionToggle = async () => {
    console.log("Connection toggle clicked for:", connection.connectionName);

    setIsConnecting(true);
    try {
      // Simulate connection attempt
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onConnect(connection);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getConnectionStatus = () => {
    if (isConnecting) {
      return {
        icon: <Loader className="w-4 h-4 animate-spin text-autumn" />,
        text: "Connecting...",
        color: "text-autumn",
      };
    }

    if (isConnected) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-dark-green" />,
        text: "Connected",
        color: "text-dark-green",
      };
    }

    return {
      icon: <AlertCircle className="w-4 h-4 text-theme-muted" />,
      text: "Disconnected",
      color: "text-theme-muted",
    };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <>
      <div
        ref={setNodeRef}
        onClick={handleConnectionToggle}
        style={style}
        className={`
          group relative p-4 transition-synchrony rounded-lg cursor-pointer
          ${
            isDragging
              ? "opacity-60 scale-105 shadow-theme-heavy"
              : "hover:shadow-theme-medium hover:scale-[1.02]"
          }
          border-l-4 ${envConfig.border} ${envConfig.bg}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-semibold text-black truncate">
                {connection.connectionName}
              </h3>
            </div>
          </div>

          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              {...attributes}
              {...listeners}
              className="p-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-theme-tertiary border border-theme-light transition-synchrony"
              title="Drag to reorder"
            >
              <Grip className="w-3.5 h-3.5 text-theme-muted" />
            </div>
            <button
              onClick={() => onUpdatePassword(connection)}
              className="p-1.5 rounded-lg hover:bg-dark-green hover:bg-opacity-10 text-dark-green transition-synchrony"
              title="Update password"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(connection)}
              className="p-1.5 rounded-lg hover:bg-teal hover:bg-opacity-10 text-teal transition-synchrony"
              title="Edit connection"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="p-1.5 rounded-lg hover:bg-brick hover:bg-opacity-10 text-brick transition-synchrony"
              title="Delete connection"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Connection Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-800">
            <Network className="w-4 h-4 text-theme-muted" />
            <span className="truncate">
              {connection.username}@{connection.databaseName}
            </span>
          </div>
          {isConnecting && (
            <div className="flex items-center gap-2 text-autumn">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Connecting...</span>
            </div>
          )}
          {/* {connection.databaseName && (
            <div className="flex items-center gap-2 text-gray-800">
              <Database className="w-4 h-4 text-theme-muted" />
              <span className="truncate">{connection.databaseName}</span>
            </div>
          )} */}
        </div>

        {/* Connection Toggle Button */}
        {/* <button
          disabled={isConnecting}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-synchrony flex items-center justify-center gap-2 ${
            isConnected
              ? "bg-brick text-white hover:bg-opacity-90"
              : "bg-dark-green text-white hover:bg-opacity-90"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isConnecting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : isConnected ? (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Disconnect</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              <span>Connect</span>
            </>
          )}
        </button> */}

        {/* Environment Badge */}
        <span
          className={`inline-flex items-center px-2 py-[1px] rounded-md text-[10px] font-bold z-50
            tracking-wider text-theme-primary bg-theme-tertiary uppercase absolute right-2 bottom-2 border ${envConfig.border} ${envConfig.bg}`}
        >
          {envConfig.name}
        </span>
      </div>

      {showConfirmModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop px-4">
            <div className="card-synchrony max-w-sm w-full p-4 relative animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-opacity-10 p-2 rounded-full">
                  <Trash2 className="w-5 h-5 text-brick" />
                </div>
                <h2 className="text-lg font-semibold text-theme-primary">
                  Confirm Deletion
                </h2>
              </div>
              <p className="text-sm text-theme-secondary border-t pt-4">
                Are you sure you want to delete{" "}
                <strong className="text-theme-primary">
                  {connection.connectionName}
                </strong>
                ?
              </p>

              <p className="text-sm text-theme-secondary mt-1">
                {" "}
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-synchrony-secondary px-4 py-1.5 rounded-lg text-sm transition-synchrony"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-1.5 rounded-lg bg-brick hover:bg-opacity-90 text-white text-sm font-medium transition-synchrony"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
