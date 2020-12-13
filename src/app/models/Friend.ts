import { User } from './User';

export class Friend {
    id?:string;
    friend_id: string;
    user?:User;
    imageUrl?:string;
    
    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
}