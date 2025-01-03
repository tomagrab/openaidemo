import UsersTable from '@/components/layout/users/users-table/users-table';
import { getUsers } from '@/lib/db/tables/users/users';

export default async function UsersPage() {
  const users = await getUsers();

  if (!users) {
    return <div>No users found</div>;
  }

  return (
    <div>
      <h2>Users</h2>
      <UsersTable users={users} />
    </div>
  );
}
