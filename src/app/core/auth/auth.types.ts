export interface JwtPayload {
  nameid: string;
  email: string;
  fullName: string;
  exp: number;
}