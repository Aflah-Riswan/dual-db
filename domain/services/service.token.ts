
export interface IUserPayload {
   id : number,
   email : string,
   role : string
}

export interface ITokenService {
    generateToken(payload : IUserPayload) : string;
    verifyToken(token : string) : IUserPayload
}