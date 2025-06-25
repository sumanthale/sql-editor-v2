import React from "react";
import { Connection, DatabaseType } from "../types/Connection";
import { ConnectionCard } from "./ConnectionCard";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Database, Sparkles } from "lucide-react";

export interface ConnectionListProps {
  connections: Connection[];
  type: DatabaseType;
  onDelete: (id: string) => void;
  onEdit: (connection: Connection) => void;
  onReorder: (type: DatabaseType, newOrder: Connection[]) => void;
  onUpdatePassword: (connection: Connection) => void;
  onConnect: (connection: Connection) => void;
  onDisconnect: (connection: Connection) => void;
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
  connections,
  type,
  onDelete,
  onEdit,
  onUpdatePassword,
  onReorder,
  onConnect,
  onDisconnect,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = connections.findIndex((item) => item.id === active.id);
      const newIndex = connections.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(connections, oldIndex, newIndex);
      onReorder(type, newOrder);
    }
  };

  if (connections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-20" />
          </div>
          <div className="relative">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <Sparkles className="w-6 h-6 text-gray-200 absolute -top-2 -right-2" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No {type} connections yet
        </h3>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
          Create your first {type} connection to start managing your databases.
          Test each connection to ensure it's working properly.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={connections} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onDelete={onDelete}
              onEdit={onEdit}
              onUpdatePassword={onUpdatePassword}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};