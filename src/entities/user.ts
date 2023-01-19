import { Exclude } from 'class-transformer';

export type Admin = ActiveUser;

export class User {
  id: string;
  name: string;
  imageUrl: string;
}

export class ActiveUser extends User {
  @Exclude()
  connectionId: string;
}
