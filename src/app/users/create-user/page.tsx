import CreateUserForm from '@/components/layout/users/create-user/create-user-form/create-user-form';

export default function CreateUserPage() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-4 text-xl font-semibold">Create User</h2>
      <CreateUserForm />
    </div>
  );
}
