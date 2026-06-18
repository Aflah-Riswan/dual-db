import bcrypt from 'bcrypt';
import type { IEncryptionService } from '../../domain/services/IEncryptionService.js';


export class BcryptEncryptionService implements IEncryptionService {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 10);
  }
  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}