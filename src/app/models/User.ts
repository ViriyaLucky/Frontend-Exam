export class lastPosition {
    
}

export class User {
    email: string;
    fname: string;
    lname: string;
    profileImageUrl?: string;
    lastPosition:any ={
        position:{
            lat: 0,
            lng:0
        }
    }
    

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
}