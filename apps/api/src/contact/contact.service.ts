import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';
import { ContactMessageDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

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

    void this.mail.sendContactNotification({
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
      isVenueInquiry: dto.isVenueInquiry ?? false,
    });

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
