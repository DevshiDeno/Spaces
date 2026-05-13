import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ContactMessageDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly prisma: PrismaService) {

    
  }

  async submit(dto: ContactMessageDto) {
    const message = await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
        isVenueInquiry: dto.isVenueInquiry ?? false,
      },
    });
    // TODO: send notification email (SMTP / Resend / SendGrid)
    this.logger.log(`Contact message from ${dto.email}: ${dto.subject}`);
    return { ok: true as const, reference: message.id };
  }

  list() {
    return this.prisma.contactMessage.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 200,
    });
  }
}
