
export interface IUserPayload {
   id : string,
   email : string,
   role : string
}

export interface ITokenService {
    generateToken(payload : IUserPayload) : string;
    verifyToken(token : string) : IUserPayload
}