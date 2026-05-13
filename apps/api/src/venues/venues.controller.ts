import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsArray, IsString } from 'class-validator';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenueFiltersDto } from './dto/venue-filters.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from '@/common/decorators/current-user.decorator';

class AddImagesDto {
  @IsArray()
  @IsString({ each: true })
  urls!: string[];
}

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venues: VenuesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public venues with filters' })
  list(@Query() filters: VenueFiltersDto) {
    return this.venues.list(filters);
  }

  @Public()
  @Get('featured')
  featured() {
    return this.venues.featured();
  }

  @Get('owner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Venues owned by the authenticated user' })
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.venues.listForOwner(user.id);
  }

  @Public()
  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.venues.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SPACE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVenueDto) {
    return this.venues.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateVenueDto
  ) {
    return this.venues.update(id, user, dto);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addImages(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddImagesDto
  ) {
    return this.venues.addImages(id, user, dto.urls);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.venues.remove(id, user);
  }
}
