import { ApiProperty } from "@nestjs/swagger";

export class LocationUpload {
    @ApiProperty({type: 'string', format: 'binary'})
    file: any;
}