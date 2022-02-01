import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { DatabaseLookupService } from '../database-lookup.service';
import { TULLY_GROUP_LOOKUP } from '../resource options/resource-constants';

@Controller('tully-galaxy')
export class TullyGalaxyController {
  constructor(@Inject(TULLY_GROUP_LOOKUP) private readonly lookup: any) {}

  @Get()
  findAll() {
    return this.lookup.returnAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lookup.findOne(+id);
  }

}
