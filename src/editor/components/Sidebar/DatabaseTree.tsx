import { DatabaseTreeSidebar } from "../../../components/DatabaseTree/DatabaseTreeSidebar";

// interface DatabaseTreeProps {
//   connections: DatabaseConnection[];
//   schemas: Schema[];
//   activeConnection: DatabaseConnection | null;
//   onConnectionSelect: (connection: DatabaseConnection) => void;
// }

export function DatabaseTree() {
//   {
//   connections,
//   schemas,
//   activeConnection,
//   onConnectionSelect
// }: DatabaseTreeProps
  return <DatabaseTreeSidebar />;
}
