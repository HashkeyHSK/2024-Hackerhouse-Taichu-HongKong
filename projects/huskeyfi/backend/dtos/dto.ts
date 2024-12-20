import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

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
}

export class InvoiceResponse {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  BOLT11: string;

  @ApiProperty()
  @IsString()
  paymentHash: string;

  @ApiProperty()
  @IsString()
  paidAt: string | null;

  @ApiProperty()
  @IsNumber()
  expiresAt: number;

  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  amountReceived: string | null;
}
