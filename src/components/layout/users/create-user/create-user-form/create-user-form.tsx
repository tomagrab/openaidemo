export default function CreateUserForm() {
  return (
    <div>
      <h1>Create User</h1>
      <form>
        <label htmlFor="firstName">First Name</label>
        <input type="text" id="firstName" name="firstName" />
        <label htmlFor="lastName">Last Name</label>
        <input type="text" id="lastName" name="lastName" />
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" />
        <label htmlFor="username">Username</label>
        <input type="text" id="username" name="username" />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" />
        <button type="submit">Create User</button>
      </form>
    </div>
  );
}
