import { useEffect, useState } from "react";
import { getUsers } from "../../services/auth";
import { useAuth } from "../../hooks/useAuth";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    getUsers().then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        ⚙️ Gestion des utilisateurs - {user?.name}
      </h1>
      {users.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li
              key={u.id}
              className="border p-3 rounded mb-2 shadow-sm flex justify-between bg-gray-50"
            >
              <span>
                {u.name} ({u.role})
              </span>
              <span className="text-gray-500">{u.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
