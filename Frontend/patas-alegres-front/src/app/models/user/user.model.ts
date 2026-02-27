export class User {
  id?: number
  username: string
  password: string
  role: string


  constructor(username: string, password: string ,role: string, id?: number) {
    this.username = username;
    this.password = password;
    this.id = id;
    this.role = role;
  }
}