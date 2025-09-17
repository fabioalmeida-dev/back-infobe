import {Body, Controller, Get, Param, Post, UseGuards,} from '@nestjs/common';
import {CertificateService} from './certificate.service';
import {IssueCertificateDto} from './dto/issue-certificate.dto';
import {User} from '../decorators/user.decorator';
import {AdminGuard} from '../auth/guard/admin.guard';

@Controller('certificate')
export class CertificateController {
  constructor(private readonly service: CertificateService) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get('my-certificates')
  findMyCertificates(@User('id') userId: string) {
    return this.service.findMyCertificates(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneWithDetails(id);
  }

  @Post('issue')
  issueCertificate(
    @User('id') userId: string,
    @Body() dto: IssueCertificateDto,
  ) {
    return this.service.issueCertificate(userId, dto);
  }
}