import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

/** Wallet domain (shared trip fund). Registered in AppModule. */
@Module({
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
