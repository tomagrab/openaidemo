import CreateUserForm from '@/components/layout/users/create-user/create-user-form/create-user-form';

export default function CreateUserPage() {
  return (
    <div className="flex flex-1 flex-col p-4">
      <h2 className="mb-4 text-xl font-semibold">Create User</h2>
      <div className="flex flex-1">
        <CreateUserForm />
      </div>
    </div>
  );
}
