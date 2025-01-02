import { getUsers } from '@/lib/db/tables/users/users';

export default async function UsersPage() {
  const users = await getUsers();

  if (!users) {
    return <div>No users found</div>;
  }

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.fullName} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
