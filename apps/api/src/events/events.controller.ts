import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from '@/common/decorators/current-user.decorator';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Public()
  @Get()
  list() {
    return this.events.list();
  }

  @Public()
  @Get('featured')
  featured() {
    return this.events.featured();
  }

  @Get('owner')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SPACE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Events created by the authenticated user' })
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.events.listForOwner(user.id);
  }

  @Public()
  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.events.findBySlug(slug);
  }

  @Get('rsvps/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch a single RSVP (status polling)' })
  rsvpById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.events.findRsvpForUser(id, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SPACE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEventDto) {
    return this.events.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SPACE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateEventDto
  ) {
    return this.events.update(id, user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SPACE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.events.remove(id, user);
  }

  @Post(':id/rsvp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  rsvp(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RsvpDto
  ) {
    return this.events.rsvp(id, user.id, dto);
  }
}
