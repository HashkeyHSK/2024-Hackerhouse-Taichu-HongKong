import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

// DTO for sending funds to a Hashkey address
export class SendToHashkeyInput {
  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  hashkeyAddress: string;
}

// Response DTO for sending funds to Hashkey
export class SendToHashkeyResponse {
  @ApiProperty()
  @IsString()
  invoiceId: string;

  @ApiProperty()
  @IsString()
  BOLT11: string;

  @ApiProperty()
  @IsString()
  hashkeyAddress: string;

  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  LNstatus: string;

  @ApiProperty()
  @IsString()
  hashkeyStatus: string;
}

// DTO for sending funds from Hashkey to Lightning Network
export class HashkeyToLNInput {
  @ApiProperty()
  @IsString()
  lnAddress: string;

  @ApiProperty()
  @IsString()
  hashkeyAddress: string;

  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  hashkeyTxId: string;
}

// Response DTO for Hashkey to Lightning Network transfer
export class HashkeyToLNResponse {
  @ApiProperty()
  @IsString()
  id: string;
}

// DTO for handling received Lightning Network payments
export class LNReceivedPaymentInput {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  BOLT11: string;

  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsNumber()
  maxFeePercent?: string;

  @ApiProperty()
  @IsString()
  maxFeeFlat?: string;

  @ApiProperty()
  @IsNumber()
  sendTimeout?: number;
}

// DTO for Lightning Network invoice creation
export class Invoice {
  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  descriptionHashOnly: boolean;

  @ApiProperty()
  @IsString()
  hashkeyAddress: string;
}

// Response DTO for Lightning Network invoice
export class InvoiceResponse {
  @ApiProperty()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  BOLT11?: string;

  @ApiProperty()
  @IsString()
  paymentHash?: string;

  @ApiProperty()
  @IsString()
  paidAt?: string | null;

  @ApiProperty()
  @IsNumber()
  expiresAt?: number;

  @ApiProperty()
  @IsString()
  amount?: string;

  @ApiProperty()
  @IsString()
  amountReceived?: string | null;
}
