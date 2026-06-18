import { now } from "mongoose";

export class User {
  constructor(
    public readonly id : string,
    public readonly name : string,
    public readonly email : string,
    public readonly password : string,
    public readonly role : string = "user",
    public readonly isBlocked : boolean = false,
    public readonly createdAt : Date = new Date()
  ){}
}