import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'simon@mzizi.co.ke' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'demo1234', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}
