import { Injectable, Logger } from '@nestjs/common';
import { LNToHashkeyTransactionService } from '../LNToHashkeyTransaction.service';
import { Cron } from '@nestjs/schedule';
import { AppService } from 'src/app.service';
import { InvoiceResponse, LNReceivedPaymentInput } from 'dtos/dto';

/**
 * Service responsible for updating invoice statuses and handling cross-chain transactions
 * between Lightning Network and Hashkey Chain
 */
@Injectable()
export class InvoiceStatusUpdaterService {
  private readonly logger = new Logger(InvoiceStatusUpdaterService.name);

  constructor(
    private readonly transactionRepository: LNToHashkeyTransactionService,
    private readonly appService: AppService,
  ) {}

  /**
   * Mock function to simulate invoice status check
   * @param invoiceId - The ID of the invoice to check
   * @returns Simulated invoice status
   * @deprecated Use appService.getInvoice instead
   */
  async getInvoice(invoiceId: string): Promise<string> {
    // Simulate an API call to get the invoice status
    // Replace this with actual API call logic
    return 'Paid'; // Example status
  }

  /**
   * Scheduled task that checks for unpaid invoices (LNstatus: 'N') and updates their status
   * If an invoice is paid:
   * 1. Updates LNstatus to 'Y'
   * 2. Mints hBTC to the corresponding Hashkey address
   * 3. Records the transaction hash
   * If an invoice is expired:
   * 1. Updates LNstatus to 'Expired'
   */
  @Cron('*/5 * * * * *') // Runs every 5 seconds
  async checkInvoiceStatus() {
    // Get all transactions with unpaid Lightning Network status
    const transactions = await this.transactionRepository.findAll({
      LNstatus: 'N',
      fromNetwork: 'L',
      toNetwork: 'H',
    });

    for (const transaction of transactions) {
      try {
        // Check current invoice status from BTCPay Server
        const status: InvoiceResponse = await this.appService.getInvoice(
          transaction.invoiceId,
        );

        if (status.status === 'Paid') {
          transaction.LNstatus = 'Paid';
          // Update LN payment status to completed ('Y')
          await this.transactionRepository.updateLNStatus(transaction.id, 'Y');

          // Mint equivalent hBTC to user's Hashkey address
          const tx = await this.appService.sendToHashkeyAddress(
            transaction.amount,
            transaction.hashkeyAddress,
          );

          this.logger.log('tx', tx);

          // Record Hashkey transaction hash
          await this.transactionRepository.updateHashkeyTx(transaction.id, tx);
        } else {
          this.logger.log('invoice not paid', transaction.invoiceId);
        }
      } catch (error) {
        this.logger.error('Expired invoice', transaction.invoiceId);
        // Mark invoice as expired in database
        await this.transactionRepository.updateLNStatus(
          transaction.invoiceId,
          'Expired',
        );
      }
    }
  }

  /**
   * Scheduled task that processes pending Hashkey transactions
   * Looks for transactions where:
   * - Lightning Network payment is completed (LNstatus: 'Y')
   * - Hashkey transaction is pending (hashkeyStatus: 'N')
   *
   * Process flow:
   * 1. Validates Hashkey address format
   * 2. Updates status to 'Processing'
   * 3. Mints hBTC tokens
   * 4. Updates status to 'Completed' on success
   *
   * Error handling:
   * - Invalid address format: Updates status to 'Error' ('E')
   * - Minting failure: Logs error but keeps status as 'Processing' for retry
   */
  @Cron('*/10 * * * * *') // Runs every 5 seconds
  async mintToHashkey() {
    // Get all transactions ready for Hashkey processing
    const transactions = await this.transactionRepository.findAll({
      LNstatus: 'Y',
      hashkeyStatus: 'N',
      fromNetwork: 'L',
      toNetwork: 'H',
    });

    // Update all found transactions to Processing status
    for (const transaction of transactions) {
      await this.transactionRepository.updateHashkeyStatus(transaction.id, 'P');
    }

    for (const transaction of transactions) {
      try {
        this.logger.log('minting hBTC to hashkey address', transaction.id);

        // Validate Hashkey address format (must be valid EVM address)
        if (
          !transaction.hashkeyAddress.startsWith('0x') ||
          transaction.hashkeyAddress.length !== 42
        ) {
          // Mark as error if address format is invalid
          await this.transactionRepository.updateHashkeyStatus(
            transaction.id,
            'E',
          );
          continue;
        }

        // Execute hBTC minting
        await this.appService.sendToHashkeyAddress(
          transaction.amount,
          transaction.hashkeyAddress,
        );

        // Mark as completed
        await this.transactionRepository.updateHashkeyStatus(
          transaction.id,
          'Y',
        );
      } catch (error) {
        this.logger.error(
          'Error minting hBTC to hashkey address',
          transaction.id,
        );

        await this.transactionRepository.updateHashkeyStatus(
          transaction.id,
          'N',
        );
      }
    }
  }

  // 해시키체인에서 브릿지 받은 트랜잭션을 처리하는 함수
  // 1. fromNetwork가 H이고 toNetwork가 L, hashkeyStatus가 Y, LNstatus가 N인 트랜잭션을 조회한다.
  @Cron('*/5 * * * * *') // Runs every 5 seconds
  async handleHashkeyBridgeTransaction() {
    const transactions = await this.transactionRepository.findAll({
      fromNetwork: 'H',
      toNetwork: 'L',
      hashkeyStatus: 'Y',
      LNstatus: 'N',
    });

    for (const transaction of transactions) {
      this.logger.log('handleHashkeyBridgeTransaction', transaction.id);

      try {
        const body: LNReceivedPaymentInput = {
          id: transaction.id,
          BOLT11: transaction.BOLT11,
          amount: transaction.amount,
        };

        // amount 가 "0.00000001" 형태로 나오는데, mSAT 형태로 변경해준다.
        // 소수점은 없어야 한다.
        body.amount = (Number(transaction.amount) * 100000000000).toString();

        // 소수점 없애기
        body.amount = body.amount.replace('.', '');

        this.logger.log('body', body);
        await this.appService.LNReceivedPayment(body);
      } catch (error) {
        this.logger.error('Error processing hashkey bridge transaction', error);
        // await this.transactionRepository.updateLNStatus(transaction.id, 'E');
      }
    }
  }
}
