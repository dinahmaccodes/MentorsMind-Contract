import { Pool } from 'pg';
import { StellarAccountService } from '../src/services/stellarAccount.service';

describe('StellarAccountService', () => {
  let pool: jest.Mocked<Pool>;
  let service: StellarAccountService;

  beforeEach(() => {
    // Basic mock of the pg Pool
    pool = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    } as any;
    service = new StellarAccountService(pool);
  });

  describe('fundAccount', () => {
    it('should insert a transaction record with the correct user_id', async () => {
      const destination = 'GBABC123';
      const userId = 'user-123';

      await service.fundAccount(destination, userId);

      // Verify that the query was called with the correct parameters, including userId
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO transactions'),
        expect.arrayContaining([userId, '10.0', destination, 'completed'])
      );
    });
  });

  describe('createAndFundWallet', () => {
    it('should propagate the user_id when creating and funding a wallet', async () => {
      const userId = 'user-456';
      const fundAccountSpy = jest.spyOn(service, 'fundAccount');

      const destination = await service.createAndFundWallet(userId);

      expect(destination).toBeDefined();
      expect(fundAccountSpy).toHaveBeenCalledWith(destination, userId);
    });
  });

  describe('activateExistingWallet', () => {
    it('should propagate the user_id when activating an existing wallet', async () => {
      const destination = 'GBXYZ789';
      const userId = 'user-789';
      const fundAccountSpy = jest.spyOn(service, 'fundAccount');

      await service.activateExistingWallet(destination, userId);

      expect(fundAccountSpy).toHaveBeenCalledWith(destination, userId);
    });
  });
});
