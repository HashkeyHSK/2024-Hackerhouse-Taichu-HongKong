import { Injectable } from '@nestjs/common';
import { LNToHashkeyTransactionService } from '../LNToHashkeyTransaction.repository';
import { Cron } from '@nestjs/schedule';
import { AppService } from 'src/app.service';
import { InvoiceResponse } from 'dtos/dto';

@Injectable()
export class InvoiceStatusUpdaterService {
  constructor(
    private readonly transactionRepository: LNToHashkeyTransactionService,
    private readonly appService: AppService,
  ) {}

  // Function to simulate getInvoice call
  async getInvoice(invoiceId: string): Promise<string> {
    // Simulate an API call to get the invoice status
    // Replace this with actual API call logic
    return 'Paid'; // Example status
  }

  // Scheduler to check and update invoice status
  @Cron('*/10 * * * * *') // Runs every 10 seconds
  async checkInvoiceStatus() {
    const transactions = await this.transactionRepository.findAll({
      LNstatus: 'N',
    });

    for (const transaction of transactions) {
      try {
        const status: InvoiceResponse = await this.appService.getInvoice(
          transaction.invoiceId,
        );

        if (status.status === 'Paid') {
          transaction.LNstatus = 'Paid';
          await this.transactionRepository.updateLNStatus(
            transaction.invoiceId,
            'Y',
          );

          // mint hBTC to hashkey address
          await this.appService.sendToHashkeyAddress(
            transaction.amount,
            transaction.hashkeyAddress,
          );
        } else {
          console.log('invoice not paid', transaction.invoiceId);
          // transaction.LNstatus = 'N';
          // await this.transactionRepository.update(transaction.invoiceId, 'N');
        }
      } catch (error) {
        console.error('Expired invoice', transaction.invoiceId);
        // update LNstatus to Expired
        await this.transactionRepository.updateLNStatus(
          transaction.invoiceId,
          'Expired',
        );
      }
    }
  }

  // LNStatus가 Y이고 hashkeyStatus가 N인 transactions을 가져와서, mint hBTC to hashkey address
  @Cron('*/10 * * * * *') // Runs every 10 seconds
  async mintToHashkey() {
    const transactions = await this.transactionRepository.findAll({
      LNstatus: 'Y',
      hashkeyStatus: 'N',
    });

    for (const transaction of transactions) {
      try {
        console.log('minting hBTC to hashkey address', transaction.invoiceId);

        // evm address 형태 체크
        if (
          !transaction.hashkeyAddress.startsWith('0x') ||
          transaction.hashkeyAddress.length !== 42
        ) {
          // update hashkeyStatus to "E"
          await this.transactionRepository.updateHashkeyStatus(
            transaction.invoiceId,
            'E',
          );
          continue;
        }

        // mint hBTC to hashkey address
        await this.appService.sendToHashkeyAddress(
          transaction.amount,
          transaction.hashkeyAddress,
        );

        // update hashkeyStatus to Y
        await this.transactionRepository.updateHashkeyStatus(
          transaction.invoiceId,
          'Y',
        );
      } catch (error) {
        console.error(
          'Error minting hBTC to hashkey address',
          transaction.invoiceId,
        );
      }
    }
  }
}
